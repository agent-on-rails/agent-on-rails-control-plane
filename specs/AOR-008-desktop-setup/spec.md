---
id: AOR-008
title: Desktop Setup Wizard
status: draft
intent: >
  Give macOS and Windows operators a native setup wizard that installs the `aor`
  CLI, bootstraps a control-plane project, and optionally drafts SurveyDesk-shaped
  specs via `aor gather`, without requiring shell fluency, then hands off to the
  existing terminal/TUI workflow.
implementation:
  repositories:
    - agent-on-rails-desktop
    - agent-on-rails-cli
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
---

# AOR-008 — Desktop Setup Wizard

## Summary

A small macOS/Windows app walks a human through first-time Agent On Rails setup:
prerequisites → install CLI → create project contract → optional SurveyDesk-shaped
gather → open next steps. Day-to-day work stays in `aor` TUI/CLI (ADR-007, ADR-008).

## Behavior

1. App launches a short wizard (Welcome → Prerequisites → Install CLI → New project → Gather specs → Done). The Install CLI step is omitted unless `aor` is missing or a newer published CLI version is available; the wizard MUST compare versions before showing that step.
2. Prerequisites step reports Python 3.11+ availability and whether `aor` / `pipx` are on PATH. Upgrade is offered only when a newer CLI version is available.
3. Install CLI step runs the same install strategy as `agent-on-rails-cli` `scripts/install.sh` (pipx preferred; pip --user fallback) and shows stdout/stderr. Copy is “Installs” or “Upgrades” `aor` from `agent-on-rails-cli` according to whether `aor` is already installed.
4. New project step: choose directory, product name, optional force. **Continue to gather** invokes `aor init` (or equivalent library call), surfaces validation results on failure, and advances only after init succeeds.
5. Gather specs step (AOR-010): operator pastes natural-language requirements; wizard shells out to `aor gather` (same CLI as the terminal; prefer a sibling `agent-on-rails-cli` source tree when present so local gather matches current CLI). It **shows the outline and requires confirm** before writing. The footer forward action is **Confirm & write drafts** (disabled until extract succeeds). The wizard MUST NOT offer Skip gather. Default extract is `--stub` (offline); AI extract uses the operator’s existing `AOR_LLM_*` env or `~/.config/agent-on-rails/llm.yaml` — the app MUST NOT persist API keys. Written tree is SurveyDesk-shaped (`specs/product|requirements|domain|api|adr|acceptance|regeneration/`). When the pasted NL is SurveyDesk, Confirm MUST write the same reference `specs/` pack as `aor gather` (SD-001…SD-012, FormSpec domain, full OpenAPI, ADR-001…009, P1–P6) — not sentence-split stubs. `--force` is offered (default on) so a previous stub pack can be replaced.
6. Done step links to walkthrough / docs and offers to open the project folder or copy `aor` launch hint.
7. Wizard never writes production application code into a control-plane tree (AOR-001).
8. Wizard never marks specs APPROVED or tasks DONE.

## Out of scope

- Full desktop operator console / monitoring (Android + CLI remain primary)
- Linux packaging for v1
- Bundling a proprietary coding agent
- Silent unattended enterprise MSI policy packs
