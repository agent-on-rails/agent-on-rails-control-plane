# MVP

## Goal

Prove the core product loop:

> Given an approved spec in a control-plane repository, Agent On Rails can turn it into a bounded implementation task, execute an AI coding agent, create a PR, independently verify it against acceptance criteria, escalate failures, and attach evidence back to the spec.

## In scope repositories

- `agent-on-rails-control-plane` (authority — this repo)
- `agent-on-rails-engine`
- `agent-on-rails-github`
- `agent-on-rails-agent-runtime`
- `agent-on-rails-cli`
- `agent-on-rails-infrastructure`

## Out of scope for MVP

- Web console, public SDK, public docs site
- Multi-SCM providers
- Fully autonomous product invention without human approval

**Note:** Marketing website shipped early (dogfood/brand). Android monitoring is in scope for operator UX alongside CLI (not a full console).

## Governing specs

| Spec | Capability |
| --- | --- |
| [AOR-001](../specs/AOR-001-project-bootstrap/spec.md) | Docs-first bootstrap |
| [AOR-002](../specs/AOR-002-github-ingestion/spec.md) | GitHub as execution UI |
| [AOR-003](../specs/AOR-003-task-planner/spec.md) | Task graphs |
| [AOR-004](../specs/AOR-004-agent-execution/spec.md) | Bounded agent runs |
| [AOR-005](../specs/AOR-005-review-loop/spec.md) | Independent review |
| [AOR-006](../specs/AOR-006-model-escalation/spec.md) | Cheap-first escalation + forever-loop hard stop |
| [AOR-007](../specs/AOR-007-evidence/spec.md) | Evidence before done |
| [AOR-009](../specs/AOR-009-unattended-ai-team-runtime/spec.md) | Unattended AI Team + env watchdog |

## Dogfood

1. Build Agent On Rails using Agent On Rails (self-hosting the loop).
2. Deliver Lakuyo through a Lakuyo control-plane + sibling app repos.
3. Prove env stuck (e.g. device disconnect) fails fast with notify — not a silent hour-long wait.

## Definition of done (MVP)

End-to-end demo on a fixture or Lakuyo approved spec that exercises plan → execute → PR → review → escalate-on-fail → evidence → `FINAL_REVIEW` → human `DONE`, plus a watchdog fixture that cancels hung environment waits.
