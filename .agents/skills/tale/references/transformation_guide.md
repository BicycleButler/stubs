# ASD-STE100 Issue 9 — Transformation Guide for Codebases & AI Agents

This guide provides transformation patterns to convert architecture records, code comments, pull requests, and agent outputs into unambiguous **ASD-STE100 Issue 9** text.

---

## 1. Core Transformation Algorithm

When transforming text or generating a technical response, execute this 3-step loop:

```
[Input Non-STE Text]
        │
        ▼
1. Structural Sanitization
   - Eliminate semicolons (;) -> Split into distinct sentences.
   - Eliminate contractions (e.g. "don't" -> "do not", "it's" -> "it is").
   - Restore missing articles ("a", "an", "the") and demonstratives ("this", "these").
   - Enforce sentence word counts (<=20 words for instructions, <=25 for descriptions).
        │
        ▼
2. Vocabulary & Part-of-Speech Mapping
   - Map unapproved verbs to approved base verbs (e.g. "perform" -> "do", "verify/ensure" -> "make sure that").
   - Remove "verbing" of technical nouns (e.g. "socket the connection" -> "connect the socket").
   - Remove progressive "-ing" action verbs (e.g. "is running" -> "runs").
   - Replace Latin abbreviations (e.g. "i.e.", "e.g.", "etc.").
        │
        ▼
3. Voice & Clarity Polish
   - Convert passive voice to active voice ("Actor does action").
   - Reduce noun clusters to <= 3 words.
   - Put conditions first in procedural instructions ("If condition, do action").
   - Ensure singular topic per paragraph (<= 6 sentences per paragraph).
        │
        ▼
[Compliant ASD-STE100 Output]
```

---

## 2. Before / After Transformation Examples

### Example 1: Architecture Specification / ADR

- **Non-STE Input:**
  > "The cache subsystem is utilized to store volatile transaction records; however, it shouldn't be relied upon for persistent persistence since power failure may cause data loss." _(26 words, semicolon, contraction, passive voice, unapproved words: *utilized*, *relied upon*, *since*, *may*)_
- **ASD-STE100 Issue 9 Revision:**
  > "The system uses the cache subsystem to store transaction records. But you must not use the cache subsystem for persistent data storage. A power failure can cause data loss." _(28 words total across 3 sentences; longest sentence = 10 words; active voice; approved vocabulary)_

### Example 2: Procedural Deployment / Migration Step

- **Non-STE Input:**
  > "Run the database migration script while ensuring that the replica instances aren't actively processing read requests to avoid locking issues." _(20 words, progressive "-ing" verbs, contraction, unapproved words: *run*, *ensuring*, *avoid*)_
- **ASD-STE100 Issue 9 Revision:**
  > "1. Make sure that replica instances do not process read requests. 2. Do the database migration script.
  >
  > This prevents database locking problems." _(20 words total across 2 steps + 1 note; imperative mood; conditions first)_

### Example 3: Agent Code Review / Bug Report

- **Non-STE Input:**
  > "Testing the module showed that it's failing because of unhandled null pointer exceptions occurring when the user's auth token is missing." _(21 words, nominalization, contraction, progressive verbs, unapproved words: *testing*, *it's*, *occurring*)_
- **ASD-STE100 Issue 9 Revision:**
  > "The module test failed because of a null pointer exception. This error occurs when the user authentication token is not present." _(20 words across 2 sentences; active voice; no contractions; approved terms)_

### Example 4: Safety & Fault Warnings

- **Non-STE Input:**
  > "Caution: Don't forget to backup the ledger database before executing this destructive schema change or you'll lose customer balances." _(19 words, informal tone, contraction, vague directive)_
- **ASD-STE100 Issue 9 Revision:**
  > "CAUTION: Make a backup of the ledger database before you do this schema change. If you do not make a backup, you can lose customer balance data." _(26 words across 2 sentences; explicit consequence; clear risk boundary)_

---

---

## 3. High-Frequency Anti-Pattern Checklist for Agents

Before printing responses or saving documentation, verify:

- [ ] Are there semicolons (`;`)? $\rightarrow$ **Split them.**
- [ ] Are there contractions (`don't`, `can't`, `it's`)? $\rightarrow$ **Expand them.**
- [ ] Are there progressive "-ing" verbs (`is writing`, `are processing`)? $\rightarrow$ **Use simple present/past.**
- [ ] Are actions hidden in nouns (`do the execution of`)? $\rightarrow$ **Use direct verbs (`execute`, `do`).**
- [ ] Are instructions written in passive voice? $\rightarrow$ **Use imperative commands.**
- [ ] Did you use Latin abbreviations (`e.g.`, `i.e.`, `etc.`)? $\rightarrow$ **Replace with English words.**
- [ ] Are all sentences within limits (<=20 words for instructions, <=25 words for descriptions)?
- [ ] Are paragraphs longer than 6 sentences? $\rightarrow$ **Divide them.**

---

## 4. Codebase Specific Standards: Commits & Docstrings

### 4.1 Git Commit Messages

All git commit messages must be written in the **Imperative Mood** using approved ASD-STE100 vocabulary and sentence length rules:

- **Title Line:** Imperative command, maximum 50 characters, no period, no contractions.
  - _Non-STE:_ `Fixing the register bug and ensuring items won't desync`
  - _STE:_ `Fix register desync bug and store amount in cents`
- **Body:** Active voice, max 25 words per sentence, no semicolons.
  - _Example:_
    ```text
    Fix register desync bug and store amount in cents

    Add validation for positive integer cents on all line items.
    Make sure that offline events sync with UUIDv4 idempotency keys.
    ```

### 4.2 Code Comments & TSDoc / JSDoc

Comments and function docstrings must describe behavior using **Simple Present Tense** in the active voice:

- **Function Summary:**
  - _Non-STE:_ `/** Helper for executing the tender process and checking if drawer opens */`
  - _STE:_ `/** Calculates the change and opens the cash drawer for cash transactions. */`
- **Inline Comments:**
  - _Non-STE:_ `// Checking if balance is below 0; if so, we're returning an error`
  - _STE:_ `// Return an error if the balance is less than 0.`
