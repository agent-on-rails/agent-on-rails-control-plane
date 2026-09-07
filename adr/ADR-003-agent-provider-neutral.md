# ADR-003: Agent provider neutrality

- **Status:** Accepted
- **Date:** 2026-09-07

## Context

Model vendors change rapidly. Locking orchestration to one provider risks product and cost fragility.

## Decision

Orchestration depends on a stable execution contract and adapter layer. Concrete providers (Codex, Claude, Gemini, etc.) are interchangeable behind `agent-on-rails-agent-runtime` adapters.

Model **tiers** are product concepts; vendor model IDs are configuration.

## Consequences

- Slightly more abstraction upfront
- Enables cost-aware multi-tier routing
- Requires disciplined adapter testing
- SDK extraction (`agent-on-rails-sdk`) can follow MVP
