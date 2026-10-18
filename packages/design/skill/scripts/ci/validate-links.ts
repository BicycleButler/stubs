import fs from 'fs';
import path from 'path';

async function getFiles(
  dir: string,
  files: string[] = [],
  excludePrefixes: string[] = ['.kanban', 'node_modules', 'scratch'],
): Promise<string[]> {
  try {
    const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const fullPath = path.join(dir, dirent.name);
      const relPath = path.relative(process.cwd(), fullPath);
      if (
        excludePrefixes.some((pre) => relPath.startsWith(pre) || relPath.includes('/' + pre + '/'))
      ) {
        continue;
      }
      if (dirent.isDirectory()) {
        await getFiles(fullPath, files, excludePrefixes);
      } else if (fullPath.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  } catch {
    /* ignore unreadable or missing directories */
  }
  return files;
}

async function validateLinks(rootDir: string): Promise<number> {
  const root = path.resolve(process.cwd(), rootDir);
  const files = await getFiles(root);
  const linkRegex = /\[[^\]]*\]\(([^)]+)\)/g;

  const results = await Promise.all(
    files.map(async (filePath) => {
      const fileFailures: { file: string; link: string; reason: string }[] = [];
      const text = await fs.promises.readFile(filePath, 'utf8');

      // Find all matches first
      const matches = [...text.matchAll(linkRegex)];

      await Promise.all(
        matches.map(async (match) => {
          const link = match[1];
          if (link.startsWith('http') || link.startsWith('#')) {
            return;
          }

          if (link.includes('#')) {
            const base = link.split('#')[0];
            if (base) {
              const target = path.resolve(path.dirname(filePath), base);
              try {
                await fs.promises.access(target);
              } catch {
                fileFailures.push({ file: filePath, link, reason: 'missing target' });
              }
            }
          } else {
            const target = path.resolve(path.dirname(filePath), link);
            try {
              await fs.promises.access(target);
            } catch {
              fileFailures.push({ file: filePath, link, reason: 'missing file' });
            }
          }
        }),
      );

      return fileFailures;
    }),
  );

  const failures = results.flat();

  if (failures.length > 0) {
    console.log('LINK_FAILURES');
    for (const failure of failures) {
      console.log(`  ${failure.file}: ${failure.link} -> ${failure.reason}`);
    }
    return 1;
  }
  console.log(`LINK_OK checked=${files.length}`);
  return 0;
}

const rootArg = process.argv[2] || '.';
validateLinks(rootArg).then((exitCode) => process.exit(exitCode));
