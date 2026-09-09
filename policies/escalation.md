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
  max_attempts: 5
  no_progress:
    treat_as: escalate_or_human
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

## Failure classes

| Class | Escalate model? | Typical outcome |
| --- | --- | --- |
| `coding` | Yes, after same-tier retries | Higher tier or human |
| `no_progress` | Yes (or human if at cap) | Do not infinite-loop same tier blindly |
| `environment` | **No** | Cancel step / notify / continue independent work / run report → `HUMAN_REQUIRED` if blocking (see `execution-watchdog.md`) |
| `policy` | No | Immediate `HUMAN_REQUIRED` |
| `cost` | No | Pause + human / halt |

## Forever-loop prohibition

- `max_attempts` is a hard stop across all tiers.
- Same-tier retries are capped by `same_tier_retries`.
- Blind re-runs without new reviewer feedback are prohibited.
- Environment stuckness (e.g. Gradle waiting for a device that never connects, **npm hanging locally**) must not burn wall-clock for an hour unsupervised; see [`execution-watchdog.md`](./execution-watchdog.md). Notify, stop that path, continue independent work when safe, and emit a run report.

## Rules

- Escalation must be deterministic given failure class and attempt count.
- Every escalation is audited (from tier, to tier, reason, failure class, task id).
- Reviewer failures may requeue implementer with feedback; they do not skip evidence.
- Cost limits in `cost-controls.md` can force earlier human intervention.
- Spec: [`AOR-006`](../specs/AOR-006-model-escalation/spec.md).
