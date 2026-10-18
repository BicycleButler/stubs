import * as fs from 'fs';
import * as path from 'path';
import { GraphEngine, GraphNode, GraphEdge, normalizePosixPath } from './engine';
import { StubsConfig } from '../config/schema';

export interface DomainModuleInfo {
  filePath: string;
  sidecarPath?: string;
  exportedSymbols: string[];
  dependencies: string[];
  isHub: boolean;
  inDegree: number;
  outDegree: number;
}

export interface DomainInfo {
  name: string;
  title: string;
  hubFile: string;
  layer?: number;
  modules: DomainModuleInfo[];
  externalDependencies: string[];
  dependents: string[];
  purpose?: string;
  invariants?: string[];
}

const COMMON_DOMAIN_TITLES: Record<string, string> = {
  cli: 'CLI & Router',
  graph: 'Graph Engine',
  materializer: 'Materializer Engine',
  sanding: 'Sanding & Sync Engine',
  grill: 'Interactive Grill Engine',
  server: 'Server & Live Portal',
  autonomy: 'Autonomy Protocol',
  parser: 'Parser Engine',
  storage: 'Storage Layer',
  config: 'Configuration Layer',
  query: 'Query & GraphRAG Engine',
  context: 'Context Engine',
  concept: 'Concept Engine',
  diagram: 'Diagram Engine',
  phase: 'Phase Engine',
  mock: 'Mock Engine',
  lint: 'Architecture Lint Engine',
  prune: 'Prune Engine',
  changelog: 'Changelog Engine',
  export: 'Export Engine',
  templates: 'Template Engine',
  compiler: 'Compiler & Typechecker',
  core: 'Core Entrypoints & Runtime',
  tools: 'Verification & Tool Suite',
  web: 'Web Portal Client',
};

const AMBIENT_TOOL_DOMAINS = new Set([
  'lint',
  'prune',
  'mock',
  'export',
  'changelog',
  'diagram',
  'templates',
  'impact',
]);

export class DomainEngine {
  private graphEngine: GraphEngine | null;
  private rootDir: string;
  private config?: StubsConfig;

  constructor(
    graphEngine: GraphEngine | null,
    rootDir: string = process.cwd(),
    config?: StubsConfig,
  ) {
    this.graphEngine = graphEngine;
    this.rootDir = rootDir;
    this.config = config;
  }

  /**
   * Matches a POSIX file path against a wildcard glob pattern.
   */
  public matchesGlob(filePath: string, pattern: string): boolean {
    const normPath = normalizePosixPath(filePath);
    const normPattern = normalizePosixPath(pattern);
    const regexStr =
      '^' +
      normPattern
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '§§DOUBLE§§')
        .replace(/\*/g, '[^/]*')
        .replace(/§§DOUBLE§§/g, '.*')
        .replace(/\?/g, '.') +
      '$';
    return new RegExp(regexStr).test(normPath);
  }

  /**
   * Extracts explicit domain from sidecar frontmatter if present.
   */
  public extractDomainFromSidecar(filePath: string): string | undefined {
    const sidecarPath = path.resolve(this.rootDir, `${filePath}.md`);
    if (!fs.existsSync(sidecarPath)) return undefined;
    try {
      const content = fs.readFileSync(sidecarPath, 'utf8');
      const frontmatterMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
      if (!frontmatterMatch) return undefined;
      const domainMatch = frontmatterMatch[1].match(/^domain:\s*["']?([^"'\r\n]+)["']?/m);
      return domainMatch ? domainMatch[1].trim() : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Derives a deterministic domain name using the 4-tier hybrid discovery hierarchy.
   */
  public deriveDomainForFile(filePath: string, node?: GraphNode): string {
    const norm = normalizePosixPath(filePath);

    // Tier 1: Explicit sidecar frontmatter
    const sidecarDomain = this.extractDomainFromSidecar(norm);
    if (sidecarDomain) {
      return sidecarDomain;
    }

    // Tier 2: Configuration glob overrides (.stubs/config.json)
    if (this.config?.architecture?.domains) {
      for (const [domName, patterns] of Object.entries(this.config.architecture.domains)) {
        for (const pattern of patterns) {
          if (this.matchesGlob(norm, pattern)) {
            return domName;
          }
        }
      }
    }

    // Tier 3: Graph node metadata
    if (node && node.domain && node.domain !== 'general' && node.domain !== 'default') {
      return node.domain;
    }

    // Tier 4: Workspace package and directory structure
    const pkgDomainMatch = norm.match(/^packages\/[^/]+\/(?:src|lib)\/([^/]+)\//);
    if (pkgDomainMatch) {
      return pkgDomainMatch[1];
    }

    const pkgMatch = norm.match(/^packages\/([^/]+)\//);
    if (pkgMatch) {
      return pkgMatch[1];
    }

    const srcMatch = norm.match(/^(?:src|lib|app)\/([^/]+)\//);
    if (srcMatch) {
      return srcMatch[1];
    }

    if (/^(?:src|lib|app)\/[^/]+\.[a-zA-Z]+$/.test(norm)) {
      return 'core';
    }

    return 'core';
  }

  /**
   * Discovers domains by analyzing AST nodes or directory structure.
   */
  public async discoverDomains(): Promise<Map<string, DomainInfo>> {
    if (this.graphEngine) {
      const nodes = await this.graphEngine.getGraphNodes();
      const edges = await this.graphEngine.getGraphEdges();

      if (nodes.length > 0) {
        return this.discoverDomainsFromGraph(nodes, edges);
      }
    }

    // Fallback: discover domains from filesystem
    return this.discoverDomainsFromFilesystem();
  }

  /**
   * Discovers and structures domain information using AST graph and gravitational rollup.
   */
  private discoverDomainsFromGraph(
    nodes: GraphNode[],
    edges: GraphEdge[],
  ): Map<string, DomainInfo> {
    const fileNodes = new Map<string, GraphNode>();
    const fileSymbols = new Map<string, string[]>();
    const inDegreeMap = new Map<string, number>();
    const outDegreeMap = new Map<string, number>();
    const fileOutgoing = new Map<string, Set<string>>();

    const minDomainSize = this.config?.architecture?.min_domain_size ?? 3;
    const specsDir = this.config?.paths.specs_dir || 'src';

    for (const node of nodes) {
      const normFile = node.file_path || (node.id.includes('#') ? node.id.split('#')[0] : node.id);
      if (!normFile || normFile.startsWith('node_modules')) continue;

      // Filter out standalone test files, test directories, and non-specs_dir artifacts
      if (
        normFile.startsWith('tests/') ||
        normFile.startsWith('test/') ||
        normFile.includes('__tests__') ||
        /\.(test|spec)\.[a-zA-Z]+$/.test(normFile) ||
        normFile.startsWith('scripts/') ||
        normFile.startsWith('bench/')
      ) {
        continue;
      }

      // Must be under specsDir or root code files
      if (!normFile.startsWith(specsDir) && !normFile.startsWith('packages/')) {
        continue;
      }

      if (node.kind === 'file' || !fileNodes.has(normFile)) {
        fileNodes.set(normFile, node);
      }

      if (node.symbol_name) {
        if (!fileSymbols.has(normFile)) fileSymbols.set(normFile, []);
        fileSymbols.get(normFile)!.push(node.symbol_name);
      }
    }

    for (const edge of edges) {
      const srcFile = edge.source_id.includes('#') ? edge.source_id.split('#')[0] : edge.source_id;
      const tgtFile = edge.target_id.includes('#') ? edge.target_id.split('#')[0] : edge.target_id;

      if (!fileNodes.has(srcFile) || !fileNodes.has(tgtFile)) continue;

      if (!fileOutgoing.has(srcFile)) fileOutgoing.set(srcFile, new Set());
      fileOutgoing.get(srcFile)!.add(tgtFile);

      outDegreeMap.set(srcFile, (outDegreeMap.get(srcFile) || 0) + 1);
      inDegreeMap.set(tgtFile, (inDegreeMap.get(tgtFile) || 0) + 1);
    }

    // Step 1: Initial grouping of files into candidate domains
    const domainFiles = new Map<string, string[]>();
    for (const filePath of fileNodes.keys()) {
      const domain = this.deriveDomainForFile(filePath, fileNodes.get(filePath));
      if (!domainFiles.has(domain)) domainFiles.set(domain, []);
      domainFiles.get(domain)!.push(filePath);
    }

    // Step 2: Gravitational dependency rollup for micro-clusters (< minDomainSize)
    // Micro-clusters calculate coupling against candidate domains and merge into their strongest coupling partner.
    const fileToDomain = new Map<string, string>();
    for (const [dom, files] of domainFiles.entries()) {
      for (const f of files) {
        fileToDomain.set(f, dom);
      }
    }

    let changed = true;
    let iterations = 0;
    while (changed && iterations < 10) {
      changed = false;
      iterations++;

      const microDomains: string[] = [];
      for (const [dom, files] of domainFiles.entries()) {
        if (files.length < minDomainSize) {
          microDomains.push(dom);
        }
      }

      if (microDomains.length === 0) break;

      for (const micro of microDomains) {
        const files = domainFiles.get(micro);
        if (!files || files.length === 0) {
          domainFiles.delete(micro);
          continue;
        }

        // Calculate coupling with other domains
        const couplingScores = new Map<string, number>();
        for (const f of files) {
          const outgoing = fileOutgoing.get(f) || new Set();
          for (const target of outgoing) {
            const targetDom = fileToDomain.get(target);
            if (targetDom && targetDom !== micro) {
              couplingScores.set(targetDom, (couplingScores.get(targetDom) || 0) + 1);
            }
          }

          // Incoming edges from target to f
          for (const [src, tgts] of fileOutgoing.entries()) {
            if (tgts.has(f)) {
              const srcDom = fileToDomain.get(src);
              if (srcDom && srcDom !== micro) {
                couplingScores.set(srcDom, (couplingScores.get(srcDom) || 0) + 1);
              }
            }
          }
        }

        // Find candidate domain with highest coupling
        let bestTarget: string | null = null;
        let bestScore = 0;

        for (const [otherDom, score] of couplingScores.entries()) {
          if (score > bestScore) {
            bestScore = score;
            bestTarget = otherDom;
          }
        }

        // If no strong coupling found, fallback to ambient domain
        if (!bestTarget || bestScore === 0) {
          bestTarget = AMBIENT_TOOL_DOMAINS.has(micro) ? 'tools' : 'core';
        }

        if (bestTarget !== micro) {
          const targetFiles = domainFiles.get(bestTarget) || [];
          targetFiles.push(...files);
          domainFiles.set(bestTarget, targetFiles);
          domainFiles.delete(micro);

          for (const f of files) {
            fileToDomain.set(f, bestTarget);
          }
          changed = true;
        }
      }
    }

    // Step 3: Build final DomainInfo records
    const domains = new Map<string, DomainInfo>();

    for (const [domainName, files] of domainFiles.entries()) {
      if (files.length === 0) continue;

      const modules: DomainModuleInfo[] = [];
      const externalDeps = new Set<string>();

      let topHub = files[0];
      let maxScore = -1;

      for (const f of files) {
        const inDeg = inDegreeMap.get(f) || 0;
        const outDeg = outDegreeMap.get(f) || 0;
        const baseName = path.basename(f);

        let hubScore = inDeg * 2 + outDeg;
        if (
          baseName.startsWith('index.') ||
          baseName.startsWith('engine.') ||
          baseName.startsWith('router.') ||
          baseName.startsWith('portal.')
        ) {
          hubScore += 20;
        }

        if (hubScore > maxScore) {
          maxScore = hubScore;
          topHub = f;
        }

        const symbols = fileSymbols.get(f) || [];
        const rawDeps = Array.from(fileOutgoing.get(f) || []);
        const filteredDeps: string[] = [];

        for (const dep of rawDeps) {
          const depDomain = fileToDomain.get(dep);
          if (depDomain && depDomain !== domainName) {
            externalDeps.add(depDomain);
            filteredDeps.push(dep);
          } else if (depDomain === domainName && dep !== f) {
            filteredDeps.push(path.basename(dep));
          }
        }

        modules.push({
          filePath: f,
          sidecarPath: fs.existsSync(`${f}.md`) ? `${f}.md` : undefined,
          exportedSymbols: Array.from(new Set(symbols)).slice(0, 8),
          dependencies: Array.from(new Set(filteredDeps)).slice(0, 6),
          isHub: false,
          inDegree: inDeg,
          outDegree: outDeg,
        });
      }

      for (const m of modules) {
        if (m.filePath === topHub) {
          m.isHub = true;
        }
      }

      modules.sort((a, b) => (b.isHub ? 1 : 0) - (a.isHub ? 1 : 0) || b.inDegree - a.inDegree);

      const title =
        COMMON_DOMAIN_TITLES[domainName.toLowerCase()] ||
        `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain`;

      domains.set(domainName, {
        name: domainName,
        title,
        hubFile: topHub,
        modules,
        externalDependencies: Array.from(externalDeps).sort(),
        dependents: [],
      });
    }

    // Step 4: Calculate dependents across domains
    for (const [dName, dInfo] of domains.entries()) {
      for (const depName of dInfo.externalDependencies) {
        if (domains.has(depName)) {
          domains.get(depName)!.dependents.push(dName);
        }
      }
    }

    return domains;
  }

  /**
   * Fallback domain discovery directly from the filesystem.
   */
  private async discoverDomainsFromFilesystem(): Promise<Map<string, DomainInfo>> {
    const domains = new Map<string, DomainInfo>();
    const specsDir = path.join(this.rootDir, this.config?.paths.specs_dir || 'src');

    if (!fs.existsSync(specsDir)) {
      return domains;
    }

    const entries = await fs.promises.readdir(specsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const domainName = entry.name;
        const subFiles = await fs.promises.readdir(path.join(specsDir, domainName));
        const codeFiles = subFiles
          .filter((f) => /\.(ts|js|py|go|rs)$/.test(f) && !f.endsWith('.test.ts'))
          .map((f) => `${this.config?.paths.specs_dir || 'src'}/${domainName}/${f}`);

        if (codeFiles.length === 0) continue;

        const hubFile =
          codeFiles.find(
            (f) =>
              f.includes('index.') ||
              f.includes('engine.') ||
              f.includes('router.') ||
              f.includes('portal.'),
          ) ||
          codeFiles[0] ||
          `${this.config?.paths.specs_dir || 'src'}/${domainName}/index.ts`;

        const title =
          COMMON_DOMAIN_TITLES[domainName.toLowerCase()] ||
          `${domainName.charAt(0).toUpperCase() + domainName.slice(1)} Domain`;

        domains.set(domainName, {
          name: domainName,
          title,
          hubFile,
          modules: codeFiles.map((cf) => ({
            filePath: cf,
            sidecarPath: fs.existsSync(`${cf}.md`) ? `${cf}.md` : undefined,
            exportedSymbols: [],
            dependencies: [],
            isHub: cf === hubFile,
            inDegree: 0,
            outDegree: 0,
          })),
          externalDependencies: [],
          dependents: [],
        });
      }
    }

    return domains;
  }

  /**
   * Generates a single domain context map document adhering to ADR-001.
   * Does non-destructive synchronization to preserve human-authored sections.
   */
  public async generateDomainMap(
    domain: DomainInfo,
    domainsDir: string,
    options: { force?: boolean } = {},
  ): Promise<string> {
    await fs.promises.mkdir(domainsDir, { recursive: true });
    const targetFile = path.join(domainsDir, `${domain.name}-domain-map.md`);

    let existingPurpose: string | undefined;
    let existingInvariants: string[] | undefined;
    let customSections: string[] = [];

    if (fs.existsSync(targetFile) && !options.force) {
      try {
        const existingContent = await fs.promises.readFile(targetFile, 'utf8');
        existingPurpose = this.extractSection(
          existingContent,
          '## Domain Purpose & Responsibilities',
        );
        const invSection = this.extractSection(existingContent, '## Domain Invariants');
        if (invSection) {
          existingInvariants = invSection
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.startsWith('-'));
        }

        // Extract all custom user sections (not generated by Stubs)
        customSections = this.extractCustomSections(existingContent);
      } catch {
        // Ignore read error
      }
    }

    const purposeText =
      existingPurpose ||
      domain.purpose ||
      `The ${domain.title} coordinates domain logic, core types, and services for the ${domain.name} subsystem.`;

    const invariants = existingInvariants ||
      domain.invariants || [
        `- Downward dependencies only: cross-domain calls must target canonical domain hubs.`,
        `- External consumers must interface through ${path.basename(domain.hubFile)}, never private internal helpers.`,
        `- State changes must adhere to lifecycle and containment invariants.`,
      ];

    const lines: string[] = [];
    lines.push(`---`);
    lines.push(`title: ${domain.title} — Domain Context Map`);
    lines.push(`type: domain-context-map`);
    lines.push(`domain: ${domain.name}`);
    lines.push(`parent_map: ../context-map.md`);
    lines.push(
      `description: Deep-dive context map for the ${domain.name} domain, subsystem responsibilities, and internal modules.`,
    );
    lines.push(`tags:`);
    lines.push(`  - domain-map`);
    lines.push(`  - ${domain.name}`);
    lines.push(`  - agent-optimized`);
    lines.push(`---`);
    lines.push(``);
    lines.push(`# ${domain.title} — Domain Context Map`);
    lines.push(``);
    lines.push(`Parent Context Map: knowledge/architecture/context-map.md`);
    lines.push(``);
    lines.push(`## Domain Purpose & Responsibilities`);
    lines.push(purposeText);
    lines.push(``);
    lines.push(`## Key Modules & Files`);

    if (domain.modules.length === 0) {
      lines.push(`${domain.hubFile} -> deps: none | caps: entrypoint`);
    } else {
      for (const mod of domain.modules) {
        const hubTag = mod.isHub ? ' (Hub)' : '';
        const depsStr = mod.dependencies.length > 0 ? mod.dependencies.join(', ') : 'none';
        const capsStr =
          mod.exportedSymbols.length > 0 ? mod.exportedSymbols.join(', ') : 'internal';
        lines.push(`${mod.filePath}${hubTag} -> deps: ${depsStr} | caps: ${capsStr}`);
      }
    }
    lines.push(``);

    lines.push(`## Domain Invariants`);
    for (const inv of invariants) {
      lines.push(inv);
    }
    lines.push(``);

    if (customSections.length > 0) {
      for (const sec of customSections) {
        lines.push(sec);
        lines.push(``);
      }
    }

    const content = lines.join('\n');
    await fs.promises.writeFile(targetFile, content, 'utf8');
    return targetFile;
  }

  /**
   * Generates all discovered domain maps as a prerequisite to context-map.md,
   * pruning all obsolete domain maps that were merged or deleted.
   */
  public async generateAllDomainMaps(
    domainsDir: string,
    options: { force?: boolean } = {},
  ): Promise<Map<string, DomainInfo>> {
    const domains = await this.discoverDomains();
    const activeFiles = new Set<string>();

    for (const domain of domains.values()) {
      if (domain.name === 'general') continue;
      const targetPath = await this.generateDomainMap(domain, domainsDir, options);
      activeFiles.add(path.basename(targetPath));
    }

    // Clean up obsolete micro-domain maps
    if (fs.existsSync(domainsDir)) {
      const files = await fs.promises.readdir(domainsDir);
      for (const f of files) {
        if (f.endsWith('-domain-map.md') && !activeFiles.has(f)) {
          try {
            await fs.promises.unlink(path.join(domainsDir, f));
          } catch {
            // Ignore error
          }
        }
      }
    }

    return domains;
  }

  /**
   * Synthesizes the root context-map.md directly from generated domain maps.
   */
  public async generateContextMap(
    domains: Map<string, DomainInfo>,
    rootMapFile: string,
    _options: { force?: boolean } = {},
  ): Promise<string> {
    const lines: string[] = [];
    lines.push(`---`);
    lines.push(`title: Project Architecture Context Map`);
    lines.push(`type: context-map`);
    lines.push(
      `description: High-level architectural map of core domains, subsystem responsibilities, and dependency flows.`,
    );
    lines.push(`tags:`);
    lines.push(`  - architecture`);
    lines.push(`  - context-map`);
    lines.push(`  - agent-optimized`);
    lines.push(`---`);
    lines.push(``);
    lines.push(`# Architecture Context Map`);
    lines.push(``);
    lines.push(`## Routing & Entrypoints`);

    const coreDomain = domains.get('core') || domains.get('cli');
    if (coreDomain) {
      for (const mod of coreDomain.modules.slice(0, 3)) {
        lines.push(`Entry (Layer 0): ${mod.filePath} -> domain: ${coreDomain.name}`);
      }
    } else {
      lines.push(`Entry (Layer 0): src/index.ts -> main entrypoint`);
    }
    lines.push(``);

    lines.push(`## Subsystem Matrix`);
    const sortedDomains = Array.from(domains.values())
      .filter((d) => d.name !== 'general')
      .sort((a, b) => b.modules.length - a.modules.length);

    let layerCounter = 1;
    for (const d of sortedDomains) {
      const caps = d.modules.flatMap((m) => m.exportedSymbols).slice(0, 4);
      const capsStr = caps.length > 0 ? caps.join(', ') : 'subsystem services';
      const depsStr =
        d.externalDependencies.length > 0 ? d.externalDependencies.slice(0, 4).join(', ') : 'none';
      lines.push(
        `${d.title} (L${layerCounter++}): ${d.hubFile} -> deps: ${depsStr} | caps: ${capsStr}`,
      );
    }
    lines.push(``);

    lines.push(`## Domain Maps & Specs`);
    for (const d of sortedDomains) {
      lines.push(
        `- ${d.name}: knowledge/architecture/domains/${d.name}-domain-map.md (hub: ${d.hubFile})`,
      );
    }
    lines.push(``);

    lines.push(`## Boundary Invariants`);
    lines.push(
      `- Downward dependencies only: consumers depend on lower layers, never higher layers.`,
    );
    lines.push(
      `- Cross-domain calls must target the domain canonical hub module, never internal private helpers.`,
    );
    lines.push(
      `- Repo-level architectural decisions recorded in knowledge/architecture/ADR/. Module nuances recorded in domain maps and sidecars.`,
    );
    lines.push(``);

    lines.push(`## Visual Architecture Map`);
    lines.push(
      `Human visual Mermaid diagrams: knowledge/architecture/visual-map.md (agents: do not read unless requested)`,
    );
    lines.push(``);

    const content = lines.join('\n');
    await fs.promises.writeFile(rootMapFile, content, 'utf8');
    return rootMapFile;
  }

  private extractSection(content: string, header: string): string | undefined {
    const idx = content.indexOf(header);
    if (idx === -1) return undefined;
    const rest = content.slice(idx + header.length);
    const nextHeaderIdx = rest.search(/\n##\s+/);
    const body = nextHeaderIdx === -1 ? rest : rest.slice(0, nextHeaderIdx);
    return body.trim();
  }

  private extractCustomSections(content: string): string[] {
    const standardHeaders = new Set([
      '## Domain Purpose & Responsibilities',
      '## Key Modules & Files',
      '## Domain Invariants',
    ]);
    const sections: string[] = [];
    const parts = content.split(/\n(?=##\s+)/);

    for (const part of parts) {
      if (part.startsWith('## ')) {
        const headerLine = part.split('\n')[0].trim();
        if (!standardHeaders.has(headerLine)) {
          sections.push(part.trim());
        }
      }
    }

    return sections;
  }
}
