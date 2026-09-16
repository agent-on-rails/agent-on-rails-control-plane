# Example: Chatbot training specs orchestration

Operator helper that turns **chatbot requirements** into:

1. Discovery drafts — `product/prd.md` + `ARCHITECTURE.md` (AOR-011 stage order)
2. SurveyDesk-shaped `specs/` via `aor gather` (AOR-010)
3. Chatbot **training / eval pack** under `specs/training/` (scenarios, checklist, policy)

This lives in the control plane as an **example**, not production runtime. When `aor grill` ships, replace the local discovery stub with the real Discovery AI Team.

## Prerequisites

- `aor` on `PATH` ([agent-on-rails-cli](https://github.com/agent-on-rails/agent-on-rails-cli))
- `python3`
- Optional LLM: `AOR_LLM_BASE_URL` + `AOR_LLM_API_KEY` (omit `--stub`, add `--llm` for PRD polish)

## Quick start (offline)

```bash
chmod +x examples/chatbot-training/orchestrate.sh

./examples/chatbot-training/orchestrate.sh \
  --requirements ./examples/chatbot-training/requirements.sample.md \
  --out /tmp/knowledgechat-control-plane \
  --stub --yes --force
```

Then open:

- `/tmp/knowledgechat-control-plane/product/prd.md`
- `/tmp/knowledgechat-control-plane/ARCHITECTURE.md`
- `/tmp/knowledgechat-control-plane/specs/`
- `/tmp/knowledgechat-control-plane/specs/training/scenarios.md`

## With your own requirements

```bash
./examples/chatbot-training/orchestrate.sh \
  --requirements ./path/to/chatbot-requirements.md \
  --out ./my-chatbot-control-plane \
  --yes --force
```

Without `--stub`, gather uses the configured OpenAI-compatible endpoint when a key is present (better requirement titles than stub sentence-split).

`--stub` is for offline demos; expect coarser `specs/requirements/*` until you gather with an LLM or replace this path with `aor grill`.

## Stage map

| Stage | AOR concept | What this script does today |
| --- | --- | --- |
| 0 | AOR-001 init | `aor init` |
| 1 | PM → PRD | `discovery_stub.py` (+ optional `--llm`) |
| 2 | Architect → architecture | `discovery_stub.py` + persona `templates/discovery/chatbot-rag.md` |
| 3 | Planner → specs | `aor gather run` on enriched requirements |
| 4 | Training pack | `specs/training/*` golden scenarios + eval checklist |

Human **APPROVED** is still required before `aor plan` / `aor run`.

## Files

| Path | Role |
| --- | --- |
| `orchestrate.sh` | End-to-end operator entrypoint |
| `discovery_stub.py` | Local PRD / architecture / enrich / training writer |
| `requirements.sample.md` | Fixture brief for KnowledgeChat |

## Related

- [ADR-009 Discovery AI Team](../../adr/ADR-009-discovery-ai-team.md)
- [AOR-011](../../specs/AOR-011-discovery-ai-team/spec.md)
- [AOR-010 gather](../../specs/AOR-010-natural-spec-gathering/spec.md)
- [templates/discovery/chatbot-rag.md](../../templates/discovery/chatbot-rag.md)
