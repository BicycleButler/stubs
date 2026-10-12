import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export interface InstallOptions {
  skills: string[]; // e.g. ['tale', 'design', 'stubs']
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
    design: {
      name: 'design',
      description: 'UI/UX design guidelines, token scales, and automated compliance tools',
      skillDir: path.join(repoRoot, 'packages/design/skill'),
      rulesDir: path.join(repoRoot, 'packages/design/rules'),
      rootFiles: [
        {
          src: path.join(repoRoot, 'packages/design/RULES.md'),
          dest: 'RULES.md',
        },
      ],
    },
    stubs: {
      name: 'stubs',
      description: 'Architecture-as-code planning and multi-language sidecar framework',
      skillDir: path.join(repoRoot, '.agents/skills/stubs'),
      rulesDir: path.join(repoRoot, 'RULES.md'),
    },
  };
}

export function installSkills(options: InstallOptions): { installed: string[]; errors: string[] } {
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

  for (const skillKey of options.skills) {
    const key = skillKey.toLowerCase();
    const manifest = available[key];
    if (!manifest) {
      errors.push(`Unknown skill: ${skillKey}`);
      continue;
    }

    try {
      // 1. Copy Skill directory
      const destSkillPath = path.join(skillsDestDir, manifest.name);
      if (fs.existsSync(manifest.skillDir)) {
        fs.mkdirSync(destSkillPath, { recursive: true });
        copyRecursive(manifest.skillDir, destSkillPath);
      }

      // 2. Copy Rule files
      if (manifest.rulesDir && fs.existsSync(manifest.rulesDir)) {
        if (fs.statSync(manifest.rulesDir).isDirectory()) {
          copyRecursive(manifest.rulesDir, rulesDestDir);
        } else {
          const fileName = path.basename(manifest.rulesDir);
          fs.copyFileSync(manifest.rulesDir, path.join(rulesDestDir, fileName));
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
            command: 'npx stubs scan',
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

  return { installed, errors };
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
