import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { GraphEngine } from '../src/graph/engine';

describe('Fast Incremental Scan via Filesystem mtime (Q10 / Q2)', () => {
  let tmpDir: string;
  let dbPath: string;
  let graphEngine: GraphEngine;

  beforeEach(async () => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stubs-scan-incremental-test-'));
    dbPath = path.join(tmpDir, 'graph.sqlite');

    graphEngine = new GraphEngine(dbPath);
    await graphEngine.initialize();
  });

  afterEach(async () => {
    if (graphEngine) {
      await graphEngine.close();
    }
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('should index source files on cold scan and record mtime_ms in file_meta', async () => {
    const fileA = path.join(tmpDir, 'serviceA.ts');
    fs.writeFileSync(fileA, 'export class ServiceA { run() {} }', 'utf8');

    const summary1 = await graphEngine.indexCodeWorkspace(tmpDir);
    expect(summary1.scanned).toBe(1);
    expect(summary1.indexed).toBe(1);
    expect(summary1.skipped).toBe(0);

    const rows = await (graphEngine as any).all(
      'SELECT file_path, file_hash, mtime_ms FROM file_meta;',
    );
    expect(rows.length).toBe(1);
    expect(rows[0].mtime_ms).toBeGreaterThan(0);
  });

  test('should skip unchanged source files on warm scan without re-indexing', async () => {
    const fileA = path.join(tmpDir, 'serviceA.ts');
    fs.writeFileSync(fileA, 'export class ServiceA { run() {} }', 'utf8');

    const summary1 = await graphEngine.indexCodeWorkspace(tmpDir);
    expect(summary1.indexed).toBe(1);

    // Warm scan: mtime is unchanged
    const summary2 = await graphEngine.indexCodeWorkspace(tmpDir);
    expect(summary2.scanned).toBe(1);
    expect(summary2.indexed).toBe(0);
    expect(summary2.skipped).toBe(1);
  });

  test('should re-index modified source files when content and mtime change', async () => {
    const fileA = path.join(tmpDir, 'serviceA.ts');
    fs.writeFileSync(fileA, 'export class ServiceA { run() {} }', 'utf8');

    await graphEngine.indexCodeWorkspace(tmpDir);

    // Wait slightly or update mtime to ensure stat detects modification
    const futureTime = new Date(Date.now() + 5000);
    fs.writeFileSync(fileA, 'export class ServiceA { run() { return 42; } }', 'utf8');
    fs.utimesSync(fileA, futureTime, futureTime);

    const summary2 = await graphEngine.indexCodeWorkspace(tmpDir);
    expect(summary2.scanned).toBe(1);
    expect(summary2.indexed).toBe(1);
    expect(summary2.skipped).toBe(0);
  });

  test('should force re-index when options.force is true', async () => {
    const fileA = path.join(tmpDir, 'serviceA.ts');
    fs.writeFileSync(fileA, 'export class ServiceA { run() {} }', 'utf8');

    await graphEngine.indexCodeWorkspace(tmpDir);

    const summary2 = await graphEngine.indexCodeWorkspace(tmpDir, { force: true });
    expect(summary2.scanned).toBe(1);
    expect(summary2.indexed).toBe(1);
    expect(summary2.skipped).toBe(0);
  });
});
