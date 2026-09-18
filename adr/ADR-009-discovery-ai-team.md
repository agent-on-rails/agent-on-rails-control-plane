# ADR-009: Discovery AI Team (pre-coding staged agents)

- **Status:** Accepted
- **Date:** 2026-09-17
- **Updated:** 2026-09-18 (Herry review → Accepted)
- **Approved:** 2026-09-18
- **Source:** Product discussion (Iman / Herry Suryo Nugroho), WhatsApp 2026-09-16; review notes 2026-09-18
- **Related:** [ADR-005](./ADR-005-ai-team-first-class.md), [AOR-010](../specs/AOR-010-natural-spec-gathering/spec.md), [AOR-011](../specs/AOR-011-discovery-ai-team/spec.md), [AOR-003](../specs/AOR-003-task-planner/spec.md)

## Context

ADR-005 defines the **delivery** AI Team (Manager / Implementor / Reviewer / specialists) that operates *after* a governing contract exists. AOR-010 (`aor gather`) is a useful **single-shot** shortcut from natural language to a SurveyDesk-shaped draft pack.

Herry’s dogfood pattern showed a richer pre-coding loop that produces better contracts:

1. **Product Owner** — persona of the real stakeholder (or a cosplay bot seeded from their brief); answers clarifying questions.
2. **Product Manager** — interviews the Product Owner and produces a **PRD**.
3. **Solution Architect** — **observes** PO ↔ PM discovery (may raise questions with technical implications) but does **not** author architecture until the PRD is approved; then produces **ARCHITECTURE.md**.
4. **Implementation Planner** — after architecture is approved, emits the **control-plane pack**; separately remains planning authority during **delivery** (verify merged slices, dependencies, authorize next eligible slice) — that delivery lifecycle lives primarily in [AOR-003](../specs/AOR-003-task-planner/spec.md), not only in discovery.

This staged “grill” is closer to how strong human product teams work than a one-pass extract. It also matches the authority cascade already in AGENTS.md: intent → proposition → PRD → architecture → ADRs → specs → acceptance → plan → tasks → agents.

## Decision

**Discovery AI Team** is a first-class Agent On Rails phase that runs **before** the delivery AI Team.

| Role | Presence | Primary artifact (discovery) |
| --- | --- | --- |
| Product Owner (PO) | From start | Answers / constraints (human or seeded persona) |
| Product Manager (PM) | From start | `product/prd.md` (DRAFT → human APPROVED) |
| Solution Architect | **Observe** during PO↔PM; **author** after PRD APPROVED | Questions during observe; `ARCHITECTURE.md` (+ draft ADRs) when authoring |
| Implementation Planner | After architecture APPROVED (discovery); continues in delivery per AOR-003 | Control-plane drafts (SurveyDesk-shaped or AOR `specs/` pack) |

Rules:

1. **Observe ≠ author** — during `STAGE_PRD`, the Architect MAY ask clarifying questions when a product decision has technical implications. The Architect MUST NOT write `ARCHITECTURE.md` until PRD is human-`APPROVED`.
2. **Forward + backward stage machine** — later roles MUST NOT silently rewrite earlier artifacts. They MAY request a change that returns the session to the prior stage (e.g. Architect → `REQUEST_PRD_CHANGE` → PM → PRD gate again; Planner → `REQUEST_ARCHITECTURE_CHANGE` → Architect → architecture gate again). Change requests are auditable and bounded by cost/turn policy.
3. **Draft write vs approval gate** — agents MAY write artifacts to disk as **`DRAFT`** without a human disk-write confirm. Human authority is **`DRAFT → APPROVED`** (and equivalent gates for PRD / architecture), not “may the file exist.” Auto-approve remains forbidden (`policies/human-approval.md`).
4. **Personas are templates** — architect/PM/PO prompts are selectable templates (Cloudflare SA, AWS SA, generic web, etc.), not hard-coded vendor lock-in (ADR-003).
5. **Relationship to AOR-010** — `aor gather` remains the fast path. Discovery Team (`aor grill`) is the richer multi-agent path; both MAY share the same pack writer / SurveyDesk layout. Gather MAY keep outline UX confirms; grill prioritizes draft autonomy + approval gates.
6. **Model posture** — prefer stronger models for PM / Architect / Planner judgment; prefer fast/cheap models for later coding Implementors, with smarter Reviewers (cost controls + AOR-006). Discovery does not escalate forever; cost and turn bounds apply.
7. **Session persistence** — `aor grill` sessions MUST be resumable from the last durable gate / stage checkpoint after CLI disconnect or long discovery.
8. **Hand-off** — when discovery’s Implementation Planner finishes the control-plane **draft** pack, humans approve specs; delivery AI Team runs (ADR-005 / AOR-009). The **same planning role** continues as planning authority under AOR-003 (slice eligibility), not as a one-shot that disappears after pack write.

## Consequences

- Team templates include at least: **Discovery Team** and **Feature Delivery Team**.
- CLI / engine gain a discovery orchestration surface with persist/resume, distinct from unattended implement→review (AOR-009).
- Product journey step “grill/produce PRD + docs” becomes an explicit contract (AOR-011), not only marketing copy.
- Operators can still skip discovery and paste NL into `aor gather` when speed matters.
- Ongoing Implementation Planner authority during delivery is specified in AOR-003 (and related engine behavior), referenced from AOR-011 out of scope / hand-off.
