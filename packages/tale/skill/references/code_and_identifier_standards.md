# ASD-STE100 Issue 9 — Code Authoring and Identifier Standards

This guide provides rules for writing source code, variable names, function identifiers, and code comments compliant with **ASD-STE100 Issue 9**.

---

## 1. Identifier Naming Conventions

### 1.1 Action-First Function and Method Names

- Start function names with an approved action verb.
- Combine the verb with an explicit direct noun.
- **Rules:**
  - _Non-STE:_ `subtotalCalculations()`, `handleData()`, `doProcess()`
  - _STE:_ `calculateSubtotal()`, `parsePayload()`, `validateSignature()`
- **Approved Verb Prefixes:**
  - `get...` (get data or values)
  - `set...` (set a value or state)
  - `create...` / `make...` (create a new record or instance)
  - `calculate...` (compute numeric values)
  - `find...` (locate an item in a collection)
  - `open...` / `close...` (manage resource lifecycles)
  - `start...` / `stop...` (control process execution)
  - `send...` / `receive...` (manage I/O operations)

### 1.2 Multi-Word Noun Cap (Rule 2.1 Applied to Code)

- Identifiers must not contain more than three words in their noun phrase.
- **Rules:**
  - _Non-STE:_ `customerPendingSpecialOrderLineItemUnitCost` (6 words)
  - _STE:_ `specialOrderItemCost` or `lineItemCost` (3 words)

### 1.3 Boolean Identifiers

- Use `is...`, `has...`, or `can...` with a single adjective or noun.
- Examples: `isOpen`, `hasDiscount`, `canRefund`.

---

## 2. Code Comments and TSDoc Guidelines

### 2.1 Function and Class Documentation (TSDoc / JSDoc)

- Write summaries in the **Simple Present Tense** in the active voice.
- State what the component does, why it exists, or the constraints it enforces.
- Do not state obvious syntax or copy parameter names.
- Semicolons are prohibited in comments.
- Contractions are prohibited in comments.

**Example:**

```typescript
/**
 * Calculates the total balance in integer cents.
 * Applies tax rates and customer discounts to all line items.
 *
 * @param lineItems Items present in the active transaction cart.
 * @returns Total monetary balance in positive integer cents.
 */
export function calculateCartTotal(lineItems: CartItem[]): number {
  // Return zero if the cart contains no items.
  if (lineItems.length === 0) {
    return 0;
  }
  // Sum line items and add computed tax cents.
  return lineItems.reduce((acc, item) => acc + item.totalCents, 0);
}
```

### 2.2 Inline Comments

- Place comments above the code statement, not at the end of the line.
- Write whole sentences starting with a capital letter and ending with a period.
- Explain the reason or business logic, not the syntax.
- **Rules:**
  - _Non-STE:_ `// checking if amount isn't 0; if so, abort`
  - _STE:_ `// Abort the transaction if the amount is 0.`

---

## 3. Anti-Pattern Checklist for Code

Before saving source files, verify:

- [ ] Do all function names begin with a clear, active verb?
- [ ] Are variable names limited to 3 words or fewer?
- [ ] Are comments free of semicolons (`;`)?
- [ ] Are comments free of contractions (`don't`, `can't`, `it's`)?
- [ ] Are comments free of progressive action verbs (`is running`, `calculating`)?
- [ ] Do comments describe _why_ the code exists, rather than restating syntax?
