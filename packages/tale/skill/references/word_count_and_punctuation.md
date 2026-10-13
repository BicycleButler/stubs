# ASD-STE100 Issue 9 — Section 8: Punctuation & Word Count Rules

This reference outlines the exact punctuation constraints and word count calculation algorithms defined in **Part 1, Section 8 of ASD-STE100 Issue 9**.

## 1. Punctuation Rules (Rules 8.1 – 8.3)

### Semicolons are Strictly Prohibited (Rule 8.1)

- The semicolon (`;`) is **never permitted** in ASD-STE100.
- Semicolons allow overly long, compound thoughts that increase ambiguity and cognitive load.
- **Remedy:** Replace every semicolon with a period (`.`) and divide the text into two distinct sentences.
  - _Non-STE:_ "Turn switch A to OFF. Then wait for the light to extinguish."
  - _STE:_ "Turn switch A to the OFF position. Then wait until the light goes off."

### Hyphens for Directly Related Words (Rule 8.2)

- Use hyphens (`-`) to connect words that act as a single unit or compound modifier before a noun.
  - Examples: `built-in test`, `high-pressure line`, `fail-safe mode`, `read-only memory`.

### Parentheses Usage Restrictions (Rule 8.3)

Parentheses `()` are restricted to seven specific structural cases:

1. **References to illustrations, tables, or sections:** _(Refer to Figure 4)_.
2. **Identification of callout items:** _the sealing ring (6)_.
3. **Step numbering / sub-steps:** _(a)_, _(b)_, _(1)_, _(2)_.
4. **Acronym or abbreviation expansion:** _Point of Sale (POS)_.
5. **Alternative terms:** _the left (right) engine_.
6. **Brief clarifications:** _increase the torque slowly (not more than 5 Nm per second)_.
7. **Singular/plural notation:** _screw(s)_.

## 2. Word Count Determination & Rules (Rules 8.4 – 8.7)

When calculating sentence length (Max 20 words for procedural writing, Max 25 words for descriptive writing), follow these strict counting rules:

### Colons in Vertical Lists (Rule 8.4)

- In a vertical list, a colon (`:`) after introductory text acts as a full stop/period.
- The introductory clause counts as its own sentence up to the colon.
- Each bulleted list item counts as a separate sentence.

### Parenthetical Clauses (Rule 8.5)

- An entire parenthetical group counts as **ONE word** in the parent sentence.
- _Example:_
  - `"Do a check of the pressure (not more than 10 psi) on the gauge."`
  - Word count for host sentence: `Do (1) a (2) check (3) of (4) the (5) pressure (6) (not more than 10 psi) (7) on (8) the (9) gauge (10).` $\rightarrow$ **10 words** (Compliant).

### Single Word Count Units (Rule 8.6)

Each of the following entities counts as **exactly ONE word**:

1. **Numbers with units of measurement:**
   - `10 mA` = 1 word
   - `500 ms` = 1 word
   - `25 mm` = 1 word
   - `$100.00` = 1 word
   - `100 psi` = 1 word
2. **Standard part numbers, codes, and identifiers:**
   - `P/N 12345-67` = 1 word
   - `UUIDv4` = 1 word
   - `ISO-8601` = 1 word
3. **Quoted text strings:**
   - `"OUT_OF_STOCK"` = 1 word
   - `"Press any key"` = 1 word
4. **Proper names and acronyms:**
   - `ASD-STE100` = 1 word
   - `PostgreSQL` = 1 word
5. **Compound hyphenated terms (Rule 8.7):**
   - `real-time` = 1 word
   - `non-volatile` = 1 word
   - `push-button` = 1 word
