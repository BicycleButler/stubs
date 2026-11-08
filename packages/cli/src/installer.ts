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
    'auto-abstract-grill': {
      name: 'auto-abstract-grill',
      description:
        'Autonomously execute abstract-grilling decision loop, update planning, and implement code',
      skillDir: path.join(repoRoot, '.agents/skills/auto-abstract-grill'),
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

  // Automatically co-install abstract-grill and auto-abstract-grill whenever stubs is installed
  const requestedSkills = [...options.skills];
  if (
    (requestedSkills.includes('stubs') || requestedSkills.includes('all')) &&
    !requestedSkills.includes('abstract-grill')
  ) {
    requestedSkills.push('abstract-grill');
  }
  if (
    (requestedSkills.includes('stubs') || requestedSkills.includes('all')) &&
    !requestedSkills.includes('auto-abstract-grill')
  ) {
    requestedSkills.push('auto-abstract-grill');
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
    'AST dependency graph in `.stubs/graph.sqlite`. Query via `npx stubs query "<query>"`:'
  );
  lines.push('- `map:`: Level 0 Macro Map (subsystem communities, hubs, domains)');
  lines.push(
    '- `stub: <target>`: Level 1 Interface Skeleton Stubs (stripped signatures, types, line links)'
  );
  lines.push('- `explain: <target>`: Level 2 Symbol Profile (callers, callees, PageRank)');
  lines.push('- `path: <A> to <B>`: Shortest dependency path chain');
  lines.push('- `blast: <target>`: Downstream impact radius and dependents');
  lines.push('- `pkg:<package> <query>`: Monorepo package-scoped query');
  lines.push(
    '- **Automatic Graph Maintenance:** Auto-checks file mtime (<30ms). Refresh and synchronize via `npx stubs run`.'
  );
  lines.push('');
  lines.push('## Core CLI Commands');
  lines.push('');
  lines.push(
    '- **Unified Repository Pipeline:** `npx stubs run` (runs scan, map, sand, lint-arch & automated tale remediation)'
  );
  lines.push(
    '- **GraphRAG Surgical Query:** `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`'
  );
  lines.push(
    '- **Architecture Mapping:** `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)'
  );
  lines.push(
    '- **Spec & Architecture Grilling:** `npx stubs grill <file.md>` | `npx stubs abstract-grill <file.md>`'
  );
  lines.push('- **Export Knowledge Graph:** `npx stubs export <obsidian|wiki> [--out <dir>]`');

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
      } else if (content.includes('## CLI Commands') || content.includes('## Core CLI Commands')) {
        // Ensure stubs commands are in CLI Commands
        const commands = [
          '- **Unified Repository Pipeline:** `npx stubs run` (runs scan, map, sand, lint-arch & automated tale remediation)',
          '- **GraphRAG Surgical Query:** `npx stubs query "explain: <target>"` | `path: <A> to <B>` | `blast: <target>`',
          '- **Architecture Mapping:** `npx stubs map --generate` (refreshes prerequisite domain maps + root context-map.md)',
          '- **Spec & Architecture Grilling:** `npx stubs grill <file.md>` | `npx stubs abstract-grill <file.md>`',
          '- **Export Knowledge Graph:** `npx stubs export <obsidian|wiki> [--out <dir>]`',
        ];
        for (const cmd of commands) {
          const key = cmd.split(':')[0];
          if (!content.includes(key)) {
            content = content.replace(/(## (?:Core )?CLI Commands[\s\S]*?)(?=\n##|$)/, `$1\n${cmd}`);
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
