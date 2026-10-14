import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import pc from 'picocolors';
import { runInteractiveTui } from './tui';
import { getAvailableSkills, installSkills } from './installer';
import { getAvailableMcpServers, registerMcpServer } from './mcp';

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  // If no args or 'init', launch TUI
  if (!command || command === 'init' || command === 'tui') {
    await runInteractiveTui();
    return;
  }

  if (command === 'list') {
    console.log(pc.bold('\nAvailable Skills & Governance Rules:'));
    const skills = getAvailableSkills();
    for (const [key, s] of Object.entries(skills)) {
      console.log(`  ${pc.cyan(pc.bold(key.padEnd(10)))} - ${s.description}`);
    }

    console.log(pc.bold('\nAvailable MCP Servers:'));
    const mcps = getAvailableMcpServers();
    for (const [key, m] of Object.entries(mcps)) {
      console.log(`  ${pc.cyan(pc.bold(key.padEnd(10)))} - ${m.description}`);
    }
    console.log('');
    return;
  }

  if (command === 'add') {
    const isGlobal = args.includes('--global') || args.includes('-g');
    const items = args.slice(1).filter((a) => !a.startsWith('-'));

    if (items.length === 0) {
      console.error(pc.red('Error: Specify one or more skills to add, e.g.:'));
      console.error('  npx stubs add tale design');
      console.error('  npx stubs add all');
      process.exit(1);
    }

    const available = getAvailableSkills();
    const skillsToInstall = items.includes('all') ? Object.keys(available) : items;

    console.log(
      pc.dim(`Installing ${skillsToInstall.join(', ')} (${isGlobal ? 'global' : 'workspace'})...`),
    );
    const res = installSkills({
      skills: skillsToInstall,
      target: isGlobal ? 'global' : 'local',
      installHooks: true,
    });

    if (res.installed.length > 0) {
      console.log(pc.green(`✓ Successfully installed: ${res.installed.join(', ')}`));
    }
    if (res.errors.length > 0) {
      for (const err of res.errors) {
        console.warn(pc.yellow(`⚠ ${err}`));
      }
    }
    return;
  }

  if (command === 'mcp' && args[1] === 'add') {
    const server = args[2];
    if (!server) {
      console.error(
        pc.red('Error: Specify an MCP server name to add, e.g. "npx stubs mcp add stubs"'),
      );
      process.exit(1);
    }
    const res = registerMcpServer(server);
    if (res.success) {
      console.log(pc.green(`✓ ${res.message}`));
    } else {
      console.error(pc.red(`✗ ${res.message}`));
      process.exit(1);
    }
    return;
  }

  if (command === 'tale' || command === 'lint:tale' || command === 'format:tale') {
    const taleArgs = process.argv.slice(3);
    if (command === 'format:tale' && !taleArgs.includes('--fix')) {
      taleArgs.unshift('--fix');
    }
    const candidatePaths = [
      path.resolve(__dirname, '../../tale/src/tale-lint.mjs'),
      path.resolve(process.cwd(), 'packages/tale/src/tale-lint.mjs'),
      path.resolve(process.cwd(), '.agents/skills/tale/scripts/tale-lint.mjs'),
      path.resolve(__dirname, '../../../packages/tale/src/tale-lint.mjs'),
    ];
    const scriptPath = candidatePaths.find((p) => fs.existsSync(p));
    if (scriptPath) {
      const res = spawnSync(process.execPath, [scriptPath, ...taleArgs], { stdio: 'inherit' });
      process.exit(res.status ?? 0);
    }
    console.error(
      pc.red('Error: Could not locate tale-lint.mjs. Make sure @wiltermood/tale is installed.'),
    );
    process.exit(1);
  }

  if (command === 'help' || command === '--help' || command === '-h') {
    console.log(`
${pc.bold('Stubs AI Agent Skills & Tools Hub')}

${pc.bold('Usage:')}
  stubs                     Launch interactive TUI
  stubs init                Guided project workspace setup
  stubs add <items...>      Install specific skills (e.g. tale, design, stubs, all)
  stubs list                List all available skills, rules, and MCP servers
  stubs mcp add <server>    Register an MCP server into .agents/mcp_config.json
  stubs tale [options]      Lint or format documentation & code comments (--fix)

${pc.bold('Flags:')}
  --global, -g              Install globally into ~/.gemini/config instead of local workspace

${pc.bold('Core Architecture Commands:')}
  stubs scan                Scan codebase and update AST graph
  stubs status              Check architecture and sidecar drift status
  stubs material            Materialize code from sidecars
  stubs sanding             Run bidirectional sync between specs and code
`);
    return;
  }

  // Fallback: Delegate to core stubs CLI engine if it's a core stubs command
  try {
    const path = require('path');
    const fs = require('fs');
    const coreCliPath = path.resolve(__dirname, '../../core/dist/cli.cjs');
    const legacyPath = path.resolve(__dirname, '../../../dist/cli.cjs');

    const enginePath = fs.existsSync(coreCliPath)
      ? coreCliPath
      : fs.existsSync(legacyPath)
        ? legacyPath
        : null;

    if (enginePath) {
      require(enginePath);
      return;
    }
  } catch {
    // fall through to unknown command
  }

  console.error(pc.red(`Unknown command: ${command}`));
  console.log('Run "stubs help" or "stubs" without arguments for the interactive menu.');
  process.exit(1);
}

main().catch((err) => {
  console.error(pc.red('Unexpected error:'), err);
  process.exit(1);
});
