# Evidence — AOR-010 Natural language spec gathering

## Required

| Artifact | Description |
| --- | --- |
| `implementation-pr` | PR in `agent-on-rails-cli` adding `aor gather` |
| `test-results` | `pytest` for gather + LLM stub |
| `execution-log` | Sample `aor gather` / `aor gather apply` transcript |

## Done when

Evidence exists, CLI ships `aor gather` with confirm-before-write, SurveyDesk-shaped output, and provider-neutral OpenAI-compatible LLM config.
