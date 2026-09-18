# Acceptance — AOR-003 Task Planner

- [ ] A READY spec produces a task graph conforming to `schemas/task.schema.json`.
- [ ] Dependencies are explicit and schedulable (no hidden ordering).
- [ ] Parallelizable tasks are identifiable when dependencies allow.
- [ ] Planner refuses specs missing acceptance criteria.
- [ ] After merges / blocks, planner can re-evaluate eligibility and authorize only next eligible slice(s) (continuous Implementation Planner)
- [ ] Unit tests cover dependency ordering and eligibility re-check; integration test covers READY → PLANNED/READY tasks.
