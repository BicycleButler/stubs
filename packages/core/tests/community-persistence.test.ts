import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GraphEngine } from '../src/graph/engine';
import { CliRouter } from '../src/cli/router';

describe('Louvain Community Persistence (Q4 / Q12)', () => {
  let tmpDir: string;
  let dbPath: string;
  let configPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stubs-comm-persistence-test-'));
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
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('should compute and persist Louvain community_id onto sidecar records upon stubs scan', async () => {
    // Create sidecars with interconnected dependencies
    const sidecarA = path.join(tmpDir, 'auth.ts.md');
    fs.writeFileSync(
      sidecarA,
      `---
title: Auth Service
type: sidecar-spec
description: Handles authentication
tags:
  - auth
status: spec
status_flag: clean
version: 1
target_code_file: ./auth.ts
depends_on:
  - ./token.ts
---

# Auth
`,
      'utf8',
    );

    const sidecarB = path.join(tmpDir, 'token.ts.md');
    fs.writeFileSync(
      sidecarB,
      `---
title: Token Service
type: sidecar-spec
description: Handles tokens
tags:
  - token
status: spec
status_flag: clean
version: 1
target_code_file: ./token.ts
---

# Token
`,
      'utf8',
    );

    const codeA = path.join(tmpDir, 'auth.ts');
    fs.writeFileSync(
      codeA,
      `import { verify } from './token';\nexport function login() { verify(); }`,
      'utf8',
    );

    const codeB = path.join(tmpDir, 'token.ts');
    fs.writeFileSync(codeB, `export function verify() { return true; }`, 'utf8');

    const router = new CliRouter();
    const exitCode = await router.route(['scan', tmpDir, '--config', configPath]);
    expect(exitCode).toBe(0);

    const graphEngine = new GraphEngine(dbPath);
    await graphEngine.initialize();

    const rows = await (graphEngine as any).all(
      'SELECT file_path, community_id, community_label FROM sidecars;',
    );

    expect(rows.length).toBeGreaterThanOrEqual(2);
    for (const r of rows) {
      expect(r.community_id).toBeDefined();
      expect(r.community_label).toBeDefined();
    }

    await graphEngine.close();
  });
});
