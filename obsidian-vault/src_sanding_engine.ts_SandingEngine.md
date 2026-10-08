---
id: "src/sanding/engine.ts#SandingEngine.scanDirectory"
kind: "method"
file_path: "src/sanding/engine.ts"
tags:
  - type/method
---

# scanDirectory
**File:** `src/sanding/engine.ts` | **Kind:** `method`

## 📤 Outgoing Connections
- **calls** → [[fs_existsSync|fs#existsSync]] *(EXTRACTED)*
- **calls** → [[fs_readdir|fs#readdir]] *(EXTRACTED)*
- **calls** → [[path_join|path#join]] *(EXTRACTED)*
- **calls** → [[path_replace|path#replace]] *(EXTRACTED)*
- **calls** → [[path_relative|path#relative]] *(EXTRACTED)*

## 📥 Incoming Connections
- **contains** ← [[src_sanding_engine|src/sanding/engine.ts#SandingEngine]] *(EXTRACTED)*
kdown.ts#extractImplementationCode]] *(EXTRACTED)*
- **calls** → [[fs_existsSync|fs#existsSync]] *(EXTRACTED)*
- **calls** → [[path_dirname|path#dirname]] *(EXTRACTED)*
- **calls** → [[path_toLowerCase|path#toLowerCase]] *(EXTRACTED)*
- **calls** → [[path_extname|path#extname]] *(EXTRACTED)*
- **calls** → [[fs_readFileSync|fs#readFileSync]] *(EXTRACTED)*
- **calls** → [[src_sanding_ast|src/sanding/ast.ts#getAstStructuralHash]] *(EXTRACTED)*
- **calls** → [[src_parser_markdown|src/parser/markdown.ts#replaceImplementationCode]] *(EXTRACTED)*
- **calls** → [[src_sanding_ast|src/sanding/ast.ts#typeCheckCode]] *(EXTRACTED)*
- **calls** → [[fs_statSync|fs#statSync]] *(EXTRACTED)*
- **calls** → [[js-yaml_dump|js-yaml#dump]] *(EXTRACTED)*
- **calls** → [[fs_writeFileSync|fs#writeFileSync]] *(EXTRACTED)*

## 📥 Incoming Connections
- **contains** ← [[src_sanding_engine|src/sanding/engine.ts#SandingEngine]] *(EXTRACTED)*
