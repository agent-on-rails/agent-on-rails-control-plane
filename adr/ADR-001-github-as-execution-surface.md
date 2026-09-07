# ADR-001: GitHub as the execution surface

- **Status:** Accepted
- **Date:** 2026-09-07

## Context

Agent On Rails needs a collaboration and delivery UI for MVP. Building a full console delays learning whether the core loop works.

## Decision

Use GitHub as the primary execution UI for MVP:

- Issues for spec/task visibility
- Labels for state (`aor:*`)
- Projects for portfolio views
- PRs for implementation
- Checks and Comments for verification signals
- Actions where needed for CI hooks

Defer `agent-on-rails-console` until the core loop is reliable.

## Consequences

- Faster MVP validation
- Strong alignment with developer workflows
- UI constrained by GitHub primitives
- Later console must ingest the same state/evidence model, not invent a parallel one
