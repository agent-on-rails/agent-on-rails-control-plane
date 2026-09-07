# ADR-007: Python/FastAPI runtime; headless agents; CLI-first surfaces

- **Status:** Accepted
- **Date:** 2026-09-07
- **Source:** Product discussion (Iman / Herry), 2026-09-07

## Context

We need a default stack for engine/CLI and a stance on whether to invent a proprietary coding agent. UX surfaces (terminal vs desktop vs mobile vs chat apps) affect monetization and MVP speed.

## Decision

1. **Engine and CLI are Python**, preferably FastAPI where an API is needed. Node/TS is acceptable for web frontends later; not for core orchestration.
2. **Do not invent a proprietary coding agent for MVP.** Implementor/reviewer/specialist roles run via **headless external agents** behind adapters (provider-neutral per ADR-003).
3. **MVP operator surface is terminal/CLI.** Desktop is later. A first-party **mobile app** is preferred over Telegram/WhatsApp for monitoring, prompting, and final-review notifications (monetizable control surface). Chat messengers are not the primary product UI.
4. **Model connectivity (MVP):** API keys (and optional self-hosted / in-house endpoints). Deep “use my ChatGPT/Claude subscription” OAuth-style connectivity is a later phase.

## Consequences

- Faster AI-assisted implementation of the platform itself.
- Adapter quality matters more than owning the agent loop.
- Console/mobile are post-MVP except where needed for dogfood notifications.
