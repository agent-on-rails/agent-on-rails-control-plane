---
id: AOR-006
title: Model Escalation
status: draft
intent: >
  Automatically escalate difficult *coding* work to a more capable model with
  bounded retries, deterministic routing, cost limits, and auditable history.
  Agent On Rails — not a blunt attempt counter — decides whether fix↔review is
  normal progress (different bugs) or a forever-loop (same stuck failure).
  Environment / infra stuckness is not solved by a smarter model.
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

Start cheap. Escalate on **coding** failure within policy. **Detect forever-loops intelligently.** Escalate to a human when the same failure is stuck — not merely because fix↔review ran several times on *different* bugs.

```
default implementor / tier N
        │
        ▼
      attempt
        │
     reviewer
      /     \
   PASS     FAIL (coding)
             │
             ▼
      AOR loop verdict
      /              \
 normal_progress   forever_loop
 (new / different   (same failure
  bug each cycle)    signature again)
      │                    │
 same-tier retry      escalate tier /
 or escalate on         then HUMAN
 difficulty             if still stuck
```

Environment / watchdog failures take a **different path** (see Failure classes): they do **not** climb the model ladder.

## Problem this solves

Without intelligent loop detection, two bad outcomes appear:

1. **False forever-loop** — five fix↔review cycles that each fixed a *different* bug get killed as “max attempts,” even though that is normal delivery.
2. **True forever-loop** — the same model keeps “fixing” the *same* rejection 10–15 times while operators are offline.

Agent On Rails (manager / policy engine) **owns the verdict**: `normal_progress` vs `forever_loop`.

## Failure classes (normative)

Every failed attempt must be classified before the manager chooses the next action:

| Class | Examples | Next action |
| --- | --- | --- |
| `coding` | Reviewer reject on a **new / distinct** bug vs prior attempt | Treat as **normal fix↔review**; retry / escalate by difficulty — do **not** label forever-loop |
| `no_progress` / forever-loop | **Same** failure signature (or equivalent reject) repeats | Count toward forever-loop budget → escalate tier → then `HUMAN_REQUIRED` |
| `environment` | Device not connected, hung `gradlew`, hung **`npm`**, missing Node, timeout with no code change | **Do not escalate model.** Cancel → notify → continue independent work → run report (AOR-009 / watchdog) |
| `policy` | Architecture / security / destructive flag | Immediate `HUMAN_REQUIRED` |
| `cost` | Budget exhausted | Pause scheduling; `HUMAN_REQUIRED` or project-level halt |

Misclassifying environment as coding is a defect. Misclassifying **distinct-bug progress** as forever-loop is also a defect.

## Loop detection (normative) — AOR decides

### Failure signature

Each reviewer reject / test failure must produce a durable **failure signature** suitable for comparison, for example:

- stable ids of failing acceptance checks / tests
- normalized reviewer finding codes (e.g. `AUTH_NULL_TOKEN`, `UI_OVERFLOW`)
- hash of structured feedback body (not free-form chatter alone)

Exact hashing is an engine implementation detail; the contract is: **same stuck problem ↔ same signature; different bugs ↔ different signatures.**

### Verdict

| Verdict | When | Meaning |
| --- | --- | --- |
| `normal_progress` | New distinct signature vs recent attempts (different bug), or prior signature cleared and a new one appears | Healthy fix↔review; **safe** even across many cycles |
| `forever_loop` | Same signature repeats without clearing, or no meaningful code/test delta + same reject | Stuck; apply forever-loop ladder |
| `environment` | Watchdog / preflight | Not a coding loop |

```
attempt N reject
      │
      ▼
 compare failure_signature to history
      │
      ├─ distinct bug / prior bug fixed ──► normal_progress
      │         continue fix↔review
      │         (tier escalate only for difficulty / policy)
      │
      └─ same signature again ──► forever_loop
                count forever_loop_strikes
                escalate model → HUMAN_REQUIRED at cap
```

### Defaults

```yaml
execution_policy:
  default:
    model_tier: 1
  same_tier_retries: 2          # per tier, for difficulty — not the forever-loop detector
  escalate_after:
    retries: 2
  max_model_tier: 3
  loop_detection:
    # Forever-loop = SAME cause repeating — not “N different bugs”
    forever_loop_same_signature_max: 5
    treat_distinct_bugs_as: normal_progress
    require_structured_reject_feedback: true
  # Absolute runaway / cost safety net — NOT the forever-loop definition
  absolute_max_attempts: 20
  cost_controls: see policies/cost-controls.md
  environment:
    escalate_model: false
    on_timeout_or_stuck: human_required
  human_required_when:
    - architecture_change
    - security_policy_change
    - destructive_operation
    - forever_loop_cap_exceeded      # same signature hit forever_loop_same_signature_max
    - absolute_max_attempts_exceeded # runaway safety net
    - environment_stuck
    - cost_budget_exhausted
```

**Herry’s rule (dogfood):** looping “5 times” with a **different bug each time** is **normal and safe**. Looping because the **same** bug will not die is forever-loop — AOR must distinguish them.

## Ladder

1. Tier 1 — fast / inexpensive  
2. Tier 2 — stronger reasoning  
3. Tier 3 — frontier  
4. Human required  

Used for **difficulty** and for **forever_loop** strikes — not to punish healthy multi-bug fix↔review.

## Rules

- Escalation must be deterministic given failure class, **loop verdict**, attempt history, and current tier.
- Reviewer rejects must be structured enough to build a failure signature (AOR-005).
- Blind re-runs without new reviewer feedback are prohibited.
- Every loop verdict and escalation is audited: `failure_signature`, `verdict`, `from_tier`, `to_tier`, `reason`, `task_id`, `attempt`.
- Hitting `forever_loop_same_signature_max` on the **same** signature → `HUMAN_REQUIRED`.
- Hitting `absolute_max_attempts` is a separate runaway stop (cost/safety), audited as such — not labeled “forever-loop” if signatures were distinct.
- Cost limits in `cost-controls.md` can force earlier human intervention.
- Watchdog events: [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md) / AOR-009; never model-escalate for `environment`.

## Acceptance intent

- AOR decides `normal_progress` vs `forever_loop`
- Distinct bugs across cycles are not treated as forever-loop
- Same failure signature repeating hits forever-loop cap then human
- environment failures never climb the model ladder
- cost / absolute caps remain as safety nets
- history is auditable

## Depends on

- AOR-004 / AOR-005 for attempt + structured reject signals
- [`policies/escalation.md`](../../policies/escalation.md), [`policies/cost-controls.md`](../../policies/cost-controls.md), [`policies/execution-watchdog.md`](../../policies/execution-watchdog.md)

## Out of scope

- Dynamic pricing markets across providers
- Automatic architecture changes without human gate
- Perfect NLP of unstructured reviewer prose (prefer structured findings)
- Full unattended orchestration (AOR-009) beyond the escalation / loop decision function
