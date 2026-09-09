# Acceptance — AOR-004 Agent Execution

- [ ] Context package always includes spec, acceptance, and current task identifiers.
- [ ] Runtime enforces permission boundaries from the engine.
- [ ] Successful runs produce a PR link and commit SHA.
- [ ] Failures return structured status suitable for retry/escalation, including `failure_class` and per-step outcomes.
- [ ] Watchdog cancels commands that exceed configured timeouts (incl. package-install / npm fixtures); result is `environment` (not a silent hang).
- [ ] Device-dependent and Node/npm preflight fail closed when required tooling/device is missing.
- [ ] Blocked env steps do not emit fake passing test evidence.
- [ ] Integration test runs a fixture task end-to-end in a sandbox (provider may be mocked).
