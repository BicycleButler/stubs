import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { updateAgentsDocForTale, installSkills } from '../dist/index.cjs';

test('updateAgentsDocForTale on uninitialized repository', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-test-'));
  try {
    const success = updateAgentsDocForTale(tempDir);
    assert.strictEqual(success, true);
    const content = fs.readFileSync(path.join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('npx stubs tale'));
    assert.ok(content.includes('npx stubs tale --fix'));
    assert.ok(content.includes('## Architecture Context Maps — Read First'));
    assert.ok(content.includes('## Architecture Graph & GraphRAG Intelligence'));
    assert.strictEqual(content.includes('ASD-STE100 Technical English & Formatting (Tale)'), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('updateAgentsDocForTale on existing lowercase agents.md', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-test-'));
  try {
    fs.writeFileSync(
      path.join(tempDir, 'agents.md'),
      '# Existing Project\n\n## CLI Commands\n- Build: npm run build\n',
      'utf-8',
    );
    const success = updateAgentsDocForTale(tempDir);
    assert.strictEqual(success, true);
    const content = fs.readFileSync(path.join(tempDir, 'agents.md'), 'utf-8');
    assert.ok(content.includes('npx stubs tale'));
    assert.ok(content.includes('npx stubs tale --fix'));
    assert.strictEqual(content.includes('ASD-STE100 Technical English & Formatting (Tale)'), false);
    assert.strictEqual(fs.readdirSync(tempDir).includes('AGENTS.md'), false);
    assert.strictEqual(fs.readdirSync(tempDir).includes('agents.md'), true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('installSkills updates AGENTS.md when tale is installed locally', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-test-'));
  try {
    fs.writeFileSync(path.join(tempDir, 'AGENTS.md'), '# Base Project\n', 'utf-8');
    const res = installSkills({
      skills: ['tale'],
      target: 'local',
      targetDir: tempDir,
    });
    assert.ok(res.installed.includes('tale'));
    assert.ok(fs.existsSync(path.join(tempDir, '.agents/skills/tale/SKILL.md')));
    const content = fs.readFileSync(path.join(tempDir, 'AGENTS.md'), 'utf-8');
    assert.ok(content.includes('npx stubs tale'));
    assert.ok(content.includes('npx stubs tale --fix'));
    assert.ok(content.includes('## Architecture Context Maps — Read First'));
    assert.strictEqual(content.includes('ASD-STE100 Technical English & Formatting (Tale)'), false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('installSkills co-installs abstract-grill when stubs is requested', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'installer-stubs-test-'));
  try {
    const res = installSkills({
      skills: ['stubs'],
      target: 'local',
      targetDir: tempDir,
    });
    assert.ok(res.installed.includes('stubs'));
    assert.ok(res.installed.includes('abstract-grill'));
    assert.ok(fs.existsSync(path.join(tempDir, '.agents/skills/stubs/SKILL.md')));
    assert.ok(fs.existsSync(path.join(tempDir, '.agents/skills/abstract-grill/SKILL.md')));
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
