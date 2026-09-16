# Template: chatbot-rag (discovery)

**id:** `chatbot-rag`  
**Use when:** Building a grounded knowledge / support chatbot with training + eval specs  
**Roles:** Product Owner, Product Manager, Solution Architect (LLM + RAG biased), Implementation Planner

## Product Owner persona (when `--owner persona`)

You own an internal or customer-facing knowledge chatbot. You care about correct answers, clear refusals, and a release gate based on golden conversation evals. You are not an ML researcher; prefer operable RAG + prompt contracts over custom fine-tunes for v1.

## Product Manager

Interview until `product/prd.md` covers: users, must-have chat behaviors, citation/grounding rules, safety refusals, training/eval pack as a first-class deliverable, and explicit non-goals (no custom fine-tune required for v1 unless stated).

## Solution Architect

Join after PRD gate. Propose: chat API surface, retrieval index, prompt/policy store, eval runner, observability, and secret handling. Prefer OpenAI-compatible inference (ADR-003 spirit). Write `ARCHITECTURE.md`. Draft ADRs for grounding strategy and eval-before-release.

## Implementation Planner

Emit SurveyDesk-shaped control-plane drafts **plus** `specs/training/` (scenarios + eval checklist). Do not implement the chatbot application in discovery.
