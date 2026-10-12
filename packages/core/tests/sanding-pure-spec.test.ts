import * as fs from 'fs';
import * as path from 'path';
import { SandingEngine } from '../src/sanding/engine';

describe('SandingEngine Pure Spec & Declarative Document Handling (B1 Fix)', () => {
  const tempDir = path.resolve('tests/temp-sanding-pure-spec-test');
  const specFile = path.join(tempDir, 'routes.ts.md');
  const codeFile = path.join(tempDir, 'routes.ts');
  const indexDoc = path.join(tempDir, 'INDEX.md');

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    if (fs.existsSync(specFile)) fs.unlinkSync(specFile);
    if (fs.existsSync(codeFile)) fs.unlinkSync(codeFile);
    if (fs.existsSync(indexDoc)) fs.unlinkSync(indexDoc);
  });

  it('should cleanly handle pure spec sidecar without ## Implementation when paired code exists', async () => {
    // 1. Create source code file
    fs.writeFileSync(
      codeFile,
      `import { Router } from 'express';\nexport function setupRoutes(r: Router): void {}\n`,
      'utf8',
    );

    // 2. Create pure architectural spec (no ## Implementation block)
    const specContent = `---
title: Routes Spec
type: sidecar-spec
description: Pure architectural spec for routes
tags: [routes]
status: spec
version: 1
target_code_file: ./routes.ts
status_flag: clean
exports:
  - setupRoutes
depends_on: []
---

# Routes Spec

Pure declarative architectural contract describing the routes API.

## Interface Contracts

\`\`\`typescript
export function setupRoutes(r: Router): void;
\`\`\`
`;
    fs.writeFileSync(specFile, specContent, 'utf8');

    const engine = new SandingEngine();
    const result = await engine.syncFile(specFile);

    expect(result.status).not.toBe('error');
    expect(result.status).not.toBe('conflict');
    expect(result.targetCodeFile).toBe('./routes.ts');

    // Code file must remain intact and not corrupted
    const codeOnDisk = fs.readFileSync(codeFile, 'utf8');
    expect(codeOnDisk).toContain('export function setupRoutes');
  });

  it('should auto-clear false needs-human-review-resolution conflict flag on pure spec sidecars', async () => {
    fs.writeFileSync(codeFile, `export function calculate(): number { return 42; }\n`, 'utf8');

    const specContent = `---
title: Calc Spec
type: sidecar-spec
description: Calculator
tags: []
status: spec
version: 1
target_code_file: ./routes.ts
status_flag: needs-human-review-resolution
stale_details: "Conflict detected: Both sidecar and code files have been modified with structural AST differences."
---

# Calc Spec

## Interface

\`\`\`typescript
export function calculate(): number;
\`\`\`
`;
    fs.writeFileSync(specFile, specContent, 'utf8');

    const engine = new SandingEngine();
    const result = await engine.syncFile(specFile);

    expect(result.status).toBe('synced');
    expect(result.status).not.toBe('conflict');

    const updatedSpec = fs.readFileSync(specFile, 'utf8');
    expect(updatedSpec).toContain('status_flag: clean');
    expect(updatedSpec).not.toContain('needs-human-review-resolution');
  });

  it('should safely handle unmaterialized pure spec when target code file does not exist yet', async () => {
    const specContent = `---
title: Future Spec
type: sidecar-spec
description: Not yet materialized
tags: []
status: spec
version: 1
target_code_file: ./routes.ts
status_flag: clean
---

# Future Spec

Planned module.
`;
    fs.writeFileSync(specFile, specContent, 'utf8');

    const engine = new SandingEngine();
    const result = await engine.syncFile(specFile);

    expect(result.status).toBe('no_change');
    expect(result.direction).toBe('none');
    expect(result.error).toBeUndefined();
    expect(fs.existsSync(codeFile)).toBe(false);
  });

  it('should safely handle subsystem-index and pure architecture docs without error', async () => {
    const indexContent = `---
title: Subsystem Index
type: subsystem-index
description: Root architecture context map
tags: [index]
status: spec
version: 1
status_flag: clean
---

# Architecture Index

Overview map with diagrams.

\`\`\`
[A] -> [B] -> [C]
\`\`\`
`;
    fs.writeFileSync(indexDoc, indexContent, 'utf8');

    const engine = new SandingEngine();
    const result = await engine.syncFile(indexDoc);

    expect(result.status).toBe('no_change');
    expect(result.direction).toBe('none');
    expect(result.error).toBeUndefined();
  });
});
