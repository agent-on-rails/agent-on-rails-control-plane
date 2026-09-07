# Secrets

## Rules

1. Never commit secrets to control-plane or sibling repos.
2. Never embed secrets in specs, evidence Markdown, or issue bodies.
3. Inject short-lived credentials into the runtime only.
4. Prefer OIDC / workload identity over long-lived tokens.
5. Redact secrets from execution logs before evidence attachment.
6. Rotate credentials on suspected leakage; halt related tasks.

## Agent guidance

If a task appears to require a secret not provisioned by the runtime, stop and set `HUMAN_REQUIRED` rather than inventing or scraping credentials.
