#!/usr/bin/env bash
set -euo pipefail

# TALE Skill Installer
# Copies the tale skill into a target repository or global agent configuration.
# Supports both local repository execution and remote one-liner execution via curl.

REPO_URL="https://github.com/Wiltermoodj/stubs.git"
BRANCH="${TALE_BRANCH:-main}"
TMP_DIR="${TMPDIR:-/tmp}/tale-install-$$"

cleanup() {
  if [[ -d "${TMP_DIR}" ]]; then
    rm -rf "${TMP_DIR}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

SCRIPT_DIR=""
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd || true)"
fi
SKILL_ROOT=""

# Determine if running locally from within the stubs repo or skill directory
if [[ -n "${SCRIPT_DIR}" ]] && [[ -f "${SCRIPT_DIR}/../SKILL.md" ]]; then
  SKILL_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
fi

show_help() {
  cat << 'EOF'
TALE Skill Installer

Usage:
  install.sh [options]

One-liner Remote Install:
  curl -fsSL https://raw.githubusercontent.com/Wiltermoodj/stubs/main/packages/tale/skill/scripts/install.sh | bash

Options:
  -g, --global              Install skill globally (~/.gemini/config/skills/tale)
  -p, --project <PATH>      Install skill into a project repository (<PATH>/.agents/skills/tale)
  -h, --help                Show this help message

Default:
  Installs into the current working directory at ./.agents/skills/tale and ./.agents/rules/
EOF
}

TARGET_TYPE="project"
TARGET_PATH="$(pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -g|--global)
      TARGET_TYPE="global"
      shift
      ;;
    -p|--project)
      if [[ -z "${2:-}" ]]; then
        echo "Error: --project requires a directory path." >&2
        exit 1
      fi
      TARGET_TYPE="project"
      TARGET_PATH="$2"
      shift 2
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      show_help
      exit 1
      ;;
  esac
done

# Resolve absolute target path
if [[ "${TARGET_TYPE}" == "global" ]]; then
  SKILL_DEST="${HOME}/.gemini/config/skills/tale"
  RULES_DEST="${HOME}/.gemini/config/rules"
else
  TARGET_PATH="$(cd "${TARGET_PATH}" 2>/dev/null && pwd || { mkdir -p "${TARGET_PATH}" && cd "${TARGET_PATH}" && pwd; })"
  SKILL_DEST="${TARGET_PATH}/.agents/skills/tale"
  RULES_DEST="${TARGET_PATH}/.agents/rules"
fi

# Acquire skill source tree
if [[ -n "${SKILL_ROOT}" ]] && [[ -f "${SKILL_ROOT}/SKILL.md" ]]; then
  echo "[tale-install] Using local source tree at: ${SKILL_ROOT}"
  SOURCE_DIR="${SKILL_ROOT}"
  RULES_SRC="$(cd "${SKILL_ROOT}/../rules" 2>/dev/null && pwd)/agent-conciseness-and-tale.md"
  if [[ ! -f "${RULES_SRC}" ]]; then
    RULES_SRC="$(cd "${SKILL_ROOT}/../../rules" 2>/dev/null && pwd)/agent-conciseness-and-tale.md"
  fi
else
  echo "[tale-install] Fetching tale skill from ${REPO_URL} (${BRANCH})..."
  mkdir -p "${TMP_DIR}"
  git clone --depth 1 --branch "${BRANCH}" --filter=blob:none --sparse "${REPO_URL}" "${TMP_DIR}" >/dev/null 2>&1 || \
    git clone --depth 1 --branch "${BRANCH}" "${REPO_URL}" "${TMP_DIR}" >/dev/null 2>&1 || {
      echo "Error: Failed to clone ${REPO_URL}." >&2
      exit 1
    }

  (
    cd "${TMP_DIR}"
    git sparse-checkout set packages/tale/skill packages/tale/rules >/dev/null 2>&1 || true
  )

  SOURCE_DIR="${TMP_DIR}/packages/tale/skill"
  RULES_SRC="${TMP_DIR}/packages/tale/rules/agent-conciseness-and-tale.md"
fi

if [[ ! -f "${SOURCE_DIR}/SKILL.md" ]]; then
  echo "Error: SKILL.md not found in source directory." >&2
  exit 1
fi

echo "[tale-install] Installing ASD-STE100 tale skill..."
echo "  Source: ${SOURCE_DIR}"
echo "  Skill Destination: ${SKILL_DEST}"
echo "  Rules Destination: ${RULES_DEST}"

mkdir -p "${SKILL_DEST}"
mkdir -p "${RULES_DEST}"

# Copy skill files
cp "${SOURCE_DIR}/SKILL.md" "${SKILL_DEST}/"

if [[ -d "${SOURCE_DIR}/references" ]]; then
  mkdir -p "${SKILL_DEST}/references"
  cp -R "${SOURCE_DIR}/references/." "${SKILL_DEST}/references/"
fi

if [[ -d "${SOURCE_DIR}/scripts" ]]; then
  mkdir -p "${SKILL_DEST}/scripts"
  cp -R "${SOURCE_DIR}/scripts/." "${SKILL_DEST}/scripts/"
fi

if [[ -d "${SOURCE_DIR}/resources" ]]; then
  mkdir -p "${SKILL_DEST}/resources"
  cp -R "${SOURCE_DIR}/resources/." "${SKILL_DEST}/resources/"
fi

# Copy governance rules
if [[ -f "${RULES_SRC}" ]]; then
  cp "${RULES_SRC}" "${RULES_DEST}/agent-conciseness-and-tale.md"
  echo "  ✓ Installed governance rule: ${RULES_DEST}/agent-conciseness-and-tale.md"
fi

# Make scripts executable
if [[ -d "${SKILL_DEST}/scripts" ]]; then
  chmod +x "${SKILL_DEST}/scripts"/* >/dev/null 2>&1 || true
fi

echo "✓ ASD-STE100 tale skill installed successfully."
