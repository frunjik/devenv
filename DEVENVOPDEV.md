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
- [In progress] Which status should be verified, and what should verification do? The request does not identify a target surface or success criteria. A: what are our current status codes ? <!-- feature-id:3a4da084-57bd-4d06-bc9c-c88edb8b23b3 -->
- [In progress] Should a JSON feature record include commit-state metadata, and should that be a committed flag, a commit hash, or both? A: both <!-- feature-id:9c8a43de-f7bb-425a-b148-8e0dbd909c35 -->
- [In progress] [AI-generated question] Which entities and field metadata are required (types, optionality, validation, relations, defaults), and what runtime or persistence behavior should the structure provide? A: Merge with topic @ModelField <!-- feature-id:1e4eda64-32f3-4564-9ca0-8916c8935a3c -->
- [In progress] What entities and field metadata should the Model/Field structure represent, and should it be runtime schema, persisted data, or documentation only? A: Model / Field are meta models that describe domain Models add them as empty interfaces to @shared <!-- feature-id:79c6f131-4386-42f2-b10c-c0bebf27a563 -->
- [In progress] Should a completed JSON feature record include the client or server version it was completed against? A: Yes <!-- feature-id:45fa7646-916d-4e39-8649-6477254486f8 -->
- [In progress] What sources and domains count as "all terms," and where should the glossary be presented? The request does not define its scope, format, or audience. A: Merge with @Glossary features the Glossary is a list of all Terms used in the system. <!-- feature-id:3076fb2b-198a-49e8-bd89-475f2651ba61 -->
- [In progress] Should the server glossary be a read-only or editable API, and what fields, persistence format, and client access are required? The request only specifies a list maintained on the server. A: Editable API persistence in JSON start with a Term and short Description as Fields for the Glossary Model <!-- feature-id:951c879c-a2bb-48bc-b30b-8bde89535e39 -->
- [In progress] add waiting for input status merge with @Questions <!-- feature-id:497829fe-e624-48d7-8a88-b29c135d368f -->
- [In progress] we need to display the current task in a better way then in the toolbar <!-- feature-id:cca73db4-75bd-4015-81c9-3711028a04dc -->
- [In progress] Should a JSON feature record include a category field, and should it be required with client and server as its allowed values? A: yes <!-- feature-id:db79327c-2817-4476-80f2-089d7cd004e0 -->
- [In progress] Should a JSON feature record include a numeric urgency field in addition to its High, Medium, or Low priority? A: the Hight, Medium and Low labels are derived from the urgency field. <!-- feature-id:c1643ad0-c69a-43e2-87d4-0568f14067e8 -->
- [In progress] Clarify where uncommitted file contents should appear and whether full working-tree contents are needed for all changed files, including deleted, binary, and renamed files, rather than diffs in Git log. A: only diffs in git log <!-- feature-id:2629d3f8-23fb-48d1-afe2-20ffcd5ac96d -->
- [In progress] What feature status should be verified, at which workflow stage, and what outcome should verification produce? A: merge with features that have @Workflow <!-- feature-id:70a55484-e7a4-4e13-a4ff-7a53ffa5d8f4 -->
- [In progress] Clarify whether this should document the Open tab's ID, priority, status, description, and actions, or change the UI; specify where the description should appear. A: what do you mean with 'this' ? <!-- feature-id:9af332fe-e6a1-4926-af46-982a3c957c50 -->
- [In progress] make a display of features that are in progress to the right side of the input form <!-- feature-id:00d2fcfe-4386-4b35-8f02-2176423c3acc -->
