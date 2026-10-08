# 🏛️ Architecture Knowledge Graph Index
Generated: 2026-10-08T00:12:37.426Z
Total Nodes: **986** | Total Relationships: **1688**

## 🧩 Subsystems & Communities
### [#6] CliRouter
- **Hub Node:** [[src_cli_router|src/cli/router.ts#CliRouter]]
- **Cohesion:** 91% (535 members)
- **Members:**
  - [[src_changelog_engine|src/changelog/engine.ts]]
  - [[src_changelog_engine|src/changelog/engine.ts#AdrChange]]
  - [[src_changelog_engine|src/changelog/engine.ts#ExportChange]]
  - [[src_changelog_engine|src/changelog/engine.ts#PhaseTransition]]
  - [[src_changelog_engine|src/changelog/engine.ts#SpecDiff]]
  - [[src_changelog_engine|src/changelog/engine.ts#ChangelogSummary]]
  - [[src_changelog_engine|src/changelog/engine.ts#ArchitecturalChangelog]]
  - [[src_changelog_engine|src/changelog/engine.ts#ChangelogOptions]]
  - [[src_changelog_engine|src/changelog/engine.ts#ChangelogEngine]]
  - [[src_changelog_engine.ts_ChangelogEngine|src/changelog/engine.ts#ChangelogEngine.extractFrontmatter]]
  - *... and 525 more*

### [#1] engine.ts.md
- **Hub Node:** [[src_graph_engine.ts|src/graph/engine.ts.md]]
- **Cohesion:** 79% (143 members)
- **Members:**
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#ChangelogEngine]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#ChangelogOptions]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#ArchitecturalChangelog]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#ChangelogSummary]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#SpecDiff]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#AdrChange]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#ExportChange]]
  - [[src_changelog_engine.ts|src/changelog/engine.ts.md#PhaseTransition]]
  - [[src_concept_engine.ts|src/concept/engine.ts.md]]
  - *... and 133 more*

### [#2] loadConfig
- **Hub Node:** [[src_config_schema|src/config/schema.ts#loadConfig]]
- **Cohesion:** 61% (133 members)
- **Members:**
  - [[src_jwt.ts|src/jwt.ts.md]]
  - [[src_jwt.ts|src/jwt.ts.md#AuthContext]]
  - [[src_jwt.ts|src/jwt.ts.md#JwtPayload]]
  - [[src_jwt.ts|src/jwt.ts.md#signToken]]
  - [[src_jwt.ts|src/jwt.ts.md#verifyToken]]
  - [[src_autonomy_protocol|src/autonomy/protocol.ts]]
  - [[src_autonomy_protocol|src/autonomy/protocol.ts#AutonomyLevel]]
  - [[src_autonomy_protocol|src/autonomy/protocol.ts#DriftReport]]
  - [[src_autonomy_protocol|src/autonomy/protocol.ts#Proposal]]
  - [[src_autonomy_protocol|src/autonomy/protocol.ts#ReconciliationResult]]
  - *... and 123 more*

### [#0] router.ts.md
- **Hub Node:** [[src_cli_router.ts|src/cli/router.ts.md]]
- **Cohesion:** 75% (112 members)
- **Members:**
  - [[src_INDEX|src/INDEX.md]]
  - [[src_INDEX|src/INDEX.md#GraphEngine]]
  - [[src_INDEX|src/INDEX.md#CliRouter]]
  - [[src_INDEX|src/INDEX.md#PortalServer]]
  - [[src_INDEX|src/INDEX.md#TemplateEngine]]
  - [[src_INDEX|src/INDEX.md#AutonomyProtocol]]
  - [[src_INDEX|src/INDEX.md#SandingEngine]]
  - [[src_INDEX|src/INDEX.md#MaterializerEngine]]
  - [[src_INDEX|src/INDEX.md#parseOkfSpec]]
  - [[src_INDEX|src/INDEX.md#loadConfig]]
  - *... and 102 more*

### [#8] shims.ts
- **Hub Node:** [[src_web_shims|src/web/shims.ts]]
- **Cohesion:** 100% (52 members)
- **Members:**
  - [[src_web_shims|src/web/shims.ts]]
  - [[src_web_shims|src/web/shims.ts#sha256]]
  - [[src_web_shims|src/web/shims.ts#rightRotate]]
  - [[src_web_shims|src/web/shims.ts#Hash]]
  - [[src_web_shims.ts_Hash|src/web/shims.ts#Hash.update]]
  - [[src_web_shims.ts_Hash|src/web/shims.ts#Hash.digest]]
  - [[src_web_shims|src/web/shims.ts#createHash]]
  - [[src_web_shims|src/web/shims.ts#randomBytes]]
  - [[src_web_shims|src/web/shims.ts#pbkdf2Sync]]
  - [[src_web_shims|src/web/shims.ts#MockCipher]]
  - *... and 42 more*

### [#3] markdown.ts.md
- **Hub Node:** [[src_parser_markdown.ts|src/parser/markdown.ts.md]]
- **Cohesion:** 100% (4 members)
- **Members:**
  - [[src_parser_markdown.ts|src/parser/markdown.ts.md]]
  - [[src_parser_markdown.ts|src/parser/markdown.ts.md#extractImplementationCode]]
  - [[src_parser_markdown.ts|src/parser/markdown.ts.md#replaceImplementationCode]]
  - [[markdown|markdown.ts]]

### [#4] lifecycle-service.ts.md
- **Hub Node:** [[tests_temp-lifecycle-test_lifecycle-service.ts|tests/temp-lifecycle-test/lifecycle-service.ts.md]]
- **Cohesion:** 100% (3 members)
- **Members:**
  - [[tests_temp-lifecycle-test_lifecycle-service.ts|tests/temp-lifecycle-test/lifecycle-service.ts.md]]
  - [[tests_temp-lifecycle-test_lifecycle-service.ts|tests/temp-lifecycle-test/lifecycle-service.ts.md#greet]]
  - [[lifecycle-service|lifecycle-service.ts]]

### [#5] test_grill_module.ts.md
- **Hub Node:** [[tests_test_grill_module.ts|tests/test_grill_module.ts.md]]
- **Cohesion:** 100% (2 members)
- **Members:**
  - [[tests_test_grill_module.ts|tests/test_grill_module.ts.md]]
  - [[auth|auth.ts]]

### [#7] index.ts
- **Hub Node:** [[src_index|src/index.ts]]
- **Cohesion:** 100% (1 members)
- **Members:**
  - [[src_index|src/index.ts]]

### [#9] sw.js
- **Hub Node:** [[src_web_sw|src/web/sw.js]]
- **Cohesion:** 100% (1 members)
- **Members:**
  - [[src_web_sw|src/web/sw.js]]
