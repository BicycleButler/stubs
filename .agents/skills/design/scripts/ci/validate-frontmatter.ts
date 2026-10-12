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
  } catch (e) {}
  return files;
}

async function validateFrontmatter(rootDir: string): Promise<number> {
  const root = path.resolve(process.cwd(), rootDir);
  const files = await getFiles(root);

  const results = await Promise.all(
    files.map(async (filePath) => {
      const fileFailures: { file: string; reason: string }[] = [];
      const text = await fs.promises.readFile(filePath, 'utf8');
      if (!text.startsWith('---')) {
        fileFailures.push({ file: filePath, reason: 'missing frontmatter block' });
        return fileFailures;
      }
      const end = text.indexOf('---', 3);
      if (end === -1) {
        fileFailures.push({ file: filePath, reason: 'unclosed frontmatter' });
        return fileFailures;
      }
      const fm = text.substring(3, end);
      for (const key of ['title', 'type', 'status', 'description']) {
        if (!fm.includes(`${key}:`)) {
          fileFailures.push({ file: filePath, reason: `missing ${key}` });
        }
      }
      return fileFailures;
    }),
  );

  const failures = results.flat();

  if (failures.length > 0) {
    console.log('FRONTMATTER_FAILURES');
    for (const failure of failures) {
      console.log(`  ${failure.file}: ${failure.reason}`);
    }
    return 1;
  }
  console.log(`FRONTMATTER_OK checked=${files.length}`);
  return 0;
}

const rootArg = process.argv[2] || '.';
validateFrontmatter(rootArg).then((exitCode) => process.exit(exitCode));
