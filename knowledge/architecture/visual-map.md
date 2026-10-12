---
title: Project Architecture Visual Diagram
type: visual-diagram
audience: human-developer
tags:
  - architecture
  - visual
  - mermaid
---

# Architecture Visual Map

<!-- For AI coding agents: read knowledge/architecture/context-map.md or run npx stubs query "map:" -->

```mermaid
flowchart TD
  subgraph L0 ["Layer 0: Foundation"]
    n_src_config_schema_ts["schema.ts"]
  end
  subgraph L1 ["Layer 1: Storage"]
    n_src_storage_containment_ts["containment.ts"]
    n_src_storage_credentials_ts["credentials.ts"]
    n_src_storage_index_ts["index.ts"]
  end
  subgraph L2 ["Layer 2: Parser"]
    n_src_parser_ast_ts["ast.ts"]
    n_src_parser_okf_ts["okf.ts"]
    n_src_parser_markdown_ts["markdown.ts"]
  end
  subgraph L3 ["Layer 3: Compiler"]
    n_src_compiler_typechecker_ts["typechecker.ts"]
  end
  subgraph L4 ["Layer 4: Graph"]
    n_src_graph_plugins_base_ts["base.ts"]
    n_src_graph_plugins_level2_ts["level2.ts"]
    n_src_graph_plugins_level3_ts["level3.ts"]
    n_src_graph_wasmEngine_ts["wasmEngine.ts"]
    n_src_graph_routes_ts["routes.ts"]
    n_src_graph_engine_ts["engine.ts"]
    n_src_graph_extractor_ts["extractor.ts"]
    n_src_graph_workspace_ts["workspace.ts"]
    n_src_graph_skeleton_ts["skeleton.ts"]
    n_src_graph_topology_ts["topology.ts"]
  end
  subgraph L5 ["Layer 5: Engines"]
    n_src_templates_molds_planning_map_md_tpl["planning-map.md.tpl"]
    n_src_autonomy_protocol_ts["protocol.ts"]
    n_src_changelog_engine_ts["engine.ts"]
    n_src_concept_engine_ts["engine.ts"]
    n_src_concept_tree_ts["tree.ts"]
    n_src_diagram_engine_ts["engine.ts"]
    n_src_grill_engine_ts["engine.ts"]
    n_src_impact_engine_ts["engine.ts"]
    n_src_lint_engine_ts["engine.ts"]
    n_src_materializer_engine_ts["engine.ts"]
    n_src_phase_engine_ts["engine.ts"]
    n_src_templates_engine_ts["engine.ts"]
    n_src_sanding_ast_ts["ast.ts"]
    n_src_sanding_engine_ts["engine.ts"]
    n_src_context_engine_ts["engine.ts"]
    n_src_mock_engine_ts["engine.ts"]
    n_src_prune_engine_ts["engine.ts"]
  end
  subgraph L6 ["Layer 6: Interface"]
    n_bin_stubs_js["stubs.js"]
    n_eslint_config_js["eslint.config.js"]
    n_jest_config_js["jest.config.js"]
    n_lifecycle_service_ts["lifecycle-service.ts"]
    n_public_sw_js["sw.js"]
    n_repro_save_js["repro_save.js"]
    n_scripts_build_web_js["build-web.js"]
    n_scripts_check_web_shims_js["check-web-shims.js"]
    n_scripts_copy_runtime_assets_js["copy-runtime-assets.js"]
    n_scripts_generate_icons_d_ts["generate-icons.d.ts"]
    n_scripts_generate_icons_js["generate-icons.js"]
    n_scripts_jest_isolated_js["jest-isolated.js"]
    n_temp_inspect_js["temp_inspect.js"]
    n_temp_repro_js["temp_repro.js"]
    n_tests_bundleSmoke_test_ts["bundleSmoke.test.ts"]
    n_tests_changelog_test_ts["changelog.test.ts"]
    n_tests_cli_test_ts["cli.test.ts"]
    n_tests_concept_test_ts["concept.test.ts"]
    n_tests_config_test_ts["config.test.ts"]
    n_tests_context_test_ts["context.test.ts"]
    n_tests_diagram_test_ts["diagram.test.ts"]
    n_tests_github_test_ts["github.test.ts"]
    n_tests_graph_topology_test_ts["graph-topology.test.ts"]
    n_tests_graph_test_ts["graph.test.ts"]
    n_tests_grill_test_ts["grill.test.ts"]
    n_tests_impact_test_ts["impact.test.ts"]
    n_tests_lifecycle_test_ts["lifecycle.test.ts"]
    n_tests_lint_arch_test_ts["lint-arch.test.ts"]
    n_tests_materializer_test_ts["materializer.test.ts"]
    n_tests_mock_test_ts["mock.test.ts"]
    n_tests_parser_test_ts["parser.test.ts"]
    n_tests_performance_test_ts["performance.test.ts"]
    n_tests_phase_test_ts["phase.test.ts"]
    n_tests_planning_portal_test_ts["planning-portal.test.ts"]
    n_tests_plugins_test_ts["plugins.test.ts"]
    n_tests_prune_test_ts["prune.test.ts"]
    n_tests_sanding_test_ts["sanding.test.ts"]
    n_tests_server_test_ts["server.test.ts"]
    n_tests_storage_test_ts["storage.test.ts"]
    n_tests_temp_jit_test_src_a_ts["a.ts"]
    n_tests_templates_test_ts["templates.test.ts"]
    n_tests_tree_test_ts["tree.test.ts"]
    n_tests_wasmGraph_test_ts["wasmGraph.test.ts"]
    n_tests_webBuild_test_ts["webBuild.test.ts"]
    n_tmp_db_query_py["tmp_db_query.py"]
    n_src_cli_auth_ts["auth.ts"]
    n_src_cli_ts["cli.ts"]
    n_src_index_ts["index.ts"]
    n_src_server_github_ts["github.ts"]
    n_src_web_sw_js["sw.js"]
    n_src_export_engine_ts["engine.ts"]
    n_src_web_index_ts["index.ts"]
    n_src_web_shims_ts["shims.ts"]
    n_src_cli_router_ts["router.ts"]
    n_src_jwt_ts["jwt.ts"]
    n_src_server_mcp_ts["mcp.ts"]
    n_src_server_portal_ts["portal.ts"]
    n_src_query_engine_ts["engine.ts"]
  end
  n_tests_changelog_test_ts --> n_src_changelog_engine_ts
  n_tests_cli_test_ts --> n_src_cli_router_ts
  n_tests_concept_test_ts --> n_src_parser_okf_ts
  n_tests_concept_test_ts --> n_src_concept_engine_ts
  n_tests_config_test_ts --> n_src_config_schema_ts
  n_tests_context_test_ts --> n_src_parser_ast_ts
  n_tests_context_test_ts --> n_src_context_engine_ts
  n_tests_context_test_ts --> n_src_graph_engine_ts
  n_tests_diagram_test_ts --> n_src_diagram_engine_ts
  n_tests_diagram_test_ts --> n_src_graph_engine_ts
  n_tests_github_test_ts --> n_src_server_github_ts
  n_tests_github_test_ts --> n_src_cli_auth_ts
  n_tests_github_test_ts --> n_src_storage_credentials_ts
  n_tests_graph_topology_test_ts --> n_src_graph_engine_ts
  n_tests_graph_topology_test_ts --> n_src_graph_extractor_ts
  n_tests_graph_topology_test_ts --> n_src_graph_topology_ts
  n_tests_graph_topology_test_ts --> n_src_sanding_engine_ts
  n_tests_graph_topology_test_ts --> n_src_cli_router_ts
  n_tests_graph_test_ts --> n_src_graph_engine_ts
  n_tests_graph_test_ts --> n_src_parser_okf_ts
  n_tests_grill_test_ts --> n_src_grill_engine_ts
  n_tests_grill_test_ts --> n_src_cli_router_ts
  n_tests_grill_test_ts --> n_src_parser_okf_ts
  n_tests_impact_test_ts --> n_src_impact_engine_ts
  n_tests_impact_test_ts --> n_src_graph_engine_ts
  n_tests_lifecycle_test_ts --> n_src_templates_engine_ts
  n_tests_lifecycle_test_ts --> n_src_grill_engine_ts
  n_tests_lifecycle_test_ts --> n_src_materializer_engine_ts
  n_tests_lifecycle_test_ts --> n_src_sanding_engine_ts
  n_tests_lifecycle_test_ts --> n_src_graph_engine_ts
  n_tests_lifecycle_test_ts --> n_src_parser_okf_ts
  n_tests_lint_arch_test_ts --> n_src_lint_engine_ts
  n_tests_lint_arch_test_ts --> n_src_graph_engine_ts
  n_tests_materializer_test_ts --> n_src_parser_ast_ts
  n_tests_materializer_test_ts --> n_src_compiler_typechecker_ts
  n_tests_materializer_test_ts --> n_src_materializer_engine_ts
  n_tests_materializer_test_ts --> n_src_graph_engine_ts
  n_tests_mock_test_ts --> n_src_mock_engine_ts
  n_tests_parser_test_ts --> n_src_parser_okf_ts
  n_tests_performance_test_ts --> n_src_graph_engine_ts
  n_tests_performance_test_ts --> n_src_sanding_ast_ts
  n_tests_performance_test_ts --> n_src_sanding_engine_ts
  n_tests_phase_test_ts --> n_src_phase_engine_ts
  n_tests_phase_test_ts --> n_src_parser_okf_ts
  n_tests_planning_portal_test_ts --> n_src_server_portal_ts
  n_tests_planning_portal_test_ts --> n_src_graph_engine_ts
  n_tests_plugins_test_ts --> n_src_graph_engine_ts
  n_tests_plugins_test_ts --> n_src_graph_plugins_level2_ts
  n_tests_plugins_test_ts --> n_src_graph_plugins_level3_ts
  n_tests_plugins_test_ts --> n_src_parser_okf_ts
  n_tests_prune_test_ts --> n_src_prune_engine_ts
  n_tests_prune_test_ts --> n_src_graph_engine_ts
  n_tests_sanding_test_ts --> n_src_sanding_engine_ts
  n_tests_server_test_ts --> n_src_graph_engine_ts
  n_tests_server_test_ts --> n_src_server_portal_ts
  n_tests_storage_test_ts --> n_src_graph_engine_ts
  n_tests_templates_test_ts --> n_src_templates_engine_ts
  n_tests_templates_test_ts --> n_src_autonomy_protocol_ts
  n_tests_templates_test_ts --> n_src_graph_engine_ts
  n_tests_templates_test_ts --> n_src_config_schema_ts
  n_tests_tree_test_ts --> n_src_concept_tree_ts
  n_tests_tree_test_ts --> n_src_graph_engine_ts
  n_tests_wasmGraph_test_ts --> n_src_parser_okf_ts
  n_tests_wasmGraph_test_ts --> n_src_graph_wasmEngine_ts
  n_src_autonomy_protocol_ts --> n_src_config_schema_ts
  n_src_autonomy_protocol_ts --> n_src_parser_okf_ts
  n_src_autonomy_protocol_ts --> n_src_graph_engine_ts
  n_src_changelog_engine_ts --> n_src_graph_engine_ts
  n_src_changelog_engine_ts --> n_src_config_schema_ts
  n_src_cli_auth_ts --> n_src_server_github_ts
  n_src_cli_auth_ts --> n_src_storage_credentials_ts
  n_src_cli_ts --> n_src_storage_credentials_ts
  n_src_cli_ts --> n_src_cli_router_ts
  n_src_concept_engine_ts --> n_src_parser_okf_ts
  n_src_concept_engine_ts --> n_src_graph_engine_ts
  n_src_concept_engine_ts --> n_src_templates_engine_ts
  n_src_concept_tree_ts --> n_src_graph_engine_ts
  n_src_concept_tree_ts --> n_src_parser_okf_ts
  n_src_diagram_engine_ts --> n_src_graph_engine_ts
  n_src_diagram_engine_ts --> n_src_lint_engine_ts
  n_src_diagram_engine_ts --> n_src_config_schema_ts
  n_src_graph_plugins_base_ts --> n_src_graph_engine_ts
  n_src_graph_plugins_level2_ts --> n_src_graph_plugins_base_ts
  n_src_graph_plugins_level2_ts --> n_src_graph_engine_ts
  n_src_graph_plugins_level3_ts --> n_src_graph_plugins_base_ts
  n_src_graph_plugins_level3_ts --> n_src_graph_engine_ts
  n_src_graph_wasmEngine_ts --> n_src_graph_engine_ts
  n_src_grill_engine_ts --> n_src_config_schema_ts
  n_src_grill_engine_ts --> n_src_parser_okf_ts
  n_src_grill_engine_ts --> n_src_graph_engine_ts
  n_src_impact_engine_ts --> n_src_graph_engine_ts
  n_src_impact_engine_ts --> n_src_config_schema_ts
  n_src_lint_engine_ts --> n_src_graph_engine_ts
  n_src_lint_engine_ts --> n_src_graph_topology_ts
  n_src_lint_engine_ts --> n_src_config_schema_ts
  n_src_materializer_engine_ts --> n_src_parser_okf_ts
  n_src_materializer_engine_ts --> n_src_parser_ast_ts
  n_src_materializer_engine_ts --> n_src_compiler_typechecker_ts
  n_src_materializer_engine_ts --> n_src_graph_engine_ts
  n_src_materializer_engine_ts --> n_src_storage_containment_ts
  n_src_phase_engine_ts --> n_src_parser_okf_ts
  n_src_phase_engine_ts --> n_src_graph_engine_ts
  n_src_phase_engine_ts --> n_src_materializer_engine_ts
  n_src_server_github_ts --> n_src_config_schema_ts
  n_src_server_github_ts --> n_src_storage_credentials_ts
  n_src_templates_engine_ts --> n_src_config_schema_ts
  n_src_sanding_ast_ts --> n_src_compiler_typechecker_ts
  n_src_export_engine_ts --> n_src_graph_engine_ts
  n_src_export_engine_ts --> n_src_config_schema_ts
  n_src_web_index_ts --> n_src_graph_engine_ts
  n_src_web_index_ts --> n_src_parser_okf_ts
  n_src_web_index_ts --> n_src_materializer_engine_ts
  n_src_web_index_ts --> n_src_server_github_ts
  n_src_graph_routes_ts --> n_src_graph_extractor_ts
  n_src_graph_routes_ts --> n_src_graph_engine_ts
  n_src_sanding_engine_ts --> n_src_parser_okf_ts
  n_src_sanding_engine_ts --> n_src_parser_markdown_ts
  n_src_sanding_engine_ts --> n_src_sanding_ast_ts
  n_src_sanding_engine_ts --> n_src_storage_containment_ts
  n_src_sanding_engine_ts --> n_src_graph_extractor_ts
  n_src_cli_router_ts --> n_src_parser_okf_ts
  n_src_cli_router_ts --> n_src_graph_engine_ts
  n_src_cli_router_ts --> n_src_templates_engine_ts
  n_src_cli_router_ts --> n_src_autonomy_protocol_ts
  n_src_cli_router_ts --> n_src_server_portal_ts
  n_src_cli_router_ts --> n_src_config_schema_ts
  n_src_cli_router_ts --> n_src_sanding_engine_ts
  n_src_cli_router_ts --> n_src_materializer_engine_ts
  n_src_cli_router_ts --> n_src_concept_engine_ts
  n_src_cli_router_ts --> n_src_concept_tree_ts
  n_src_cli_router_ts --> n_src_phase_engine_ts
  n_src_cli_router_ts --> n_src_context_engine_ts
  n_src_cli_router_ts --> n_src_impact_engine_ts
  n_src_cli_router_ts --> n_src_lint_engine_ts
  n_src_cli_router_ts --> n_src_mock_engine_ts
  n_src_cli_router_ts --> n_src_diagram_engine_ts
  n_src_cli_router_ts --> n_src_prune_engine_ts
  n_src_cli_router_ts --> n_src_changelog_engine_ts
  n_src_cli_router_ts --> n_src_query_engine_ts
  n_src_cli_router_ts --> n_src_export_engine_ts
  n_src_cli_router_ts --> n_src_server_mcp_ts
  n_src_cli_router_ts --> n_src_storage_credentials_ts
  n_src_context_engine_ts --> n_src_graph_engine_ts
  n_src_context_engine_ts --> n_src_parser_okf_ts
  n_src_context_engine_ts --> n_src_parser_ast_ts
  n_src_context_engine_ts --> n_src_config_schema_ts
  n_src_graph_engine_ts --> n_src_parser_okf_ts
  n_src_graph_engine_ts --> n_src_config_schema_ts
  n_src_graph_engine_ts --> n_src_graph_extractor_ts
  n_src_graph_engine_ts --> n_src_graph_topology_ts
  n_src_graph_extractor_ts --> n_src_parser_okf_ts
  n_src_graph_extractor_ts --> n_src_parser_markdown_ts
  n_src_graph_extractor_ts --> n_src_graph_engine_ts
  n_src_graph_extractor_ts --> n_src_graph_routes_ts
  n_src_graph_workspace_ts --> n_src_graph_engine_ts
  n_src_mock_engine_ts --> n_src_parser_okf_ts
  n_src_mock_engine_ts --> n_src_parser_ast_ts
  n_src_mock_engine_ts --> n_src_graph_engine_ts
  n_src_prune_engine_ts --> n_src_graph_engine_ts
  n_src_prune_engine_ts --> n_src_parser_okf_ts
  n_src_prune_engine_ts --> n_src_config_schema_ts
  n_src_server_mcp_ts --> n_src_graph_engine_ts
  n_src_server_mcp_ts --> n_src_graph_topology_ts
  n_src_server_mcp_ts --> n_src_query_engine_ts
  n_src_server_mcp_ts --> n_src_config_schema_ts
  n_src_server_portal_ts --> n_src_graph_engine_ts
  n_src_server_portal_ts --> n_src_config_schema_ts
  n_src_server_portal_ts --> n_src_storage_credentials_ts
  n_src_server_portal_ts --> n_src_parser_okf_ts
  n_src_server_portal_ts --> n_src_materializer_engine_ts
  n_src_server_portal_ts --> n_src_templates_engine_ts
  n_src_server_portal_ts --> n_src_server_github_ts
  n_src_graph_topology_ts --> n_src_graph_extractor_ts
  n_src_query_engine_ts --> n_src_graph_engine_ts
  n_src_query_engine_ts --> n_src_graph_topology_ts
  n_src_query_engine_ts --> n_src_config_schema_ts
  n_src_query_engine_ts --> n_src_graph_skeleton_ts
  n_src_query_engine_ts --> n_src_graph_workspace_ts
```
