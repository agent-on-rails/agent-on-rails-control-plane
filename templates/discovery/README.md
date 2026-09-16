# Discovery team templates

Persona prompts and stage defaults for [AOR-011](../../specs/AOR-011-discovery-ai-team/spec.md) / [ADR-009](../../adr/ADR-009-discovery-ai-team.md).

Templates are **prompt + artifact contracts**, not provider lock-in. Runtime loads these (or copies) when `aor grill --architect-template …` is used.

| Template id | Use when |
| --- | --- |
| [`generic-web`](./generic-web.md) | Default web product; stack-agnostic architect |
| [`cloudflare-web-payments`](./cloudflare-web-payments.md) | Herry dogfood: Workers/Pages-style deploy + Midtrans-class payments |

## Shared stage contract

All templates MUST produce, in order:

1. `product/prd.md` — goals, users, scope in/out, success metrics, open questions
2. Architecture artifact — deploy target, major components, integrations, threats/constraints
3. Control-plane drafts — SurveyDesk-shaped `specs/` (or AOR packs) ready for human approval

Humans may replace any persona answer at any gate.
