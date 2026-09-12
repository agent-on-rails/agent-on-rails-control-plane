# ADR-008: Desktop setup wizard (macOS / Windows)

- **Status:** Proposed
- **Date:** 2026-09-09
- **Source:** Operator dogfood request (Iman / Herry), 2026-09-08–09

## Context

ADR-007 keeps the MVP **operator surface** as terminal/CLI and defers a full desktop console. New operators still hit friction before the first `aor init`: Python/pipx PATH, clone vs install, and “where do docs+specs live?”

We need a **thin onboarding surface** so someone can install the CLI and bootstrap a control-plane project without memorizing shell steps—without building a second orchestration UI.

## Decision

1. Ship a first-party **desktop setup wizard** for **macOS and Windows** in sibling repo `agent-on-rails-desktop`.
2. Scope is **setup only**: check prerequisites, install/upgrade `aor`, pick a folder + product name, run equivalent of `aor init`, optionally run `aor gather` (AOR-010 SurveyDesk-shaped drafts, confirm before write), then hand off to the existing CLI/TUI and docs.
3. Stack: **Tauri 2** (native shells) + small web UI. The wizard shells out to / embeds the same install path as `agent-on-rails-cli` (`pipx` preferred; documented fallback).
4. This does **not** replace CLI/TUI as the operator loop (spec → approve → plan → run → review). Full desktop monitoring remains later per ADR-007 / `plans/next.md`.
5. Linux is optional later; not required for the first dogfood cut.

## Consequences

- Faster first-run for non-terminal-first operators (e.g. trying Agent On Rails on a real case).
- Another binary/release artifact to build and sign; keep the wizard thin to limit maintenance.
- ADR-007’s “desktop later” still applies to monitoring/console; this ADR carves out **onboarding only**.
