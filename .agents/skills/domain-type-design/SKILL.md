---
name: domain-type-design
description: Define and verify domain types that describe a system and how it achieves its goals.
---

# Design Goal-Oriented Domain Types

## Trigger
- Execute this skill whenever the user says "define" or "refine" or "review types".

## Context & Prerequisites
- Establish the system boundary, relevant domain, and the goals the system must achieve.
- Make sure each goal describes a desired outcome and, where possible, how its achievement will be recognized.
- Use the Glossary to explain terms that have specific meanings in this domain or system.

## Workflow Steps
1. Identify the goals and the observable outcomes or conditions that would demonstrate each goal is met.
2. Identify the domain concepts needed to describe the system achieving those goals. Depending on the system, these may include actors, parts, resources, relationships, interactions, states, events, and constraints; include only concepts needed to express its goals and behavior.
3. Define each required type by its meaning, relevant properties, relationships, and applicable rules or invariants. Distinguish types from individual instances and avoid duplicate or vague types.
4. Connect the types and their relationships to the system behavior that contributes to each goal. Ensure every goal can be expressed and checked using the model, and remove types that do not help describe the system or its goals.
5. Add or refine Glossary entries for the goal and domain terms used, keeping their meanings consistent throughout the model.

## Success Criteria
- The types form a coherent description of the system within its stated boundary.
- Each goal can be related to system behavior and evaluated against observable outcomes or conditions.
- The model includes the concepts and rules needed to express that behavior without unrelated or redundant types.
- Goal and domain terms have clear, consistent Glossary definitions.
