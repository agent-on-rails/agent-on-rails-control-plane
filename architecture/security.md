# Security

## Threat posture (MVP)

Agent On Rails executes untrusted-capable model outputs against real repositories. Assume agents may attempt over-scoped changes, secret leakage, or destructive operations. Controls must be default-deny where feasible.

## Hard requirements

1. **Least privilege** — runtime permissions scoped to task and repository.
2. **Secrets isolation** — inject short-lived credentials; never persist secrets in specs, PRs, or evidence bodies. See `policies/secrets.md`.
3. **Human gates** — architecture changes, security policy changes, and destructive operations require humans. See `policies/human-approval.md`.
4. **No self-approval** — implementer and reviewer roles are separated.
5. **Audit trail** — attempts, escalations, and evidence are retained.
6. **Cost kill switches** — budgets prevent runaway spend. See `policies/cost-controls.md`.

## Trust boundaries

| Boundary | Trust assumption |
| --- | --- |
| Control-plane docs | Human-authored authority; validated by schema/policy |
| Engine | Trusted orchestrator; hardened deployment |
| Agent runtime | Semi-trusted sandbox; treat agent output as untrusted |
| GitHub | Source of collaboration truth; webhook authenticity required |
| Model providers | External; minimize secret exposure in prompts |

## Security evidence

High-risk specs should require `security` evidence objects (scan results, permission diffs, reviewer attestation) before `DONE`.
