# Portable Topic Commit Process

Generated from [portable-commit-process.json](./portable-commit-process.json). Edit JSON, not this view.

**Status:** Saved proposal; not activated in DevEnv

Interface: [CommitProcessConfiguration](./portable-commit-process.types.ts).

## Configuration

- **branchNamespace:** topic
- **topicIdPattern:** ^[0-9]+$
- **descriptionPattern:** ^[a-z0-9]+(?:-[a-z0-9]+)*$
- **branchTemplate:** {namespace}/{id}_{description}
- **idSource:** ask-user
- **newBranchBase:** project-policy-or-ask
- **commitInitiation:** explicit-request
- **messageApproval:** true
- **messageStyle:** short-subject-no-topic-prefix
- **attribution:** omit-automated-coauthors
- **remote:** origin
- **pushApproval:** separate-each-time

## Procedure

1. Inspect the current branch and worktree before starting. Branch names are lowercase; extract the variable-length numeric topic ID and preserve it exactly, without padding or truncation.
2. Reuse an existing matching topic branch. If it belongs to another topic, ask whether to continue that topic or switch; continuing defers the new topic. Resolve ownership of uncommitted changes before switching; never discard or silently transfer unrelated work.
3. For a new branch, ask for the assigned ID and lowercase hyphenated description. Use the receiving project's specified base or ask for a base branch or commit. Never allocate IDs or assume main or the current branch as the base. Ask about malformed names, ambiguity, or an existing destination branch instead of guessing or overwriting.
4. Make bounded changes and run the receiving project's required checks. Report failures and verification gaps. Keep incremental commits; do not squash, amend, or rewrite history automatically.
5. Prepare a commit only after an explicit request. Inspect and select the intended changes; present the exact short contribution-specific message without a topic prefix. Obtain message approval and commit only that scope and message. Cancellation stops the commit and requires a fresh request to restart.
6. Verify the resulting commit and remaining worktree changes. Readiness, commit authorization, and successful execution are separate; none establishes acceptance of the delivered behavior.
7. Topic work must be published to the external repository. Confirm the configured remote's intended destination, request separate approval for each push, establish upstream tracking when needed, and verify publication. If approval is withheld or pushing fails, report the work as locally committed but unpublished. Do not force-push by default.
8. Hand off completed, verified, published topic work to the merge pipeline. The pipeline owns the merge destination and squashing. Commit or push approval does not authorize merging, deleting branches, or rewriting history.

## Interactive setup

1. Run as a guided interview in the receiving system, asking one question at a time. Begin in dry-run mode; no writes or Git mutations. Inspect existing project conventions read-only only with permission, or ask the user to supply them.
2. Explain that branch identity replaces a commit prefix and that the merge pipeline owns integration. Do not ask for an integration branch; confirm the project-policy-or-ask rule for new-branch bases.
3. Confirm the branch namespace, numeric ID convention, lowercase description convention, and template. Ask how assigned IDs are obtained; do not allocate one during setup.
4. Confirm commit initiation, exact-message approval, subject style, and attribution policy individually. Offer the saved values as suggestions, not silently imposed rules.
5. Confirm the external remote and its destination. Confirm separate approval for every push. Repository inspection is not permission to publish content.
6. Show the complete proposed settings and simulate matching-branch reuse, new-branch creation, a different-topic branch with dirty work, malformed names, commit cancellation, and approved publication without executing them.
7. Ask approval before saving configuration as Typed JSON with an explicit interface and generated Markdown. Ask separately before activating it or replacing receiving-project instructions. Resolve conflicts with existing policies rather than silently overriding them.

## Examples and dry runs

1. Illustrative only: ID 123456 produces branch topic/123456_add-export and message exclude review resources from export. The ID is not allocated by this example.
2. An existing topic/123456_existing-work branch identifies ID 123456. Choosing to continue it defers a newly requested topic.
3. Dry run observed: after continuing the existing illustrative topic, the user requested a simulated commit and cancelled at message approval. Expected result: neither commit nor push, and a fresh request is needed.
4. A successful publication scenario remains illustrative, not executed: approve the message, verify the local commit, obtain separate push approval, push to the confirmed origin branch, then verify upstream publication.

## Boundaries

1. No integration-branch setting or topic-prefix mapping is required. Validation commands remain in receiving-project guidance.
2. This record carries no concern register, MetaExport schema, historical approval transcript, or universal coverage threshold.
3. An explicit TypeScript interface checks the saved JSON structure at compile time; it does not validate runtime input or enforce Git behavior.
4. Persisting this proposal does not activate it, create a branch, push content, change DevEnv's current commit conventions, or authorize a commit.

## Type check

```powershell
npx.cmd tsc --noEmit --strict --skipLibCheck --resolveJsonModule --esModuleInterop --module commonjs --target ES2022 knowledge\practices\portable-commit-process.types.ts
```

## Regenerate

Run from the repository root in PowerShell; overwrites only this generated view.

```powershell
@'
const fs=require('node:fs');
const p=JSON.parse(fs.readFileSync('knowledge\\practices\\portable-commit-process.json','utf8'));
const lines=['# '+p.title,'','Generated from [portable-commit-process.json](./portable-commit-process.json). Edit JSON, not this view.','','**Status:** '+p.status,'','Interface: [CommitProcessConfiguration](./portable-commit-process.types.ts).','','## Configuration',''];
for(const [key,value] of Object.entries(p.configuration)) lines.push('- **'+key+':** '+value);
for(const [key,title] of [['procedure','Procedure'],['interactiveSetup','Interactive setup'],['examples','Examples and dry runs'],['boundaries','Boundaries']]){lines.push('','## '+title,'');p[key].forEach((text,i)=>lines.push((i+1)+'. '+text));}
lines.push('','## Type check','','```powershell','npx.cmd tsc --noEmit --strict --skipLibCheck --resolveJsonModule --esModuleInterop --module commonjs --target ES2022 knowledge\\practices\\portable-commit-process.types.ts','```','');
fs.writeFileSync('knowledge\\practices\\portable-commit-process.generated.md',lines.join('\n'),'utf8');
'@ | node
```
