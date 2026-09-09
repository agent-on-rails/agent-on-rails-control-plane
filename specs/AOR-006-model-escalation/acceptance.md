# Acceptance — AOR-006 Model Escalation

- [ ] Default attempts start at model tier 1.
- [ ] Engine produces a **loop verdict** (`normal_progress` | `forever_loop` | …) from failure signatures — not from raw attempt count alone.
- [ ] Distinct bugs across fix↔review cycles (different failure signatures) are classified `normal_progress` and are **not** treated as forever-loop even at 5+ cycles.
- [ ] The same failure signature repeating hits `forever_loop_same_signature_max` (default 5) then yields `HUMAN_REQUIRED` (after tier escalation per policy).
- [ ] At a given tier, difficulty retries respect `same_tier_retries` before tier increase when verdict is not already forever-loop-capped.
- [ ] `absolute_max_attempts` remains a runaway safety net and is audited separately from forever-loop.
- [ ] `environment` failures never increase `model_tier`.
- [ ] Architecture/security/destructive flags force human gate without full ladder spend when policy says so.
- [ ] Escalation / verdict history is persisted (`failure_signature`, `verdict`, `from_tier`, `to_tier`, `reason`, `attempt`).
- [ ] Cost budget exhaustion blocks further paid attempts.
- [ ] Unit tests cover: distinct-bug ×5 → still `normal_progress`; same-signature ×5 → `HUMAN_REQUIRED`; env stuck → no tier climb.
- [ ] Integration fixture covers fail→retry→escalate→pass and forever-loop cap → human.
