# Interfaces and types in shared and ppt

## Shared

| Declaration | Kind | Source |
|---|---|---|
| `PPTType` | type | [core.ts:1](projects/shared/src/lib/core.ts) |
| `PPTValue` | interface | [core.ts:3](projects/shared/src/lib/core.ts) |
| `PPTField` | interface | [core.ts:9](projects/shared/src/lib/core.ts) |
| `PPTModel` | interface | [core.ts:14](projects/shared/src/lib/core.ts) |
| `PPTItem` | interface | [core.ts:20](projects/shared/src/lib/core.ts) |
| `PPTList` | interface | [core.ts:25](projects/shared/src/lib/core.ts) |
| `GitCommandResult` | interface | [git.ts:1](projects/shared/src/lib/models/git.ts) |
| `GitCommitResult` | type alias | [git.ts:6](projects/shared/src/lib/models/git.ts) |
| `GitLogEntry` | interface | [git.ts:8](projects/shared/src/lib/models/git.ts) |
| `GitStatusFile` | interface | [git.ts:15](projects/shared/src/lib/models/git.ts) |
| `GitStatus` | interface | [git.ts:26](projects/shared/src/lib/models/git.ts) |
| `PPTFolderEntry` | interface | [file-system.ts:1](projects/shared/src/lib/models/file-system.ts) |
| `FolderEntry` | type alias | [file-system.ts:6](projects/shared/src/lib/models/file-system.ts) |
| `PPTFileStats` | interface | [file-system.ts:8](projects/shared/src/lib/models/file-system.ts) |
| `PPTFS` | interface | [file-system.ts:12](projects/shared/src/lib/models/file-system.ts) |
| `PPTTerm` | interface | [model-field.ts:2](projects/shared/src/lib/models/model-field.ts) |
| `SuccessResponseBody<T>` | interface | [response.ts:1](projects/shared/src/lib/models/response.ts) |
| `FailureResponseBody` | interface | [response.ts:5](projects/shared/src/lib/models/response.ts) |
| `TestOutputStream` | type | [test-run.ts:1](projects/shared/src/lib/models/test-run.ts) |
| `TestCommandEvent` | type | [test-run.ts:3](projects/shared/src/lib/models/test-run.ts) |
| `LastTestRun` | interface | [test-run.ts:8](projects/shared/src/lib/models/test-run.ts) |
| `TestRunCacheStatus` | interface | [test-run.ts:17](projects/shared/src/lib/models/test-run.ts) |

## PPT

| Declaration | Kind | Source |
|---|---|---|
| `FeaturePriority` | type | [models.ts:6](projects/ppt/src/lib/models.ts) |
| `FeatureStatus` | type | [models.ts:8](projects/ppt/src/lib/models.ts) |
| `PPTFeature` | interface | [models.ts:10](projects/ppt/src/lib/models.ts) |
| `PPTTextModel` | interface | [models.ts:6](projects/ppt/src/lib/models.ts) |
| `PPTTextComponentModel` | interface | [models.ts:12](projects/ppt/src/lib/models.ts) |
| `SuccessResponseBody<T>` | interface | [response.ts:1](projects/ppt/src/lib/response.ts) |
| `FailureResponseBody` | interface | [response.ts:5](projects/ppt/src/lib/response.ts) |

The response interfaces are declared in both projects. The PPT [core.ts](projects/ppt/src/lib/core.ts) re-exports the PPT model types from shared rather than declaring them again.
