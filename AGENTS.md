# AGENTS.md — Agent On Rails Control Plane

**Read this file first.** Any coding agent entering the Agent On Rails ecosystem must understand repository boundaries, authority hierarchy, prohibited actions, testing expectations, and evidence requirements before acting.

## Mission

You are operating inside the **authority plane**. This repository defines *what* should be built and *how success is proven*. You do **not** implement production application logic here.

## Non-negotiables (from product decisions)

- **Control plane is mandatory** — no Agent On Rails execution without an approved contract in a control-plane repo ([ADR-006](./adr/ADR-006-control-plane-mandatory.md)).
- **Docs live in the control plane** for consumer projects — do not require a separate docs repo.
- **AI Team is first-class** — Manager, Implementor, Reviewer (+ optional specialists), then human final review ([ADR-005](./adr/ADR-005-ai-team-first-class.md)).
- **Headless external agents** — do not invent a proprietary coding agent for MVP ([ADR-007](./adr/ADR-007-python-headless-cli-first.md)).
- **Engine/CLI = Python (FastAPI where applicable)**; CLI-first operator UX.

## Authority hierarchy (highest first)

1. Product intent (`product/`)
2. Architecture Decision Records (`adr/`)
3. Policies (`policies/`)
4. Specifications + acceptance (`specs/**/spec.md`, `acceptance.md`)
5. Implementation plans (`plans/`)
6. Sibling repository code (engine, runtime, github, cli, infrastructure)

When documents conflict, resolve upward. Propose an ADR or spec revision; do not silently override.

## Repository boundaries

| You MAY | You MUST NOT |
| --- | --- |
| Edit docs, specs, ADRs, policies, plans, schemas, examples | Add production application/runtime code |
| Add or refine acceptance criteria and evidence templates | Mark a sibling-repo task DONE without evidence |
| Propose new specs following `AOR-NNN-slug/` layout | Bypass human approval gates in `policies/human-approval.md` |
| Update schemas when contracts change | Commit secrets, tokens, or credentials |
| Reference sibling repos by name only | Implement features “in place” that belong in engine/runtime/github/cli |

## Prohibited actions

- Implementing orchestration, GitHub App, or agent sandbox logic in this repo
- Self-approving your own implementation as the reviewer
- Declaring a spec `DONE` without required evidence artifacts
- Escalating to frontier models without respecting cost and retry bounds
- Performing destructive operations without human approval
- Changing security or secrets policy without `HUMAN_REQUIRED` review

## Docs-first rule

Do **not** start implementation in sibling repositories until:

1. Product intent / proposition exist
2. Relevant architecture and ADRs exist (or are proposed)
3. Spec is at least `APPROVED`
4. Acceptance criteria are explicit
5. Human approval has been recorded where policy requires it

Flow: intent → proposition → PRD → architecture → ADRs → specs → acceptance → plan → tasks → agents.

## Spec and task contracts

- Specs live under `specs/AOR-NNN-slug/` with `spec.md`, `acceptance.md`, and `evidence.md`.
- Specs must remain machine-governable (frontmatter / structured fields) and human-readable (Markdown body).
- Tasks are derived from READY specs as a **task graph**, not a single unbounded prompt.
- Agents receive a bounded context package: SPEC + ACCEPTANCE + ADRs + AGENTS.md + dependent specs + code context + CURRENT TASK.

## Testing expectations

Sibling-repo work must include verification named in the spec (`unit`, `integration`, etc.). Control-plane changes must:

- Keep Markdown links and cross-references valid
- Keep JSON schemas valid (`schemas/*.schema.json`)
- Keep spec IDs unique and sequential (`AOR-NNN`)
- Keep ADR IDs unique (`ADR-NNN`)

## Evidence requirements

A task or spec is not complete because an agent says “done.” It is complete when evidence exists and matches `evidence.md` / `schemas/evidence.schema.json`.

Typical evidence:

- implementation PR + commit SHA
- test results
- independent review result
- execution / escalation log
- optional security and deployment checks

Record evidence under the consuming project’s evidence path (or linked from `specs/**/evidence.md`).

## Model routing defaults

Respect `policies/escalation.md`, `policies/cost-controls.md`, and `policies/execution-watchdog.md`:

- Start at Tier 1 (fast / inexpensive)
- Escalate only after bounded same-tier retries **or** when loop verdict is `forever_loop` (same failure signature)
- Cap forever-loop strikes on the **same** bug; distinct bugs across fix↔review are `normal_progress` (AOR decides — not a blunt attempt counter)
- Cap absolute runaway attempts and cost — never silent infinite scheduling
- Escalate to human for architecture, security, destructive ops, forever-loop cap, absolute max, or **environment stuck**
- Do not escalate model tier for hung builds / hung npm / disconnected devices; cancel + notify, continue independent work when safe, emit run report under the watchdog
- Every implementor / fixer / reviewer assignment must end with a standardized **role report** ([`policies/role-reports.md`](./policies/role-reports.md) / [`schemas/role-report.schema.json`](./schemas/role-report.schema.json))

## Review separation

- **Implementer** produces code/docs and a PR.
- **Reviewer** evaluates against spec + acceptance + diff + tests + evidence — **not** the implementer’s private chain-of-thought.
- Implementers must not mark their own work `DONE`.

## GitHub as execution UI (MVP)

Prefer GitHub Issues, Labels, Projects, PRs, Checks, Comments, and Actions over a custom console.

Canonical labels: `aor:spec`, `aor:ready`, `aor:running`, `aor:review`, `aor:failed`, `aor:escalated`, `aor:human-required`, `aor:done`.

## When unsure

1. Prefer the narrower change.
2. Cite the governing ADR or policy.
3. Leave the work in `HUMAN_REQUIRED` rather than guessing.
4. Open or update a spec/ADR draft instead of inventing a parallel process.

## How to use this control plane

Step-by-step guide for humans and agents: [`guides/using-the-control-plane.md`](./guides/using-the-control-plane.md).
