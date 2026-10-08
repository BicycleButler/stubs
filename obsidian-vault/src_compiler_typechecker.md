---
id: "src/compiler/typechecker.ts#typeCheckVirtualFile"
kind: "function"
file_path: "src/compiler/typechecker.ts"
tags:
  - type/function
---

# typeCheckVirtualFile
**File:** `src/compiler/typechecker.ts` | **Kind:** `function`

## 📤 Outgoing Connections
- **calls** → [[typescript_createCompilerHost|typescript#createCompilerHost]] *(EXTRACTED)*
- **calls** → [[path_resolve|path#resolve]] *(EXTRACTED)*
- **calls** → [[typescript_createSourceFile|typescript#createSourceFile]] *(EXTRACTED)*
- **calls** → [[typescript_createProgram|typescript#createProgram]] *(EXTRACTED)*
- **calls** → [[typescript_getPreEmitDiagnostics|typescript#getPreEmitDiagnostics]] *(EXTRACTED)*
- **calls** → [[typescript_getLineAndCharacterOfPosition|typescript#getLineAndCharacterOfPosition]] *(EXTRACTED)*
- **calls** → [[typescript_flattenDiagnosticMessageText|typescript#flattenDiagnosticMessageText]] *(EXTRACTED)*

## 📥 Incoming Connections
- **contains** ← [[src_compiler_typechecker|src/compiler/typechecker.ts]] *(EXTRACTED)*
- **calls** ← [[src_materializer_engine.ts_MaterializerEngine|src/materializer/engine.ts#MaterializerEngine.materialize]] *(EXTRACTED)*
- **calls** ← [[src_sanding_ast|src/sanding/ast.ts#typeCheckCode]] *(EXTRACTED)*
