# Execution watchdog

## Why

Unattended AI Team runs fail for reasons that are **not coding mistakes**. Dogfood examples:

- Android: agent waits ~1 hour on `gradlew` / device install because the device is disconnected.
- Web: agent cannot run `npm` / `npm test` / `npm run build` locally (hung install, registry hang, missing Node, broken lockfile wait) and sits until a human notices.

A smarter model will not plug in USB or fix the operator’s Node install. Without a watchdog, “unattended” becomes “stuck until someone looks.”

## Goals

- Bound wall-clock and per-command time for every agent attempt.
- Detect no-heartbeat / hung subprocesses early (Gradle, npm, adb, docker, etc.).
- Classify stuckness as `environment` (not `coding`) for escalation routing.
- **Notify humans promptly** when something is taking too long or was cancelled.
- **Stop the stuck path** and, when safe, **continue independent work** that does not need the blocked tool/device/test.
- Emit a **run report** at the end so humans see what completed, what was blocked, and what they must fix.

## Default bounds (starting point; tune per project)

```yaml
execution_watchdog:
  attempt_wall_clock_minutes: 30
  command_timeout_minutes:
    default: 10
    build: 15
    test: 20
    package_install: 12        # npm ci / npm install / yarn / pnpm
    device_dependent: 5        # install / adb / emulator attach
  heartbeat_seconds: 60        # no progress log / no stdout → warn
  stuck_after_heartbeats: 3    # then cancel that command / step
  notify_on:
    - heartbeat_warn
    - command_timeout
    - attempt_timeout
    - preflight_fail
    - blocked_step
  preflight:
    android_device_required: when_task_needs_device
    node_npm_available: when_task_needs_node   # node -v / npm -v / package manager present
    package_lock_resolvable: optional          # quick registry/auth probe when configured
  on_stuck:
    cancel_command: true
    failure_class: environment
    notify: [cli_watch, android_push, github_label, github_comment]
    continue_independent_work: true
    next_if_blocking_acceptance: human_required
  on_run_end:
    emit_run_report: true
```

## Preflight (before spending an attempt)

When the task or acceptance implies tool-, device-, or network-dependent steps:

1. Check required tools exist (`node`/`npm`/`pnpm`/`yarn`, JDK, Android SDK, etc.).
2. Check device/emulator connectivity if the plan will run device-dependent commands.
3. Optionally probe that package install can start (auth/registry) when the project configures it.
4. If preflight fails → **do not start** (or do not start the blocked step); mark blocked with a clear reason and notify.

Burning a model attempt to discover “npm not found” or “no device” is waste.

## Runtime behavior

1. Every spawned command inherits a timeout from the map above (or stricter task override). Apply to **npm/yarn/pnpm**, Gradle, tests, and device tools alike.
2. Runtime emits heartbeats (last log line / last file change / last command exit).
3. On timeout or stuck threshold:
   - **kill** that process tree (do not leave npm/Gradle waiting unsupervised)
   - notify human immediately (CLI watch / Android push / GitHub label+comment)
   - return structured step result with `failure_class: environment`
   - engine must **not** escalate `model_tier` (see [`escalation.md`](./escalation.md))
4. Then apply **continue independent work** (below).

## Continue independent work (normative)

When a step is cancelled as `environment`:

```
stuck step (e.g. npm test, device e2e)
        │
        ▼
   STOP that step
        │
        ├─► notify human (fix env / reconnect / npm)
        │
        └─► continue work that does NOT depend on the blocked capability
              e.g. other tasks in the graph, or remaining coding/docs/unit paths
              that acceptance still allows without that test surface
```

Rules:

- Only continue tasks/steps whose dependencies are satisfied and that do **not** require the blocked capability (device, local npm, network registry, etc.).
- Do **not** silently mark acceptance criteria satisfied by skipping required verification. Skipped/blocked checks stay `blocked_environment` in the run report.
- If remaining ready work exists → keep scheduling it.
- If nothing else can run and blocking acceptance remains → `HUMAN_REQUIRED` (or `FINAL_REVIEW` only when policy allows “gaps disclosed” — default is human gate for blocking gaps).
- Never invent a substitute “passed” test for a skipped env-blocked verification.

## Run report (required at end of orchestration wave)

Every unattended wave (AOR-009) must produce a durable **run report** (also linked from evidence / GitHub):

```yaml
run_report:
  spec_id: AOR-00N
  terminal_status: final_review | human_required | in_progress
  completed:
    - { task_id: TASK-001, result: pass }
  blocked_environment:
    - { task_id: TASK-002, step: npm_test, reason: npm_hang_timeout, notified: true }
    - { task_id: TASK-003, step: device_install, reason: device_not_connected, notified: true }
  skipped_due_to_deps:
    - { task_id: TASK-004, waiting_on: TASK-002 }
  coding_failures:
    - { task_id: TASK-005, attempts: 2, last_tier: 2 }
  human_actions_needed:
    - Fix local Node/npm or CI package install for TASK-002
    - Reconnect Android device for TASK-003
  notifications_sent:
    - { channel: github_label, at: "..." }
```

Humans should be able to read this without replaying agent traces.

## What this is not

- Not a substitute for model escalation (AOR-006) on real coding failures.
- Not permission to skip evidence or auto-merge.
- Not an unbounded “keep retrying until npm works / device appears” loop unless a project explicitly configures a short, capped env-retry with backoff **and** notification each try.
- Not a license to continue *dependent* work that assumes the blocked test already passed.

## Related

- Spec orchestration: [`AOR-009`](../specs/AOR-009-unattended-ai-team-runtime/spec.md)
- Spec escalation: [`AOR-006`](../specs/AOR-006-model-escalation/spec.md)
- Spec execution: [`AOR-004`](../specs/AOR-004-agent-execution/spec.md)
- Spec planner: [`AOR-003`](../specs/AOR-003-task-planner/spec.md)
