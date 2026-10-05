import { GraphEngine } from '../graph/engine';
import { NodeExplanationResult, ShortestPathResult, BlastRadiusResult } from '../graph/topology';
import { FileStorageDriver, NodeFileSystem } from '../storage';
import { loadConfig } from '../config/schema';

export type SurgicalQueryKind = 'search' | 'explain' | 'path' | 'blast';

export interface QueryOptions {
  budget?: number; // approximate token budget (default: 1500 tokens)
  mode?: 'bfs' | 'dfs'; // traversal mode (default: 'bfs')
  maxDepth?: number; // max hops (default: 2)
  configPath?: string;
  surgicalKind?: SurgicalQueryKind;
  target?: string;
  source?: string;
  depth?: number;
  direction?: 'upstream' | 'downstream' | 'both';
  relationTypes?: string[];
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
}

export interface QuerySubGraphEdge {
  sourceId: string;
  targetId: string;
  relation: string;
  confidence: string;
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
}

export class QueryEngine {
  private graphEngine: GraphEngine;
  private fsDriver: FileStorageDriver;

  constructor(options?: { graphEngine?: GraphEngine; fsDriver?: FileStorageDriver }) {
    if (options?.graphEngine) {
      this.graphEngine = options.graphEngine;
    } else {
      const config = loadConfig();
      this.graphEngine = new GraphEngine(config.paths.db_path);
    }
    this.fsDriver = options?.fsDriver || new NodeFileSystem();
  }

  /**
   * Queries the knowledge graph and returns either a token-budgeted subgraph context package
   * or a targeted surgical result (explain, path, blast radius).
   */
  public async query(queryText: string, options: QueryOptions = {}): Promise<QueryResult> {
    await this.graphEngine.initialize();

    // Load topology engine from DB
    const topology = await this.graphEngine.getTopologyEngine();

    // 1. Detect or apply surgical query intent
    let surgicalKind = options.surgicalKind;
    let target = options.target;
    let source = options.source;

    if (!surgicalKind && queryText) {
      const trimmed = queryText.trim();
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

    // Surgical Route A: Explain Symbol / Node
    if (surgicalKind === 'explain') {
      const explainTarget = target || queryText;
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
      };
    }

    // Surgical Route B: Shortest Path
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
      };
    }

    // Surgical Route C: Blast Radius Impact
    if (surgicalKind === 'blast') {
      const blastTarget = target || queryText;
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
      };
    }

    // Default Route: GraphRAG Subgraph Search
    const mode = options.mode || 'bfs';
    const maxDepth = options.maxDepth !== undefined ? options.maxDepth : 2;
    const tokenBudget = options.budget || 1500;
    const charBudget = tokenBudget * 4; // ~4 chars per token

    // Community clusters map
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

    // 1. Identify seed nodes
    const seedSet = new Set<string>();

    // Strategy A: Direct name matching against graph nodes
    const directMatches = topology.resolveNodeIds(queryText);
    for (const m of directMatches) {
      seedSet.add(m);
    }

    // Strategy B: Word-by-word match
    const words = queryText
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z0-9_-]/g, ''))
      .filter((w) => w.length >= 3);

    for (const word of words) {
      const wMatches = topology.resolveNodeIds(word);
      for (const m of wMatches.slice(0, 3)) {
        seedSet.add(m);
      }
    }

    // Strategy C: FTS5 search across sidecar specifications
    try {
      const ftsResults = await this.graphEngine.search(queryText, { limit: 5 });
      for (const res of ftsResults) {
        const matchingNode =
          topology.getNode(res.filePath) || topology.resolveNodeIds(res.filePath)[0];
        const resolvedId = matchingNode
          ? typeof matchingNode === 'string'
            ? matchingNode
            : matchingNode.id
          : res.filePath;
        seedSet.add(resolvedId);
      }
    } catch {
      // FTS fallback
    }

    // If still no seeds, pick central hubs
    if (seedSet.size === 0) {
      const smells = topology.detectSmells();
      for (const god of smells.godNodes.slice(0, 3)) {
        seedSet.add(god.id);
      }
    }

    const seedNodes = Array.from(seedSet).slice(0, 5);

    // 2. Expand subgraph via BFS or DFS
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

    // Retrieve node metadata & sidecar descriptions
    const resultNodes: QuerySubGraphNode[] = [];
    for (const nId of visitedNodes) {
      const gNode = topology.getNode(nId);
      const filePath = gNode?.file_path || (nId.includes('#') ? nId.split('#')[0] : nId);
      const symName = gNode?.symbol_name || (nId.includes('#') ? nId.split('#')[1] : null);

      // Check for sidecar description in DB
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
        // Ignore sidecar fetch errors
      }

      const comm = nodeToComm.get(nId);

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
      });
    }

    // Format output and cap at character budget
    const formatted = this.formatMarkdownContext(
      queryText,
      mode,
      seedNodes,
      resultNodes,
      uniqueEdges,
    );
    let finalSummary = formatted;
    if (finalSummary.length > charBudget) {
      finalSummary =
        finalSummary.substring(0, charBudget) + '\n\n... [Truncated to stay within token budget]';
    }

    const approxTokens = Math.ceil(finalSummary.length / 4);

    return {
      query: queryText,
      mode,
      seedNodes,
      nodes: resultNodes,
      edges: uniqueEdges,
      summaryText: finalSummary,
      approxTokens,
      surgicalKind: 'search',
    };
  }

  /**
   * Formats the extracted subgraph as structured, high-signal Markdown.
   */
  private formatMarkdownContext(
    query: string,
    mode: 'bfs' | 'dfs',
    seeds: string[],
    nodes: QuerySubGraphNode[],
    edges: QuerySubGraphEdge[],
  ): string {
    const lines: string[] = [];
    lines.push(`## 🧠 Knowledge Graph Context for: "${query}"`);
    lines.push(
      `*Mode:* \`${mode.toUpperCase()}\` | *Seeds:* ${seeds.map((s) => `\`${s}\``).join(', ')} | *SubGraph:* ${nodes.length} nodes, ${edges.length} edges`,
    );
    lines.push('');

    lines.push(`### 📌 Key Architectural Nodes`);
    for (const node of nodes) {
      const title = node.symbolName
        ? `\`${node.filePath}#${node.symbolName}\``
        : `\`${node.filePath}\``;
      const domainTag = node.domain ? ` [Domain: ${node.domain}]` : '';
      const phaseTag = node.phase ? ` [Phase: ${node.phase}]` : '';
      const clusterTag = node.communityLabel ? ` [Cluster: ${node.communityLabel}]` : '';
      lines.push(`- **${title}** (${node.kind})${domainTag}${phaseTag}${clusterTag}`);
      if (node.description) {
        lines.push(`  *Summary:* ${node.description}`);
      }
      if (node.exports && node.exports.length > 0) {
        lines.push(`  *Exports:* ${node.exports.slice(0, 5).join(', ')}`);
      }
    }
    lines.push('');

    lines.push(`### 🔗 Relationship Graph Connections`);
    if (edges.length === 0) {
      lines.push(`- *No direct inter-module relationships found for this scope.*`);
    } else {
      for (const e of edges.slice(0, 30)) {
        lines.push(
          `- \`${e.sourceId}\` ──[${e.relation}]──> \`${e.targetId}\` *(${e.confidence})*`,
        );
      }
      if (edges.length > 30) {
        lines.push(`- *... and ${edges.length - 30} additional connections.*`);
      }
    }

    return lines.join('\n');
  }
}
