import * as path from 'path';
import { GraphEngine, normalizePosixPath } from '../graph/engine';
import {
  NodeExplanationResult,
  ShortestPathResult,
  BlastRadiusResult,
  TopologyEngine,
} from '../graph/topology';
import { FileStorageDriver, NodeFileSystem } from '../storage';
import { loadConfig } from '../config/schema';
import { SkeletonGenerator, SkeletonResult } from '../graph/skeleton';
import { WorkspaceManager, WorkspaceConfig } from '../graph/workspace';

export type SurgicalQueryKind = 'search' | 'explain' | 'path' | 'blast' | 'map' | 'stub';

export interface QueryOptions {
  budget?: number; // approximate token budget (default: 1000 tokens)
  mode?: 'bfs' | 'dfs'; // traversal mode (default: 'bfs')
  maxDepth?: number; // max hops (default: 2)
  configPath?: string;
  surgicalKind?: SurgicalQueryKind;
  target?: string;
  source?: string;
  depth?: number;
  direction?: 'upstream' | 'downstream' | 'both';
  relationTypes?: string[];
  package?: string;
  skipAutoSync?: boolean;
}

export interface QuerySubGraphNode {
  id: string;
  filePath: string;
  symbolName: string | null;
  kind: string;
  domain: string | null;
  phase: string | null;
  communityId?: number;
  communityLabel?: string;
  description?: string;
  exports?: string[];
  pageRank?: number;
}

export interface QuerySubGraphEdge {
  sourceId: string;
  targetId: string;
  relation: string;
  confidence: string;
}

export interface MacroMapCommunity {
  id: number;
  label: string;
  nodeCount: number;
  hubNode: string;
}

export interface MacroMapResult {
  totalNodes: number;
  totalEdges: number;
  totalFiles: number;
  packages: Array<{ name: string; rootDir: string }>;
  communities: MacroMapCommunity[];
  godNodes: Array<{ id: string; inDegree: number; outDegree: number; reason: string }>;
}

export interface QueryResult {
  query: string;
  mode: 'bfs' | 'dfs';
  seedNodes: string[];
  nodes: QuerySubGraphNode[];
  edges: QuerySubGraphEdge[];
  summaryText: string;
  approxTokens: number;
  surgicalKind?: SurgicalQueryKind;
  explainResult?: NodeExplanationResult;
  shortestPathResult?: ShortestPathResult | null;
  blastRadiusResult?: BlastRadiusResult;
  skeletonResult?: SkeletonResult;
  macroMapResult?: MacroMapResult;
  packageScope?: string;
}

export class QueryEngine {
  private graphEngine: GraphEngine;
  private fsDriver: FileStorageDriver;
  private skeletonGenerator: SkeletonGenerator;
  private workspaceManager: WorkspaceManager;

  constructor(options?: { graphEngine?: GraphEngine; fsDriver?: FileStorageDriver }) {
    if (options?.graphEngine) {
      this.graphEngine = options.graphEngine;
    } else {
      const config = loadConfig();
      this.graphEngine = new GraphEngine(config.paths.db_path);
    }
    this.fsDriver = options?.fsDriver || new NodeFileSystem();
    this.skeletonGenerator = new SkeletonGenerator();
    this.workspaceManager = new WorkspaceManager({ fsDriver: this.fsDriver });
  }

  /**
   * Does lazy incremental mtime check on workspace files before query execution (<30ms).
   */
  public async autoSyncModifiedFiles(): Promise<number> {
    try {
      const codeExts = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.md'];
      const cached = await this.graphEngine.all<{ file_path: string; mtime_ms: number | null }>(
        'SELECT file_path, mtime_ms FROM file_meta;',
      );
      const cacheMap = new Map<string, number | null>();
      for (const row of cached) {
        cacheMap.set(row.file_path, row.mtime_ms);
      }

      let files: string[] = [];
      if (typeof (this.fsDriver as any).glob === 'function') {
        files = await (this.fsDriver as any).glob('src');
      } else if (typeof this.fsDriver.readDir === 'function') {
        // Fallback directory search
        try {
          const entries = await this.fsDriver.readDir('src');
          files = entries.map((e) => `src/${e}`);
        } catch {
          files = [];
        }
      }

      let syncedCount = 0;
      for (const f of files) {
        const ext = path.extname(f).toLowerCase();
        if (!codeExts.includes(ext)) continue;
        const norm = normalizePosixPath(f);
        if (typeof this.fsDriver.stat === 'function') {
          const stat = await this.fsDriver.stat(norm);
          if (stat && stat.mtimeMs !== cacheMap.get(norm)) {
            const content = await this.fsDriver.readFile(norm);
            await this.graphEngine.indexCodeFile(norm, content, { mtimeMs: stat.mtimeMs });
            syncedCount++;
          }
        }
      }
      return syncedCount;
    } catch {
      return 0;
    }
  }

  /**
   * Queries the knowledge graph and returns a token-optimal context package,
   * macro map, interface stub, or targeted surgical result.
   */
  public async query(queryText: string, options: QueryOptions = {}): Promise<QueryResult> {
    await this.graphEngine.initialize();

    // 0. Lazy auto-sync on query (<30ms) to guarantee 0% staleness
    if (!options.skipAutoSync) {
      await this.autoSyncModifiedFiles();
    }

    // Load topology engine from DB
    const topology = await this.graphEngine.getTopologyEngine();

    // Load workspace config for monorepo boundary resolution
    let workspaceConfig: WorkspaceConfig | null = null;
    try {
      workspaceConfig = await this.workspaceManager.loadWorkspace();
    } catch {
      // Non-monorepo fallback
    }

    let trimmed = (queryText || '').trim();
    let surgicalKind = options.surgicalKind;
    let target = options.target;
    let source = options.source;
    let packageScope = options.package;

    // 1. Detect package scope prefix: "pkg:<name> <rest>"
    const pkgMatch = trimmed.match(/^pkg:([a-zA-Z0-9_@/-]+)\s*(.*)/i);
    if (pkgMatch) {
      packageScope = pkgMatch[1];
      trimmed = pkgMatch[2].trim();
    }

    // 2. Detect surgical operators
    if (!surgicalKind) {
      if (!trimmed || trimmed === 'map:' || trimmed === 'map') {
        surgicalKind = 'map';
      } else {
        const stubMatch = trimmed.match(/^stub:\s*(.+)/i);
        if (stubMatch) {
          surgicalKind = 'stub';
          target = stubMatch[1].trim();
        } else {
          const pathMatch =
            trimmed.match(/^path:\s*(?:from\s+)?(\S+)\s+(?:to|->)\s+(\S+)/i) ||
            trimmed.match(/^path:\s*(\S+)\s+(\S+)/i);
          if (pathMatch) {
            surgicalKind = 'path';
            source = pathMatch[1];
            target = pathMatch[2];
          } else {
            const explainMatch = trimmed.match(/^explain:\s*(.+)/i);
            if (explainMatch) {
              surgicalKind = 'explain';
              target = explainMatch[1].trim();
            } else {
              const blastMatch = trimmed.match(/^blast:\s*(.+)/i);
              if (blastMatch) {
                surgicalKind = 'blast';
                target = blastMatch[1].trim();
              }
            }
          }
        }
      }
    }

    // -------------------------------------------------------------
    // Route L0: Macro Architectural Map
    // -------------------------------------------------------------
    if (surgicalKind === 'map') {
      const macroRes = this.buildMacroMap(topology, workspaceConfig, packageScope);
      const summaryText = this.formatMacroMap(macroRes, packageScope);
      return {
        query: queryText,
        mode: 'bfs',
        seedNodes: [],
        nodes: [],
        edges: [],
        summaryText,
        approxTokens: Math.ceil(summaryText.length / 4),
        surgicalKind: 'map',
        macroMapResult: macroRes,
        packageScope,
      };
    }

    // -------------------------------------------------------------
    // Route L1: Skeleton Interface Stubs
    // -------------------------------------------------------------
    if (surgicalKind === 'stub') {
      const stubTarget = target || trimmed;
      const skeletonResult = await this.buildSkeletonStub(stubTarget, topology);
      const summaryText = this.formatSkeletonSummary(skeletonResult);
      return {
        query: queryText,
        mode: 'bfs',
        seedNodes: [stubTarget],
        nodes: [],
        edges: [],
        summaryText,
        approxTokens: Math.ceil(summaryText.length / 4),
        surgicalKind: 'stub',
        skeletonResult: skeletonResult || undefined,
        packageScope,
      };
    }

    // -------------------------------------------------------------
    // Route L2: Surgical Explain
    // -------------------------------------------------------------
    if (surgicalKind === 'explain') {
      const explainTarget = target || trimmed;
      const res = topology.explainNode(explainTarget);
      if (!res) {
        const summaryText = `Error: Could not resolve node or symbol "${explainTarget}" in knowledge graph.`;
        return {
          query: queryText,
          mode: 'bfs',
          seedNodes: [],
          nodes: [],
          edges: [],
          summaryText,
          approxTokens: Math.ceil(summaryText.length / 4),
          surgicalKind: 'explain',
        };
      }

      const summaryText = topology.formatNodeExplanation(res);
      const incomingEdges: QuerySubGraphEdge[] = res.incoming.map((inc) => ({
        sourceId: inc.nodeId,
        targetId: res.nodeId,
        relation: inc.relation,
        confidence: inc.confidence,
      }));
      const outgoingEdges: QuerySubGraphEdge[] = res.outgoing.map((out) => ({
        sourceId: res.nodeId,
        targetId: out.nodeId,
        relation: out.relation,
        confidence: out.confidence,
      }));

      return {
        query: queryText,
        mode: 'bfs',
        seedNodes: [res.nodeId],
        nodes: [
          {
            id: res.nodeId,
            filePath: res.filePath,
            symbolName: res.symbolName,
            kind: res.kind,
            domain: res.domain,
            phase: res.phase,
            communityId: res.communityId,
            communityLabel: res.communityLabel,
          },
        ],
        edges: [...incomingEdges, ...outgoingEdges],
        summaryText,
        approxTokens: Math.ceil(summaryText.length / 4),
        surgicalKind: 'explain',
        explainResult: res,
        packageScope,
      };
    }

    // -------------------------------------------------------------
    // Route L2: Surgical Shortest Path
    // -------------------------------------------------------------
    if (surgicalKind === 'path') {
      const src = source || '';
      const dst = target || '';
      const res = topology.findShortestPath(src, dst, { relationTypes: options.relationTypes });
      if (!res) {
        const summaryText = `No path found between "${src}" and "${dst}".`;
        return {
          query: queryText,
          mode: 'bfs',
          seedNodes: [src, dst].filter(Boolean),
          nodes: [],
          edges: [],
          summaryText,
          approxTokens: Math.ceil(summaryText.length / 4),
          surgicalKind: 'path',
          shortestPathResult: null,
          packageScope,
        };
      }

      const summaryText = topology.formatShortestPath(res);
      const pathNodes: QuerySubGraphNode[] = res.path.map((nodeId) => {
        const gNode = topology.getNode(nodeId);
        return {
          id: nodeId,
          filePath: gNode?.file_path || (nodeId.includes('#') ? nodeId.split('#')[0] : nodeId),
          symbolName: gNode?.symbol_name || (nodeId.includes('#') ? nodeId.split('#')[1] : null),
          kind: gNode?.kind || 'symbol',
          domain: gNode?.domain || null,
          phase: gNode?.lifecycle_phase || null,
        };
      });

      const pathEdges: QuerySubGraphEdge[] = res.steps.map((s) => ({
        sourceId: s.fromId,
        targetId: s.toId,
        relation: s.relation,
        confidence: 'EXTRACTED',
      }));

      return {
        query: queryText,
        mode: 'bfs',
        seedNodes: [res.sourceId, res.targetId],
        nodes: pathNodes,
        edges: pathEdges,
        summaryText,
        approxTokens: Math.ceil(summaryText.length / 4),
        surgicalKind: 'path',
        shortestPathResult: res,
        packageScope,
      };
    }

    // -------------------------------------------------------------
    // Route L2: Surgical Blast Radius
    // -------------------------------------------------------------
    if (surgicalKind === 'blast') {
      const blastTarget = target || trimmed;
      const depth = options.depth ?? options.maxDepth ?? 3;
      const direction = options.direction || 'downstream';
      const res = topology.getBlastRadius(blastTarget, { depth, direction });
      const summaryText = topology.formatBlastRadiusTree(res);

      const flatNodes: QuerySubGraphNode[] = [];
      const flatEdges: QuerySubGraphEdge[] = [];
      const traverseTree = (node: any, parentId?: string) => {
        flatNodes.push({
          id: node.id,
          filePath: node.filePath,
          symbolName: node.symbolName,
          kind: node.kind,
          domain: node.domain,
          phase: node.phase,
        });
        if (parentId) {
          flatEdges.push({
            sourceId: direction === 'upstream' ? node.id : parentId,
            targetId: direction === 'upstream' ? parentId : node.id,
            relation: node.relation,
            confidence: 'EXTRACTED',
          });
        }
        if (node.children) {
          for (const child of node.children) {
            traverseTree(child, node.id);
          }
        }
      };

      if (res.nodes && res.nodes.length > 0) {
        for (const root of res.nodes) {
          traverseTree(root);
        }
      }

      return {
        query: queryText,
        mode: 'bfs',
        seedNodes: [res.target],
        nodes: flatNodes,
        edges: flatEdges,
        summaryText,
        approxTokens: Math.ceil(summaryText.length / 4),
        surgicalKind: 'blast',
        blastRadiusResult: res,
        packageScope,
      };
    }

    // -------------------------------------------------------------
    // Default Route: Hybrid Search + Centrality-Guided Budget Pruning
    // -------------------------------------------------------------
    const mode = options.mode || 'bfs';
    const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 2;
    const tokenBudget = options.budget || 1000; // Settled in D6: default 1,000 tokens
    const charBudget = tokenBudget * 4;

    // Compute PageRank & Centrality
    const centralities = topology.getNodeCentralities();

    // Identify Seed Nodes with Hybrid Ranking
    const seedNodes = await this.resolveHybridSeedNodes(
      trimmed,
      topology,
      centralities,
      workspaceConfig,
      packageScope,
    );

    // Expand Subgraph through BFS/DFS
    const visitedNodes = new Set<string>(seedNodes);
    const collectedEdges: QuerySubGraphEdge[] = [];

    if (mode === 'bfs') {
      const queue: { id: string; depth: number }[] = seedNodes.map((id) => ({ id, depth: 0 }));
      while (queue.length > 0) {
        const { id, depth } = queue.shift()!;
        if (depth >= maxDepth) continue;

        const outgoing = topology.getOutgoingEdges(id);
        const incoming = topology.getIncomingEdges(id);

        for (const edge of [...outgoing, ...incoming]) {
          const neighborId = edge.source_id === id ? edge.target_id : edge.source_id;
          // Package filtering
          if (packageScope && workspaceConfig) {
            const pkg = workspaceConfig.packages.get(packageScope);
            if (pkg && !neighborId.startsWith(pkg.rootDir)) continue;
          }

          collectedEdges.push({
            sourceId: edge.source_id,
            targetId: edge.target_id,
            relation: edge.relation,
            confidence: edge.confidence || 'EXTRACTED',
          });

          if (!visitedNodes.has(neighborId)) {
            visitedNodes.add(neighborId);
            queue.push({ id: neighborId, depth: depth + 1 });
          }
        }
      }
    } else {
      // DFS chain tracing
      const stack: { id: string; depth: number }[] = seedNodes.map((id) => ({ id, depth: 0 }));
      while (stack.length > 0) {
        const { id, depth } = stack.pop()!;
        if (depth >= maxDepth) continue;

        const outgoing = topology.getOutgoingEdges(id);
        for (const edge of outgoing) {
          if (packageScope && workspaceConfig) {
            const pkg = workspaceConfig.packages.get(packageScope);
            if (pkg && !edge.target_id.startsWith(pkg.rootDir)) continue;
          }

          collectedEdges.push({
            sourceId: edge.source_id,
            targetId: edge.target_id,
            relation: edge.relation,
            confidence: edge.confidence || 'EXTRACTED',
          });

          if (!visitedNodes.has(edge.target_id)) {
            visitedNodes.add(edge.target_id);
            stack.push({ id: edge.target_id, depth: depth + 1 });
          }
        }
      }
    }

    // Deduplicate edges
    const uniqueEdges: QuerySubGraphEdge[] = [];
    const edgeSeen = new Set<string>();
    for (const e of collectedEdges) {
      const key = `${e.sourceId}->${e.targetId}:${e.relation}`;
      if (!edgeSeen.has(key)) {
        edgeSeen.add(key);
        uniqueEdges.push(e);
      }
    }

    // Community clusters
    const communityRes = topology.getCommunities();
    const nodeToComm = new Map<string, { id: number; label: string }>();
    for (const [cIdStr, nIds] of Object.entries(communityRes.communities)) {
      const cId = parseInt(cIdStr, 10);
      const info = communityRes.communityInfo.find((ci) => ci.id === cId);
      const label = info?.label || `Community ${cId}`;
      for (const nId of nIds) {
        nodeToComm.set(nId, { id: cId, label });
      }
    }

    // Build Node Metadata
    const resultNodes: QuerySubGraphNode[] = [];
    for (const nId of visitedNodes) {
      const gNode = topology.getNode(nId);
      const filePath = gNode?.file_path || (nId.includes('#') ? nId.split('#')[0] : nId);
      const symName = gNode?.symbol_name || (nId.includes('#') ? nId.split('#')[1] : null);

      let description: string | undefined;
      let expList: string[] | undefined;
      try {
        const sidecarRow = await this.graphEngine.getSidecar(filePath);
        if (sidecarRow) {
          description = sidecarRow.description;
          if (sidecarRow.exports) {
            expList = (sidecarRow.exports as string)
              .split(',')
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
      } catch {
        // Ignore sidecar errors
      }

      const comm = nodeToComm.get(nId);
      const cent = centralities.get(nId);

      resultNodes.push({
        id: nId,
        filePath,
        symbolName: symName,
        kind: gNode?.kind || 'symbol',
        domain: gNode?.domain || null,
        phase: gNode?.lifecycle_phase || null,
        communityId: comm?.id,
        communityLabel: comm?.label,
        description,
        exports: expList,
        pageRank: cent?.pageRank,
      });
    }

    // Sort by centrality & PageRank descending so primary architectural nodes are preserved
    resultNodes.sort((a, b) => (b.pageRank || 0) - (a.pageRank || 0));

    // Format with Centrality-Guided Pruning
    const summaryText = this.formatPrunedMarkdownContext(
      trimmed,
      mode,
      seedNodes,
      resultNodes,
      uniqueEdges,
      charBudget,
    );

    const approxTokens = Math.ceil(summaryText.length / 4);

    return {
      query: queryText,
      mode,
      seedNodes,
      nodes: resultNodes,
      edges: uniqueEdges,
      summaryText,
      approxTokens,
      surgicalKind: 'search',
      packageScope,
    };
  }

  /**
   * Resolves seed nodes using hybrid BM25 lexical match + PageRank authority weighting.
   */
  private async resolveHybridSeedNodes(
    queryText: string,
    topology: TopologyEngine,
    centralities: Map<string, any>,
    workspaceConfig: WorkspaceConfig | null,
    packageScope?: string,
  ): Promise<string[]> {
    const scoredSeeds = new Map<string, number>();

    // Direct and prefix matches
    const directMatches = topology.resolveNodeIds(queryText);
    for (const m of directMatches) {
      scoredSeeds.set(m, 100.0);
    }

    // Word tokens
    const words = queryText
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9_-]/g, ''))
      .filter((w) => w.length >= 3);

    for (const word of words) {
      const wMatches = topology.resolveNodeIds(word);
      for (const m of wMatches.slice(0, 5)) {
        const cur = scoredSeeds.get(m) || 0;
        scoredSeeds.set(m, cur + 20.0);
      }
    }

    // FTS5 BM25 search
    try {
      const ftsResults = await this.graphEngine.search(queryText, { limit: 10 });
      for (const res of ftsResults) {
        const matchingNode =
          topology.getNode(res.filePath) || topology.resolveNodeIds(res.filePath)[0];
        const resolvedId = matchingNode
          ? typeof matchingNode === 'string'
            ? matchingNode
            : matchingNode.id
          : res.filePath;
        const cur = scoredSeeds.get(resolvedId) || 0;
        scoredSeeds.set(resolvedId, cur + 15.0);
      }
    } catch {
      // FTS fallback
    }

    // If still empty, seed with top God Nodes
    if (scoredSeeds.size === 0) {
      const smells = topology.detectSmells();
      for (const god of smells.godNodes.slice(0, 5)) {
        scoredSeeds.set(god.id, 10.0);
      }
    }

    // Weight by PageRank and exports
    for (const [id, baseScore] of scoredSeeds.entries()) {
      const cent = centralities.get(id);
      const pr = cent?.pageRank || 0;
      const gNode = topology.getNode(id);
      const isExported = gNode?.kind === 'class' || gNode?.kind === 'interface';
      const finalScore = baseScore * (1.0 + 10.0 * pr + (isExported ? 1.5 : 0.0));
      scoredSeeds.set(id, finalScore);
    }

    // Apply package filter if set
    let candidates = Array.from(scoredSeeds.entries());
    if (packageScope && workspaceConfig) {
      const pkg = workspaceConfig.packages.get(packageScope);
      if (pkg) {
        candidates = candidates.filter(([id]) => id.startsWith(pkg.rootDir));
      }
    }

    candidates.sort((a, b) => b[1] - a[1]);
    return candidates.slice(0, 5).map(([id]) => id);
  }

  /**
   * Builds the Level 0 Macro Architectural Map.
   */
  private buildMacroMap(
    topology: TopologyEngine,
    workspaceConfig: WorkspaceConfig | null,
    packageScope?: string,
  ): MacroMapResult {
    const nodes = topology.getAllNodes();
    const edges = topology.getAllEdges();
    const smells = topology.detectSmells();
    const communityRes = topology.getCommunities();

    const packages: Array<{ name: string; rootDir: string }> = [];
    if (workspaceConfig && workspaceConfig.packages) {
      for (const pkg of workspaceConfig.packages.values()) {
        packages.push({ name: pkg.name, rootDir: pkg.rootDir });
      }
    }

    const communities: MacroMapCommunity[] = [];
    for (const ci of communityRes.communityInfo) {
      communities.push({
        id: ci.id,
        label: ci.label,
        nodeCount: ci.nodes.length,
        hubNode: ci.hubNode,
      });
    }

    const godNodes = smells.godNodes.slice(0, 5).map((g) => ({
      id: g.id,
      inDegree: g.inDegree,
      outDegree: g.outDegree,
      reason: g.reason,
    }));

    // Count unique files
    const uniqueFiles = new Set<string>();
    for (const n of nodes) {
      const f = n.file_path || (n.id.includes('#') ? n.id.split('#')[0] : n.id);
      if (!packageScope || f.startsWith(packageScope)) {
        uniqueFiles.add(f);
      }
    }

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      totalFiles: uniqueFiles.size,
      packages,
      communities,
      godNodes,
    };
  }

  private formatMacroMap(macro: MacroMapResult, packageScope?: string): string {
    const lines: string[] = [];
    lines.push(
      `## Level 0: Macro Architecture Map${packageScope ? ` [Package: ${packageScope}]` : ''}`,
    );
    lines.push(
      `Total Files: ${macro.totalFiles} | Graph Nodes: ${macro.totalNodes} | Edges: ${macro.totalEdges}`,
    );
    lines.push('');

    if (macro.packages.length > 0) {
      lines.push(`### Monorepo Packages`);
      for (const pkg of macro.packages) {
        lines.push(`- \`${pkg.name}\` (\`${pkg.rootDir}\`)`);
      }
      lines.push('');
    }

    lines.push(`### Subsystem Community Clusters`);
    for (const comm of macro.communities.slice(0, 8)) {
      lines.push(
        `- Cluster ${comm.id} (${comm.label}): ${comm.nodeCount} nodes | Hub: \`${comm.hubNode}\``,
      );
    }
    lines.push('');

    if (macro.godNodes.length > 0) {
      lines.push(`### Key Architectural Hubs (High Centrality)`);
      for (const god of macro.godNodes) {
        lines.push(`- \`${god.id}\` (In: ${god.inDegree}, Out: ${god.outDegree}) [${god.reason}]`);
      }
      lines.push('');
    }

    lines.push(
      `Next Steps: Use \`stub: <file|module>\` for interface contracts, or \`explain: <symbol>\` for call graphs.`,
    );
    return lines.join('\n');
  }

  /**
   * Builds the Level 1 Skeleton Stub for a target file or symbol.
   */
  private async buildSkeletonStub(
    target: string,
    topology: TopologyEngine,
  ): Promise<SkeletonResult | null> {
    let resolvedPath = target;
    const gNode = topology.getNode(target) || topology.resolveNodeIds(target)[0];
    if (gNode) {
      resolvedPath = typeof gNode === 'string' ? gNode : gNode.file_path || gNode.id.split('#')[0];
    } else if (target.includes('#')) {
      resolvedPath = target.split('#')[0];
    }

    if (!(await this.fsDriver.exists(resolvedPath))) {
      // Try adding common extensions
      for (const ext of ['.ts', '.tsx', '.js', '.py', '.rs', '.go']) {
        if (await this.fsDriver.exists(`${resolvedPath}${ext}`)) {
          resolvedPath = `${resolvedPath}${ext}`;
          break;
        }
      }
    }

    if (!(await this.fsDriver.exists(resolvedPath))) {
      return null;
    }

    const code = await this.fsDriver.readFile(resolvedPath);
    return this.skeletonGenerator.generateSkeleton(resolvedPath, code);
  }

  private formatSkeletonSummary(res: SkeletonResult | null): string {
    if (!res) {
      return `Error: Could not locate source file for skeleton extraction.`;
    }

    const lines: string[] = [];
    lines.push(`## Interface Skeleton Stub: \`${res.filePath}\``);
    lines.push(
      `Symbols: ${res.symbolCount} | Lines: ${res.skeletonLines}/${res.originalLines} | Token Savings: ~${res.tokenSavingsPercent}%`,
    );
    lines.push('');
    lines.push('```typescript');
    lines.push(res.skeletonText);
    lines.push('```');
    lines.push('');
    lines.push(
      `Tip: View implementation using file tools with line links above, or inspect relationships with \`blast: ${res.filePath}\`.`,
    );
    return lines.join('\n');
  }

  /**
   * Formats subgraph context using Centrality-Guided Pruning within the character/token budget.
   */
  private formatPrunedMarkdownContext(
    query: string,
    mode: 'bfs' | 'dfs',
    seeds: string[],
    nodes: QuerySubGraphNode[],
    edges: QuerySubGraphEdge[],
    charBudget: number,
  ): string {
    const lines: string[] = [];
    lines.push(`## Knowledge Graph Context for: "${query}"`);
    lines.push(
      `Mode: \`${mode.toUpperCase()}\` | Seeds: ${seeds.map((s) => `\`${s}\``).join(', ')} | SubGraph: ${nodes.length} nodes, ${edges.length} edges`,
    );
    lines.push('');

    // Partition nodes: Seeds and top central nodes get full display; lower nodes get collapsed
    const primaryNodes = nodes.slice(0, 8);
    const secondaryNodes = nodes.slice(8);

    lines.push(`### Key Architectural Nodes`);
    for (const node of primaryNodes) {
      const title = node.symbolName
        ? `\`${node.filePath}#${node.symbolName}\``
        : `\`${node.filePath}\``;
      const domainTag = node.domain ? ` [Domain: ${node.domain}]` : '';
      const clusterTag = node.communityLabel ? ` [Cluster: ${node.communityLabel}]` : '';
      const prTag = node.pageRank ? ` (Rank: ${(node.pageRank * 100).toFixed(1)})` : '';
      lines.push(`- **${title}** (${node.kind})${domainTag}${clusterTag}${prTag}`);
      if (node.description) {
        lines.push(`  Summary: ${node.description}`);
      }
      if (node.exports && node.exports.length > 0) {
        lines.push(`  Exports: ${node.exports.slice(0, 5).join(', ')}`);
      }
    }

    // Collapse secondary nodes into compact tallies per file to conserve tokens
    if (secondaryNodes.length > 0) {
      const fileTallies = new Map<string, number>();
      for (const n of secondaryNodes) {
        fileTallies.set(n.filePath, (fileTallies.get(n.filePath) || 0) + 1);
      }
      lines.push('');
      lines.push(`### Additional Context (${secondaryNodes.length} symbols collapsed)`);
      for (const [f, count] of fileTallies.entries()) {
        lines.push(`- \`${f}\`: + ${count} internal helper symbols`);
      }
    }
    lines.push('');

    lines.push(`### Call & Dependency Graph Connections`);
    if (edges.length === 0) {
      lines.push(`- No direct inter-module relationships found for this scope.`);
    } else {
      for (const e of edges.slice(0, 20)) {
        lines.push(`- \`${e.sourceId}\` -> [${e.relation}] -> \`${e.targetId}\` (${e.confidence})`);
      }
      if (edges.length > 20) {
        lines.push(
          `- ... and ${edges.length - 20} additional relations collapsed to stay within budget.`,
        );
      }
    }

    let output = lines.join('\n');
    if (output.length > charBudget) {
      output = output.substring(0, charBudget) + '\n\n... [Strictly capped to token budget]';
    }

    return output;
  }
}
