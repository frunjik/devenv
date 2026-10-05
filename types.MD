# Interfaces and types in ppt (shared declares none)

## Core, git, file-system, model-field and test-run types (moved from shared)

| Declaration | Kind | Source |
|---|---|---|
| `PPTType` | type | [core.ts:1](projects/ppt/src/lib/core.ts) |
| `PPTValue` | interface | [core.ts:3](projects/ppt/src/lib/core.ts) |
| `PPTField` | interface | [core.ts:9](projects/ppt/src/lib/core.ts) |
| `PPTModel` | interface | [core.ts:14](projects/ppt/src/lib/core.ts) |
| `PPTItem` | interface | [core.ts:20](projects/ppt/src/lib/core.ts) |
| `PPTList` | interface | [core.ts:25](projects/ppt/src/lib/core.ts) |
| `GitCommandResult` | interface | [git.ts:1](projects/ppt/src/lib/git.ts) |
| `GitCommitResult` | type alias | [git.ts:6](projects/ppt/src/lib/git.ts) |
| `GitLogEntry` | interface | [git.ts:8](projects/ppt/src/lib/git.ts) |
| `GitStatusFile` | interface | [git.ts:15](projects/ppt/src/lib/git.ts) |
| `GitStatus` | interface | [git.ts:26](projects/ppt/src/lib/git.ts) |
| `PPTFolderEntry` | interface | [file-system.ts:1](projects/ppt/src/lib/file-system.ts) |
| `FolderEntry` | type alias | [file-system.ts:6](projects/ppt/src/lib/file-system.ts) |
| `PPTFileStats` | interface | [file-system.ts:8](projects/ppt/src/lib/file-system.ts) |
| `PPTFS` | interface | [file-system.ts:12](projects/ppt/src/lib/file-system.ts) |
| `PPTTerm` | interface | [model-field.ts:2](projects/ppt/src/lib/model-field.ts) |
| `SuccessResponseBody<T>` | interface | [response.ts:1](projects/ppt/src/lib/response.ts) |
| `FailureResponseBody` | interface | [response.ts:5](projects/ppt/src/lib/response.ts) |
| `TestOutputStream` | type | [test-run.ts:1](projects/ppt/src/lib/test-run.ts) |
| `TestCommandEvent` | type | [test-run.ts:3](projects/ppt/src/lib/test-run.ts) |
| `LastTestRun` | interface | [test-run.ts:8](projects/ppt/src/lib/test-run.ts) |
| `TestRunCacheStatus` | interface | [test-run.ts:17](projects/ppt/src/lib/test-run.ts) |

## Feature, text model and response types

| Declaration | Kind | Source |
|---|---|---|
| `FeaturePriority` | type | [models.ts:6](projects/ppt/src/lib/models.ts) |
| `PPTFeatureStatus` | type | [models.ts:8](projects/ppt/src/lib/models.ts) |
| `PPTFeature` | interface | [models.ts:10](projects/ppt/src/lib/models.ts) |
| `PPTTextModel` | interface | [models.ts:6](projects/ppt/src/lib/models.ts) |
| `PPTTextComponentModel` | interface | [models.ts:12](projects/ppt/src/lib/models.ts) |
| `SuccessResponseBody<T>` | interface | [response.ts:1](projects/ppt/src/lib/response.ts) |
| `FailureResponseBody` | interface | [response.ts:5](projects/ppt/src/lib/response.ts) |

All types are declared in the ppt project; the shared project only imports them from ppt (type-only) and keeps the file-system service and pptFields.
