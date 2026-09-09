# Role reports (standardized)

## Why

Every time Agent On Rails assigns **implementor**, **fixer**, or **reviewer**, the assignment must **end** with the same machine- and human-readable report. Free-form chat dumps are not a substitute.

Standard reports let the manager:

- decide `normal_progress` vs `forever_loop` (failure signatures)
- continue independent work after env blocks
- show operators a consistent summary in CLI / GitHub / Android
- attach durable evidence without replaying private agent traces

## Normative rule

> **No role assignment completes without a valid role report** conforming to [`schemas/role-report.schema.json`](../schemas/role-report.schema.json).

If the agent session crashes or is watchdog-killed, the **runtime** still emits a role report (`outcome: aborted` or `blocked_environment`) — AOR invents the envelope; the agent must not leave a silent void.

## Common envelope (all roles)

```yaml
schema_version: "1"
role: implementor | fixer | reviewer
assignment_id: asg_01J...          # engine-issued
task_id: TASK-001
spec_id: AOR-004
model_tier: 1
started_at: "2026-09-09T01:00:00Z"
ended_at: "2026-09-09T01:18:00Z"
outcome: success | failed | blocked_environment | accepted | rejected | aborted
failure_class: coding | no_progress | environment | policy | cost | null
failure_signatures: []             # stable ids for loop detection
summary: "One short paragraph humans can scan."
artifacts:
  repository: my-app
  branch: aor/TASK-001
  commit: abcdef1
  pr: https://github.com/org/repo/pull/12
steps:
  - { name: implement, result: pass }
  - { name: unit_test, result: pass }
  - { name: npm_test, result: blocked_environment, detail: "npm hang timeout" }
human_actions_needed: []
next_recommended: review | fix | escalate | human_required | final_review | continue_independent | none
```

## Role-specific expectations

### Implementor

- `outcome`: usually `success` (PR opened) or `failed` / `blocked_environment` / `aborted`
- Must list verification `steps` actually attempted
- `next_recommended`: typically `review` on success
- Must **not** claim acceptance pass or set `DONE`

### Fixer

- Same envelope as implementor; `role: fixer`
- Should reference prior `failure_signatures` being addressed
- `next_recommended`: typically `review`

### Reviewer

- `outcome`: `accepted` or `rejected` (not vague prose alone)
- On **reject**: `findings[]` required, each with `code`, `severity`, `summary`, **`signature`** (feeds AOR-006)
- On **accept**: `findings` empty or informational only; `next_recommended: final_review` (or evidence finalize)
- Must not mark spec/task `DONE`

```yaml
# reviewer reject excerpt
outcome: rejected
failure_class: coding
failure_signatures: ["AUTH_NULL_TOKEN"]
findings:
  - code: AUTH_NULL_TOKEN
    severity: high
    summary: "Login returns 500 when token is null"
    signature: "AUTH_NULL_TOKEN"
    acceptance_ref: "AC-2"
next_recommended: fix
```

## Where reports go

1. Returned to the engine as the assignment result (primary).
2. Linked/stored under the task’s execution log / evidence path.
3. Optionally summarized in a GitHub Issue/PR comment (human-readable projection of the same fields — not a different truth).
4. Aggregated into the wave-level **run report** (AOR-009 / watchdog).

## Prohibited

- Ending an assignment with only unstructured natural language
- Different ad-hoc JSON shapes per provider/agent
- Treating private chain-of-thought as the report
- Recording skipped env checks as `steps[].result: pass`

## Related

- Schema: [`role-report.schema.json`](../schemas/role-report.schema.json)
- Execution: [`AOR-004`](../specs/AOR-004-agent-execution/spec.md)
- Review: [`AOR-005`](../specs/AOR-005-review-loop/spec.md)
- Loop detection: [`AOR-006`](../specs/AOR-006-model-escalation/spec.md)
- Orchestration: [`AOR-009`](../specs/AOR-009-unattended-ai-team-runtime/spec.md)
