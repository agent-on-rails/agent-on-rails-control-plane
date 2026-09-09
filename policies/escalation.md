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
    forever_loop_same_signature_max: 5   # safety ceiling
    forever_loop_primary_stop: model_ladder   # Option A
    treat_distinct_bugs_as: normal_progress
    require_structured_reject_feedback: true
  absolute_max_attempts: 20
  environment:
    escalate_model: false
    on_timeout_or_stuck: blocked_environment
  human_required_when:
    - architecture_change
    - security_policy_change
    - destructive_operation
    - forever_loop_at_max_tier
    - forever_loop_cap_exceeded
    - absolute_max_attempts_exceeded
    - blocking_environment_gaps_at_wave_idle
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
| `no_progress` / forever-loop (same signature) | Yes via **Option A** ladder, then human at max tier | Stop stuck identical retries |
| `environment` | **No** | Cancel / notify / `blocked_environment` / continue independent / run report; wave-idle blocking gaps → `HUMAN_REQUIRED` |
| `policy` | No | Immediate `HUMAN_REQUIRED` |
| `cost` | No | Pause + human / halt |

## Forever-loop vs normal fix↔review (AOR decides)

Agent On Rails **must decide** the loop verdict — a raw attempt count alone is insufficient.

| Situation | Verdict | Action |
| --- | --- | --- |
| Fix↔review cycles where each reject is a **different bug** (new failure signature) | `normal_progress` | Safe / expected; continue (respect cost + `absolute_max_attempts` only as runaway net) |
| Same failure signature repeats | `forever_loop` | **Option A:** escalate tier; at `max_model_tier` → `HUMAN_REQUIRED`. `forever_loop_same_signature_max` is an additional ceiling only. |
| Blind re-run with no new structured feedback | Prohibited | Do not schedule |

### Option A (authoritative)

```text
same bug @ tier 1 → tier 2
same bug @ tier 2 → tier 3
same bug @ tier 3 → HUMAN_REQUIRED
```

Do **not** keep retrying at max tier until the strike count alone reaches 5 before calling human.

**Example:** five cycles that fixed auth null → then layout overflow → then flaky fixture → … are **not** a forever-loop. Three cycles that keep failing `AUTH_NULL_TOKEN` while climbing tiers and then hitting max tier **are** forever-loop → human.

## Environment

Environment stuckness (device disconnect, hung Gradle, hung **npm**) must not burn unsupervised wall-clock; see [`execution-watchdog.md`](./execution-watchdog.md). Notify, stop that path, mark `blocked_environment`, continue independent work when safe, emit a run report. Do not climb the model ladder. `HUMAN_REQUIRED` is usually a **wave/manager** conclusion when blocking acceptance remains — not an automatic property of every individual environment cancellation.

## Rules

- Escalation must be deterministic given failure class, **loop verdict**, and attempt history.
- Every verdict / escalation is audited (`failure_signature`, `verdict`, tiers, reason, task id).
- Reviewer failures may requeue implementer with structured feedback; they do not skip evidence.
- Cost limits in `cost-controls.md` can force earlier human intervention.
- Engine owns task attempt / tier / strike / signature history; callers report events.
- Spec: [`AOR-006`](../specs/AOR-006-model-escalation/spec.md).
