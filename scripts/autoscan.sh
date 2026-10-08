#!/usr/bin/env bash
#
# autoscan.sh — Fully-automated, script-driven graph→wiki→obsidian pipeline (no LLM).
#
# This script chains the following stubs CLI stages into a single deterministic
# pipeline that transforms source code into structured knowledge artifacts:
#
#   1. stubs scan  <dir>      AST extraction + SQLite graph + community detection
#   2. stubs export wiki     Structured Wikipedia-style subsystem articles
#   3. stubs export obsidian  Obsidian vault with [[wikilinks]]
#
# Scripts cost zero tokens to execute and deliver byte-identical, reproducible
# results across machines. No LLM is invoked at any stage.
#
# Usage:
#   ./scripts/autoscan.sh [options]
#
# Options:
#   -d, --dir <dir>        Source directory to scan (default: src, or . if src absent)
#   -w, --wiki-out <dir>   Output directory for wiki articles (default: ./wiki)
#   -o, --obsidian-out <d> Output directory for obsidian vault (default: ./obsidian-vault)
#   -j, --json             Emit structured JSON summary instead of human-readable progress
#   -c, --config <path>    Path to .stubs/config.json (default: .stubs/config.json)
#   --skip-scan            Skip the scan step (use existing graph.sqlite)
#   --skip-wiki            Skip wiki export
#   --skip-obsidian        Skip obsidian export
#   --fail-fast            Exit immediately on first stage failure (default: continue & report)
#   -h, --help             Show this help message
#
# Exit codes:
#   0  All requested stages completed
#   1  One or more stages failed
#   2  Invalid arguments
#
set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
SCAN_DIR=""
WIKI_OUT="./wiki"
OBSIDIAN_OUT="./obsidian-vault"
JSON_MODE=false
CONFIG_PATH=""
SKIP_SCAN=false
SKIP_WIKI=false
SKIP_OBSIDIAN=false
FAIL_FAST=false

# ── Resolve stubs binary ──────────────────────────────────────────────────────
# Try local installation first, then npx fallback
STUBS_BIN="npx"
STUBS_ARGS=("stubs")

# ── Help ──────────────────────────────────────────────────────────────────────
show_help() {
  cat <<'HELP'
autoscan.sh — Automated stubs graph→wiki→obsidian pipeline (no LLM)

Usage: ./scripts/autoscan.sh [options]

Options:
  -d, --dir <dir>        Source directory to scan (default: src, or . if src absent)
  -w, --wiki-out <dir>   Output directory for wiki articles (default: ./wiki)
  -o, --obsidian-out <d> Output directory for obsidian vault (default: ./obsidian-vault)
  -j, --json             Emit structured JSON summary instead of human-readable progress
  -c, --config <path>    Path to .stubs/config.json (default: .stubs/config.json)
  --skip-scan            Skip the scan step (use existing graph.sqlite)
  --skip-wiki            Skip wiki export
  --skip-obsidian        Skip obsidian export
  --fail-fast            Exit immediately on first stage failure (default: continue & report)
  -h, --help             Show this help message

Exit codes:
  0  All requested stages completed
  1  One or more stages failed
  2  Invalid arguments
HELP
}

# ── Parse arguments ───────────────────────────────────────────────────────────
while [[ $# -gt 0 ]]; do
  case "$1" in
    -d|--dir)
      SCAN_DIR="$2"
      shift 2
      ;;
    -w|--wiki-out)
      WIKI_OUT="$2"
      shift 2
      ;;
    -o|--obsidian-out)
      OBSIDIAN_OUT="$2"
      shift 2
      ;;
    -j|--json)
      JSON_MODE=true
      shift
      ;;
    -c|--config)
      CONFIG_PATH="$2"
      shift 2
      ;;
    --skip-scan)
      SKIP_SCAN=true
      shift
      ;;
    --skip-wiki)
      SKIP_WIKI=true
      shift
      ;;
    --skip-obsidian)
      SKIP_OBSIDIAN=true
      shift
      ;;
    --fail-fast)
      FAIL_FAST=true
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Error: Unknown option '$1'" >&2
      show_help >&2
      exit 2
      ;;
  esac
done

# ── Build base stubs command ──────────────────────────────────────────────────
STUBS_CMD=("${STUBS_BIN}" "${STUBS_ARGS[@]}")
if [[ -n "$CONFIG_PATH" ]]; then
  STUBS_CMD+=("--config" "$CONFIG_PATH")
fi

# ── Stage tracking ────────────────────────────────────────────────────────────
declare -a STAGE_RESULTS=()
OVERALL_SUCCESS=true

run_stage() {
  local stage_name="$1"
  shift
  local -a stage_cmd=("$@")

  if [[ "$JSON_MODE" == "false" ]]; then
    echo "🔬 Stage: $stage_name"
    echo "  Command: ${stage_cmd[*]}"
    echo ""
  fi

  if "${stage_cmd[@]}"; then
    STAGE_RESULTS+=("$stage_name:success")
    if [[ "$JSON_MODE" == "false" ]]; then
      echo "✓ $stage_name completed successfully"
      echo ""
    fi
  else
    local exit_code=$?
    STAGE_RESULTS+=("$stage_name:failed:$exit_code")
    OVERALL_SUCCESS=false
    if [[ "$JSON_MODE" == "false" ]]; then
      echo "✖ $stage_name failed (exit code: $exit_code)" >&2
      echo ""
    fi
    if [[ "$FAIL_FAST" == "true" ]]; then
      echo "✖ Failing fast due to stage failure" >&2
      exit 1
    fi
  fi
}

# ── Step 1: Scan & index the codebase ─────────────────────────────────────────
if [[ "$SKIP_SCAN" == "false" ]]; then
  # Determine scan directory: explicit override > config > src > .
  if [[ -z "$SCAN_DIR" ]]; then
    if [[ -d "src" ]]; then
      SCAN_DIR="src"
    else
      SCAN_DIR="."
    fi
  fi

  SCAN_ARGS=("${STUBS_CMD[@]}" "scan")
  if [[ "$SCAN_DIR" != "src" ]]; then
    SCAN_ARGS+=("$SCAN_DIR")
  fi
  if [[ "$JSON_MODE" == "true" ]]; then
    SCAN_ARGS+=("--json")
  fi

  run_stage "scan" "${SCAN_ARGS[@]}"
fi

# ── Step 2: Export to Wiki articles ───────────────────────────────────────────
if [[ "$SKIP_WIKI" == "false" ]]; then
  WIKI_ARGS=("${STUBS_CMD[@]}" "export" "wiki" "--output" "$WIKI_OUT")
  if [[ "$JSON_MODE" == "true" ]]; then
    WIKI_ARGS+=("--json")
  fi

  run_stage "wiki_export" "${WIKI_ARGS[@]}"
fi

# ── Step 3: Export to Obsidian vault ──────────────────────────────────────────
if [[ "$SKIP_OBSIDIAN" == "false" ]]; then
  OBSIDIAN_ARGS=("${STUBS_CMD[@]}" "export" "obsidian" "--output" "$OBSIDIAN_OUT")
  if [[ "$JSON_MODE" == "true" ]]; then
    OBSIDIAN_ARGS+=("--json")
  fi

  run_stage "obsidian_export" "${OBSIDIAN_ARGS[@]}"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
if [[ "$JSON_MODE" == "true" ]]; then
  # Build JSON summary
  echo -n '{"pipeline":"autoscan","status":"'
  if [[ "$OVERALL_SUCCESS" == "true" ]]; then
    echo -n 'complete'
  else
    echo -n 'partial_failure'
  fi
  echo -n '","stages":['
  for i in "${!STAGE_RESULTS[@]}"; do
    IFS=':' read -ra PARTS <<< "${STAGE_RESULTS[$i]}"
    stage_name="${PARTS[0]}"
    stage_status="${PARTS[1]}"
    stage_code="${PARTS[2]:-}"

    if [[ $i -gt 0 ]]; then
      echo -n ','
    fi
    echo -n "{\"name\":\"$stage_name\",\"status\":\"$stage_status\""
    if [[ -n "$stage_code" ]]; then
      echo -n ",\"exit_code\":$stage_code"
    fi
    echo -n '}'
  done
  echo -n ']}'
  echo ""
else
  if [[ "$OVERALL_SUCCESS" == "true" ]]; then
    echo "=========================================="
    echo "✅ AutoScan pipeline complete!"
    echo "=========================================="
    echo ""
    echo "Artifacts generated:"
    if [[ "$SKIP_WIKI" == "false" ]]; then
      echo "  📝 Wiki:      $WIKI_OUT"
    fi
    if [[ "$SKIP_OBSIDIAN" == "false" ]]; then
      echo "  🗂️  Obsidian:  $OBSIDIAN_OUT"
    fi
    echo ""
    echo "The knowledge graph has been populated and exported."
    echo "Use 'stubs query \"<question>\"' or 'stubs explain <Symbol>' to query it."
  else
    echo "=========================================="
    echo "⚠️  AutoScan pipeline completed with errors"
    echo "=========================================="
    echo ""
    echo "Stage results:"
    for result in "${STAGE_RESULTS[@]}"; do
      IFS=':' read -ra PARTS <<< "$result"
      stage_name="${PARTS[0]}"
      stage_status="${PARTS[1]}"
      if [[ "$stage_status" == "success" ]]; then
        echo "  ✓ $stage_name"
      else
        echo "  ✖ $stage_name (failed)"
      fi
    done
    echo ""
    echo "Check .stubs/graph.sqlite for the knowledge graph database."
  fi
fi

# Exit with appropriate code
if [[ "$OVERALL_SUCCESS" == "true" ]]; then
  exit 0
else
  exit 1
fi
