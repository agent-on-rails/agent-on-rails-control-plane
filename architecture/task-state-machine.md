# Spec and task state machine

## Spec lifecycle

```
DRAFT
  │
  ▼
REVIEW
  │
  ▼
APPROVED
  │
  ▼
PLANNED
  │
  ▼
READY
  │
  ▼
IN_PROGRESS
  │
  ▼
VERIFYING
  │
  ├────────── FAIL ──────────┐
  │                           │
  ▼                           ▼
FINAL_REVIEW            RETRY / ESCALATE
  │                           │
  ▼                           ▼
DONE                    HUMAN_REQUIRED
```

`FINAL_REVIEW` is the human handoff after agent review/evidence pass: the user owns merge judgment. Agents must not auto-merge by default.

| Status | Meaning |
| --- | --- |
| `DRAFT` | Spec authored, not ready for formal review |
| `REVIEW` | Under human/agent review for clarity and feasibility |
| `APPROVED` | Contract accepted; not yet scheduled |
| `PLANNED` | Task graph created |
| `READY` | Eligible for agent execution |
| `IN_PROGRESS` | One or more tasks executing |
| `VERIFYING` | Independent review / acceptance checks running |
| `FINAL_REVIEW` | Agent loop passed; waiting on human final review / merge |
| `DONE` | Human accepted; evidence recorded; contract satisfied |
| `RETRY` | Transient failure; same or next tier will retry |
| `ESCALATE` | Model tier, specialist, or human escalation in progress |
| `HUMAN_REQUIRED` | Policy gate, max attempts, or **environment stuck** (watchdog); blocked on human |
| `BLOCKED` (task) | Task/step waiting on environment capability (npm, device, etc.); siblings may continue |

## Watchdog vs escalation

- **Coding** failures: AOR compares **failure signatures** and verdicts `normal_progress` (different bugs — continue fix↔review) vs `forever_loop` (same stuck failure — escalate then `HUMAN_REQUIRED`). See [`policies/escalation.md`](../policies/escalation.md) / AOR-006.
- **Environment** stuckness (hung build waiting for a disconnected device, hung **npm**/package install, missing local tooling) follows:

```
timeout / no heartbeat
        │
        ▼
  STOP stuck step + notify human
        │
        ├─► continue independent ready tasks (AOR-009)
        │
        └─► wave end → RUN REPORT
              blocking gaps → HUMAN_REQUIRED
```

Do **not** climb the model ladder for environment failures. See [`policies/execution-watchdog.md`](../policies/execution-watchdog.md) and AOR-009.

## Task graph example

For `AOR-006` Model Escalation:

```
TASK-001 Define escalation policy
   │
   ├──────────────┐
   ▼              ▼
TASK-002        TASK-003
Router          Retry state machine
   │              │
   └──────┬───────┘
          ▼
       TASK-004 Telemetry
          │
          ▼
       TASK-005 Integration tests
```

Dependencies are explicit so agents can work in parallel without losing the architectural contract.

## Transition rules (normative intent)

- Only humans (or designated approvers) move `REVIEW → APPROVED` when policy requires.
- Only the planner moves `APPROVED → PLANNED → READY`.
- Evidence + independent review may move `VERIFYING → FINAL_REVIEW` (not straight to `DONE`).
- Only a recorded human final-review decision moves `FINAL_REVIEW → DONE` (or back to retry).
- Implementers never set `DONE` on their own output.
- `HUMAN_REQUIRED` clears only after recorded human decision.
