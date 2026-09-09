# Next — inventory (2026-09-09)

Status after M0 + marketing site + CLI handoff foundation. Herry CLI `main` review (2026-09-09): points **#13 Intelligent escalation** and **#15 Unattended AI Team runtime** (incl. env stuck / device wait) are the spine priorities.

## Done

| Item | Where |
| --- | --- |
| Authority plane (docs, ADRs, policies, AOR-001…008, schemas, how-to) | `agent-on-rails-control-plane` |
| Marketing site + brand | `agent-on-rails-website` → https://agent-on-rails.suherman.net |
| CLI as docs-first handoff + AI Team config | `agent-on-rails-cli` (not yet unattended runtime) |

## Spine priority (Herry review → build order)

| # | Gap | Spec / policy | Why first |
| --- | --- | --- | --- |
| **13** | Intelligent escalation | [AOR-006](../specs/AOR-006-model-escalation/spec.md), [`policies/escalation.md`](../policies/escalation.md) | AOR decides forever-loop vs normal fix↔review (same signature vs different bugs); hard stop only when stuck |
| **15** | Unattended AI Team + watchdog | [AOR-009](../specs/AOR-009-unattended-ai-team-runtime/spec.md), [`policies/execution-watchdog.md`](../policies/execution-watchdog.md) | Operate team without babysitting; kill hung Gradle/device waits; notify humans |
| 10–12 | Implementor / review / fix loop | AOR-004, AOR-005 | Required under the ladder + watchdog |
| 9 | Engine integration | live APIs | Makes 10–15 real |
| 14 | Multi-repo orchestration | AOR-003 enhancement | After single-repo loop works |

**Rule:** environment stuckness is **not** a model-escalation problem. Forever-loop is **same failure signature repeating** — not “N cycles that each fixed a different bug.”

## Next (ordered)

### 0. Control-plane coherence — **in REVIEW** (2026-09-09)

Plan: [`phase-1-backend-coherence.md`](./phase-1-backend-coherence.md)

- [x] AOR-006 Option A forever-loop ladder (primary stop) + strike max as ceiling
- [x] AOR-009 task API + engine-owned state + full RunReport + wave-level env `HUMAN_REQUIRED`
- [x] Watchdog policy: Gradle specific-first classification
- [x] Evidence schema RunReport fields expanded
- [ ] **Human** `REVIEW → APPROVED` on AOR-006 and AOR-009
- [ ] Only then treat sibling Phase 1 implementation as contract-compliant (not spike)

### 1. Engine spine — escalate + watchdog first

Repos:
- [`agent-on-rails-engine`](https://github.com/agent-on-rails/agent-on-rails-engine) (scaffold on `main`, 2026-09-09)
- [`agent-on-rails-agent-runtime`](https://github.com/agent-on-rails/agent-on-rails-agent-runtime) (scaffold on `main`, 2026-09-09)

- [x] **AOR-006** decision function (library + `/v1/escalation/decide`): failure signature → loop verdict (`normal_progress` vs `forever_loop`) → retry / escalate / `HUMAN_REQUIRED`; unit tests
- [ ] Align decide path to **Option A** wording + engine-owned history (Phase 1)
- [x] **Watchdog** library: wall-clock, command timeout (Gradle **and npm**), heartbeat, preflight helpers, run-report structure ([`execution-watchdog.md`](../policies/execution-watchdog.md))
- [ ] Fix Gradle specific-first classification (Phase 1 P0)
- [ ] Task API + persistent task state (Phase 1 P0)
- [ ] Full RunReport fields per AOR-009 / evidence schema (Phase 1)
- [ ] **AOR-004** structured `ExecutionResult` + mandatory **role report** (`schemas/role-report.schema.json`)
- [ ] **AOR-005** reject → requeue under AOR-006; reviewer ends with role report + finding signatures
- [ ] **AOR-009** manager loop: implement → review → fix → escalate; on env stuck → notify + stop + **continue independent** + **run report**; every hop closes with a role report
- [ ] Wire CLI `aor run` / `watch` + GitHub labels to live engine status
- [ ] Human `APPROVED` on AOR-006 / AOR-009 before treating runtime as production-ready

### 2. Terminal application — `agent-on-rails-cli` (Python)

Primary operator UX for MVP (ADR-007). Repo: [`agent-on-rails-cli`](https://github.com/agent-on-rails/agent-on-rails-cli).

- [x] Repo bootstrap: `aor init` creates/validates control-plane (docs+specs); optional `--create-github` via `gh` (AOR-001)
- [x] Engine client stubs (`AOR_ENGINE_URL`); `aor status` / `run` / `watch`
- [x] Configure AI Team: `aor team` (implementor / reviewer + default & escalate models)
- [ ] Wire live engine APIs + GitHub issue sync
- [x] Human final-review handoff: `aor review` (stub until engine persists)
- [ ] Surface watchdog / `HUMAN_REQUIRED` / escalated clearly in TUI + `aor watch`

### 3. Android monitoring app

Push notifications + light control (not Telegram/WhatsApp as primary UI). Repo: [`agent-on-rails-android`](https://github.com/agent-on-rails/agent-on-rails-android) (Herry).

- [x] Repo scaffold (KMP shared + Compose Android fixture UI)
- [ ] Auth + project list
- [ ] Status: running / review / escalated / **FINAL_REVIEW** / **env stuck** (live API)
- [ ] Push when ready for final review **or** human required (incl. device disconnected / hung npm)
- [ ] Prompt / approve gates (thin; heavy work stays in CLI + GitHub)

### 4. Core runtime spine (repos)

| Repo | Specs | Focus |
| --- | --- | --- |
| `agent-on-rails-engine` | AOR-003, 005, **006**, 007, **009** | Planner, state machine, policy, evidence, AI Team orchestration |
| `agent-on-rails-github` | AOR-002 | App, webhooks, Issues/labels/PRs/Checks |
| `agent-on-rails-agent-runtime` | AOR-004, **006**, **009** | Headless adapters, sandbox, context package, **watchdog** |
| `agent-on-rails-infrastructure` | — | Deploy engine/runtime/github on HaloRT |

### 5. Dogfood gate

- [ ] Thin slice: approved Lakuyo (or fixture) spec → task → agent → PR → review → escalate → evidence → `FINAL_REVIEW` → human done
- [ ] Fixture: hung device-dependent command → cancel within watchdog bounds → notify → continue sibling → run report → `HUMAN_REQUIRED` (not 1h silent wait)
- [ ] Fixture: hung local `npm` → same path (notify + continue independent + report)

## Suggested split

| Who | Owns |
| --- | --- |
| Iman | Engine, GitHub integration, CLI, desktop setup wizard, infra, **AOR-006/009** |
| Herry | Android monitoring (KMP); dogfood desktop setup + CLI; env/device notify UX |

### 6. Desktop setup wizard — `agent-on-rails-desktop` (Tauri)

Thin **onboarding only** (ADR-008 / AOR-008): install `aor` + `aor init`, then hand off to CLI/TUI. Not a full desktop console.

- [x] Repo scaffold (Tauri 2, macOS + Windows targets)
- [x] Prerequisites + CLI install steps
- [x] Project bootstrap UI (`aor init`)
- [x] Link from website docs / download page
- [x] Signed macOS release + Sparkle appcast (notarized Developer ID)
- [ ] Signed Windows MSI (needs `WINDOWS_CERTIFICATE` CI secret) + latest.json platform entry
- [x] Create GitHub repo `agent-on-rails/agent-on-rails-desktop` + first push

## Later (after MVP loop works)

- Multi-repo task graph (#14)
- Web console
- Provider SDK
- Public docs site
- Desktop monitoring (beyond setup wizard)
- Subscription-style model connectivity (API keys first)

## Explicitly not next

- Replacing GitHub as collaboration surface
- Building a proprietary coding agent (use headless adapters)
- Full SaaS multi-tenant before dogfood proof
- Unattended runs **without** watchdog / max-attempt hard stops
