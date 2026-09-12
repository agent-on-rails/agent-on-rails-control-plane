# Acceptance — AOR-010 Natural language spec gathering

- [ ] `aor gather` accepts natural-language requirements from arg, `--file`, or stdin
- [ ] Outline is shown and **human confirm** is required before writing the full tree
- [ ] Operator can edit outline JSON and `aor gather apply` without re-calling the model
- [ ] Written tree matches SurveyDesk shape: `product/`, `requirements/`, `domain/`, `api/`, `adr/`, `acceptance/`, `regeneration/`
- [ ] LLM client is OpenAI-compatible and configured via env / config (ADR-003); DIV AI may be the default base URL
- [ ] Stub/offline extract works without network for unit tests
- [ ] No production application code is written into the control-plane repository
- [ ] Unit tests cover outline parse, confirm gate, and writer layout
