# Agent adapters

Agent On Rails is **provider-neutral**. The control plane speaks a stable execution contract; adapters map that contract onto specific coding agents and models.

## Goals

- Swap or combine Codex, Claude, Gemini, and future providers without rewriting orchestration
- Keep context packages and evidence schemas stable across providers
- Allow tiered routing (Tier 1 / 2 / 3) independent of vendor branding

## Adapter interface (conceptual)

```
ExecutionRequest:
  task_id
  context_package
  model_tier
  budgets (time, tokens, cost)
  permissions
  workspace (repo, branch, base SHA)

ExecutionResult:
  status (pass | fail | needs_human | error)
  artifacts (diff summary, test output refs, logs)
  usage (tokens, cost, duration)
  provider_metadata
```

## Routing vs adapters

- **Model router** (engine) chooses tier and attempt policy.
- **Adapter** binds a tier to a concrete provider/model and tool profile.
- Failures return structured results so the engine can retry, escalate, or halt.

## SDK (post-MVP)

`agent-on-rails-sdk` will package adapter interfaces and test harnesses. Until then, adapters live in `agent-on-rails-agent-runtime` behind a narrow internal API.
