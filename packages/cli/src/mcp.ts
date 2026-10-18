import * as fs from 'node:fs';
import * as path from 'node:path';

export interface McpServerDefinition {
  name: string;
  description: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export function getAvailableMcpServers(): Record<string, McpServerDefinition> {
  return {
    stubs: {
      name: 'stubs',
      description: 'Stubs AST Architecture and OKF Sidecar Engine MCP Server',
      command: 'stubs',
      args: ['mcp'],
    },
    tale: {
      name: 'tale',
      description: 'ASD-STE100 Simplified Technical English Linter MCP Server',
      command: 'npx',
      args: ['-y', '@bicyclebutler/tale', 'mcp-serve'],
    },
    design: {
      name: 'design',
      description: 'Design Guidelines and Compliance Auditor MCP Server',
      command: 'npx',
      args: ['-y', '@bicyclebutler/design', 'mcp-serve'],
    },
  };
}

export function registerMcpServer(
  serverKey: string,
  targetDir: string = process.cwd(),
): { success: boolean; message: string } {
  const available = getAvailableMcpServers();
  const def = available[serverKey.toLowerCase()];
  if (!def) {
    return { success: false, message: `Unknown MCP server: ${serverKey}` };
  }

  const configPath = path.join(targetDir, '.agents/mcp_config.json');
  let currentConfig: { mcpServers: Record<string, any> } = { mcpServers: {} };

  if (fs.existsSync(configPath)) {
    try {
      currentConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (!currentConfig.mcpServers) currentConfig.mcpServers = {};
    } catch {
      currentConfig = { mcpServers: {} };
    }
  } else {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  currentConfig.mcpServers[def.name] = {
    command: def.command,
    args: def.args,
    env: def.env || {},
  };

  fs.writeFileSync(configPath, JSON.stringify(currentConfig, null, 2), 'utf-8');
  return { success: true, message: `Registered ${def.name} into .agents/mcp_config.json` };
}
