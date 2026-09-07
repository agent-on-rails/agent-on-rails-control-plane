# ADR-006: Control plane is mandatory; docs live inside it

- **Status:** Accepted
- **Date:** 2026-09-07
- **Source:** Product discussion (Iman / Herry), 2026-09-07

## Context

Some agent workflows skip durable contracts. Lakuyo historically split `lakuyo-docs` and `lakuyo-control-plane`, which increased mandatory repo count for users.

## Decision

1. **Control plane is mandatory** for any project run by Agent On Rails. Without an approved control-plane contract, the engine must not schedule unbounded implementation.
2. **Product docs and SDD specs live in one control-plane repository** for consumer projects. A separate docs repo is optional, not required by the platform.
3. Bootstrap (`gh` / CLI) should create or validate that single control-plane repo (and later link implementation repos), rather than forcing users to invent structure.

## Consequences

- Safer agent behavior; less “AI updates everywhere.”
- Fewer mandatory repos for users.
- This org’s `agent-on-rails-control-plane` already combines docs + specs + ADRs as the reference shape.
- Lakuyo may keep historical splits but new AOR projects default to the merged model.
