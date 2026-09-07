# Execution plane

The execution plane is implemented in `agent-on-rails-agent-runtime`, invoked by the engine.

## Responsibilities

- Run coding agents in a sandbox with least privilege
- Consume a bounded context package (never a vague “implement X”)
- Perform branch → implement → test → commit → PR
- Capture execution logs suitable for evidence and escalation
- Support multiple agent/model providers via adapters

## Context package

```
SPEC
+ ACCEPTANCE CRITERIA
+ RELEVANT ADRs
+ REPOSITORY AGENTS.md
+ DEPENDENT SPECS
+ CODE CONTEXT
+ CURRENT TASK
```

## Happy path

```
Context Builder → Model Router → Agent Runtime
  → Branch → Implementation → Tests → Commit → PR
```

## Constraints

- No self-marking of task completion
- No secret exfiltration; secrets injected per `policies/secrets.md`
- Network and filesystem access bounded by runtime policy
- Time, token, and cost budgets enforced from control plane policy

## Provider neutrality

Adapters translate a common execution request/response into provider-specific APIs (Codex, Claude, Gemini, etc.). Product orchestration must not depend on a single vendor’s prompt format. See [agent-adapters.md](./agent-adapters.md) and [ADR-003](../adr/ADR-003-agent-provider-neutral.md).
