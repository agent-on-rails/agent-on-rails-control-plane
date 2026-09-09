# How to use the Agent On Rails control plane

This guide explains how **humans** and **coding agents** use `agent-on-rails-control-plane` as the authority for product delivery.

> Docs define intent. Specs define the contract. The control plane governs execution. Agents implement. Evidence proves completion.

Marketing site: [agent-on-rails.suherman.net](https://agent-on-rails.suherman.net)

---

## 1. What this repository is (and is not)

| This repo **is** | This repo **is not** |
| --- | --- |
| Source of truth for product intent, specs, ADRs, policies | A place for production application code |
| The mandatory contract for Agent On Rails projects | Optional documentation you can skip |
| Readable by humans **and** agents (`AGENTS.md` first) | A substitute for GitHub PRs / review |

Sibling runtimes (`engine`, `github`, `agent-runtime`, `cli`, `infrastructure`) **implement** what this repo authorizes.

---

## 2. Read this first (required order)

### Humans

1. [`AGENTS.md`](../AGENTS.md) — boundaries and prohibited actions  
2. [`product/vision.md`](../product/vision.md) + [`product/principles.md`](../product/principles.md)  
3. This guide  
4. Active work under [`specs/`](../specs/) and [`plans/MVP.md`](../plans/MVP.md)

### Coding agents

1. **Always** read [`AGENTS.md`](../AGENTS.md) before editing anything  
2. Open the governing **spec** + `acceptance.md` for the task  
3. Load cited **ADRs** and **policies**  
4. Implement only in the sibling repos named by the spec  
5. Do **not** mark work `DONE` without required evidence

---

## 3. Authority hierarchy (when documents conflict)

Resolve **upward**:

1. Product docs (`product/`)  
2. ADRs (`adr/`)  
3. Policies (`policies/`)  
4. Specs + acceptance (`specs/**`)  
5. Plans (`plans/`)  
6. Sibling repository code  

If code disagrees with an approved spec, **the spec wins** until you revise the spec or ADR through review.

---

## 4. Start a new product with Agent On Rails

Control plane is **mandatory** ([ADR-006](../adr/ADR-006-control-plane-mandatory.md)). Docs live **inside** the control-plane repo (no separate required docs repo).

### Recommended bootstrap flow

1. **Create** a control-plane repository (CLI / `gh` will automate this later; today you can fork this structure).  
2. **Author product intent** in `product/` (vision → proposition → principles).  
3. **Capture binding decisions** as ADRs under `adr/`.  
4. **Write specs** under `specs/<ID>-<slug>/` with:
   - `spec.md` (frontmatter + narrative)
   - `acceptance.md` (checklist)
   - `evidence.md` (what proves done)
5. **Human-approve** specs (`REVIEW → APPROVED`) per [`policies/human-approval.md`](../policies/human-approval.md).  
6. Only then allow the engine to plan tasks and run agents.

### Minimum folder contract for a consumer project

```text
your-product-control-plane/
├── AGENTS.md
├── README.md
├── product/
├── adr/
├── policies/          # may symlink / copy AOR defaults at first
├── specs/
│   └── XXX-001-…/
│       ├── spec.md
│       ├── acceptance.md
│       └── evidence.md
├── schemas/           # optional; prefer AOR schemas until you diverge
└── plans/
```

Validate structured fields against [`schemas/`](../schemas/) when the engine is available.

---

## 5. How to write a good spec

Use ID form `AOR-NNN` in this org (consumers use their own prefix, e.g. `LKY-001`).

### Frontmatter (machine-governable)

```yaml
id: AOR-006
title: Model Escalation
status: draft   # draft | review | approved | …
intent: >
  Short statement of why this exists.
implementation:
  repositories:
    - agent-on-rails-engine
verification:
  tests: [unit, integration]
evidence_required:
  - implementation-pr
  - test-results
  - execution-log
```

### Body (human-readable)

- Summary / behavior  
- In scope / out of scope  
- Links to ADRs and dependent specs  

### Acceptance

Every bullet must be **testable**. Prefer checklists in `acceptance.md`.

### Evidence

List exact artifacts required before `DONE` (see [ADR-004](../adr/ADR-004-evidence-required-before-done.md)).

Copy the shape of [`specs/AOR-006-model-escalation/`](../specs/AOR-006-model-escalation/) as a template.

---

## 6. Spec lifecycle (how status moves)

```text
DRAFT → REVIEW → APPROVED → PLANNED → READY
  → IN_PROGRESS → VERIFYING → FINAL_REVIEW → DONE
```

Failures: `RETRY` / `ESCALATE` → possibly `HUMAN_REQUIRED`.

| Transition | Who |
| --- | --- |
| `DRAFT → REVIEW` | Author / agent drafting |
| `REVIEW → APPROVED` | Human (or designated approver) |
| `APPROVED → PLANNED → READY` | Planner (engine) |
| `IN_PROGRESS` | Implementor agent |
| `VERIFYING` | Reviewer agent (independent) |
| `FINAL_REVIEW → DONE` | **Human** merge / accept |
| `DONE` | Never set by the implementor on their own work |

Full rules: [`architecture/task-state-machine.md`](../architecture/task-state-machine.md).

---

## 7. Day-to-day: humans

### Propose a change

1. Open or update a **DRAFT** spec (or ADR if the decision is durable).  
2. Move to `REVIEW`; request approval.  
3. After `APPROVED`, ask the engine (or manually) to plan the task graph.  
4. Watch GitHub Issues / labels (`aor:*`) for progress.  
5. When status is `FINAL_REVIEW`, review the PR + evidence, then merge.

### Approve safely

Always require humans for architecture, security, secrets, destructive ops, and final merge — see [`policies/human-approval.md`](../policies/human-approval.md).

### Reject / send back

### Reject / send back

Reviewer (or you) rejects with structured feedback → AOR-006 decides `normal_progress` (different bug) vs `forever_loop` (same signature) under [`policies/escalation.md`](../policies/escalation.md). Every implementor / fixer / reviewer hop must close with a standardized **role report** ([`policies/role-reports.md`](../policies/role-reports.md)). Environment hangs (device disconnect, stuck Gradle, hung **npm**) are handled by [`policies/execution-watchdog.md`](../policies/execution-watchdog.md) — cancel + notify, continue independent work when safe, end with a run report; do not escalate model tier.

---

## 8. Day-to-day: agents (AI Team)

Roles are first-class ([ADR-005](../adr/ADR-005-ai-team-first-class.md)):

| Role | Uses the control plane to… |
| --- | --- |
| Manager | Decide next task, retries, escalation within policy |
| Implementor | Load SPEC + ACCEPTANCE + ADRs + `AGENTS.md` + task; open PR |
| Reviewer | Judge diff vs acceptance + evidence **without** implementor private traces |
| Human | Final review / merge; clear `HUMAN_REQUIRED` |

### Context package (what implementors should receive)

```text
SPEC + ACCEPTANCE + relevant ADRs + repo AGENTS.md
+ dependent specs + code context + CURRENT TASK
```

Never accept a vague prompt like “implement feature X” as the only input.

### Headless agents

MVP uses **external headless agents** behind adapters ([ADR-007](../adr/ADR-007-python-headless-cli-first.md)) — do not invent a proprietary coding agent here.

---

## 9. Evidence = done

A task/spec is not complete because an agent says so.

Typical evidence pack:

- Implementation PR + commit SHA  
- Test results  
- Independent review result  
- Execution / escalation log  
- Optional security / deployment checks  

Shape: [`schemas/evidence.schema.json`](../schemas/evidence.schema.json)  
Example requirements: any `specs/**/evidence.md`

---

## 10. GitHub as the execution UI (MVP)

Prefer GitHub over a custom console:

| Primitive | Use |
| --- | --- |
| Issues | Spec / task visibility |
| Labels | `aor:spec`, `aor:ready`, `aor:running`, `aor:review`, `aor:failed`, `aor:escalated`, `aor:human-required`, `aor:done` |
| PRs | Implementation surface |
| Checks / Comments | Verification and audit notes |

See [ADR-001](../adr/ADR-001-github-as-execution-surface.md).

---

## 11. Working on Agent On Rails itself

This org dogfoods AOR:

1. Change **authority** here (docs/specs/ADRs).  
2. Implement in sibling MVP repos per the spec’s `implementation.repositories`.  
3. Attach evidence back to the governing `AOR-NNN`.  
4. External dogfood: [examples/lakuyo](../examples/lakuyo/).

MVP scope: [`plans/MVP.md`](../plans/MVP.md).

---

## 12. Quick command checklist

Until the CLI ships, treat these as the operating checklist:

- [ ] `AGENTS.md` read  
- [ ] Spec exists with acceptance + evidence lists  
- [ ] Status at least `APPROVED` before implementation  
- [ ] Task is bounded (not whole-product)  
- [ ] Implementor ≠ reviewer  
- [ ] Evidence artifacts present  
- [ ] Human final review before merge

Stack health (sibling git + GitHub Actions + public site):

```bash
npm run ci
```

---

## 13. Where to go next

| Need | Open |
| --- | --- |
| Product intent | [`product/`](../product/) |
| Architecture | [`architecture/overview.md`](../architecture/overview.md) |
| Decisions | [`adr/`](../adr/) |
| Constraints | [`policies/`](../policies/) |
| Contracts | [`specs/`](../specs/) |
| Schemas | [`schemas/`](../schemas/) |
| Brand assets | [`brand/`](../brand/) |
