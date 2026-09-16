# Evidence — AOR-011 Discovery AI Team

## Required

| Artifact | Description |
| --- | --- |
| `implementation-pr` | PR(s) in `agent-on-rails-cli` (+ engine/runtime if orchestration lives there) adding `aor grill` / discovery stage machine |
| `test-results` | `pytest` (or equivalent) for stage gates, stub dialogue, and pack writer |
| `execution-log` | Sample transcript: brief → PRD gate → architecture gate → confirm write |
| `review` | Independent review that stage order, human gates, and no-app-code rule hold |

## Done when

Evidence exists, CLI (and any engine hooks) can run a stub Discovery Team end-to-end with human gates, emit PRD + architecture + draft control-plane pack, and leave approval to the normal human path.
