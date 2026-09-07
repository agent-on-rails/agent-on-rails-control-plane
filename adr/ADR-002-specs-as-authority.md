# ADR-002: Specs as authority

- **Status:** Accepted
- **Date:** 2026-09-07

## Context

Agents and humans need a single contract for what “done” means. Chat transcripts and ad-hoc prompts are not durable or auditable.

## Decision

Approved specifications in the control-plane repository are the authoritative contract for implementation and verification.

- Specs carry structured fields for machine governance and Markdown for humans.
- Acceptance criteria are first-class.
- Implementation in sibling repos must cite governing specs.
- Divergences require spec/ADR revision, not silent drift.

## Consequences

- Docs-first workflow is mandatory
- Planner and reviewers can be deterministic against contracts
- Spec quality becomes a product bottleneck (intentionally)
- Schemas (`spec.schema.json`) must evolve carefully
