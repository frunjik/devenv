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
- [In progress] The requested lanes are Committed, In progress, and Done. Should cards be movable between lanes, and should moving a card update its feature status? A: Yes <!-- feature-id:8a0a1061-9ef3-48ec-94c8-b384d84bbabc -->
- [In progress] move the features in the progress list on the client in the first tab and the open in the second <!-- feature-id:5323a7c0-42da-4dd7-b044-16aac43a0051 -->
- [In progress] Should the numeric 1-10 score replace High/Medium/Low or rank features independently, and what score/default should each existing priority receive? <!-- feature-id:a9098ae5-cfc0-477d-9c0b-b90f6afa42b0 -->
- [In progress] replace the up down buttons in the in progress view with icons <!-- feature-id:c46bd579-4216-46ec-aa1c-51d8753e27d7 -->
- [In progress] make a client display of the shared models in the code <!-- feature-id:e3cdd907-5202-4055-ad96-abad7f3790b8 -->
- [In progress] How should the client enumerate models from @shared (runtime registry, authored metadata, or source scan), and where should the view live? TypeScript model types are erased at runtime. A: this is where the existing PPT models come into play, can we for start show the textual representation of the models on the client ? <!-- feature-id:57db25d7-bf49-4f35-85ac-6f7e362c694b -->
- [In progress] add commited state to feature <!-- feature-id:94aa6582-e140-4587-96ac-248ee1c641fc -->
- [In progress] disable the start feature button if the feature is already started <!-- feature-id:fd20456a-aebf-4ed8-829a-dd9d7fe1eb03 -->
