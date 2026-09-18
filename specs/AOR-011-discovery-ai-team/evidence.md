# Evidence — AOR-011 Discovery AI Team

## Required

| Artifact | Description |
| --- | --- |
| `implementation-pr` | PR(s) in `agent-on-rails-cli` (+ engine/runtime if orchestration lives there) adding `aor grill` / discovery stage machine with observe mode, back-transitions, draft writes, and resume |
| `test-results` | `pytest` (or equivalent) for stage gates, `REQUEST_*_CHANGE`, stub dialogue, persist/resume, and pack writer |
| `execution-log` | Sample transcript: brief → PRD APPROVED → architecture (optional PRD change request) → pack DRAFT → resume after interrupt |
| `review` | Independent review that observe≠author, approval≠disk-write, back-transitions, and no-app-code rules hold |

## Done when

Evidence exists; CLI (and any engine hooks) can run a stub Discovery Team end-to-end with draft autonomy + human approval gates, support change-request back-transitions and session resume, emit PRD + architecture + draft control-plane pack, and leave APPROVED / READY to the normal human path.
