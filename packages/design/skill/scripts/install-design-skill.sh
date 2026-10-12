#!/bin/bash
set -euo pipefail

REPO="https://github.com/Wiltermoodj/design.git"
SKILL_NAME="design"
TMP_DIR="${TMPDIR:-/tmp}/design-install-$$"
SOURCE_DIR=""
CHECK_ONLY=false
TARGET_DIR="."

cleanup() { rm -rf "$TMP_DIR" >/dev/null 2>&1 || true; }
trap cleanup EXIT

# Parse CLI arguments
while [ $# -gt 0 ]; do
  case "$1" in
    --check)
      CHECK_ONLY=true
      shift
      ;;
    -h|--help)
      echo "Usage: $0 [--check] [TARGET_PROJECT_DIR]"
      echo "Installs the design skill directly into a project repository."
      echo "Files installed:"
      echo "  - RULES.md (project root)"
      echo "  - .agents/skills/design/ (SKILL.md, REFERENCE.md, knowledge/, scripts/)"
      echo "  - .agents/rules/design-rules.md"
      exit 0
      ;;
    *)
      TARGET_DIR="$1"
      shift
      ;;
  esac
done

TARGET_DIR="$(cd "$TARGET_DIR" 2>/dev/null && pwd || { mkdir -p "$TARGET_DIR" && cd "$TARGET_DIR" && pwd; })"

# Detect whether we are running from inside a clone of the design repo
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_CANDIDATE="$(cd "$SCRIPT_DIR/.." >/dev/null 2>&1 && pwd)"

if [ -f "$REPO_CANDIDATE/SKILL.md" ] && [ -f "$REPO_CANDIDATE/RULES.md" ] && [ -d "$REPO_CANDIDATE/knowledge/design" ]; then
  SOURCE_DIR="$REPO_CANDIDATE"
fi

if [ -n "$SOURCE_DIR" ]; then
  echo "[design-install] Using local source tree: $SOURCE_DIR"
else
  echo "[design-install] Cloning $REPO ..."
  git clone --depth 1 "$REPO" "$TMP_DIR" >/dev/null 2>&1 || { echo "[design-install] ERROR: clone failed"; exit 1; }
  SOURCE_DIR="$TMP_DIR"
fi

echo "[design-install] Validating frontmatter ..."
FRONTMATTER_SCRIPT="$SOURCE_DIR/scripts/ci/validate-frontmatter.ts"
LINK_SCRIPT="$SOURCE_DIR/scripts/ci/validate-links.ts"
if [ -f "$FRONTMATTER_SCRIPT" ]; then
  if ! npx -y tsx "$FRONTMATTER_SCRIPT" "$SOURCE_DIR" >/dev/null 2>&1; then
    echo "[design-install] ERROR: frontmatter validation failed"
    npx -y tsx "$FRONTMATTER_SCRIPT" "$SOURCE_DIR" || true
    exit 1
  fi
else
  echo "[design-install] SKIP: frontmatter validator not found in source"
fi

echo "[design-install] Validating links ..."
if [ -f "$LINK_SCRIPT" ]; then
  if ! npx -y tsx "$LINK_SCRIPT" "$SOURCE_DIR" >/dev/null 2>&1; then
    echo "[design-install] ERROR: link validation failed"
    npx -y tsx "$LINK_SCRIPT" "$SOURCE_DIR" || true
    exit 1
  fi
else
  echo "[design-install] SKIP: link validator not found in source"
fi

echo "[design-install] Verifying ADR integrity ..."
VERIFY_ADR_SCRIPT="$SOURCE_DIR/scripts/verify-design-adrs.ts"
if [ -f "$VERIFY_ADR_SCRIPT" ]; then
  if ! (cd "$SOURCE_DIR" && npx -y tsx "$VERIFY_ADR_SCRIPT") >/dev/null 2>&1; then
    echo "[design-install] ERROR: ADR verification failed"
    (cd "$SOURCE_DIR" && npx -y tsx "$VERIFY_ADR_SCRIPT") || true
    exit 1
  fi
else
  echo "[design-install] SKIP: ADR verifier not found in source"
fi

if [ "$CHECK_ONLY" = true ]; then
  echo "[design-install] CHECK OK: source validates and is installable."
  exit 0
fi

echo "[design-install] Installing design skill into project at: $TARGET_DIR"

# Destination directories in the target project
PROJECT_AGENTS_DIR="$TARGET_DIR/.agents"
SKILL_DEST_DIR="$PROJECT_AGENTS_DIR/skills/$SKILL_NAME"
RULES_DEST_DIR="$PROJECT_AGENTS_DIR/rules"

mkdir -p "$SKILL_DEST_DIR"
mkdir -p "$RULES_DEST_DIR"

# 1. Install root project RULES.md
echo "[design-install] Copying RULES.md to project root ..."
cp "$SOURCE_DIR/RULES.md" "$TARGET_DIR/RULES.md"

# 2. Install workspace rule under .agents/rules/
echo "[design-install] Copying design rules to .agents/rules/design-rules.md ..."
cp "$SOURCE_DIR/RULES.md" "$RULES_DEST_DIR/design-rules.md"

# 3. Install skill package under .agents/skills/design/
echo "[design-install] Installing skill files to .agents/skills/$SKILL_NAME/ ..."
cp "$SOURCE_DIR/SKILL.md" "$SKILL_DEST_DIR/"
cp "$SOURCE_DIR/REFERENCE.md" "$SKILL_DEST_DIR/"

if [ -d "$SOURCE_DIR/knowledge" ]; then
  mkdir -p "$SKILL_DEST_DIR/knowledge"
  cp -R "$SOURCE_DIR/knowledge/." "$SKILL_DEST_DIR/knowledge/"
fi

if [ -d "$SOURCE_DIR/scripts" ]; then
  mkdir -p "$SKILL_DEST_DIR/scripts"
  cp -R "$SOURCE_DIR/scripts/." "$SKILL_DEST_DIR/scripts/"
fi

echo "[design-install] Successfully installed design skill into $TARGET_DIR:"
echo "  - $TARGET_DIR/RULES.md"
echo "  - $PROJECT_AGENTS_DIR/rules/design-rules.md"
echo "  - $SKILL_DEST_DIR/SKILL.md"
echo "  - $SKILL_DEST_DIR/REFERENCE.md"
echo "  - $SKILL_DEST_DIR/knowledge/"
echo "  - $SKILL_DEST_DIR/scripts/"
