# Cost controls

## Goals

Prevent unbounded model spend while preserving escalation for hard tasks.

## Controls

| Control | Intent |
| --- | --- |
| Default Tier 1 | Cheap path for most tasks |
| Retry bounds | Avoid infinite loops (see also escalation + watchdog) |
| Max model tier | Cap expensive usage |
| Max attempts | Force human after budgeted tries |
| Per-task budget | Hard stop on tokens/currency |
| Per-project budget | Portfolio-level kill switch |
| Per-day org budget | Platform safety |

## Behavior on budget exhaustion

- Pause scheduling of new agent attempts
- Mark affected tasks `HUMAN_REQUIRED` or `ESCALATE` per config
- Emit audit events suitable for finance and platform ops

## Evidence

Usage (tokens, estimated cost, duration) should appear in execution evidence where available.
