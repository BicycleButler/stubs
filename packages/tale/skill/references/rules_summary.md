# ASD-STE100 Issue 9 — Part 1: Writing Rules and General Recommendations

This reference contains the writing rules from **Part 1 of ASD-STE100 Simplified Technical English (Issue 9, January 15, 2025)**.

## Section 1: Words (Rules 1.1 – 1.14)

### Rule 1.1: Approved Words

- **Rule:** Use words that are:
  1. Approved in the dictionary (Part 2).
  2. Technical nouns (TN) that fit into an approved category.
  3. Technical verbs (TV) that fit into an approved category.
- **Principle:** If a word is not approved and is not a technical noun or verb, **do not use it**.

### Rule 1.2: Parts of Speech Isolation

- **Rule:** Use approved words from the dictionary **only as their specified part of speech**.
- **Example:**
  - _Non-STE:_ "Test the system." (_test_ used as a verb — unapproved)
  - _STE:_ "Do a test of the system." (_test_ used as an approved noun)
  - _Non-STE:_ "Oil the gears." (_oil_ used as a verb — unapproved)
  - _STE:_ "Apply oil to the gears." (_oil_ used as an approved noun)

### Rule 1.3: One Word, One Meaning

- **Rule:** Use approved words only with their approved meanings as defined in the dictionary.
- **Example:**
  - _Non-STE:_ "Since the engine was hot, we waited." (_since_ meaning _because_ — unapproved)
  - _STE:_ "Because the engine was hot, we waited." (_since_ is approved only for time duration: "It has run since yesterday.")

### Rule 1.4: Approved Forms of Verbs and Adjectives

- **Rule:** Use only the approved forms and tenses of verbs (Rule 3.2) and standard comparative/superlative forms of adjectives.

### Rule 1.5: Technical Noun Categories

- **Rule:** You can use unlisted nouns if they fall into one of the **22 Technical Noun categories**:
  1. _Official parts information:_ bolt, cable, bracket, filter, sensor, resistor.
  2. _Names of systems, components, and circuits:_ hydraulic system, fuel bus, power supply.
  3. _Tools and equipment:_ wrench, multimeter, test rig, torque driver.
  4. _Materials, consumables, and hardware:_ grease, sealant, aluminum alloy, solder.
  5. _Units of measurement:_ mm, kg, psi, mA, ms, Byte, USD cents.
  6. _Physical and mathematical characteristics:_ dimension, resistance, frequency, voltage, mass.
  7. _Environmental and operating conditions:_ temperature, humidity, vibration, altitude.
  8. _Medical, biological, and physiological terms:_ toxic, flammable, irritation.
  9. _Damage terms:_ corrosion, crack, dent, scratch, leak, fray.
  10. _Navigation, aviation, and vehicular coordinates:_ latitude, heading, bay, runway.
  11. _Facility and structure locations:_ workshop, terminal, storage rack, register.
  12. _Official military, commercial, and organization titles:_ FAA, ISO, cashier, mechanic.
  13. _Standards, directives, and specifications:_ ADR-01, RFC-2119, OSHA.
  14. _Computer processes, data, software, and hardware:_ cache, database, payload, socket, integer.
  15. _Manufacturing, fabrication, and assembly terms:_ casting, annealing, milling, crimp.
  16. _Chemical elements and compounds:_ nitrogen, acetone, ethanol, copper.
  17. _Colors and visual markers:_ amber, matte black, striped.
  18. _Shapes and geometries:_ circular, hexagonal, flange, radius.
  19. _Time, schedule, and calendar concepts:_ shift, interval, deadline, fiscal quarter.
  20. _Financial and accounting concepts:_ cents, ledger, balance, discount, invoice.
  21. _Documentation and media items:_ schematic, ledger, log, sidecar, diagram.
  22. _Personnel, roles, and actors:_ operator, customer, technician, cashier.

### Rule 1.6: Unapproved Words Limitation

- **Rule:** Use an unapproved word only when it is an approved technical noun or technical verb.

### Rule 1.7: No Technical Nouns as Verbs

- **Rule:** Do not turn technical nouns into verbs (no "verbing" of nouns).
- **Example:**
  - _Non-STE:_ "Tape the wire." / "Torque the bolt."
  - _STE:_ "Apply tape to the wire." / "Tighten the bolt to the specified torque."

### Rule 1.8: Company and Industry Standards

- **Rule:** Use technical nouns that are standardized and approved in your company or project terminology.

### Rule 1.9: Short and Familiar Terms

- **Rule:** When selecting a technical noun, choose one that is short and easy to understand.

### Rule 1.10: No Slang, Regional Words, or Jargon

- **Rule:** Do not use regional idioms, slang, or ambiguous colloquial jargon.

### Rule 1.11: Consistent Technical Nouns (One Entity, One Name)

- **Rule:** Do not use different technical nouns for the same item across the document or codebase.
- **Example:**
  - _Non-STE:_ "1. Check the actuator. 2. Remove the control unit. 3. Clean the servo." (Referring to the same part)
  - _STE:_ "1. Do an inspection of the actuator. 2. Remove the actuator. 3. Clean the actuator."

### Rule 1.12: Technical Verb Categories

- **Rule:** You can use technical verbs not in the dictionary only for specialized manufacturing, engineering, or computing processes.
- **Examples:** _solder_, _re-index_, _serialize_, _quench_, _deprecate_.

### Rule 1.13: No Technical Verbs as Nouns

- **Rule:** Do not use technical verbs as nouns (no nominalization of technical actions).

### Rule 1.14: American English Spelling

- **Rule:** Use American English spelling (for example: _color_, _center_, _check_, _synchronize_, _catalog_).

## Section 2: Multi-Word Nouns (Rules 2.1 – 2.2)

### Rule 2.1: Three-Word Cluster Limit

- **Rule:** Multi-word nouns must not contain more than **three words**.
- **Example:**
  - _Non-STE:_ "Overhead auxiliary power unit fuel shutoff valve" (7 words)
  - _STE:_ "APU fuel shutoff valve" or "The shutoff valve for the APU fuel line."

### Rule 2.2: Disambiguation of Long Technical Nouns

- **Rule:** When an official technical noun has more than three words, introduce the full term once, then disambiguate with:
  1. A shorter recognized noun form.
  2. Hyphens (`-`) between modifier words functioning as a single unit.

## Section 3: Verbs and Voice (Rules 3.1 – 3.7)

### Rule 3.1: Approved Verb Forms Only

- **Rule:** Use only the verb forms and conjugations listed in the Part 2 Dictionary.

### Rule 3.2: Permitted Tenses and Moods

- **Rule:** Use only these four verb forms and tenses:
  1. **The Infinitive form:** "to install", "to start"
  2. **The Imperative form (Command):** "Turn the switch to OFF."
  3. **The Simple Present tense:** "The relay controls the circuit."
  4. **The Simple Past tense:** "The sensor failed during the test."
  5. **The Simple Future tense (with 'will'):** "The system will shut down if temperature exceeds 80 C."

### Rule 3.3: Past Participles as Adjectives

- **Rule:** Use the past participle form only as an adjective (for example: "the _damaged_ cable", "the _closed_ valve").

### Rule 3.4: No Complex Auxiliary Verb Constructions

- **Rule:** Do not use complex compound verb structures (for example: `would have been`, `could be causing`, `might have required`).
- **Example:**
  - _Non-STE:_ "The pump might have been damaged by cavitation."
  - _STE:_ "Cavitation can cause damage to the pump."

### Rule 3.5: Restrictions on "-ing" Forms

- **Rule:** Use "-ing" words **only as a technical noun or as a modifier in a technical noun**.
- **Example:**
  - _Non-STE:_ "The system is overheating because fuel is leaking." (Progressive action verbs)
  - _STE:_ "The system overheats because fuel leaks." (Simple present)
  - _Approved:_ "The _cooling_ system prevents damage." (_cooling_ = modifier in technical noun)
  - _Approved:_ "The _bearing_ needs lubrication." (_bearing_ = technical noun)

### Rule 3.6: Active Voice Mandate

- **Rule:** Always use the active voice. In descriptive writing, use passive voice only when the actor or agent is unknown.
- **Example:**
  - _Non-STE:_ "The transaction is committed by the ledger engine." (Passive)
  - _STE:_ "The ledger engine commits the transaction." (Active)

### Rule 3.7: Use Verbs for Actions (Prevent Nominalizations)

- **Rule:** Use an approved verb to describe an action, not an abstract noun.
- **Example:**
  - _Non-STE:_ "Do the alignment of the gears."
  - _STE:_ "Align the gears."
  - _Non-STE:_ "Make a decision on the pull request."
  - _STE:_ "Decide on the pull request."

## Section 4: Sentences (Rules 4.1 – 4.5)

### Rule 4.1: Short and Clear Sentences (One Topic Per Sentence)

- **Rule:** Write short, clear sentences. Each sentence must express only **one primary idea or action**.

### Rule 4.2: No Omission of Functional Words and No Contractions

- **Rule:**
  1. Do not omit articles (_a_, _an_, _the_) or demonstratives (_this_, _these_) to save space.
  2. **Contractions are strictly prohibited** (write _do not_, _cannot_, _is not_, _will not_).
- **Example:**
  - _Non-STE:_ "Do not disconnect cable before power off."
  - _STE:_ "Do not disconnect the cable before you turn off the power."

### Rule 4.3: Vertical Lists for Complex Text

- **Rule:** Use vertical bulleted or numbered lists when describing three or more items, conditions, or steps.

### Rule 4.4: Explicit Connecting Words

- **Rule:** Use clear connecting words (_because_, _then_, _if_, _when_, _but_, _although_, _thus_) to show relationships between clauses.

### Rule 4.5: Mandatory Articles and Demonstratives

- **Rule:** Always include articles (_the_, _a_, _an_) and demonstrative adjectives (_this_, _these_) with nouns.
- **Example:**
  - _Non-STE:_ "Turn switch to reset register."
  - _STE:_ "Turn the switch to reset the register."

## Section 5: Procedural Writing (Rules 5.1 – 5.5)

### Rule 5.1: Maximum 20 Words Per Sentence

- **Rule:** In procedural instructions, each sentence must have a **maximum of 20 words**.

### Rule 5.2: One Instruction Per Sentence

- **Rule:** Write only **one instruction per sentence**, unless two actions must happen simultaneously.
- **Example:**
  - _Non-STE:_ "Open the latch, pull the lever, and extract the filter cartridge."
  - _STE:_ "1. Open the latch. 2. Pull the lever. 3. Remove the filter cartridge."

### Rule 5.3: Imperative Mood for Instructions

- **Rule:** Write all procedural steps in the **imperative (command) form**.
- **Example:** "Turn the key to START." / "Save the configuration file."

### Rule 5.4: Conditions First

- **Rule:** If an action depends on a condition or preparatory state, **state the condition first**.
- **Example:**
  - _Non-STE:_ "Press button A if the amber LED flashes."
  - _STE:_ "If the amber LED flashes, push button A."

### Rule 5.5: Notes Contain Information Only (No Instructions)

- **Rule:** Write notes (`NOTE:`) only to provide supplementary explanations or background context. Never put action steps inside a note.

## Section 6: Descriptive Writing (Rules 6.1 – 6.6)

### Rule 6.1: Gradual Information Delivery

- **Rule:** Structure explanations so information is introduced progressively from general context to specific details.

### Rule 6.2: Logical Keywords and Phrasing

- **Rule:** Use clear key terms and recurring headings to give sections a consistent structure.

### Rule 6.3: Maximum 25 Words Per Sentence

- **Rule:** In descriptive text, each sentence must have a **maximum of 25 words**.

### Rule 6.4: Group Related Information in Paragraphs

- **Rule:** Use paragraphs to group related technical descriptions.

### Rule 6.5: One Topic Per Paragraph

- **Rule:** Each paragraph must cover only **one subject or concept**.

### Rule 6.6: Maximum 6 Sentences Per Paragraph

- **Rule:** No paragraph can contain more than **six sentences**. Split larger explanations into multiple structured paragraphs or lists.

## Section 7: Safety Instructions (Rules 7.1 – 7.3)

### Rule 7.1: Standard Risk Levels

- **Rule:** Use exact standard severity labels:
  - **`WARNING:`** Risk of severe personal injury or death.
  - **`CAUTION:`** Risk of damage to equipment, data corruption, or system outage.

### Rule 7.2: Command or Condition First

- **Rule:** Start safety instructions with an immediate command or condition stating what to do.
- **Example:** "WARNING: Do not touch the bus bar before you isolate the power supply."

### Rule 7.3: State Risk and Consequence

- **Rule:** State the exact risk and consequence clearly so the operator understands why the command exists.
- **Example:** "High voltage can cause severe electric shock or death."

## Section 8: Punctuation and Word Counting (Rules 8.1 – 8.7)

### Rule 8.1: Strict Semicolon Prohibition

- **Rule:** **Semicolons (`;`) are strictly forbidden in STE.** Replace semicolons with periods (`.`) and split into distinct sentences.

### Rule 8.2: Hyphens for Connected Units

- **Rule:** Use hyphens (`-`) to connect words acting as a single unit or compound adjective (for example: _high-voltage line_).

### Rule 8.3: Permitted Parentheses Usage

- **Rule:** Use parentheses `()` only for:
  1. References to diagrams, figures, or sections: `(Refer to Figure 2)`.
  2. Callout item numbers or letters: `the clamp (14)`.
  3. Work step sub-identifiers: `(a)`, `(b)`.
  4. Standard abbreviations and acronyms: `Simplified Technical English (STE)`.
  5. Short clarifications or units: `(not more than 10 psi)`.

### Rule 8.4: Colons in Lists Count as Periods

- **Rule:** In a vertical list, a colon (`:`) introduces the list and terminates the sentence boundary for word count.

### Rule 8.5: Parenthetical Text Counts as 1 Word in Primary Sentence

- **Rule:** When calculating sentence length, an entire parenthetical clause counts as **1 word** in that sentence.

### Rule 8.6: Elements Counting as 1 Word

- **Rule:** Each of the following elements counts as **one word**:
  1. Number + unit of measurement (for example: `10 mA`, `500 ms`, `$25.00`, `12 V`).
  2. Numbers that designate parts, models, or standards (for example: `ISO-9001`, `Model 300`).
  3. Quoted text strings (for example: `"INVALID_STATE"`).
  4. Compound acronyms and initialisms (for example: `ASD-STE100`, `HTML5`, `UUIDv4`).
  5. Proper nouns of personnel, places, or companies.

### Rule 8.7: Hyphenated Words Count as 1 Word

- **Rule:** Each hyphenated compound word (for example: _push-button_, _built-in_, _read-only_) counts as **one word**.

## Section 9: General Recommendations (GR-1 – GR-8)

### GR-1: The Conjunction "That"

- **Rule:** Do not omit the conjunction "that" after verbs like _show_, _indicate_, _state_, or _know_.
- **Example:**
  - _Non-STE:_ "Make sure the valve is closed."
  - _STE:_ "Make sure **that** the valve is closed."

### GR-2: Disambiguating "With"

- **Rule:** Be precise with "with" to prevent ambiguity between _using an instrument_ and _having or attaching a component_.
- **Example:**
  - _Non-STE:_ "Clean the sensor with water." (Ambiguous: sensor containing water, or water as cleaning agent?)
  - _STE:_ "Use water to clean the sensor."

### GR-3: Clear Pronoun Antecedents

- **Rule:** Use pronouns (_it_, _they_, _this_, _these_) only when the antecedent noun is immediately obvious.

### GR-4: Avoiding Vague "This"

- **Rule:** Never use "This" as a standalone subject. Always pair "this" with a specific noun (for example: "This procedure...").

### GR-5: Beware of False Friends

- **Rule:** Prevent false cognates across languages (for example: _control_ in English means _regulate or command_, not merely _verify_).

### GR-6: No Latin Abbreviations

- **Rule:** Do not use Latin abbreviations. Replace with full English equivalents:
  - Replace `for example,.` with "for example"
  - Replace `that is,.` with "that is"
  - Replace `and so on.` with "and so on" or list all items explicitly
  - Replace `against` with "compared with" or "against"

### GR-7: Inclusive and Gender-Neutral Language

- **Rule:** Use gender-neutral nouns and pronouns (_person_, _operator_, _personnel_, _mechanic_, _they/their_).

### GR-8: Possessive Forms (Prevent 's for Inanimate Objects)

- **Rule:** Use the Saxon genitive (`'s`) only for persons or organizations. For inanimate objects, use "of" or compound nouns.
- **Example:**
  - _Non-STE:_ "The system's response time..."
  - _STE:_ "The response time of the system..."
