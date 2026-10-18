import * as fs from 'fs';
import * as path from 'path';
import {
  syncAgentsDoc,
  resolveAgentsPath,
  formatAccordingToAdr001,
  auditAdr001Compliance,
  STUBS_MANAGED_START,
  STUBS_MANAGED_END,
} from '../src/cli/agents-doc';

describe('AgentsDocSynchronizer & ADR-001 Enforcement', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.resolve(
      __dirname,
      'temp_agents_test_' + Math.random().toString(36).substring(7),
    );
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('resolveAgentsPath', () => {
    it('should default to AGENTS.md if neither exists', () => {
      const p = resolveAgentsPath(tempDir);
      expect(path.basename(p)).toBe('AGENTS.md');
    });

    it('should resolve existing AGENTS.md', () => {
      fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Existing');
      expect(resolveAgentsPath(tempDir)).toBe(path.join(tempDir, 'AGENTS.md'));
    });

    it('should resolve existing lowercase agents.md if AGENTS.md does not exist', () => {
      fs.writeFileSync(path.join(tempDir, 'agents.md'), '# Existing lowercase');
      expect(resolveAgentsPath(tempDir)).toBe(path.join(tempDir, 'agents.md'));
    });
  });

  describe('formatAccordingToAdr001 & auditAdr001Compliance', () => {
    it('should strip emojis and box-drawing characters and normalize multiple blank lines', () => {
      const input = `# Title\n\n\n\n🗺️ Overview\n┌───┐\n│box│\n└───┘\n- item 1\n    - sub item 2\n\n`;
      const formatted = formatAccordingToAdr001(input);
      expect(formatted).not.toContain('🗺️');
      expect(formatted).not.toContain('┌');
      expect(formatted).not.toContain('─');
      expect(formatted).not.toContain('\n\n\n');
      expect(formatted).toContain('  - sub item 2');

      const violations = auditAdr001Compliance(formatted);
      expect(violations).toHaveLength(0);
    });

    it('should detect table and mermaid violations in audit', () => {
      const badContent = `| Col1 | Col2 |\n| :--- | :--- |\n| A | B |\n\n\`\`\`mermaid\ngraph TD\n\`\`\``;
      const violations = auditAdr001Compliance(badContent);
      expect(violations.length).toBeGreaterThanOrEqual(2);
      expect(violations.some((v) => v.includes('table'))).toBe(true);
      expect(violations.some((v) => v.includes('Mermaid'))).toBe(true);
    });
  });

  describe('syncAgentsDoc on uninitialized repository', () => {
    it('should create a clean ADR-001 AGENTS.md file with sentinels', async () => {
      const result = await syncAgentsDoc(tempDir, { projectName: 'demo-repo' });
      expect(result.created).toBe(true);
      expect(fs.existsSync(result.filePath)).toBe(true);

      const content = fs.readFileSync(result.filePath, 'utf8');
      expect(content).toContain('# demo-repo — Agent Instructions');
      expect(content).toContain(STUBS_MANAGED_START);
      expect(content).toContain(STUBS_MANAGED_END);
      expect(content).toContain('## Planning Hub & 5-Phase Lifecycle');
      expect(content).toContain('## Architecture Context Maps — Read First');
      expect(content).toContain('## Architecture Graph & GraphRAG Intelligence');
      expect(content).toContain('## CLI Commands');
      expect(content).toContain('## Toolchain & Conventions');

      const violations = auditAdr001Compliance(content);
      expect(violations).toHaveLength(0);
    });
  });

  describe('syncAgentsDoc on existing file without sentinels (migration)', () => {
    it('should preserve custom user sections, toolchains, and custom commands', async () => {
      const initialContent = `# my-project — Agent Instructions

Custom preamble describing the repo.

## Toolchain & Conventions

- Package manager: pnpm
- Custom rule: always write tests

## Architecture Context Maps — Read First

Old obsolete context map text.

## CLI Commands

- Scan & Index Code Graph: old command
- Custom Command: pnpm test:e2e
- Deploy: pnpm deploy:prod

## Hermes Contextloop Integration

Contextloop orchestrator info here.
`;
      const agentsPath = path.join(tempDir, 'AGENTS.md');
      fs.writeFileSync(agentsPath, initialContent, 'utf8');

      const result = await syncAgentsDoc(tempDir, { projectName: 'my-project' });
      expect(result.created).toBe(false);
      expect(result.updated).toBe(true);
      expect(result.preservedSections).toContain('Toolchain & Conventions');
      expect(result.preservedSections).toContain('Hermes Contextloop Integration');

      const updated = fs.readFileSync(agentsPath, 'utf8');

      // Verify custom sections and content are preserved
      expect(updated).toContain('Custom preamble describing the repo.');
      expect(updated).toContain('## Toolchain & Conventions');
      expect(updated).toContain('- Package manager: pnpm');
      expect(updated).toContain('- Custom rule: always write tests');
      expect(updated).toContain('- Custom Command: pnpm test:e2e');
      expect(updated).toContain('- Deploy: pnpm deploy:prod');
      expect(updated).toContain('## Hermes Contextloop Integration');
      expect(updated).toContain('Contextloop orchestrator info here.');

      // Verify Stubs block is wrapped in sentinels
      expect(updated).toContain(STUBS_MANAGED_START);
      expect(updated).toContain(STUBS_MANAGED_END);
      expect(updated).toContain('## Planning Hub & 5-Phase Lifecycle');
      expect(updated).toContain('## Architecture Graph & GraphRAG Intelligence');

      // Verify ADR-001 compliance
      const violations = auditAdr001Compliance(updated);
      expect(violations).toHaveLength(0);
    });
  });

  describe('syncAgentsDoc on existing file with sentinels', () => {
    it('should update the stubs block and leave custom pre and post content completely intact', async () => {
      const initialContent = `# Pre-Title\n\nCustom Header\n\n${STUBS_MANAGED_START}\nOld Stubs Content\n${STUBS_MANAGED_END}\n\n## Custom Post Section\n\nCustom content preserved here.\n`;
      const agentsPath = path.join(tempDir, 'AGENTS.md');
      fs.writeFileSync(agentsPath, initialContent, 'utf8');

      await syncAgentsDoc(tempDir, { projectName: 'my-project' });
      const updated = fs.readFileSync(agentsPath, 'utf8');

      expect(updated).toContain('# Pre-Title');
      expect(updated).toContain('Custom Header');
      expect(updated).toContain('## Custom Post Section');
      expect(updated).toContain('Custom content preserved here.');
      expect(updated).not.toContain('Old Stubs Content');
      expect(updated).toContain('## Planning Hub & 5-Phase Lifecycle');

      const violations = auditAdr001Compliance(updated);
      expect(violations).toHaveLength(0);
    });
  });

  describe('syncAgentsDoc on existing lowercase agents.md', () => {
    it('should update existing agents.md without generating an unnecessary AGENTS.md', async () => {
      const initialContent = `# lowercase doc\n\n## Custom Section\n\nKept.`;
      const lowerPath = path.join(tempDir, 'agents.md');
      fs.writeFileSync(lowerPath, initialContent, 'utf8');

      const result = await syncAgentsDoc(tempDir, { projectName: 'my-project' });
      expect(result.filePath).toBe(lowerPath);
      expect(fs.existsSync(lowerPath)).toBe(true);
      expect(fs.readdirSync(tempDir)).toContain('agents.md');
      expect(fs.readdirSync(tempDir)).not.toContain('AGENTS.md');

      const updated = fs.readFileSync(lowerPath, 'utf8');
      expect(updated).toContain('## Custom Section');
      expect(updated).toContain(STUBS_MANAGED_START);
    });
  });

  describe('syncAgentsDoc with Tale skill present', () => {
    it('should include Tale CLI commands and ASD-STE100 instructions when Tale skill is detected', async () => {
      fs.mkdirSync(path.join(tempDir, '.agents/skills/tale'), { recursive: true });
      const result = await syncAgentsDoc(tempDir, { projectName: 'tale-repo' });
      const content = fs.readFileSync(result.filePath, 'utf8');

      expect(content).toContain('npx stubs tale');
      expect(content).toContain('npx stubs tale --fix');
      expect(content).toContain('ASD-STE100 Technical English & Formatting (Tale)');
      expect(content).toContain('Audit Language & Formatting');
      expect(content).toContain('Auto-Remediate Violations');
    });
  });
});
