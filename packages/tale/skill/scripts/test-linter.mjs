import assert from 'node:assert';
import {
  calculateSTEWordCount,
  splitIntoSentences,
  extractCodeComments,
  lintSTE,
  autoFixContent,
  lintAgentFirst,
  isAgentFirstFile,
  matchesGlobPattern,
  DEFAULT_TALE_CONFIG,
  fixProseSemicolons,
  formatCodeComments,
  isPathExcluded,
  SAFE_WORD_FIXES,
  suggestSentenceSplits,
  generateContextualSuggestion,
} from './tale.mjs';

console.log('Running TALE Linter Test Suite...\n');

// 1. Double Possessive Bug Test
{
  const text = "The user's cart and the store's inventory is low.";
  const count = calculateSTEWordCount(text);
  assert.strictEqual(count, 9, `Expected 9 words for double possessives, got ${count}`);
  console.log('✓ Test 1 Passed: Double possessive does not wipe out inner words.');
}

// 2. Abbreviation Sentence Splitting Test
{
  const content = 'Use a valid tool (e.g. Node or Npm) for this task.\nThen continue.';
  const sentences = splitIntoSentences(content);
  assert.strictEqual(sentences.length, 2, `Expected 2 sentences, got ${sentences.length}`);
  assert.ok(
    sentences[0].text.includes('(e.g. Node or Npm)'),
    `Expected first sentence to retain full abbreviation clause: "${sentences[0].text}"`,
  );
  console.log('✓ Test 2 Passed: Sentence splitter protects e.g. from premature splitting.');
}

// 3. HTML Entity Semicolon Test
{
  const text = 'Use &amp; and &quot; in XML files.';
  const issues = lintSTE(text, false);
  const semiIssue = issues.find((i) => i.rule === 'Rule 8.1');
  assert.ok(!semiIssue, 'HTML entities should not trigger Rule 8.1 semicolon violation');
  console.log(
    '✓ Test 3 Passed: HTML entities (&amp;, &quot;) do not trigger semicolon violations.',
  );
}

// 4. URL False Positive Test
{
  const text = 'Read https://example.com/avoid/ensure?id=1;mode=all for instructions.';
  const issues = lintSTE(text, false);
  const falsePositives = issues.filter(
    (i) => i.rule === 'Rule 8.1' || i.rule === 'Part 2 Dictionary',
  );
  assert.strictEqual(
    falsePositives.length,
    0,
    `URLs should not trigger dictionary or semicolon false positives: ${JSON.stringify(falsePositives)}`,
  );
  console.log('✓ Test 4 Passed: URL paths and queries do not trigger false positives.');
}

// 5. Blockquote / GitHub Callout Alert Test
{
  const blockquote = '> [!NOTE]\n> Ensure that you do not omit articles.\n> You can proceed.';
  const sentences = splitIntoSentences(blockquote);
  assert.ok(sentences.length >= 2, `Expected at least 2 sentences, got ${sentences.length}`);
  const issues = lintSTE(blockquote, false);
  const ensureIssue = issues.find((i) => i.message.includes('Ensure'));
  assert.ok(ensureIssue, 'Ensure in blockquote should be flagged');
  console.log('✓ Test 5 Passed: Blockquotes and GitHub callouts are properly linted.');
}

// 6. Progressive -ing Verb Test
{
  const text = 'The technician was testing the connection.';
  const issues = lintSTE(text, false);
  const progIssue = issues.find((i) => i.rule.includes('Rule 1.6'));
  assert.ok(progIssue, 'Progressive verb was testing should be flagged');
  console.log("✓ Test 6 Passed: Progressive verb ('was testing') caught under Rule 1.6 / Rule 6.");
}

// 7. Inflections of Recurring Errors Test
{
  const text = 'The engineer ensured the latch was secured and rotated the valve.';
  const issues = lintSTE(text, false);
  const ensuredIssue = issues.find((i) => i.context.includes('ensured'));
  const rotatedIssue = issues.find((i) => i.context.includes('rotated'));
  assert.ok(ensuredIssue, 'Past tense ensured should be flagged');
  assert.ok(rotatedIssue, 'Past tense rotated should be flagged');
  console.log("✓ Test 7 Passed: Past-tense inflections ('ensured', 'rotated') caught.");
}

// 8. Code Comment String Literal False Positive Test
{
  const code =
    'const url = "https://example.com//not-a-comment";\n// This is an ensure comment\nconst x = 1;';
  const sentences = extractCodeComments(code);
  assert.strictEqual(sentences.length, 1, `Expected 1 comment sentence, got ${sentences.length}`);
  assert.ok(
    sentences[0].text.includes('ensure comment'),
    'Extracted comment should be actual comment',
  );
  console.log("✓ Test 8 Passed: String literals containing '//' are not treated as comments.");
}

// 9. Auto-fix Basic Replacements Test
{
  const input = "You can't utilize this e.g. script. Ensure it works.";
  const { fixed, fixCount } = autoFixContent(input, false, false);
  assert.ok(fixCount >= 3, `Expected at least 3 fixes, got ${fixCount}`);
  assert.ok(fixed.includes('cannot'), "can't replaced with cannot");
  assert.ok(fixed.includes('use'), 'utilize replaced with use');
  assert.ok(fixed.includes('for example,'), 'e.g. replaced with for example,');
  assert.ok(fixed.includes('Make sure that'), 'Ensure replaced with Make sure that');
  console.log(
    '✓ Test 9 Passed: Auto-fix correctly remediates contractions, Latin, and safe terms.',
  );
}

// 10. ADR-001 Multi-byte Emoji Detection & Auto-fix Test
{
  const docWithEmoji = '# Title 🚀\n\nThis is a test 🛠️ for emojis.';
  const issues = lintAgentFirst(docWithEmoji);
  assert.ok(
    issues.some((i) => i.rule.includes('ADR-001 Rule 1')),
    'Emoji issue should be detected',
  );
  const { fixed, fixCount } = autoFixContent(docWithEmoji, true, false);
  assert.ok(fixCount >= 2, `Expected at least 2 fixes, got ${fixCount}`);
  assert.ok(!fixed.includes('🚀'), 'Rocket emoji removed');
  assert.ok(!fixed.includes('🛠️'), 'Hammer emoji removed');
  console.log('✓ Test 10 Passed: ADR-001 multi-byte emojis detected and stripped by autofix.');
}

// 11. ADR-001 Redundant Links Detection & Auto-fix Test
{
  const docWithLink = 'See the [API Specification](docs/api.md) for details.';
  const issues = lintAgentFirst(docWithLink);
  assert.ok(
    issues.some((i) => i.rule.includes('ADR-001 Rule 3')),
    'Redundant link should be detected',
  );
  const { fixed, fixCount } = autoFixContent(docWithLink, true, false);
  assert.ok(fixCount >= 1, `Expected link fix, got ${fixCount}`);
  assert.ok(fixed.includes('[docs/api.md]'), 'Link normalized to direct anchor');
  assert.ok(!fixed.includes('[API Specification]'), 'Redundant label removed');
  console.log(
    '✓ Test 11 Passed: ADR-001 redundant links detected and normalized to direct anchors.',
  );
}

// 12. ADR-001 Consecutive Blank Lines Detection & Auto-fix Test
{
  const docWithBlanks = '# Title\n\n\n\nParagraph after three blank lines.';
  const issues = lintAgentFirst(docWithBlanks);
  assert.ok(
    issues.some((i) => i.rule.includes('ADR-001 Rule 5')),
    'Blank line issue detected',
  );
  const { fixed, fixCount } = autoFixContent(docWithBlanks, true, false);
  assert.ok(fixCount >= 1, `Expected blank line fix, got ${fixCount}`);
  assert.ok(!fixed.includes('\n\n\n'), 'Consecutive blank lines collapsed');
  console.log('✓ Test 12 Passed: ADR-001 consecutive blank lines detected and collapsed.');
}

// 13. ADR-001 Markdown Table Delimiter Detection Test
{
  const tableContent = '| Name | Description |\n| :--- | :--- |\n| Val  | Info        |';
  const issues = lintAgentFirst(tableContent);
  assert.ok(
    issues.some((i) => i.rule.includes('ADR-001 Rule 2')),
    'Table issue detected',
  );
  console.log('✓ Test 13 Passed: ADR-001 markdown table delimiter detected.');
}

// 14. ADR-001 Mermaid Diagram Detection Test
{
  const content = '```mermaid\ngraph TD\nA --> B\n```';
  const issues = lintAgentFirst(content);
  assert.ok(
    issues.some((i) => i.rule.includes('ADR-001 Rule 7')),
    'Expected mermaid issue',
  );
  console.log('✓ Test 14 Passed: ADR-001 embedded Mermaid diagram detected.');
}

// 15. ADR-001 File Classification & Glob Matching Test
{
  assert.ok(matchesGlobPattern('AGENTS.md', 'AGENTS.md'), 'AGENTS.md must match');
  assert.ok(
    matchesGlobPattern('knowledge/architecture/context-map.md', '**/*context*'),
    'context file must match',
  );
  assert.ok(
    !isAgentFirstFile('README.md', '', DEFAULT_TALE_CONFIG),
    'README.md is excluded from agent-first',
  );
  assert.ok(
    !isAgentFirstFile('QUICKSTART.md', '', DEFAULT_TALE_CONFIG),
    'QUICKSTART.md is excluded from agent-first',
  );
  console.log('✓ Test 15 Passed: ADR-001 file classification and glob pattern matching verified.');
}

// 16. ADR-001 ASCII Art and Box Drawing Detection Test
{
  const asciiBox = '```text\n+---+\n| A |\n+---+\n```';
  const issues1 = lintAgentFirst(asciiBox);
  assert.ok(
    issues1.some((i) => i.rule.includes('ADR-001 Rule 1') && i.message.includes('ASCII art')),
  );

  const unicodeBox = '│ Box text │';
  const issues2 = lintAgentFirst(unicodeBox);
  assert.ok(
    issues2.some((i) => i.rule.includes('ADR-001 Rule 1') && i.message.includes('box-drawing')),
  );
  console.log('✓ Test 16 Passed: ADR-001 ASCII art and Unicode box drawing detected.');
}

// 17. ADR-001 Markdown Table Auto-Fix to Compact Records Test
{
  const tableContent =
    '# Topic Table\n\n| Feature | Status |\n| :--- | :--- |\n| Router | Active |\n| Compiler | Stable |\n';
  const { fixed, fixCount } = autoFixContent(tableContent, true, false);
  assert.ok(fixCount >= 1, 'Expected table conversion fixCount');
  assert.ok(!fixed.includes('| :--- |'), 'Alignment delimiter row removed');
  assert.ok(fixed.includes('- Feature | Status'), 'Header converted to compact pipe record');
  assert.ok(fixed.includes('- Router | Active'), 'Row converted to compact pipe record');
  console.log(
    '✓ Test 17 Passed: ADR-001 Markdown table auto-fix converts to compact pipe records.',
  );
}

// 18. ADR-001 Decorative Divider Rule Auto-Fix Removal Test
{
  const docWithDividers = '---\ntitle: Doc\n---\n\nSection 1\n\n---\n\nSection 2';
  const { fixed } = autoFixContent(docWithDividers, true, false);
  assert.ok(fixed.startsWith('---\ntitle: Doc\n---'), 'Frontmatter header must be preserved');
  assert.ok(
    !fixed.slice(20).includes('---'),
    'Decorative divider rule outside frontmatter removed',
  );
  console.log('✓ Test 18 Passed: ADR-001 decorative divider rules removed outside frontmatter.');
}

// 19. ADR-001 Unicode Box-Drawing Frame Auto-Fix Test
{
  const boxContent =
    '```\n┌──────────────────────────┐\n│ [ Active Tab ] Idle Tab  │\n└──────────────────────────┘\n├─► Option A\n└─► Option B\n```';
  const { fixed, fixCount } = autoFixContent(boxContent, true, false);
  assert.ok(fixCount >= 1, 'Expected box cleanup fixCount');
  assert.ok(!fixed.includes('┌'), 'Top box border removed');
  assert.ok(!fixed.includes('└─'), 'Bottom box border removed');
  assert.ok(fixed.includes('[ Active Tab ] Idle Tab'), 'Internal text preserved');
  assert.ok(fixed.includes('- Option A'), 'Tree branch normalized to list item');
  console.log('✓ Test 19 Passed: ADR-001 Unicode box-drawing frame and tree branches stripped.');
}

// 20. Prose Semicolon Auto-Fix to Periods Test
{
  const proseWithSemi =
    'Semicolons are prohibited; always split thoughts into separate sentences; finally verify.';
  const { text: fixedSemi, fixCount } = fixProseSemicolons(proseWithSemi);
  assert.strictEqual(fixCount, 2, `Expected 2 semicolon fixes, got ${fixCount}`);
  assert.strictEqual(
    fixedSemi,
    'Semicolons are prohibited. Always split thoughts into separate sentences. Finally verify.',
  );

  // Entities, code spans, URLs must be preserved
  const complexProse =
    'Use &amp; in XML; run `const a = 1;` safely; see https://example.com/test?a=1;b=2 for details.';
  const { text: complexFixed } = fixProseSemicolons(complexProse);
  assert.ok(complexFixed.includes('&amp;'), 'HTML entity preserved');
  assert.ok(complexFixed.includes('`const a = 1;`'), 'Code span preserved');
  assert.ok(complexFixed.includes('https://example.com/test?a=1;b=2'), 'URL preserved');
  assert.ok(
    complexFixed.includes('Run `const a = 1;` safely. See https'),
    'Prose semicolons converted',
  );
  console.log(
    '✓ Test 20 Passed: Prose semicolon auto-fix converts to periods and preserves code/entities/URLs.',
  );
}

// 21. Code Comments Auto-Fix Safety Test (Executable code untouched)
{
  const tsCode = `import * as fs from 'fs';
// Check the user credentials; ensure the token exists
export function verifyUser(token: string): boolean {
  const query = "SELECT * FROM users WHERE token = 'xyz';";
  if (!token) {
    return false;
  }
  /* The system should perform the validation; return result */
  return true;
}
`;
  const { fixed, fixCount } = formatCodeComments(tsCode);
  assert.ok(fixCount >= 3, `Expected at least 3 comment fixes, got ${fixCount}`);
  assert.ok(
    fixed.includes('// Check the user credentials. Make sure that the token exists'),
    'Single-line comment fixed',
  );
  assert.ok(
    fixed.includes('/* The system must do the validation. Return result */'),
    'Multi-line comment fixed',
  );
  assert.ok(
    fixed.includes('const query = "SELECT * FROM users WHERE token = \'xyz\';"'),
    'Code string literal untouched',
  );
  assert.ok(fixed.includes("import * as fs from 'fs';"), 'Code import semicolon untouched');
  console.log(
    '✓ Test 21 Passed: Code comment formatting remediates comments without touching executable code.',
  );
}

// 22. Target File Exclusion Test (README, QUICKSTART, tests/temp_*)
{
  assert.ok(isPathExcluded('README.md'), 'README.md must be excluded');
  assert.ok(isPathExcluded('QUICKSTART.md'), 'QUICKSTART.md must be excluded');
  assert.ok(isPathExcluded('packages/cli/README.md'), 'packages/cli/README.md must be excluded');
  assert.ok(isPathExcluded('tests/temp_install_test_abc/test.md'), 'tests/temp_* must be excluded');
  assert.ok(
    !isPathExcluded('knowledge/architecture/context-map.md'),
    'context-map.md must NOT be excluded',
  );
  assert.ok(!isPathExcluded('packages/cli/src/index.ts'), 'index.ts must NOT be excluded');
  console.log(
    '✓ Test 22 Passed: Default exclusions correctly ignore README.md, QUICKSTART.md, and test artifacts.',
  );
}

// 23. Expanded Safe Word Auto-Fixes Test
{
  const sample = 'The client shall perform the task. It should replace each portion.';
  const { fixed } = autoFixContent(sample, false, false);
  assert.ok(fixed.includes('client must do the task'), 'shall perform -> must do');
  assert.ok(fixed.includes('It must replace each part'), 'should portion -> must part');
  console.log(
    '✓ Test 23 Passed: Expanded safe words (shall, should, perform, portion) remediated.',
  );
}

// 24. Trailing Whitespace and Code Block Protection in Markdown Test
{
  const mdWithTrailing = '# Header   \n\n```ts\nconst x = 1;   \n```\nSome text with trailing   ';
  const { fixed } = autoFixContent(mdWithTrailing, false, false);
  assert.ok(!fixed.includes('# Header '), 'Trailing whitespace stripped on header');
  assert.ok(!fixed.includes('with trailing '), 'Trailing whitespace stripped on prose');
  console.log('✓ Test 24 Passed: Deepened Markdown cleanup handles trailing whitespace.');
}

// 25. Nested Template Literal and Expression Protection Test
{
  const nestedCode = `
const title = "Module";
const code = \`\${cond ? \`# Header\\n// Inside nested string stub \${title}\\n\` : ''}\`;
const headerComment = \`// \${title} — Stub implementation\\n\`;
await fs.writeFile('path', headerComment);
`;
  const comments = extractCodeComments(nestedCode);
  assert.strictEqual(comments.length, 0, 'No comments should be extracted from template strings');
  const { fixed } = formatCodeComments(nestedCode);
  assert.ok(fixed.includes('headerComment = `// ${title} — Stub implementation\\n`;'), 'Semicolon must not be altered');
  console.log('✓ Test 25 Passed: Nested template strings with `${...}` and `//` are preserved.');
}

// 26. Additional Safe Words Auto-Fix Test (prevent*, can)
{
  const text = 'This avoids collisions. Column may exist. Avoiding issues.';
  const { fixed, fixCount } = autoFixContent(text, false, false);
  assert.strictEqual(fixCount, 3, 'Expected 3 fixes for avoids, may, avoiding');
  assert.strictEqual(fixed, 'This prevents collisions. Column can exist. Preventing issues.');
  console.log('✓ Test 26 Passed: Additional safe words (avoid*, may) correctly remediated.');
}

// 27. Sentence Splitting Heuristic Test (suggestSentenceSplits)
{
  const longSentenceWithColon =
    'Filter type 0 on every scanline: the images are flat colour, so the more elaborate filters buy nothing.';
  const split1 = suggestSentenceSplits(longSentenceWithColon);
  assert.ok(split1, 'Should split at colon');
  assert.ok(split1.includes('. The images'), 'Second sentence capitalized');

  const longSentenceWithConj =
    'Bundling inlines module code, but any dependency that reads a real file off disk breaks.';
  const split2 = suggestSentenceSplits(longSentenceWithConj);
  assert.ok(split2, 'Should split at comma + conjunction');
  assert.ok(split2.includes('. But any dependency') || split2.includes('. Any dependency'), 'Sentence split correctly');
  console.log('✓ Test 27 Passed: Sentence splitting heuristic divides long compound sentences.');
}

// 28. Contextual Code Comment Keyword Backticking & Idiomatic STE Test
{
  const codeWithComment =
    '// Explicitly casting config to any because we will add properties\n// Preserve existing credentials if any\n// Check if server is running';
  const { fixed, fixCount } = formatCodeComments(codeWithComment);
  assert.ok(fixCount >= 3, `Expected at least 3 contextual fixes, got ${fixCount}`);
  assert.ok(fixed.includes('to `any`'), 'any keyword wrapped in backticks');
  assert.ok(fixed.includes('if present'), 'if any converted to if present');
  assert.ok(fixed.includes('runs'), 'is running converted to runs');
  console.log('✓ Test 28 Passed: Code comment keyword backticking and contextual idioms remediated.');
}

// 29. Linter SuggestedFix Attachment Test
{
  const sample =
    'Line with unapproved word: check if local server is running; split this now.\nLong sentence with colon: first part is here and second part is there.';
  const issues = lintSTE(sample, false);
  assert.ok(issues.length > 0, 'Should find issues');
  const semiIssue = issues.find((i) => i.rule === 'Rule 8.1');
  assert.ok(semiIssue && semiIssue.suggestedFix, 'Semicolon issue should provide suggestedFix');
  console.log('✓ Test 29 Passed: lintSTE issues attach suggestedFix for zero-token agent resolution.');
}

console.log('\nAll 29 unit tests passed successfully!');
