# Control plane

The control plane is implemented primarily in `agent-on-rails-engine`, with GitHub I/O in `agent-on-rails-github`.

## Responsibilities

- Ingest approved specs from control-plane repositories
- Validate specs against schemas and policies
- Generate **task graphs** from READY specs
- Assemble deterministic **context packages** for agents
- Route work to model tiers (cheap first)
- Enforce retries, escalation, cost limits, and human gates
- Drive GitHub Issues / labels / Checks as the MVP UI
- Require independent review before completion
- Persist audit trails and attach **evidence** back to specs

## Non-responsibilities

- Defining product intent (authority plane)
- Running model tool loops inside the sandbox (execution plane)
- Hosting a large custom console in MVP (deferred)

## Core components

| Component | Role |
| --- | --- |
| Spec ingest | Load and validate `specs/**` + schemas |
| Planner | Expand READY specs into dependency-aware tasks |
| State machine | Advance task/spec statuses |
| Context builder | Package SPEC + ACCEPTANCE + ADRs + AGENTS.md + deps + code + task |
| Model router | Select tier; escalate on failure within policy |
| Policy engine | Permissions, approval, secrets, cost |
| Review orchestrator | Separate implementer vs reviewer roles |
| Evidence collector | Normalize and attach proof artifacts |
| Auditor | Immutable event log for attempts and escalations |

## Determinism goals

Given the same approved spec revision, repository SHAs, and policy version, the planner should produce a stable task graph identity. Execution outcomes may vary by model nondeterminism, but routing and gate decisions must be policy-deterministic and auditable.
