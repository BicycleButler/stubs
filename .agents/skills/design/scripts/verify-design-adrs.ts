import fs from 'fs';
import path from 'path';

const WORKSPACE_ROOT = process.cwd();
const DESIGN_DIR = path.join(WORKSPACE_ROOT, 'knowledge', 'design');
const SKILL_MD = path.join(WORKSPACE_ROOT, 'SKILL.md');
const INDEX_MD = path.join(DESIGN_DIR, 'index.md');

let errors = 0;

function logError(msg) {
  console.error(`❌ [ERROR] ${msg}`);
  errors++;
}

function logSuccess(msg) {
  console.log(`✅ ${msg}`);
}

console.log('Validating Design ADR Corpus and Skill Integration...\n');

// 1. Check all ADR files in knowledge/design
if (!fs.existsSync(DESIGN_DIR)) {
  logError(`Directory not found: ${DESIGN_DIR}`);
  process.exit(1);
}

const adrFiles = fs.readdirSync(DESIGN_DIR).filter((f) => f.endsWith('.md') && f !== 'index.md');
logSuccess(`Found ${adrFiles.length} design ADR files.`);

// 2. Validate Frontmatter Status
adrFiles.forEach((file) => {
  const filePath = path.join(DESIGN_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  if (
    !content.includes('status: "active"') &&
    !content.includes("status: 'active'") &&
    !content.includes('status: active')
  ) {
    logError(`${file}: Frontmatter status is not active.`);
  }
});

// 3. Verify SKILL.md ADR references resolve to actual files
if (fs.existsSync(SKILL_MD)) {
  const skillContent = fs.readFileSync(SKILL_MD, 'utf8');
  const adrMatches = skillContent.matchAll(/ADR\s+(00\d{2})/g);
  const citedAdrs = new Set([...adrMatches].map((m) => m[1]));

  citedAdrs.forEach((adrNum) => {
    if (adrNum === '0015') return; // ADR 0015 lives in knowledge/architecture/adr/
    const found = adrFiles.some((f) => f.startsWith(adrNum));
    if (!found) {
      logError(`SKILL.md cites ADR ${adrNum}, but no matching file exists in knowledge/design/.`);
    }
  });
  logSuccess(`SKILL.md ADR citations verified against disk.`);
} else {
  logError(`SKILL.md not found at ${SKILL_MD}`);
}

// 4. Verify index.md ADR references resolve to actual files
if (fs.existsSync(INDEX_MD)) {
  const indexContent = fs.readFileSync(INDEX_MD, 'utf8');
  const indexMatches = indexContent.matchAll(/\[(00\d{2})[ -]/g);
  const indexAdrs = new Set([...indexMatches].map((m) => m[1]));

  indexAdrs.forEach((adrNum) => {
    if (adrNum === '0015') return; // ADR 0015 lives in knowledge/architecture/adr/
    const found = adrFiles.some((f) => f.startsWith(adrNum));
    if (!found) {
      logError(
        `index.md references ADR ${adrNum}, but no matching file exists in knowledge/design/.`,
      );
    }
  });
  logSuccess(`index.md ADR references verified against disk.`);
} else {
  logError(`index.md not found at ${INDEX_MD}`);
}

console.log('\n----------------------------------------');
if (errors > 0) {
  console.error(`Validation failed with ${errors} error(s).`);
  process.exit(1);
} else {
  console.log('All Design ADR freshness & link checks passed cleanly!');
}
