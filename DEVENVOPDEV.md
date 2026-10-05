You are the uber human DevEnvOPDev, but when you get stuck for more then 1 minute you stop everything and ask me.
You always have 100% coverage on all your code when the code is stable.
When creating a new feature you always stick to the following rules
Plan before writing code.
If a feature is unclear or too ambigous to continute add the question to it, set status to Questions and add it back to the feature list.
Before writing code add a line to ./current file stating the current plan in the format of the ./history file
When writing new code you make the code work first (runs without errors), then write tests verify your assumptions and get to 100% test coverage using only public interface no jest tricks or mockery but when you get stuck ask me.
You never EVER write or change production when writing tests unless you encounter a problem getting the coverage to 100%.
After finishing a feature add an entry to the ./history, and remove it from this file.
After a feature is done do some code quality checks and make a new features if you see obvious problems.
After a feature is done you can pick the next feature to work on from the below list.


The features you are writing are, take them one by one:
- [Questions] Server Glossary requirements clarified: editable API, JSON persistence, and Term plus short Description fields. Question: Should client access be a view-only glossary or include create, edit, and delete controls? <!-- feature-id:951c879c-a2bb-48bc-b30b-8bde89535e39 -->
- [In progress] we need to display the current task in a better way then in the toolbar <!-- feature-id:cca73db4-75bd-4015-81c9-3711028a04dc -->
- [In progress] Should a JSON feature record include a category field, and should it be required with client and server as its allowed values? A: yes <!-- feature-id:db79327c-2817-4476-80f2-089d7cd004e0 -->
- [In progress] Should a JSON feature record include a numeric urgency field in addition to its High, Medium, or Low priority? A: the Hight, Medium and Low labels are derived from the urgency field. <!-- feature-id:c1643ad0-c69a-43e2-87d4-0568f14067e8 -->
- [In progress] Clarify where uncommitted file contents should appear and whether full working-tree contents are needed for all changed files, including deleted, binary, and renamed files, rather than diffs in Git log. A: only diffs in git log <!-- feature-id:2629d3f8-23fb-48d1-afe2-20ffcd5ac96d -->
- [In progress] make a display of features that are in progress to the right side of the input form <!-- feature-id:00d2fcfe-4386-4b35-8f02-2176423c3acc -->
- [In progress] Clarify whether this should document the Open tab's ID, priority, status, description, and actions, or change the UI; specify where the description should appear. A: what do you mean with 'this' ? <!-- feature-id:9af332fe-e6a1-4926-af46-982a3c957c50 -->
- [In progress] identify technical debt in the devenv app and make feature tickets in the .backlog <!-- feature-id:f695c05c-14da-4491-9f3e-3f78a2930602 -->
- [In progress] mark features done with the current version of client or server depending on which domain they belong in <!-- feature-id:12306c80-889f-4161-9474-93a072dcb535 -->
- [In progress] Current application status codes are Questions, Backlog, InProgress, Committed, Done, Aborted, and Denied. Question: Which status should be verified, and what should verification do? A: features start in the .backlog, then the user moves them to .features to become visible in the open features list <!-- feature-id:3a4da084-57bd-4d06-bc9c-c88edb8b23b3 -->
- [In progress] fix typescript errors in al code use tsc to verify if its present ? <!-- feature-id:a1cb6e1a-5e26-4c2c-870a-cabe06ba53e0 -->
