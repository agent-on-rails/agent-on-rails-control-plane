# Sample requirements — Knowledge Chatbot (training specs)

Product name: **KnowledgeChat**

Build a grounded Q&A chatbot for an internal knowledge base (docs + FAQs). Operators paste or point at requirements; Agent On Rails must produce control-plane specs **and** conversation training / eval artifacts before any coding agent implements the bot.

## Users

- **End user** — asks product/process questions in natural language; expects cited answers when sources exist.
- **Content owner** — maintains source docs; cares that the bot does not invent policy.
- **Operator** — configures sources, reviews failed evals, approves release.

## Must-have (v1)

1. Chat UI (web) with session history for the current browser session.
2. Answers grounded in configured knowledge sources; when unsure, say so and suggest escalation.
3. Citation of source titles/paths used for each grounded answer.
4. Safety: refuse jailbreaks, ignore instructions to ignore policies, no PII exfiltration coaching.
5. **Training / eval pack** generated from these requirements:
   - Golden conversation scenarios (happy path, clarification, out-of-scope, refusal)
   - Eval checklist operators run before promoting a model/prompt/index revision
   - System-prompt / policy constraints as durable specs (not only chat history)

## Non-goals (v1)

- Fine-tuning a custom foundation model in-house
- Voice / phone channel
- Multi-tenant SaaS billing
- Replacing human legal/medical advice

## Success metrics

- ≥ 80% of golden scenarios pass on staging before release
- Zero critical safety-scenario failures
- Grounded answers include at least one citation when a source match exists

## Constraints

- Docs-first: control-plane specs are authority; chatbot runtime implements them
- Prefer OpenAI-compatible chat APIs (provider-neutral)
- Secrets never in the control plane; use env / secret manager
- Human approves specs before coding agents run
