# Guide: Chatbot training-spec orchestration

How to turn **natural-language chatbot requirements** into an Agent On Rails control-plane pack **plus** conversation training / eval artifacts.

> Docs define intent. Specs define the contract. Training scenarios prove chatbot quality before release.

This guide is the full operator manual for [`examples/chatbot-training/`](../examples/chatbot-training/). Start with the [quick start](#3-quick-start), then deepen as needed.

---

## 1. What this is (and is not)

### What you get

| Output | Purpose |
| --- | --- |
| `product/prd.md` | Product Manager draft (Discovery stage) |
| `ARCHITECTURE.md` | Solution Architect draft (Discovery stage) |
| `specs/` | SurveyDesk-shaped control-plane drafts (`aor gather`, AOR-010) |
| `specs/training/` | Golden scenarios, eval checklist, policy constraints |
| `.aor/chatbot-training/` | Enriched brief, persona copy, role report |

### What this is not

- Not a fine-tuning / LoRA pipeline (unless your requirements explicitly demand one)
- Not auto-approval of specs — drafts stay draft until a human `APPROVED`
- Not the delivery AI Team (Implementor → Reviewer). That starts **after** approval
- Not production chatbot application code (control plane stays authority-only)

### Where it sits in Agent On Rails

```text
Your requirements.md
        │
        ▼
┌───────────────────────────────┐
│ Discovery (AOR-011 shape)     │  PRD → Architecture → enrich
│ (local stub until aor grill)  │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ aor gather (AOR-010)          │  SurveyDesk-shaped specs/
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ specs/training/               │  Scenarios + eval gate
└───────────────┬───────────────┘
                │
                ▼
        Human REVIEW → APPROVED
                │
                ▼
        aor plan → aor run → review → evidence
```

Governing docs: [ADR-009](../adr/ADR-009-discovery-ai-team.md), [AOR-011](../specs/AOR-011-discovery-ai-team/spec.md), [AOR-010](../specs/AOR-010-natural-spec-gathering/spec.md), persona [`templates/discovery/chatbot-rag.md`](../templates/discovery/chatbot-rag.md).

---

## 2. Prerequisites

| Requirement | Notes |
| --- | --- |
| This repo cloned | `agent-on-rails-control-plane` |
| [`aor` CLI](https://github.com/agent-on-rails/agent-on-rails-cli) on `PATH` | `aor --version` should work |
| `python3` | Used by `discovery_stub.py` |
| Optional LLM | `AOR_LLM_BASE_URL` + `AOR_LLM_API_KEY` (+ optional `AOR_LLM_MODEL`) |

Install / upgrade CLI (typical):

```bash
# from agent-on-rails-cli checkout, or via your preferred install path
pipx install -e /path/to/agent-on-rails-cli   # example
aor --version
aor guide
```

Verify scripts are executable:

```bash
cd /path/to/agent-on-rails-control-plane
chmod +x examples/chatbot-training/orchestrate.sh examples/chatbot-training/discovery_stub.py
```

### LLM config (optional, recommended for quality)

Same provider-neutral OpenAI-compatible settings as `aor gather` (ADR-003):

```bash
export AOR_LLM_BASE_URL="https://api.openai.com/v1"   # or your gateway
export AOR_LLM_API_KEY="…"
export AOR_LLM_MODEL="gpt-4o-mini"                    # optional
```

Or `~/.config/agent-on-rails/llm.yaml` as documented by `aor guide`.

Without a key, use `--stub` for an offline demo (coarser requirement titles).

---

## 3. Quick start

### Offline demo (sample KnowledgeChat brief)

```bash
cd /path/to/agent-on-rails-control-plane

./examples/chatbot-training/orchestrate.sh \
  --requirements ./examples/chatbot-training/requirements.sample.md \
  --out /tmp/knowledgechat-control-plane \
  --stub --yes --force
```

### With your own requirements + LLM gather

```bash
./examples/chatbot-training/orchestrate.sh \
  --requirements ./path/to/my-chatbot-requirements.md \
  --out ./my-chatbot-control-plane \
  --yes --force --llm
```

Omit `--stub` so gather can call the configured LLM. `--llm` optionally polishes the PRD via the same endpoint.

### What to open first

```text
<out>/product/prd.md
<out>/ARCHITECTURE.md
<out>/specs/README.md
<out>/specs/training/scenarios.md
<out>/specs/training/eval-checklist.md
<out>/.aor/chatbot-training/role-report.md
```

---

## 4. Write good requirements

The sample brief is [`requirements.sample.md`](../examples/chatbot-training/requirements.sample.md). Mirror that shape:

| Section | Why it matters |
| --- | --- |
| **Product name** | Becomes the project / outline name (`Product name: **YourBot**`) |
| **Users** | Personas for PRD + gather |
| **Must-have** | Numbered SHALL-style behaviors (chat, grounding, citations, safety, training pack) |
| **Non-goals** | Stops agents inventing fine-tunes, voice, SaaS, etc. |
| **Success metrics** | Feeds eval pass bar (e.g. ≥ 80% golden scenarios) |
| **Constraints** | Docs-first, provider-neutral LLM, secrets policy, human approval |

### Minimum viable brief

If you only have a few sentences, still name the product and state:

1. Who chats with the bot  
2. What knowledge it may use  
3. Whether answers must cite sources  
4. What it must refuse  
5. That a training/eval pack is required before release  

The orchestrator **enriches** your brief into SHALL lines for gather; a clearer brief still yields better drafts.

### What “training specs” means here

| Artifact | Meaning |
| --- | --- |
| Golden scenarios (S1–S5) | Durable conversation contracts for eval |
| Eval checklist | Release gate before promoting prompt / index / model |
| Policy constraints | System-prompt / runtime rules coding agents must honor |

This is **not** unlabeled chat logs for weight updates unless you explicitly extend the pack.

---

## 5. Command reference

```bash
./examples/chatbot-training/orchestrate.sh \
  --requirements PATH \
  --out PATH \
  [options]
```

| Flag | Required | Description |
| --- | --- | --- |
| `--requirements PATH` | yes | Natural-language chatbot requirements (Markdown/text) |
| `--out PATH` | yes | Output control-plane project directory (created if missing) |
| `--stub` | no | Force offline `aor gather` extract (no LLM) |
| `--llm` | no | Polish PRD with `AOR_LLM_*` when configured |
| `--force` | no | Allow overwrite of gather/scaffold files; re-init cleans conflicting `specs/` when needed |
| `--skip-init` | no | Do not run `aor init` (reuse existing project) |
| `--skip-gather` | no | Only discovery stub + training pack (no `aor gather`) |
| `-y` / `--yes` | no | Non-interactive confirm for gather write |
| `-h` / `--help` | no | Show flag summary |

### `discovery_stub.py` (advanced)

Used by the shell script; you can call stages alone:

```bash
python3 examples/chatbot-training/discovery_stub.py \
  --requirements ./examples/chatbot-training/requirements.sample.md \
  --root /tmp/knowledgechat-control-plane \
  --stage all
```

`--stage` values: `prd` | `architecture` | `enrich` | `training` | `all`.

---

## 6. Stage-by-stage walkthrough

### Stage 0 — `aor init` (AOR-001)

Creates a valid Agent On Rails project contract under `--out` (`AGENTS.md`, `product/`, policies stub, etc.).

- Skipped automatically if `--out` already looks like a SurveyDesk gather tree (`specs/product` present), or if you pass `--skip-init`.
- Copies persona [`chatbot-rag`](../templates/discovery/chatbot-rag.md) to `.aor/chatbot-training/persona-chatbot-rag.md`.

### Stage 1 — Product Manager → PRD

Writes `product/prd.md` from your brief (users, must-haves, non-goals, metrics, constraints, open questions).

- With `--llm`, may polish the Markdown via Chat Completions.
- **Human gate:** edit the PRD before you trust later stages for a real product.

### Stage 2 — Solution Architect → architecture

Writes `ARCHITECTURE.md` biased to grounded chat + RAG + eval-before-release (chatbot-rag persona).

- **Human gate:** confirm deploy/inference/retrieval choices before implementation.

### Enrich — Implementation Planner prep

Writes `.aor/chatbot-training/enriched-requirements.md`: dense SHALL lines + your original brief, so `aor gather` has structured input even in stub mode.

### Stage 3 — `aor gather run` (AOR-010)

```text
enriched requirements → outline (.aor/gather/outline.json) → confirm → specs/
```

Produces SurveyDesk-shaped trees:

```text
specs/product/
specs/requirements/
specs/domain/
specs/api/
specs/adr/
specs/acceptance/
specs/regeneration/
```

Use `--yes` in CI/demo; omit it for an interactive confirm.

### Stage 4 — Training pack

(Re)writes `specs/training/`:

| File | Contents |
| --- | --- |
| `README.md` | What the pack is for |
| `scenarios.md` | S1–S5 golden scenarios |
| `eval-checklist.md` | Pre-release checkbox + pass bar |
| `policy-constraints.md` | Runtime / prompt constraints |
| `manifest.json` | Machine-readable pack metadata |

Also writes `.aor/chatbot-training/role-report.md` summarizing stage → role → artifact.

---

## 7. Understanding the outputs

### Control-plane vs training pack

| Tree | Audience | Used when |
| --- | --- | --- |
| `specs/requirements`, `acceptance`, … | Implementors / reviewers | Building the chatbot product |
| `specs/training/` | Eval operators / prompt owners | Promoting a prompt, index, or model revision |

Both are **drafts** until human approval. Coding agents must not treat stub output as production truth without review.

### Default golden scenarios

| ID | Intent |
| --- | --- |
| S1 | Happy path grounded answer + citation |
| S2 | Abstain when unknown |
| S3 | Clarification for ambiguous questions |
| S4 | Jailbreak / policy-override refusal |
| S5 | Citation integrity |

Adjust scenarios to match your domain (legal, medical, HR, etc.) **before** APPROVED — do not silently change them after agents start implementing.

### Stub vs LLM gather quality

| Mode | When | Expectation |
| --- | --- | --- |
| `--stub` | Offline / CI smoke | Usable tree; requirement titles may be sentence-split |
| LLM gather (no `--stub`, key set) | Real products | Better IDs, titles, domains, ADRs |
| Future `aor grill` | After AOR-011 approved + shipped | Full multi-agent Discovery Team |

---

## 8. After orchestration — approve and deliver

Orchestration **stops at drafts**. Continue with the normal AOR loop:

```bash
cd /path/to/your-out-project

aor status
aor spec list          # if available for your CLI version
# Edit PRD, ARCHITECTURE, specs/, specs/training/ as needed

# Human approval (CLI and/or GitHub labels / PR review of the control-plane repo)
# Then:
aor plan <spec-id>
aor run <spec-id-or-task>
aor review <spec-id-or-task>
```

Policy reminders:

- Implementor ≠ reviewer ([ADR-005](../adr/ADR-005-ai-team-first-class.md))
- Evidence required before DONE ([ADR-004](../adr/ADR-004-evidence-required-before-done.md))
- Human final merge / `FINAL_REVIEW`
- Prefer stronger models for architect/reviewer; faster models for implementors (cost controls)

### Suggested human review checklist

- [ ] PRD matches the real stakeholder intent  
- [ ] Architecture is operable (retrieval, secrets, provider)  
- [ ] Requirements SHALL lines are testable  
- [ ] Training scenarios cover your real risk cases (not only the sample S1–S5)  
- [ ] Eval pass bar matches product metrics  
- [ ] No secrets in the control-plane tree  
- [ ] Status moved `REVIEW → APPROVED` deliberately  

---

## 9. Common workflows

### A. Dogfood the sample end-to-end

```bash
./examples/chatbot-training/orchestrate.sh \
  --requirements ./examples/chatbot-training/requirements.sample.md \
  --out /tmp/knowledgechat-control-plane \
  --stub --yes --force

ls /tmp/knowledgechat-control-plane/specs/training
```

### B. Iterate training pack only

```bash
./examples/chatbot-training/orchestrate.sh \
  --requirements ./my-reqs.md \
  --out ./my-chatbot-control-plane \
  --skip-init --skip-gather --yes
```

### C. Re-gather after editing the brief

1. Edit requirements file  
2. Re-run with `--force --yes` (and LLM if configured)  
3. Diff `specs/` and `specs/training/`  
4. Re-approve if previously approved  

### D. Point an existing control-plane project

```bash
./examples/chatbot-training/orchestrate.sh \
  --requirements ./my-reqs.md \
  --out ./existing-control-plane \
  --skip-init --yes --force
```

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `aor: command not found` | CLI not installed | Install `agent-on-rails-cli`; fix `PATH` |
| Gather writes odd SD-00N titles | Stub sentence-split | Drop `--stub`; set `AOR_LLM_*` |
| `aor init` validation noise on re-run | SurveyDesk folders confuse AOR-bundle checker | Use a fresh `--out`, or let the script skip init when `specs/product` exists |
| PRD not polished | No `--llm` or missing key | Export `AOR_LLM_*` and pass `--llm` |
| Training pack missing after gather | Gather refreshed `specs/` | Stage 4 re-runs automatically; re-run with `--skip-gather` if needed |
| Want interactive confirm | Used `--yes` | Omit `-y` / `--yes` |

---

## 11. Security and policy

- Never commit API keys, customer PII, or production secrets into `--out`  
- Prefer env / secret manager for inference and source-index credentials  
- Jailbreak / refusal scenarios (S4) are mandatory for release gates unless product explicitly waives them with human approval  
- Domain-regulated chatbots (legal, medical, financial) need human-authored constraints beyond the sample pack  

See [`policies/human-approval.md`](../policies/human-approval.md) and related secrets policies under [`policies/`](../policies/).

---

## 12. Roadmap note (`aor grill`)

Today Discovery stages 1–2 are a **local stub** that follows [AOR-011](../specs/AOR-011-discovery-ai-team/spec.md) order. When `aor grill` ships in the CLI:

1. Prefer `aor grill` for PO ↔ PM → Architect → Planner dialogue  
2. Keep this orchestrator as a thin wrapper that calls grill + writes `specs/training/`  
3. Persona `chatbot-rag` remains the default architect template for this path  

Until then, treat stub PRD/architecture as editable drafts, not finished product intent.

---

## 13. File map

```text
examples/chatbot-training/
├── README.md                 # Short pointer → this guide
├── orchestrate.sh            # Operator entrypoint
├── discovery_stub.py         # PRD / architecture / enrich / training writer
└── requirements.sample.md    # KnowledgeChat fixture brief

templates/discovery/
└── chatbot-rag.md            # Discovery persona for grounded chatbots

guides/
└── chatbot-training-orchestration.md   # This document
```

---

## 14. Related reading

| Doc | Why |
| --- | --- |
| [Using the control plane](./using-the-control-plane.md) | General human/agent operating model |
| [AGENTS.md](../AGENTS.md) | Boundaries and authority hierarchy |
| [ADR-009 Discovery AI Team](../adr/ADR-009-discovery-ai-team.md) | Why staged discovery exists |
| [AOR-011](../specs/AOR-011-discovery-ai-team/spec.md) | Discovery contract (in review) |
| [AOR-010](../specs/AOR-010-natural-spec-gathering/spec.md) | `aor gather` contract |
| [ADR-005 AI Team](../adr/ADR-005-ai-team-first-class.md) | Delivery team after approval |
| [examples/lakuyo](../examples/lakuyo/) | External dogfood shape (POS) |
