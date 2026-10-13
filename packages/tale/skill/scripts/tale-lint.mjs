#!/usr/bin/env node
/**
 * ASD-STE100 Issue 9 Linter for Markdown and Technical Text.
 *
 * Checks text and code comments against ASD-STE100 Issue 9 rules:
 * - Prohibits semicolons (Rule 8.1).
 * - Prohibits contractions (Rule 4.2).
 * - Prohibits Latin abbreviations (GR-6).
 * - Enforces sentence length limits:
 *     - Procedural (lists/steps): <= 20 words (Rule 5.1).
 *     - Descriptive: <= 25 words (Rule 6.3).
 * - Flags unapproved high-frequency non-STE words from Recurring Errors (Part 2) with full inflections.
 * - Flags progressive '-ing' verbs (Rule 1.6 / Rule 6).
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';
import { fileURLToPath } from 'node:url';

export const RECURRING_ERRORS = {
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

export const CONTRACTIONS = [
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

export const CONTRACTION_REPLACEMENTS = {
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

export const LATIN_ABBREVIATIONS = {
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

export const LATIN_REPLACEMENTS = {
  'e.g.': 'for example,',
  'e.g': 'for example,',
  'i.e.': 'that is,',
  'i.e': 'that is,',
  'etc.': 'and so on',
  etc: 'and so on',
  'vs.': 'against',
  vs: 'against',
};

export const SAFE_WORD_FIXES = {
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
};

// Known progressive nouns/technical terms that are not action verbs
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

/**
 * Calculates sentence word count obeying ASD-STE100 Section 8:
 * - Parentheses count as 1 word in the parent sentence.
 * - Numbers with units (e.g. '10 mA', '500 ms', '$100.00') count as 1 word.
 * - Quoted text counts as 1 word.
 * - Hyphenated words count as 1 word.
 */
export function calculateSTEWordCount(sentence) {
  let text = sentence;

  // Replace double-quoted strings with a single token
  text = text.replace(/"[^"]*"/g, ' QUOTED_TOKEN ');

  // Replace true single-quoted strings (delimited by spaces/boundaries, not possessive apostrophes like user's)
  text = text.replace(/(?<=^|[\s([{\<])'([^'\n]+)'(?=[\s)\]}>.,:;!?]|$)/g, ' QUOTED_TOKEN ');

  // Replace parenthetical clauses with a single token (Rule 8.5)
  text = text.replace(/\([^)]*\)/g, ' PAREN_TOKEN ');

  // Replace number + unit of measurement (Rule 8.6)
  text = text.replace(
    /\b\d+(\.\d+)?\s*(mA|ms|s|min|h|mm|cm|m|km|kg|g|psi|V|A|Byte|MB|GB|KB|%|cents|USD)\b/gi,
    ' UNIT_TOKEN ',
  );

  // Split on whitespace
  const tokens = text
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && /[a-zA-Z0-9]/.test(t));

  return tokens.length;
}

/**
 * Protects abbreviations before sentence splitting to prevent false sentence boundaries.
 */
function protectAbbreviations(text) {
  return text
    .replace(/\be\.g\./gi, '___EG_DOT___')
    .replace(/\bi\.e\./gi, '___IE_DOT___')
    .replace(/\bfig\./gi, '___FIG_DOT___')
    .replace(/\bref\./gi, '___REF_DOT___')
    .replace(/\bno\./gi, '___NO_DOT___')
    .replace(/\bvs\./gi, '___VS_DOT___')
    .replace(/\bdr\./gi, '___DR_DOT___');
}

function restoreAbbreviations(text) {
  return text
    .replace(/___EG_DOT___/g, 'e.g.')
    .replace(/___IE_DOT___/g, 'i.e.')
    .replace(/___FIG_DOT___/g, 'Fig.')
    .replace(/___REF_DOT___/g, 'Ref.')
    .replace(/___NO_DOT___/g, 'No.')
    .replace(/___VS_DOT___/g, 'vs.')
    .replace(/___DR_DOT___/g, 'Dr.');
}

/**
 * Parses markdown text into sentences while properly handling:
 * - YAML frontmatter skipping
 * - Fenced code blocks skipping
 * - Tables and HTML comments skipping
 * - Blockquotes: strips leading '>' and alert markers ([!NOTE]), retaining text for linting
 * - Markdown links and inline code normalization
 * - Protection of abbreviation periods
 */
export function splitIntoSentences(content) {
  const sentences = [];
  const lines = content.split(/\r?\n/);

  let inFrontmatter = false;
  let inCodeBlock = false;
  let inNonSTEBlock = false;

  const blocks = [];
  let currentBlock = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    let stripped = rawLine.trim();
    const lineNum = idx + 1;

    // Track YAML frontmatter
    if (idx === 0 && stripped === '---') {
      inFrontmatter = true;
      continue;
    }
    if (inFrontmatter) {
      if (stripped === '---') {
        inFrontmatter = false;
      }
      continue;
    }

    // Track fenced code blocks
    if (stripped.startsWith('```') || stripped.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }
    if (inCodeBlock) {
      continue;
    }

    // Track Non-STE example blocks
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

    // Handle blockquotes: do not skip, strip '>' and optional alert tags
    if (stripped.startsWith('>')) {
      stripped = stripped.replace(/^>+\s*/, '').trim();
      // Skip callout tag lines like [!NOTE], [!WARNING] if alone or strip prefix
      if (/^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i.test(stripped)) {
        stripped = stripped.replace(/^\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '').trim();
      }
    }

    // Skip empty lines (paragraph boundary)
    if (!stripped) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = null;
      }
      continue;
    }

    // Skip Markdown headers, tables, HTML comments
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

  if (currentBlock) {
    blocks.push(currentBlock);
  }

  for (const block of blocks) {
    const startLineNum = block.lines[0].lineNum;
    let fullText = block.lines.map((l) => l.text).join(' ');

    // Normalize code spans to placeholder
    fullText = fullText.replace(/`[^`]*`/g, ' code_span ');
    // Normalize markdown links [label](url) -> label
    fullText = fullText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    // Handle ADR-001 compact records (- Col 1 | Col 2 | Col 3) as discrete tabular fields
    if (block.isListItem && fullText.includes(' | ')) {
      const cells = fullText.split(/\s+\|\s+/);
      for (const cell of cells) {
        const protectedCell = protectAbbreviations(cell);
        const rawSentences = protectedCell.split(/(?<=[.!?])\s+(?=[A-Z0-9"]|$)/);
        for (const raw of rawSentences) {
          const restored = restoreAbbreviations(raw).trim();
          if (restored.length > 0) {
            sentences.push({
              text: restored,
              lineNum: startLineNum,
              isListItem: false, // Compact record cells represent descriptive tabular data
            });
          }
        }
      }
      continue;
    }

    const protectedText = protectAbbreviations(fullText);

    // Split on terminal punctuation followed by space and uppercase/quote or end of string
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

/**
 * Extracts comments and docstrings from source code while ignoring comments inside string literals.
 */
export function extractCodeComments(content) {
  const sentences = [];
  const lines = content.split(/\r?\n/);

  let inBlockComment = false;
  const blocks = [];
  let currentBlock = null;

  for (let idx = 0; idx < lines.length; idx++) {
    const rawLine = lines[idx];
    const lineNum = idx + 1;
    const stripped = rawLine.trim();

    // Handle inside block comment
    if (inBlockComment) {
      if (stripped.includes('*/')) {
        inBlockComment = false;
        const commentPart = stripped
          .substring(0, stripped.indexOf('*/'))
          .replace(/^\*+\s?/, '')
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
        const commentPart = stripped.replace(/^\*+\s?/, '').trim();
        if (commentPart && !commentPart.startsWith('@')) {
          if (!currentBlock) currentBlock = { lines: [] };
          currentBlock.lines.push({ text: commentPart, lineNum });
        }
      }
      continue;
    }

    // Inspect line state char-by-char to avoid detecting '//' or '/*' inside quotes
    let inQuote = null;
    let commentStartIdx = -1;
    let isBlockStart = false;

    for (let c = 0; c < rawLine.length; c++) {
      const ch = rawLine[c];
      const next = rawLine[c + 1] || '';

      if (inQuote) {
        if (ch === '\\' && rawLine[c + 1]) {
          c++; // skip escaped char
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
        // Single-line comment starts here
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

  if (currentBlock) {
    blocks.push(currentBlock);
  }

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

/**
 * Lints given text content against ASD-STE100 Issue 9 rules.
 */
export function lintSTE(content, isCodeFile = false) {
  const issues = [];
  const sentences = isCodeFile ? extractCodeComments(content) : splitIntoSentences(content);

  for (const item of sentences) {
    const { text, lineNum, isListItem } = item;

    // Mask HTML entities and raw URLs before checks
    let cleanText = text.replace(/&[a-zA-Z0-9#]+;/g, ' ENTITY_TOKEN ');
    cleanText = cleanText.replace(/https?:\/\/[^\s)\]>"]+/g, ' URL_TOKEN ');

    // Rule 8.1: Semicolons
    if (cleanText.includes(';')) {
      issues.push({
        lineNum,
        rule: 'Rule 8.1',
        message: 'Semicolons (;) are strictly prohibited. Split into separate sentences.',
        context: text,
      });
    }

    // Rule 4.2: Contractions
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

    // GR-6: Latin abbreviations
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

    // Rule 1.6 / Rule 6: Progressive -ing verbs (auxiliary + present participle)
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

    // Part 2: Recurring Errors Dictionary
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

    // Rules 5.1 & 6.3: Sentence Length Limits
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

export const DEFAULT_TALE_CONFIG = {
  agentFirst: {
    patterns: [
      '**/*.md',
      '**/*.markdown',
    ],
    exclude: [
      'README.md',
      'QUICKSTART.md',
      'CONTRIBUTING.md',
      'CHANGELOG.md',
      'LICENSE.md',
      '**/visual-*',
      '**/diagram*',
    ],
  },
};

export function matchesGlobPattern(filePath, pattern) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const normalizedPattern = pattern.replace(/\\/g, '/');

  let regexStr = normalizedPattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\?/g, '[^/]')
    .replace(/\*\*\//g, '___GLOBSTAR_SLASH___')
    .replace(/\*\*/g, '___GLOBSTAR___')
    .replace(/\*/g, '[^/]*')
    .replace(/___GLOBSTAR_SLASH___/g, '(?:.*/)?')
    .replace(/___GLOBSTAR___/g, '.*');

  if (!regexStr.startsWith('.*') && !regexStr.startsWith('/') && !regexStr.startsWith('(?:')) {
    regexStr = `(?:^|.*/)${regexStr}`;
  }
  const regex = new RegExp(`^${regexStr}$`, 'i');
  return regex.test(normalizedPath);
}

export function loadTaleConfig(rootDir = process.cwd()) {
  try {
    const rcPath = path.join(rootDir, '.talerc.json');
    if (fs.existsSync(rcPath)) {
      const parsed = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
      return {
        agentFirst: {
          patterns: parsed.agentFirst?.patterns ?? DEFAULT_TALE_CONFIG.agentFirst.patterns,
          exclude: parsed.agentFirst?.exclude ?? DEFAULT_TALE_CONFIG.agentFirst.exclude,
        },
      };
    }

    const pkgPath = path.join(rootDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
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

export function isAgentFirstFile(filePath, content = '', config = DEFAULT_TALE_CONFIG) {
  const norm = filePath.replace(/\\/g, '/');

  for (const ex of config.agentFirst?.exclude ?? []) {
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

  for (const pattern of config.agentFirst?.patterns ?? []) {
    if (matchesGlobPattern(norm, pattern)) {
      return true;
    }
  }

  return false;
}

export function lintAgentFirst(content) {
  const issues = [];
  const lines = content.split('\n');

  let inFrontmatter = false;
  let frontmatterEndLine = 0;
  if (lines.length > 0 && lines[0].trim() === '---') {
    inFrontmatter = true;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        frontmatterEndLine = i + 1;
        inFrontmatter = false;
        break;
      }
    }
  }

  const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const UNICODE_BOX_DRAWING_REGEX = /[\u2500-\u257F\u2580-\u259F]/u;
  const ASCII_BOX_BORDER_REGEX = /\+[=-]{2,}\+/;
  let consecutiveBlankLines = 0;
  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      consecutiveBlankLines = 0;
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

    // Mask inline code spans before checking prose characters (preserve raw lines inside code fences)
    const lineWithoutInlineCode = inCodeFence ? line : line.replace(/`[^`]*`/g, ' code_span ');

    if (UNICODE_BOX_DRAWING_REGEX.test(lineWithoutInlineCode) || ASCII_BOX_BORDER_REGEX.test(lineWithoutInlineCode)) {
      issues.push({
        lineNum,
        rule: 'ADR-001 Rule 1',
        message:
          'ASCII art or box-drawing character detected. Prohibited in agent-first and token-optimized files.',
        context: line,
      });
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
    let emojiMatch;
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
    let linkMatch;
    while ((linkMatch = linkRegex.exec(line)) !== null) {
      const label = linkMatch[1].trim();
      const target = linkMatch[2].trim();
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

/**
 * Automatically applies safe remediation fixes (contractions, Latin abbreviations, safe word replacements).
 */
export function autoFixContent(content, isAgentFirst = false) {
  let fixed = content;
  let fixCount = 0;

  // Fix contractions
  for (const [contraction, replacement] of Object.entries(CONTRACTION_REPLACEMENTS)) {
    const regex = new RegExp(`\\b${contraction.replace("'", "['’]")}\\b`, 'gi');
    if (regex.test(fixed)) {
      fixed = fixed.replace(regex, (match) => {
        fixCount++;
        // Maintain initial capitalization
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
  }

  // Fix Latin abbreviations
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

  // Fix safe unambiguous words
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
    // Strip multi-byte emojis
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    if (emojiRegex.test(fixed)) {
      fixed = fixed.replace(emojiRegex, () => {
        fixCount++;
        return '';
      });
    }

    // Strip decorative horizontal dividers outside frontmatter
    const dividerLines = fixed.split('\n');
    let inFm = false;
    let fmEnd = 0;
    if (dividerLines.length > 0 && dividerLines[0].trim() === '---') {
      inFm = true;
      for (let i = 1; i < dividerLines.length; i++) {
        if (dividerLines[i].trim() === '---') {
          fmEnd = i + 1;
          inFm = false;
          break;
        }
      }
    }
    let inFence = false;
    const strippedLines = [];
    for (let i = 0; i < dividerLines.length; i++) {
      const line = dividerLines[i];
      const lineNum = i + 1;
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        inFence = !inFence;
        strippedLines.push(line);
        continue;
      }
      if (inFence || lineNum <= fmEnd) {
        strippedLines.push(line);
        continue;
      }
      if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
        fixCount++;
        continue;
      }
      strippedLines.push(line);
    }
    fixed = strippedLines.join('\n');

    // Convert Markdown tables to compact pipe-delimited records
    const tableLines = fixed.split('\n');
    const convertedLines = [];
    inFence = false;
    let idx = 0;

    const isTableRow = (str) => {
      const s = str.trim();
      return s.startsWith('|') && s.endsWith('|') && s.includes('|');
    };
    const isDelimiterRow = (str) => {
      const s = str.trim();
      return /^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)+\|?$/.test(s);
    };
    const parseCells = (row) => {
      let s = row.trim();
      if (s.startsWith('|')) s = s.slice(1);
      if (s.endsWith('|')) s = s.slice(0, -1);
      return s.split('|').map((c) => c.trim());
    };

    while (idx < tableLines.length) {
      const line = tableLines[idx];
      const trimmed = line.trim();

      if (trimmed.startsWith('```')) {
        inFence = !inFence;
        convertedLines.push(line);
        idx++;
        continue;
      }

      if (inFence) {
        convertedLines.push(line);
        idx++;
        continue;
      }

      if (idx + 1 < tableLines.length && isTableRow(line) && isDelimiterRow(tableLines[idx + 1])) {
        fixCount++;
        const headerCells = parseCells(line);
        convertedLines.push(`- ${headerCells.join(' | ')}`);
        idx += 2; // skip header and delimiter row

        while (idx < tableLines.length && isTableRow(tableLines[idx])) {
          fixCount++;
          const rowCells = parseCells(tableLines[idx]);
          convertedLines.push(`- ${rowCells.join(' | ')}`);
          idx++;
        }
        continue;
      }

      convertedLines.push(line);
      idx++;
    }
    fixed = convertedLines.join('\n');

    // Strip standalone Unicode box-drawing borders, frames, and tree branches
    const boxLines = fixed.split('\n');
    const cleanedBoxLines = [];
    for (const bLine of boxLines) {
      const trimmed = bLine.trim();
      // Skip pure box border lines (e.g. ┌────┐, └────┘, ├────┤, ══════)
      if (
        trimmed.length >= 3 &&
        /^[\u2500-\u257F\u2550-\u256C+\-=_|~ ]+$/.test(trimmed) &&
        /[\u2500-\u257F\u2550-\u256C]/.test(trimmed)
      ) {
        fixCount++;
        continue;
      }
      // Strip leading and trailing vertical box borders
      let cleaned = bLine.replace(/^(\s*)[│║]\s*/, '$1').replace(/\s*[│║](\s*)$/, '$1');
      // Normalize tree branch prefixes (e.g. ├─►, └─►, ├──, └──) to bullet points
      if (/^\s*[└├][─═]+[►> ]\s*/.test(cleaned)) {
        cleaned = cleaned.replace(/^\s*[└├][─═]+[►> ]\s*/, '- ');
        fixCount++;
      }
      if (cleaned !== bLine) {
        fixCount++;
      }
      cleanedBoxLines.push(cleaned);
    }
    fixed = cleanedBoxLines.join('\n');

    // Collapse consecutive blank lines
    const multipleBlanks = /(\n[ \t]*){3,}/g;
    if (multipleBlanks.test(fixed)) {
      fixed = fixed.replace(multipleBlanks, () => {
        fixCount++;
        return '\n\n';
      });
    }

    // Convert redundant links [Label](path/to/file) to [path/to/file]
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

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const DOC_EXTENSIONS = new Set(['.md', '.markdown']);
const IGNORED_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.stubs', '.gemini']);

function collectFiles(targetPath, mode) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);

  if (stat.isFile()) {
    const ext = path.extname(targetPath).toLowerCase();
    const isCode = CODE_EXTENSIONS.has(ext);
    const isDoc = DOC_EXTENSIONS.has(ext);
    if (isCode || isDoc) {
      return [{ filePath: targetPath, isCode }];
    }
    return [];
  }

  if (stat.isDirectory()) {
    const results = [];
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }
      const full = path.join(targetPath, entry.name);
      if (entry.isDirectory()) {
        results.push(...collectFiles(full, mode));
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const isCode = CODE_EXTENSIONS.has(ext);
        const isDoc = DOC_EXTENSIONS.has(ext);

        if (mode === 'all' && (isCode || isDoc)) {
          results.push({ filePath: full, isCode });
        } else if (mode === 'code' && isCode) {
          results.push({ filePath: full, isCode: true });
        } else if (mode === 'docs' && isDoc) {
          results.push({ filePath: full, isCode: false });
        }
      }
    }
    return results;
  }

  return [];
}

export function runCLI(argv) {
  const args = argv.slice(2);
  let textInput = null;
  let jsonOutput = false;
  let fixMode = false;
  let mode = 'docs';
  let forceAgentFirst = false;
  const paths = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--text' || arg === '-t') {
      textInput = args[++i];
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (arg === '--fix') {
      fixMode = true;
    } else if (arg === '--agent-first') {
      forceAgentFirst = true;
    } else if (arg === '--code' || arg === '-c') {
      mode = 'code';
    } else if (arg === '--all' || arg === '-a') {
      mode = 'all';
    } else if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`ASD-STE100 Issue 9 Linter (TALE)

Usage:
  node tale-lint.mjs [options] [files/directories...]

Options:
  -t, --text <STRING>   Lint direct text string input
  -c, --code            Scan code comments in TypeScript/JavaScript files (.ts, .tsx, .js)
  -a, --all             Scan both documentation (.md) and code comments (.ts, .js)
  --agent-first         Force ADR-001 Agent-First syntax checks (compact records, no emojis, no redundant links)
  --fix                 Automatically fix violations: convert tables to compact pipe records,
                        remove ':--', strip box frames/dividers, normalize links, fix contractions
  --json                Output results in JSON format
  -h, --help            Show this help message

Default:
  If no files or directories are provided, scans all Markdown files in the current repository.
`);
      process.exit(0);
    } else {
      paths.push(arg);
    }
  }

  const taleConfig = loadTaleConfig();
  const reports = [];
  let totalViolations = 0;

  if (textInput !== null) {
    if (fixMode) {
      const { fixed, fixCount } = autoFixContent(textInput, forceAgentFirst);
      console.log(`Auto-fixed ${fixCount} item(s):\n${fixed}`);
      process.exit(0);
    }

    const isCode = textInput.startsWith('//') || textInput.startsWith('/*');
    const issues = lintSTE(textInput, isCode);
    if (!isCode && forceAgentFirst) {
      issues.push(...lintAgentFirst(textInput));
      issues.sort((a, b) => a.lineNum - b.lineNum);
    }
    totalViolations += issues.length;
    reports.push({ filePath: 'inline-text', issues });

    if (jsonOutput) {
      console.log(JSON.stringify(reports, null, 2));
    } else {
      if (issues.length === 0) {
        console.log('✓ Text is fully ASD-STE100 Issue 9 compliant.');
      } else {
        console.log(`Found ${issues.length} violation(s):`);
        for (const issue of issues) {
          console.log(`  Line ${issue.lineNum} [${issue.rule}]: ${issue.message}`);
          console.log(`  -> "${issue.context}"`);
        }
      }
    }
    process.exit(totalViolations > 0 ? 1 : 0);
  }

  // Default to scanning current repository if no paths provided
  if (paths.length === 0) {
    paths.push('.');
  }

  const targets = [];
  for (const p of paths) {
    targets.push(...collectFiles(p, mode));
  }

  if (targets.length === 0) {
    console.log('No matching documentation or code files found to lint.');
    process.exit(0);
  }

  let totalFixesApplied = 0;

  for (const target of targets) {
    try {
      let content = fs.readFileSync(target.filePath, 'utf-8');
      const isAgentFirst =
        !target.isCode &&
        (forceAgentFirst || isAgentFirstFile(target.filePath, content, taleConfig));

      if (fixMode) {
        const { fixed, fixCount } = autoFixContent(content, isAgentFirst);
        if (fixCount > 0) {
          fs.writeFileSync(target.filePath, fixed, 'utf-8');
          totalFixesApplied += fixCount;
          content = fixed;
        }
      }

      const issues = lintSTE(content, target.isCode);
      if (isAgentFirst) {
        issues.push(...lintAgentFirst(content));
        issues.sort((a, b) => a.lineNum - b.lineNum);
      }
      totalViolations += issues.length;
      reports.push({ filePath: target.filePath, issues });

      if (!jsonOutput) {
        const typeLabel = target.isCode
          ? '(Code Comments)'
          : isAgentFirst
            ? '(Docs - Agent-First Profile)'
            : '(Docs)';
        console.log(`\nScanning: ${target.filePath} ${typeLabel}`);
        if (issues.length === 0) {
          console.log('  ✓ Fully ASD-STE100 Issue 9 compliant.');
        } else {
          console.log(`  Found ${issues.length} violation(s):`);
          for (const issue of issues) {
            console.log(`    Line ${issue.lineNum} [${issue.rule}]: ${issue.message}`);
            console.log(`    -> "${issue.context}"`);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading ${target.filePath}:`, err);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(reports, null, 2));
  } else {
    if (fixMode) {
      console.log(`\nAuto-remediation applied: ${totalFixesApplied} fix(es).`);
    }
    if (totalViolations > 0) {
      console.log(`\nTotal violations remaining: ${totalViolations}`);
    } else {
      console.log('\nAll scanned files are compliant with ASD-STE100 Issue 9.');
    }
  }

  process.exit(totalViolations > 0 ? 1 : 0);
}

// Top-level execution guard: only run CLI when executed directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runCLI(process.argv);
}
