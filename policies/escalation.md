# Escalation

## Model routing policy (default)

```yaml
execution_policy:
  default:
    model_tier: 1
  same_tier_retries: 2
  escalate_after:
    retries: 2
  max_model_tier: 3
  loop_detection:
    forever_loop_same_signature_max: 5
    treat_distinct_bugs_as: normal_progress
    require_structured_reject_feedback: true
  absolute_max_attempts: 20
  environment:
    escalate_model: false
    on_timeout_or_stuck: human_required
  human_required_when:
    - architecture_change
    - security_policy_change
    - destructive_operation
    - forever_loop_cap_exceeded
    - absolute_max_attempts_exceeded
    - environment_stuck
    - cost_budget_exhausted
```

## Ladder

1. Tier 1 — fast / inexpensive
2. Tier 2 — stronger reasoning
3. Tier 3 — frontier
4. Human required

## Failure classes

| Class | Escalate model? | Typical outcome |
| --- | --- | --- |
| `coding` (distinct bug / `normal_progress`) | Optional (difficulty) | Continue fix↔review — **not** forever-loop |
| `no_progress` / forever-loop (same signature) | Yes, then human at cap | Stop stuck identical retries |
| `environment` | **No** | Cancel / notify / continue independent / run report |
| `policy` | No | Immediate `HUMAN_REQUIRED` |
| `cost` | No | Pause + human / halt |

## Forever-loop vs normal fix↔review (AOR decides)

Agent On Rails **must decide** the loop verdict — a raw attempt count alone is insufficient.

| Situation | Verdict | Action |
| --- | --- | --- |
| Fix↔review cycles where each reject is a **different bug** (new failure signature) | `normal_progress` | Safe / expected; continue (respect cost + `absolute_max_attempts` only as runaway net) |
| Same failure signature repeats (same bug won’t die), up to `forever_loop_same_signature_max` (default **5**) | `forever_loop` | Escalate tier; at cap → `HUMAN_REQUIRED` |
| Blind re-run with no new structured feedback | Prohibited | Do not schedule |

**Example:** five cycles that fixed auth null → then layout overflow → then flaky fixture → … are **not** a forever-loop. Five cycles that keep failing `AUTH_NULL_TOKEN` with no clear are.

## Environment

Environment stuckness (device disconnect, hung Gradle, hung **npm**) must not burn unsupervised wall-clock; see [`execution-watchdog.md`](./execution-watchdog.md). Notify, stop that path, continue independent work when safe, emit a run report. Do not climb the model ladder.

## Rules

- Escalation must be deterministic given failure class, **loop verdict**, and attempt history.
- Every verdict / escalation is audited (`failure_signature`, `verdict`, tiers, reason, task id).
- Reviewer failures may requeue implementer with structured feedback; they do not skip evidence.
- Cost limits in `cost-controls.md` can force earlier human intervention.
- Spec: [`AOR-006`](../specs/AOR-006-model-escalation/spec.md).
