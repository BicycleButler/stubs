import { QueryEngine } from '../src/query/engine';
import { GraphEngine } from '../src/graph/engine';
import { VirtualFileSystem, WasmSqliteDriver } from '../src/storage';
import { GraphNode, GraphEdge } from '../src/graph/topology';

describe('QueryEngine Multi-Tier Progressive Disclosure & Pruning', () => {
  let vfs: VirtualFileSystem;
  let dbDriver: WasmSqliteDriver;
  let graphEngine: GraphEngine;
  let queryEngine: QueryEngine;

  beforeEach(async () => {
    vfs = new VirtualFileSystem();
    dbDriver = new WasmSqliteDriver({ fsDriver: vfs, dbPath: ':memory:' });
    graphEngine = new GraphEngine({ fsDriver: vfs, dbDriver, dbPath: ':memory:' });
    await graphEngine.initialize();
    queryEngine = new QueryEngine({ graphEngine, fsDriver: vfs });
  });

  afterEach(async () => {
    await graphEngine.close();
  });

  it('handles Level 0 Macro Map queries (map:) with cluster & hub summaries', async () => {
    const nodes: GraphNode[] = [
      { id: 'src/core/hub.ts', file_path: 'src/core/hub.ts', kind: 'file', domain: 'core' },
      { id: 'src/core/service.ts', file_path: 'src/core/service.ts', kind: 'file', domain: 'core' },
      { id: 'src/api/routes.ts', file_path: 'src/api/routes.ts', kind: 'file', domain: 'api' },
    ];
    const edges: GraphEdge[] = [
      {
        source_id: 'src/api/routes.ts',
        target_id: 'src/core/hub.ts',
        relation: 'calls',
        confidence: 'EXTRACTED',
      },
      {
        source_id: 'src/core/service.ts',
        target_id: 'src/core/hub.ts',
        relation: 'calls',
        confidence: 'EXTRACTED',
      },
    ];

    await graphEngine.upsertGraphNodes(nodes);
    await graphEngine.upsertGraphEdges(edges);

    const result = await queryEngine.query('map:', { skipAutoSync: true });
    expect(result.surgicalKind).toBe('map');
    expect(result.macroMapResult).toBeDefined();
    expect(result.summaryText).toContain('Level 0: Macro Architecture Map');
    expect(result.summaryText).toContain('Total Files');
    expect(result.approxTokens).toBeLessThan(400); // Strict token budget adherence
  });

  it('handles Level 1 Skeleton Stub queries (stub:) returning stripped signatures', async () => {
    await vfs.writeFile(
      'src/auth/jwt.ts',
      `
export interface TokenPayload {
  userId: string;
}

export class JwtManager {
  private secret: string = 'key';

  public verify(token: string): TokenPayload | null {
    if (!token) return null;
    return { userId: '123' };
  }
}
`,
    );

    const nodes: GraphNode[] = [
      { id: 'src/auth/jwt.ts', file_path: 'src/auth/jwt.ts', kind: 'file', domain: 'auth' },
    ];
    await graphEngine.upsertGraphNodes(nodes);

    const result = await queryEngine.query('stub: src/auth/jwt.ts', { skipAutoSync: true });
    expect(result.surgicalKind).toBe('stub');
    expect(result.skeletonResult).toBeDefined();
    expect(result.summaryText).toContain('Interface Skeleton Stub: `src/auth/jwt.ts`');
    expect(result.summaryText).toContain('export interface TokenPayload');
    expect(result.summaryText).toContain(
      'public verify(token: string): TokenPayload | null { /* ... */ }',
    );
    expect(result.summaryText).not.toContain("return { userId: '123' }");
    expect(result.approxTokens).toBeLessThan(350);
  });

  it('handles Monorepo Package Scoping queries (pkg:<name> <query>)', async () => {
    await vfs.writeFile(
      'pnpm-workspace.yaml',
      `packages:
  - 'packages/*'
`,
    );

    await vfs.writeFile('packages/auth/package.json', JSON.stringify({ name: '@stubs/auth' }));
    await vfs.writeFile(
      'packages/billing/package.json',
      JSON.stringify({ name: '@stubs/billing' }),
    );

    const nodes: GraphNode[] = [
      {
        id: 'packages/auth/src/index.ts',
        file_path: 'packages/auth/src/index.ts',
        kind: 'file',
        domain: 'auth',
      },
      {
        id: 'packages/billing/src/index.ts',
        file_path: 'packages/billing/src/index.ts',
        kind: 'file',
        domain: 'billing',
      },
    ];
    await graphEngine.upsertGraphNodes(nodes);

    const result = await queryEngine.query('pkg:@stubs/auth index', { skipAutoSync: true });
    expect(result.packageScope).toBe('@stubs/auth');
    // Result seeds must only match auth package
    expect(result.seedNodes.every((s) => s.startsWith('packages/auth'))).toBe(true);
  });

  it('performs Centrality-Guided Pruning collapsing secondary nodes when exceeding budget', async () => {
    // Build a graph with 1 central hub and 15 leaf helpers
    const nodes: GraphNode[] = [
      { id: 'src/core/hub.ts', file_path: 'src/core/hub.ts', kind: 'file', domain: 'core' },
    ];
    const edges: GraphEdge[] = [];

    for (let i = 0; i < 15; i++) {
      const leafId = `src/helpers/util_${i}.ts`;
      nodes.push({ id: leafId, file_path: leafId, kind: 'file', domain: 'helpers' });
      edges.push({
        source_id: 'src/core/hub.ts',
        target_id: leafId,
        relation: 'imports',
        confidence: 'EXTRACTED',
      });
    }

    await graphEngine.upsertGraphNodes(nodes);
    await graphEngine.upsertGraphEdges(edges);

    // Query with a tight budget
    const result = await queryEngine.query('hub', { budget: 400, skipAutoSync: true });
    expect(result.nodes.length).toBeGreaterThan(8);
    expect(result.summaryText).toContain('Key Architectural Nodes');
    expect(result.summaryText).toContain('Additional Context');
    expect(result.summaryText).toContain('internal helper symbols');
    expect(result.approxTokens).toBeLessThanOrEqual(450);
  });
});
