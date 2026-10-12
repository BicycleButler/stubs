import { WorkspaceManager } from '../src/graph/workspace';
import { VirtualFileSystem } from '../src/storage';

describe('WorkspaceManager Monorepo & Alias Resolution', () => {
  let vfs: VirtualFileSystem;
  let workspace: WorkspaceManager;

  beforeEach(() => {
    vfs = new VirtualFileSystem();
    workspace = new WorkspaceManager({ fsDriver: vfs, rootDir: '.' });
  });

  it('detects pnpm workspaces and package directories', async () => {
    await vfs.writeFile(
      'pnpm-workspace.yaml',
      `packages:
  - 'packages/*'
  - 'apps/*'
`,
    );

    await vfs.writeFile(
      'packages/core/package.json',
      JSON.stringify({
        name: '@stubs/core',
        version: '1.0.0',
        main: 'src/index.ts',
      }),
    );

    await vfs.writeFile(
      'apps/web/package.json',
      JSON.stringify({
        name: '@stubs/web',
        version: '1.0.0',
        dependencies: {
          '@stubs/core': '^1.0.0',
        },
      }),
    );

    const config = await workspace.loadWorkspace();
    expect(config.isMonorepo).toBe(true);
    expect(config.monorepoType).toBe('pnpm');
    expect(config.packages.has('@stubs/core')).toBe(true);
    expect(config.packages.has('@stubs/web')).toBe(true);

    const corePkg = config.packages.get('@stubs/core');
    expect(corePkg?.rootDir).toBe('packages/core');
    expect(corePkg?.mainFile).toBe('src/index.ts');
  });

  it('resolves cross-package imports to target file paths', async () => {
    await vfs.writeFile(
      'package.json',
      JSON.stringify({
        workspaces: ['packages/*'],
      }),
    );

    await vfs.writeFile(
      'packages/utils/package.json',
      JSON.stringify({
        name: '@stubs/utils',
        main: 'src/index.ts',
        exports: {
          './math': './src/math.ts',
        },
      }),
    );

    const config = await workspace.loadWorkspace();

    // Package root import
    const resolvedRoot = workspace.resolveImportPath(
      '@stubs/utils',
      'packages/app/src/main.ts',
      config,
    );
    expect(resolvedRoot).toBe('packages/utils/src/index.ts');

    // Subpath export import
    const resolvedSub = workspace.resolveImportPath(
      '@stubs/utils/math',
      'packages/app/src/main.ts',
      config,
    );
    expect(resolvedSub).toBe('packages/utils/src/math.ts');
  });

  it('resolves tsconfig compilerOptions.paths aliases', async () => {
    await vfs.writeFile(
      'tsconfig.json',
      JSON.stringify({
        compilerOptions: {
          paths: {
            '@/*': ['src/*'],
            '@shared': ['packages/shared/index.ts'],
          },
        },
      }),
    );

    const config = await workspace.loadWorkspace();
    expect(config.pathAliases.has('@/*')).toBe(true);

    const resolvedWildcard = workspace.resolveImportPath(
      '@/components/Button',
      'src/App.tsx',
      config,
    );
    expect(resolvedWildcard).toBe('src/components/Button');

    const resolvedExact = workspace.resolveImportPath('@shared', 'src/App.tsx', config);
    expect(resolvedExact).toBe('packages/shared/index.ts');
  });

  it('maps file paths to owning workspace packages', async () => {
    await vfs.writeFile(
      'pnpm-workspace.yaml',
      `packages:
  - 'packages/*'
`,
    );

    await vfs.writeFile('packages/auth/package.json', JSON.stringify({ name: '@stubs/auth' }));
    await vfs.writeFile('packages/db/package.json', JSON.stringify({ name: '@stubs/db' }));

    const config = await workspace.loadWorkspace();

    const authPkg = workspace.getPackageForFile('packages/auth/src/jwt.ts', config);
    expect(authPkg?.name).toBe('@stubs/auth');

    const dbPkg = workspace.getPackageForFile('packages/db/src/pool.ts', config);
    expect(dbPkg?.name).toBe('@stubs/db');

    const rootFilePkg = workspace.getPackageForFile('scripts/build.ts', config);
    expect(rootFilePkg).toBeNull();
  });
});
