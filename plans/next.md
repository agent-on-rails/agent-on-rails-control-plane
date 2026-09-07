# Next — inventory (2026-09-07)

Status after M0 + marketing site. Agreed near-term surfaces with Herry: **terminal CLI** + **Android monitoring**.

## Done

| Item | Where |
| --- | --- |
| Authority plane (docs, ADRs, policies, AOR-001…007, schemas, how-to) | `agent-on-rails-control-plane` |
| Marketing site + brand | `agent-on-rails-website` → https://agent-on-rails.suherman.net |

## Next (ordered)

### 1. Terminal application — `agent-on-rails-cli` (Python)

Primary operator UX for MVP (ADR-007).

- [ ] Repo bootstrap: `aor init` creates/validates control-plane (docs+specs) via `gh` (AOR-001)
- [ ] Wire to engine APIs / local orchestrator stubs
- [ ] Configure AI Team: implementor / reviewer + default & escalate models
- [ ] Run / status / watch task + GitHub issue sync
- [ ] Human final-review handoff in terminal

### 2. Android monitoring app

Push notifications + light control (not Telegram/WhatsApp as primary UI).

- [ ] Repo (e.g. `agent-on-rails-android` / KMP shared with later iOS)
- [ ] Auth + project list
- [ ] Status: running / review / escalated / **FINAL_REVIEW**
- [ ] Push when ready for final review
- [ ] Prompt / approve gates (thin; heavy work stays in CLI + GitHub)

### 3. Core runtime spine (needed for CLI/Android to be real)

| Repo | Specs | Focus |
| --- | --- | --- |
| `agent-on-rails-engine` | AOR-003, 005, 006, 007 | Planner, state machine, policy, evidence, AI Team orchestration |
| `agent-on-rails-github` | AOR-002 | App, webhooks, Issues/labels/PRs/Checks |
| `agent-on-rails-agent-runtime` | AOR-004, 006 | Headless adapters, sandbox, context package |
| `agent-on-rails-infrastructure` | — | Deploy engine/runtime/github on HaloRT |

### 4. Dogfood gate

- [ ] Thin slice: approved Lakuyo (or fixture) spec → task → agent → PR → review → escalate → evidence → `FINAL_REVIEW` → human done

## Suggested split

| Who | Owns |
| --- | --- |
| Iman | Engine, GitHub integration, CLI, infra |
| Herry | Android monitoring (KMP), later desktop if needed |

## Later (after MVP loop works)

- Web console
- Provider SDK
- Public docs site
- Desktop monitoring
- Subscription-style model connectivity (API keys first)

## Explicitly not next

- Replacing GitHub as collaboration surface
- Building a proprietary coding agent (use headless adapters)
- Full SaaS multi-tenant before dogfood proof
