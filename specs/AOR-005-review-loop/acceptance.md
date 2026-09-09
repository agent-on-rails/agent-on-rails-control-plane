# Acceptance — AOR-005 Review Loop

- [ ] Implementer sessions cannot transition a task to `DONE`.
- [ ] Reviewer input includes spec, acceptance, diff, tests, and evidence candidates.
- [ ] Reject produces **structured** actionable feedback suitable for a failure signature (AOR-006).
- [ ] Distinct-bug rejects continue as normal fix↔review; identical-signature rejects apply forever-loop policy — not unbounded silent retries.
- [ ] After forever-loop cap (same signature) or absolute runaway max, status is `HUMAN_REQUIRED` rather than another silent retry.
- [ ] Accept records a review evidence object (`result: pass`).
- [ ] Integration test covers accept, distinct-bug multi-cycle progress, and same-signature forever-loop stop.
