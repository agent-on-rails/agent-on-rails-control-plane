---
id: AOR-002
title: GitHub Ingestion
status: draft
intent: >
  Ingest GitHub events and repository artifacts so the engine can sync spec/task
  state using Issues, labels, PRs, Checks, and webhooks.
implementation:
  repositories:
    - agent-on-rails-github
    - agent-on-rails-engine
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
---

# AOR-002 — GitHub Ingestion

## Summary

GitHub is the MVP execution UI. This spec covers the GitHub App, webhook authenticity, and bidirectional sync of Agent On Rails state.

## Behavior

1. Install GitHub App on target org/repos.
2. Verify webhook signatures; reject unauthenticated events.
3. Map Issues/PRs/Checks/comments into engine domain events.
4. Apply canonical labels: `aor:spec`, `aor:ready`, `aor:running`, `aor:review`, `aor:failed`, `aor:escalated`, `aor:human-required`, `aor:done`.
5. Update Issue bodies with status, spec path, repos, agent tier, and attempt counters.

## Out of scope

- Full Projects v2 UI customization beyond basic sync
- Non-GitHub SCM providers
