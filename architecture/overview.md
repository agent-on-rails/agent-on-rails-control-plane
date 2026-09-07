# Architecture overview

Agent On Rails is organized as three planes plus GitHub as the delivery surface.

```
                 AUTHORITY PLANE
             agent-on-rails-control-plane
               Docs / Specs / ADRs
              Policies / Acceptance
                       │
                       ▼
                CONTROL PLANE
              agent-on-rails-engine
        Planner / Router / State Machine
       Policy / Escalation / Cost / Audit
                       │
                       ▼
               EXECUTION PLANE
             agent-on-rails-agent-runtime
          Codex / Claude / Gemini / etc.
                       │
                       ▼
                     GitHub
```

## Plane responsibilities

| Plane | Says | Owns |
| --- | --- | --- |
| Authority | What should happen | Specs, ADRs, policies, acceptance, evidence templates |
| Control | How to make it happen | Task graphs, **AI Team** orchestration, routing, retries, escalation, audit |
| Execution | Perform the work | Sandbox, headless agent adapters, branch/PR mechanics |
| GitHub | Collaborate and deliver | Issues, labels, PRs, Checks, comments, Actions |

## AI Team (control-plane concept)

```
HUMAN / PRODUCT OWNER
        │
        ▼
PRODUCT + ENGINEERING DOCS  (inside control-plane repo)
        │
        ▼
   SPEC CONTRACT
        │
        ▼
┌─────────────────┐
│ Agent On Rails  │
│ CONTROL PLANE   │
│ State / Graph   │
│ Team Definition │
│ Policies        │
└────────┬────────┘
         │
   ┌─────┼─────┐
   ▼     ▼     ▼
Manager  Impl  Reviewer  (+ specialists)
         │
         ▼
       GitHub → Evidence → Final Review → Merge
```

See [ADR-005](../adr/ADR-005-ai-team-first-class.md).

## Sibling repositories (MVP)

```
agent-on-rails/
├── agent-on-rails-control-plane   # authority
├── agent-on-rails-engine          # control
├── agent-on-rails-github          # GitHub integration
├── agent-on-rails-agent-runtime   # execution
├── agent-on-rails-cli             # bootstrap / developer UX
└── agent-on-rails-infrastructure  # deploy
```

## End-to-end flow (compressed)

Idea → product docs → PRD → architecture/ADRs → specs → acceptance → human approval → plan → task graph → model router → agent → code/test → PR → review agent → merge → deploy → validation → evidence → spec done → next eligible task.

## Key mechanisms

- [Control plane](./control-plane.md)
- [Execution plane](./execution-plane.md)
- [Task / spec state machine](./task-state-machine.md)
- [Agent adapters](./agent-adapters.md)
- [Security](./security.md)
- [Diagrams](./diagrams/)
