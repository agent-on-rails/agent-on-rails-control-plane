# Acceptance — AOR-006 Model Escalation

- [ ] Default attempts start at model tier 1.
- [ ] At a given tier, at most `same_tier_retries` coding failures occur before tier increases (or `HUMAN_REQUIRED` if already at `max_model_tier`).
- [ ] Exceeding `max_attempts` yields `HUMAN_REQUIRED` with no further agent attempts.
- [ ] Identical failure signatures (`no_progress`) do not reset attempt counters or pretend success.
- [ ] `environment` failures (watchdog timeout, device disconnected, hung build with no code delta) never increase `model_tier`.
- [ ] Architecture/security/destructive flags force human gate without full ladder spend when policy says so.
- [ ] Escalation history is persisted and queryable (`from_tier`, `to_tier`, `reason`, `failure_class`, `attempt`).
- [ ] Cost budget exhaustion blocks further paid attempts.
- [ ] Unit tests cover ladder edges and failure-class routing; integration test covers fail→same-tier retry→escalate→pass and fail→max_attempts→`HUMAN_REQUIRED`.
- [ ] Integration fixture proves a simulated hung command / env stuck ends in `HUMAN_REQUIRED` (or env retry), not tier escalation.
