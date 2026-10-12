import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DomainEngine, DomainInfo } from '../src/graph/domain';
import { StubsConfig, DEFAULT_CONFIG } from '../src/config/schema';
import { GraphNode } from '../src/graph/engine';

describe('DomainEngine — Deliberate Clustering & Synchronization', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stubs-domain-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('matchesGlob correctly matches wildcards and double stars', () => {
    const engine = new DomainEngine(null, tmpDir);
    expect(engine.matchesGlob('src/lint/engine.ts', 'src/lint/**')).toBe(true);
    expect(engine.matchesGlob('src/lint/sub/nested.ts', 'src/lint/**')).toBe(true);
    expect(engine.matchesGlob('src/graph/engine.ts', 'src/lint/**')).toBe(false);
    expect(engine.matchesGlob('src/tools/foo.ts', 'src/*/*.ts')).toBe(true);
    expect(engine.matchesGlob('src/tools/nested/foo.ts', 'src/*/*.ts')).toBe(false);
  });

  test('deriveDomainForFile respects precedence: sidecar > config > graph > directory', () => {
    // 1. Setup sidecar with explicit domain
    const sidecarFile = path.join(tmpDir, 'src/custom/foo.ts.md');
    fs.mkdirSync(path.dirname(sidecarFile), { recursive: true });
    fs.writeFileSync(
      sidecarFile,
      `---
title: Custom Spec
domain: custom_sidecar_domain
---
# Spec
`,
      'utf8',
    );

    const testConfig: StubsConfig = {
      ...DEFAULT_CONFIG,
      architecture: {
        min_domain_size: 2,
        domains: {
          configured_domain: ['src/custom/**', 'src/override/**'],
        },
      },
    };

    const engine = new DomainEngine(null, tmpDir, testConfig);

    // Sidecar frontmatter wins over config
    expect(engine.deriveDomainForFile('src/custom/foo.ts')).toBe('custom_sidecar_domain');

    // Config wins when no sidecar frontmatter exists
    expect(engine.deriveDomainForFile('src/override/bar.ts')).toBe('configured_domain');

    // AST node domain wins over directory
    const mockNode: GraphNode = {
      id: 'src/other/baz.ts',
      file_path: 'src/other/baz.ts',
      kind: 'file',
      domain: 'ast_assigned_domain',
    };
    expect(engine.deriveDomainForFile('src/other/baz.ts', mockNode)).toBe('ast_assigned_domain');

    // Directory fallback
    expect(engine.deriveDomainForFile('src/billing/service.ts')).toBe('billing');

    // Root file fallback to core
    expect(engine.deriveDomainForFile('src/index.ts')).toBe('core');
  });

  test('non-destructive sync preserves custom human sections and invariants', async () => {
    const domainsDir = path.join(tmpDir, 'knowledge/architecture/domains');
    fs.mkdirSync(domainsDir, { recursive: true });
    const targetFile = path.join(domainsDir, 'custom-domain-map.md');

    const initialContent = `---
title: Custom Domain — Domain Context Map
type: domain-context-map
domain: custom
---

# Custom Domain — Domain Context Map

Parent Context Map: knowledge/architecture/context-map.md

## Domain Purpose & Responsibilities
Handcrafted domain mission and critical architectural decisions.

## Key Modules & Files
src/old/file.ts -> deps: none | caps: old_function

## Domain Invariants
- Handcrafted rule 1: Zero direct DB access outside repository layer.
- Handcrafted rule 2: All mutations emit audit event.

## Handcrafted Developer Notes
Important architectural context written by engineers that must never be deleted.
`;

    fs.writeFileSync(targetFile, initialContent, 'utf8');

    const engine = new DomainEngine(null, tmpDir);
    const domainInfo: DomainInfo = {
      name: 'custom',
      title: 'Custom Domain',
      hubFile: 'src/custom/index.ts',
      modules: [
        {
          filePath: 'src/custom/index.ts',
          exportedSymbols: ['newFunc1', 'newFunc2'],
          dependencies: ['src/storage/db.ts'],
          isHub: true,
          inDegree: 5,
          outDegree: 2,
        },
      ],
      externalDependencies: ['storage'],
      dependents: ['api'],
    };

    await engine.generateDomainMap(domainInfo, domainsDir, { force: false });

    const updatedContent = fs.readFileSync(targetFile, 'utf8');

    // Custom purpose preserved
    expect(updatedContent).toContain(
      'Handcrafted domain mission and critical architectural decisions.',
    );
    // Custom invariants preserved
    expect(updatedContent).toContain(
      '- Handcrafted rule 1: Zero direct DB access outside repository layer.',
    );
    expect(updatedContent).toContain('- Handcrafted rule 2: All mutations emit audit event.');
    // Custom developer notes preserved
    expect(updatedContent).toContain('## Handcrafted Developer Notes');
    expect(updatedContent).toContain(
      'Important architectural context written by engineers that must never be deleted.',
    );

    // Module inventory refreshed with fresh AST data
    expect(updatedContent).toContain('src/custom/index.ts (Hub)');
    expect(updatedContent).toContain('caps: newFunc1, newFunc2');
    expect(updatedContent).not.toContain('src/old/file.ts');
  });

  test('pruning cleans obsolete domain maps when domains are consolidated', async () => {
    const domainsDir = path.join(tmpDir, 'knowledge/architecture/domains');
    fs.mkdirSync(domainsDir, { recursive: true });

    fs.writeFileSync(path.join(domainsDir, 'obsolete-domain-map.md'), '# Obsolete', 'utf8');
    fs.writeFileSync(path.join(domainsDir, 'valid-domain-map.md'), '# Valid', 'utf8');

    const engine = new DomainEngine(null, tmpDir);
    // Mock discoverDomains returning only 'valid'
    jest.spyOn(engine, 'discoverDomains').mockResolvedValue(
      new Map([
        [
          'valid',
          {
            name: 'valid',
            title: 'Valid Domain',
            hubFile: 'src/valid/index.ts',
            modules: [],
            externalDependencies: [],
            dependents: [],
          },
        ],
      ]),
    );

    await engine.generateAllDomainMaps(domainsDir);

    expect(fs.existsSync(path.join(domainsDir, 'valid-domain-map.md'))).toBe(true);
    expect(fs.existsSync(path.join(domainsDir, 'obsolete-domain-map.md'))).toBe(false);
  });
});
