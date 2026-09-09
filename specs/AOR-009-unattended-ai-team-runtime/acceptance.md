# Acceptance — AOR-009 Unattended AI Team Runtime

- [ ] Engine (or CLI driving engine) can run implementor → reviewer → fix → reviewer without a human manually chaining each step.
- [ ] Reviewer reject requeues implementor with structured feedback; AOR-006 loop verdict distinguishes normal multi-bug progress from forever-loop.
- [ ] Forever-loop cap (same signature) or absolute runaway max transitions to `HUMAN_REQUIRED` and stops scheduling new attempts for that stuck path.
- [ ] Watchdog cancels a step that exceeds configured wall-clock or command timeout (fixtures: hung command, simulated device wait, **simulated hung `npm`**).
- [ ] Cancelled env/stuck steps are classified `environment` and do **not** increase `model_tier`.
- [ ] On env stuck, a human-visible notification is emitted **when the stuck is detected** (not only at wave end).
- [ ] After cancelling a blocked step, the manager continues **independent** ready tasks that do not require the blocked capability.
- [ ] Dependent tasks are not run as if the blocked verification passed; they remain skipped/waiting with reasons in the run report.
- [ ] Preflight fails closed when Node/npm is missing for a Node task, or when a device-dependent task has no connected device (no wasted model attempt on that step).
- [ ] Every orchestration wave emits a **run report** (completed / blocked_environment / skipped_due_to_deps / human_actions_needed / notifications_sent).
- [ ] Blocking env gaps leave the wave in `HUMAN_REQUIRED` (or equivalent) with the run report attached — agents do not mark `DONE`.
- [ ] `FINAL_REVIEW` / stuck / `HUMAN_REQUIRED` remain visible via GitHub label and/or CLI watch and/or Android push.
- [ ] Integration tests cover: happy path → `FINAL_REVIEW`; env-stuck → notify + continue sibling + run report → `HUMAN_REQUIRED`.
