# Acceptance — AOR-008 Desktop Setup Wizard

- [ ] macOS and Windows builds of the setup wizard exist in `agent-on-rails-desktop` (dev-runnable at minimum; release packaging documented).
- [ ] Wizard detects missing Python 3.11+ and shows a clear next action (does not silently fail).
- [ ] Wizard can install or upgrade `aor` using the CLI repo’s preferred install path (pipx, with documented fallback).
- [ ] Wizard can run project bootstrap equivalent to `aor init <path> --name <name>` when the operator continues from New project to Gather, and report success or validation issues without a separate Init button.
- [ ] Gather specs step invokes `aor gather` (outline-only, then apply on confirm). The footer forward action is Confirm & write drafts; Skip gather is not offered.
- [ ] Gather shows the outline and requires human confirm before writing SurveyDesk-shaped `specs/` (product, requirements, domain, api, adr, acceptance, regeneration). Confirm stays disabled until extract succeeds. SurveyDesk-like NL produces the SurveyDesk reference pack (same files as the exemplar `specs/`), not sentence-fragment requirement files.
- [ ] Wizard does not store LLM API keys in the app bundle, preferences, or source.
- [ ] After success, the user is pointed to the walkthrough / `aor` TUI—not a parallel desktop workflow.
- [ ] macOS release DMG is a drag-and-drop disk image (app + Applications alias), signed and notarized.
- [ ] Packaged macOS app exposes Sparkle **Check for Updates…** (app menu and in-window) against `appcast.xml`; background checks remain enabled.
- [ ] No production app logic is implemented inside the control-plane repo.
- [ ] Unit tests cover command detection, init argument construction, and gather outline-only / apply args; integration test covers dry-run or fixture init where feasible.
