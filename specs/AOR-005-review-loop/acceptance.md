# Acceptance — AOR-005 Review Loop

- [ ] Implementer sessions cannot transition a task to `DONE`.
- [ ] Reviewer input includes spec, acceptance, diff, tests, and evidence candidates.
- [ ] Every reviewer assignment ends with a role report validating against `schemas/role-report.schema.json`.
- [ ] Reject produces **structured** findings with `signature` suitable for AOR-006 loop detection.
- [ ] Distinct-bug rejects continue as normal fix↔review; identical-signature rejects apply forever-loop policy — not unbounded silent retries.
- [ ] After forever-loop cap (same signature) or absolute runaway max, status is `HUMAN_REQUIRED` rather than another silent retry.
- [ ] Accept records a review evidence object (`result: pass`) aligned with the role report.
- [ ] Integration test covers accept, distinct-bug multi-cycle progress, and same-signature forever-loop stop.
