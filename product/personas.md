# Personas

## Product owner

Wants ideas turned into durable intent, PRDs, and approved specs. Cares about roadmap clarity and human approval checkpoints. Does not want agents inventing product scope.

## Tech lead / architect

Owns ADRs, repository boundaries, and security posture. Needs agents to respect architecture and escalate structural changes. Reviews high-risk diffs and policy exceptions.

## Implementing engineer

Uses Agent On Rails to accelerate bounded tasks. Needs clear task graphs, local CLI bootstrap, and transparent PR/review loops. Remains accountable for merges and production judgment.

## Platform / DevOps engineer

Operates infrastructure, secrets, cost controls, and sandboxed runtimes. Needs deterministic deployments, audit logs, and kill switches for runaway agent spend.

## Coding agent (system actor)

Consumes AGENTS.md, specs, acceptance criteria, and context packages. Produces branches, commits, PRs, tests, and evidence candidates. Must not self-certify completion.

## Reviewer agent (system actor)

Evaluates diffs against acceptance criteria and evidence requirements without the implementer’s private reasoning trace. Accepts, rejects with feedback, or escalates.
