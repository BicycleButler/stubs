import * as fs from 'fs';
import * as path from 'path';

export const STUBS_MANAGED_START = '<!-- stubs-instructions-start -->';
export const STUBS_MANAGED_END = '<!-- stubs-instructions-end -->';

export interface SyncAgentsDocOptions {
  projectName?: string;
  force?: boolean;
}

export interface SyncAgentsDocResult {
  filePath: string;
  created: boolean;
  updated: boolean;
  preservedSections: string[];
}

/**
 * Resolves the path to the repository's agents instructions file.
 * Prioritizes existing AGENTS.md, then agents.md, or defaults to AGENTS.md.
 */
export function resolveAgentsPath(targetDir: string): string {
  try {
    if (fs.existsSync(targetDir)) {
      const entries = fs.readdirSync(targetDir);
      if (entries.includes('agents.md') && !entries.includes('AGENTS.md')) {
        return path.join(targetDir, 'agents.md');
      }
      if (entries.includes('AGENTS.md')) {
        return path.join(targetDir, 'AGENTS.md');
      }
    }
  } catch {
    // directory might not be readable or exist yet
  }
  return path.join(targetDir, 'AGENTS.md');
}

/**
 * Formats markdown content strictly according to ADR-001 standards:
 * - Rule 1: No decorative syntax or multi-byte emojis
 * - Rule 4: Telegraphic phrasing
 * - Rule 5: Strict 2-space indentation and single blank lines
 */
export function formatAccordingToAdr001(content: string): string {
  // Rule 1: Strip multi-byte decorative emojis
  let formatted = content.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

  // Rule 1: Strip box-drawing ASCII art
  formatted = formatted.replace(/[┌┐└┘├┤─│]/g, '');

  // Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // Rule 5: Normalize 4-space list indentations to 2 spaces
  formatted = formatted.replace(/^ {4}- /gm, '  - ');
  formatted = formatted.replace(/^ {4}\* /gm, '  - ');

  // Rule 5: Make sure that single blank line between logical sections (no \n\n\n+)
  formatted = formatted.replace(/\n{3,}/g, '\n\n');

  // Trim trailing whitespace per line
  formatted = formatted
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n');

  // Make sure that single trailing newline
  return formatted.trim() + '\n';
}

/**
 * Audits markdown content for ADR-001 compliance and returns `any` violations found.
 */
export function auditAdr001Compliance(content: string): string[] {
  const violations: string[] = [];
  if (/\|\s*:?-+:?\s*\|/.test(content)) {
    violations.push(
      'Markdown table delimiters detected. ADR-001 Rule 2 recommends compact delimited records.',
    );
  }
  if (/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(content)) {
    violations.push('Multi-byte emojis detected. ADR-001 Rule 1 prohibits decorative emojis.');
  }
  if (/```mermaid/i.test(content)) {
    violations.push(
      'Embedded Mermaid diagram detected. ADR-001 Rule 7 requires decoupling visual diagrams.',
    );
  }
  if (/[┌┐└┘├┤─│]/.test(content)) {
    violations.push(
      'Box-drawing ASCII art detected. ADR-001 Rule 1 prohibits decorative line art.',
    );
  }
  return violations;
}

/**
 * Generates the ADR-001 compliant Stubs instructions block for an agent instruction file.
 */
export function generateStubsInstructionBlock(targetDir: string, _projectName?: string): string {
  const lines: string[] = [];

  // Check specs dir from config if present
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

  // 1. Architecture Context Maps — Read First
  lines.push('## Architecture Context Maps — Read First');
  lines.push('');
  lines.push('Agent entry point: knowledge/architecture/context-map.md');
  lines.push('Repo ADRs: knowledge/architecture/ADR/');
  lines.push(`Module specs: co-located \`*.ts.md\` sidecars in \`${specsDir}/\`.`);
  lines.push('');

  // 2. Architecture Graph & GraphRAG Intelligence
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

  // 3. CLI Commands
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

/**
 * Synchronizes the repository's AGENTS.md (or agents.md) file:
 * - Applies ADR-001 formatting and documentation standards.
 * - Updates the stubs instructions within sentinel boundaries.
 * - Preserves all user-defined sections, conventions, and toolchain rules.
 */
export async function syncAgentsDoc(
  targetDir: string,
  options: SyncAgentsDocOptions = {},
): Promise<SyncAgentsDocResult> {
  const filePath = resolveAgentsPath(targetDir);
  const projectName =
    options.projectName ||
    (fs.existsSync(path.join(targetDir, 'package.json'))
      ? (() => {
          try {
            return JSON.parse(fs.readFileSync(path.join(targetDir, 'package.json'), 'utf8')).name;
          } catch {
            return path.basename(targetDir);
          }
        })()
      : path.basename(targetDir));

  const stubsBlock = generateStubsInstructionBlock(targetDir, projectName);
  const preservedSections: string[] = [];

  // Case 1: File does not exist -> Create new file with starter structure
  if (!fs.existsSync(filePath)) {
    const defaultContent =
      `# ${projectName} — Agent Instructions\n\n` +
      `${STUBS_MANAGED_START}\n${stubsBlock}\n${STUBS_MANAGED_END}\n\n` +
      `## Toolchain & Conventions\n\n` +
      `- Package manager: npm (npx for binaries)\n` +
      `- Testing framework: jest\n` +
      `- Linter: eslint\n` +
      `- Formatter: prettier\n` +
      `- Design principles: adhere to DESIGN_PHILOSOPHY.md (deep modules, pull complexity downward, code cohesion)\n`;

    const formatted = formatAccordingToAdr001(defaultContent);
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, formatted, 'utf8');

    return {
      filePath,
      created: true,
      updated: false,
      preservedSections: ['Toolchain & Conventions'],
    };
  }

  // Case 2: File exists -> Parse and merge non-destructively
  const existingContent = await fs.promises.readFile(filePath, 'utf8');

  let finalContent: string;

  if (
    existingContent.includes(STUBS_MANAGED_START) &&
    existingContent.includes(STUBS_MANAGED_END)
  ) {
    // Already has sentinel markers: replace inner block, preserve pre and post
    let pre = existingContent.slice(0, existingContent.indexOf(STUBS_MANAGED_START)).trimEnd();
    let post = existingContent
      .slice(existingContent.indexOf(STUBS_MANAGED_END) + STUBS_MANAGED_END.length)
      .trimStart();

    // Clean duplicate sentinels and legacy blocks
    pre = pre.replace(/<!--\s*(?:stubs|tale)-instructions-(?:start|end)\s*-->/g, '').trimEnd();
    post = post.replace(/<!--\s*(?:stubs|tale)-instructions-(?:start|end)\s*-->/g, '').trimStart();
    post = post.replace(
      /\n*<!-- tale-instructions-start -->[\s\S]*?<!-- tale-instructions-end -->/g,
      '',
    );
    post = post.replace(
      /\n*## (?:ASD-STE100[^\n]*|TALE[^\n]*|Tale[^\n]*)[\s\S]*?(?=\n##\s+|$)/g,
      '',
    );

    // Collect preserved section names
    const preHeaders = (pre.match(/^##\s+[^\n]+/gm) || []).map((h) =>
      h.replace(/^##\s+/, '').trim(),
    );
    const postHeaders = (post.match(/^##\s+[^\n]+/gm) || []).map((h) =>
      h.replace(/^##\s+/, '').trim(),
    );
    preservedSections.push(...preHeaders, ...postHeaders);

    finalContent = `${pre}\n\n${STUBS_MANAGED_START}\n${stubsBlock}\n${STUBS_MANAGED_END}\n\n${post}`;
  } else {
    // Migration: Existing file without sentinel comments. Parse by sections.
    const cleanContent = existingContent
      .replace(/<!--\s*(?:stubs|tale)-instructions-(?:start|end)\s*-->/g, '')
      .replace(/\n*<!-- stubs-hook-guard -->[\s\S]*?(?=\n##|$)/g, '')
      .replace(/\n*<!-- tale-instructions-start -->[\s\S]*?<!-- tale-instructions-end -->/g, '')
      .replace(/\n*## (?:ASD-STE100[^\n]*|TALE[^\n]*|Tale[^\n]*)[\s\S]*?(?=\n##\s+|$)/g, '');

    const parts = cleanContent.split(/\n(?=##\s+)/);
    const preamble = parts[0].trim();
    const customSections: string[] = [];
    const customCommands: string[] = [];

    const STUBS_SECTION_PREFIXES = [
      'Planning Hub & 5-Phase Lifecycle',
      'Planning Hub',
      'Architecture Context Maps',
      'Architecture Graph & GraphRAG Intelligence',
      'Architecture Knowledge Graph Guidance',
      'ASD-STE100 Technical English & Formatting',
      'ASD-STE100',
    ];

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      const headerLine = part
        .split('\n')[0]
        .replace(/^##\s+/, '')
        .trim();

      const isStubsSection = STUBS_SECTION_PREFIXES.some((prefix) =>
        headerLine.toLowerCase().startsWith(prefix.toLowerCase()),
      );

      if (isStubsSection) {
        // Handled by new Stubs block
        continue;
      }

      if (headerLine.toLowerCase() === 'cli commands') {
        // Separate custom repository commands from stubs commands
        const lines = part.split('\n').slice(1);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('-') && !trimmed.includes('stubs') && !trimmed.includes('tale')) {
            customCommands.push(trimmed);
          }
        }
        continue;
      }

      if (headerLine.toLowerCase() === 'project commands') {
        // If legacy project commands was just stubs commands, skip it
        const lines = part.split('\n').slice(1);
        const nonStubsLines = lines.filter((l) => {
          const t = l.trim();
          return t.startsWith('-') && !t.includes('stubs') && !t.includes('tale');
        });
        if (nonStubsLines.length === 0) {
          continue;
        }
      }

      // Preserve custom user section
      customSections.push(part);
      preservedSections.push(headerLine);
    }

    // If there were custom commands from the previous CLI Commands section, preserve them
    if (customCommands.length > 0) {
      const toolchainIdx = customSections.findIndex(
        (s) => s.startsWith('## Toolchain & Conventions') || s.startsWith('## Toolchain'),
      );
      if (toolchainIdx !== -1) {
        customSections[toolchainIdx] += '\n' + customCommands.join('\n');
      } else {
        customSections.push(`## Project Commands\n\n${customCommands.join('\n')}`);
        preservedSections.push('Project Commands');
      }
    }

    const customText = customSections.length > 0 ? '\n\n' + customSections.join('\n\n') : '';
    finalContent = `${preamble}\n\n${STUBS_MANAGED_START}\n${stubsBlock}\n${STUBS_MANAGED_END}${customText}`;
  }

  const formatted = formatAccordingToAdr001(finalContent);
  await fs.promises.writeFile(filePath, formatted, 'utf8');

  return {
    filePath,
    created: false,
    updated: true,
    preservedSections,
  };
}
