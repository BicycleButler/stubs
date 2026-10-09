#!/usr/bin/env tsx
// scripts/create-domain-briefings.ts
// Generates domain briefings and stub sidecars from the stubs AST graph.
// Usage: tsx scripts/create-domain-briefings.ts [--repo <path>] [--overwrite]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execFile } from 'child_process';

function runSqlite3(dbFile: string, sql: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    execFile('sqlite3', [dbFile, sql], (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      // Parse output as lines, each line is a row separated by | (default separator)
      const lines = stdout.trim().split('\n').filter(line => line.length > 0);
      const rows = lines.map(line => line.split('|').map(cell => cell.trim()));
      resolve(rows);
    });
  });
}

async function runCommand(cmd: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, (err, stdout, stderr) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  let repoRoot = '.';
  let overwrite = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--repo' && i + 1 < args.length) {
      repoRoot = args[++i];
    } else if (args[i] === '--overwrite') {
      overwrite = true;
    }
  }

  process.chdir(repoRoot);
  console.log(`Working in: ${process.cwd()}`);

  const graphPath = join('.stubs', 'graph.sqlite');
  if (!existsSync(graphPath)) {
    console.log('Graph not found, running stubs scan...');
    await runCommand('npx', ['stubs', 'scan', '.']);
  }

  // Get distinct domain prefixes (first two path components) from graph_nodes
  const prefixRows = await runSqlite3(graphPath, `
    SELECT DISTINCT 
      substr(file_path, 1, instr(file_path, '/') + 
        instr(substr(file_path, instr(file_path, '/') + 1), '/') - 1) as domain_prefix
    FROM graph_nodes
    WHERE file_path LIKE 'apps/%' OR file_path LIKE 'packages/%'
  `);
  const domainPrefixes: string[] = [];
  for (const row of prefixRows) {
    if (row[0]) domainPrefixes.push(row[0]);
  }
  console.log(`Found ${domainPrefixes.length} domain prefixes:`, domainPrefixes.join(', '));

  const briefingsDir = join('knowledge', 'architecture', 'briefings');
  const domainsDir = join('knowledge', 'architecture', 'domains');
  if (!existsSync(briefingsDir)) mkdirSync(briefingsDir, { recursive: true });
  if (!existsSync(domainsDir)) mkdirSync(domainsDir, { recursive: true });

  for (const prefix of domainPrefixes) {
    const safeId = prefix.replace(/\//g, '-');
    const briefingPath = join(briefingsDir, `${safeId}-briefing.json`);
    const sidecarPath = join(domainsDir, `${safeId}-domain-map.md`);

    if (existsSync(sidecarPath) && !overwrite) {
      console.log(`⏭️  Sidecar exists: ${sidecarPath}`);
      continue;
    }

    console.log(`🔧 Processing domain: ${prefix}`);

    // Get nodes for this domain
    const nodesRows = await runSqlite3(graphPath, `
      SELECT id, file_path, kind, symbol_name
      FROM graph_nodes
      WHERE file_path LIKE ?
    `, [prefix + '%']);
    const nodes = nodesRows.map((r: any[]) => ({
      id: r[0],
      file_path: r[1],
      kind: r[2],
      symbol_name: r[3]
    }));
    if (nodes.length === 0) {
      console.log(`⚠️  No nodes found for ${prefix}, skipping`);
      continue;
    }

    const nodeMap = new Map(nodes.map(n => [n.id, n]));

    // Get edges within this domain
    const edgesRows = await runSqlite3(graphPath, `
      SELECT ge.source_id, ge.target_id, ge.relation
      FROM graph_edges ge
      JOIN graph_nodes gn_src ON ge.source_id = gn_src.id
      JOIN graph_nodes gn_tgt ON ge.target_id = gn_tgt.id
      WHERE gn_src.file_path LIKE ? AND gn_tgt.file_path LIKE ?
    `, [prefix + '%', prefix + '%']);
    const edges = edgesRows.map((r: any[]) => ({
      source_id: r[0],
      target_id: r[1],
      relation: r[2]
    }));

    // Compute degree
    const degreeMap = new Map<string, number>();
    for (const e of edges) {
      degreeMap.set(e.source_id, (degreeMap.get(e.source_id) || 0) + 1);
      degreeMap.set(e.target_id, (degreeMap.get(e.target_id) || 0) + 1);
    }

    // Top 3 hub nodes by degree
    const hubNodes = nodes
      .map(n => ({ node: n, degree: degreeMap.get(n.id) || 0 }))
      .sort((a, b) => b.degree - a.degree)
      .slice(0, 3)
      .map(item => item.node);

    const members = nodes.map(n => n.file_path);

    const imports: { source: string; target: string }[] = [];
    const exports: { source: string; target: string }[] = [];
    const calls: { source: string; target: string }[] = [];

    for (const e of edges) {
      const src = nodeMap.get(e.source_id)!.file_path;
      const tgt = nodeMap.get(e.target_id)!.file_path;
      if (e.relation === 'imports') {
        imports.push({ source: src, target: tgt });
      } else if (e.relation === 'exports') {
        exports.push({ source: src, target: tgt });
      } else if (e.relation === 'calls') {
        calls.push({ source: src, target: tgt });
      }
    }

    // Generate mermaid diagram (subset)
    const mermaidLines = ['graph TD'];
    const added = new Set<string>();
    function addNode(filePath: string) {
      if (!added.has(filePath)) {
        added.add(filePath);
        const lastPart = filePath.split('/').pop()!.replace(/\.[^/.]+$/, '');
        mermaidLines.push(`    ${JSON.stringify(filePath)}[${lastPart}]`);
      }
    }
    for (const c of calls) {
      addNode(c.source);
      addNode(c.target);
      mermaidLines.push(`    ${JSON.stringify(c.source)} --> ${JSON.stringify(c.target)}`);
    }
    for (const i of imports) {
      addNode(i.source);
      addNode(i.target);
      mermaidLines.push(`    ${JSON.stringify(i.source)} -.-> ${JSON.stringify(i.target)}`);
    }
    for (const e of exports) {
      addNode(e.source);
      addNode(e.target);
      mermaidLines.push(`    ${JSON.stringify(e.source)} ==> ${JSON.stringify(e.target)}`);
    }
    const mermaid = mermaidLines.join('\n');

    // Build briefing
    const briefing = {
      domain_id: safeId,
      root: prefix,
      hub_nodes: hubNodes.map(n => ({
        file: n.file_path,
        kind: n.kind,
        symbol: n.symbol_name,
        degree: degreeMap.get(n.id) || 0
      })),
      members,
      imports,
      exports,
      calls,
      mermaid,
      sidecar_draft: {
        okfVersion: '1.0.0',
        id: `${safeId}-domain`,
        type: 'subsystem-index',
        title: `${prefix.split('/').slice(-2).join(' ').replace(/-/g, ' ')} Domain`,
        version: 1,
        target_code_file: hubNodes.length > 0 ? hubNodes[0].file_path : '',
        status_flag: 'clean',
        status: 'skeleton',
        tags: [safeId],
        compliance: 'standalone',
        decision: 'pending'
      }
    };

    writeFileSync(briefingPath, JSON.stringify(briefing, null, 2));
    console.log(`📝 Briefing written: ${briefingPath}`);

    // Write sidecar stub
    let sidecarContent = `---
okfVersion: "1.0.0"
id: "${briefing.sidecar_draft.id}"
type: "${briefing.sidecar_draft.type}"
title: "${briefing.sidecar_draft.title}"
version: ${briefing.sidecar_draft.version}
target_code_file: "${briefing.sidecar_draft.target_code_file}"
status_flag: "${briefing.sidecar_draft.status_flag}"
status: "${briefing.sidecar_draft.status}"
tags: [${JSON.stringify(briefing.sidecar_draft.tags)}]
compliance: "${briefing.sidecar_draft.compliance}"
decision: "${briefing.sidecar_draft.decision}"
---
# ${briefing.sidecar_draft.title}

Source directory: \`${prefix}\`

## Scope

The \`${briefing.sidecar_draft.title}\` domain owns the \`${prefix}\` directory — the source files, types,
and adapters that implement this capability.

## Subsystems

| Subsystem | Responsibility | Context Map |
| :--- | :--- | :--- |
`;
    // Determine subsystems: first-level folder under prefix
    const subsystems = new Set<string>();
    for (const m of members) {
      const rel = m.slice(prefix.length);
      const firstSlash = rel.indexOf('/');
      if (firstSlash > 0) {
        const sub = rel.slice(1, firstSlash);
        if (sub) subsystems.add(sub);
      }
    }
    if (subsystems.size === 0) {
      // fallback to hub nodes' first path component after prefix
      for (const n of hubNodes) {
        const parts = n.file_path.split('/');
        if (parts.length > 2) {
          subsystems.add(parts[2]);
        }
      }
    }
    for (const sub of Array.from(subsystems).sort()) {
      sidecarContent += `| \`${sub}\` | | [Subsystem](${sub}/subsystem-index.md) |\\n`;
    }
    if (subsystems.size === 0) {
      sidecarContent += `| | | |\\n`;
    }

    writeFileSync(sidecarPath, sidecarContent);
    console.log(`📄 Sidecar stub written: ${sidecarPath}`);
  }

  console.log('✅ Done.');
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});