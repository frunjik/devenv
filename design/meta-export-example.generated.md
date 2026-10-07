# MetaExport: Generated KnowledgeStatements

Derived from JSON. All revisions are preserved; inclusion does not imply current applicability or recipient adoption.

## commit\-verification

### Revision 1

**Assertion:** Verify the bounded scope before claiming it is ready to commit; report failed or blocked checks rather than presenting them as passing\.

**Context:** DevEnv commit preparation\. Production verification includes TDD, public\-interface tests at 100% coverage on all four metrics, Type review, and TypeScript\-aware checks for TypeScript changes\. Documentation\-only work needs no code tests/builds unless documentation tests apply\. These dependencies are summarized, not fully exported here\.

**Source:** Derived summary of P\-001 through P\-005 and Commit Process, reviewed at frunjik/devenv revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415; source principles record user instructions\. This JSON is a working\-tree modeling example on 2026\-10\-07\.

**Applicability:** Current in the source project at the reviewed revision; this export does not authorize recipient adoption\.

## commit\-initiation

### Revision 1

**Assertion:** Once the verification prerequisites are satisfied, initiate a commit for the completed scope at a stable checkpoint\.

**Context:** The automatic\-initiation part of the original P\-005 instruction\. Verification and message approval are separate requirements\.

**Source:** Derived from P\-005, originally recorded as a user instruction on 2026\-10\-05; preserved as an original rule at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\.

**Applicability:** Historical only: the initiation requirement was replaced by commit\-initiation revision 2 on 2026\-10\-07\. Original agreement does not make it currently applicable\.

### Revision 2

**Assertion:** Leave changes uncommitted unless the user explicitly requests a commit\.

**Context:** DevEnv commits\. Replaces only automatic initiation, not verification or message approval\.

**Source:** User instruction on 2026\-10\-07, recorded in the P\-005 commit\-initiation override; source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\. Conversation summarized, not attached\.

**Applicability:** Current in the source project at the reviewed revision, replacing commit\-initiation revision 1\. Recipient adoption remains a separate decision\.

## commit\-approval\-prompt

### Revision 1

**Assertion:** Do not initiate a commit\-approval prompt merely because work is ready\.

**Context:** A user commit request permits preparation; readiness by itself does not\.

**Source:** User override recorded in P\-005 on 2026\-10\-07, reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\.

**Applicability:** Current in the source project at the reviewed revision\.

## commit\-message\-approval

### Revision 1

**Assertion:** Present the proposed commit message for user approval before executing the reviewed commit\.

**Context:** Every DevEnv commit\. An explicit commit request is not approval of an unseen message\. Approval concerns the reviewed scope and particular message, not future commits\.

**Source:** P\-005 message approval, user instruction recorded on 2026\-10\-06; Commit Process clarifies scope\. Reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\.

**Applicability:** Current in the source project; unaffected by the initiation or attribution changes\.

## commit\-abort

### Revision 1

**Assertion:** An abort stops the requested commit; its earlier request is not continuing permission to execute\.

**Context:** A fresh request may restart preparation, but the particular message still requires approval\.

**Source:** Derived from the conversation sequence summarized in Commit Process's documentation\-commit trial on 2026\-10\-07; reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\. Git alone does not prove the authorization sequence\.

**Applicability:** Current source\-process interpretation; not an authorization for any particular execution\.

## commit\-scope

### Revision 1

**Assertion:** Commit only the reviewed scope\.

**Context:** DevEnv commits after explicit request and message approval\.

**Source:** P\-005 scope requirement and Commit Process, reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\.

**Applicability:** Current in the source project at the reviewed revision\.

## commit\-unrelated\-work

### Revision 1

**Assertion:** Preserve unrelated work rather than discarding it or including it in the reviewed commit\.

**Context:** A worktree may contain changes belonging to other scopes\.

**Source:** Commit Process current procedure, reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415; derived description, not a separate user decision\.

**Applicability:** Current source\-process instruction\.

## commit\-concern\-prefix

### Revision 1

**Assertion:** Use SystemConcern\-NNN: for concern\-focused commit subjects\.

**Context:** DevEnv local naming preference, preserving the three\-digit concern number\. SC\-NNN is the register identifier\. Ordinary commits need no concern prefix\. The name SystemConcern is used across Domains and MetaLayers, not just one Domain\.

**Source:** P\-011 standing preference and 2026\-10\-07 clarification, with Commit Process and MetaExport context; reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\.

**Applicability:** Current local preference; not a universal convention for the receiving project\.

## commit\-attribution

### Revision 1

**Assertion:** Include the Copilot Co\-authored\-by trailer unless the user explicitly waives it\.

**Context:** Earlier execution requirement; not a user\-authored project principle\.

**Source:** Historical requirement summarized in Commit Process and P\-011's attribution override at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\. Original execution instruction is not attached\.

**Applicability:** Historical for this project: the user established a standing waiver on 2026\-10\-07, represented by commit\-attribution revision 2\.

### Revision 2

**Assertion:** Omit the Copilot Co\-authored\-by trailer until the user says otherwise\.

**Context:** DevEnv commits, including code or documentation assistance\. This changes attribution only, not initiation, approval, or verification\.

**Source:** User preference and request to preserve it on 2026\-10\-07, recorded in P\-011; source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415\. Conversation summarized, not attached\.

**Applicability:** Current in the source project at the reviewed revision, replacing commit\-attribution revision 1\. No hypothetical restoration is represented as a current instruction\.

## commit\-execution\-report

### Revision 1

**Assertion:** Verify the resulting commit and report execution failures and remaining worktree changes accurately\.

**Context:** After attempting the approved commit\. A successful commit does not imply a clean worktree when unrelated changes remain\.

**Source:** Commit Process current procedure, reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415; derived description\.

**Applicability:** Current source\-process instruction\.

## commit\-outcome\-acceptance

### Revision 1

**Assertion:** A successful commit does not establish user acceptance of the concern's outcome\.

**Context:** Execution success, message approval, and outcome acceptance are distinct\.

**Source:** Commit Process meaning and current procedure, reviewed at source revision 49a2fa8dff503a8029e7b28c9b863e19b50a6415; derived interpretation, not an acceptance decision\.

**Applicability:** Current source\-process interpretation\.
