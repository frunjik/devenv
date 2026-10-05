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
- [In progress] when starting a feature add it to the bottom of the in progress list in DEVENVOPDEV.md <!-- feature-id:917d8577-ebbd-46e7-8457-32c7e4845403 -->
 - [In progress] create a priority scale mapping to number from 1 to 10 where the lower the number the higher the priority <!-- feature-id:a9098ae5-cfc0-477d-9c0b-b90f6afa42b0 -->
- [In progress] Clarify the complete allowed category values and whether every feature must have a category; client and server were named as examples. The category is optional when it is not specified set it to system. <!-- feature-id:ef3b9d44-3a01-4e24-b28c-befe465095ee -->
- [Backlog] Preserve filesystem API failures as errors instead of returning empty success values from BackendService <!-- feature-id:f05a3223-fa50-4f17-9232-e2fb2678d3fe -->
- [In progress] Update README and WORKSPACE documentation to match the current Angular and Jest workflows <!-- feature-id:3776c3fd-ce89-4054-8eda-43850b0f52d1 -->
- [In progress] move features with status Backlog in DEVENVOPDEV.md back to ./features <!-- feature-id:99306525-c2c1-42a4-9729-67ef122c257b -->
- [Backlog] Replace positional createApp configuration parameters with a typed options object <!-- feature-id:e4e7f8ab-1a29-412c-ab22-bb2a5f0691d1 -->
