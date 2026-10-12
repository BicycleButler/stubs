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

function remediateStaticColors() {
  const files = getAllFiles(TARGET_DIR);
  let count = 0;

  files.forEach((fullPath) => {
    let content = fs.readFileSync(fullPath, 'utf8');
    const isModalOrDialog =
      content.includes('AlertDialog') ||
      content.includes('DialogContent') ||
      content.includes('DropdownMenu') ||
      content.includes('Popover') ||
      content.includes('toast');
    if (isModalOrDialog) return;

    let modified = false;

    // Red resting alerts -> neutral resting with hover red accent
    if (
      content.includes('bg-rose-500') ||
      content.includes('text-rose-300') ||
      content.includes('border-rose-500') ||
      content.includes('bg-red-500') ||
      content.includes('text-red-500')
    ) {
      content = content
        .replace(
          /bg-rose-500\/20\s+text-rose-300\s+border-rose-500\/30/g,
          'bg-muted/40 text-muted-foreground border-border/40 hover:bg-destructive/10 hover:text-destructive',
        )
        .replace(
          /bg-rose-950\/30\s+text-rose-400\s+border-rose-900\/40/g,
          'bg-muted/30 text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
        )
        .replace(
          /bg-red-500\/10\s+text-red-500/g,
          'bg-muted/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive',
        );
      modified = true;
    }

    // Emerald resting alerts -> neutral resting with hover green accent
    if (
      content.includes('bg-emerald-500') ||
      content.includes('text-emerald-600') ||
      content.includes('border-emerald-500') ||
      content.includes('bg-green-500') ||
      content.includes('text-green-600')
    ) {
      content = content
        .replace(
          /text-emerald-600\s+dark:text-emerald-400\s+bg-emerald-500\/10/g,
          'text-muted-foreground bg-muted/40 hover:text-emerald-500 hover:bg-emerald-500/10',
        )
        .replace(
          /bg-emerald-500\/20\s+text-emerald-300\s+border-emerald-500\/30/g,
          'bg-muted/40 text-muted-foreground border-border/40 hover:bg-emerald-500/10 hover:text-emerald-500',
        )
        .replace(
          /bg-emerald-950\/30\s+text-emerald-400\s+border-emerald-900\/40/g,
          'bg-muted/30 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500',
        )
        .replace(
          /bg-green-500\/10\s+text-green-600/g,
          'bg-muted/40 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-500',
        );
      modified = true;
    }

    // Amber resting alerts -> neutral resting with hover amber accent
    if (
      content.includes('bg-amber-500') ||
      content.includes('text-amber-600') ||
      content.includes('border-amber-500') ||
      content.includes('bg-yellow-500') ||
      content.includes('text-yellow-600')
    ) {
      content = content
        .replace(
          /bg-amber-500\/10\s+border-b\s+border-amber-500\/20\s+px-4\s+py-2\.5\s+flex\s+items-center\s+justify-between\s+text-xs\s+text-amber-200/g,
          'bg-muted/40 border-b border-border/40 px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500',
        )
        .replace(
          /text-amber-600\s+dark:text-amber-400\s+bg-amber-500\/10/g,
          'text-muted-foreground bg-muted/40 hover:text-amber-500 hover:bg-amber-500/10',
        )
        .replace(
          /border-amber-500\/30\s+bg-amber-500\/5\s+dark:bg-amber-500\/10/g,
          'border-border/40 bg-muted/30 hover:border-amber-500/30 hover:bg-amber-500/10',
        )
        .replace(
          /bg-amber-500\/10\s+text-amber-600/g,
          'bg-muted/40 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500',
        );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      count++;
      console.log(`Remediated static alert colors in: ${path.relative(process.cwd(), fullPath)}`);
    }
  });

  console.log(`\nCompleted static alert color remediation across ${count} files in ${TARGET_DIR}.`);
}

remediateStaticColors();
