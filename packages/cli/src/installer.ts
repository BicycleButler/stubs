import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface InstallOptions {
  skills: string[]; // for example, ['tale', 'stubs']
  target: 'local' | 'global';
  targetDir?: string;
  installHooks?: boolean;
}

export interface SkillManifest {
  name: string;
  description: string;
  skillDir: string;
  rulesDir?: string;
  rootFiles?: { src: string; dest: string }[];
}

export function getRepositoryRoot(): string {
  // Try finding packages root
  let cur = __dirname;
  while (cur !== path.dirname(cur)) {
    if (
      fs.existsSync(path.join(cur, 'packages')) &&
      fs.existsSync(path.join(cur, 'package.json'))
    ) {
      return cur;
    }
    cur = path.dirname(cur);
  }
  return path.resolve(__dirname, '../../..');
}

export function getAvailableSkills(): Record<string, SkillManifest> {
  const repoRoot = getRepositoryRoot();
  return {
    tale: {
      name: 'tale',
      description: 'ASD-STE100 Issue 9 Simplified Technical English rules and linter',
      skillDir: path.join(repoRoot, 'packages/tale/skill'),
      rulesDir: path.join(repoRoot, 'packages/tale/rules'),
    },
    stubs: {
      name: 'stubs',
      description: 'Architecture-as-code planning and multi-language sidecar framework',
      skillDir: path.join(repoRoot, '.agents/skills/stubs'),
      rulesDir: path.join(repoRoot, 'RULES.md'),
    },
    'abstract-grill': {
      name: 'abstract-grill',
      description:
        'Stress-test architecture, abstractions, and deep modules with orthogonal paradigms',
      skillDir: path.join(repoRoot, '.agents/skills/abstract-grill'),
    },
  };
}

export function installSkills(options: InstallOptions): { installed: string[]; errors: string[] } {
  const repoRoot = getRepositoryRoot();
  const available = getAvailableSkills();
  const installed: string[] = [];
  const errors: string[] = [];

  const baseDir =
    options.target === 'global'
      ? path.join(os.homedir(), '.gemini/config')
      : path.resolve(options.targetDir || process.cwd());

  const skillsDestDir =
    options.target === 'global'
      ? path.join(baseDir, 'skills')
      : path.join(baseDir, '.agents/skills');

  const rulesDestDir =
    options.target === 'global' ? path.join(baseDir, 'rules') : path.join(baseDir, '.agents/rules');

  fs.mkdirSync(skillsDestDir, { recursive: true });
  fs.mkdirSync(rulesDestDir, { recursive: true });

  // Automatically co-install abstract-grill whenever stubs is installed
  const requestedSkills = [...options.skills];
  if (
    (requestedSkills.includes('stubs') || requestedSkills.includes('all')) &&
    !requestedSkills.includes('abstract-grill')
  ) {
    requestedSkills.push('abstract-grill');
  }

  for (const skillKey of requestedSkills) {
    const key = skillKey.toLowerCase();
    const manifest = available[key];
    if (!manifest) {
      errors.push(`Unknown skill: ${skillKey}`);
      continue;
    }

    try {
      // 1. Copy Skill directory
      const destSkillPath = path.join(skillsDestDir, manifest.name);
      let resolvedSkillDir = manifest.skillDir;
      if (!fs.existsSync(resolvedSkillDir)) {
        const fallbacks = [
          path.join(__dirname, 'skills', manifest.name),
          path.join(__dirname, '../skills', manifest.name),
          path.join(os.homedir(), '.gemini/config/skills', manifest.name),
          path.join(repoRoot, '.agents/skills', manifest.name),
        ];
        const found = fallbacks.find((p) => fs.existsSync(p));
        if (found) {
          resolvedSkillDir = found;
        }
      }

      if (fs.existsSync(resolvedSkillDir)) {
        fs.mkdirSync(destSkillPath, { recursive: true });
        copyRecursive(resolvedSkillDir, destSkillPath);
      } else {
        errors.push(`Could not locate source for skill: ${manifest.name}`);
      }

      // 2. Copy Rule files
      let resolvedRulesDir = manifest.rulesDir;
      if (resolvedRulesDir && !fs.existsSync(resolvedRulesDir)) {
        const fileName = path.basename(resolvedRulesDir);
        const fallbacks = [
          path.join(__dirname, 'rules', fileName),
          path.join(__dirname, '../rules', fileName),
          path.join(os.homedir(), '.gemini/config/rules', fileName),
        ];
        const found = fallbacks.find((p) => fs.existsSync(p));
        if (found) {
          resolvedRulesDir = found;
        }
      }

      if (resolvedRulesDir && fs.existsSync(resolvedRulesDir)) {
        if (fs.statSync(resolvedRulesDir).isDirectory()) {
          copyRecursive(resolvedRulesDir, rulesDestDir);
        } else {
          const fileName = path.basename(resolvedRulesDir);
          fs.copyFileSync(resolvedRulesDir, path.join(rulesDestDir, fileName));
        }
      }

      // 3. Copy Root files if local target
      if (options.target === 'local' && manifest.rootFiles) {
        for (const rf of manifest.rootFiles) {
          if (fs.existsSync(rf.src)) {
            const destPath = path.join(baseDir, rf.dest);
            fs.copyFileSync(rf.src, destPath);
          }
        }
      }

      installed.push(manifest.name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`Failed to install ${manifest.name}: ${msg}`);
    }
  }

  // 4. Optionally install hooks in local target
  if (options.target === 'local' && options.installHooks) {
    try {
      const hooksFile = path.join(baseDir, '.agents/hooks.json');
      const hooksConfig = {
        hooks: [
          {
            event: 'file_changed',
            command: 'npx --no-install stubs scan',
            description: 'Synchronizes AST architecture graph on source file changes',
          },
        ],
      };
      if (!fs.existsSync(hooksFile)) {
        fs.writeFileSync(hooksFile, JSON.stringify(hooksConfig, null, 2), 'utf-8');
      }
    } catch {
      // Ignore hook creation errors
    }
  }

  // 5. Update AGENTS.md if stubs or tale is installed or updated in local target
  if (
    options.target === 'local' &&
    (installed.includes('stubs') ||
      installed.includes('tale') ||
      installed.includes('abstract-grill'))
  ) {
    updateAgentsDoc(baseDir);
  }

  return { installed, errors };
}

export function generateStubsInstructionBlock(targetDir: string, _projectName?: string): string {
  let specsDir = 'src';
  const configPath = path.join(targetDir, '.stubs/config.json');
  if (fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (cfg.paths?.specs_dir) {
        specsDir = cfg.paths.specs_dir;
      }
    } catch {
      // Ignore config read error
    }
  }

  const lines: string[] = [];
  lines.push('## Architecture Context Maps — Read First');
  lines.push('');
  lines.push('Agent entry point: knowledge/architecture/context-map.md');
  lines.push('Repo ADRs: knowledge/architecture/ADR/');
  lines.push(`Module specs: co-located \`*.ts.md\` sidecars in \`${specsDir}/\`.`);
  lines.push('');
  lines.push('## Architecture Graph & GraphRAG Intelligence');
  lines.push('');
  lines.push(
    'AST dependency graph in `.stubs/graph.sqlite` with Louvain community detection, PageRank centrality, FTS5 BM25 hybrid search.',
  );
  lines.push('');
  lines.push(
    '- Querying GraphRAG: `npx stubs query "<query>"` (preferred single call, 3-tier progressive disclosure):',
  );
  lines.push(
    '  - `npx stubs query "map:"`: Level 0 Macro Map (subsystem communities, hubs, domains)',
  );
  lines.push(
    '  - `npx stubs query "stub: <target>"`: Level 1 Interface Skeleton Stubs (stripped signatures, types, line links)',
  );
  lines.push(
    '  - `npx stubs query "explain: <target>"`: Level 2 Symbol Profile (callers, callees, PageRank)',
  );
  lines.push('  - `npx stubs query "path: <A> to <B>"`: Level 2 Shortest dependency path chain');
  lines.push(
    '  - `npx stubs query "blast: <target>"`: Level 2 Downstream impact radius and dependents',
  );
  lines.push('  - `npx stubs query "pkg:<package> <query>"`: Monorepo package-scoped query');
  lines.push(
    '  - `npx stubs query "<concept>"`: Multi-hop token-budgeted GraphRAG context retrieval',
  );
  lines.push('- Model Context Protocol (MCP): connect through standard JSON-RPC 2.0 stdio:');
  lines.push('  ```json');
  lines.push('  {');
  lines.push('    "mcpServers": {');
  lines.push('      "stubs": {');
  lines.push('        "command": "node",');
  lines.push('        "args": [".agents/skills/stubs/dist/cli.cjs", "mcp"]');
  lines.push('      }');
  lines.push('    }');
  lines.push('  }');
  lines.push('  ```');
  lines.push(
    '  (or `"command": "npx", "args": ["stubs", "mcp"]`). Ultra-lean suite exposes `stubs_query` and `stubs_scan`.',
  );
  lines.push('- Monorepo & workspace boundary resolution:');
  lines.push(
    '  - Discovers package boundaries through `package.json` (`workspaces`), `pnpm-workspace.yaml`, `Cargo.toml` (`[workspace]`), `go.work`.',
  );
  lines.push(
    '  - Path aliases in `tsconfig.json` (`compilerOptions.paths`) and package exports map directly to canonical source files.',
  );
  lines.push(
    '  - Monorepo query prefix: `pkg:<package>` (for example, `npx stubs query "pkg:billing invoice"`).',
  );
  lines.push(
    '- Automatic graph maintenance: auto-checks file mtime (<30ms) for 0% staleness. Refresh manually through `npx stubs scan`.',
  );
  lines.push('');
  lines.push('## CLI Commands');
  lines.push('');
  lines.push('- Scan & Index Code Graph: `npx stubs scan`');
  lines.push('- Query GraphRAG Subgraph: `npx stubs query "<question>"`');
  lines.push(
    '- Unified Surgical Query: `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`',
  );
  lines.push('- Concrete Spec Grilling: `npx stubs grill <file.md>`');
  lines.push('- Abstract Architecture Grilling: `npx stubs abstract-grill <file.md>`');
  lines.push(
    '- Architecture Mapping: `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)',
  );
  lines.push('- Domain Maps Only: `npx stubs map --domains` | `npx stubs map --domain <name>`');
  lines.push('- Export Knowledge Graph: `npx stubs export <obsidian|wiki> [--out <dir>]`');
  lines.push('- Start MCP Stdio Server: `npx stubs mcp`');
  lines.push('- Install Assistant Rules: `npx stubs hook install`');
  lines.push('- Audit ASD-STE100 Compliance: `npx stubs tale`');
  lines.push('- Auto-Remediate Prose & Formatting: `npx stubs tale --fix`');

  return lines.join('\n');
}

export function updateAgentsDoc(targetDir: string): boolean {
  try {
    let targetFileName = 'AGENTS.md';
    let isNew = true;
    if (fs.existsSync(targetDir)) {
      const entries = fs.readdirSync(targetDir);
      if (entries.includes('agents.md') && !entries.includes('AGENTS.md')) {
        targetFileName = 'agents.md';
        isNew = false;
      } else if (entries.includes('AGENTS.md')) {
        targetFileName = 'AGENTS.md';
        isNew = false;
      }
    }
    const fullPath = path.join(targetDir, targetFileName);
    const stubsSection = generateStubsInstructionBlock(targetDir);

    if (isNew) {
      let projectName = path.basename(targetDir);
      try {
        const pkgPath = path.join(targetDir, 'package.json');
        if (fs.existsSync(pkgPath)) {
          projectName = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).name || projectName;
        }
      } catch {
        // Ignore package.json read error
      }
      const initialContent = `# ${projectName} — Agent Instructions\n\n${stubsSection}\n`;
      fs.writeFileSync(fullPath, initialContent, 'utf-8');
      return true;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');

    // Strip legacy tale instruction block
    content = content.replace(
      /\n*<!-- tale-instructions-start -->[\s\S]*?<!-- tale-instructions-end -->/g,
      '',
    );
    // Strip legacy standalone tale header and section
    content = content.replace(
      /\n*## (?:ASD-STE100[^\n]*|TALE[^\n]*|Tale[^\n]*)[\s\S]*?(?=\n##\s+|$)/g,
      '',
    );

    // If managed by stubs sentinels:
    if (content.includes('<!-- stubs-instructions-start -->')) {
      content = content.replace(
        /<!-- stubs-instructions-start -->[\s\S]*?<!-- stubs-instructions-end -->/,
        `<!-- stubs-instructions-start -->\n${stubsSection}\n<!-- stubs-instructions-end -->`,
      );
    } else {
      // Check if existing stubs sections are present (e.g. Architecture Context Maps, Planning Hub)
      const stubsRegex =
        /## (?:Architecture Context Maps|Planning Hub)[^\n]*[\s\S]*?(?=\n##\s+(?!(?:Architecture Graph|CLI Commands))|$)/;
      if (stubsRegex.test(content)) {
        content = content.replace(stubsRegex, stubsSection);
      } else if (content.includes('## CLI Commands')) {
        // Ensure stubs commands are in CLI Commands
        const commands = [
          '- Scan & Index Code Graph: `npx stubs scan`',
          '- Query GraphRAG Subgraph: `npx stubs query "<question>"`',
          '- Unified Surgical Query: `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`',
          '- Concrete Spec Grilling: `npx stubs grill <file.md>`',
          '- Abstract Architecture Grilling: `npx stubs abstract-grill <file.md>`',
          '- Architecture Mapping: `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)',
          '- Domain Maps Only: `npx stubs map --domains` | `npx stubs map --domain <name>`',
          '- Export Knowledge Graph: `npx stubs export <obsidian|wiki> [--out <dir>]`',
          '- Start MCP Stdio Server: `npx stubs mcp`',
          '- Install Assistant Rules: `npx stubs hook install`',
          '- Audit ASD-STE100 Compliance: `npx stubs tale`',
          '- Auto-Remediate Prose & Formatting: `npx stubs tale --fix`',
        ];
        for (const cmd of commands) {
          const key = cmd.split(':')[0];
          if (!content.includes(key)) {
            content = content.replace(/(## CLI Commands[\s\S]*?)(?=\n##|$)/, `$1\n${cmd}`);
          }
        }
      } else {
        content = content.trimEnd() + '\n\n' + stubsSection + '\n';
      }
    }

    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf-8');
    return true;
  } catch {
    return false;
  }
}

export function updateAgentsDocForTale(targetDir: string): boolean {
  return updateAgentsDoc(targetDir);
}

function copyRecursive(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}
