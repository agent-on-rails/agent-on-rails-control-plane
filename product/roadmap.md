# Roadmap

## Now — MVP core

Stack defaults: **Python / FastAPI** for engine & CLI; **headless agent adapters**; **terminal-first**. Docs are **inside** the control plane (no separate mandatory docs repo).

Build only:

- `agent-on-rails-control-plane` (this repo — authority + docs)
- `agent-on-rails-engine`
- `agent-on-rails-github`
- `agent-on-rails-agent-runtime`
- `agent-on-rails-cli`
- `agent-on-rails-infrastructure`

Milestone: approved spec → task → agent → PR → independent verify → escalate → evidence.

Dogfood: Agent On Rails building itself; Lakuyo as first external control-plane consumer.

## Next

- Console for observability and control (`agent-on-rails-console`)
- Provider adapter SDK (`agent-on-rails-sdk`)
- Stronger multi-repo task graphs and cross-spec dependencies
- Richer evidence packs (security, deployment, staging health)

## Later

- Public documentation site (`agent-on-rails-docs`)
- Marketing website (`agent-on-rails-website`)
- Broader policy packs and org-level templates
- Multi-tenant / SaaS control offerings (if product strategy requires)

## Explicit non-goals (near term)

- Replacing GitHub as the primary collaboration UI for MVP
- Unbounded autonomous product invention without human approval
- Single-vendor lock-in for models or runtimes
