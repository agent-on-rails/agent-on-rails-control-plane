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
3. Runtime executes with least-privilege permissions.
4. Agent follows branch → implement → test → commit → PR.
5. Structured `ExecutionResult` returns to the engine.
6. Vague prompts (“Implement feature X”) are prohibited as sole input.

## Out of scope

- Provider SDK extraction to `agent-on-rails-sdk`
- Non-code tasks (design-only) beyond stubbing
