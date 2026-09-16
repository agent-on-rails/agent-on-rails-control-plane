# ADR-005: AI Team as a first-class concept

- **Status:** Accepted
- **Date:** 2026-09-07
- **Source:** Product discussion (Iman / Herry), 2026-09-07

## Context

Routing interchangeable “workers” behind a model ladder is necessary but incomplete. Delivery quality improves when roles are explicit: who plans, who implements, who reviews, who specializes, and when humans take over.

## Decision

**AI Team** is a first-class Agent On Rails abstraction.

A team definition may include:

| Role | Responsibility |
| --- | --- |
| Manager / Orchestrator | Decides next step within policy; may adjust effort/tier |
| Implementor | Writes and fixes code against the contract |
| Reviewer | Independently reviews against acceptance + evidence |
| Specialist agents | Optional security, testing, architecture, etc. |
| Human | Final review / merge authority and policy gates |

Core product loop:

> Define the software contract.  
> Define the AI team responsible for it.  
> Let Agent On Rails operate the team until the contract is satisfied (then hand off for human final review / merge).

Teams may start from **templates** (e.g. Feature Delivery Team, Bugfix Team, Hardening Team). The manager may escalate effort, model tier, or specialist involvement under policy; it may not silently drop the governing spec or self-approve completion.

**Discovery vs delivery.** Pre-coding discovery (Product Owner / Product Manager / Solution Architect / Implementation Planner) is a separate first-class phase — see [ADR-009](./ADR-009-discovery-ai-team.md) and [AOR-011](../specs/AOR-011-discovery-ai-team/spec.md). This ADR remains the authority for the **delivery** team that runs after specs are approved.

## Consequences

- Specs and projects reference a team definition (or template id), not only a model id.
- Implementor and reviewer remain separated (see AOR-005).
- Escalation can add specialists before `HUMAN_REQUIRED`.
- MVP can ship with a minimal default team (Manager + Implementor + Reviewer) using headless external agents.
- Discovery Team templates live under [`templates/discovery/`](../templates/discovery/) and MUST NOT auto-start coding Implementors.
