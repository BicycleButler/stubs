#!/usr/bin/env node
/**
 * ASD-STE100 Issue 9 & ADR-001 Unified Engine for Documentation & Code Comments.
 *
 * Provides consolidated auditing, auto-formatting, and remediation:
 * - Prohibits semicolons in prose (Rule 8.1) with auto-split to periods.
 * - Prohibits contractions (Rule 4.2) with auto-expansion.
 * - Prohibits Latin abbreviations (GR-6) with auto-replacement.
 * - Enforces sentence length limits (Rule 5.1 <= 20 words, Rule 6.3 <= 25 words).
 * - Flags and auto-replaces unapproved high-frequency non-STE terms.
 * - Flags progressive '-ing' verbs (Rule 1.6 / Rule 6).
 * - Converts Markdown tables into compact pipe-delimited records (ADR-001).
 * - Strips Unicode box borders, tree diagrams, and decorative dividers.
 * - Safely remediates code comments without altering executable code.
 * - Honors .gitignore, build exclusions, and excludes README.md and QUICKSTART.md by default.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import process from 'node:process';
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
  '\\bhas to\\b': 'MUST / Use imperative form',
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
  via: 'through',
};

export const SAFE_WORD_FIXES = {
  ensure: 'make sure that',
  ensures: 'makes sure that',
  ensured: 'made sure that',
  ensuring: 'making sure that',
  utilize: 'use',
  utilizes: 'uses',
  utilized: 'used',
  utilizing: 'using',
  shall: 'must',
  should: 'must',
  perform: 'do',
  performs: 'does',
  performed: 'did',
  performing: 'doing',
  acceptable: 'permitted',
  portion: 'part',
  portions: 'parts',
  'have to': 'must',
  'has to': 'must',
  rotate: 'turn',
  rotates: 'turns',
  rotated: 'turned',
  rotating: 'turning',
  via: 'through',
  both: 'the two',
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
 * - Numbers with units (for example,. '10 mA', '500 ms', '$100.00') count as 1 word.
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

    // Skip Markdown headers, tables, images, HTML comments
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
              isListItem: false,
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
  const blocks = [];

  let i = 0;
  const len = content.length;
  let currentLine = 1;
  let lastChar = '';
  let lastWord = '';

  const isRegexStart = (lc, lw) => {
    if (!lc) return true;
    if ('(=[;,!?:&|~^%*<>+-{'.includes(lc)) return true;
    return [
      'return',
      'case',
      'throw',
      'yield',
      'await',
      'typeof',
      'void',
      'delete',
      'in',
      'instanceof',
    ].includes(lw);
  };

  while (i < len) {
    const ch = content[i];
    const next = content[i + 1] || '';

    if (ch === '\n') {
      currentLine++;
      i++;
      lastChar = '\n';
      lastWord = '';
      continue;
    }

    // Handle string literals
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < len) {
        const cur = content[i];
        if (cur === '\n') currentLine++;
        if (cur === '\\') {
          i += 2;
          continue;
        }
        if (cur === quote) {
          i++;
          break;
        }
        i++;
      }
      lastChar = quote;
      lastWord = '';
      continue;
    }

    // Handle regex literals
    if (ch === '/' && next !== '/' && next !== '*' && isRegexStart(lastChar, lastWord)) {
      i++;
      let inCharClass = false;
      while (i < len) {
        const cur = content[i];
        if (cur === '\n') {
          break;
        }
        if (cur === '\\') {
          i += 2;
          continue;
        }
        if (cur === '[') {
          inCharClass = true;
        } else if (cur === ']' && inCharClass) {
          inCharClass = false;
        } else if (cur === '/' && !inCharClass) {
          i++;
          while (i < len && /[a-z]/i.test(content[i])) {
            i++;
          }
          break;
        }
        i++;
      }
      lastChar = '/';
      lastWord = '';
      continue;
    }

    // Single-line comment
    if (ch === '/' && next === '/') {
      const commentLineNum = currentLine;
      let end = content.indexOf('\n', i);
      if (end === -1) end = len;
      const rawComment = content.slice(i + 2, end).trim();
      if (
        rawComment &&
        !rawComment.startsWith('eslint-') &&
        !rawComment.startsWith('@ts-') &&
        !rawComment.startsWith('prettier-ignore') &&
        !rawComment.startsWith('istanbul ignore')
      ) {
        blocks.push({
          lines: [{ text: rawComment, lineNum: commentLineNum }],
          isListItem: /^(\*|-|\+|\d+\.)\s+/.test(rawComment),
        });
      }
      i = end;
      lastChar = '\n';
      lastWord = '';
      continue;
    }

    // Multi-line block comment
    if (ch === '/' && next === '*') {
      const startLineNum = currentLine;
      const end = content.indexOf('*/', i + 2);
      const actualEnd = end === -1 ? len : end + 2;
      const rawBlock = content.slice(i + 2, end === -1 ? len : end);

      const lines = rawBlock.split('\n');
      let lineCounter = startLineNum;
      let currentCommentBlock = null;

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx];
        const trimmed = line
          .replace(/^\s*\*+\s?/, '')
          .replace(/\*+\s*$/, '')
          .trim();
        if (
          trimmed &&
          !trimmed.startsWith('@') &&
          !trimmed.startsWith('eslint-') &&
          !trimmed.startsWith('@ts-') &&
          !trimmed.startsWith('istanbul ignore')
        ) {
          const isList = /^(\*|-|\+|\d+\.)\s+/.test(trimmed);
          if (isList) {
            if (currentCommentBlock) {
              blocks.push(currentCommentBlock);
            }
            currentCommentBlock = {
              lines: [{ text: trimmed.replace(/^(\*|-|\+|\d+\.)\s+/, ''), lineNum: lineCounter }],
              isListItem: true,
            };
          } else {
            if (!currentCommentBlock || currentCommentBlock.isListItem) {
              if (currentCommentBlock) blocks.push(currentCommentBlock);
              currentCommentBlock = {
                lines: [{ text: trimmed, lineNum: lineCounter }],
                isListItem: false,
              };
            } else {
              currentCommentBlock.lines.push({ text: trimmed, lineNum: lineCounter });
            }
          }
        } else if (!trimmed && currentCommentBlock) {
          blocks.push(currentCommentBlock);
          currentCommentBlock = null;
        }
        lineCounter++;
      }

      if (currentCommentBlock) {
        blocks.push(currentCommentBlock);
      }

      currentLine = startLineNum + lines.length - 1;
      i = actualEnd;
      lastChar = '/';
      lastWord = '';
      continue;
    }

    if (!/\s/.test(ch)) {
      lastChar = ch;
      if (/[a-zA-Z0-9_$]/.test(ch)) {
        lastWord += ch;
      } else {
        lastWord = '';
      }
    } else {
      lastWord = '';
    }
    i++;
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
          isListItem: Boolean(block.isListItem),
        });
      }
    }
  }

  return sentences;
}

/**
 * Lints text content against ASD-STE100 Issue 9 rules.
 */
export function lintSTE(content, isCodeFile = false) {
  const issues = [];
  const sentences = isCodeFile ? extractCodeComments(content) : splitIntoSentences(content);

  for (const item of sentences) {
    const { text, lineNum, isListItem } = item;

    // Mask HTML entities, raw URLs, code spans, and template tags before checks
    let cleanText = text.replace(/&[a-zA-Z0-9#]+;/g, ' ENTITY_TOKEN ');
    cleanText = cleanText.replace(/https?:\/\/[^\s)\]>"]+/g, ' URL_TOKEN ');
    cleanText = cleanText.replace(/`[^`]+`/g, ' CODE_TOKEN ');
    cleanText = cleanText.replace(/<%[\s\S]*?%>/g, ' CODE_TOKEN ');
    cleanText = cleanText.replace(/\{\{[\s\S]*?\}\}/g, ' CODE_TOKEN ');

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
    patterns: ['**/*.md', '**/*.markdown'],
    exclude: [
      'README.md',
      'README*.md',
      'QUICKSTART.md',
      'QUICKSTART*.md',
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
    // Fall back to default config on parse errors
  }
  return DEFAULT_TALE_CONFIG;
}

export function isAgentFirstFile(filePath, content = '', config = DEFAULT_TALE_CONFIG) {
  const norm = filePath.replace(/\\/g, '/');
  const base = path.basename(norm);

  if (/^(?:readme|quickstart)(?:[\.\-_].*)?\.md$/i.test(base)) {
    return false;
  }

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

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
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

    const lineWithoutInlineCode = inCodeFence ? line : line.replace(/`[^`]*`/g, ' code_span ');

    if (
      UNICODE_BOX_DRAWING_REGEX.test(lineWithoutInlineCode) ||
      ASCII_BOX_BORDER_REGEX.test(lineWithoutInlineCode)
    ) {
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
 * Automatically converts prose semicolons to periods and capitalizes the next word,
 * safely masking inline code, HTML entities, and URLs.
 */
export function fixProseSemicolons(text) {
  let working = text;
  let fixCount = 0;

  const entityTokens = [];
  working = working.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    const idx = entityTokens.length;
    entityTokens.push(match);
    return `___ENTITY_TOKEN_${idx}___`;
  });

  const codeTokens = [];
  working = working.replace(/`[^`]*`/g, (match) => {
    const idx = codeTokens.length;
    codeTokens.push(match);
    return `___CODE_TOKEN_${idx}___`;
  });

  const urlTokens = [];
  working = working.replace(/https?:\/\/[^\s)\]>"]+/g, (match) => {
    const idx = urlTokens.length;
    urlTokens.push(match);
    return `___URL_TOKEN_${idx}___`;
  });

  const templateTokens = [];
  working = working.replace(/<%[\s\S]*?%>/g, (match) => {
    const idx = templateTokens.length;
    templateTokens.push(match);
    return `___TEMPLATE_TOKEN_${idx}___`;
  });
  working = working.replace(/\{\{[\s\S]*?\}\}/g, (match) => {
    const idx = templateTokens.length;
    templateTokens.push(match);
    return `___TEMPLATE_TOKEN_${idx}___`;
  });

  // Convert semicolon followed by space and lowercase letter to period + space + uppercase letter
  const semiLetterRegex = /;\s+([a-z])/g;
  if (semiLetterRegex.test(working)) {
    working = working.replace(semiLetterRegex, (_, char) => {
      fixCount++;
      return `. ${char.toUpperCase()}`;
    });
  }

  // Convert semicolon followed by whitespace and uppercase/number/quote
  const semiGeneralRegex = /;\s+([A-Z0-9"'])/g;
  if (semiGeneralRegex.test(working)) {
    working = working.replace(semiGeneralRegex, (_, char) => {
      fixCount++;
      return `. ${char}`;
    });
  }

  // Convert terminal semicolon at end of line
  const semiLineEndRegex = /;(?=\s*$)/gm;
  if (semiLineEndRegex.test(working)) {
    working = working.replace(semiLineEndRegex, () => {
      fixCount++;
      return '.';
    });
  }

  // Restore tokens
  for (let i = 0; i < templateTokens.length; i++) {
    working = working.replace(`___TEMPLATE_TOKEN_${i}___`, templateTokens[i]);
  }
  for (let i = 0; i < urlTokens.length; i++) {
    working = working.replace(`___URL_TOKEN_${i}___`, urlTokens[i]);
  }
  for (let i = 0; i < codeTokens.length; i++) {
    working = working.replace(`___CODE_TOKEN_${i}___`, codeTokens[i]);
  }
  for (let i = 0; i < entityTokens.length; i++) {
    working = working.replace(`___ENTITY_TOKEN_${i}___`, entityTokens[i]);
  }

  return { text: working, fixCount };
}

/**
 * Replaces words while preserving the original casing (TitleCase, uppercase, lowercase).
 */
function replacePreservingCase(text, targetWord, replacement) {
  let count = 0;
  const escaped = targetWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi');

  const result = text.replace(regex, (match) => {
    count++;
    if (match === match.toUpperCase() && match.length > 1) {
      return replacement.toUpperCase();
    }
    if (match[0] === match[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }
    return replacement.toLowerCase();
  });

  return { result, count };
}

/**
 * Applies prose language fixes (semicolons, contractions, Latin abbreviations, safe words).
 */
export function autoFixProse(text) {
  let fixed = text;
  let fixCount = 0;

  // Prose semicolons
  const semiResult = fixProseSemicolons(fixed);
  fixed = semiResult.text;
  fixCount += semiResult.fixCount;

  // Contractions
  for (const [contraction, replacement] of Object.entries(CONTRACTION_REPLACEMENTS)) {
    const escaped = contraction.replace("'", "['’]");
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
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

  // Latin abbreviations
  if (/\be\.g\.?,?\s*/i.test(fixed)) {
    fixed = fixed.replace(/\be\.g\.?,?\s*/gi, () => {
      fixCount++;
      return 'for example, ';
    });
  }
  if (/\bi\.e\.?,?\s*/i.test(fixed)) {
    fixed = fixed.replace(/\bi\.e\.?,?\s*/gi, () => {
      fixCount++;
      return 'that is, ';
    });
  }
  if (/\betc\.?\b/i.test(fixed)) {
    fixed = fixed.replace(/\betc\.?\b/gi, () => {
      fixCount++;
      return 'and so on';
    });
  }
  if (/\bvs\.?\b/i.test(fixed)) {
    fixed = fixed.replace(/\bvs\.?\b/gi, () => {
      fixCount++;
      return 'against';
    });
  }

  // Safe vocabulary fixes
  for (const [target, replacement] of Object.entries(SAFE_WORD_FIXES)) {
    const { result, count } = replacePreservingCase(fixed, target, replacement);
    if (count > 0) {
      fixed = result;
      fixCount += count;
    }
  }

  return { fixed, fixCount };
}

/**
 * Formats and remediates comments in code files without touching executable logic or strings.
 */
export function formatCodeComments(codeContent) {
  let fixed = '';
  let fixCount = 0;

  let i = 0;
  const len = codeContent.length;
  let lastChar = '';
  let lastWord = '';

  const isRegexStart = (lc, lw) => {
    if (!lc) return true;
    if ('(=[;,!?:&|~^%*<>+-{'.includes(lc)) return true;
    return [
      'return',
      'case',
      'throw',
      'yield',
      'await',
      'typeof',
      'void',
      'delete',
      'in',
      'instanceof',
    ].includes(lw);
  };

  while (i < len) {
    const ch = codeContent[i];
    const next = codeContent[i + 1] || '';

    // Handle string literals: single, double, backtick
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      fixed += quote;
      i++;
      while (i < len) {
        const cur = codeContent[i];
        fixed += cur;
        if (cur === '\\') {
          i++;
          if (i < len) fixed += codeContent[i];
        } else if (cur === quote) {
          i++;
          break;
        }
        i++;
      }
      lastChar = quote;
      lastWord = '';
      continue;
    }

    // Handle regex literals
    if (ch === '/' && next !== '/' && next !== '*' && isRegexStart(lastChar, lastWord)) {
      fixed += ch;
      i++;
      let inCharClass = false;
      while (i < len) {
        const cur = codeContent[i];
        fixed += cur;
        if (cur === '\\') {
          i++;
          if (i < len) fixed += codeContent[i];
        } else if (cur === '[') {
          inCharClass = true;
        } else if (cur === ']' && inCharClass) {
          inCharClass = false;
        } else if (cur === '/' && !inCharClass) {
          i++;
          while (i < len && /[a-z]/i.test(codeContent[i])) {
            fixed += codeContent[i];
            i++;
          }
          break;
        }
        i++;
      }
      lastChar = '/';
      lastWord = '';
      continue;
    }

    // Single-line comments
    if (ch === '/' && next === '/') {
      let commentEnd = codeContent.indexOf('\n', i);
      if (commentEnd === -1) commentEnd = len;
      const fullCommentLine = codeContent.slice(i, commentEnd);
      const prefixMatch = fullCommentLine.match(/^(\/\/\s*)/);
      const prefix = prefixMatch ? prefixMatch[1] : '// ';
      const commentBody = fullCommentLine.slice(prefix.length);

      if (
        commentBody.startsWith('eslint-') ||
        commentBody.startsWith('@ts-') ||
        commentBody.startsWith('prettier-ignore') ||
        commentBody.startsWith('istanbul ignore')
      ) {
        fixed += fullCommentLine;
      } else {
        const { fixed: fixedBody, fixCount: fixes } = autoFixProse(commentBody);
        fixed += prefix + fixedBody;
        fixCount += fixes;
      }
      i = commentEnd;
      continue;
    }

    // Multi-line block comments
    if (ch === '/' && next === '*') {
      const commentEnd = codeContent.indexOf('*/', i + 2);
      const actualEnd = commentEnd === -1 ? len : commentEnd + 2;
      const fullBlock = codeContent.slice(i, actualEnd);

      if (
        fullBlock.includes('eslint-') ||
        fullBlock.includes('istanbul ignore') ||
        fullBlock.includes('@ts-')
      ) {
        fixed += fullBlock;
      } else {
        const lines = fullBlock.split('\n');
        const formattedLines = [];
        for (const line of lines) {
          const borderMatch = line.match(/^(\s*(?:\/\*+|\*+\/|\*+)?\s*)(.*?)(\s*\*+\/\s*)?$/);
          if (borderMatch) {
            const prefix = borderMatch[1] || '';
            const body = borderMatch[2] || '';
            const suffix = borderMatch[3] || '';

            if (!body) {
              formattedLines.push(line);
              continue;
            }

            const tagMatch = body.match(
              /^(@\w+(?:\s+\{[^}]*\})?(?:\s+[a-zA-Z0-9_$]+)?\s*[-–—]?\s*)(.*)$/,
            );
            if (tagMatch) {
              const tagHeader = tagMatch[1];
              const tagDesc = tagMatch[2];
              const { fixed: fixedDesc, fixCount: fixes } = autoFixProse(tagDesc);
              formattedLines.push(prefix + tagHeader + fixedDesc + suffix);
              fixCount += fixes;
            } else {
              const { fixed: fixedBody, fixCount: fixes } = autoFixProse(body);
              formattedLines.push(prefix + fixedBody + suffix);
              fixCount += fixes;
            }
          } else {
            formattedLines.push(line);
          }
        }
        fixed += formattedLines.join('\n');
      }
      i = actualEnd;
      continue;
    }

    fixed += ch;
    if (!/\s/.test(ch)) {
      lastChar = ch;
      if (/[a-zA-Z0-9_$]/.test(ch)) {
        lastWord += ch;
      } else {
        lastWord = '';
      }
    } else {
      lastWord = '';
    }
    i++;
  }

  return { fixed, fixCount };
}

/**
 * Automatically applies safe remediation fixes to Markdown or code files.
 */
export function autoFixContent(content, isAgentFirst = false, isCode = false) {
  if (isCode) {
    return formatCodeComments(content);
  }

  let fixed = content;
  let fixCount = 0;

  // Split content into frontmatter, code fences, and prose blocks
  const lines = fixed.split(/\r?\n/);
  let inFm = false;
  let fmEnd = 0;
  if (lines.length > 0 && lines[0].trim() === '---') {
    inFm = true;
    for (let idx = 1; idx < lines.length; idx++) {
      if (lines[idx].trim() === '---') {
        fmEnd = idx + 1;
        inFm = false;
        break;
      }
    }
  }

  const blocks = [];
  let currentBlock = { isFence: false, isFm: fmEnd > 0, lines: [] };

  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const lineNum = idx + 1;
    const trimmed = line.trim();

    if (lineNum <= fmEnd) {
      currentBlock.lines.push(line);
      if (lineNum === fmEnd) {
        blocks.push(currentBlock);
        currentBlock = { isFence: false, isFm: false, lines: [] };
      }
      continue;
    }

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      if (currentBlock.isFence) {
        currentBlock.lines.push(line);
        blocks.push(currentBlock);
        currentBlock = { isFence: false, isFm: false, lines: [] };
      } else {
        if (currentBlock.lines.length > 0) {
          blocks.push(currentBlock);
        }
        currentBlock = { isFence: true, isFm: false, lines: [line] };
      }
      continue;
    }

    currentBlock.lines.push(line);
  }

  if (currentBlock.lines.length > 0) {
    blocks.push(currentBlock);
  }

  // Process prose blocks
  const processedBlocks = [];
  for (const block of blocks) {
    if (block.isFence || block.isFm) {
      processedBlocks.push(block.lines.join('\n'));
      continue;
    }

    let proseText = block.lines.join('\n');

    // Run language auto-fixes on prose
    const { fixed: proseFixed, fixCount: pFixes } = autoFixProse(proseText);
    proseText = proseFixed;
    fixCount += pFixes;

    if (isAgentFirst) {
      // Strip multi-byte emojis
      const emojiRegex =
        /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      if (emojiRegex.test(proseText)) {
        proseText = proseText.replace(emojiRegex, () => {
          fixCount++;
          return '';
        });
      }

      // Strip decorative horizontal dividers
      const pLines = proseText.split('\n');
      const noDividerLines = [];
      for (const line of pLines) {
        const trimmed = line.trim();
        if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
          fixCount++;
          continue;
        }
        noDividerLines.push(line);
      }
      proseText = noDividerLines.join('\n');

      // Convert Markdown tables to compact pipe-delimited records
      const tLines = proseText.split('\n');
      const convertedLines = [];
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
        return s
          .split('|')
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
      };

      while (idx < tLines.length) {
        const line = tLines[idx];
        if (idx + 1 < tLines.length && isTableRow(line) && isDelimiterRow(tLines[idx + 1])) {
          fixCount++;
          const headerCells = parseCells(line);
          convertedLines.push(`- ${headerCells.join(' | ')}`);
          idx += 2;

          while (idx < tLines.length && isTableRow(tLines[idx])) {
            fixCount++;
            const rowCells = parseCells(tLines[idx]);
            if (rowCells.length > 0) {
              convertedLines.push(`- ${rowCells.join(' | ')}`);
            }
            idx++;
          }
          continue;
        }

        convertedLines.push(line);
        idx++;
      }
      proseText = convertedLines.join('\n');

      // Convert redundant links [Label](path/to/file) to [path/to/file]
      const redundantLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      proseText = proseText.replace(redundantLinkRegex, (match, label, target) => {
        const cleanLabel = label.trim();
        const cleanTarget = target.trim();
        if (
          cleanLabel !== cleanTarget &&
          (cleanTarget.includes('/') || cleanTarget.includes('.'))
        ) {
          fixCount++;
          return `[${cleanTarget}]`;
        }
        return match;
      });
    }

    processedBlocks.push(proseText);
  }

  fixed = processedBlocks.join('\n');

  if (isAgentFirst) {
    // Strip standalone Unicode box borders and tree branches outside frontmatter
    const allLines = fixed.split('\n');
    const cleanedLines = [];
    for (let idx = 0; idx < allLines.length; idx++) {
      const bLine = allLines[idx];
      if (idx < fmEnd) {
        cleanedLines.push(bLine);
        continue;
      }
      const trimmed = bLine.trim();
      if (
        trimmed.length >= 3 &&
        /^[\u2500-\u257F\u2550-\u256C+\-=_|~ ]+$/.test(trimmed) &&
        /[\u2500-\u257F\u2550-\u256C]/.test(trimmed)
      ) {
        fixCount++;
        continue;
      }
      let cleaned = bLine.replace(/^(\s*)[│║]\s*/, '$1').replace(/\s*[│║](\s*)$/, '$1');
      if (/^\s*[└├][─═]+[►> ]\s*/.test(cleaned)) {
        cleaned = cleaned.replace(/^\s*[└├][─═]+[►> ]\s*/, '- ');
        fixCount++;
      }
      if (cleaned !== bLine) {
        fixCount++;
      }
      cleanedLines.push(cleaned);
    }
    fixed = cleanedLines.join('\n');
  }

  // Collapse consecutive blank lines
  const multipleBlanks = /(\n[ \t]*){3,}/g;
  if (multipleBlanks.test(fixed)) {
    fixed = fixed.replace(multipleBlanks, () => {
      fixCount++;
      return '\n\n';
    });
  }

  // Strip trailing whitespace per line
  const trailingWhitespace = /[ \t]+$/gm;
  if (trailingWhitespace.test(fixed)) {
    fixed = fixed.replace(trailingWhitespace, '');
  }

  return { fixed, fixCount };
}

const CODE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
const DOC_EXTENSIONS = new Set(['.md', '.markdown']);
const IGNORED_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  '.stubs',
  '.gemini',
  '.turbo',
  'build',
  '.kanban',
  '.desktop',
  'obsidian-vault',
  'wiki',
]);

/**
 * Loads and parses .gitignore rules from repository root.
 */
export function loadGitignorePatterns(rootDir = process.cwd()) {
  const patterns = [];
  try {
    const gitignorePath = path.join(rootDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf-8');
      const lines = content.split(/\r?\n/);
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#') || line.startsWith('!')) continue;
        patterns.push(line);
      }
    }
  } catch {
    // Ignore read errors
  }
  return patterns;
}

export function isPathExcluded(relPath, gitignorePatterns = []) {
  const norm = relPath.replace(/\\/g, '/').replace(/^\.\//, '');
  const base = path.basename(norm);

  // Explicitly ignore README.md and QUICKSTART.md
  if (/^(?:readme|quickstart)(?:[\.\-_].*)?\.md$/i.test(base)) {
    return true;
  }

  // Ignore temporary test directories and fixtures
  if (
    norm.includes('tests/temp') ||
    norm.startsWith('tests/temp') ||
    norm.includes('/temp_') ||
    norm.includes('/temp-') ||
    norm.includes('tests/fixtures') ||
    norm.includes('temp_install_test')
  ) {
    return true;
  }

  for (const part of norm.split('/')) {
    if (IGNORED_DIR_NAMES.has(part)) {
      return true;
    }
  }

  for (const rawPattern of gitignorePatterns) {
    let pat = rawPattern.trim();
    if (!pat || pat.startsWith('#') || pat.startsWith('!')) continue;
    const isDirOnly = pat.endsWith('/');
    if (isDirOnly) pat = pat.slice(0, -1);
    const anchored = pat.startsWith('/');
    if (anchored) pat = pat.slice(1);

    if (isDirOnly || !pat.includes('.')) {
      if (norm === pat || norm.startsWith(pat + '/')) {
        return true;
      }
    }
    if (matchesGlobPattern(norm, pat)) {
      return true;
    }
    if (!anchored) {
      if (matchesGlobPattern(norm, `**/${pat}`)) {
        return true;
      }
      for (const segment of norm.split('/')) {
        if (segment === pat) return true;
      }
    }
  }

  return false;
}

/**
 * Collects target files according to mode and exclusion rules.
 */
export function collectFiles(
  targetPath,
  mode = 'all',
  rootDir = process.cwd(),
  gitignorePatterns = null,
) {
  if (!fs.existsSync(targetPath)) return [];
  const stat = fs.statSync(targetPath);
  const patterns = gitignorePatterns ?? loadGitignorePatterns(rootDir);

  const relFromRoot = path.relative(rootDir, targetPath).replace(/\\/g, '/');

  if (stat.isFile()) {
    if (isPathExcluded(relFromRoot, patterns)) {
      return [];
    }
    const ext = path.extname(targetPath).toLowerCase();
    const isCode = CODE_EXTENSIONS.has(ext);
    const isDoc = DOC_EXTENSIONS.has(ext);
    if (
      (mode === 'all' && (isCode || isDoc)) ||
      (mode === 'code' && isCode) ||
      (mode === 'docs' && isDoc)
    ) {
      return [{ filePath: targetPath, isCode }];
    }
    return [];
  }

  if (stat.isDirectory()) {
    const dirBase = path.basename(targetPath);
    if (IGNORED_DIR_NAMES.has(dirBase) || isPathExcluded(relFromRoot, patterns)) {
      return [];
    }

    const results = [];
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORED_DIR_NAMES.has(entry.name)) {
        continue;
      }
      const full = path.join(targetPath, entry.name);
      const childRel = path.relative(rootDir, full).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (!isPathExcluded(childRel, patterns)) {
          results.push(...collectFiles(full, mode, rootDir, patterns));
        }
      } else if (entry.isFile()) {
        if (isPathExcluded(childRel, patterns)) {
          continue;
        }
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
  let mode = 'all'; // Default unified mode: audits and fixes docs and code comments
  let forceAgentFirst = false;
  let outputPath = null;
  const paths = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--text' || arg === '-t') {
      textInput = args[++i];
    } else if (arg === '--json') {
      jsonOutput = true;
    } else if (arg === '--output' || arg === '-o') {
      outputPath = args[++i];
    } else if (arg.startsWith('--output=')) {
      outputPath = arg.split('=')[1];
    } else if (arg === '--fix' || arg === '-f') {
      fixMode = true;
    } else if (arg === '--agent-first') {
      forceAgentFirst = true;
    } else if (arg === '--code' || arg === '-c') {
      mode = 'code';
    } else if (arg === '--docs' || arg === '-d') {
      mode = 'docs';
    } else if (arg === '--all' || arg === '-a') {
      mode = 'all';
    } else if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`ASD-STE100 Issue 9 & ADR-001 Unified Linter (TALE)

Usage:
  npx stubs tale [options] [files/directories...]
  node tale.mjs [options] [files/directories...]

Options:
  -f, --fix             Automatically apply language and formatting fixes to all target files
  -a, --all             Scan and format both documentation (.md) and code comments (.ts, .js) (default)
  -d, --docs            Scan and format Markdown documentation only
  -c, --code            Scan and format code comments only
  -t, --text <STRING>   Lint direct inline text string
  --agent-first         Force ADR-001 Agent-First syntax checks (compact records, no emojis, no redundant links)
  --json                Output results in JSON format
  -h, --help            Show this help message

Default:
  Scans all documentation and code comments across the repository, automatically excluding
  build/test artifacts, .gitignore patterns, and README.md / QUICKSTART.md.
`);
      process.exit(0);
    } else {
      paths.push(arg);
    }
  }

  const rootDir = process.cwd();
  const taleConfig = loadTaleConfig(rootDir);
  const gitignorePatterns = loadGitignorePatterns(rootDir);
  const reports = [];
  let totalViolations = 0;

  if (textInput !== null) {
    if (fixMode) {
      const { fixed, fixCount } = autoFixContent(textInput, forceAgentFirst, false);
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

  if (paths.length === 0) {
    paths.push('.');
  }

  const targets = [];
  for (const p of paths) {
    targets.push(...collectFiles(p, mode, rootDir, gitignorePatterns));
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
        const { fixed, fixCount } = autoFixContent(content, isAgentFirst, target.isCode);
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
        if (issues.length > 0) {
          console.log(`\nScanning: ${target.filePath} ${typeLabel}`);
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
    const jsonStr = JSON.stringify(reports, null, 2);
    if (outputPath) {
      fs.writeFileSync(outputPath, jsonStr, 'utf-8');
    } else {
      console.log(jsonStr);
    }
  } else {
    let outputText = '';
    if (fixMode) {
      outputText += `\nAuto-remediation applied: ${totalFixesApplied} fix(es).\n`;
    }
    if (totalViolations > 0) {
      outputText += `\nTotal violations remaining: ${totalViolations}\n`;
    } else {
      outputText += `\n✓ All ${targets.length} scanned file(s) are compliant with ASD-STE100 Issue 9.\n`;
    }
    if (outputPath) {
      fs.writeFileSync(outputPath, outputText, 'utf-8');
    } else {
      process.stdout.write(outputText);
    }
  }

  process.exitCode = totalViolations > 0 ? 1 : 0;
}

// Top-level execution guard
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  runCLI(process.argv);
}
