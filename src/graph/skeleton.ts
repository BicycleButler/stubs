import * as ts from 'typescript';
import * as path from 'path';

export interface SkeletonOptions {
  includeImports?: boolean;
  includeDocstrings?: boolean;
  includeLineNumbers?: boolean;
  maxLines?: number;
}

export interface SkeletonResult {
  filePath: string;
  skeletonText: string;
  originalLines: number;
  skeletonLines: number;
  tokenSavingsPercent: number; // approximate savings e.g. 85%
  symbolCount: number;
}

/**
 * Extracts interface contracts, function signatures, and class types from source code
 * while stripping function/method bodies into `{ ... }`, achieving 80–90% token reduction.
 */
export class SkeletonGenerator {
  /**
   * Generates a token-compact skeleton stub for a source file.
   */
  public generateSkeleton(
    filePath: string,
    code: string,
    options: SkeletonOptions = {},
  ): SkeletonResult {
    const ext = path.extname(filePath).toLowerCase();
    const originalLines = code.split('\n').length;
    let skeletonText: string;
    let symbolCount: number;

    if (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx') {
      const tsResult = this.generateTypeScriptSkeleton(code, options);
      skeletonText = tsResult.text;
      symbolCount = tsResult.count;
    } else if (ext === '.py') {
      const pyResult = this.generatePythonSkeleton(code, options);
      skeletonText = pyResult.text;
      symbolCount = pyResult.count;
    } else if (ext === '.rs') {
      const rsResult = this.generateRustSkeleton(code, options);
      skeletonText = rsResult.text;
      symbolCount = rsResult.count;
    } else if (ext === '.go') {
      const goResult = this.generateGoSkeleton(code, options);
      skeletonText = goResult.text;
      symbolCount = goResult.count;
    } else {
      // Fallback: first 30 lines
      const lines = code.split('\n');
      skeletonText =
        lines.slice(0, 30).join('\n') + (lines.length > 30 ? '\n// ... [truncated]' : '');
      symbolCount = 1;
    }

    const skeletonLines = skeletonText.split('\n').length;
    const tokenSavingsPercent = Math.max(
      0,
      Math.min(
        98,
        Math.round(((code.length - skeletonText.length) / Math.max(1, code.length)) * 100),
      ),
    );

    return {
      filePath,
      skeletonText: skeletonText.trim(),
      originalLines,
      skeletonLines,
      tokenSavingsPercent,
      symbolCount,
    };
  }

  private generateTypeScriptSkeleton(
    code: string,
    options: SkeletonOptions,
  ): { text: string; count: number } {
    const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
    const pieces: string[] = [];
    let symbolCount = 0;

    for (const statement of sourceFile.statements) {
      const lineStart = sourceFile.getLineAndCharacterOfPosition(statement.getStart()).line + 1;
      const lineEnd = sourceFile.getLineAndCharacterOfPosition(statement.getEnd()).line + 1;
      const lineTag = options.includeLineNumbers !== false ? ` // [L${lineStart}-L${lineEnd}]` : '';

      // Imports
      if (ts.isImportDeclaration(statement)) {
        if (options.includeImports !== false) {
          const importText = code.slice(statement.getStart(), statement.getEnd()).trim();
          pieces.push(importText);
        }
        continue;
      }

      // Interfaces
      if (ts.isInterfaceDeclaration(statement)) {
        symbolCount++;
        const text = code.slice(statement.getStart(), statement.getEnd()).trim();
        pieces.push(`${text}${lineTag}`);
        continue;
      }

      // Type Aliases
      if (ts.isTypeAliasDeclaration(statement)) {
        symbolCount++;
        const text = code.slice(statement.getStart(), statement.getEnd()).trim();
        pieces.push(`${text}${lineTag}`);
        continue;
      }

      // Enums
      if (ts.isEnumDeclaration(statement)) {
        symbolCount++;
        const text = code.slice(statement.getStart(), statement.getEnd()).trim();
        pieces.push(`${text}${lineTag}`);
        continue;
      }

      // Functions
      if (ts.isFunctionDeclaration(statement)) {
        symbolCount++;
        const header = this.extractFunctionHeader(statement, code);
        pieces.push(`${header} { /* ... */ }${lineTag}`);
        continue;
      }

      // Classes
      if (ts.isClassDeclaration(statement)) {
        symbolCount++;
        const classHeader = this.extractClassHeader(statement, code);
        const members: string[] = [];

        for (const member of statement.members) {
          const mLineStart = sourceFile.getLineAndCharacterOfPosition(member.getStart()).line + 1;
          const mLineEnd = sourceFile.getLineAndCharacterOfPosition(member.getEnd()).line + 1;
          const mLineTag =
            options.includeLineNumbers !== false ? ` // [L${mLineStart}-L${mLineEnd}]` : '';

          if (ts.isMethodDeclaration(member) || ts.isConstructorDeclaration(member)) {
            const memberHeader = this.extractMemberHeader(member, code);
            members.push(`  ${memberHeader} { /* ... */ }${mLineTag}`);
          } else if (ts.isPropertyDeclaration(member)) {
            const propText = code.slice(member.getStart(), member.getEnd()).split('=')[0].trim();
            members.push(`  ${propText};${mLineTag}`);
          }
        }

        pieces.push(`${classHeader} {\n${members.join('\n')}\n}${lineTag}`);
        continue;
      }

      // Exported const/let declarations
      if (ts.isVariableStatement(statement)) {
        const isExported = statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
        if (isExported) {
          symbolCount++;
          const varText = code.slice(statement.getStart(), statement.getEnd()).trim();
          const cleanVar = varText.includes('=')
            ? varText.split('=')[0].trim() + '; // ...'
            : varText;
          pieces.push(`${cleanVar}${lineTag}`);
        }
      }
    }

    return { text: pieces.join('\n\n'), count: symbolCount };
  }

  private extractFunctionHeader(node: ts.FunctionDeclaration, code: string): string {
    const bodyStart = node.body ? node.body.getStart() : node.getEnd();
    return code.slice(node.getStart(), bodyStart).trim();
  }

  private extractClassHeader(node: ts.ClassDeclaration, code: string): string {
    const classKeyword = code.slice(node.getStart(), node.getEnd());
    const openBrace = classKeyword.indexOf('{');
    if (openBrace !== -1) {
      return classKeyword.slice(0, openBrace).trim();
    }
    const name = node.name ? node.name.text : 'Anonymous';
    return `class ${name}`;
  }

  private extractMemberHeader(
    node: ts.MethodDeclaration | ts.ConstructorDeclaration,
    code: string,
  ): string {
    const bodyStart = node.body ? node.body.getStart() : node.getEnd();
    return code.slice(node.getStart(), bodyStart).trim();
  }

  private generatePythonSkeleton(
    code: string,
    options: SkeletonOptions,
  ): { text: string; count: number } {
    const lines = code.split('\n');
    const result: string[] = [];
    let symbolCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;
      const lineTag = options.includeLineNumbers !== false ? ` # [L${lineNum}]` : '';

      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        if (options.includeImports !== false) {
          result.push(line);
        }
        continue;
      }

      if (
        trimmed.startsWith('class ') ||
        trimmed.startsWith('def ') ||
        trimmed.startsWith('async def ')
      ) {
        symbolCount++;
        const lastColonIdx = line.lastIndexOf(':');
        const signature = lastColonIdx !== -1 ? line.slice(0, lastColonIdx + 1) : line;
        result.push(`${signature} ...${lineTag}`);
      }
    }

    return { text: result.join('\n'), count: symbolCount };
  }

  private generateRustSkeleton(
    code: string,
    options: SkeletonOptions,
  ): { text: string; count: number } {
    const lines = code.split('\n');
    const result: string[] = [];
    let symbolCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;
      const lineTag = options.includeLineNumbers !== false ? ` // [L${lineNum}]` : '';

      if (trimmed.startsWith('use ')) {
        if (options.includeImports !== false) {
          result.push(line);
        }
        continue;
      }

      if (
        trimmed.startsWith('pub struct ') ||
        trimmed.startsWith('struct ') ||
        trimmed.startsWith('pub enum ') ||
        trimmed.startsWith('pub trait ')
      ) {
        symbolCount++;
        result.push(`${line}${lineTag}`);
        continue;
      }

      if (trimmed.match(/^(?:pub\s+)?(?:async\s+)?fn\s+/)) {
        symbolCount++;
        const openBrace = line.indexOf('{');
        const sig = openBrace !== -1 ? line.slice(0, openBrace).trim() : line;
        result.push(`${sig} { /* ... */ }${lineTag}`);
      }
    }

    return { text: result.join('\n'), count: symbolCount };
  }

  private generateGoSkeleton(
    code: string,
    options: SkeletonOptions,
  ): { text: string; count: number } {
    const lines = code.split('\n');
    const result: string[] = [];
    let symbolCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const lineNum = i + 1;
      const lineTag = options.includeLineNumbers !== false ? ` // [L${lineNum}]` : '';

      if (trimmed.startsWith('import ')) {
        if (options.includeImports !== false) {
          result.push(line);
        }
        continue;
      }

      if (
        trimmed.startsWith('type ') &&
        (trimmed.includes('struct') || trimmed.includes('interface'))
      ) {
        symbolCount++;
        result.push(`${line}${lineTag}`);
        continue;
      }

      if (trimmed.startsWith('func ')) {
        symbolCount++;
        const openBrace = line.indexOf('{');
        const sig = openBrace !== -1 ? line.slice(0, openBrace).trim() : line;
        result.push(`${sig} { /* ... */ }${lineTag}`);
      }
    }

    return { text: result.join('\n'), count: symbolCount };
  }
}
