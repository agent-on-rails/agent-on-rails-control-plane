# Principles

1. **GitHub is the surface** — Issues, PRs, Checks, and labels are the MVP operating UI; agents ship through Git, not a parallel console.
2. **Docs before agents** — Product intent, architecture, and specs precede implementation.
3. **Specs are contracts** — Approved specs bind planners, agents, and reviewers.
4. **Control plane is mandatory** — No unbounded agent execution without an approved control-plane contract.
5. **One authority repo** — Docs + SDD specs live together in the control plane for consumer projects.
6. **AI Team over lone agents** — Define Manager / Implementor / Reviewer (+ specialists); operate the team until the contract is satisfied.
7. **Separation of planes** — Authority, control, and execution stay distinct.
8. **Bounded context** — Agents receive contracts and task scope, not vague prompts.
9. **Provider neutrality + headless agents** — Adapters over inventing a proprietary coding agent for MVP.
10. **Cheap first** — Start with inexpensive models; escalate on failure within bounds.
11. **No forever loops** — AOR detects stuck **same** failures (failure signatures); distinct bugs across fix↔review are normal progress. Cap forever-loop strikes and runaway attempts; escalate to human when stuck.
12. **Fail fast on environment** — Hung device/network/build/**npm** waits are watchdog failures: notify, stop that path, continue independent work when safe, report gaps — not reasons to burn a smarter model or an unsupervised hour.
13. **No self-approval** — Implementers do not mark their own work done.
14. **Evidence over assertion** — “Done” requires artifacts that satisfy acceptance criteria.
15. **Human final review** — Agents prepare; humans own final review / merge at the gate.
16. **CLI first** — Terminal/Python operators for MVP; mobile monitoring later (not Telegram/WhatsApp as primary UI).
17. **Auditability** — Escalation history, reviews, and evidence are durable and queryable.
18. **Dogfood with real products** — Prefer Lakuyo and Agent On Rails itself over toy demos.
