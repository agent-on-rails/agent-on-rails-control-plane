# Evidence — AOR-006 Model Escalation

## Required

| Artifact | Description |
| --- | --- |
| `implementation-pr` | Engine + runtime PRs |
| `test-results` | Unit + integration |
| `execution-log` | Escalation + **loop verdict** history: distinct-bug progress ladder and same-signature forever-loop → human; plus env-stuck path that does not climb tiers |

## Example shape

```json
{
  "spec": "AOR-006",
  "implementation": {
    "repository": "agent-on-rails-engine",
    "commit": "abc123"
  },
  "tests": { "total": 84, "passed": 84, "failed": 0 },
  "review": { "result": "pass" },
  "result": { "accepted": true }
}
```

## Done when

Independent review accepts; evidence schema validates.
