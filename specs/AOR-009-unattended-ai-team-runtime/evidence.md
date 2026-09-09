# Evidence — AOR-009 Unattended AI Team Runtime

## Required

| Artifact | Description |
| --- | --- |
| `implementation-pr` | Engine + runtime (+ CLI orchestration) PRs |
| `test-results` | Unit + integration |
| `execution-log` | Orchestration trace: roles, attempts, failure classes, watchdog events, continue-independent decisions |
| `review` | Independent review of the orchestration implementation |
| Run report sample | Fixture wave that blocks on hung npm (or device) and continues a sibling task |

## Example shape

```json
{
  "spec": "AOR-009",
  "implementation": {
    "repository": "agent-on-rails-engine",
    "commit": "abc123"
  },
  "tests": { "total": 40, "passed": 40, "failed": 0 },
  "execution": {
    "log_uri": "evidence/AOR-009/execution.json",
    "attempts": 3
  },
  "run_report": {
    "terminal_status": "human_required",
    "completed": [{ "task_id": "TASK-001", "result": "pass" }],
    "blocked_environment": [
      {
        "task_id": "TASK-002",
        "step": "npm_test",
        "reason": "npm_hang_timeout",
        "notified": true
      }
    ],
    "human_actions_needed": [
      "Fix local npm / use CI package install for TASK-002"
    ]
  },
  "review": { "result": "pass" },
  "result": { "accepted": true }
}
```

## Done when

Independent review accepts; evidence schema validates; watchdog + continue-independent + run-report fixtures green.
