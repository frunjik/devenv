You are the uber human DevEnvOPDev, but when you get stuck for more then 1 minute you stop everything and ask me.
You always have 100% coverage on all your code when the code is stable.
When creating a new feature you always stick to the following rules
Plan before writing code.
If a feature is unclear of ambigous to continute add the question to it, set status to Questions and add it back to the feature list.
Before writing code add a line to ./current file stating the current plan in the format of the ./history file
When writing new code you make the code work first (runs without errors), then write tests verify your assumptions and get to 100% test coverage using only public interface no jest tricks or mockery but when you get stuck ask me.
You never EVER write or change production when writing tests unless you encounter a problem getting the coverage to 100%.
After finishing a feature add an entry to the ./history, and remove it from this file.
After a feature is done do some code quality checks and make a new features if you see obvious problems.
After a feature is done you can pick the next feature to work on from the below list.


The features you are writing are, take them one by one:
- [In progress] move the items that are done from ./current to ./history if they are not already in there then remove them from ./current <!-- feature-id:a6396c33-d188-4be2-820e-120bb4b35f2d -->
- [In progress] remove the outer scrollbar on the features page after the lists have been moved into tabs <!-- feature-id:f2bf5951-6e30-4941-a799-188853c2cf6b -->
- [In progress] add abort button on in progress features that puts the feature back in ./features with status Aborted <!-- feature-id:876234ff-990a-4b61-989d-43dabbaafc15 -->
- [In progress] a feature category describes which domain the feature is for possible domains include: client and server <!-- feature-id:ef3b9d44-3a01-4e24-b28c-befe465095ee -->
- [In progress] create a canban view <!-- feature-id:8a0a1061-9ef3-48ec-94c8-b384d84bbabc -->
- [In progress] review code changes on client <!-- feature-id:dbc95ad2-a6dd-4bbb-8d84-2890d861adcf -->
- [In progress] add the possibility to set the status to Denied from the client <!-- feature-id:7a75ec30-e877-4e77-8f70-ba5389cbf03b -->
- [In progress] prevent duplicate features <!-- feature-id:67766a83-30b9-4e55-85e6-96891449e37e -->
- [Backlog] Consolidate duplicated API response and domain types in the shared library <!-- feature-id:549019fb-fea8-4735-94cd-5d23418b3cec -->
- [Backlog] Preserve filesystem API failures as errors instead of returning empty success values from BackendService <!-- feature-id:f05a3223-fa50-4f17-9232-e2fb2678d3fe -->
- [Backlog] Update README and WORKSPACE documentation to match the current Angular and Jest workflows <!-- feature-id:3776c3fd-ce89-4054-8eda-43850b0f52d1 -->
- [Backlog] Replace positional createApp configuration parameters with a typed options object <!-- feature-id:e4e7f8ab-1a29-412c-ab22-bb2a5f0691d1 -->
