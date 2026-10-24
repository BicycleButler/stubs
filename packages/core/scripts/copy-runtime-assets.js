#!/usr/bin/env node
/**
 * Copy the runtime assets the bundled CLI needs at execution time.
 *
 * `npm run build` produces a single esbuild bundle at
 * `.agents/skills/stubs/dist/cli.cjs` and mirrors to `dist/cli.cjs`.
 * Bundling inlines module *code*, but any dependency that reads a real
 * file off disk at runtime breaks, because the path it derives points
 * into the dist directory rather than node_modules.
 * Two dependencies do exactly that:
 *
 *   - sql.js  -> loads `sql-wasm.wasm`
 *   - typescript -> loads `lib.*.d.ts` (the standard library) through the compiler
 *     host's getDefaultLibLocation().
 *
 * The two are therefore staged next to the bundle in the two target dist locations.
 */
const fs = require('fs');
const path = require('path');

let repoRoot = path.resolve(__dirname, '../..');
if (
  !fs.existsSync(path.join(repoRoot, '.agents/skills/stubs')) &&
  fs.existsSync(path.resolve(__dirname, '../../..'))
) {
  repoRoot = path.resolve(__dirname, '../../..');
}
const pkgRoot = path.resolve(__dirname, '..');
const primaryDist = path.join(pkgRoot, 'dist');
const rootDist = path.join(repoRoot, 'dist');
const cliDist = path.join(repoRoot, 'packages/cli/dist');
const agentDist = path.join(repoRoot, '.agents/skills/stubs/dist');
const targetDirs = Array.from(new Set([primaryDist, rootDist, agentDist]));
const skillTargetDirs = Array.from(new Set([primaryDist, rootDist, agentDist, cliDist]));

for (const dir of targetDirs) {
  fs.mkdirSync(dir, { recursive: true });
}

// Mirror fresh cli.cjs bundle across target dist locations
const primaryBundle = path.join(primaryDist, 'cli.cjs');
if (fs.existsSync(primaryBundle)) {
  for (const dir of [rootDist, agentDist]) {
    const dest = path.join(dir, 'cli.cjs');
    if (path.resolve(primaryBundle) !== path.resolve(dest)) {
      fs.copyFileSync(primaryBundle, dest);
    }
  }
}

// Search candidate locations for sql-wasm.wasm
const sqlCandidates = [
  path.join(repoRoot, 'node_modules/sql.js/dist/sql-wasm.wasm'),
  path.join(repoRoot, '../sql.js/dist/sql-wasm.wasm'),
  path.join(repoRoot, '../../node_modules/sql.js/dist/sql-wasm.wasm'),
];
try {
  const resolvedSql = require.resolve('sql.js/dist/sql-wasm.wasm', {
    paths: [repoRoot, process.cwd()],
  });
  sqlCandidates.unshift(resolvedSql);
} catch {}
try {
  const sqlPkg = require.resolve('sql.js/package.json', { paths: [repoRoot, process.cwd()] });
  sqlCandidates.unshift(path.join(path.dirname(sqlPkg), 'dist/sql-wasm.wasm'));
} catch {}

const sqlWasmSrc = sqlCandidates.find((p) => fs.existsSync(p));

// Search candidate locations for typescript lib files
const tsCandidates = [
  path.join(repoRoot, 'node_modules/typescript/lib'),
  path.join(repoRoot, '../typescript/lib'),
  path.join(repoRoot, '../../node_modules/typescript/lib'),
];
try {
  const tsPkg = require.resolve('typescript/package.json', { paths: [repoRoot, process.cwd()] });
  tsCandidates.unshift(path.join(path.dirname(tsPkg), 'lib'));
} catch {}

const tsLibSrc = tsCandidates.find((p) => fs.existsSync(p));

// sql.js WebAssembly binary
if (sqlWasmSrc && fs.existsSync(sqlWasmSrc)) {
  for (const dir of targetDirs) {
    fs.copyFileSync(sqlWasmSrc, path.join(dir, 'sql-wasm.wasm'));
  }
} else {
  console.error(`sql-wasm.wasm not found in candidates: ${sqlCandidates.join(', ')}`);
  process.exit(1);
}

// TypeScript standard library declaration files.
const libFiles =
  tsLibSrc && fs.existsSync(tsLibSrc)
    ? fs.readdirSync(tsLibSrc).filter((name) => name.startsWith('lib') && name.endsWith('.d.ts'))
    : [];

if (libFiles.length === 0) {
  console.error(`No lib*.d.ts found in candidate typescript directories.`);
  process.exit(1);
}

for (const dir of targetDirs) {
  // Clean up legacy duplicate directory if present
  const tsLibDest = path.join(dir, 'typescript-lib');
  if (fs.existsSync(tsLibDest)) {
    fs.rmSync(tsLibDest, { recursive: true, force: true });
  }

  for (const name of libFiles) {
    const srcPath = path.join(tsLibSrc, name);
    fs.copyFileSync(srcPath, path.join(dir, name));
  }

  // lib.d.ts is the existence discriminator used by resolveDefaultLibLocation().
  if (!fs.existsSync(path.join(dir, 'lib.d.ts'))) {
    console.error(`lib.d.ts missing after copy in ${dir}`);
    process.exit(1);
  }
}

console.log(
  `Runtime assets staged: sql-wasm.wasm + ${libFiles.length} TypeScript lib files across ${targetDirs.length} dist folders.`,
);

// Template molds staging
const moldSrc = path.join(repoRoot, '.stubs/templates');
const molds = fs.existsSync(moldSrc)
  ? fs.readdirSync(moldSrc).filter((name) => name.endsWith('.tpl'))
  : [];

if (molds.length === 0) {
  console.error(`No *.tpl molds found in ${moldSrc}; \`stubs init\` would seed nothing.`);
  process.exit(1);
}

for (const dir of targetDirs) {
  const moldDest = path.join(dir, 'templates');
  fs.mkdirSync(moldDest, { recursive: true });
  for (const name of molds) {
    fs.copyFileSync(path.join(moldSrc, name), path.join(moldDest, name));
  }
}

console.log(`Template molds staged: ${molds.length} across ${targetDirs.length} dist folders.`);

// Stage agent skills into dist folders for standalone packaging
const skillsSrc = path.join(repoRoot, '.agents/skills/stubs');
if (fs.existsSync(skillsSrc)) {
  const skillEntries = fs.readdirSync(skillsSrc).filter((entry) => entry !== 'dist');
  for (const dir of skillTargetDirs) {
    const skillsDest = path.join(dir, 'skills');
    const stubsDest = path.join(dir, 'skills/stubs');
    fs.mkdirSync(skillsDest, { recursive: true });
    fs.mkdirSync(stubsDest, { recursive: true });
    for (const entry of skillEntries) {
      const srcItem = path.join(skillsSrc, entry);
      fs.cpSync(srcItem, path.join(skillsDest, entry), { recursive: true });
      fs.cpSync(srcItem, path.join(stubsDest, entry), { recursive: true });
    }
  }
}
const abstractGrillSrc = path.join(repoRoot, '.agents/skills/abstract-grill');
if (fs.existsSync(abstractGrillSrc)) {
  for (const dir of skillTargetDirs) {
    const dest = path.join(dir, 'skills/abstract-grill');
    fs.cpSync(abstractGrillSrc, dest, { recursive: true });
  }
}
console.log(`Agent skills staged across ${skillTargetDirs.length} dist folders.`);

// Stage web client assets
const webSrc = path.join(repoRoot, 'dist/web');
if (fs.existsSync(webSrc)) {
  for (const dir of targetDirs) {
    const webDest = path.join(dir, 'web');
    if (path.resolve(webSrc) !== path.resolve(webDest)) {
      fs.cpSync(webSrc, webDest, { recursive: true });
    }
  }
  console.log(`Web client assets staged across ${targetDirs.length} dist folders.`);
} else {
  console.warn(
    `[Warning] Web client assets not found at ${webSrc}; web portal UI may be incomplete.`,
  );
}
