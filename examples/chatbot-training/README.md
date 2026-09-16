# Example: Chatbot training specs orchestration

Turn chatbot requirements into Discovery drafts, SurveyDesk-shaped `specs/`, and a `specs/training/` eval pack.

**Full documentation:** [`guides/chatbot-training-orchestration.md`](../../guides/chatbot-training-orchestration.md)

## Quick start

```bash
chmod +x examples/chatbot-training/orchestrate.sh

./examples/chatbot-training/orchestrate.sh \
  --requirements ./examples/chatbot-training/requirements.sample.md \
  --out /tmp/knowledgechat-control-plane \
  --stub --yes --force
```

## Files

| Path | Role |
| --- | --- |
| `orchestrate.sh` | Operator entrypoint |
| `discovery_stub.py` | PRD / architecture / enrich / training writer |
| `requirements.sample.md` | KnowledgeChat fixture brief |

## Related

- [Guide (full)](../../guides/chatbot-training-orchestration.md)
- [ADR-009](../../adr/ADR-009-discovery-ai-team.md) · [AOR-011](../../specs/AOR-011-discovery-ai-team/spec.md) · [AOR-010](../../specs/AOR-010-natural-spec-gathering/spec.md)
- [templates/discovery/chatbot-rag.md](../../templates/discovery/chatbot-rag.md)
