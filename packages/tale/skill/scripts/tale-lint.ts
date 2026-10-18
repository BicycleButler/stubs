#!/usr/bin/env node
/**
 * ASD-STE100 Issue 9 Linter for Markdown and Technical Text (TypeScript source).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { fileURLToPath } from 'node:url';

export interface STEIssue {
  lineNum: number;
  rule: string;
  message: string;
  context: string;
}

export interface FileReport {
  filePath: string;
  issues: STEIssue[];
}

export const RECURRING_ERRORS: Record<string, string> = {
  '\\bacceptable\\b': 'PERMITTED',
  '\\balternate\\b': 'ALTERNATIVE',
  '\\bany\\b': 'ALL / EACH / [omit]',
  '\\bavoid\\b': 'PREVENT',
  '\\bavoids\\b': 'PREVENTS',
  '\\bavoided\\b': 'PREVENTED',
  '\\bavoiding\\b': 'PREVENTING',
  '\\bboth\\b': 'THE TWO',
  '\\b(?:the|a|an|this|that|these|those)\\s+complete\\b': 'COMPLETED',
  '\\bcomplete\\s+(?:assembly|assemblies|set|sets|system|systems|list|lists|guide|guides|manual|manuals|unit|units|record|records|cycle|cycles)\\b':
    'COMPLETED',
  '\\bensure\\b': 'MAKE SURE',
  '\\bensures\\b': 'MAKES SURE',
  '\\bensured\\b': 'MADE SURE',
  '\\bensuring\\b': 'MAKING SURE',
  '\\bfurther\\b': 'MORE',
  '\\bhave to\\b': 'MUST / Use imperative form',
  '\\bhowever\\b': 'BUT',
  '\\bmain\\b': 'PRIMARY',
  '\\bmay\\b': 'CAN',
  '\\bneed to\\b': "NECESSARY (e.g. 'It is necessary to...')",
  '\\bpeople\\b': 'PERSON / PERSONNEL',
  '\\bperform\\b': 'DO',
  '\\bperforms\\b': 'DOES',
  '\\bperformed\\b': 'DID',
  '\\bperforming\\b': 'DOING',
  '\\bportion\\b': 'PART',
  '\\bportions\\b': 'PARTS',
  '\\bpress\\b': 'PUSH',
  '\\bpresses\\b': 'PUSHES',
  '\\bpressed\\b': 'PUSHED',
  '\\bpressing\\b': 'PUSHING',
  '\\breach\\b': 'GET TO',
  '\\breaches\\b': 'GETS TO',
  '\\breached\\b': 'GOT TO',
  '\\breaching\\b': 'GETTING TO',
  '\\brepeat\\b': 'DO ... AGAIN',
  '\\brepeats\\b': 'DOES ... AGAIN',
  '\\brepeated\\b': 'DID ... AGAIN',
  '\\brotate\\b': 'TURN',
  '\\brotates\\b': 'TURNS',
  '\\brotated\\b': 'TURNED',
  '\\brotating\\b': 'TURNING',
  '\\bsecure\\b': 'ATTACH / SAFETY',
  '\\bsecures\\b': 'ATTACHES',
  '\\bsecured\\b': 'ATTACHED',
  '\\bsecuring\\b': 'ATTACHING',
  '\\bshall\\b': 'MUST',
  '\\bshould\\b': 'MUST',
  '\\bsince\\b(?=\\s+[a-z0-9_]+\\s+(?:is|was|were|are|has|have|had|fails|failed|expires|expired|starts|started|cannot|can|will))':
    'BECAUSE',
  '\\btherefore\\b': 'THUS / AS A RESULT',
  '\\butilize\\b': 'USE',
  '\\butilizes\\b': 'USES',
  '\\butilized\\b': 'USED',
  '\\butilizing\\b': 'USING',
  '\\bwear\\b': 'PUT ON / USE',
  '\\bwears\\b': 'PUTS ON / USES',
  '\\bwearing\\b': 'PUTTING ON / USING',
};

export const CONTRACTIONS: string[] = [
  "\\bcan't\\b",
  "\\bdon't\\b",
  "\\bdoesn't\\b",
  "\\bdidn't\\b",
  "\\bwon't\\b",
  "\\bwouldn't\\b",
  "\\bshouldn't\\b",
  "\\bcouldn't\\b",
  "\\bisn't\\b",
  "\\baren't\\b",
  "\\bwasn't\\b",
  "\\bweren't\\b",
  "\\bhasn't\\b",
  "\\bhaven't\\b",
  "\\bhadn't\\b",
  "\\blet's\\b",
  "\\bit's\\b",
  "\\bthat's\\b",
  "\\bthere's\\b",
  "\\bthey're\\b",
  "\\bwe're\\b",
  "\\byou're\\b",
  "\\bi'm\\b",
  "\\byou've\\b",
  "\\bwe've\\b",
  "\\bthey've\\b",
  "\\bi've\\b",
  "\\byou'll\\b",
  "\\bhe'll\\b",
  "\\bshe'll\\b",
  "\\bwe'll\\b",
  "\\bthey'll\\b",
];

export const CONTRACTION_REPLACEMENTS: Record<string, string> = {
  "can't": 'cannot',
  "don't": 'do not',
  "doesn't": 'does not',
  "didn't": 'did not',
  "won't": 'will not',
  "wouldn't": 'would not',
  "shouldn't": 'should not',
  "couldn't": 'could not',
  "isn't": 'is not',
  "aren't": 'are not',
  "wasn't": 'was not',
  "weren't": 'were not',
  "hasn't": 'has not',
  "haven't": 'have not',
  "hadn't": 'had not',
  "let's": 'let us',
  "it's": 'it is',
  "that's": 'that is',
  "there's": 'there is',
  "they're": 'they are',
  "we're": 'we are',
  "you're": 'you are',
  "i'm": 'I am',
  "you've": 'you have',
  "we've": 'we have',
  "they've": 'they have',
  "i've": 'I have',
  "you'll": 'you will',
  "he'll": 'he will',
  "she'll": 'she will',
  "we'll": 'we will',
  "they'll": 'they will',
};

export const LATIN_ABBREVIATIONS: Record<string, string> = {
  '\\be\\.g\\.\\b': 'for example',
  '\\be\\.g\\b': 'for example',
  '\\bi\\.e\\.\\b': 'that is',
  '\\bi\\.e\\b': 'that is',
  '\\betc\\.\\b': 'and so on',
  '\\betc\\b': 'and so on',
  '\\bvia\\b': 'through / by',
  '\\bvs\\.\\b': 'compared with / against',
  '\\bvs\\b': 'compared with / against',
};

export const LATIN_REPLACEMENTS: Record<string, string> = {
  'e.g.': 'for example,',
  'e.g': 'for example,',
  'i.e.': 'that is,',
  'i.e': 'that is,',
  'etc.': 'and so on',
  etc: 'and so on',
  'vs.': 'against',
  vs: 'against',
};

export const SAFE_WORD_FIXES: Record<string, string> = {
  ensure: 'make sure that',
  Ensure: 'Make sure that',
  ensures: 'makes sure that',
  Ensures: 'Makes sure that',
  ensured: 'made sure that',
  Ensured: 'Made sure that',
  utilize: 'use',
  Utilize: 'Use',
  utilizes: 'uses',
  Utilizes: 'Uses',
  utilized: 'used',
  Utilized: 'Used',
  utilizing: 'using',
  Utilizing: 'Using',
  avoid: 'prevent',
  Avoid: 'Prevent',
  avoids: 'prevents',
  Avoids: 'Prevents',
  avoided: 'prevented',
  Avoided: 'Prevented',
  avoiding: 'preventing',
  Avoiding: 'Preventing',
  may: 'can',
  May: 'Can',
};

const NOUN_ING_EXCEPTIONS = new Set([
  'bearing',
  'training',
  'lighting',
  'warning',
  'heading',
  'spring',
  'wing',
  'string',
  'ceiling',
  'building',
  'cabling',
  'housing',
  'coating',
  'lining',
  'tubing',
  'padding',
  'routing',
  'spacing',
  'ranking',
  'meaning',
  'understanding',
  'timing',
]);

export function calculateSTEWordCount(sentence: string): number {
  let text = sentence;
  text = text.replace(/"[^"]*"/g, ' QUOTED_TOKEN ');
  text = text.replace(/(?<=^|[\s([<{])'([^'\n]+)'(?=[\s)\]}>.,:;!?]|$)/g, ' QUOTED_TOKEN ');
  text = text.replace(/\([^)]*\)/g, ' PAREN_TOKEN ');
  text = text.replace(
    /\b\d+(\.\d+)?\s*(mA|ms|s|min|h|mm|cm|m|km|kg|g|psi|V|A|Byte|MB|GB|KB|%|cents|USD)\b/gi,
    ' UNIT_TOKEN ',
  );

  const tokens = text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && /[a-zA-Z0-9]/.test(t));

  return tokens.length;
}

function protectAbbreviations(text: string): string {
  return text
    .replace(/\be\.g\./gi, '___EG_DOT___')
    .replace(/\bi\.e\./gi, '___IE_DOT___')
    .replace(/\bfig\./gi, '___FIG_DOT___')
    .replace(/\bref\./gi, '___REF_DOT___')
    .replace(/\bno\./gi, '___NO_DOT___')
    .replace(/\bvs\./gi, '___VS_DOT___')
    .replace(/\bdr\./gi, '___DR_DOT___');
}

function restoreAbbreviations(text: string): string {
  return text
    .replace(/___EG_DOT___/g, 'e.g.')
    .replace(/___IE_DOT___/g, 'i.e.')
    .replace(/___FIG_DOT___/g, 'Fig.')
    .replace(/___REF_DOT___/g, 'Ref.')
    .replace(/___NO_DOT___/g, 'No.')
    .replace(/___VS_DOT___/g, 'vs.')
    .replace(/___DR_DOT___/g, 'Dr.');
}

export function splitIntoSentences(
  content: string,
): Array<{ text: string; lineNum: number; isListItem: boolean }> {
  const sentences: Array<{ text: string; lineNum: number; isListItem: boolean }> = [];
  const lines = content.split(/\r?\n/);

  let inFrontmatter = false;
  let inCodeBlock = false;
  let inNonSTEBlock = false;

  const blocks: Array<{ lines: Array<{ text: string; lineNum: number }>; isListItem: boolean }> =
    [];
  let currentBlock: {
    lines: Array<{ text: string; lineNum: number }>;
    isListItem: boolean;
  } | null = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    let stripped = rawLine.trim();
    const lineNum = idx + 1;

    if (idx === 0 && stripped === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (stripped === '---') inFrontmatter = false;
      continue;
    }

    if (stripped.startsWith('```') || stripped.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    if (inCodeBlock) continue;

    if (stripped.toLowerCase().includes('non-ste')) {
      inNonSTEBlock = true;
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    if (inNonSTEBlock) {
      if (
        stripped.toLowerCase().includes('revision') ||
        stripped.toLowerCase().includes('asd-ste') ||
        stripped.startsWith('###') ||
        stripped.startsWith('---') ||
        (/^(\*|-|\d+\.)\s+/.test(stripped) && !stripped.toLowerCase().includes('non-ste'))
      ) {
        inNonSTEBlock = false;
      } else {
        continue;
      }
    }

    if (stripped.startsWith('>')) {
      stripped = stripped.replace(/^>+\s*/, '').trim();
      if (/^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.test(stripped)) {
        stripped = stripped.replace(/^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '').trim();
      }
    }

    if (!stripped) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    if (
      stripped.startsWith('#') ||
      stripped.startsWith('|') ||
      stripped.startsWith('![') ||
      stripped.startsWith('<!--')
    ) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    const isListItem = /^(\*|-|\+|\d+\.)\s+/.test(stripped);

    if (isListItem) {
      if (currentBlock) {
        blocks.push(currentBlock);
      }
      currentBlock = {
        lines: [{ text: stripped.replace(/^(\*|-|\+|\d+\.)\s+/, ''), lineNum }],
        isListItem: true,
      };
    } else {
      if (!currentBlock) {
        currentBlock = {
          lines: [{ text: stripped, lineNum }],
          isListItem: false,
        };
      } else {
        currentBlock.lines.push({ text: stripped, lineNum });
      }
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  for (const block of blocks) {
    const startLineNum = block.lines[0].lineNum;
    let fullText = block.lines.map((l) => l.text).join(' ');
    fullText = fullText.replace(/`[^`]*`/g, ' code_span ');
    fullText = fullText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    fullText = fullText.replace(/\*\([^*]*\)\*/g, '');

    const protectedText = protectAbbreviations(fullText);
    const rawSentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"]|$)/);
    for (const raw of rawSentences) {
      const restored = restoreAbbreviations(raw).trim();
      if (restored.length > 0) {
        sentences.push({
          text: restored,
          lineNum: startLineNum,
          isListItem: block.isListItem,
        });
      }
    }
  }

  return sentences;
}

export function extractCodeComments(
  content: string,
): Array<{ text: string; lineNum: number; isListItem: boolean }> {
  const sentences: Array<{ text: string; lineNum: number; isListItem: boolean }> = [];
  const lines = content.split(/\r?\n/);

  let inBlockComment = false;
  const blocks: Array<{ lines: Array<{ text: string; lineNum: number }> }> = [];
  let currentBlock: { lines: Array<{ text: string; lineNum: number }> } | null = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const lineNum = idx + 1;

    if (inBlockComment) {
      if (rawLine.includes('*/')) {
        inBlockComment = false;
        const commentPart = rawLine
          .substring(0, rawLine.indexOf('*/'))
          .replace(/^\s*\*+\s?/, '')
          .trim();
        if (commentPart && !commentPart.startsWith('@')) {
          if (!currentBlock) currentBlock = { lines: [] };
          currentBlock.lines.push({ text: commentPart, lineNum });
        }
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      } else {
        const commentPart = rawLine.replace(/^\s*\*+\s?/, '').trim();
        if (commentPart && !commentPart.startsWith('@')) {
          if (!currentBlock) currentBlock = { lines: [] };
          currentBlock.lines.push({ text: commentPart, lineNum });
        }
      }
      continue;
    }

    let inQuote: string | null = null;
    let commentStartIdx = -1;
    let isBlockStart = false;

    for (let c = 0; c < rawLine.length; c++) {
      const ch = rawLine[c];
      const next = rawLine[c + 1] || '';

      if (inQuote) {
        if (ch === '\\' && rawLine[c + 1]) {
          c++;
        } else if (ch === inQuote) {
          inQuote = null;
        }
        continue;
      }

      if (ch === '"' || ch === "'" || ch === '`') {
        inQuote = ch;
        continue;
      }

      if (ch === '/' && next === '/') {
        commentStartIdx = c;
        break;
      }

      if (ch === '/' && next === '*') {
        commentStartIdx = c;
        isBlockStart = true;
        break;
      }
    }

    if (isBlockStart) {
      const rest = rawLine.substring(commentStartIdx);
      if (rest.includes('*/')) {
        const inner = rest
          .replace(/^\/\*+/, '')
          .replace(/\*+\/.*$/, '')
          .trim();
        if (inner && !inner.startsWith('@')) {
          blocks.push({ lines: [{ text: inner, lineNum }] });
        }
      } else {
        inBlockComment = true;
        const inner = rest.replace(/^\/\*+/, '').trim();
        if (inner && !inner.startsWith('@')) {
          currentBlock = { lines: [{ text: inner, lineNum }] };
        }
      }
      continue;
    }

    if (commentStartIdx !== -1) {
      const commentText = rawLine.substring(commentStartIdx + 2).trim();
      if (
        commentText &&
        !commentText.startsWith('eslint-') &&
        !commentText.startsWith('@ts-') &&
        !commentText.startsWith('prettier-ignore')
      ) {
        if (!currentBlock) {
          currentBlock = { lines: [{ text: commentText, lineNum }] };
        } else {
          currentBlock.lines.push({ text: commentText, lineNum });
        }
        continue;
      }
    }

    if (currentBlock) {
      blocks.push(currentBlock);
      currentBlock = null;
    }
  }

  if (currentBlock) blocks.push(currentBlock);

  for (const block of blocks) {
    const startLineNum = block.lines[0].lineNum;
    let fullText = block.lines.map((l) => l.text).join(' ');
    fullText = fullText.replace(/`[^`]*`/g, ' code_span ');

    const protectedText = protectAbbreviations(fullText);
    const rawSentences = protectedText.split(/(?<=[.!?])\s+(?=[A-Z0-9"]|$)/);
    for (const raw of rawSentences) {
      const restored = restoreAbbreviations(raw).trim();
      if (restored.length > 0) {
        sentences.push({
          text: restored,
          lineNum: startLineNum,
          isListItem: false,
        });
      }
    }
  }

  return sentences;
}

export function lintSTE(content: string, isCodeFile = false): STEIssue[] {
  const issues: STEIssue[] = [];
  const sentences = isCodeFile ? extractCodeComments(content) : splitIntoSentences(content);

  for (const item of sentences) {
    const { text, lineNum, isListItem } = item;

    let cleanText = text.replace(/&[a-zA-Z0-9#]+;/g, ' ENTITY_TOKEN ');
    cleanText = cleanText.replace(/https?:\/\/[^\s)\]>"]+/g, ' URL_TOKEN ');

    if (cleanText.includes(';')) {
      issues.push({
        lineNum,
        rule: 'Rule 8.1',
        message: 'Semicolons (;) are strictly prohibited. Split into separate sentences.',
        context: text,
      });
    }

    for (const pattern of CONTRACTIONS) {
      const regex = new RegExp(pattern, 'i');
      const match = cleanText.match(regex);
      if (match) {
        issues.push({
          lineNum,
          rule: 'Rule 4.2',
          message: `Contraction '${match[0]}' found. Contractions are prohibited in STE.`,
          context: text,
        });
      }
    }

    for (const [pattern, replacement] of Object.entries(LATIN_ABBREVIATIONS)) {
      const regex = new RegExp(pattern, 'i');
      const match = cleanText.match(regex);
      if (match) {
        issues.push({
          lineNum,
          rule: 'GR-6',
          message: `Latin abbreviation '${match[0]}' found. Use '${replacement}' instead.`,
          context: text,
        });
      }
    }

    const progressiveMatch = cleanText.match(
      /\b(am|is|are|was|were|be|been|being)\s+([a-z]+ing)\b/i,
    );
    if (progressiveMatch) {
      const participle = progressiveMatch[2].toLowerCase();
      if (!NOUN_ING_EXCEPTIONS.has(participle)) {
        issues.push({
          lineNum,
          rule: 'Rule 1.6 / Rule 6',
          message: `Progressive '-ing' construction '${progressiveMatch[0]}' found. Progressive verbs are prohibited in STE; use simple present or past tense.`,
          context: text,
        });
      }
    }

    for (const [pattern, replacement] of Object.entries(RECURRING_ERRORS)) {
      const regex = new RegExp(pattern, 'i');
      const match = cleanText.match(regex);
      if (match) {
        issues.push({
          lineNum,
          rule: 'Part 2 Dictionary',
          message: `Unapproved word '${match[0]}' found. Use approved alternative '${replacement}'.`,
          context: text,
        });
      }
    }

    const wordCount = calculateSTEWordCount(text);
    if (isListItem) {
      if (wordCount > 20) {
        issues.push({
          lineNum,
          rule: 'Rule 5.1',
          message: `Procedural sentence has ${wordCount} words (Maximum allowed is 20 words).`,
          context: text,
        });
      }
    } else {
      if (wordCount > 25) {
        issues.push({
          lineNum,
          rule: 'Rule 6.3',
          message: `Descriptive sentence has ${wordCount} words (Maximum allowed is 25 words).`,
          context: text,
        });
      }
    }
  }

  return issues;
}

export interface AgentFirstConfig {
  patterns: string[];
  exclude: string[];
}

export interface TaleConfig {
  agentFirst?: {
    patterns?: string[];
    exclude?: string[];
  };
}

export interface ResolvedTaleConfig {
  agentFirst: AgentFirstConfig;
}

export const DEFAULT_TALE_CONFIG: ResolvedTaleConfig = {
  agentFirst: {
    patterns: [
      'AGENTS.md',
      'RULES.md',
      '**/*context*',
      'knowledge/architecture/**',
      '**/*.spec.md',
    ],
    exclude: [
      'README.md',
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      'LICENSE.md',
      '**/visual-*',
      '**/diagram*',
    ],
  },
};

export function matchesGlobPattern(filePath: string, pattern: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  let regexStr = normalizedPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '___GLOBSTAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___GLOBSTAR___/g, '.*')
    .replace(/\?/g, '.');

  if (!regexStr.startsWith('.*') && !regexStr.startsWith('/')) {
    regexStr = `(?:^|.*/)${regexStr}`;
  }
  const regex = new RegExp(`^${regexStr}$`, 'i');
  return regex.test(normalizedPath);
}

export function loadTaleConfig(rootDir = process.cwd()): ResolvedTaleConfig {
  try {
    const rcPath = path.join(rootDir, '.talerc.json');
    if (fs.existsSync(rcPath)) {
      const parsed = JSON.parse(fs.readFileSync(rcPath, 'utf-8')) as TaleConfig;
      return {
        agentFirst: {
          patterns: parsed.agentFirst?.patterns ?? DEFAULT_TALE_CONFIG.agentFirst.patterns,
          exclude: parsed.agentFirst?.exclude ?? DEFAULT_TALE_CONFIG.agentFirst.exclude,
        },
      };
    }

    const pkgPath = path.join(rootDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { tale?: TaleConfig };
      if (pkg.tale?.agentFirst) {
        return {
          agentFirst: {
            patterns: pkg.tale.agentFirst.patterns ?? DEFAULT_TALE_CONFIG.agentFirst.patterns,
            exclude: pkg.tale.agentFirst.exclude ?? DEFAULT_TALE_CONFIG.agentFirst.exclude,
          },
        };
      }
    }
  } catch {
    // Fall back to default configuration on read or parse errors
  }
  return DEFAULT_TALE_CONFIG;
}

export function isAgentFirstFile(
  filePath: string,
  content = '',
  config: ResolvedTaleConfig = DEFAULT_TALE_CONFIG,
): boolean {
  const norm = filePath.replace(/\\/g, '/');

  for (const ex of config.agentFirst.exclude) {
    if (matchesGlobPattern(norm, ex)) {
      return false;
    }
  }

  if (content && typeof content === 'string') {
    if (
      /^---\n[\s\S]*?(?:type:\s*["']?context-map["']?|agent_first:\s*true)[\s\S]*?\n---/.test(
        content,
      )
    ) {
      return true;
    }
  }

  for (const pattern of config.agentFirst.patterns) {
    if (matchesGlobPattern(norm, pattern)) {
      return true;
    }
  }

  return false;
}

export function lintAgentFirst(content: string): STEIssue[] {
  const issues: STEIssue[] = [];
  const lines = content.split('\n');

  let frontmatterEndLine = 0;
  if (lines.length > 0 && lines[0]?.trim() === '---') {
    for (let i = 1; i < lines.length; i++) {
      if (lines[i]?.trim() === '---') {
        frontmatterEndLine = i + 1;
        break;
      }
    }
  }

  const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  let consecutiveBlankLines = 0;
  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNum = i + 1;
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      inCodeFence = !inCodeFence;
      if (inCodeFence && trimmed.toLowerCase().startsWith('```mermaid')) {
        issues.push({
          lineNum,
          rule: 'ADR-001 Rule 7',
          message:
            'Embedded Mermaid diagram detected. Decouple visual diagrams into separate files.',
          context: line,
        });
      }
      continue;
    }

    if (inCodeFence) {
      continue;
    }

    if (lineNum <= frontmatterEndLine) {
      continue;
    }

    if (trimmed === '') {
      consecutiveBlankLines++;
      if (consecutiveBlankLines > 1) {
        issues.push({
          lineNum,
          rule: 'ADR-001 Rule 5',
          message:
            'Multiple consecutive blank lines detected. Use single line breaks between sections.',
          context: '<blank line>',
        });
      }
      continue;
    } else {
      consecutiveBlankLines = 0;
    }

    const globalEmojiRegex = new RegExp(EMOJI_REGEX.source, 'gu');
    let emojiMatch: RegExpExecArray | null;
    while ((emojiMatch = globalEmojiRegex.exec(line)) !== null) {
      issues.push({
        lineNum,
        rule: 'ADR-001 Rule 1',
        message: `Multi-byte emoji or decorative symbol '${emojiMatch[0]}' detected. Prohibited in agent-first files.`,
        context: line,
      });
    }

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      issues.push({
        lineNum,
        rule: 'ADR-001 Rule 1',
        message:
          'Decorative horizontal divider rule detected outside frontmatter header. Prohibited in agent-first files.',
        context: line,
      });
    }

    if (/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(trimmed)) {
      issues.push({
        lineNum,
        rule: 'ADR-001 Rule 2',
        message:
          'Multi-column Markdown table detected. Use compact pipe-delimited records instead.',
        context: line,
      });
    }

    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let linkMatch: RegExpExecArray | null;
    while ((linkMatch = linkRegex.exec(line)) !== null) {
      const label = linkMatch[1]?.trim() ?? '';
      const target = linkMatch[2]?.trim() ?? '';
      if (
        label !== target &&
        !label.endsWith(target) &&
        (target.includes('/') || target.includes('.'))
      ) {
        issues.push({
          lineNum,
          rule: 'ADR-001 Rule 3',
          message: `Redundant link label '${linkMatch[0]}' detected. Use direct file anchor '[${target}]' or bare path.`,
          context: line,
        });
      }
    }
  }

  return issues;
}

export function autoFixContent(
  content: string,
  isAgentFirst = false,
): { fixed: string; fixCount: number } {
  let fixed = content;
  let fixCount = 0;

  for (const [contraction, replacement] of Object.entries(CONTRACTION_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${contraction.replace("'", "['’]")}\\b`, 'gi');
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, (match) => {
        fixCount++;
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
  }

  for (const [latin, replacement] of Object.entries(LATIN_REPLACEMENTS)) {
    const escaped = latin.replace(/\./g, '\\.');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, () => {
        fixCount++;
        return replacement;
      });
    }
  }

  for (const [target, replacement] of Object.entries(SAFE_WORD_FIXES)) {
    const regex = new RegExp(`\\b${target}\\b`, 'g');
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, () => {
        fixCount++;
        return replacement;
      });
    }
  }

  if (isAgentFirst) {
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(fixed)) {
      fixed = fixed.replace(emojiRegex, () => {
        fixCount++;
        return '';
      });
    }

    const multipleBlanks = /(\n[ \t]*){3,}/g;
    if (multipleBlanks.test(fixed)) {
      fixed = fixed.replace(multipleBlanks, () => {
        fixCount++;
        return '\n\n';
      });
    }

    const redundantLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    fixed = fixed.replace(redundantLinkRegex, (match, label, target) => {
      const cleanLabel = label.trim();
      const cleanTarget = target.trim();
      if (cleanLabel !== cleanTarget && (cleanTarget.includes('/') || cleanTarget.includes('.'))) {
        fixCount++;
        return `[${cleanTarget}]`;
      }
      return match;
    });
  }

  return { fixed, fixCount };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  // Can be executed directly with tsx or ts-node
  import('./tale-lint.mjs').then((mod) => mod.runCLI(process.argv));
}
