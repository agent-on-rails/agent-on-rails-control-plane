# Agent On Rails — Control Plane

**Source of truth** for Agent On Rails product specifications, architecture, policies, workflows, ADRs, implementation plans, and acceptance criteria.

> Docs define intent. Specs define the contract. The control plane governs execution. Agents implement. Evidence proves completion.

## What this repository is

This is the **authority plane**. It is deliberately free of production application code. Humans and coding agents read it; sibling repositories implement it.

| Plane | Repository | Role |
| --- | --- | --- |
| Authority | `agent-on-rails-control-plane` (this repo) | What should happen |
| Control | `agent-on-rails-engine` | How to make it happen |
| Execution | `agent-on-rails-agent-runtime` | Perform the work |
| Surface | GitHub | Collaboration and delivery |

## Repository map

```
product/        Vision, proposition, principles, personas, roadmap
specs/          Machine-governable contracts (AOR-NNN)
architecture/   System design, planes, state machines, security
adr/            Architecture Decision Records
policies/       Permissions, approval, escalation, watchdog, secrets, cost
plans/          MVP, milestones, backlog
schemas/        JSON schemas for project, spec, task, evidence
guides/         How-to documentation (start with using-the-control-plane.md)
brand/          Logo mark (transparent)
examples/       Dogfood / reference projects (e.g. Lakuyo)
```

## Sibling repositories (MVP)

| Repository | Purpose |
| --- | --- |
| `agent-on-rails-engine` | Core orchestration runtime |
| `agent-on-rails-github` | GitHub App, webhooks, Checks, Issues, PRs |
| `agent-on-rails-agent-runtime` | Sandboxed execution for coding agents |
| `agent-on-rails-cli` | Developer and bootstrap CLI |
| `agent-on-rails-android` | Mobile monitoring (KMP; Herry) |
| `agent-on-rails-infrastructure` | Terraform/OpenTofu, Kubernetes, deployment |

Deferred: `agent-on-rails-console`, `agent-on-rails-sdk`, `agent-on-rails-docs`.
Marketing site: [`agent-on-rails-website`](https://github.com/agent-on-rails/agent-on-rails-website) → [agent-on-rails.suherman.net](https://agent-on-rails.suherman.net).

## Authority hierarchy

1. **Product docs** (`product/`) — intent and boundaries
2. **ADRs** (`adr/`) — durable decisions
3. **Policies** (`policies/`) — non-negotiable constraints
4. **Specs** (`specs/`) — contracts with acceptance and evidence
5. **Plans** (`plans/`) — sequencing and scope
6. **Sibling repos** — implementation only

If implementation diverges from an approved spec, the spec wins until a new ADR or spec revision is approved.

**Mandatory for all Agent On Rails projects:** a control-plane repository in this shape (docs + specs together). See [ADR-006](./adr/ADR-006-control-plane-mandatory.md).

**AI Team** (Manager / Implementor / Reviewer / specialists) is a first-class concept — [ADR-005](./adr/ADR-005-ai-team-first-class.md).

## Getting started

1. Read [`AGENTS.md`](./AGENTS.md) before any change.
2. Follow **[guides/using-the-control-plane.md](./guides/using-the-control-plane.md)** — detailed how-to for humans and agents.
3. Read [`product/vision.md`](./product/vision.md) and [`product/principles.md`](./product/principles.md).
4. Review active specs under [`specs/`](./specs/).
5. Follow [`plans/MVP.md`](./plans/MVP.md) for the first milestone.

## Operator dashboard

Same pattern as suherman.net: a live TTY view of sibling repos, GitHub Actions, the public site, and HaloRT Kubernetes cluster health.

```bash
npm run ci            # live dashboard (Ctrl+C to stop)
npm run ci:once       # snapshot and exit
npm run check         # schemas, spec/ADR IDs, relative Markdown links
```

Marketing site: [https://agent-on-rails.suherman.net](https://agent-on-rails.suherman.net)

## Spec lifecycle (summary)

`DRAFT → REVIEW → APPROVED → PLANNED → READY → IN_PROGRESS → VERIFYING → DONE`

Failures enter `RETRY` / `ESCALATE` or `HUMAN_REQUIRED`. See [`architecture/task-state-machine.md`](./architecture/task-state-machine.md).

## First milestone

> Given an approved spec in a control-plane repository, Agent On Rails can turn it into a bounded implementation task, execute an AI coding agent, create a PR, independently verify it against acceptance criteria, escalate failures, and attach evidence back to the spec.

## License

Proprietary — all rights reserved unless otherwise stated.
