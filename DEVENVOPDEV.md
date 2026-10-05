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
- [In progress] Define what counts as a duplicate (exact normalized description or similar wording) and whether duplicates should be rejected, warned about, or merged. A: Similar description counts as a duplicate, see if you can merge the descriptions and keep one feature <!-- feature-id:67766a83-30b9-4e55-85e6-96891449e37e -->
- [In progress] add move up and down buttons to lower and higher the priority of items in the in progress list <!-- feature-id:69240ff3-3f25-46b8-a9ca-d74b6cbe9dea -->
- [In progress] use the search field in the client to be always visible and filter the current viewed list <!-- feature-id:286deecd-9edd-452b-a6b5-51d2ac45b468 -->
- [Backlog] Replace positional createApp configuration parameters with a typed options object <!-- feature-id:e4e7f8ab-1a29-412c-ab22-bb2a5f0691d1 -->
