# Acceptance — AOR-011 Discovery AI Team

- [ ] `aor grill` (or documented alias) accepts a product brief from arg, `--file`, or stdin
- [ ] Operator can select architect / PO persona templates (at least: `generic-web`, `cloudflare-web-payments`)
- [ ] During `STAGE_PRD`, Architect may observe and raise technical questions but MUST NOT write `ARCHITECTURE.md` until PRD is human-`APPROVED`
- [ ] Stage order is enforced for authorship: PRD APPROVED → architecture authoring → architecture APPROVED → control-plane drafts
- [ ] Backward transitions work: `REQUEST_PRD_CHANGE` returns to PRD stage; `REQUEST_ARCHITECTURE_CHANGE` returns to architecture stage; re-approval required
- [ ] Agents MAY write DRAFT artifacts to disk without a human “confirm write” prompt
- [ ] Human gates are `DRAFT → APPROVED` for PRD, architecture, and governing specs — not auto-approved
- [ ] Written drafts include `product/prd.md`, architecture artifact, and a SurveyDesk-shaped or AOR specs tree — **no** application code
- [ ] Grill session state persists; `aor grill --resume` continues from the last durable checkpoint after interrupt
- [ ] Stub/offline mode works without network for unit tests
- [ ] LLM client is OpenAI-compatible via env / config (ADR-003), shared posture with AOR-010
- [ ] Each closed stage or change request produces a role report with artifact paths
- [ ] Cost/turn bounds stop runaway discovery or unbounded change-request loops and notify the human
- [ ] Unit tests cover stage machine (forward + backward), approval gates, persist/resume, and writer integration; integration test covers stub end-to-end grill
- [ ] `aor gather` remains available as the fast path and shares pack-writer layout with grill where applicable
- [ ] Spec documents that continuous Implementation Planner authority during delivery is owned by AOR-003
