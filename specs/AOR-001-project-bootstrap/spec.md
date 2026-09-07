---
id: AOR-001
title: Project Bootstrap
status: draft
intent: >
  Bootstrap an Agent On Rails–managed project from a control-plane repository,
  validating docs-first artifacts before any implementation agent runs.
implementation:
  repositories:
    - agent-on-rails-cli
    - agent-on-rails-engine
    - agent-on-rails-github
verification:
  tests:
    - unit
    - integration
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
---

# AOR-001 — Project Bootstrap

## Summary

When a user starts a new product (“Build a SaaS analytics copilot”), Agent On Rails first creates or validates the documentation cascade—not code.

## Behavior

1. CLI / engine initializes or links a control-plane repository structure.
2. System ensures product intent, proposition, and skeleton PRD/architecture/spec paths exist.
3. Missing required artifacts are generated as drafts for human review.
4. Implementation agents are blocked until governing specs reach `APPROVED` (and policy gates pass).
5. GitHub Issue + labels reflect bootstrap status.

## Out of scope

- Full PRD authoring quality automation
- Console UI
- Multi-tenant SaaS onboarding
