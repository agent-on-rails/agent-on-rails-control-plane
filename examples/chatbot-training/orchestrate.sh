#!/usr/bin/env bash
# Orchestrate Agent On Rails discovery → gather → chatbot training specs.
#
# Shape (AOR-011 Discovery AI Team + AOR-010 gather):
#   BRIEF → PRD → ARCHITECTURE → enriched requirements → aor gather → specs/training/
#
# Usage:
#   ./examples/chatbot-training/orchestrate.sh \
#     --requirements ./examples/chatbot-training/requirements.sample.md \
#     --out /tmp/knowledgechat-control-plane \
#     --stub
#
# Flags:
#   --requirements PATH   Natural-language chatbot requirements (required)
#   --out PATH            Output control-plane project root (required)
#   --stub                Force offline gather extract (no LLM)
#   --llm                 Allow AOR_LLM_* polish on PRD (optional)
#   --force               Overwrite existing scaffold / gather files
#   --skip-init           Assume --out is already an AOR project
#   --skip-gather         Only run discovery + training pack (no aor gather)
#   -y / --yes            Non-interactive confirms for aor gather
#   -h / --help           Show help

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTROL_PLANE_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
DISCOVERY_STUB="${SCRIPT_DIR}/discovery_stub.py"

REQUIREMENTS=""
OUT=""
STUB=0
LLM=0
FORCE=0
SKIP_INIT=0
SKIP_GATHER=0
YES=0

usage() {
  sed -n '2,24p' "$0" | sed 's/^# \?//'
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --requirements) REQUIREMENTS="${2:-}"; shift 2 ;;
    --out) OUT="${2:-}"; shift 2 ;;
    --stub) STUB=1; shift ;;
    --llm) LLM=1; shift ;;
    --force) FORCE=1; shift ;;
    --skip-init) SKIP_INIT=1; shift ;;
    --skip-gather) SKIP_GATHER=1; shift ;;
    -y|--yes) YES=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; usage; exit 2 ;;
  esac
done

if [[ -z "${REQUIREMENTS}" || -z "${OUT}" ]]; then
  echo "error: --requirements and --out are required" >&2
  usage
  exit 2
fi

if [[ ! -f "${REQUIREMENTS}" ]]; then
  echo "error: requirements file not found: ${REQUIREMENTS}" >&2
  exit 2
fi

if ! command -v aor >/dev/null 2>&1; then
  echo "error: aor CLI not found on PATH (install agent-on-rails-cli)" >&2
  exit 127
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 required for discovery_stub.py" >&2
  exit 127
fi

REQUIREMENTS="$(cd "$(dirname "${REQUIREMENTS}")" && pwd)/$(basename "${REQUIREMENTS}")"
mkdir -p "${OUT}"
OUT="$(cd "${OUT}" && pwd)"

echo "==> Agent On Rails chatbot training orchestration"
echo "    requirements: ${REQUIREMENTS}"
echo "    out:          ${OUT}"
echo "    control-plane templates: ${CONTROL_PLANE_ROOT}/templates/discovery/chatbot-rag.md"
echo

# --- Stage 0: project bootstrap (AOR-001) ------------------------------------
# SurveyDesk gather writes specs/{product,requirements,...} which aor init's
# AOR-bundle validator treats as incomplete. Only init empty / non-gather trees.
needs_init=1
if [[ "${SKIP_INIT}" -eq 1 ]]; then
  needs_init=0
elif [[ -f "${OUT}/AGENTS.md" && -d "${OUT}/specs/product" ]]; then
  needs_init=0
  echo "==> STAGE 0  skipped (existing SurveyDesk-shaped project; use a fresh --out to re-init)"
elif [[ -f "${OUT}/AGENTS.md" && "${FORCE}" -eq 0 ]]; then
  needs_init=0
  echo "==> STAGE 0  skipped (project exists; pass --force with a clean dir or --skip-init)"
fi

if [[ "${needs_init}" -eq 1 ]]; then
  echo "==> STAGE 0  aor init (project bootstrap)"
  # Prefer a clean specs/ before init when forcing a full rebuild
  if [[ "${FORCE}" -eq 1 && -d "${OUT}/specs" ]]; then
    # Keep training pack intent; init needs an empty-ish contract tree
    rm -rf "${OUT}/specs"
  fi
  INIT_ARGS=("${OUT}" --name KnowledgeChat)
  if [[ "${FORCE}" -eq 1 ]]; then
    INIT_ARGS+=(--force)
  fi
  aor init "${INIT_ARGS[@]}"
fi

mkdir -p "${OUT}/.aor/chatbot-training"
cp "${CONTROL_PLANE_ROOT}/templates/discovery/chatbot-rag.md" \
  "${OUT}/.aor/chatbot-training/persona-chatbot-rag.md"

# --- Stages 1–2: Discovery PRD + Architecture (AOR-011 shape) ---------------
echo "==> STAGE 1–2  Discovery stub: PRD + ARCHITECTURE (gates are manual reviews of files)"
STUB_ARGS=(
  --requirements "${REQUIREMENTS}"
  --root "${OUT}"
  --stage all
  --enriched-out "${OUT}/.aor/chatbot-training/enriched-requirements.md"
)
if [[ "${LLM}" -eq 1 ]]; then
  STUB_ARGS+=(--llm)
fi
python3 "${DISCOVERY_STUB}" "${STUB_ARGS[@]}"

ENRICHED="${OUT}/.aor/chatbot-training/enriched-requirements.md"
ROLE_REPORT="${OUT}/.aor/chatbot-training/role-report.md"
{
  echo "# Role report — chatbot training orchestrate"
  echo
  echo "| Stage | Role | Artifact |"
  echo "| --- | --- | --- |"
  echo "| PRD | Product Manager (stub) | product/prd.md |"
  echo "| Architecture | Solution Architect chatbot-rag (stub) | ARCHITECTURE.md |"
  echo "| Enrich | Implementation Planner prep | .aor/chatbot-training/enriched-requirements.md |"
  echo "| Gather | AOR-010 | specs/ (SurveyDesk-shaped) |"
  echo "| Training pack | Implementation Planner (stub) | specs/training/ |"
  echo
  echo "Human must REVIEW → APPROVED before coding agents run."
} > "${ROLE_REPORT}"
echo "    role report: ${ROLE_REPORT}"

# --- Stage 3: gather control-plane specs (AOR-010) --------------------------
if [[ "${SKIP_GATHER}" -eq 0 ]]; then
  echo "==> STAGE 3  aor gather run (SurveyDesk-shaped specs)"
  GATHER_ARGS=(gather run --file "${ENRICHED}" --root "${OUT}")
  if [[ "${STUB}" -eq 1 ]]; then
    GATHER_ARGS+=(--stub)
  fi
  if [[ "${YES}" -eq 1 ]]; then
    GATHER_ARGS+=(--yes)
  fi
  if [[ "${FORCE}" -eq 1 ]]; then
    GATHER_ARGS+=(--force)
  fi
  aor "${GATHER_ARGS[@]}"
else
  echo "==> STAGE 3  skipped (--skip-gather)"
fi

# Re-assert training pack after gather (gather may recreate specs/)
echo "==> STAGE 4  refresh specs/training pack"
python3 "${DISCOVERY_STUB}" \
  --requirements "${REQUIREMENTS}" \
  --root "${OUT}" \
  --stage training

echo
echo "==> Done (drafts only — not APPROVED)"
echo "    Review:"
echo "      ${OUT}/product/prd.md"
echo "      ${OUT}/ARCHITECTURE.md"
echo "      ${OUT}/specs/"
echo "      ${OUT}/specs/training/"
echo "    Next:"
echo "      aor spec list --root ${OUT}"
echo "      # human APPROVED → aor plan / aor run"
echo
echo "    Note: full multi-agent aor grill (AOR-011) is not shipped yet;"
echo "    this script follows the same stage order with local stubs + aor gather."
