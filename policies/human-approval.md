# Human approval

## Always require a human for

- Spec transition into `APPROVED` (org may designate approvers)
- Architecture-changing ADRs
- Security policy changes
- Secrets policy changes
- Destructive operations (data delete, irreversible infra)
- Cost budget increases beyond configured thresholds
- Clearing `HUMAN_REQUIRED` after max attempts **or environment stuck** (reconnect device, fix sandbox, etc.)
- **Final review / merge** (`FINAL_REVIEW → DONE`) — agents prepare; humans merge

## May be automated (policy permitting)

- Drafting docs/specs
- Planning task graphs from approved specs
- Tier-1/2/3 implementation attempts within budgets
- Opening PRs and requesting review
- Collecting evidence packages
- Manager-driven escalation within policy (model tier / specialist), short of merge

## Recording approval

Approvals must be durable: GitHub review, issue comment with structured marker, or control-plane audit event referencing actor, timestamp, and artifact SHA.
