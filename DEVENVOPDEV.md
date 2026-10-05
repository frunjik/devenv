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
- [In progress] keep a version number for the client and server code <!-- feature-id:d7b7b5aa-e0cf-4dac-8651-c7b765f226be -->
- [In progress] Should application features use a Delivered terminal status and move records from a current-features store to a delivered-features store, or is the existing Done status and retained completed-feature list the requested behavior? The repository currently has no .delivered file, and .current is a workflow plan log. A: the ./.delivered file is created move features to it when you are finished working on them adding a the date and time they were finished <!-- feature-id:85dabfd0-abf4-4a5c-80f7-d0bb981b4a04 -->
