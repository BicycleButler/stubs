---
id: "src/config/schema.ts#sanitizeConfig"
kind: "function"
file_path: "src/config/schema.ts"
tags:
  - type/function
---

# sanitizeConfig
**File:** `src/config/schema.ts` | **Kind:** `function`

## 📥 Incoming Connections
- **contains** ← [[src_config_schema|src/config/schema.ts]] *(EXTRACTED)*
stsSync|fs#existsSync]] *(EXTRACTED)*
- **calls** → [[fs_readFileSync|fs#readFileSync]] *(EXTRACTED)*

## 📥 Incoming Connections
- **calls** ← [[src_autonomy_protocol|src/autonomy/protocol.ts#AutonomyProtocol]] *(EXTRACTED)*
- **calls** ← [[src_changelog_engine.ts_ChangelogEngine|src/changelog/engine.ts#ChangelogEngine.generateChangelog]] *(EXTRACTED)*
- **contains** ← [[src_config_schema|src/config/schema.ts]] *(EXTRACTED)*
- **calls** ← [[src_context_engine|src/context/engine.ts#ContextEngine]] *(EXTRACTED)*
- **calls** ← [[src_diagram_engine|src/diagram/engine.ts#DiagramEngine]] *(EXTRACTED)*
- **calls** ← [[src_diagram_engine.ts_DiagramEngine|src/diagram/engine.ts#DiagramEngine.generateDiagram]] *(EXTRACTED)*
- **calls** ← [[src_export_engine|src/export/engine.ts#ExportEngine]] *(EXTRACTED)*
- **calls** ← [[src_graph_engine|src/graph/engine.ts#GraphEngine]] *(EXTRACTED)*
- **calls** ← [[src_graph_engine.ts_GraphEngine|src/graph/engine.ts#GraphEngine.upsertSidecar]] *(EXTRACTED)*
- **calls** ← [[src_graph_engine.ts_GraphEngine|src/graph/engine.ts#GraphEngine.search]] *(EXTRACTED)*
- **calls** ← [[src_graph_engine|src/graph/engine.ts#createGraphEngine]] *(EXTRACTED)*
- **calls** ← [[src_grill_engine.ts_GrillEngine|src/grill/engine.ts#GrillEngine.grill]] *(EXTRACTED)*
- **calls** ← [[src_impact_engine|src/impact/engine.ts#ImpactEngine]] *(EXTRACTED)*
- **calls** ← [[src_impact_engine.ts_ImpactEngine|src/impact/engine.ts#ImpactEngine.analyzeImpact]] *(EXTRACTED)*
- **calls** ← [[src_lint_engine|src/lint/engine.ts#ArchLintEngine]] *(EXTRACTED)*
- **calls** ← [[src_lint_engine.ts_ArchLintEngine|src/lint/engine.ts#ArchLintEngine.lintWorkspace]] *(EXTRACTED)*
- **calls** ← [[src_prune_engine|src/prune/engine.ts#PruneEngine]] *(EXTRACTED)*
- **calls** ← [[src_prune_engine.ts_PruneEngine|src/prune/engine.ts#PruneEngine.auditWorkspace]] *(EXTRACTED)*
- **calls** ← [[src_query_engine|src/query/engine.ts#QueryEngine]] *(EXTRACTED)*
- **calls** ← [[src_server_github|src/server/github.ts#resolveToken]] *(EXTRACTED)*
- **calls** ← [[src_server_mcp|src/server/mcp.ts#McpServer]] *(EXTRACTED)*
- **calls** ← [[src_server_mcp.ts_McpServer|src/server/mcp.ts#McpServer.handleToolCall]] *(EXTRACTED)*
- **calls** ← [[src_server_portal|src/server/portal.ts#PortalServer]] *(EXTRACTED)*
- **calls** ← [[src_templates_engine|src/templates/engine.ts#TemplateEngine]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleTemplate]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleReconcile]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleEvaluate]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleSync]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleScan]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleMapAuto]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleConcept]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleTree]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleBlast]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handlePreFlight]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handlePath]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handlePhase]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleContext]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleImpact]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleLintArch]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleDiagram]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handlePrune]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleExplain]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleQuery]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleExport]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleMcp]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleOrder]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleWatch]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleCoChange]] *(EXTRACTED)*
- **calls** ← [[src_cli_router.ts_CliRouter|src/cli/router.ts#CliRouter.handleDiffArch]] *(EXTRACTED)*
