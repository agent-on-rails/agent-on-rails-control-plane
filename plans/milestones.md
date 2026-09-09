# Milestones

## M0 — Authority plane established ✅

- Control-plane repository structured and readable
- Product docs, ADRs, policies, schemas, and AOR-001…007 drafts exist
- AGENTS.md + how-to guide define boundaries for all agents
- Marketing site live: https://agent-on-rails.suherman.net

## M1 — Operator surfaces + spine

- **CLI (terminal)** — bootstrap, team config, run/status (AOR-001 entry)
- **Android monitoring** — status + final-review push notifications
- GitHub App + webhook ingestion (AOR-002)
- Spec ingest + task planner (AOR-003)
- Issues/labels reflect state

## M2 — Execution + review

- Agent runtime context package + PR creation (AOR-004)
- Implementer/reviewer separation (AOR-005)
- Evidence attachment gate (AOR-007)
- Execution watchdog + preflight ([`policies/execution-watchdog.md`](../policies/execution-watchdog.md))

## M3 — Escalation + unattended runtime + dogfood

- Model escalation ladder + **intelligent loop detection** + failure classes + cost bounds (**AOR-006**) — forever-loop = same stuck failure, not distinct-bug fix↔review
- Unattended AI Team orchestration (**AOR-009**) — implement → review → fix under policy
- Env stuck fail-fast (device disconnect / hung Gradle / hung **npm**) → notify + continue independent work + run report → `HUMAN_REQUIRED` when blocking
- Lakuyo thin-slice dogfood + AOR self-dogfood

## M4 — Hardening

- Multi-repo task graph (planner enhancement / Herry review #14)
- Infra baselines, secrets, audit retention
- Reliability fixes from dogfood
- Decide web console / SDK timing
