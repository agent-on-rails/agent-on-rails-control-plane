---
id: AOR-007
title: Evidence
status: draft
intent: >
  Make evidence a first-class completion requirement so tasks and specs become
  DONE only with auditable proof, not agent assertions.
implementation:
  repositories:
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

# AOR-007 — Evidence

## Summary

A task is not done because an agent says “done.” It is done because there is evidence.

Example layout:

```
evidence/
└── AOR-006/
    ├── implementation.json
    ├── tests.json
    ├── review.json
    ├── security.json
    └── deployment.json
```

## Behavior

1. Collect implementation, tests, review, optional security/deployment objects.
2. Validate against `schemas/evidence.schema.json`.
3. Attach/link evidence to the governing spec and GitHub Issue.
4. Block `VERIFYING → DONE` without required artifacts.
5. Support Lakuyo and AOR dogfood evidence paths.

## Out of scope

- Long-term evidence warehouse product
- Public compliance certifications
