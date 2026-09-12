---
id: AOR-010
title: Natural language spec gathering
status: approved
intent: >
  Operators describe a product in natural language; Agent On Rails extracts a
  survey-desk-shaped specs tree via an OpenAI-compatible AI endpoint, confirms
  with the human before writing the full pack, and allows editing the outline.
implementation:
  repositories:
    - agent-on-rails-cli
verification:
  tests:
    - unit
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
---

# AOR-010 — Natural language spec gathering

## Summary

SurveyDesk (`survey-desk`) is the **reference shape** for Spec-Driven product packs:
`specs/product`, `requirements`, `domain`, `api`, `adr`, `acceptance`, and
`regeneration`. Operators should be able to paste natural-language requirements,
have an AI (default: OpenAI-compatible portal such as
[Dental Implants and Veneers AI](https://ai.dentalimplantsandveneers.com.au/))
extract a structured outline, **confirm or edit** that outline, then generate a
full specs tree that mirrors that layout.

## Behavior

1. CLI command `aor gather` accepts natural-language requirements (argument, `--file`, or stdin).
2. System calls a **provider-neutral** OpenAI-compatible Chat Completions API
   (`AOR_LLM_BASE_URL` + `AOR_LLM_API_KEY`, ADR-003). Default base URL MAY point at
   the DIV AI gateway; operators can override to any compatible endpoint.
3. AI returns a structured **outline** (product name, vision, personas, requirement
   IDs with SHALL text, domains, ADRs, acceptance scenarios, regen notes) — not yet
   the full file tree.
4. CLI **prints the outline** and requires explicit human confirmation before writing.
5. Operator MAY edit the outline (editor / `--outline` JSON) and re-apply without
   re-calling the model (`aor gather apply`).
6. On confirm, CLI writes a **survey-desk-like** tree under the project:

   ```text
   specs/product/          vision, personas, brand, demo-journey
   specs/requirements/     PREFIX-NNN-*.md (SHALL contracts)
   specs/domain/           domain concepts
   specs/api/              openapi.yaml (draft)
   specs/adr/              ADR-NNN-*.md
   specs/acceptance/       *.feature (Gherkin)
   specs/regeneration/     REGENERATE.md + orchestrate stub
   ```

7. Generated artifacts are **drafts**. Specs are not `APPROVED` until a human runs
   the normal approval path. Gathering automates drafting only (`policies/human-approval.md`).
8. Offline/stub mode MUST work for tests when no API key is set (deterministic heuristic extract).
9. When the natural-language input describes **SurveyDesk** (product name SurveyDesk,
   or FormSpec + native iOS/Android operators + anonymous/Next.js web), gather MUST
   write the **SurveyDesk reference pack** shipped in the CLI (same `specs/` files as
   the SurveyDesk exemplar: SD-001…SD-012, domain including `form-spec`, OpenAPI
   `/v1/surveys`, ADR-001…ADR-009, acceptance features, regeneration P1–P6 and
   contracts). It MUST NOT sentence-split the pasted paragraphs into requirement
   files. Overlay `specs/regeneration/source-requirements.md` with the captured NL.
   `--force` replaces a previous stub `specs/` tree so leftover sentence-slug files
   are removed. Other products still get generated drafts in the same *layout*.

## Out of scope

- Auto-approving specs or skipping human confirm
- Hard-coding a single vendor model monopoly (DIV is a default endpoint, not the only one)
- Generating application code (`apps/`) during gather
- Full desktop / Android gather console as a parallel operator loop (CLI remains primary; TUI may follow). A thin confirm-before-write step in the AOR-008 setup wizard MAY shell out to the same `aor gather` CLI (no keys stored in the app).

## Reference

Exemplar repository layout: SurveyDesk `specs/` (product, requirements SD-001…,
domain, api/openapi.yaml, adr, acceptance/*.feature, regeneration/).
