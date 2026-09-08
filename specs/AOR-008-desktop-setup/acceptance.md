# Acceptance — AOR-008 Desktop Setup Wizard

- [ ] macOS and Windows builds of the setup wizard exist in `agent-on-rails-desktop` (dev-runnable at minimum; release packaging documented).
- [ ] Wizard detects missing Python 3.11+ and shows a clear next action (does not silently fail).
- [ ] Wizard can install or upgrade `aor` using the CLI repo’s preferred install path (pipx, with documented fallback).
- [ ] Wizard can run project bootstrap equivalent to `aor init <path> --name <name>` and report success or validation issues.
- [ ] After success, the user is pointed to the walkthrough / `aor` TUI—not a parallel desktop workflow.
- [ ] No production app logic is implemented inside the control-plane repo.
- [ ] Unit tests cover command detection and init argument construction; integration test covers dry-run or fixture init where feasible.
