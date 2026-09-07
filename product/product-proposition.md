# Product proposition

## For whom

Engineering leaders and product-minded teams who want AI coding agents to ship real software under explicit contracts—not unbounded chat sessions.

## Job to be done

When we have a product idea or approved change, we need agents to implement it against written specs with review, escalation, and evidence—without giving up architectural or security control.

## Value proposition

Agent On Rails is a **docs-first, spec-driven control plane for AI software delivery**. It makes documentation and specifications authoritative, defines an **AI Team** responsible for the contract, turns approved specs into task graphs, runs **headless** coding agents with deterministic context and cost-aware escalation, verifies work independently, and closes the loop with auditable evidence on GitHub—then hands off for **human final review / merge**.

## Default user journey (MVP intent)

1. Open the product (CLI first) and grill/produce PRD + docs.
2. Emit a control-plane repo ready to push to GitHub (docs + specs included).
3. Configure AI Team: implementor/fixer + reviewer (default model/effort + higher model after N failures).
4. Implement/test → independent review → fix loop until pass.
5. Hand off to the human for **Final Review** and PR/Merge.

## Why now

- Coding agents are capable enough to implement bounded tasks.
- Unbounded agent loops are expensive, brittle, and hard to audit.
- GitHub already provides Issues, PRs, Checks, and Actions as an execution UI for MVP.

## What we are not

- Not a general-purpose chat IDE.
- Not a replacement for human product judgment or security ownership.
- Not a single monorepo for all runtime code (sibling repos implement; this repo contracts).

## MVP promise

Given an approved spec in a control-plane repository, Agent On Rails can:

1. Create a bounded implementation task
2. Execute an AI coding agent
3. Open a PR
4. Independently verify against acceptance criteria
5. Escalate failures within policy
6. Attach evidence back to the spec
