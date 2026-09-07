# Escalation

## Model routing policy (default)

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

## Ladder

1. Tier 1 — fast / inexpensive
2. Tier 2 — stronger reasoning
3. Tier 3 — frontier
4. Human required

## Rules

- Escalation must be deterministic given failure class and attempt count.
- Every escalation is audited (from tier, to tier, reason, task id).
- Reviewer failures may requeue implementer with feedback; they do not skip evidence.
- Cost limits in `cost-controls.md` can force earlier human intervention.
