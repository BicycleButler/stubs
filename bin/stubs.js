#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const candidates = [
  path.resolve(__dirname, '../packages/cli/dist/index.cjs'),
  path.resolve(__dirname, '../packages/cli/bin/stubs.js'),
  path.resolve(__dirname, '../dist/cli.cjs'),
  path.resolve(__dirname, '../.agents/skills/stubs/dist/cli.cjs'),
];

let cliPath = candidates.find((p) => fs.existsSync(p));

if (!cliPath) {
  try {
    const { execSync } = require('child_process');
    execSync('npm run build:cli', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
    cliPath = candidates.find((p) => fs.existsSync(p));
  } catch (err) {
    console.error('Failed to build stubs bundle:', err);
    process.exit(1);
  }
}

if (!cliPath || !fs.existsSync(cliPath)) {
  console.error('Error: Could not locate stubs executable bundle in packages/cli/dist/');
  process.exit(1);
}

require(cliPath);
