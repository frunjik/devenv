# Domain Design System: Exploration Notes

**Status:** Exploratory  
**Scope:** How to reason about the desired System during the current “what” phase, without committing to implementation.

## Current Boundary: What Before How

The current phase is about what the System should help people understand and express. Explore needs, concepts, meaning, relationships, constraints, evidence, and open questions. Record candidate Terms, Types, Contracts, and models as design artifacts; any notation is illustrative, not code or a committed schema.

Do not write application code, select technology, or turn a candidate strategy into an implementation plan during this phase. TDD, implementation architecture, storage formats, and frameworks belong to a later discussion about how to realize agreed needs.

Keep alternatives visible. Treat candidate outcomes as candidates until they have agreed, observable meanings. The aim is sufficient shared understanding to make future choices deliberately, not exhaustive specification.

## Possible Strategies to Evaluate Later

These are alternatives to evaluate against real needs, not a prescribed sequence:

- **Domain-first inquiry:** Work with representative users to understand purpose, boundary, stakeholders, current pain, vocabulary, and disagreements before generalizing.
- **Scenario- and example-first modeling:** Derive concepts and rules from concrete scenarios, including ambiguous and invalid cases.
- **Vertical-slice evaluation:** Trace one narrow but meaningful scenario—perhaps a Domain Definition involving a Goal and Acceptance Criterion—to see whether the concepts support the whole conceptual journey. This is an inquiry strategy, not a development plan.
- **Competing-model comparison:** Describe the same example Domain in different candidate approaches and compare clarity, expressiveness, assumptions, and tradeoffs.
- **Paper or narrative prototype:** Use sketches, example documents, and walkthroughs to examine concepts and diagnostics without writing software.
- **Prior-art study:** Compare Magritte, EMF, JSON Schema, CUE, SHACL, and OWL against concrete needs rather than assuming any one is a complete answer.

## Candidate Bootstrap Inquiry

Use the Domain involved in creating this System as an initial example for exploring the concepts the System may need to support. This is a possible inquiry strategy, not a chosen implementation plan or a decision that this example is the only or best starting point.

Keep these layers explicitly distinct:

- **System under exploration:** the possible Domain Design System whose purpose and needed concepts we are trying to understand.
- **Modeled Domain:** the particular area of knowledge we describe as an example—in this inquiry, the domain involved in recognizing and addressing the Problems that motivate creating the System.
- **Bootstrap activity:** our own use of notes, diagrams, examples, or other non-code artifacts to test whether the candidate concepts help describe that Modeled Domain.

Do not treat the System under exploration as the Modeled Domain itself. Label claims, examples, and open questions so it is clear which layer they concern.

Possible inquiry steps:

1. Bound the example Domain: focus on the context and Problems relevant to why this System is being considered, rather than attempting to model all of DevEnv or all software development.
2. Describe one concrete situation: who is affected, what was observed, what is interpretation, what causes are hypothesized, what outcome is desired, and what responses are being considered.
3. Trace the concepts needed to make that description useful: context, Problem framing, evidence, Goal, relevant Terms and Types, constraints, and unresolved questions.
4. Examine whether the description exposes assumptions, distinguishes evidence from interpretation, reveals missing concepts, and communicates the Problem and Goal more clearly.
5. Compare with a contrasting Domain later to see whether the concepts transfer or merely fit the bootstrap example.

The inquiry can use Domain-first, scenario-first, vertical-slice, competing-model, and paper/narrative strategies together. Its success is learning whether the concepts help people reason about a Domain—not completing a model, selecting an architecture, designing an interface, or writing application code.

## “Don't Write Features” as a Design Lens

Juval Löwy's *Righting Software* includes the chapter “There Is No Feature,” alongside guidance to avoid functional decomposition and to decompose systems around volatility. The useful question for this exploration is not whether users need features—users need capabilities and outcomes—but whether a feature list is being mistaken for a definition or structure of the System.

For the Domain Design System, “add a glossary page,” “add a type editor,” and “add a validation panel” describe possible product features or surfaces. On their own, they do not establish:

- what Domain-design problem those capabilities address;
- what coherent responsibility the System has;
- what concepts and Contracts the capabilities share;
- how those capabilities serve the same user outcomes; or
- which changes are likely to affect together and therefore belong together in a future design.

As a **what-phase** lens, this suggests:

- Describe desired outcomes, responsibilities, concepts, and Contracts before accumulating feature requests.
- Treat proposed features as evidence or hypotheses about needed capabilities; ask which problem and outcome each supports.
- Look for capabilities that form a coherent whole, rather than assuming each visible feature is an independent building block.
- Record likely sources of change and volatility as questions for later design; do not turn them into architecture or implementation decisions now.
- Keep room for user-visible capabilities: “no feature” should not be read as “no functionality,” but as a warning that feature enumeration alone is not system design.

This lens complements, rather than replaces, Problem-first inquiry and concrete scenarios. A feature request can reveal an unmet need, but needs investigation before being accepted as the need itself. A scenario can expose several required capabilities; a capability may support several outcomes.

This is a working interpretation to evaluate against the book's method and concrete examples, not a complete summary of Löwy's argument or a universal rule that features should never be discussed.

## Why “How” May Not Be Mere Detail

The focus on defining what a System must do is valuable, but there are counterarguments to treating how as irrelevant:

- **What and how constrain each other.** A desired capability may be infeasible, unsafe, too costly, or disproportionately complex under some approaches; exploring that can change the goal.
- **Quality attributes affect success.** Privacy, safety, reliability, accessibility, performance, recoverability, auditability, and changeability can be part of what stakeholders need.
- **The medium shapes experience.** A paper process, generic editor, and collaborative tool may enable different kinds of understanding and work.
- **Some needs are discovered through experience.** A prototype or concrete representation can help stakeholders articulate needs without committing to production implementation.
- **Operational consequences affect users.** Maintenance, failure recovery, migration, support, and cost can determine whether a System remains useful.
- **Validation needs conditions.** Observable outcomes require clarity about where, when, and under what conditions they must hold.
- **Tradeoffs shape success.** Flexibility may reduce simplicity; privacy may limit convenience. Acceptable losses and priorities are part of the desired outcome.

These points do not require choosing technology or writing code now. Keep desired outcomes, constraints on acceptable means, and questions requiring experiments distinct. Later evidence about how can revise understanding of what.

## Observations and Design Tensions

- A Domain Definition is both a model and an argument: it makes claims about what exists, matters, and relates. It may need to expose assumptions and disagreement.
- Problem framing is not neutral data entry. Whose experience matters and what evidence is relevant involve perspective.
- Problem, cause, Goal, and solution are different claims. Moving directly from a symptom to a Task can conceal unresolved disagreement.
- Problems may be refined, split, merged, disputed, or found unsupported; preserve context and rationale as understanding evolves.
- **Abstraction** can reveal reusable concepts, but is purpose-relative. Details omitted as inessential in one view may be critical in another.
- Useful abstractions remain traceable to examples, observations, and contexts. Similar cases should not be grouped in a way that silently erases meaningful variation.
- Meaning cannot be reduced to structure: a numeric Cost needs context such as currency, unit, time basis, and what is counted.
- Different users may hold legitimate perspectives; do not assume one universal vocabulary where contexts differ.
- Validation has levels: structural checks, domain rules, and evidence-based or human judgments should not be conflated.
- A model can be internally consistent and still be wrong or useless. Examples, stakeholder review, and outcome evidence matter.
- A meta-model can constrain discovery if it forces every concept into its existing constructs. Allow early ideas that do not yet fit.
- The System's own vocabulary must be distinguishable from the vocabulary of a Domain being described.
- Completeness is not usefulness; prioritize whether the model supports the decisions and outcomes that matter.

## Possible Exit Conditions for the Exploration Phase

The exploration may be ready to inform a separate “how” discussion when:

- intended users, purpose, and boundary are understood well enough to discuss;
- candidate outcomes and evidence of success are explicit;
- core Terms have working meanings, with ambiguity and context recorded;
- representative examples reveal important Types, relationships, rules, and exceptions;
- important Contracts, constraints, risks, and open questions are documented;
- possible strategies have been considered against the same needs;
- there is agreement on the next question to investigate, without assuming code must be written.

These conditions are guidance, not a demand for exhaustive certainty.

## References

- [*Righting Software* official site](https://rightingsoftware.org/) — describes the book's integrated approach to system and project design, including decomposition by volatility.
- [Publisher's book page and table of contents](https://www.informit.com/store/righting-software-9780136524038) — lists “Avoid Functional Decomposition,” “Volatility-Based Decomposition,” and “There Is No Feature.”
