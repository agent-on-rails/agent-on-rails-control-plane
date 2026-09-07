# Vision

Agent On Rails turns product intent into governed, evidenced software delivery using AI coding agents.

## The problem

Generic coding agents jump straight to code. They lack durable product contracts, bounded tasks, independent review, cost-aware model use, and auditable proof of completion. Teams get fast diffs and weak accountability.

## The product

Agent On Rails separates three planes:

1. **Authority** — docs, specs, ADRs, policies, and acceptance criteria (this repository).
2. **Control** — planner, router, state machine, policy, escalation, cost, and audit (`agent-on-rails-engine`).
3. **Execution** — sandboxed coding agents that implement against a bounded contract (`agent-on-rails-agent-runtime`).

GitHub remains the collaboration and delivery surface. Agents never invent success; **evidence** proves it.

## North-star outcome

A team can express an idea, produce accepted product and technical artifacts, approve specs, and reliably get:

- a task graph derived from those specs
- agent implementation behind PRs
- independent verification against acceptance criteria
- bounded retries and model escalation
- human gates where policy requires them
- evidence attached back to the originating spec

## Differentiator

> Docs define intent. Specs define the contract. The control plane governs execution. Agents implement. Evidence proves completion.

That is the biggest difference between Agent On Rails and a generic coding agent.
