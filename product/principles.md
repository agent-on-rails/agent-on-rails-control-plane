# Principles

1. **Docs before agents** — Product intent, architecture, and specs precede implementation.
2. **Specs are contracts** — Approved specs bind planners, agents, and reviewers.
3. **Control plane is mandatory** — No unbounded agent execution without an approved control-plane contract.
4. **One authority repo** — Docs + SDD specs live together in the control plane for consumer projects.
5. **AI Team over lone agents** — Define Manager / Implementor / Reviewer (+ specialists); operate the team until the contract is satisfied.
6. **Separation of planes** — Authority, control, and execution stay distinct.
7. **GitHub is the surface** — Issues, PRs, Checks, and labels are the MVP control UI.
8. **Bounded context** — Agents receive contracts and task scope, not vague prompts.
9. **Provider neutrality + headless agents** — Adapters over inventing a proprietary coding agent for MVP.
10. **Cheap first** — Start with inexpensive models; escalate on failure within bounds.
11. **No self-approval** — Implementers do not mark their own work done.
12. **Evidence over assertion** — “Done” requires artifacts that satisfy acceptance criteria.
13. **Human final review** — Agents prepare; humans own final review / merge at the gate.
14. **CLI first** — Terminal/Python operators for MVP; mobile monitoring later (not Telegram/WhatsApp as primary UI).
15. **Auditability** — Escalation history, reviews, and evidence are durable and queryable.
16. **Dogfood with real products** — Prefer Lakuyo and Agent On Rails itself over toy demos.
