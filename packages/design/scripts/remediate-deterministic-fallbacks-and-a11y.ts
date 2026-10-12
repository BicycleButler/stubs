import fs from 'fs';
import path from 'path';

const TARGET_DIR = path.resolve(process.cwd(), process.argv[2] || 'src');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist' && file !== '.git') {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (
      file.endsWith('.tsx') ||
      file.endsWith('.ts') ||
      file.endsWith('.jsx') ||
      file.endsWith('.js')
    ) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function remediateFile(filePath: string): boolean {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // 1. Fallbacks: Replace "Unknown", 'Unknown', "None", 'None', "-", '-' fallbacks with em-dash "—"
  content = content
    .replace(/\|\|\s*["']Unknown["']/g, '|| "—"')
    .replace(/\|\|\s*['"]None['"]/g, '|| "—"')
    .replace(/\?\?\s*["']Unknown["']/g, '?? "—"')
    .replace(/\?\?\s*['"]None['"]/g, '?? "—"')
    .replace(/\|\|\s*["']-["']/g, '|| "—"')
    .replace(/\?\?\s*["']-["']/g, '?? "—"')
    .replace(/["']N\/A["']/g, '"—"')
    .replace(/['"]n\/a['"]/g, '"—"');

  // 2. Emojis in functional UI
  content = content
    .replace(/🏢/g, 'Building ')
    .replace(/👤/g, 'User ')
    .replace(/🔒/g, 'Private ')
    .replace(/⚠️/g, 'Warning ')
    .replace(/👁/g, 'View')
    .replace(/📎/g, 'Attachment')
    .replace(/✕/g, 'Close');

  // 3. A11y icon buttons missing aria-label
  const lines = content.split('\n');
  const newLines = lines.map((line) => {
    if (
      /<Button[^>]*size=["'](?:icon|icon-sm|icon-lg)["'][^>]*>/.test(line) &&
      !line.includes('aria-label')
    ) {
      let label = '';
      if (line.includes('title=')) {
        const match = line.match(/title=["']([^"']+)["']/);
        if (match) label = match[1];
      } else if (line.includes('onClick')) {
        if (line.includes('Cancel') || line.includes('onCancel')) label = 'Cancel';
        else if (line.includes('Delete') || line.includes('remove')) label = 'Remove item';
        else if (line.includes('NavigateUp') || line.includes('up')) label = 'Navigate up';
        else if (line.includes('ContextOpen')) label = 'Toggle context panel';
        else if (line.includes('Edit') || line.includes('edit')) label = 'Edit';
        else if (line.includes('Save') || line.includes('save')) label = 'Save';
        else if (line.includes('Close') || line.includes('close')) label = 'Close';
        else if (line.includes('Open') || line.includes('open')) label = 'Open';
        else if (line.includes('Filter') || line.includes('filter')) label = 'Filter options';
        else if (line.includes('Search') || line.includes('search')) label = 'Search';
      }
      if (!label) label = 'Toggle option';
      return line.replace('<Button ', `<Button aria-label="${label}" `);
    }
    return line;
  });
  content = newLines.join('\n');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function runRemediation() {
  const files = getAllFiles(TARGET_DIR);
  let count = 0;
  files.forEach((file) => {
    if (remediateFile(file)) {
      count++;
      console.log(`Remediated fallbacks/emojis/a11y in: ${path.relative(process.cwd(), file)}`);
    }
  });
  console.log(`\nCompleted fallbacks & a11y remediation across ${count} files in ${TARGET_DIR}.`);
}

runRemediation();
