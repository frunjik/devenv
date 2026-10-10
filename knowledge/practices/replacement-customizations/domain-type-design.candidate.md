---
name: domain-type-design
description: "Only on explicit request or agreement: define, refine or review goal-oriented domain Types. Do not invoke merely because a coding task contains Types."
---

# Design Goal-Oriented Domain Types

## Invocation and authority

Invoke only when requested or agreed. Follow the replacement Must/Should/Could distinctions; this optional workflow does not reinstate the old mandatory checkpoints, naming gates or Glossary updates.

## Modeling workflow

1. Establish the system boundary, relevant domain, goals and observable outcomes.
2. Identify concepts needed to express those goals and behavior. Use concrete system examples and a contrasting case where useful; distinguish confirmed meaning from candidates.
3. Review missing/refinable Types, constraints, relationships and disproportionate complexity. Reuse existing Types; explain the benefit and cost before adding abstractions.
4. Connect the proposed Types to behavior and check that each goal can be expressed and evaluated. Discuss consequential domain names; keep unapproved names provisional without approval gates for local names.
5. Check that representations preserve meaning. Prefer explicit interfaces and Typed JSON for structured data, while retaining legitimate Markdown exceptions. Interfaces do not replace appropriate external-input runtime validation.

Report meaningful findings, alternatives and unresolved questions proportionally, not empty checklists. Glossary or broader vocabulary work is optional and requires request/agreement; do not silently adopt definitions, migrate data or expand implementation scope.

**Concrete instance:** `PracticeReviewDecision` represents an agreed classification separately from its within-category rank. A review identifier is not a priority.
