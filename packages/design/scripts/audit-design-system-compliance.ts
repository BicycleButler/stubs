import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  line: number;
  rule: string;
  adr: string;
  severity: 'ERROR' | 'WARNING';
  snippet: string;
  description: string;
}

const TARGET_DIR = path.resolve(process.cwd(), process.argv[2] || 'src');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function auditFile(filePath: string): Violation[] {
  const relativePath = path.relative(process.cwd(), filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  const isModalOrDialog =
    content.includes('AlertDialog') ||
    content.includes('DialogContent') ||
    content.includes('DropdownMenu') ||
    content.includes('Popover');

  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // Rule 1: Badge Deprecation (ADR 0035)
    if (
      lineText.includes('@/components/ui/badge') ||
      lineText.includes('@/components/ui/Badge') ||
      /<Badge[\s/>]/.test(lineText)
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Badge Deprecation',
        adr: 'ADR 0035',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description:
          'Usage of deprecated Badge component. Replace with Concept C sub-label stacking or Concept A margin wash.',
      });
    }

    // Colored dots pattern (ADR 0035)
    if (
      /w-2\s+h-2\s+rounded-full\s+bg-/.test(lineText) ||
      /rounded-full\s+w-2\s+h-2/.test(lineText)
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Status Dot Deprecation',
        adr: 'ADR 0035',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Colored status dots are deprecated. Use Concept C sub-label stacking.',
      });
    }

    // Rule 2: Resting Destructive Action (ADR 0029, 0036)
    if (/<Button[^>]*variant=["']destructive["']/.test(lineText) && !isModalOrDialog) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Resting Destructive Button',
        adr: 'ADR 0029 / ADR 0036',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description:
          'Persistent destructive variant button on resting surface. Gate behind overflow menu (...) or AlertDialog.',
      });
    }

    // Rule 3: Static Semantic Alert Colors (ADR 0020)
    if (
      /(?:text|bg)-(?:red|amber|emerald|green)-(?:500|600|700|100|200)/.test(lineText) &&
      !lineText.includes('toast') &&
      !lineText.includes('error') &&
      !lineText.includes('invalid') &&
      !lineText.includes('reauth') &&
      !lineText.includes('hover:')
    ) {
      if (
        !relativePath.includes('chart') &&
        !relativePath.includes('calendar') &&
        !relativePath.includes('health')
      ) {
        violations.push({
          file: relativePath,
          line: lineNum,
          rule: 'Static Alert Colors',
          adr: 'ADR 0020',
          severity: 'WARNING',
          snippet: lineText.trim(),
          description:
            'Static alert color on resting UI element. Restrict colored alerts to transient states or active hover.',
        });
      }
    }

    // Rule 4: Arbitrary Spacing/Dimensions (ADR 0018)
    const arbitrarySpacingMatch = lineText.match(
      /(?:[pmp]|px|py|pl|pr|pt|pb|gap|space-x|space-y)-\[(\d+px)\]/,
    );
    if (arbitrarySpacingMatch) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Arbitrary Spacing Value',
        adr: 'ADR 0018',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: `Arbitrary spacing value ${arbitrarySpacingMatch[1]} used. Use 7-token scale (space-1 to space-12).`,
      });
    }

    // Rule 5: Font Size Cap > 24px (ADR 0019)
    if (
      /text-(?:3xl|4xl|5xl|6xl|7xl|8xl|9xl)/.test(lineText) &&
      !relativePath.includes('hero') &&
      !relativePath.includes('landing')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Font Size Exceeds Cap',
        adr: 'ADR 0019',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Font size exceeds strict application cap of 24px (text-2xl).',
      });
    }

    // Rule 6: Linear Easing / Invalid Duration (ADR 0022)
    if (/transition-[a-z-]*\s+linear/.test(lineText) || /ease-linear/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Linear Easing Banned',
        adr: 'ADR 0022',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Linear easing is strictly banned system-wide. Use cubic-bezier curves.',
      });
    }

    // Rule 6b: transition:all (ADR 0022 — forbidden pattern)
    if (/\btransition-all\b/.test(lineText) || /transition:\s*all/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'transition:all Banned',
        adr: 'ADR 0022',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description:
          '`transition: all` is a forbidden pattern — animates unintended properties. Use specific transition properties.',
      });
    }

    // Rule 6c: Explicit Resting Container Border (ADR 0041)
    if (
      /(?:<Card|<ContainerPanel)[^>]*className=["'][^"']*\b(?:border|border-border)\b/.test(
        lineText,
      ) &&
      !lineText.includes('border-dashed') &&
      !lineText.includes('border-primary') &&
      !lineText.includes('border-destructive') &&
      !lineText.includes('border-0')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Explicit Resting Container Border Banned',
        adr: 'ADR 0041',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description:
          'Explicit resting border on Card or ContainerPanel is deprecated. Resting containers are borderless by default and elevated via shadow.',
      });
    }

    if (
      /duration-(?:700|800|900|1000|1500|2000)/.test(lineText) &&
      !lineText.includes('animate-spin') &&
      !lineText.includes('pulse')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Transition Duration Budget Exceeded',
        adr: 'ADR 0022',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Transition duration exceeds strict cap of 500ms.',
      });
    }

    // Rule 7: Non-Lucide Icon Imports or Raw Unicode Emojis in JSX (ADR 0021)
    if (
      /import\s+.*from\s+['"](@heroicons|react-icons|@radix-ui\/react-icons)['"]/.test(lineText)
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Non-Lucide Icon Library',
        adr: 'ADR 0021',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description: 'Icon imported from non-Lucide library. Standardize on Lucide icons.',
      });
    }

    if (
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(lineText) &&
      !lineText.includes('//') &&
      !lineText.includes('/*')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Raw Emoji in Functional UI',
        adr: 'ADR 0021',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Raw unicode emoji used in functional UI. Replace with Lucide icon.',
      });
    }

    // Rule 8: Icon Button Missing aria-label (ADR 0023, 0029)
    if (
      /<Button[^>]*size=["'](?:icon|icon-sm|icon-lg)["'][^>]*>/.test(lineText) &&
      !lineText.includes('aria-label') &&
      !content
        .slice(Math.max(0, content.indexOf(lineText) - 50), content.indexOf(lineText) + 200)
        .includes('aria-label')
    ) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Icon Button Missing aria-label',
        adr: 'ADR 0023 / ADR 0029',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Icon-only button missing explicit aria-label attribute for accessibility.',
      });
    }

    // Rule 9: Non-Standard Fallback String (ADR 0030)
    if (/(?:\?\?|\|\|)\s*["'](?:N\/A|n\/a|None|null|-|Unknown)["']/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Non-Standard Unknown Fallback',
        adr: 'ADR 0030',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description: 'Fallback string should use standard em-dash ("—") for missing values.',
      });
    }

    // Rule 10: Zero Semantic Color at Rest (ADR 0036 §1)
    const hasSemanticColorAtRest =
      /\b(?:bg|text|border)-(?:destructive|success|warning)(?:-foreground)?\b/.test(lineText) &&
      !lineText.includes('hover:') &&
      !lineText.includes('group-hover:') &&
      !lineText.includes('data-[state') &&
      !lineText.includes('toast') &&
      !lineText.includes('Toast') &&
      !lineText.includes('AlertDialog') &&
      !lineText.includes('alert-dialog') &&
      !lineText.includes('invalid') &&
      !lineText.includes('error') &&
      !lineText.includes('validation');
    const isTransientOrAlertComponent =
      isModalOrDialog ||
      lineText.includes('animate-ping') ||
      relativePath.toLowerCase().includes('alert') ||
      relativePath.toLowerCase().includes('notification') ||
      relativePath.toLowerCase().includes('toast') ||
      relativePath.toLowerCase().includes('drawer') ||
      relativePath.toLowerCase().includes('modal') ||
      relativePath.toLowerCase().includes('popover') ||
      relativePath.toLowerCase().includes('utils');
    if (hasSemanticColorAtRest && !isTransientOrAlertComponent) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Semantic Color at Rest',
        adr: 'ADR 0036 §1',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description:
          'Semantic alert color (destructive/success/warning) on a resting surface. Only allowed in toasts, open AlertDialogs, blur-triggered form validation, or hover inside open overflow menus.',
      });
    }

    // Rule 11: Shadow outside 5-tier scale (ADR 0041)
    if (/shadow-\[.*?\]/.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Arbitrary Shadow Value',
        adr: 'ADR 0041',
        severity: 'WARNING',
        snippet: lineText.trim(),
        description:
          'Arbitrary shadow value used. Use 5-tier scale: shadow-xs, shadow-sm, shadow-md, shadow-lg, shadow-xl.',
      });
    }

    // Rule 12: Disabled Next Button in Multi-Step Wizard (ADR 0042 §3)
    if (/<Button[^>]*disabled=\{[^}]*invalid[^}]*\}[^>]*>.*Next/i.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Disabled Next Button in Wizard',
        adr: 'ADR 0042 §3',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description:
          'Next button must NEVER be disabled based on form invalidity. Allow click-to-validate to focus the first invalid field.',
      });
    }

    // Rule 13: Generic aria-label Placeholder (ADR 0023, ADR 0031)
    if (/aria-label=["'](?:Button action|button|click here|icon)["']/i.test(lineText)) {
      violations.push({
        file: relativePath,
        line: lineNum,
        rule: 'Generic aria-label Placeholder',
        adr: 'ADR 0023 / ADR 0031',
        severity: 'ERROR',
        snippet: lineText.trim(),
        description:
          'Generic aria-label placeholder used. Replace with explicit, verb-first description.',
      });
    }
  });

  return violations;
}

function runAudit() {
  const files = getAllFiles(TARGET_DIR);
  const relTargetDir = path.relative(process.cwd(), TARGET_DIR);
  console.log(`Auditing ${files.length} files in ${relTargetDir}...\n`);

  const scratchDir = path.resolve(process.cwd(), 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }

  const allViolations: Violation[] = [];
  const filesWithViolations = new Set<string>();

  files.forEach((file) => {
    const fileViolations = auditFile(file);
    if (fileViolations.length > 0) {
      filesWithViolations.add(file);
      allViolations.push(...fileViolations);
    }
  });

  // Group by directory path relative to src/
  const byDir: Record<string, Violation[]> = {};
  allViolations.forEach((v) => {
    const parts = v.file.split('/');
    const dir = parts.length > 2 ? parts.slice(1, 3).join('/') : parts[0] || 'root';
    if (!byDir[dir]) byDir[dir] = [];
    byDir[dir].push(v);
  });

  // Group by rule
  const byRule: Record<string, number> = {};
  allViolations.forEach((v) => {
    byRule[v.rule] = (byRule[v.rule] || 0) + 1;
  });

  const report = {
    targetDir: relTargetDir,
    totalFiles: files.length,
    filesWithViolationsCount: filesWithViolations.size,
    cleanFilesCount: files.length - filesWithViolations.size,
    totalViolations: allViolations.length,
    byRule,
    byDir: Object.keys(byDir).map((dir) => ({
      domain: dir,
      violationCount: byDir[dir].length,
      violations: byDir[dir],
    })),
    violations: allViolations,
  };

  fs.writeFileSync('scratch/design-audit-results.json', JSON.stringify(report, null, 2));

  // Generate Markdown summary
  let md = `# Design System Compliance Audit Report\n\n`;
  md += `**Date:** ${new Date().toISOString()}\n`;
  md += `**Target Directory:** \`${relTargetDir}\`\n`;
  md += `**Total Files Audited:** ${files.length}\n`;
  md += `**Clean Files:** ${files.length - filesWithViolations.size} (${files.length > 0 ? (((files.length - filesWithViolations.size) / files.length) * 100).toFixed(1) : 100}%)\n`;
  md += `**Files with Violations:** ${filesWithViolations.size}\n`;
  md += `**Total Violations Detected:** ${allViolations.length}\n\n`;

  md += `## Violation Breakdown by Rule\n\n`;
  md += `| Rule | ADR | Count |\n|---|---|---|\n`;
  Object.entries(byRule).forEach(([rule, count]) => {
    const adr = allViolations.find((v) => v.rule === rule)?.adr || '';
    md += `| ${rule} | ${adr} | ${count} |\n`;
  });

  md += `\n## Violation Breakdown by Directory\n\n`;
  md += `| Directory | Violations | Status |\n|---|---|---|\n`;
  Object.keys(byDir)
    .sort((a, b) => byDir[b].length - byDir[a].length)
    .forEach((dir) => {
      md += `| \`${dir}\` | ${byDir[dir].length} | ${byDir[dir].length > 0 ? '⚠️ Needs Review' : '✅ Compliant'} |\n`;
    });

  md += `\n## Detailed Violation Log\n\n`;
  allViolations.slice(0, 100).forEach((v) => {
    md += `- **[${v.severity}]** \`${v.file}:${v.line}\` — **${v.rule}** (${v.adr}): ${v.description}\n  \`\`\`tsx\n  ${v.snippet}\n  \`\`\`\n`;
  });

  if (allViolations.length > 100) {
    md += `\n*... and ${allViolations.length - 100} more violations logged in scratch/design-audit-results.json*\n`;
  }

  fs.writeFileSync('scratch/design-audit-report.md', md);
  console.log(`Audit complete! Summary written to scratch/design-audit-report.md`);
}

runAudit();
