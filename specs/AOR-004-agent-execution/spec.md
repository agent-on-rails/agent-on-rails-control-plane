---
id: AOR-004
title: Agent Execution
status: draft
intent: >
  Execute coding agents against a deterministic context package and produce
  branch, implementation, tests, commit, and PR artifacts.
implementation:
  repositories:
    - agent-on-rails-engine
    - agent-on-rails-agent-runtime
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
---

# AOR-004 — Agent Execution

## Summary

An execution is deterministic in *inputs*: the runtime assembles SPEC + ACCEPTANCE + ADRs + AGENTS.md + dependent specs + code context + CURRENT TASK, then runs the selected agent tier in a sandbox.

## Behavior

1. Context builder assembles the package.
2. Model router selects tier per policy.
3. Runtime runs **preflight** when the task needs device/network/tooling (Node/npm, Android device, etc. — see [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md)).
4. Runtime executes with least-privilege permissions **and** watchdog bounds (wall-clock, per-command timeout including **npm/yarn/pnpm**, heartbeat).
5. Agent follows branch → implement → test → commit → PR.
6. Structured `ExecutionResult` returns to the engine, including `failure_class` when failed (`coding` | `environment` | `policy` | …) and per-step outcomes (`pass` | `fail` | `blocked_environment` | `skipped`).
7. Vague prompts (“Implement feature X”) are prohibited as sole input.
8. Hung commands (Gradle waiting for a disconnected device, **hung `npm install` / `npm test`**) must be killed and reported as `environment`, with human notification — not left running unsupervised.
9. When a verification step is blocked by environment, the runtime/engine may continue **independent** remaining steps that do not require that capability; it must not invent a green test result for the blocked step.

## Out of scope

- Provider SDK extraction to `agent-on-rails-sdk`
- Non-code tasks (design-only) beyond stubbing
- Full unattended multi-hop orchestration (see AOR-009)
