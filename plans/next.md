# Next — inventory (2026-09-07)

Status after M0 + marketing site. Agreed near-term surfaces with Herry: **terminal CLI** + **Android monitoring**.

## Done

| Item | Where |
| --- | --- |
| Authority plane (docs, ADRs, policies, AOR-001…007, schemas, how-to) | `agent-on-rails-control-plane` |
| Marketing site + brand | `agent-on-rails-website` → https://agent-on-rails.suherman.net |

## Next (ordered)

### 1. Terminal application — `agent-on-rails-cli` (Python)

Primary operator UX for MVP (ADR-007). Repo: [`agent-on-rails-cli`](https://github.com/agent-on-rails/agent-on-rails-cli).

- [x] Repo bootstrap: `aor init` creates/validates control-plane (docs+specs); optional `--create-github` via `gh` (AOR-001)
- [x] Engine client stubs (`AOR_ENGINE_URL`); `aor status` / `run` / `watch`
- [x] Configure AI Team: `aor team` (implementor / reviewer + default & escalate models)
- [ ] Wire live engine APIs + GitHub issue sync
- [x] Human final-review handoff: `aor review` (stub until engine persists)

### 2. Android monitoring app

Push notifications + light control (not Telegram/WhatsApp as primary UI). Repo: [`agent-on-rails-android`](https://github.com/agent-on-rails/agent-on-rails-android) (Herry).

- [x] Repo scaffold (KMP shared + Compose Android fixture UI)
- [ ] Auth + project list
- [ ] Status: running / review / escalated / **FINAL_REVIEW** (live API)
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
| Iman | Engine, GitHub integration, CLI, desktop setup wizard, infra |
| Herry | Android monitoring (KMP); dogfood desktop setup + CLI |

### 5. Desktop setup wizard — `agent-on-rails-desktop` (Tauri)

Thin **onboarding only** (ADR-008 / AOR-008): install `aor` + `aor init`, then hand off to CLI/TUI. Not a full desktop console.

- [x] Repo scaffold (Tauri 2, macOS + Windows targets)
- [x] Prerequisites + CLI install steps
- [x] Project bootstrap UI (`aor init`)
- [x] Link from website docs / download page
- [x] Signed macOS release + Sparkle appcast (notarized Developer ID)
- [ ] Signed Windows MSI (needs `WINDOWS_CERTIFICATE` CI secret) + latest.json platform entry
- [x] Create GitHub repo `agent-on-rails/agent-on-rails-desktop` + first push

## Later (after MVP loop works)

- Web console
- Provider SDK
- Public docs site
- Desktop monitoring (beyond setup wizard)
- Subscription-style model connectivity (API keys first)

## Explicitly not next

- Replacing GitHub as collaboration surface
- Building a proprietary coding agent (use headless adapters)
- Full SaaS multi-tenant before dogfood proof
