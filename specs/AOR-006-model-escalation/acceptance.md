# Acceptance — AOR-006 Model Escalation

- [ ] Default attempts start at model tier 1.
- [ ] After configured retries, tier increases up to `max_model_tier`.
- [ ] Exceeding `max_attempts` yields `HUMAN_REQUIRED`.
- [ ] Architecture/security/destructive flags force human gate without full ladder spend when policy says so.
- [ ] Escalation history is persisted and queryable in audit/execution logs.
- [ ] Cost budget exhaustion blocks further paid attempts.
- [ ] Unit tests cover ladder edges; integration test covers fail→escalate→pass.
