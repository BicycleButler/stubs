import * as path from 'path';
import { FileStorageDriver, NodeFileSystem } from '../storage';
import { normalizePosixPath } from './engine';

export interface WorkspacePackage {
  name: string;
  rootDir: string; // Relative POSIX path, e.g. "packages/core"
  version?: string;
  mainFile?: string;
  exports?: Record<string, string>;
  dependencies?: string[];
}

export interface WorkspaceConfig {
  isMonorepo: boolean;
  monorepoType?: 'pnpm' | 'npm' | 'yarn' | 'cargo' | 'go' | 'lerna' | 'turbo';
  packages: Map<string, WorkspacePackage>;
  packageByDir: Map<string, WorkspacePackage>;
  pathAliases: Map<string, string[]>; // e.g. "@/*" => ["src/*"]
}

/**
 * Discovers and parses monorepo workspaces and path aliases across multi-package repositories.
 */
export class WorkspaceManager {
  private fsDriver: FileStorageDriver;
  private rootDir: string;
  private cachedConfig: WorkspaceConfig | null = null;

  constructor(options?: { fsDriver?: FileStorageDriver; rootDir?: string }) {
    this.fsDriver = options?.fsDriver || new NodeFileSystem();
    this.rootDir = normalizePosixPath(options?.rootDir || '.');
  }

  /**
   * Initializes workspace map by scanning workspace manifests and configuration files.
   */
  public async loadWorkspace(): Promise<WorkspaceConfig> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }

    const config: WorkspaceConfig = {
      isMonorepo: false,
      packages: new Map(),
      packageByDir: new Map(),
      pathAliases: new Map(),
    };

    // 1. Check pnpm-workspace.yaml
    const pnpmWorkspacePath = path.posix.join(this.rootDir, 'pnpm-workspace.yaml');
    if (await this.fsDriver.exists(pnpmWorkspacePath)) {
      config.isMonorepo = true;
      config.monorepoType = 'pnpm';
      const content = await this.fsDriver.readFile(pnpmWorkspacePath);
      const patterns = this.parseYamlPackagePatterns(content);
      await this.discoverPackagesFromPatterns(patterns, config);
    }

    // 2. Check root package.json for workspaces
    const rootPkgPath = path.posix.join(this.rootDir, 'package.json');
    if (await this.fsDriver.exists(rootPkgPath)) {
      try {
        const pkgContent = await this.fsDriver.readFile(rootPkgPath);
        const pkgJson = JSON.parse(pkgContent);
        if (pkgJson.workspaces) {
          config.isMonorepo = true;
          if (!config.monorepoType) config.monorepoType = 'npm';
          const patterns = Array.isArray(pkgJson.workspaces)
            ? pkgJson.workspaces
            : pkgJson.workspaces.packages || [];
          await this.discoverPackagesFromPatterns(patterns, config);
        }
      } catch {
        // Ignore json parse error
      }
    }

    // 3. Check Cargo.toml workspace
    const cargoPath = path.posix.join(this.rootDir, 'Cargo.toml');
    if (await this.fsDriver.exists(cargoPath)) {
      const cargoContent = await this.fsDriver.readFile(cargoPath);
      if (cargoContent.includes('[workspace]')) {
        config.isMonorepo = true;
        config.monorepoType = 'cargo';
        const members = this.parseCargoWorkspaceMembers(cargoContent);
        await this.discoverPackagesFromPatterns(members, config);
      }
    }

    // 4. Check go.work
    const goWorkPath = path.posix.join(this.rootDir, 'go.work');
    if (await this.fsDriver.exists(goWorkPath)) {
      const goWorkContent = await this.fsDriver.readFile(goWorkPath);
      config.isMonorepo = true;
      config.monorepoType = 'go';
      const members = this.parseGoWorkMembers(goWorkContent);
      await this.discoverPackagesFromPatterns(members, config);
    }

    // 5. Parse root tsconfig.json compilerOptions.paths
    await this.loadTsconfigAliases(this.rootDir, config);

    this.cachedConfig = config;
    return config;
  }

  /**
   * Resolves an import specifier (e.g. "@stubs/core" or "@/components/Button")
   * to a canonical repository relative file path.
   */
  public resolveImportPath(
    importSpecifier: string,
    importerFilePath: string,
    config: WorkspaceConfig,
  ): string | null {
    const trimmed = importSpecifier.trim();

    // 1. Direct workspace package match (e.g. "package-name" or "@scope/pkg")
    const matchedPkg = config.packages.get(trimmed);
    if (matchedPkg) {
      if (matchedPkg.mainFile) {
        return normalizePosixPath(path.posix.join(matchedPkg.rootDir, matchedPkg.mainFile));
      }
      return matchedPkg.rootDir;
    }

    // 2. Package subpath match (e.g. "@scope/pkg/subpath")
    for (const [pkgName, pkg] of config.packages.entries()) {
      if (trimmed.startsWith(`${pkgName}/`)) {
        const sub = trimmed.slice(pkgName.length + 1);
        if (pkg.exports && pkg.exports[`./${sub}`]) {
          return normalizePosixPath(path.posix.join(pkg.rootDir, pkg.exports[`./${sub}`]));
        }
        return normalizePosixPath(path.posix.join(pkg.rootDir, 'src', sub));
      }
    }

    // 3. tsconfig path aliases (e.g. "@/*" => "src/*")
    for (const [aliasPattern, targetPatterns] of config.pathAliases.entries()) {
      if (aliasPattern.endsWith('/*') && trimmed.startsWith(aliasPattern.slice(0, -1))) {
        const suffix = trimmed.slice(aliasPattern.length - 2);
        for (const targetPattern of targetPatterns) {
          if (targetPattern.endsWith('/*')) {
            const resolved = targetPattern.slice(0, -2) + suffix;
            return normalizePosixPath(resolved);
          }
        }
      } else if (aliasPattern === trimmed && targetPatterns.length > 0) {
        return normalizePosixPath(targetPatterns[0]);
      }
    }

    // 4. Relative imports
    if (trimmed.startsWith('./') || trimmed.startsWith('../')) {
      const importerDir = path.posix.dirname(importerFilePath);
      return normalizePosixPath(path.posix.join(importerDir, trimmed));
    }

    return null;
  }

  /**
   * Finds the owning workspace package for any given file path.
   */
  public getPackageForFile(filePath: string, config: WorkspaceConfig): WorkspacePackage | null {
    const norm = normalizePosixPath(filePath);
    let bestMatch: WorkspacePackage | null = null;
    let longestPrefix = 0;

    for (const pkg of config.packages.values()) {
      const dirPrefix = pkg.rootDir.endsWith('/') ? pkg.rootDir : `${pkg.rootDir}/`;
      if (norm.startsWith(dirPrefix) && dirPrefix.length > longestPrefix) {
        longestPrefix = dirPrefix.length;
        bestMatch = pkg;
      }
    }

    return bestMatch;
  }

  /**
   * Parses simple YAML package lists from pnpm-workspace.yaml without full YAML dependency.
   */
  private parseYamlPackagePatterns(content: string): string[] {
    const patterns: string[] = [];
    const lines = content.split('\n');
    let inPackages = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('packages:')) {
        inPackages = true;
        continue;
      }
      if (inPackages) {
        if (trimmed.startsWith('-')) {
          const item = trimmed.replace(/^-\s*['"]?/, '').replace(/['"]?\s*$/, '');
          if (item) patterns.push(item);
        } else if (trimmed && !trimmed.startsWith('#') && !line.startsWith(' ')) {
          inPackages = false;
        }
      }
    }

    return patterns;
  }

  private parseCargoWorkspaceMembers(content: string): string[] {
    const members: string[] = [];
    const match = content.match(/members\s*=\s*\[([\s\S]*?)\]/);
    if (match) {
      const raw = match[1];
      const items = raw.split(',').map((s) => s.trim().replace(/['"]/g, ''));
      for (const item of items) {
        if (item) members.push(item);
      }
    }
    return members;
  }

  private parseGoWorkMembers(content: string): string[] {
    const members: string[] = [];
    const lines = content.split('\n');
    let inUse = false;
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('use (')) {
        inUse = true;
        continue;
      }
      if (inUse) {
        if (trimmed === ')') {
          inUse = false;
        } else if (trimmed && !trimmed.startsWith('//')) {
          members.push(trimmed);
        }
      } else if (trimmed.startsWith('use ') && !trimmed.includes('(')) {
        members.push(trimmed.slice(4).trim());
      }
    }
    return members;
  }

  private async discoverPackagesFromPatterns(
    patterns: string[],
    config: WorkspaceConfig,
  ): Promise<void> {
    for (const pat of patterns) {
      const cleanPat = pat.replace(/\\/g, '/').replace(/\/$/, '');
      if (cleanPat.endsWith('/*')) {
        const baseDir = cleanPat.slice(0, -2);
        if (await this.fsDriver.exists(baseDir)) {
          const entries = await this.fsDriver.readDir(baseDir);
          for (const entry of entries) {
            const subDir = path.posix.join(baseDir, entry);
            await this.registerPackageDir(subDir, config);
          }
        }
      } else {
        await this.registerPackageDir(cleanPat, config);
      }
    }
  }

  private async registerPackageDir(dirPath: string, config: WorkspaceConfig): Promise<void> {
    const normDir = normalizePosixPath(dirPath);
    const pkgJsonPath = path.posix.join(normDir, 'package.json');
    if (await this.fsDriver.exists(pkgJsonPath)) {
      try {
        const content = await this.fsDriver.readFile(pkgJsonPath);
        const parsed = JSON.parse(content);
        const name = parsed.name || path.posix.basename(normDir);
        let mainFile: string | undefined = parsed.main;
        if (!mainFile) {
          const candidateMain = path.posix.join(normDir, 'src/index.ts');
          if (await this.fsDriver.exists(candidateMain)) {
            mainFile = 'src/index.ts';
          }
        }

        const pkg: WorkspacePackage = {
          name,
          rootDir: normDir,
          version: parsed.version,
          mainFile,
          exports: typeof parsed.exports === 'object' ? parsed.exports : undefined,
          dependencies: parsed.dependencies ? Object.keys(parsed.dependencies) : [],
        };

        config.packages.set(name, pkg);
        config.packageByDir.set(normDir, pkg);
      } catch {
        // Fallback for directory
        const fallbackName = path.posix.basename(normDir);
        const pkg: WorkspacePackage = { name: fallbackName, rootDir: normDir };
        config.packages.set(fallbackName, pkg);
        config.packageByDir.set(normDir, pkg);
      }
      return;
    }

    const cargoPath = path.posix.join(normDir, 'Cargo.toml');
    if (await this.fsDriver.exists(cargoPath)) {
      const content = await this.fsDriver.readFile(cargoPath);
      const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
      const name = nameMatch ? nameMatch[1] : path.posix.basename(normDir);
      const pkg: WorkspacePackage = { name, rootDir: normDir, mainFile: 'src/lib.rs' };
      config.packages.set(name, pkg);
      config.packageByDir.set(normDir, pkg);
    }
  }

  private async loadTsconfigAliases(baseDir: string, config: WorkspaceConfig): Promise<void> {
    const tsconfigPath = path.posix.join(baseDir, 'tsconfig.json');
    if (!(await this.fsDriver.exists(tsconfigPath))) {
      return;
    }

    try {
      const content = await this.fsDriver.readFile(tsconfigPath);
      // Strip comments for valid JSON parse
      const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      const parsed = JSON.parse(stripped);
      const paths = parsed.compilerOptions?.paths;
      if (paths && typeof paths === 'object') {
        for (const [alias, targetList] of Object.entries(paths)) {
          if (Array.isArray(targetList)) {
            config.pathAliases.set(alias, targetList as string[]);
          }
        }
      }
    } catch {
      // Ignore malformed tsconfig
    }
  }
}
