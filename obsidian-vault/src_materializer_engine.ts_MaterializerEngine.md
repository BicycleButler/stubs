---
id: "src/materializer/engine.ts#MaterializerEngine.materialize"
kind: "method"
file_path: "src/materializer/engine.ts"
tags:
  - type/method
---

# materialize
**File:** `src/materializer/engine.ts` | **Kind:** `method`

## 📤 Outgoing Connections
- **calls** → [[path_resolve|path#resolve]] *(EXTRACTED)*
- **calls** → [[fs_readFile|fs#readFile]] *(EXTRACTED)*
- **calls** → [[src_parser_okf|src/parser/okf.ts#parseOkfSpec]] *(EXTRACTED)*
- **calls** → [[src_storage_containment|src/storage/containment.ts#resolveContainedPath]] *(EXTRACTED)*
- **calls** → [[path_relative|path#relative]] *(EXTRACTED)*
- **calls** → [[path_isAbsolute|path#isAbsolute]] *(EXTRACTED)*
- **calls** → [[src_parser_ast|src/parser/ast.ts#parseMarkdown]] *(EXTRACTED)*
- **calls** → [[src_parser_ast|src/parser/ast.ts#extractImplementationCode]] *(EXTRACTED)*
- **calls** → [[path_dirname|path#dirname]] *(EXTRACTED)*
- **calls** → [[path_toLowerCase|path#toLowerCase]] *(EXTRACTED)*
- **calls** → [[path_extname|path#extname]] *(EXTRACTED)*
- **calls** → [[src_compiler_typechecker|src/compiler/typechecker.ts#typeCheckVirtualFile]] *(EXTRACTED)*

## 📥 Incoming Connections
- **contains** ← [[src_materializer_engine|src/materializer/engine.ts#MaterializerEngine]] *(EXTRACTED)*
