#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

const bundlePath = path.resolve(__dirname, '../dist/index.cjs');

if (!fs.existsSync(bundlePath)) {
  try {
    const { execSync } = require('child_process');
    execSync('npm run build', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });
  } catch (err) {
    console.error('Failed to build @wiltermood/stubs CLI bundle:', err);
    process.exit(1);
  }
}

require(bundlePath);
