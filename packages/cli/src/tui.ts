import * as p from '@clack/prompts';
import pc from 'picocolors';
import { getAvailableSkills, installSkills } from './installer';
import { getAvailableMcpServers, registerMcpServer } from './mcp';

export async function runInteractiveTui(): Promise<void> {
  console.clear();

  p.intro(`${pc.bgCyan(pc.black(' STUBS '))} ${pc.bold('AI Agent Skills & Tools Hub')}`);

  const availableSkills = getAvailableSkills();
  const skillChoices = Object.values(availableSkills).map((s) => ({
    value: s.name,
    label: pc.bold(s.name),
    hint: s.description,
  }));

  const selectedSkills = (await p.multiselect({
    message: 'Select skills and rules to install into your project:',
    options: skillChoices,
    initialValues: ['tale', 'stubs'],
    required: false,
  })) as string[];

  if (p.isCancel(selectedSkills)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  const target = (await p.select({
    message: 'Select installation destination:',
    options: [
      {
        value: 'local',
        label: 'Current Workspace',
        hint: './.agents/skills and ./.agents/rules',
      },
      {
        value: 'global',
        label: 'Global Agent Directory',
        hint: '~/.gemini/config/skills and ~/.gemini/config/rules',
      },
    ],
    initialValue: 'local',
  })) as 'local' | 'global';

  if (p.isCancel(target)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  let installHooks = false;
  if (target === 'local' && selectedSkills.includes('stubs')) {
    const hooksPrompt = await p.confirm({
      message: 'Enable automated AST background scanning hook in .agents/hooks.json?',
      initialValue: true,
    });
    if (p.isCancel(hooksPrompt)) {
      p.cancel('Installation cancelled.');
      process.exit(0);
    }
    installHooks = Boolean(hooksPrompt);
  }

  const availableMcps = getAvailableMcpServers();
  const mcpChoices = Object.values(availableMcps).map((m) => ({
    value: m.name,
    label: pc.bold(m.name),
    hint: m.description,
  }));

  const selectedMcps = (await p.multiselect({
    message: 'Select MCP servers to register (optional):',
    options: mcpChoices,
    required: false,
  })) as string[];

  if (p.isCancel(selectedMcps)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  const spinner = p.spinner();
  spinner.start('Installing selected components...');

  const result = installSkills({
    skills: selectedSkills,
    target,
    installHooks,
  });

  if (target === 'local' && selectedMcps.length > 0) {
    for (const mcp of selectedMcps) {
      registerMcpServer(mcp);
    }
  }

  if (result.errors.length > 0) {
    spinner.stop(pc.yellow('Completed with warnings'));
    for (const err of result.errors) {
      p.log.warn(err);
    }
  } else {
    spinner.stop(pc.green('Installation complete!'));
  }

  const summary = [
    `Skills: ${pc.cyan(result.installed.join(', ') || 'none')}`,
    `Target: ${pc.cyan(target === 'local' ? 'Workspace (./.agents)' : 'Global (~/.gemini/config)')}`,
  ];
  if (selectedMcps.length > 0) {
    summary.push(`MCP Servers: ${pc.cyan(selectedMcps.join(', '))}`);
  }

  p.note(summary.join('\n'), 'Installed Components');

  p.outro(
    pc.dim('Run ') +
      pc.cyan('npx stubs list') +
      pc.dim(' or ') +
      pc.cyan('npx stubs add <skill>') +
      pc.dim(' to manage items anytime.'),
  );
}
