# Diagrams

## AI Team flow

```mermaid
flowchart TB
  H[Human / Product Owner]
  D[Product + Engineering Docs]
  S[Spec Contract]
  CP[Control Plane<br/>State / Team / Policies]
  M[Manager]
  I[Implementor]
  R[Reviewer]
  GH[GitHub]
  E[Evidence + Gates]
  F[Final Review]
  MER[Merge]

  H --> D --> S --> CP
  CP --> M
  CP --> I
  CP --> R
  M & I & R --> GH --> E
  E -->|pass| F --> MER
  E -->|fail| CP
```

## Three planes

```mermaid
flowchart TB
  AUTH[Authority Plane<br/>control-plane repo]
  CTRL[Control Plane<br/>engine]
  EXEC[Execution Plane<br/>agent-runtime]
  GH[GitHub]

  AUTH -->|contracts| CTRL
  CTRL -->|context + policy| EXEC
  EXEC -->|PRs / checks| GH
  CTRL -->|issues / labels / state| GH
  GH -->|webhooks / events| CTRL
```

## Docs-first cascade

```mermaid
flowchart TD
  I[Idea] --> D[Product docs]
  D --> P[PRD]
  P --> A[Architecture / ADRs]
  A --> S[Specs]
  S --> AC[Acceptance criteria]
  AC --> H[Human approval]
  H --> PL[Implementation plan]
  PL --> TG[Task graph]
  TG --> AG[AI Team]
```

## Model escalation

```mermaid
flowchart TD
  T[Task] --> T1[Tier 1]
  T1 -->|pass| C[Continue]
  T1 -->|fail| T2[Tier 2]
  T2 -->|pass| C
  T2 -->|fail| T3[Tier 3 / specialist]
  T3 -->|pass| C
  T3 -->|fail| H[Human required]
```

## Review separation

```mermaid
flowchart LR
  IMP[Implementer] --> CODE[Implementation PR]
  CODE --> REV[Reviewer]
  REV -->|accept| FR[Final review]
  FR --> DONE[Done / Merge]
  REV -->|reject| FB[Feedback]
  FB --> IMP
```

Source files for mermaid live alongside architecture docs; render in GitHub or compatible viewers.
