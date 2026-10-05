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
- [In progress] move questions with features from the ./DEVENVOPDEV.md file to the ./features file converting them to the correct format <!-- feature-id:250329d6-57f9-4e5d-ac72-a39f3626bed4 -->
- [In progress] make a server endpoint to retrieve the current uncommited code <!-- feature-id:9587581b-df62-4ba7-a0e5-45167be22a1d -->
- [Questions] Define the shared PPTValue model interface <!-- feature-id:1a61a983-122f-419e-92d4-647354a18744 -->
- [Questions] Define the shared PPTField model interface <!-- feature-id:3b0101b5-4272-4a65-a1fb-ce477686bef7 -->
- [Questions] Define the shared PPTModel model interface <!-- feature-id:9cef3a41-c2dc-464b-90dd-d300a3bbf09b -->
- [Questions] Define the shared PPTItem model interface <!-- feature-id:dde43d1c-2fb8-458c-b9c8-13128b41572d -->
- [Questions] Define the shared PPTList model interface <!-- feature-id:c740dc00-3b2e-4035-ab8a-d168f752bb23 -->
- [Questions] Define the shared PPTTextModel model interface <!-- feature-id:be028999-5aac-4f75-a137-c724fbe1605d -->
- [Questions] Define the shared PPTTextComponentModel model interface <!-- feature-id:e9822df5-b322-4d46-bf58-02179a2b8107 -->
- [Questions] Define a typed feature record model for FeatureRow <!-- feature-id:c870ba7a-bfdb-4ca2-afbe-2e4571fc0c9c -->
- [Questions] Define shared feature-priority and feature-status model types <!-- feature-id:50392b03-57e8-4a39-936b-eb5387488922 -->
- [Questions] Define the ActiveFeature model interface <!-- feature-id:237363db-c581-4b79-8158-9333a67fee2c -->
- [Questions] Define the GitCommitResult model interface <!-- feature-id:4bc0c832-29b7-4f07-a43d-dd70ba983d91 -->
- [Questions] Define the GitLogEntry model interface <!-- feature-id:b983e52d-d925-460e-8ea1-18e22aa46498 -->
- [Questions] Define the GitStatusFile model interface <!-- feature-id:860966cd-47a6-4b2a-ac9d-9096247728c8 -->
- [Questions] Define the GitStatus model interface <!-- feature-id:3d1e723a-f5ec-4a17-89c9-56d9bc66b0c8 -->
- [Questions] Define the LastTestRun model interface <!-- feature-id:69958df2-ba40-442a-a4ad-88934910e0db -->
- [Questions] Define the TestRunCacheStatus model interface <!-- feature-id:64928354-6e57-412a-9935-c26dd6eb1a22 -->
- [Questions] Define the current TestRunResult model interface <!-- feature-id:206fdb0b-8a04-4b3f-ac53-b3599ef8da05 -->
- [Questions] Define a typed TestCommandEvent model <!-- feature-id:6e3cbd5b-5446-4e0f-9a4e-b7e17d56d6e7 -->
- [Questions] Unify FolderEntry and PPTFolderEntry models <!-- feature-id:a02aaf39-c72b-4e4c-9dd8-469c89efe57e -->
- [Questions] Define the shared SuccessResponseBody model interface <!-- feature-id:8ab4b101-3f90-4685-b661-72b0498da5cb -->
- [Questions] Define the shared FailureResponseBody model interface <!-- feature-id:aa72b943-3e95-4ad3-946b-7bb94e8380ee -->
- [Questions] Define the AuthenticatedPrincipal model interface <!-- feature-id:6c78b785-cb3d-446b-9189-34f4046a1056 -->
- [Questions] Define the PPTFileStats model interface <!-- feature-id:8364dbb5-19b2-4466-b5bf-e736a3ffad86 -->
- [Questions] add feature category <!-- feature-id:ef3b9d44-3a01-4e24-b28c-befe465095ee -->
