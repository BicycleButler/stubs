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

function remediateBadgeInFile(filePath: string) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('badge') && !content.includes('Badge')) return false;

  let modified = false;

  // 1. Remove Badge import line
  const lines = content.split('\n');
  const filteredLines = lines.filter((line) => {
    if (line.includes('@/components/ui/badge') || line.includes('@/components/ui/Badge')) {
      modified = true;
      return false;
    }
    return true;
  });

  let newContent = filteredLines.join('\n');

  // 2. Replace <Badge ...> content </Badge> with Concept C sub-label typography
  // Pattern match single line or multiline Badge usage
  const badgeRegex = /<Badge\b[^>]*>([\s\S]*?)<\/Badge>/g;

  if (badgeRegex.test(newContent)) {
    modified = true;
    newContent = newContent.replace(badgeRegex, (match, innerText) => {
      // Concept C System Standard: typography scale font-medium text-muted-foreground/60 text-xs
      return `<span className="text-xs font-medium text-muted-foreground/70">${innerText.trim()}</span>`;
    });
  }

  // Also replace self-closing <Badge ... />
  const selfClosingBadgeRegex = /<Badge\b[^>]*\/>/g;
  if (selfClosingBadgeRegex.test(newContent)) {
    modified = true;
    newContent = newContent.replace(selfClosingBadgeRegex, '');
  }

  // Also fix status dot patterns
  newContent = newContent.replace(
    /w-2\s+h-2\s+rounded-full\s+bg-[a-z0-9-/]+/g,
    'text-xs text-muted-foreground/60 font-medium',
  );

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    return true;
  }
  return false;
}

function runBadgeRemediation() {
  const files = getAllFiles(TARGET_DIR);
  let count = 0;
  files.forEach((filePath) => {
    if (remediateBadgeInFile(filePath)) {
      count++;
      console.log(`Remediated Badge deprecation in: ${path.relative(process.cwd(), filePath)}`);
    }
  });
  console.log(`\nCompleted Badge remediation across ${count} files in ${TARGET_DIR}.`);
}

runBadgeRemediation();
