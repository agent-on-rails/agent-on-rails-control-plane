# Acceptance — AOR-011 Discovery AI Team

- [ ] `aor grill` (or documented alias) accepts a product brief from arg, `--file`, or stdin
- [ ] Operator can select architect / PO persona templates (at least: `generic-web`, `cloudflare-web-payments`)
- [ ] Stage order is enforced: PRD → architecture → control-plane drafts; later stages cannot start before prior human gates
- [ ] Human confirm/edit is required at PRD gate, architecture gate, and before writing the pack to disk
- [ ] Written drafts include `product/prd.md`, architecture artifact, and a SurveyDesk-shaped or AOR specs tree — **no** application code
- [ ] Outputs remain `draft` / not auto-`APPROVED`; READY coding path unchanged
- [ ] Stub/offline mode works without network for unit tests
- [ ] LLM client is OpenAI-compatible via env / config (ADR-003), shared posture with AOR-010
- [ ] Each closed stage produces a role report with artifact paths
- [ ] Cost/turn bounds stop runaway discovery sessions and notify the human
- [ ] Unit tests cover stage machine, gates, and writer integration; integration test covers stub end-to-end grill
- [ ] `aor gather` remains available as the fast path and shares pack-writer layout with grill where applicable
