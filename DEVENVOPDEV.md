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
- [In progress] put the new feature form in a new tab in the existing sheet and place it last <!-- feature-id:b793074b-c6b8-4039-84f5-56681c2903fa -->
- [In progress] when starting a feature add it to the bottom of the in progress list in DEVENVOPDEV.md <!-- feature-id:917d8577-ebbd-46e7-8457-32c7e4845403 -->
- [In progress] add move up and down buttons to lower and higher the priority of items in the in progress list <!-- feature-id:69240ff3-3f25-46b8-a9ca-d74b6cbe9dea -->
- [In progress] create a priority scale mapping to number from 1 to 10 where the lower the number the higher the priority <!-- feature-id:a9098ae5-cfc0-477d-9c0b-b90f6afa42b0 -->
- [In progress] Consolidate duplicated API response and domain types in the shared library <!-- feature-id:549019fb-fea8-4735-94cd-5d23418b3cec -->
- [Backlog] Preserve filesystem API failures as errors instead of returning empty success values from BackendService <!-- feature-id:f05a3223-fa50-4f17-9232-e2fb2678d3fe -->
- [In progress] Update README and WORKSPACE documentation to match the current Angular and Jest workflows <!-- feature-id:3776c3fd-ce89-4054-8eda-43850b0f52d1 -->
- [Backlog] Replace positional createApp configuration parameters with a typed options object <!-- feature-id:e4e7f8ab-1a29-412c-ab22-bb2a5f0691d1 -->
