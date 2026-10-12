import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GraphEngine } from '../src/graph/engine';
import { QueryEngine } from '../src/query/engine';
import { CliRouter } from '../src/cli/router';

describe('Unified Surgical Query (Q14 / Q9)', () => {
  let tmpDir: string;
  let dbPath: string;
  let configPath: string;
  let graphEngine: GraphEngine;
  let queryEngine: QueryEngine;

  beforeAll(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stubs-query-surgical-test-'));
    dbPath = path.join(tmpDir, 'graph.sqlite');
    configPath = path.join(tmpDir, 'stubs.config.json');

    fs.writeFileSync(
      configPath,
      JSON.stringify({
        paths: {
          db_path: dbPath,
          specs_dir: tmpDir,
        },
      }),
      'utf8',
    );

    graphEngine = new GraphEngine(dbPath);
    await graphEngine.initialize();

    // Populate test nodes and edges
    await graphEngine.upsertGraphNodes([
      {
        id: 'src/services/auth.ts#login',
        file_path: 'src/services/auth.ts',
        symbol_name: 'login',
        kind: 'function',
        domain: 'auth',
        lifecycle_phase: 'materialize',
      },
      {
        id: 'src/services/user.ts#getUser',
        file_path: 'src/services/user.ts',
        symbol_name: 'getUser',
        kind: 'function',
        domain: 'users',
        lifecycle_phase: 'materialize',
      },
      {
        id: 'src/db/client.ts#query',
        file_path: 'src/db/client.ts',
        symbol_name: 'query',
        kind: 'method',
        domain: 'database',
        lifecycle_phase: 'materialize',
      },
    ]);

    await graphEngine.upsertGraphEdges([
      {
        source_id: 'src/services/auth.ts#login',
        target_id: 'src/services/user.ts#getUser',
        relation: 'calls',
        confidence: 'EXTRACTED',
      },
      {
        source_id: 'src/services/user.ts#getUser',
        target_id: 'src/db/client.ts#query',
        relation: 'calls',
        confidence: 'EXTRACTED',
      },
    ]);

    queryEngine = new QueryEngine({ graphEngine });
  });

  afterAll(async () => {
    if (graphEngine) {
      await graphEngine.close();
    }
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('Prefix-based Surgical Routing', () => {
    test('should resolve "explain: <target>" prefix query', async () => {
      const res = await queryEngine.query('explain: login');
      expect(res.surgicalKind).toBe('explain');
      expect(res.explainResult).toBeDefined();
      expect(res.explainResult?.symbolName).toBe('login');
      expect(res.summaryText).toContain('Node Profile: src/services/auth.ts#login');
    });

    test('should resolve "path: <src> to <dst>" prefix query', async () => {
      const res = await queryEngine.query('path: login to query');
      expect(res.surgicalKind).toBe('path');
      expect(res.shortestPathResult).toBeDefined();
      expect(res.shortestPathResult?.totalHops).toBe(2);
      expect(res.summaryText).toContain(
        'Shortest Path: src/services/auth.ts#login -> src/db/client.ts#query',
      );
    });

    test('should resolve "blast: <target>" prefix query', async () => {
      const res = await queryEngine.query('blast: query');
      expect(res.surgicalKind).toBe('blast');
      expect(res.blastRadiusResult).toBeDefined();
      expect(res.blastRadiusResult?.totalAffected).toBeGreaterThanOrEqual(1);
      expect(res.summaryText).toContain('Blast Radius for src/db/client.ts#query');
    });
  });

  describe('Option Flag-based Surgical Routing', () => {
    test('should support explicit surgical options for explain', async () => {
      const res = await queryEngine.query('', {
        surgicalKind: 'explain',
        target: 'src/services/user.ts#getUser',
      });
      expect(res.surgicalKind).toBe('explain');
      expect(res.explainResult?.nodeId).toBe('src/services/user.ts#getUser');
    });

    test('should support explicit surgical options for path', async () => {
      const res = await queryEngine.query('', {
        surgicalKind: 'path',
        source: 'src/services/auth.ts#login',
        target: 'src/db/client.ts#query',
      });
      expect(res.surgicalKind).toBe('path');
      expect(res.shortestPathResult?.path).toEqual([
        'src/services/auth.ts#login',
        'src/services/user.ts#getUser',
        'src/db/client.ts#query',
      ]);
    });

    test('should support explicit surgical options for blast', async () => {
      const res = await queryEngine.query('', {
        surgicalKind: 'blast',
        target: 'src/services/auth.ts#login',
        depth: 2,
      });
      expect(res.surgicalKind).toBe('blast');
      expect(res.blastRadiusResult?.target).toBe('src/services/auth.ts#login');
    });
  });

  describe('CLI Router stubs query surgical flags & prefixes', () => {
    test('should execute stubs query with prefix string via CLI', async () => {
      const router = new CliRouter();
      const exitCode = await router.route(['query', 'explain: login', '--config', configPath]);
      expect(exitCode).toBe(0);
    });

    test('should execute stubs query --explain via CLI', async () => {
      const router = new CliRouter();
      const exitCode = await router.route(['query', '--explain', 'login', '--config', configPath]);
      expect(exitCode).toBe(0);
    });

    test('should execute stubs query --path via CLI', async () => {
      const router = new CliRouter();
      const exitCode = await router.route([
        'query',
        '--path',
        'login',
        'query',
        '--config',
        configPath,
      ]);
      expect(exitCode).toBe(0);
    });

    test('should execute stubs query --blast via CLI', async () => {
      const router = new CliRouter();
      const exitCode = await router.route(['query', '--blast', 'login', '--config', configPath]);
      expect(exitCode).toBe(0);
    });
  });
});
