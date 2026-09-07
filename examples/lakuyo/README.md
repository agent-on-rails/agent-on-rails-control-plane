# Example: Lakuyo

Lakuyo is the first **external** dogfood project for Agent On Rails.

## Shape

```
lakuyo-control-plane
        │
        ▼
Approved POS spec
        │
        ▼
Agent On Rails
        │
        ├── lakuyo-backend
        ├── lakuyo-android
        ├── lakuyo-ios
        └── lakuyo-infrastructure
```

## Why Lakuyo

- Real product delivery, not a toy demo
- Multi-repo implementation surface (backend + mobile/KMP + infra)
- Demonstrates control-plane authority outside Agent On Rails itself
- Complements AOR self-dogfood (“AOR built with AOR”)

Note: Lakuyo historically split `lakuyo-docs` and `lakuyo-control-plane`. **New Agent On Rails consumer projects** should use a **single** control-plane repo that includes docs ([ADR-006](../../adr/ADR-006-control-plane-mandatory.md)). Lakuyo may keep its existing split while dogfooding.

## First thin slice

Keep the first Lakuyo milestone intentionally small: one **approved POS-related spec** in `lakuyo-control-plane` that Agent On Rails can plan, execute, PR, independently verify, escalate on failure, and evidence.

See [project.json](./project.json) for the machine-readable project descriptor stub and [sample-spec.md](./sample-spec.md) for an illustrative consumer spec shape.
