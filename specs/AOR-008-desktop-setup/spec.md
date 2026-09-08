---
id: AOR-008
title: Desktop Setup Wizard
status: draft
intent: >
  Give macOS and Windows operators a native setup wizard that installs the `aor`
  CLI and bootstraps a control-plane project without requiring shell fluency,
  then hands off to the existing terminal/TUI workflow.
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
prerequisites → install CLI → create project contract → open next steps.
Day-to-day work stays in `aor` TUI/CLI (ADR-007, ADR-008).

## Behavior

1. App launches a short wizard (Welcome → Prerequisites → Install CLI → New project → Done).
2. Prerequisites step reports Python 3.11+ availability and whether `aor` / `pipx` are on PATH.
3. Install CLI step runs the same install strategy as `agent-on-rails-cli` `scripts/install.sh` (pipx preferred; pip --user fallback) and shows stdout/stderr.
4. New project step: choose directory, product name, optional force; invokes `aor init` (or equivalent library call) and surfaces validation results.
5. Done step links to walkthrough / docs and offers to open the project folder or copy `aor` launch hint.
6. Wizard never writes production application code into a control-plane tree (AOR-001).
7. Wizard never marks specs APPROVED or tasks DONE.

## Out of scope

- Full desktop operator console / monitoring (Android + CLI remain primary)
- Linux packaging for v1
- Bundling a proprietary coding agent
- Silent unattended enterprise MSI policy packs
