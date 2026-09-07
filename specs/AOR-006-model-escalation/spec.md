---
id: AOR-006
title: Model Escalation
status: draft
intent: >
  Automatically escalate difficult work to a more capable model with bounded
  retries, deterministic routing, cost limits, and auditable history.
implementation:
  repositories:
    - agent-on-rails-engine
    - agent-on-rails-agent-runtime
verification:
  tests:
    - unit
    - integration
evidence_required:
  - test-results
  - implementation-pr
  - execution-log
---

# AOR-006 — Model Escalation

## Summary

Start cheap. Escalate on failure within policy. Never blindly spend frontier models on every task.

```
Task → Tier 1 → pass | fail → Tier 2 → pass | fail → Tier 3 → pass | fail → HUMAN REQUIRED
```

## Acceptance intent

- retries are bounded
- model escalation is deterministic
- cost limits are respected
- escalation history is auditable

## Default policy

```yaml
execution_policy:
  default:
    model_tier: 1
  escalate_after:
    retries: 2
  max_model_tier: 3
  max_attempts: 5
  human_required_when:
    - architecture_change
    - security_policy_change
    - destructive_operation
    - max_attempts_exceeded
```

## Out of scope

- Dynamic pricing markets across providers
- Automatic architecture changes without human gate
