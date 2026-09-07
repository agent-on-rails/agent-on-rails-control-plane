# ADR-004: Evidence required before done

- **Status:** Accepted
- **Date:** 2026-09-07

## Context

Agents readily claim completion. Without proof, the system cannot audit quality, cost, or safety.

## Decision

A task or spec may transition to `DONE` only when required evidence artifacts exist and pass independent review against acceptance criteria.

Evidence typically includes implementation references (repo/commit/PR), test results, review outcomes, and relevant execution logs. Schema: `schemas/evidence.schema.json`.

Agent assertions alone are insufficient.

## Consequences

- Completion is slower but trustworthy
- Evidence collection is a core engine feature
- Specs must declare `evidence_required`
- Fake or incomplete evidence is a first-class failure mode to detect
