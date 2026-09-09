---
id: AOR-006
title: Model Escalation
status: draft
intent: >
  Automatically escalate difficult *coding* work to a more capable model with
  bounded same-tier retries, deterministic routing, cost limits, auditable
  history, and hard stop to HUMAN_REQUIRED — never forever-loop on the same
  model. Environment / infra stuckness is not solved by a smarter model.
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

Start cheap. Escalate on **coding** failure within policy. Cap attempts. Escalate to a human when bounds are exceeded. Never let the same model thrash for 10–15 identical cycles.

```
default implementor / tier N
        │
        ▼
      attempt
        │
     reviewer
      /     \
   PASS     FAIL (coding / no_progress)
             │
        same-tier retry
        (bounded, with feedback)
             │
          FAIL again
             │
         ESCALATE tier
             │
      higher model / effort
             │
          …repeat until
             │
        max_attempts or max_tier
             │
             ▼
       HUMAN_REQUIRED
```

Environment / watchdog failures take a **different path** (see Failure classes): they do **not** climb the model ladder.

## Problem this solves

Without a deterministic ladder and hard stop, the fix/review loop (AOR-005) becomes an infinite loop: the same implementor model keeps “fixing” the same rejection while operators are offline.

## Failure classes (normative)

Every failed attempt must be classified before the manager chooses the next action:

| Class | Examples | Next action |
| --- | --- | --- |
| `coding` | Reviewer reject, failing tests, wrong implementation | Same-tier retry → then escalate model tier |
| `no_progress` | Same failure signature / same feedback hash as prior attempt | Count toward escalate / max attempts; do not pretend progress |
| `environment` | Device not connected, hung `gradlew`, hung **`npm` / package install**, network, missing SDK/Node, sandbox OOM, wall-clock timeout with no code change | **Do not escalate model.** Cancel step → notify → continue independent work when safe → run report; `HUMAN_REQUIRED` if blocking (AOR-009 / watchdog) |
| `policy` | Architecture / security / destructive flag | Immediate `HUMAN_REQUIRED` |
| `cost` | Budget exhausted | Pause scheduling; `HUMAN_REQUIRED` or project-level halt |

Misclassifying environment as coding is a defect: a frontier model cannot plug in a USB device.

## Default policy

```yaml
execution_policy:
  default:
    model_tier: 1
  same_tier_retries: 2          # retries at current tier before escalate
  escalate_after:
    retries: 2                  # synonym for same_tier_retries
  max_model_tier: 3
  max_attempts: 5               # hard stop across all tiers
  no_progress:
    treat_as: escalate_or_human # identical failure signatures do not reset the ladder
  environment:
    escalate_model: false
    on_timeout_or_stuck: human_required
  human_required_when:
    - architecture_change
    - security_policy_change
    - destructive_operation
    - max_attempts_exceeded
    - environment_stuck
    - cost_budget_exhausted
```

## Ladder

1. Tier 1 — fast / inexpensive  
2. Tier 2 — stronger reasoning  
3. Tier 3 — frontier  
4. Human required  

## Rules

- Escalation must be deterministic given failure class, attempt count, and current tier.
- Same-tier retries must include structured reviewer feedback (AOR-005); blind re-runs without feedback are prohibited.
- Every escalation is audited: `from_tier`, `to_tier`, `reason`, `failure_class`, `task_id`, `attempt`.
- Exceeding `max_attempts` **always** yields `HUMAN_REQUIRED` — never another silent retry.
- Cost limits in `cost-controls.md` can force earlier human intervention.
- Watchdog / timeout events are owned by [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md) and AOR-009; this spec only forbids model escalation for that class.

## Acceptance intent

- retries are bounded
- model escalation is deterministic for `coding` / `no_progress`
- environment failures never climb the model ladder
- cost limits are respected
- escalation history is auditable
- forever-loops are impossible under default policy

## Depends on

- AOR-004 / AOR-005 for attempt + reject signals
- [`policies/escalation.md`](../../policies/escalation.md), [`policies/cost-controls.md`](../../policies/cost-controls.md), [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md)

## Out of scope

- Dynamic pricing markets across providers
- Automatic architecture changes without human gate
- Full unattended orchestration (AOR-009) beyond the escalation decision function
