# Acceptance — AOR-005 Review Loop

- [ ] Implementer sessions cannot transition a task to `DONE`.
- [ ] Reviewer input includes spec, acceptance, diff, tests, and evidence candidates.
- [ ] Reject produces actionable feedback and a new implementer attempt under AOR-006 bounds (no unbounded loop).
- [ ] After `max_attempts` / ladder exhaustion, status is `HUMAN_REQUIRED` rather than another silent retry.
- [ ] Accept records a review evidence object (`result: pass`).
- [ ] Integration test covers accept and reject paths, including stop-at-human after repeated rejects.
