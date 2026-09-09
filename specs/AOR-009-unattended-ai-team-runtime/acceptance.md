# Acceptance — AOR-009 Unattended AI Team Runtime

- [ ] Engine (or CLI driving engine) can run implementor → reviewer → fix → reviewer without a human manually chaining each step.
- [ ] Reviewer reject requeues implementor with structured feedback; AOR-006 loop verdict distinguishes normal multi-bug progress from forever-loop (Option A ladder).
- [ ] Forever-loop at max tier, same-signature ceiling, or absolute runaway max transitions to `HUMAN_REQUIRED` and stops scheduling new attempts for that stuck path.
- [ ] Watchdog cancels a step that exceeds configured wall-clock or command timeout (fixtures: hung command, simulated device wait, **simulated hung `npm`**).
- [ ] Command classification is specific-first: `./gradlew test` → TEST; `./gradlew build` / `assemble*` → BUILD; `./gradlew install*` / `connected*Test` / `adb` → DEVICE_DEPENDENT (regression tests required).
- [ ] Cancelled env/stuck steps are classified `environment` / `blocked_environment` and do **not** increase `model_tier`.
- [ ] On env stuck, a human-visible notification is emitted **when the stuck is detected** (not only at wave end); the step is **not** auto-promoted to wave `HUMAN_REQUIRED` solely because it was cancelled.
- [ ] After cancelling a blocked step, the manager continues **independent** ready tasks that do not require the blocked capability.
- [ ] Dependent tasks are not run as if the blocked verification passed; they remain skipped/waiting with reasons in the run report.
- [ ] When the wave is idle and blocking acceptance remains → `HUMAN_REQUIRED` with run report; when acceptance is satisfied → `FINAL_REVIEW`.
- [ ] Preflight fails closed when Node/npm is missing for a Node task, or when a device-dependent task has no connected device (no wasted model attempt on that step).
- [ ] Every implementor / fixer / reviewer assignment in the wave ends with a role report validating against `schemas/role-report.schema.json`.
- [ ] Manager refuses to treat an assignment as complete without a role report (runtime may synthesize abort/blocked reports).
- [ ] Every orchestration wave emits a **run report** with: `spec_id`, `terminal_status`, `completed`, `blocked_environment`, `skipped_due_to_deps`, `coding_failures`, `human_actions_needed`, `notifications_sent`.
- [ ] With `AOR_ENGINE_URL` configured, `aor run TASK-001` uses live task APIs (`POST/GET /v1/tasks/...`) and does not fail due to missing endpoints.
- [ ] Engine persists authoritative task/attempt/escalation history; CLI/runtime report events rather than supplying counters as source of truth.
- [ ] `FINAL_REVIEW` / stuck / `HUMAN_REQUIRED` remain visible via GitHub label and/or CLI watch and/or Android push.
- [ ] Integration tests cover: happy path → `FINAL_REVIEW`; env-stuck → notify + continue sibling + run report → `HUMAN_REQUIRED` when blocking; CLI ↔ engine status/history visibility.
