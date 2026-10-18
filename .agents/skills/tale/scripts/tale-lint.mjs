#!/usr/bin/env node
/**
 * Backward-compatibility wrapper for tale-lint.mjs.
 * Delegates to canonical engine tale.mjs.
 */
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { runCLI } from './tale.mjs';

export * from './tale.mjs';

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runCLI(process.argv);
}
