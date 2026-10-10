# Problem/Domain versus Meta/DevEnv time evidence

Generated from the report JSON snapshot. Regenerate; do not edit this view.

## What can be concluded

Human active effort: **unknown**. Waiting time: **unknown**. Agent/tool execution time: **unknown**.
The table below describes the union of recorded evaluation delivery windows, not hours worked or the entire repository history.
Same-category overlaps count once. Windows containing multiple categories are kept in Cross-category overlap, not assigned to either category.
Mixed means inseparable outcomes; Unclassified means insufficient classification evidence. Gaps and incomplete intervals are excluded, not treated as zero effort.
Percentages use only the recorded window union as denominator; they are not proportions of all work.

Durations use hours:minutes:seconds, rounded to the nearest second. The Problem + Meta subtotal excludes Mixed, Unclassified and Cross-category overlap; the total includes all five categories. Subtotal and total rows summarize the categories and must not be added to them.

| Window category | Duration (h:mm:ss) | Minutes | Share of observed union |
|---|---:|---:|---:|
| Problem/Domain | 3:05:08 | 185.13 | 50.95% |
| Meta/DevEnv | 2:33:47 | 153.78 | 42.32% |
| Mixed | 0:05:30 | 5.50 | 1.51% |
| Unclassified | 0:04:03 | 4.04 | 1.11% |
| Cross-category overlap | 0:14:54 | 14.90 | 4.10% |
| Problem + Meta subtotal | 5:38:55 | 338.92 | 93.27% |
| Total observed union | 6:03:22 | 363.36 | 100.00% |

Evaluations reviewed: 48. Complete intervals: 40.
Unfinished or untimed evaluations: 8.
Reachable commits inventoried: 707; all commit durations and outcome classifications remain unknown.

## Evaluation evidence

Source: [evaluation ledger](./devenv-value-evaluation.json). IDs identify exact records; the JSON snapshot retains original timestamps, outcomes and metric evidence.
Individual elapsed values below overlap and must not be summed.

| Evaluation | Category | Elapsed minutes (not effort) | Classification rationale |
|---|---|---:|---|
| self-cloning-agent-guide-package: Package the exported Guide so it can clone itself | Unclassified | 4.04 | No outcome classification supplied; no allocation inferred. |
| report-domain-versus-meta-time: Create an evidence-backed Problem/Domain versus Meta/DevEnv time report | Meta/DevEnv | 5.95 | The report itself is development-process measurement work; its recorded window includes scope decisions and checks, not measured human effort. |
| agent-guide-preview: Preview AgentPhaseGuide and generated Copilot files | Meta/DevEnv | 4.84 | Agent configuration preview and transfer tooling. |
| darwin-agent-essentials: Evolve Agent Essentials through Darwin | Meta/DevEnv | unknown | Development-practice extraction and agent rules. |
| visual-foundations-main-navigation: Expose visual foundations directly in main navigation | Meta/DevEnv | 1.06 | Discoverability of a developer visual-foundations preview, not a supported domain behavior. |
| canvas-page-height-and-controls: Fill the canvas page and move connection controls above the workspace | Problem/Domain | unknown | Usability of the supported sketch-editing workspace. |
| canvas-compact-grid-toolbar: Compact canvas controls using the global layout grid | Problem/Domain | unknown | Recover usable drawing area for domain sketch editing. |
| canvas-technical-picture: Show DevEnv local-development architecture in the canvas | Meta/DevEnv | unknown | Explain DevEnv's own development architecture, rather than a supported external problem. |
| visual-foundations-preview: Try an isolated DevEnv visual-foundations preview | Meta/DevEnv | unknown | Evaluate visual conventions for the development environment. |
| ruleset-reduction: Create a substantially smaller repository ruleset | Meta/DevEnv | unknown | Reduce and clarify repository agent rules. |
| current-entry-scheduler-boundary: Reuse scheduler boundary for current-entry polling | Meta/DevEnv | 1.36 | Polling test-boundary cleanup without changing product behavior. |
| client-coverage-repair: Restore full client test coverage | Meta/DevEnv | 2.39 | Repair test coverage and infrastructure. |
| client-shell-test-repair: Repair stale client shell integration tests | Meta/DevEnv | 2.76 | Repair regression tests without changing production behavior. |
| toolbar-process-links-and-tools-menu: Separate main process links from toolbar tools | Meta/DevEnv | 3.22 | Developer-environment navigation and workflow tooling. |
| toolbar-status-order-and-workflow-alignment: Right-align active workflow and move TDD before Tests | Meta/DevEnv | 1.46 | Developer workflow/test status toolbar layout. |
| toolbar-global-grid-alignment: Align meta and status toolbars with global grid | Meta/DevEnv | 1.52 | Developer-environment toolbar conventions. |
| workflow-todo-group-totals: Show product/meta evaluated subtotals and grand total | Meta/DevEnv | 2.13 | Work evaluation aggregation tooling. |
| workflow-todo-summed-elapsed: Show summed evaluated elapsed time per workflow | Meta/DevEnv | 2.75 | Time-evidence presentation in workflow tooling. |
| workflow-todo-compact-navigation: Compact workflow navigation and expandable evaluation history | Meta/DevEnv | 5.70 | Workflow navigation and evaluation history tooling. |
| canvas-connection-picker: Pick and delete multiple canvas connections | Problem/Domain | 3.57 | Choose and delete supported sketch connections. |
| canvas-devenv-overview: Load a reusable DevEnv overview sketch | Meta/DevEnv | 7.03 | Explain what DevEnv itself does through an overview sketch. |
| canvas-shared-label-input: Reuse one input for canvas labels | Problem/Domain | 6.65 | Create and edit domain sketch labels. |
| canvas-diagram-connections: Connect canvas sketch parts | Problem/Domain | 8.33 | Create and maintain relationships in a sketch. |
| canvas-diagram-multiple-parts: Arrange and remove multiple canvas sketch parts | Problem/Domain | 4.45 | Create, arrange and remove domain sketch parts. |
| canvas-editor-surface-separation: Separate canvas surface from diagram editing | Mixed | 5.50 | Separates reusable canvas mechanics from sketch editing while introducing a mock boundary; outcome includes domain architecture and test infrastructure. |
| interactive-canvas-one-editable-part: Create and edit one canvas sketch part | Problem/Domain | 6.28 | Create and edit a supported sketch part without position jumps. |
| toolbar-design-refinement: Refine status toolbar visual design | Meta/DevEnv | 3.10 | Developer workflow and test-status readability. |
| toolbar-scheduling-boundary: Explicit toolbar scheduling boundary | Meta/DevEnv | 2.05 | Scheduling fake and test-boundary refactoring. |
| active-workflow-status-toolbar: Active workflow in status toolbar | Meta/DevEnv | 5.03 | Expose current development workflow status. |
| interactive-canvas-viewport-stretch: Fill available canvas viewport space | Problem/Domain | 4.78 | Usable sketch-editing viewport. |
| interactive-canvas-pointer-coordinates: Canvas pointer-coordinate conversion | Problem/Domain | 3.08 | Correct logical coordinate conversion for sketch interaction. |
| interactive-canvas-frame-scheduling: Change-driven canvas frame scheduling | Problem/Domain | 9.72 | Responsive change-driven canvas rendering; its elapsed window also includes other work and waits. |
| interactive-canvas-typed-boundary: Typed canvas boundary and plain browser fake | Meta/DevEnv | 4.72 | Typed test boundary and fake replacing unsafe browser patching. |
| interactive-canvas-responsive-sizing: Responsive canvas sizing and pixel density | Problem/Domain | 63.23 | Correct displayed canvas size and pixel density; long elapsed window includes intervening work and waits. |
| diagram-selection-and-movement: Diagram selection and movement | Problem/Domain | 16.75 | Select and move supported diagram entities. |
| workflow-todo-value-metrics-view: Show current evaluation metrics on the Workflow TODO view | Meta/DevEnv | 18.92 | Display development-work evaluations and metric definitions. |
| glossary-client-search: Search the Glossary view | Problem/Domain | 2.80 | Find supported domain terms and definitions. |
| principle-register-organization-review: Review principle register organization and precedence | Meta/DevEnv | 8.93 | Review repository development rules and precedence. |
| workflow-evaluation-associations: Associate evaluations with workflow records | Meta/DevEnv | 11.05 | Maintain links between workflow and evaluation records. |
| diagram-editor-drag-interaction: Diagnose and fix workspace item movement | Problem/Domain | 82.77 | Interactively move diagram items and persist positions; elapsed window includes pauses between sessions. |
| diagram-connection-workflow: Implement diagram connection interaction | Problem/Domain | unknown | Create supported diagram relationships; no completion timestamp yet. |
| copilot-ai-credit-estimator: Estimate Copilot AI credits from imported token usage | Meta/DevEnv | 33.08 | Assess development-agent usage and costs. |
| active-workflow-on-todo-view: Show active workflow on TODO view | Meta/DevEnv | 12.83 | Display active development workflow. |
| interactive-canvas-clock-prototype: InteractiveCanvas clock prototype (provisional) | Problem/Domain | 5.20 | Investigate a canvas rendering foundation for the supported diagram editor; provisional prototype, not proven domain benefit. |
| interactive-canvas-editor-milestone: Canvas editor first useful milestone (provisional) | Mixed | unknown | Develop sketch-editing capability while describing DevEnv's own architecture; no supported split or completion time. |
| reusable-filesystem-http-test-doubles: Reusable filesystem and HTTP test doubles | Meta/DevEnv | 15.50 | Reusable test isolation infrastructure. |
| replace-real-fs-reads-in-tests: Replace real filesystem reads in tests with mocks | Meta/DevEnv | 3.93 | Test fixtures and filesystem isolation. |
| separate-generic-core-from-devenv-profile: Separate the generic AgentPhaseGuide core from the DevEnv project profile | Meta/DevEnv | 7.37 | Agent rules portability and export tooling. |

## Git evidence inventory

Author and commit dates are events, not work intervals. No time is inferred from commit gaps. Inspect referenced diffs before assigning older work to outcomes.
| Commit | Author timestamp | Commit timestamp | Subject |
|---|---|---|---|
| fa30dafb52261868e89a87198fdd0a6f6c189d24 | 2026-10-10T17:14:25+02:00 | 2026-10-10T17:14:25+02:00 | Add glossary shortcut to AgentPhaseGuide guidance |
| 1dadc44a81d1d49cfbe47c8c250e180633bee199 | 2026-10-10T17:10:18+02:00 | 2026-10-10T17:10:18+02:00 | Remove development remnants from portable AgentPhaseGuide |
| 185886cbe64ae26637c0271ea1bad098bb7233de | 2026-10-10T17:05:06+02:00 | 2026-10-10T17:05:06+02:00 | Default AgentPhaseGuide export to devenv-agent-guide |
| d18f6355cae7c459195212c046233000e99ce39f | 2026-10-10T17:01:25+02:00 | 2026-10-10T17:01:25+02:00 | Add self-cloning package to AgentPhaseGuide export |
| 7246bafb2c78945dea7b7cd3c086f88229afeb7c | 2026-10-10T16:56:03+02:00 | 2026-10-10T16:56:03+02:00 | Include setup README in AgentPhaseGuide export |
| 8ff7b8f964fe48ce44953f850c93c7a7a838ae30 | 2026-10-10T16:46:14+02:00 | 2026-10-10T16:46:14+02:00 | Migrate MetaExport Markdown generator to TypeScript |
| dccd3c40b7321c575e1357660fe7fed17c7cb98c | 2026-10-10T16:43:15+02:00 | 2026-10-10T16:43:15+02:00 | Migrate practice Markdown generators to TypeScript |
| 32ffe00d81fb9ba7130fd07fd9929c995962685b | 2026-10-10T16:35:48+02:00 | 2026-10-10T16:35:48+02:00 | Add evidence-backed domain versus meta time report |
| 1e3c9cebcc9b5ad8ec6ad4b821f69d8baae5833b | 2026-10-10T16:25:13+02:00 | 2026-10-10T16:25:13+02:00 | Plan Problem/Domain versus Meta/DevEnv time report |
| c7fcf3a23d4c745960e052fa4234a86f02347092 | 2026-10-10T16:22:56+02:00 | 2026-10-10T16:22:56+02:00 | Refine generic AgentPhaseGuide rules and tracking opt-ins |
| 57ce107fa99cc12676fe8ed66a2ff24743961cc3 | 2026-10-10T16:12:39+02:00 | 2026-10-10T16:12:39+02:00 | Add AgentPhaseGuide glossary to generic export |
| 74d351d6ccd8d44852a30f014f3b047ececa1ee2 | 2026-10-10T16:07:47+02:00 | 2026-10-10T16:07:47+02:00 | Separate generic AgentPhaseGuide from DevEnv profile |
| e74839455fe372883d8e3b4c3a2f313567bee89b | 2026-10-10T15:52:21+02:00 | 2026-10-10T15:52:21+02:00 | Replace real filesystem reads in server tests |
| b074703ae2b14c008a31a3e9f2b31e3990a480c2 | 2026-10-10T15:38:41+02:00 | 2026-10-10T15:38:41+02:00 | Plan replacing real filesystem reads in tests |
| ad87c42177843b3d71e1b4aafa34790383d15f6b | 2026-10-10T15:33:32+02:00 | 2026-10-10T15:33:32+02:00 | Plan remaining test isolation WorkTasks |
| d07e8789652f5dd1f6339d98537e9ad2992ba069 | 2026-10-10T15:33:32+02:00 | 2026-10-10T15:33:32+02:00 | Replace supertest with in-process requestApp helper |
| e5f827fa0fbceba3830fa4b3c8ba8824d6d788ef | 2026-10-10T15:23:07+02:00 | 2026-10-10T15:23:07+02:00 | Add shared in-memory TextFileSystem test double |
| 2ec63c561767b7dda05eb82d0c94b405b50fe0fb | 2026-10-10T15:23:07+02:00 | 2026-10-10T15:23:07+02:00 | Add rule to comment non-obvious constructs |
| 9ba6f8c0e6e8617e7958afbe14b874bba170d9b4 | 2026-10-10T15:14:24+02:00 | 2026-10-10T15:14:24+02:00 | Add WorkPlans page to navigation |
| eb30481f641a716df339dc61d73784c3b5e46e7d | 2026-10-10T15:14:23+02:00 | 2026-10-10T15:14:23+02:00 | Add grid layout rule for client views |
| ad9d1e5f4a3982bb0e0a70f4f9fdc282a5e74a8e | 2026-10-10T15:04:06+02:00 | 2026-10-10T15:04:06+02:00 | Plan read-only WorkPlans page |
| 0044d5fdc7038e5423ef5464d2e5900737a19128 | 2026-10-10T15:02:07+02:00 | 2026-10-10T15:02:07+02:00 | Add WorkTask measurement decisions and evaluation links |
| 841fd74a614e8d09e7472b1d19eadd5c7098513e | 2026-10-10T14:47:05+02:00 | 2026-10-10T14:47:05+02:00 | Announce Agent and TDD phases with their goals |
| 2112cfdac2cff0eb636570114e079c36d7cb275f | 2026-10-10T14:44:04+02:00 | 2026-10-10T14:44:04+02:00 | Add repository-backed WorkPlan registry |
| 48a711684b7ac28bc8bfe23a0a16609fe74ba13a | 2026-10-10T14:35:04+02:00 | 2026-10-10T14:35:04+02:00 | Clarify proposed Agent Essentials practices |
| 0e75ca3677de9427428fa9d533e3e6cf9df49220 | 2026-10-10T14:33:17+02:00 | 2026-10-10T14:33:17+02:00 | Add optional defaults to Agent Essentials |
| ae2b0cd53f23da796e6020405982830c42cbe5e4 | 2026-10-10T14:25:07+02:00 | 2026-10-10T14:25:07+02:00 | Bootstrap Agent Essentials trial customizations |
| 64a09b480b970ec01071bc9f1829da8732b051c7 | 2026-10-10T14:23:08+02:00 | 2026-10-10T14:23:08+02:00 | Prepare Agent Essentials safeguards for bootstrap trial |
| ac768071dfe895e37fa3d14914d9bd6da530baa1 | 2026-10-10T14:18:22+02:00 | 2026-10-10T14:18:22+02:00 | Move generated-file preview notice into the view |
| 1bd095ed2ffd32cd39eaeb147250f0949f4ff7f8 | 2026-10-10T14:11:02+02:00 | 2026-10-10T14:11:02+02:00 | Move Agent Guide generation into shared |
| 0bc0a6143cac5d514eb4a459c35a5db7f0bd1b1e | 2026-10-10T14:07:21+02:00 | 2026-10-10T14:07:21+02:00 | Add work continuity and measurement intent to AgentPhaseGuide |
| d2c7f2562b2e42f1304c986df0a9b717a3054f47 | 2026-10-10T14:04:46+02:00 | 2026-10-10T14:04:46+02:00 | Make Agent Guide Preview the default view |
| ed9bd1a41704af3f26976dc3ba6b5c7981393dab | 2026-10-10T13:59:30+02:00 | 2026-10-10T13:59:30+02:00 | Add reusable Markdown preview to Agent Guide |
| e97e4fc5abea41fd7958fd161da8d85931f09896 | 2026-10-10T13:54:24+02:00 | 2026-10-10T13:54:24+02:00 | Show generated Agent Guide Markdown in tabs |
| df9ad1e98ffeb719dfb5fe7ba6cb4af9c60c911a | 2026-10-10T13:52:20+02:00 | 2026-10-10T13:52:20+02:00 | Add read-only Agent Guide preview |
| 5135d4a34eadd46d8ad00c809ad5eb5d17cf7359 | 2026-10-10T13:43:22+02:00 | 2026-10-10T13:43:22+02:00 | Add commit procedure and TDD practice to AgentPhaseGuide |
| 05cb416bbbc65da21e581ba88dbb514cb84f1a97 | 2026-10-10T13:36:43+02:00 | 2026-10-10T13:36:43+02:00 | Add typed Agent Essentials candidates and AgentPhaseGuide |
| c375da8bb9f5a936aa898ee0d38caec859a28b9e | 2026-10-10T13:06:13+02:00 | 2026-10-10T13:06:13+02:00 | Record Darwin plan for Agent Essentials |
| f97e6844654d5d899e57659d267ecb7aed24b588 | 2026-10-10T05:46:02+02:00 | 2026-10-10T05:46:02+02:00 | Move visual foundations into main navigation |
| fda2ed256af3f577f548d90edde3d06c5795057c | 2026-10-10T05:40:02+02:00 | 2026-10-10T05:40:02+02:00 | Backfill canvas follow-up metrics and workflow associations |
| 9bcc4e9c8c0ce2a68e5b621bfe7e972be97cc6c3 | 2026-10-10T05:36:16+02:00 | 2026-10-10T05:36:16+02:00 | Add isolated DevEnv visual foundations preview |
| 6646bd55dab21ba15bf022e0a500f1d8bb8b48bb | 2026-10-10T05:32:09+02:00 | 2026-10-10T05:32:09+02:00 | Record Figma design-system inspiration reference |
| 72d52bbc45c5c33078594f6e1a85bd412a98c82c | 2026-10-10T05:28:36+02:00 | 2026-10-10T05:28:36+02:00 | Add DevEnv technical canvas picture with directed links and boundaries |
| 413d1d4e9d90ce5497de10172e67755d2cbb19a3 | 2026-10-10T05:15:50+02:00 | 2026-10-10T05:15:50+02:00 | Record canvas undo/redo follow-up |
| fa36c2c7609b0a66f94a301c07dcca38718be3fe | 2026-10-10T05:14:12+02:00 | 2026-10-10T05:14:12+02:00 | Compact canvas controls using the global layout grid |
| 2b7e869cd8484d6d6985922ded3359fc2fcb0031 | 2026-10-10T05:09:46+02:00 | 2026-10-10T05:09:46+02:00 | Fix canvas page height and move connection controls above workspace |
| 56222b1d54d0256da785a295ebc090912ce8217e | 2026-10-10T04:59:06+02:00 | 2026-10-10T04:59:06+02:00 | Add all-tests coverage CLI script |
| f5f57dafccef6ac7e70e548bd2f0981d657542f0 | 2026-10-10T04:53:45+02:00 | 2026-10-10T04:53:45+02:00 | Record reduced ruleset audit closure and preserve historical context |
| 1dbf9b2c5f3b3f3542727a9cd17052452f64274a | 2026-10-10T04:50:22+02:00 | 2026-10-10T04:50:22+02:00 | Record ruleset preservation audit and behavior trial results |
| ab6c8e6ac28296380bd6558ef15cc07451a97925 | 2026-10-10T04:46:56+02:00 | 2026-10-10T04:46:56+02:00 | Record ruleset desk-check results and refresh ledger status |
| 7b99615ea4cd5487081ffb3d40eb97be534061b0 | 2026-10-10T04:44:11+02:00 | 2026-10-10T04:44:11+02:00 | Refresh ruleset checkpoint after version 5 registration |
| dd090b90577b216b16af010c1e0869c5e53b4f50 | 2026-10-10T04:43:01+02:00 | 2026-10-10T04:43:01+02:00 | Register practice set version 5 and update ruleset checkpoint |
| 3aeb73c8d6c5ab71adb23d497966a541682f5d1d | 2026-10-10T04:34:10+02:00 | 2026-10-10T04:34:10+02:00 | Document global grid layout convention |
| 22cce3533ee0744e9622ac32b70444c1a27b6cdb | 2026-10-10T04:32:30+02:00 | 2026-10-10T04:32:30+02:00 | Activate reduced repository ruleset |
| 139c30ffe2b1ba3b87b2b9be5c286e8b09d5f728 | 2026-10-10T04:26:30+02:00 | 2026-10-10T04:26:30+02:00 | Prepare reduced ruleset and preserve review history |
| c35d399ad44b047bfcce615c2e32cc2a16e8f626 | 2026-10-10T01:53:28+02:00 | 2026-10-10T01:53:28+02:00 | Start MoSCoW review for a smaller ruleset |
| 2299639be0dd9987290d424aa4c5ca8fa61dee75 | 2026-10-10T01:49:15+02:00 | 2026-10-10T01:49:15+02:00 | Restore client coverage and clarify scheduler lifecycle tests |
| 3ad548fb09927f715fadf12c743cff2cd62abf3d | 2026-10-10T01:39:49+02:00 | 2026-10-10T01:39:49+02:00 | Repair client shell tests and clarify editing menu labels |
| 3da496a615e38a51dd4db99c5146601b836b0e5c | 2026-10-10T01:33:34+02:00 | 2026-10-10T01:33:34+02:00 | Separate process navigation and right-align toolbar tools |
| 42646b22aa53c0efe76bf5c037f7c1f669f8cf16 | 2026-10-10T01:25:42+02:00 | 2026-10-10T01:25:42+02:00 | Reorder toolbar status and right-align active workflow |
| c50d536179812951483ccd4d7080e73cb76afcbe | 2026-10-10T01:20:43+02:00 | 2026-10-10T01:20:43+02:00 | Align toolbars with global guides and simplify workflow display |
| 90b56fcfa0c71dfc88b34fc5dbbbc60137895f70 | 2026-10-10T01:12:14+02:00 | 2026-10-10T01:12:14+02:00 | Separate example feature references from general meta guidance |
| 769b4a007102b4170f5d9836be11c93f077a61d8 | 2026-10-10T01:08:10+02:00 | 2026-10-10T01:08:10+02:00 | Record practice set version 4 for concise guidance trial |
| 1565e27e87d17ed793b842a37abd6c20e76682a5 | 2026-10-10T01:07:11+02:00 | 2026-10-10T01:07:11+02:00 | Streamline agent guidance around required work checkpoints |
| c6c5fb45b0cc586f745af7c35fa3d7c886069a6c | 2026-10-10T00:58:47+02:00 | 2026-10-10T00:58:47+02:00 | Align workflow table and totals with global grid guides |
| fba5ce688da0f629b75f1034353420dae7bd292d | 2026-10-10T00:56:17+02:00 | 2026-10-10T00:56:17+02:00 | Introduce shared editorial layout for workflow pages |
| f4413dcd6dbe7dfb155f722331ed7122a81f7bd2 | 2026-10-10T00:51:15+02:00 | 2026-10-10T00:51:15+02:00 | Improve expanded evaluation hierarchy and alignment |
| 8d3f97a1e17c9ac983a8abf3a8a56ea3cd6f8329 | 2026-10-10T00:44:45+02:00 | 2026-10-10T00:44:45+02:00 | Style expandable evaluations as compact table-like rows |
| b75f822b854ea89d3df877a63e3f619de9ed5bf6 | 2026-10-10T00:42:39+02:00 | 2026-10-10T00:42:39+02:00 | Align evaluation columns and pad elapsed duration units |
| a2e70cb4d7d83fea6c18b90d6090a8f7c290da04 | 2026-10-10T00:36:32+02:00 | 2026-10-10T00:36:32+02:00 | Collapse workflow evaluations into compact summary headers |
| 7c9b31cd779242a02f939cde54594bacd321eb47 | 2026-10-10T00:33:46+02:00 | 2026-10-10T00:33:46+02:00 | Spread workflow totals across the page with separators |
| 6152e4a39cbdda1059e946417be32086289a5dd1 | 2026-10-10T00:30:24+02:00 | 2026-10-10T00:30:24+02:00 | Move workflow totals into a top summary |
| 2d5273790b7618fa57126797a445ebc52e6f7596 | 2026-10-10T00:26:58+02:00 | 2026-10-10T00:26:58+02:00 | Style workflow checkpoint labels with a subtle blue accent |
| 71fc500d04bb3b1a35cd011e280a8f0635ff8547 | 2026-10-10T00:21:56+02:00 | 2026-10-10T00:21:56+02:00 | Add product and meta elapsed subtotals and grand total |
| 5a713c5ef639803bc8423baa680b00bd4ee713c4 | 2026-10-10T00:17:58+02:00 | 2026-10-10T00:17:58+02:00 | Show summed evaluated elapsed time per workflow |
| 5b6d7c85bf1c7d0bcf9b8c6cdc182b1288cf6535 | 2026-10-10T00:13:34+02:00 | 2026-10-10T00:13:34+02:00 | Compact workflow history and expose read-only checkpoints |
| a0217aad07699b41fdf9b9832c4ac721eec7e89b | 2026-10-10T00:04:44+02:00 | 2026-10-10T00:04:44+02:00 | Split canvas editor tests into focused behavior cases |
| f72e95cedad3a00cc34bdac378360e8acea5a248 | 2026-10-09T23:58:03+02:00 | 2026-10-09T23:58:03+02:00 | Add a checkbox picker for canvas connection deletion |
| 02e2782f62ff30f4cf1ad4fed2bdec7ee7368545 | 2026-10-09T23:52:05+02:00 | 2026-10-09T23:52:05+02:00 | Add a reusable DevEnv overview canvas sketch |
| 59ce37f91f5d09913bc06a76860d89bd237e5e15 | 2026-10-09T23:40:21+02:00 | 2026-10-09T23:40:21+02:00 | Fix glossary and workflow test fixture types |
| 3df3cafdf9496f2cfafbc868221158d32a8e3f50 | 2026-10-09T23:38:07+02:00 | 2026-10-09T23:38:07+02:00 | Reuse one label input for canvas drafts and selections |
| 775ca298b763d1413132e6fa8f1a2f839e231199 | 2026-10-09T23:25:59+02:00 | 2026-10-09T23:25:59+02:00 | Add labelled undirected canvas connections |
| 9904d2488f957861633b6f72920d185cfd4ff034 | 2026-10-09T23:12:38+02:00 | 2026-10-09T23:12:38+02:00 | Add independently editable canvas sketch parts |
| f448bfb7d221be0975c1948a8223adb51ef68077 | 2026-10-09T23:06:05+02:00 | 2026-10-09T23:06:05+02:00 | Record practice-set version 3 |
| a2b4ded9a2d8d753e7dffe1e8712e2263b80013c | 2026-10-09T23:04:07+02:00 | 2026-10-09T23:04:07+02:00 | Make practice checks explicit in the work loop |
| 6a82c9f189ecaba8a4f61be72af0609bcbc6a74e | 2026-10-09T22:58:32+02:00 | 2026-10-09T22:58:32+02:00 | Separate canvas editor and surface with mock-first boundaries |
| 903d6fa06661b863b18b9caf05d011d2fdaebf82 | 2026-10-09T22:44:20+02:00 | 2026-10-09T22:44:20+02:00 | Create select drag and rename one canvas sketch part |
| 28a6646655e02782981b05c2279e4a2626a81037 | 2026-10-09T22:35:35+02:00 | 2026-10-09T22:35:35+02:00 | Resize canvas backing bitmap on pixel-density changes |
| 1b30aaab6b040bdffa154c917b8682775ecdd6c6 | 2026-10-09T22:30:30+02:00 | 2026-10-09T22:30:30+02:00 | Improve toolbar phase clarity and responsive workflow controls |
| 1f3b34e5a44498eb8e1fae66a905a2af6dde496b | 2026-10-09T22:24:57+02:00 | 2026-10-09T22:24:57+02:00 | Hide toolbar current task and record TDD phase synchronization |
| c7b48406fa252c65b5f84acfda919c5ae9157444 | 2026-10-09T22:21:08+02:00 | 2026-10-09T22:21:08+02:00 | Inject toolbar scheduler and document boundary-first testing |
| 3b5c76b6e3e89f02234d3febc1d96d9d5ef2b9ab | 2026-10-09T22:13:57+02:00 | 2026-10-09T22:13:57+02:00 | Show live active workflow in status toolbar |
| 601438327b14a40fc800951b6870ea5449661fd4 | 2026-10-09T22:05:47+02:00 | 2026-10-09T22:05:47+02:00 | Add canvas pointer coordinates and viewport stretching |
| 771de0194d66321de38c13dae4b3562a704ff64f | 2026-10-09T21:53:05+02:00 | 2026-10-09T21:53:05+02:00 | Schedule canvas redraws on demand with animation frames |
| 1a482dff515b3223d70334bc35a8cab7e2355f04 | 2026-10-09T21:47:41+02:00 | 2026-10-09T21:47:41+02:00 | Add responsive canvas and typed browser boundary |
| c3d4c0f1aa25e69a3f9a0d1bdcdbc5e648e2df87 | 2026-10-09T21:30:23+02:00 | 2026-10-09T21:30:23+02:00 | Save canvas editor plan and activate workflow |
| 25d2362a6ab89f7ac099f2c40ec42ab1b7876642 | 2026-10-09T21:25:22+02:00 | 2026-10-09T21:25:22+02:00 | InteractiveCanvas initial |
| afdd3f7deba1f3ec3edc4af5c306df976715bc5c | 2026-10-09T21:08:53+02:00 | 2026-10-09T21:08:53+02:00 | Document process Markdown Typed JSON inventory |
| 051c5cd15feb52c0e8a77b2c0a9bc1ec306e9df0 | 2026-10-09T20:59:50+02:00 | 2026-10-09T20:59:50+02:00 | Show active workflow on TODO page |
| 6bcc7ef729e2fde2bf6ef5a630b9f941914702ec | 2026-10-09T20:43:58+02:00 | 2026-10-09T20:43:58+02:00 | Clarify status report formatting |
| 6536f50285998958ac56499b77192b6b6d927ce1 | 2026-10-09T20:42:02+02:00 | 2026-10-09T20:42:02+02:00 | Clarify status report ordering |
| 49cf733a6eeefa6dc95c1faff2a797876ac5e7f7 | 2026-10-09T20:39:04+02:00 | 2026-10-09T20:39:04+02:00 | Clarify provisional naming approval threshold |
| 4a23943c4d72f2372b6a25feb12229bfb6d90b3c | 2026-10-09T20:29:14+02:00 | 2026-10-09T20:29:14+02:00 | Document evidence-based process improvements |
| bc5ea91724f990a41fb4caf1c1de5083b55dfa8c | 2026-10-09T20:26:19+02:00 | 2026-10-09T20:26:19+02:00 | Add Copilot AI credit estimator |
| f4a1905675a2c5edc9b972cf7ea38243bba1ff93 | 2026-10-09T19:35:19+02:00 | 2026-10-09T19:35:19+02:00 | Add Type and Glossary review checkpoints |
| 840da7bf9be9775e49fe5f14ee2bfdbca21ab43b | 2026-10-09T19:31:28+02:00 | 2026-10-09T19:31:28+02:00 | Register test boundary mock workflow |
| 8e049ae0376688944c04a5ede4f4bccc141cfc0b | 2026-10-09T19:24:33+02:00 | 2026-10-09T19:24:33+02:00 | Record exact elapsed evaluation durations |
| 3327a5209635c6577acb30f1e6591cd0081a1cf6 | 2026-10-09T19:23:53+02:00 | 2026-10-09T19:23:53+02:00 | Add update measurements to workflow |
| 158bd1cbb3a183c75453882eda2a9d1616b59a43 | 2026-10-09T19:18:01+02:00 | 2026-10-09T19:18:01+02:00 | Replace live JSON samples in tests |
| a7511f16c52c35ea92e0c7420f1c038812ae3010 | 2026-10-09T19:13:42+02:00 | 2026-10-09T19:13:42+02:00 | Add diagram connection workflow |
| 30a26ab3060d382443476580c95bfff9a2c810b3 | 2026-10-09T19:12:44+02:00 | 2026-10-09T19:12:44+02:00 | Document Type complexity review rule |
| e0f799cb91b04a27ac1624dd7325e83395c00531 | 2026-10-09T19:05:00+02:00 | 2026-10-09T19:05:00+02:00 | Fix diagram item dragging |
| 8a0b11d4c0be712c2cbd12593d719590eb3da75e | 2026-10-09T17:36:01+02:00 | 2026-10-09T17:36:01+02:00 | Store workflow evaluation associations in data |
| 12c212e785c9bbe9048915a207b8dd906a644e1c | 2026-10-09T17:29:08+02:00 | 2026-10-09T17:29:08+02:00 | Show principle review duration in workflow view |
| 2171ac664fcb079b42cb41852ddf4c50728711cf | 2026-10-09T17:16:25+02:00 | 2026-10-09T17:16:25+02:00 | Update principle register review metrics |
| c010f12d56c73d6ae90442d2ae34486a1769da52 | 2026-10-09T17:13:14+02:00 | 2026-10-09T17:13:14+02:00 | Document P-026 in focused work loop |
| 4aa074fdc7d5821af1c9ba6a30b7cc6500ddaeb6 | 2026-10-09T16:58:45+02:00 | 2026-10-09T16:58:45+02:00 | Ask how to track each new task |
| 9169565473f6bcfd99f9928936eecb207540fad8 | 2026-10-09T16:54:03+02:00 | 2026-10-09T16:54:03+02:00 | Add search to the Glossary view |
| bc296f0750acb03e4d9aea5b1265b57a25cc03fb | 2026-10-09T16:44:04+02:00 | 2026-10-09T16:44:04+02:00 | Shorten Glossary definitions and collapse examples |
| 8bda1a2575f4b93456b05fc256a52ddb812414fe | 2026-10-09T16:39:34+02:00 | 2026-10-09T16:39:34+02:00 | Show suggested commit subjects at stable checkpoints |
| fae81ee1847f075b452e79384a8a147bb76ec242 | 2026-10-09T16:37:59+02:00 | 2026-10-09T16:37:59+02:00 | Track individual agent and skill versions |
| ef8dde1b1ffe5b00404e6d616628809018ce4000 | 2026-10-09T16:25:44+02:00 | 2026-10-09T16:25:44+02:00 | Use concise transformed test samples |
| 6c99fa6d5b2f9d62bbce280d565a7a76fa54e9b6 | 2026-10-09T16:20:29+02:00 | 2026-10-09T16:20:29+02:00 | Add practice-set version history |
| 47fced67cde5b94c813559090dedb4d76c793938 | 2026-10-09T15:59:26+02:00 | 2026-10-09T15:59:26+02:00 | Add Diligent Coder workflow |
| bcea50e90ead2f3a02a83dc4be48fe8ea2601ed4 | 2026-10-09T15:47:09+02:00 | 2026-10-09T15:47:09+02:00 | Align and expand workflow table |
| c2dde18d47b3a101a811d165804e5559cf6886dd | 2026-10-09T15:46:31+02:00 | 2026-10-09T15:46:31+02:00 | Record proposed practice-profile comparison |
| bf1207b69555273f4cc80e203405d2928bbd8455 | 2026-10-09T15:34:02+02:00 | 2026-10-09T15:34:02+02:00 | Align workflow columns and evaluation durations |
| e1c2418e37366df470a1b6a82950722a73a9e26d | 2026-10-09T15:24:26+02:00 | 2026-10-09T15:24:26+02:00 | Extract streamed test runner service |
| 7bc3cc2f9697c1aec25f1ac8f37a4b8aa95be3ea | 2026-10-09T15:18:08+02:00 | 2026-10-09T15:18:08+02:00 | Show completed durations in workflow view |
| c4369f8d5cf79a4ad97ccddd103f0e9fcb56bd56 | 2026-10-09T15:15:07+02:00 | 2026-10-09T15:15:07+02:00 | Separate workflow evaluation details |
| 0b3d9a273a0ea9e92c0a16e39603b46b8b1b7be9 | 2026-10-09T14:54:25+02:00 | 2026-10-09T14:54:25+02:00 | Simplify workflow TODO view presentation |
| ee791ec9c5063c7e6efb12a24070a95e98d09245 | 2026-10-09T14:50:42+02:00 | 2026-10-09T14:50:42+02:00 | Make workflow TODO JSON authoritative |
| e4a3c0f53605fc60a439c54d3d7a4f98f8fa79fb | 2026-10-09T14:32:37+02:00 | 2026-10-09T14:32:37+02:00 | Fix workflow-purpose API and view |
| 3ac777fb0b70194e47eca7aae0656c7462b35f4e | 2026-10-09T14:20:33+02:00 | 2026-10-09T14:20:33+02:00 | Clarify work purpose and focused workflow guidance |
| 6e53817e4945e863607565e57c8fac6b55daa65f | 2026-10-09T14:01:59+02:00 | 2026-10-09T14:01:59+02:00 | Add provisional naming and status-reporting rules |
| 1133e800419934da716cae1697cef9521856c8bb | 2026-10-09T14:00:13+02:00 | 2026-10-09T14:00:13+02:00 | Show value metrics on Workflow TODO |
| 32ea1e2ea96bc529daf6a4637788b6fa0b89685b | 2026-10-09T13:39:00+02:00 | 2026-10-09T13:39:00+02:00 | Add diagram selection and movement |
| da4b6dd359ada02f5df3d317ef97f5831831d9a9 | 2026-10-09T13:22:06+02:00 | 2026-10-09T13:22:06+02:00 | Add diagram drag-to-add and value evaluation pilot |
| bbaa57944413d1341e0682d2f0904ae9347dfa33 | 2026-10-09T13:10:04+02:00 | 2026-10-09T13:10:04+02:00 | Describe DevEnv's team-wide purpose |
| e0e3d971277f1e6457059191a590b83d77e7d66a | 2026-10-09T12:52:52+02:00 | 2026-10-09T12:52:52+02:00 | Label stability reports with Status |
| 5de6dad799949e27dc00fc4a42cd99b36fa1167f | 2026-10-09T12:51:48+02:00 | 2026-10-09T12:51:48+02:00 | Add diagram palette and update working guidance |
| 128f7bf6c15006f3780ffaaaac07471af45d0910 | 2026-10-09T12:45:01+02:00 | 2026-10-09T12:45:01+02:00 | Add diagram connection editing and element deletion |
| 725ac3fa48a2271aed3f0bc4a82331d5bcf6a0ab | 2026-10-09T12:37:23+02:00 | 2026-10-09T12:37:23+02:00 | Record Green-stage duplication review (P-020) |
| d905016db70e36518d95e7987b4c906d63d91e62 | 2026-10-09T12:35:35+02:00 | 2026-10-09T12:35:35+02:00 | Add pure diagram editing and connection operations |
| e51ba3248b4ade2757549e47971b4f179fc631fc | 2026-10-09T12:31:08+02:00 | 2026-10-09T12:31:08+02:00 | Add pure diagram element movement |
| bd68299460dd8e0eac9a19d2c0a4fee169a20082 | 2026-10-09T12:29:04+02:00 | 2026-10-09T12:29:04+02:00 | Add pure diagram element creation |
| 3985cc2176cff1cb006d0836b08e795f693f6120 | 2026-10-09T12:25:45+02:00 | 2026-10-09T12:25:45+02:00 | Remove Angular runtime dependencies from shared code |
| d92842e46a2ce7a271a953af040e8d501a9997fa | 2026-10-09T12:22:31+02:00 | 2026-10-09T12:22:31+02:00 | Add validated diagram contracts and runtime-neutral shared guidance |
| dade0c304ddd720b3aa5434a1f1ac3a830a16cde | 2026-10-09T12:09:45+02:00 | 2026-10-09T12:09:45+02:00 | SystemConcern-053: isolate client HTTP tests and broaden side-effect rules |
| 57a3d2163c1dafb380f48a32c91a9f10cd512e82 | 2026-10-09T11:55:44+02:00 | 2026-10-09T11:55:44+02:00 | Restore full client and server test coverage |
| 7ba57fe584320695d898178da8af072dae66f793 | 2026-10-09T11:50:11+02:00 | 2026-10-09T11:50:11+02:00 | Add empty diagram page with route and navigation link |
| f3297a75f57ec5f34a66f3a7419b8489f01402ae | 2026-10-09T11:42:29+02:00 | 2026-10-09T11:42:29+02:00 | Record TypeScript declaration convention (P-017) |
| 84af748bdbc34bb60d5a5f778f310fe722f4cb0c | 2026-10-09T11:29:47+02:00 | 2026-10-09T11:29:47+02:00 | Save minimal typed diagram editor plan |
| e6fc2ee1f35499190177949b363d6310ed0f9ae8 | 2026-10-09T11:13:40+02:00 | 2026-10-09T11:13:40+02:00 | update |
| 6df4051e0a7886dfd16c7d16fd7d74be8ad6066e | 2026-10-08T02:02:46+02:00 | 2026-10-08T02:02:46+02:00 | Standardize agent discovery and update DevEnv export |
| d7df187a133f9d174d08ed61e64d790a88abe5b9 | 2026-10-08T01:56:33+02:00 | 2026-10-08T01:56:33+02:00 | Standardize skill locations and strengthen practice guidance |
| e585bebbf1ee445286de61f81a2638286eb3d2a4 | 2026-10-08T01:46:05+02:00 | 2026-10-08T01:46:05+02:00 | Add Typed JSON Markdown workflow skill |
| 9e75554834728341f18b11f72cc62ceae7f7f4f9 | 2026-10-08T01:34:32+02:00 | 2026-10-08T01:34:32+02:00 | Save configurable topic commit process and interactive setup |
| 78032a261b83c3c5b4eb319fa9e15b6fb410b047 | 2026-10-08T01:11:24+02:00 | 2026-10-08T01:11:24+02:00 | Organize design resources into knowledge topics |
| 24ef100c3652e2bc5977bd87cdee47552affd248 | 2026-10-08T00:05:58+02:00 | 2026-10-08T00:05:58+02:00 | Add typed portable practices checklist and format preferences |
| 70362860f8be16248ba9017077d72d2595b65251 | 2026-10-07T23:13:45+02:00 | 2026-10-07T23:13:45+02:00 | Exclude design and reviews from DevEnv clone exports |
| 5e3dabd22b9ab70c6da15a9dfc14cdf78e0f531a | 2026-10-07T22:24:48+02:00 | 2026-10-07T22:24:48+02:00 | Add verified DevEnv C4 architecture diagrams |
| ce47b1008ef9bd6ce0f26606993e433513207de1 | 2026-10-07T19:11:30+02:00 | 2026-10-07T19:11:30+02:00 | Save Type Detector findings and C4 recommendations |
| e23f0a00bfea888351a6ef80a76283fc82bc6d70 | 2026-10-07T18:51:36+02:00 | 2026-10-07T18:51:36+02:00 | Rename Type Reviewer to Type Detector and add detection guidance |
| 778990dc93f115a01e79586e8c775cdc101c11e3 | 2026-10-07T18:42:00+02:00 | 2026-10-07T18:42:00+02:00 | Show clone progress and close on success |
| 5178df23daaf83e9ca1ffaf865e349c4de2bbeef | 2026-10-07T18:11:18+02:00 | 2026-10-07T18:11:18+02:00 | Add DevEnv clone UI and folder export |
| 41d7f699d03d68c5f1dd438dddd5af629853f02a | 2026-10-07T16:21:34+02:00 | 2026-10-07T16:21:34+02:00 | Address UI design review findings |
| be123827d5b38e09df78f86fb0bbecf94a25a2b0 | 2026-10-07T16:11:26+02:00 | 2026-10-07T16:11:26+02:00 | Record UI design review findings |
| b512eaf06b5af29fcc280a011853727d80767cad | 2026-10-07T16:09:16+02:00 | 2026-10-07T16:09:16+02:00 | Track UI design review follow-up |
| 486174e3d7ae02ce8609d7738bd1ede78fccf17d | 2026-10-07T15:58:21+02:00 | 2026-10-07T15:58:21+02:00 | Add UI design review skill |
| 28834ba7163ecb7ac30a9989811d5b5cab5dbb42 | 2026-10-07T15:49:45+02:00 | 2026-10-07T15:49:45+02:00 | List potential skill candidates |
| 529e4815a43ccbf8835c838628751f7ba287429e | 2026-10-07T15:48:31+02:00 | 2026-10-07T15:48:31+02:00 | DesignReview |
| b38337d34c3a25d9b08ec535a44e14a42a4138d8 | 2026-10-07T15:47:06+02:00 | 2026-10-07T15:47:06+02:00 | Make Glossary JSON authoritative |
| 088c2b4ea68e285991ad55011182a84e7ff6c752 | 2026-10-07T14:51:25+02:00 | 2026-10-07T14:51:25+02:00 | Record JSON source-of-truth convention |
| 844fbecf9c2ad9c19980b8639d0d2e231d2d47d3 | 2026-10-07T14:44:06+02:00 | 2026-10-07T14:44:06+02:00 | Add command-line full Glossary JSON export |
| c6ce2a6f47d003b8f233e25b5236c7655f817b2f | 2026-10-07T14:17:37+02:00 | 2026-10-07T14:17:37+02:00 | updated |
| 46d8bf5c18dab69df23ba90735be844f5a8a477f | 2026-10-07T14:17:21+02:00 | 2026-10-07T14:17:21+02:00 | Register domain-filtered glossary export workflow |
| 7604dec09fa12f8de9a5e82f3fcb618fdeabcb6c | 2026-10-07T13:42:10+02:00 | 2026-10-07T13:42:10+02:00 | SystemConcern-027, SystemConcern-049: record glossary transfer example |
| 0f98efcff1f0842f14330a54784286dffe3ca342 | 2026-10-07T13:18:21+02:00 | 2026-10-07T13:18:21+02:00 | Shorten glossary label and record agent-skill candidates |
| 412d065c2feedad29fe8fd7c56378a4f2d240089 | 2026-10-07T13:03:36+02:00 | 2026-10-07T13:03:36+02:00 | update |
| 3c7bb8a18b5f30301adaecf180bafb640d5ad932 | 2026-10-07T13:03:21+02:00 | 2026-10-07T13:03:21+02:00 | SystemConcern-027: bottom-align Domain labels and add workflow TODO view |
| e8b37c500e5af7aec43091bb5d5cf8ab9e3cb68d | 2026-10-07T12:30:17+02:00 | 2026-10-07T12:30:17+02:00 | SystemConcern-027: style usage Domain badges and register follow-up workflows |
| 5228d03812c714c6c75eba52b4cfa00807be040e | 2026-10-07T12:26:18+02:00 | 2026-10-07T12:26:18+02:00 | SystemConcern-027: display recorded glossary usage Domains |
| 68f51728bc8ee46b3378ca912e2bb936be671473 | 2026-10-07T12:17:38+02:00 | 2026-10-07T12:17:38+02:00 | SystemConcern-027: record known-usage Domain labels for glossary entries |
| 85758ce69188d3719b1edf04c5dd75ce87bdf89a | 2026-10-07T12:12:19+02:00 | 2026-10-07T12:12:19+02:00 | SystemConcern-049: generate Markdown from versioned export statements |
| e20f65edaffd336f661e69f80d1b0b028f43849a | 2026-10-07T12:08:33+02:00 | 2026-10-07T12:08:33+02:00 | SystemConcern-027: name KnowledgeArea example WMS operations |
| f35abf0c1ff5221cf8678d95ada669b4720e12cd | 2026-10-07T12:06:56+02:00 | 2026-10-07T12:06:56+02:00 | SystemConcern-027: name SubjectDomain example WMS AI |
| f49cf3372fe0c77aad17f8ab6053496b1e1c8039 | 2026-10-07T12:05:23+02:00 | 2026-10-07T12:05:23+02:00 | SystemConcern-027: clarify glossary meanings and separate recorded examples |
| e312318f89f10b13a5fbdf61cde42344c7251ae7 | 2026-10-07T11:56:21+02:00 | 2026-10-07T11:56:21+02:00 | SystemConcern-027: include concrete examples in Domain and MetaLayer names |
| 17eaaa7580f8a280ae752493e2ed20591e707b64 | 2026-10-07T11:48:15+02:00 | 2026-10-07T11:48:15+02:00 | SystemConcern-027: plan defining-Domain labels for glossary display |
| be24ac140eef1cf8ec8ee2f568fb3c4a890aa57a | 2026-10-07T11:45:30+02:00 | 2026-10-07T11:45:30+02:00 | SystemConcern-027: refine KnowledgeArea and add concrete glossary examples |
| b5d2f6d57879bce5eda6ea4959704fe296aa2169 | 2026-10-07T11:38:30+02:00 | 2026-10-07T11:38:30+02:00 | Register glossary refinement and DevEnv TODO view workflows |
| c5c160fa239aae9efeebefc240559dd49db3e4e3 | 2026-10-07T11:31:55+02:00 | 2026-10-07T11:31:55+02:00 | Record workflow navigation and concrete-instance naming guidance |
| ca8efe0b1704180db28e26d176d55a489861f50d | 2026-10-07T11:25:49+02:00 | 2026-10-07T11:25:49+02:00 | SystemConcern-049: illustrate versioned KnowledgeStatements in JSON |
| 49a2fa8dff503a8029e7b28c9b863e19b50a6415 | 2026-10-07T11:17:01+02:00 | 2026-10-07T11:17:01+02:00 | SystemConcern-049: review export statements against current commit rules |
| 6f0b42d72b09fce8bbe6dbd38cab589d05d0f4bb | 2026-10-07T11:14:32+02:00 | 2026-10-07T11:14:32+02:00 | SystemConcern-049: save resumable MetaExport workflow |
| f5281bda548d185884ab78f9af31cdb3e7e17a8c | 2026-10-07T11:11:51+02:00 | 2026-10-07T11:11:51+02:00 | SystemConcern-049: draft commit-process MetaExport example |
| d8e9ef67749c0db8f44a4e47a08722f6d96e21fb | 2026-10-07T11:08:40+02:00 | 2026-10-07T11:08:40+02:00 | SystemConcern-049: condense MetaExport design and clarify concern scope |
| 701437593cb2e680bc068417e7f634431fd06bbf | 2026-10-07T11:01:44+02:00 | 2026-10-07T11:01:44+02:00 | SystemConcern-049: derive KnowledgeStatement boundaries from commit example |
| a719b1e9d9fb9f280a446a728c0e83f1922d2c08 | 2026-10-07T10:56:09+02:00 | 2026-10-07T10:56:09+02:00 | SystemConcern-049: establish example-led MetaExport design |
| bb7673c7712d5bf03d5a31ed449215a503ffc34c | 2026-10-07T10:36:52+02:00 | 2026-10-07T10:36:52+02:00 | Define SubjectDomain and MetaLayer and separate reference policy |
| 4df463e8ebdfe341b70d1fb628414f22f94271fe | 2026-10-07T10:14:35+02:00 | 2026-10-07T10:14:35+02:00 | Define KnowledgeArea and classify glossary terms by subject |
| ba7cda0b4761413d4ff23f27a6981b850348b46b | 2026-10-07T10:06:06+02:00 | 2026-10-07T10:06:06+02:00 | Classify project knowledge by subject and transfer boundaries |
| 522186a80aa7be5c2d4149ca55227d8f858f86cf | 2026-10-07T09:58:03+02:00 | 2026-10-07T09:58:03+02:00 | Record project knowledge soundness review |
| 2d61886a55333634e1292eda9a5e2a9a8da8101f | 2026-10-07T09:07:34+02:00 | 2026-10-07T09:07:34+02:00 | Add project knowledge index |
| bc5b01ff7b5dab92173c3421f86ace3930d0059c | 2026-10-07T01:10:16+02:00 | 2026-10-07T01:10:16+02:00 | Align concern commit guidance and require pre-draft checks |
| f85c37645fac101f138858d1a63a0eef120a8680 | 2026-10-07T00:59:26+02:00 | 2026-10-07T00:59:26+02:00 | SC-044: Organize inquiry into persistent Notes and Tickets tabs |
| d35f5007c29912d7a6d4a58906043fa246d19a21 | 2026-10-07T00:50:00+02:00 | 2026-10-07T00:50:00+02:00 | Improve ticket card contrast and touch targets |
| b96cef629bcf0de204b000b87c38d7766c8178f2 | 2026-10-07T00:44:34+02:00 | 2026-10-07T00:44:34+02:00 | Share meta toolbar theme colors |
| 4e8b070321016e3067c4d54d20d112777b816638 | 2026-10-07T00:42:30+02:00 | 2026-10-07T00:42:30+02:00 | Consolidate shared tooltip typography |
| 3a8dfb5973692025e0f4196f442d908abfd74594 | 2026-10-07T00:40:37+02:00 | 2026-10-07T00:40:37+02:00 | Reuse shared palette in meta toolbars and toggle |
| e7fba6df395ff012699f0639f24b1d34358b404f | 2026-10-07T00:38:02+02:00 | 2026-10-07T00:38:02+02:00 | Share accent card surfaces across system views |
| 2b632bd16e97325a3b60a24b2d77994912180739 | 2026-10-07T00:36:07+02:00 | 2026-10-07T00:36:07+02:00 | Extract opt-in global styles for native text controls |
| 748351d6b729dbc83ebbc691322d8b2f21ffdac8 | 2026-10-07T00:34:03+02:00 | 2026-10-07T00:34:03+02:00 | Centralize shared System Plan and Glossary colors |
| 41205f96c136b5cd818e5ac91803d510d361f9b0 | 2026-10-07T00:30:12+02:00 | 2026-10-07T00:30:12+02:00 | SystemConcern-056: style the concern search field |
| 2daa08256816a52ba2b0891c9fbf2cbac50de754 | 2026-10-07T00:25:24+02:00 | 2026-10-07T00:25:24+02:00 | SystemConcern-050: resolve shared source in client development |
| 1fe7557a44f3afe35ccf9f05790cc5c6cb042427 | 2026-10-07T00:15:28+02:00 | 2026-10-07T00:15:28+02:00 | Extract remaining component templates and styles |
| 1e1b4130cad7822a5de3c7845ccbe62c95527168 | 2026-10-07T00:11:37+02:00 | 2026-10-07T00:11:37+02:00 | SystemConcern-056: add concern search with external template and styles |
| cbfa6aded8b7bdacdc5c0ca8e64d5eff55942809 | 2026-10-07T00:00:11+02:00 | 2026-10-07T00:00:11+02:00 | SystemConcern-053: replace Git undo repositories with subprocess boundary mock |
| a067a83d94055e231307bf07e167edc1fcadb699 | 2026-10-06T23:57:10+02:00 | 2026-10-06T23:57:10+02:00 | SystemConcern-053: migrate ticket storage tests to filesystem boundary mocks |
| ac47dcaa1ea67e3ee78d4752ff907ba9b6fb34c2 | 2026-10-06T23:53:01+02:00 | 2026-10-06T23:53:01+02:00 | SystemConcern-053: replace startup persistence fixtures with boundary mocks |
| 72b94ce266505222eb120c636922d5b53446aba2 | 2026-10-06T23:50:34+02:00 | 2026-10-06T23:50:34+02:00 | SystemConcern-055: record API service coupling risk |
| a74005e45baea74402ebedc0531332a3d0afb781 | 2026-10-06T23:43:37+02:00 | 2026-10-06T23:43:37+02:00 | Make problem inquiry the default client route |
| aac2f3d0fb437566663848718f6f0652b5665f81 | 2026-10-06T23:41:45+02:00 | 2026-10-06T23:41:45+02:00 | Move system plan link to the meta toolbar |
| ae3c776633a79a71821a3eb539656c6430db0d06 | 2026-10-06T23:25:30+02:00 | 2026-10-06T23:25:30+02:00 | Make system plan the default client route |
| 83a66e420f34a3c1fa9aa89627d2d63d1e5f5ab8 | 2026-10-06T23:21:25+02:00 | 2026-10-06T23:21:25+02:00 | Add dev:client script for consistent development commands |
| 28636aa35b628a3cd71fc37232520c42b2fab13a | 2026-10-06T23:17:16+02:00 | 2026-10-06T23:17:16+02:00 | SystemConcern-053, SystemConcern-054: mock filesystem operations and record interface candidate |
| 7824968023f8ba65e5452be7d0a48fa03c7b7e41 | 2026-10-06T23:08:54+02:00 | 2026-10-06T23:08:54+02:00 | SystemConcern-053: remove authentication filesystem fixtures |
| b289a5b60ccc1ce09831a6f584d956f670379e95 | 2026-10-06T23:06:39+02:00 | 2026-10-06T23:06:39+02:00 | SystemConcern-053: mock phase and glossary file reads |
| 465fdf099f67d38d331b95008403db70ff83d0be | 2026-10-06T23:02:02+02:00 | 2026-10-06T23:02:02+02:00 | SystemConcern-053: replace system-plan fixture writes with boundary mock |
| 5979215c20fcc6624d751bd953298b6c0831066b | 2026-10-06T22:57:14+02:00 | 2026-10-06T22:57:14+02:00 | SC-036, SC-053: distinguish acceptance and record test I/O concern |
| bc9372ed7ed70a6128f8f0cf21fa8f1eb898b87f | 2026-10-06T22:35:20+02:00 | 2026-10-06T22:35:20+02:00 | Test Git fixtures without autocrlf conversion |
| 10b0c1ed39e999703926e51326136a77807b5f8f | 2026-10-06T22:30:32+02:00 | 2026-10-06T22:30:32+02:00 | SC-035: serve plan from concern register |
| 6e99b76720ff56bc344f53aed43043403cddbd1a | 2026-10-06T10:10:02+02:00 | 2026-10-06T10:10:02+02:00 | Meta-018: first meta-meta cadence evaluation after 10 implemented slices |
| 476bfb595dbffaaf3478681c99521e4d7cbdb171 | 2026-10-06T10:09:01+02:00 | 2026-10-06T10:09:01+02:00 | SystemConcern-26: filter the ticket list by assignee |
| 91f42e5dcdf8168de26a1c14b058cbe07872871d | 2026-10-06T10:05:49+02:00 | 2026-10-06T10:05:49+02:00 | SystemConcern-47: note that the dependency graph is a DAG by construction |
| a14566028d2dd68a8aa88d10b24263ce77c99d6a | 2026-10-06T10:04:54+02:00 | 2026-10-06T10:04:54+02:00 | SystemConcern-47: refuse creating a ticket that depends on an unknown id |
| 62a06f008f5caaee9002ee003d728abee0be4e6d | 2026-10-06T10:02:32+02:00 | 2026-10-06T10:02:32+02:00 | SystemConcern-29: replace the duplicate-of free-text box with a ticket picker |
| 6730b7fb0f0f08a5ae32fecebec32e91e9c6b141 | 2026-10-06T09:59:21+02:00 | 2026-10-06T09:59:21+02:00 | SystemConcern-29: refuse marking a ticket duplicate of a nonexistent original |
| 26fc684b9fad8d6be93312a0b2238b2cf625313d | 2026-10-06T09:57:52+02:00 | 2026-10-06T09:57:52+02:00 | SystemConcern-29: surface the server refusal reason in error messages |
| ab38d3a726c7bcee7e6dc46cf7d574e0fedf6da1 | 2026-10-06T09:53:42+02:00 | 2026-10-06T09:53:42+02:00 | SystemConcern-47: let the framing form set dependsOnTicketIds |
| 35e35d0a4eaff29c85df1744ee8e2131a5d6be04 | 2026-10-06T09:50:04+02:00 | 2026-10-06T09:50:04+02:00 | SystemConcern-47: add dependsOnTicketIds field and display it on cards |
| 8d3b3b0a028768ff9c967f02b95ef1c2e29036bc | 2026-10-06T09:47:04+02:00 | 2026-10-06T09:47:04+02:00 | SystemConcern-47: decide the depends-on ticket relation is real, directed, many-to-many |
| 7d4020e7f99126176cdf8c143bc2ab9cd5714a9e | 2026-10-06T09:45:01+02:00 | 2026-10-06T09:45:01+02:00 | SystemConcern-20: record note reject/defer decisions |
| 102f6dbab6448b64d29d51189b75f0cb870ba5b6 | 2026-10-06T09:39:42+02:00 | 2026-10-06T09:39:42+02:00 | SystemConcern-29: sort tickets by assignee |
| cacc9c38fd7fa5bcf0b54f1ebdccbf2ba08e5292 | 2026-10-06T09:33:41+02:00 | 2026-10-06T09:33:41+02:00 | SC-043: show ticket counts by lifecycle state |
| 905a837f1314c23d61a1c2832cadaa8ce41100d5 | 2026-10-06T09:27:33+02:00 | 2026-10-06T09:27:33+02:00 | SystemConcern-029: record team/role assignee Type review (not yet justified) |
| 182a5133f2001bddbe4434fe8365fe5a42594707 | 2026-10-06T09:19:46+02:00 | 2026-10-06T09:19:46+02:00 | Add Meta-017 and SystemConcern-51: keyboard shortcut for meta layer |
| efb8c02c016078fb06bde32727ca7c076b46d3a9 | 2026-10-06T09:14:32+02:00 | 2026-10-06T09:14:32+02:00 | System_Concern-050: client @shared import error on each rebuild |
| 4c92bb46d029dff7ee553e2c611fe6b93da8915d | 2026-10-06T09:08:45+02:00 | 2026-10-06T09:08:45+02:00 | Number the Meta Notes as Meta-NNN |
| 1ac5832f538999eaf4e42180b316f54f341b2133 | 2026-10-06T09:01:57+02:00 | 2026-10-06T09:01:57+02:00 | Principles: naming/style choices are revisable, not fixed |
| 39849170d8948dfa7895d95304e5d3c9d741894c | 2026-10-06T08:58:20+02:00 | 2026-10-06T08:58:20+02:00 | P-005: present short, subject-only commit messages for approval |
| da6feb6308ddb753a2bc18dfefa6d0891c2600eb | 2026-10-06T08:51:22+02:00 | 2026-10-06T08:51:22+02:00 | P-011: drop the redundant concerns in SC-NN concerns wording |
| c203a8d3ffc5f69c1d24e69da60ee97f46f51db6 | 2026-10-06T08:46:41+02:00 | 2026-10-06T08:46:41+02:00 | Merge P-012 and P-013 into one naming-review principle |
| 2dd9d338fdd3e3a5a80cafb8e50c6d015b5626ea | 2026-10-06T08:41:48+02:00 | 2026-10-06T08:41:48+02:00 | Add P-013: verify user-suggested names for consistency and sense |
| 4e1df87e58153b6f4e17d43cc5134653a9adfdb8 | 2026-10-06T08:40:31+02:00 | 2026-10-06T08:40:31+02:00 | SC-049: adopt Rule Set as the preferred name, per P-012 |
| 5e11962b15c6bf067653ce1ffbb48fabc49e15fc | 2026-10-06T08:39:13+02:00 | 2026-10-06T08:39:13+02:00 | Add P-012: surface Type/Term candidate moments for user review |
| 177573b53493b1aa416bc61bfdd55731ed4d5c77 | 2026-10-06T08:37:46+02:00 | 2026-10-06T08:37:46+02:00 | Add SC-049: export, hydrate, and persist the accumulated rule set |
| 7877e9e765c92470f85f1b48f0b9e588139edfc5 | 2026-10-06T08:35:09+02:00 | 2026-10-06T08:35:09+02:00 | Record the code/system-rot research findings in the register |
| 32de9ab2cfedc2a2849a37eae36f8c62fefbc693 | 2026-10-06T08:34:44+02:00 | 2026-10-06T08:34:44+02:00 | Remove the unused rubico dependency (code-rot finding) |
| 75d52a4a64db2022a6b9ea75394a238e479289c6 | 2026-10-06T08:27:23+02:00 | 2026-10-06T08:27:23+02:00 | Record the code-quality research findings that were missed at the time (P-010 gap) |
| ce5e7c31411ec6beb804c11cae94c3782f0bd541 | 2026-10-06T08:24:59+02:00 | 2026-10-06T08:24:59+02:00 | P-011: distinguish where an XX word versus an NN word gets recorded |
| 7920da13129064897ff51240e5b96e8160c0935e | 2026-10-06T08:22:22+02:00 | 2026-10-06T08:22:22+02:00 | P-011: let the user optionally assign a canonical word for a specific NN |
| ae507ddb6d7ccbbcc801fdd9b7bc0c11057e8b33 | 2026-10-06T08:20:54+02:00 | 2026-10-06T08:20:54+02:00 | Note that the XX-NN naming trial concluded with no change |
| fd1cd411438e56032415c61cdf90f1b831cc84c3 | 2026-10-06T08:11:11+02:00 | 2026-10-06T08:11:11+02:00 | Correct Meta Note: SinglePhraseExpression was a placeholder, not a rejected candidate |
| 0cf26efa4c57408a0cd352f7e56f6511663270dc | 2026-10-06T08:08:53+02:00 | 2026-10-06T08:08:53+02:00 | Add P-011: identify the referenced concern in commit messages |
| 3cc7dcbd3428e4841c7369708e7fd78d9f323275 | 2026-10-06T08:01:36+02:00 | 2026-10-06T08:01:36+02:00 | Enforce 100% client coverage automatically via Jest coverageThreshold |
| 400f6912e5fd15c38648b4d5f3e53c1a4f0c559f | 2026-10-06T04:03:27+02:00 | 2026-10-06T04:03:27+02:00 | Add SC-048: validate the layout and style of every route |
| 87759c031bb30b81a3b09261ca50817abe1ad0af | 2026-10-06T03:59:41+02:00 | 2026-10-06T03:59:41+02:00 | SC-031: record and show the Red-Green-Refactor phase explicitly |
| 7354baa71bd3d995c672a60cd41abb517584a324 | 2026-10-06T03:46:27+02:00 | 2026-10-06T03:46:27+02:00 | Add SC-047: visualize ticket dependencies as a graph |
| 39a9f2afaf6f9fd13b349e0031883544a53f22c9 | 2026-10-06T03:44:51+02:00 | 2026-10-06T03:44:51+02:00 | Add SC-045 and SC-046: export to and import from external systems |
| 19f4b8e2cef1835514d8748a83a5e2e63c046b68 | 2026-10-06T03:41:12+02:00 | 2026-10-06T03:41:12+02:00 | Add SC-044: reconsider the problem-inquiry route's layout as the page grows |
| c1e9e6bb7feeb3a321386ec590bda84235f5b667 | 2026-10-06T03:39:21+02:00 | 2026-10-06T03:39:21+02:00 | SC-031: poll the Red/Green test-run status instead of loading it once |
| 88bf7dd681eaad2bc9fcc3726f6209f9301e9490 | 2026-10-06T03:32:14+02:00 | 2026-10-06T03:32:14+02:00 | SC-026: filter the ticket list by lifecycle state |
| 648d19b6a1156c21056f2b817d3234092143eca0 | 2026-10-06T03:26:10+02:00 | 2026-10-06T03:26:10+02:00 | Add SC-043: show aggregate metrics across the ticket set |
| 4eccc37e06dc05b92779288e6cd6ef609c5e3bec | 2026-10-06T03:24:11+02:00 | 2026-10-06T03:24:11+02:00 | SC-042: remember the metric switch across reloads |
| d098a1ba864106ee7c1968873a9dd1c2b71736e5 | 2026-10-06T03:18:01+02:00 | 2026-10-06T03:18:01+02:00 | Move ticket list and inquiry page templates and styles into separate files |
| 8a9d351fd3db9b472dcbc662db8bd7d800ed1bbe | 2026-10-06T03:15:06+02:00 | 2026-10-06T03:15:06+02:00 | Add lifecycle action buttons and duplicate marking to tickets (SC-029) |
| ca3c8241f429dc9eb56deab0bfa445d0be95f332 | 2026-10-06T03:13:21+02:00 | 2026-10-06T03:13:21+02:00 | Show ticket history in the framed-ticket list (SC-021) |
| 68a755c1b12007cab556a2ef0256c0773f19d117 | 2026-10-06T03:11:31+02:00 | 2026-10-06T03:11:31+02:00 | Add ticket edit form to the framed-ticket list (SC-021) |
| 8cfbf8ba2308d7f5769c37b17269a57e3b82507b | 2026-10-06T03:09:15+02:00 | 2026-10-06T03:09:15+02:00 | Edit ticket content with history on server and client service (SC-021) |
| 3f1926444c8570760a33c6f03dad769e7ae9bf1d | 2026-10-06T03:05:21+02:00 | 2026-10-06T03:05:21+02:00 | Enter and validate ticket estimates (SC-042 second slice) |
| 780f3eb8a6698342606272392bc3d064fb276e60 | 2026-10-06T03:03:15+02:00 | 2026-10-06T03:03:15+02:00 | Show calculated metrics on tickets with a method switch (SC-042 first slice) |
| 2f31486f6043a2df14ecadd044d71c0818b941e3 | 2026-10-06T03:00:20+02:00 | 2026-10-06T03:00:20+02:00 | Add assign UI for stored tickets (SC-029 first slice) |
| e105a4888a75cfad9e11de031dec388fa9ecb7e5 | 2026-10-06T02:58:09+02:00 | 2026-10-06T02:58:09+02:00 | Show ticket state badge in the framed-ticket list (SC-021) |
| c95d6cb90d76a0e5a90ac1b83f53c2895b414309 | 2026-10-06T02:55:20+02:00 | 2026-10-06T02:55:20+02:00 | Add file-backed ticket store (SC-028) |
| c7bcc4d4b5c4e324c178dfa0749150dd345eb57b | 2026-10-06T02:52:03+02:00 | 2026-10-06T02:52:03+02:00 | Inquiry page loads and saves tickets through the server (SC-028) |
| 2e11877766ae4f486b32bf50e9c06315a5dd7182 | 2026-10-06T02:48:44+02:00 | 2026-10-06T02:48:44+02:00 | Add ticket methods to the client BackendService (SC-028) |
| a51bbf16bfb60956e29111722c2304a6602138d8 | 2026-10-06T02:45:30+02:00 | 2026-10-06T02:45:30+02:00 | Add SC-042: calculated metrics on tickets |
| bf361f9cc730e74a78f763c6f2da800066fa3e98 | 2026-10-06T02:39:26+02:00 | 2026-10-06T02:39:26+02:00 | Remove generated Angular boilerplate from server README |
| a6978afca349cd644c775e3b7ea2424ab351d5ed | 2026-10-06T02:38:44+02:00 | 2026-10-06T02:38:44+02:00 | Document the server layout and ticket API |
| f645c15b91929e120875bc2eae67266567501c4e | 2026-10-06T02:37:27+02:00 | 2026-10-06T02:37:27+02:00 | Add ticket routes to the server (SC-028) |
| 7829f423d04fdf3aa7d3b52220108111a27b6410 | 2026-10-06T02:32:59+02:00 | 2026-10-06T02:32:59+02:00 | Move ticket lifecycle to server domain (SC-028) |
| 6f34b33595299f5891510c73c9c129996333be41 | 2026-10-06T02:30:30+02:00 | 2026-10-06T02:30:30+02:00 | SC-028 first slice: ticket storage port and in-memory store |
| 5e230684eab63c66edd9714bc28089a9fc887edb | 2026-10-06T02:26:05+02:00 | 2026-10-06T02:26:05+02:00 | Move the meta layer toggle into the problem app menu with a subtler style |
| 152e24143b133d46c21f339e3119735dbf8df1af | 2026-10-06T02:22:32+02:00 | 2026-10-06T02:22:32+02:00 | Remove the Loading current placeholder from the status toolbar |
| 70b99b6894291dd76e00e19fa3132c108378db39 | 2026-10-06T02:21:15+02:00 | 2026-10-06T02:21:15+02:00 | Style the bottom status toolbar to match the meta menu |
| 189461b8e6e15b95418cfc60d1f1146cbbed20b2 | 2026-10-06T02:19:57+02:00 | 2026-10-06T02:19:57+02:00 | Record in SC-039 that the 100% coverage rule stays |
| 75de3e57fd70f520dfee65eeb47bf29ebdd4008d | 2026-10-06T02:18:04+02:00 | 2026-10-06T02:18:04+02:00 | Add SC-035..SC-041 from the workflow review |
| 14863338f20fff032578cf07c583a6164ea0698b | 2026-10-06T02:12:52+02:00 | 2026-10-06T02:12:52+02:00 | Show DevEnv as the meta badge and drop the Meta text (SC-034) |
| 896d70a942550322f2d681d28ecd1f001e295b4a | 2026-10-06T02:11:23+02:00 | 2026-10-06T02:11:23+02:00 | Meta menu takes the label bar styling; remove label bar (SC-034) |
| 64b8506f55d46005f2390e9164e8e0087cbe74b4 | 2026-10-06T02:09:47+02:00 | 2026-10-06T02:09:47+02:00 | Record user wording in SC-034 |
| 8c49027b2b73d7b7150dfd9f74e95a7306c33f32 | 2026-10-06T02:06:49+02:00 | 2026-10-06T02:06:49+02:00 | Add SC-034: meta menu takes the label bar styling |
| 85b2a2a44064162e5876f10f3ae892933b9a21b4 | 2026-10-06T02:04:36+02:00 | 2026-10-06T02:04:36+02:00 | Style the glossary as a responsive card grid (SC-022) |
| db34fe7b32fa1295ba7b5bc31c6fe4acafb859ff | 2026-10-06T02:02:01+02:00 | 2026-10-06T02:02:01+02:00 | Fix meta toolbar scrollbar and oversized buttons (SC-033) |
| a9a8afa64183326bc9d9a2730bac0a31b18c2846 | 2026-10-06T01:59:28+02:00 | 2026-10-06T01:59:28+02:00 | Add SC-033: meta toolbar scrollbar and oversized text |
| 386c9df2aea4e0ae9366a494ada4d4f1ec788a27 | 2026-10-06T01:57:25+02:00 | 2026-10-06T01:57:25+02:00 | Add SC-032: show the current task in the meta toolbar |
| a218c63b64ffdcc5f86b15256e12a76e624cf81a | 2026-10-06T01:56:09+02:00 | 2026-10-06T01:56:09+02:00 | Add SC-031: show Red-Green-Refactor in the meta app |
| 737c9b588c151141773fad51ec01a0edf9fa90b7 | 2026-10-06T01:54:45+02:00 | 2026-10-06T01:54:45+02:00 | Add ticket lifecycle Types and transition rules (SC-021 first slice) |
| d4484cc2c4dabb9a66f4f61582a4afcda35020c9 | 2026-10-06T01:52:39+02:00 | 2026-10-06T01:52:39+02:00 | Settle remaining SC-028 design questions |
| a89a88f5513c465a5ead5b3b947cba969cb3d871 | 2026-10-06T01:51:22+02:00 | 2026-10-06T01:51:22+02:00 | Record user identity decisions for SC-028 |
| 441a30535117adb01372c0ab13e4b450d930a947 | 2026-10-06T01:49:58+02:00 | 2026-10-06T01:49:58+02:00 | Record SC-028 storage decisions |
| de53e711acf03baa2a485d0c50bc8df0ec765ba0 | 2026-10-06T01:46:51+02:00 | 2026-10-06T01:46:51+02:00 | Record SC-021 ticket lifecycle decisions |
| 84f24c62203582a731c39d36e73366b4fe38223c | 2026-10-06T01:42:17+02:00 | 2026-10-06T01:42:17+02:00 | Add SC-030: calm, consistent color system |
| d0d7c5cc998e50b07a070c1a257e6dc8d89d73b4 | 2026-10-06T01:40:19+02:00 | 2026-10-06T01:40:19+02:00 | Compact meta toolbar and unify meta layer colors |
| f5a48a504209b5450d750a3674e5293a6148ee77 | 2026-10-06T01:36:14+02:00 | 2026-10-06T01:36:14+02:00 | Add SC-028 persistence and SC-029 ticket assignment concerns |
| 36c84fddaa7a5e42e75686e9ce8d572254f74a3c | 2026-10-06T01:34:21+02:00 | 2026-10-06T01:34:21+02:00 | Add SC-027: scope glossary terms by domain level |
| 853e56dc07099e64742c12ac62ca56fb06ebb9fc | 2026-10-06T01:30:48+02:00 | 2026-10-06T01:30:48+02:00 | Add meta note on home-grown ID schemes |
| 55cae917e7f41565922682cd14ac53cea5ba0e55 | 2026-10-06T01:28:22+02:00 | 2026-10-06T01:28:22+02:00 | Add sorting and search to the framed ticket list (SC-026) |
| 8859eff1eb8d3124777aa34d18222c25fc7ee6c7 | 2026-10-06T01:24:41+02:00 | 2026-10-06T01:24:41+02:00 | Record SC-026 sort and search decisions |
| fe1d029c14440e99ddff3a5a99d46e39dd85d440 | 2026-10-06T01:22:52+02:00 | 2026-10-06T01:22:52+02:00 | Add SC-026 concern for sorting and searching the ticket list |
| 4322a30455d0579f7a69c04ca58ab920d996d770 | 2026-10-06T01:20:59+02:00 | 2026-10-06T01:20:59+02:00 | Add SC-025 concern for an AI chatbot in the meta app |
| 39d7863a3baf9632150236d3214bedcd215cec9c | 2026-10-06T01:19:27+02:00 | 2026-10-06T01:19:27+02:00 | Add P-010 meta-level reflection rule and first meta notes |
| 2a0578407c86d0246c87e94b75698fe426b8d957 | 2026-10-06T01:16:13+02:00 | 2026-10-06T01:16:13+02:00 | Finish SC-024: remove duplicate host link, compact toolbar, validate |
| 1c0d221e998238a850dd082c1e671ef2a7fd26b7 | 2026-10-06T01:13:52+02:00 | 2026-10-06T01:13:52+02:00 | Add always-visible problem-domain navigation inside the inner app (SC-024) |
| 3eab1fa80f419311b7d9fc1d663904936699929b | 2026-10-06T01:11:26+02:00 | 2026-10-06T01:11:26+02:00 | Add hidden-by-default meta layer switch around the routed app (SC-024) |
| 9aed5cb92336af6edf9ecadc93cedfe5fabb28ed | 2026-10-06T01:05:48+02:00 | 2026-10-06T01:05:48+02:00 | Settle remaining SC-024 open questions |
| 73f580f8dfa1769dfb8b205fbd2d394a7872a340 | 2026-10-06T01:03:56+02:00 | 2026-10-06T01:03:56+02:00 | Record SC-024 decisions on switch, persistence, frame, and scope |
| 4a4a2f95f47d03f49732b2f5cd10c730607935c1 | 2026-10-06T01:02:07+02:00 | 2026-10-06T01:02:07+02:00 | Record SC-024 direction: hidden meta layer with a switch |
| 02adbb3166bb2debb811a3df10426588eea94a8c | 2026-10-06T00:58:42+02:00 | 2026-10-06T00:58:42+02:00 | Add high-priority SC-024 concern for host app integration |
| a087b8d435d0926102eaa6fe3a11bc45cdee5d9b | 2026-10-06T00:54:53+02:00 | 2026-10-06T00:54:53+02:00 | Add SC-022 and SC-023 glossary layout and quick search concerns |
| bce30a0f6b8aca344bda4af8a1cef37d3ccf03e9 | 2026-10-06T00:53:25+02:00 | 2026-10-06T00:53:25+02:00 | Add SC-020 and SC-021 concerns for review decisions and ticket lifecycle |
| 162045f89b22d496874a7a7ba5502cfdf558c9e4 | 2026-10-06T00:50:38+02:00 | 2026-10-06T00:50:38+02:00 | Record real WMS report validation evidence |
| e64f9e9cb697727eef6094f14f787007d88ab0b5 | 2026-10-06T00:44:34+02:00 | 2026-10-06T00:44:34+02:00 | Define system concern in glossary |
| 0c31a17d0bc2eee79a5768b1cdd0507741e87ee4 | 2026-10-06T00:42:54+02:00 | 2026-10-06T00:42:54+02:00 | Use responsive grid for inquiry workflow |
| 51646efae60e7a29229e19631d683a2a4ee7b2b4 | 2026-10-06T00:41:13+02:00 | 2026-10-06T00:41:13+02:00 | Add sample and real data visibility toggle |
| 70a79cfbc39d9525daf2c9ddb55438908e2fd305 | 2026-10-06T00:36:05+02:00 | 2026-10-06T00:36:05+02:00 | Add concern terminology clarification task |
| 17a853c5fff9eae721236cb8386d84d7edd14f3a | 2026-10-06T00:34:47+02:00 | 2026-10-06T00:34:47+02:00 | Add domain vocabulary review principle |
| 9e7facfe0489ea4da115b12d0ed419eebf0635b5 | 2026-10-06T00:31:28+02:00 | 2026-10-06T00:31:28+02:00 | Add wide-screen inquiry layout concern |
| 7d41e29ef85e6381b7a999e880e96f09a81cfeb0 | 2026-10-06T00:29:00+02:00 | 2026-10-06T00:29:00+02:00 | Add sample and real data visibility task |
| 480b7dbe1bb2eabe7b0347c5a738ece67a827635 | 2026-10-06T00:19:26+02:00 | 2026-10-06T00:19:26+02:00 | Add long-task continuation gate |
| 5b5f2592130ab978627567ec2090461347b8092c | 2026-10-06T00:15:21+02:00 | 2026-10-06T00:15:21+02:00 | Update review concern validation evidence |
| e99be5a1c096edea637b801ba49eead167ab3c63 | 2026-10-06T00:14:50+02:00 | 2026-10-06T00:14:50+02:00 | Connect explicit ticket framing workflow |
| 667a26b2dc0a6e73ebbaf3df94c00acc5d157c95 | 2026-10-06T00:11:44+02:00 | 2026-10-06T00:11:44+02:00 | Build framed problem ticket list |
| 049059208011d3a53e9acc2c282ae7f1523cb7b6 | 2026-10-06T00:10:21+02:00 | 2026-10-06T00:10:21+02:00 | Build explicit problem ticket framing |
| 8574e139af0ad284ecba7822525dbb6291924fc6 | 2026-10-06T00:07:18+02:00 | 2026-10-06T00:07:18+02:00 | Require explicit Jest helper imports |
| 1776cb5ac9b4639bcbddf52b2ae9191fd70e197b | 2026-10-06T00:04:03+02:00 | 2026-10-06T00:04:03+02:00 | Add in-memory note provenance identity |
| 486cb694ef52ec100e16ebfe2ff1e93329701d89 | 2026-10-06T00:01:54+02:00 | 2026-10-06T00:01:54+02:00 | Plan explicit note-to-ticket framing |
| 9e0e8ddd88ec06d6d2ef869ed4093e823c7cf5fa | 2026-10-05T23:56:00+02:00 | 2026-10-05T23:56:00+02:00 | Model explicit problem ticket framing |
| b92ea98a5eb8da4ebc02e1fe9a4fa7818099b5ba | 2026-10-05T23:48:08+02:00 | 2026-10-05T23:48:08+02:00 | Fit current task status on small screens |
| 1d9f8a50a36301ef1eb370b86e8929f9078e3415 | 2026-10-05T23:43:58+02:00 | 2026-10-05T23:43:58+02:00 | Improve plan layout on narrow screens |
| 2b00df52f576c57f1c1292adc4d302bcd80c8f43 | 2026-10-05T23:38:00+02:00 | 2026-10-05T23:38:00+02:00 | Revise surrounding code permission rule |
| f4e9ff0b0755375aadb1f79088f498cb213cf7dd | 2026-10-05T23:35:20+02:00 | 2026-10-05T23:35:20+02:00 | Improve system plan small-screen layout |
| c844b66b8772f1507b8959e7a12ed521c3935fa4 | 2026-10-05T23:31:20+02:00 | 2026-10-05T23:31:20+02:00 | Polish system plan concern cards |
| 7a54858310cf8ae3c2f3b309ab26695496494ac1 | 2026-10-05T23:22:27+02:00 | 2026-10-05T23:22:27+02:00 | Add system plan status dashboard |
| 3823da4b85bade9fe183d2c9fdb6e6eb546c5ec1 | 2026-10-05T23:16:59+02:00 | 2026-10-05T23:16:59+02:00 | Complete problem inquiry vertical slice |
| c018c7ce786c7412c70ab133afc4f12ad1886e33 | 2026-10-05T23:08:15+02:00 | 2026-10-05T23:08:15+02:00 | wip |
| f7a6b5af63da748c1ba3b9b6c8acdf246685d8c9 | 2026-10-05T22:49:45+02:00 | 2026-10-05T22:49:45+02:00 | wip |
| 313830a450b0bf097353c76d3504ccc7cf3aa4ab | 2026-10-05T22:43:15+02:00 | 2026-10-05T22:43:15+02:00 | concerns |
| eedd09c41936a37978d9839f94ddffe99428143f | 2026-10-05T22:32:19+02:00 | 2026-10-05T22:32:19+02:00 | add more notes |
| 7fba8084bf88061a3d15ef9c2d4c99b237b1094e | 2026-10-05T22:30:35+02:00 | 2026-10-05T22:30:35+02:00 | input / problem set |
| 24057a42cf8de35e79cee08571bf697019f308c2 | 2026-10-05T22:24:41+02:00 | 2026-10-05T22:24:41+02:00 | initial |
| 3276a31b6741d9bd06a4f2a58c1727f45f831f45 | 2026-10-05T22:21:19+02:00 | 2026-10-05T22:21:19+02:00 | updated |
| 146d49837e10985d8751a47f6cc8f444d6390a5e | 2026-10-05T22:21:03+02:00 | 2026-10-05T22:21:03+02:00 | rules |
| b44e1c684f39fcc31ebd07f3f1ba0de38a9a33a5 | 2026-10-05T21:46:58+02:00 | 2026-10-05T21:46:58+02:00 | Time |
| 879447c54c444fb8741b5e39cf589b6c237ff1b7 | 2026-10-05T21:37:24+02:00 | 2026-10-05T21:37:24+02:00 | updated |
| 4f05ee3f5df96a334d13ef3907fb620b7bb06c15 | 2026-10-05T21:36:05+02:00 | 2026-10-05T21:36:05+02:00 | ai WMS spike |
| 825e59b76460c3ec965ee92dae2d9a532de63bf9 | 2026-10-05T21:32:18+02:00 | 2026-10-05T21:32:18+02:00 | initial |
| 22a43f1a3ba1aed9afe09287bca96d3cb4157597 | 2026-10-05T21:21:04+02:00 | 2026-10-05T21:21:04+02:00 | updated |
| f5150f73ed0c2069e195ab0fa98ab0a94017170d | 2026-10-05T21:05:39+02:00 | 2026-10-05T21:05:39+02:00 | free open exploration |
| 476eb404e63da223cfaddd3f8fe90ece51b7e51c | 2026-10-05T20:58:35+02:00 | 2026-10-05T20:58:35+02:00 | exploration |
| d4191c5b703423a9b50a8fe200c93d094bee6c85 | 2026-10-05T20:55:23+02:00 | 2026-10-05T20:55:23+02:00 | WMS exploration |
| 7525e1d9d94d3c22cd7ae7077ad65f508544dfe8 | 2026-10-05T20:41:03+02:00 | 2026-10-05T20:41:03+02:00 | Iteration (loop) |
| 3d38972f4df607071dc8b2c46a2312c0fe81ac31 | 2026-10-05T20:31:05+02:00 | 2026-10-05T20:31:05+02:00 | strip to core |
| 28c29206b18b1600688e38fca4c0fb230e85d7e8 | 2026-10-05T20:27:17+02:00 | 2026-10-05T20:27:17+02:00 | structural artifacts |
| 40879c3aa8198fa701ee5bd43a83006fd4f21b6c | 2026-10-05T20:12:11+02:00 | 2026-10-05T20:12:11+02:00 | spike blueprint |
| 1e5bc844820f4dab8a5391b5035b3a2c8e233f74 | 2026-10-05T20:05:30+02:00 | 2026-10-05T20:05:30+02:00 | add Spike |
| dd987a9b37f65a4a7e0a9a00c74c8eaf094ce9c9 | 2026-10-05T19:58:47+02:00 | 2026-10-05T19:58:47+02:00 | add behaviour |
| 3b0afe12f6b8eb61460e50163c6ba601c0fc1677 | 2026-10-05T19:33:36+02:00 | 2026-10-05T19:33:36+02:00 | updated |
| a0e62738d305a6b34e59c9200d1073020f6a3b47 | 2026-10-05T19:26:55+02:00 | 2026-10-05T19:26:55+02:00 | updated |
| 396613a8ccf738c601fd02d5573eb8f5263e8a6f | 2026-10-05T19:20:30+02:00 | 2026-10-05T19:20:30+02:00 | updated |
| 8b2216df94c5ea28daf05f0f0cfba3b671a1235b | 2026-10-05T19:10:29+02:00 | 2026-10-05T19:10:29+02:00 | updated |
| a321839fd28d90ea4a8f4df9090efc6888b586db | 2026-10-05T19:05:07+02:00 | 2026-10-05T19:05:07+02:00 | improved/separated |
| 9c3fee382e693c37d1271e5e894cd6517c6de8b2 | 2026-10-05T19:00:42+02:00 | 2026-10-05T19:00:42+02:00 | updated |
| 7ab0057d2eb328efb46b7daae2668a935a5217e6 | 2026-10-05T18:56:23+02:00 | 2026-10-05T18:56:23+02:00 | updated |
| 4cdef39f0c41cbbbdb40b9aa573024dbae7c4a34 | 2026-10-05T18:51:08+02:00 | 2026-10-05T18:51:08+02:00 | update |
| e47ad8230e497320c7b806e935b34fe47eda38e4 | 2026-10-05T18:48:14+02:00 | 2026-10-05T18:48:14+02:00 | updated |
| dffe02ab2a54e630278a387f615fcb63365b2037 | 2026-10-05T18:45:12+02:00 | 2026-10-05T18:45:12+02:00 | updated |
| 993d4555a67c9678d79541e94fbacc53f54eb959 | 2026-10-05T18:40:24+02:00 | 2026-10-05T18:40:24+02:00 | types and metatypes |
| 04707e428b3168e54ae2d45f64bb52e234234d82 | 2026-10-05T18:25:25+02:00 | 2026-10-05T18:25:25+02:00 | updated |
| addd576b2dfd22b92f872ef646f9b48ab45c794c | 2026-10-05T18:25:04+02:00 | 2026-10-05T18:25:04+02:00 | RICE |
| 3cad26a406ad9b4ed8e4259d26ab04a90c941d81 | 2026-10-05T18:19:34+02:00 | 2026-10-05T18:19:34+02:00 | more definitions |
| f9d49c67bbb116bd9c5904b48d3e90aecf5c0d08 | 2026-10-05T18:16:04+02:00 | 2026-10-05T18:16:04+02:00 | sytem-types review |
| 01bc8e0cb7ad25a5b6b4167863aa27213d90ab7e | 2026-10-05T18:04:28+02:00 | 2026-10-05T18:04:28+02:00 | minimal test suite |
| c373c2ae691dec9d7dfcdd8ec65dc9ab3e2c0670 | 2026-10-05T18:00:12+02:00 | 2026-10-05T18:00:12+02:00 | remove |
| e355904a1998493e94432748fe45e3fd0dd1c723 | 2026-10-05T17:58:22+02:00 | 2026-10-05T17:58:22+02:00 | removed |
| c81591cc99f2a0ba338c5eb9a1eaeec369c95a85 | 2026-10-05T17:55:06+02:00 | 2026-10-05T17:55:06+02:00 | initial |
| f8f8de722c8fd62e3577ed1e4f88c9b1e30ac9e1 | 2026-10-05T17:29:22+02:00 | 2026-10-05T17:29:22+02:00 | initial |
| fecb912877addc769770399cb119e0419bb6b183 | 2026-10-05T17:01:12+02:00 | 2026-10-05T17:01:12+02:00 | types |
| d757deafae09a84b01f3c3f75f92d1d790ab55d1 | 2026-10-05T16:55:00+02:00 | 2026-10-05T16:55:00+02:00 | initial |
| cb2125e6346aad77d70de2d23009c4c7cd1004da | 2026-10-05T16:49:42+02:00 | 2026-10-05T16:49:42+02:00 | remove history |
| 8d86ea5272492de97620fd05561fc9223726297b | 2026-10-05T16:44:33+02:00 | 2026-10-05T16:44:33+02:00 | removed all refs to PPT |
| 9cdee708daa0e5123f0ff7ca3f2e0d68937916bc | 2026-10-05T16:26:14+02:00 | 2026-10-05T16:26:14+02:00 | empty |
| 3e0d88b9215e738a3274540121e604551fecf4ae | 2026-10-05T16:23:25+02:00 | 2026-10-05T16:23:25+02:00 | remove all logic related to features including storage and buttons, forget everything you know about the current way of working, we will reset it. The ONLY thing that should keep working is that the route of creating a feature keeps working (by adding to ./features) and it should show up in the Open features tab |
| 33dfb04d0e97d4c91bdfb86794aa4c7b7605fa6d | 2026-10-05T16:18:44+02:00 | 2026-10-05T16:18:44+02:00 | remove all logic related to features including storage and buttons, forget everything you know about the current way of working, we will reset it. The ONLY thing that should keep working is that the route of creating a feature keeps working (by adding to ./features) and it should show up in the Open features tab |
| 4ba7167f568c193ddd3ada34d3fcebfcbbb42566 | 2026-10-05T16:14:48+02:00 | 2026-10-05T16:14:48+02:00 | remove all logic related to features including storage and buttons, forget everything you know about the current way of working, we will reset it. The ONLY thing that should keep working is that the route of creating a feature keeps working (by adding to ./features) and it should show up in the Open features tab |
| 38011d9ee4cf713e5a7287aac619790952d0d40d | 2026-10-05T16:05:14+02:00 | 2026-10-05T16:05:14+02:00 | remove all logic related to features including storage and buttons, forget everything you know about the current way of working, we will reset it. The ONLY thing that should keep working is that the route of creating a feature keeps working (by adding to ./features) and it should show up in the Open features tab |
| ed995222a768d75039dd938a6f409e724c1b85af | 2026-10-05T15:40:17+02:00 | 2026-10-05T15:40:17+02:00 | maybe unify the states Queued and Commited ? my thought was that Queued would mean it is in .current, while Commited means it is ready to be picked up as a next target |
| a6509d316d1d604121a572e6387adafa4ec4f60d | 2026-10-05T15:38:30+02:00 | 2026-10-05T15:38:30+02:00 | maybe unify the states Queued and Commited ? my thought was that Queued would mean it is in .current, while Commited means it is ready to be picked up as a next target |
| 720f1213af236ad2d74c073f1a250f86a5851b49 | 2026-10-05T15:25:18+02:00 | 2026-10-05T15:25:18+02:00 | denied features should be moved to .archive with Status Denied (remove all other copies if present) |
| d9df9eb1d2088013093a64ce76e6a09902f4ee31 | 2026-10-05T15:06:24+02:00 | 2026-10-05T15:06:24+02:00 | A Done record in `.current` should be removed from current and (back) to features (without duplicating it) and keep its status to Done |
| efd7c542964f6fca92448cb87a69e6a03ca3fc32 | 2026-10-05T14:52:23+02:00 | 2026-10-05T14:52:23+02:00 | demolish the workspace main menu link and the underlying components |
| eb5950b21e400b0940f0f70327641ece8081a5df | 2026-10-05T14:48:55+02:00 | 2026-10-05T14:48:55+02:00 | integrate the client backlog route on the features page below the tabsheet |
| 39475f546e0be24aacc4fb5803f6bf4d8cbc89f8 | 2026-10-05T14:13:06+02:00 | 2026-10-05T14:13:06+02:00 | add empty |
| c4873d41b675617d4621a2054488d118aa8fdd27 | 2026-10-05T14:09:01+02:00 | 2026-10-05T14:09:01+02:00 | wip |
| afc8f85b574628dc64a15525fe60edc9794d2ce6 | 2026-10-05T13:26:50+02:00 | 2026-10-05T13:26:50+02:00 | Merge pull request #7 from frunjik/workflow |
| f166402ca7388d414d92e89b759b7f0a16bfe137 | 2026-10-05T13:24:45+02:00 | 2026-10-05T13:24:45+02:00 | wip |
| 0ffd99bde342f8227f621c34fe285bf4f5753b2e | 2026-10-05T13:23:09+02:00 | 2026-10-05T13:23:09+02:00 | fix the style of the status selector on the queued tab on the client features page |
| 9c6dc252f15da8854834d61f161b591a9857e583 | 2026-10-05T13:19:47+02:00 | 2026-10-05T13:19:47+02:00 | add control to set status of features on page Queued tab in client |
| 75118f318801d64609ee21cb2fb628778e63f2ea | 2026-10-05T13:19:38+02:00 | 2026-10-05T13:19:38+02:00 | fix version |
| eac998596ae9771046efdfd3f5951ba45223a8ee | 2026-10-05T13:12:43+02:00 | 2026-10-05T13:12:43+02:00 | make the question tickets show in the open features tab on client feature page |
| 27c6aca42c6038c6f9870fbdbf0b056b1d0a1f73 | 2026-10-05T12:59:12+02:00 | 2026-10-05T12:59:12+02:00 | Update the README.md and CHANGELOG.md using the relevant commits from the git log |
| 4c5931ee93a7141603119739698f36910444757f | 2026-10-05T12:14:35+02:00 | 2026-10-05T12:14:35+02:00 | Add an archive all button on the Done tab of the client Features page |
| 31e7d01cc2f519b6ecf1f9c7729723b242d1c807 | 2026-10-05T12:05:23+02:00 | 2026-10-05T12:05:23+02:00 | keep the selected Features page tab in the URL (?tab=) |
| ce7c33f8186290284751d60490835676926e6c6c | 2026-10-05T12:02:28+02:00 | 2026-10-05T12:02:28+02:00 | empty |
| 79e266a3a22cba39d5a5aa198352bb9e5828583c | 2026-10-05T12:02:06+02:00 | 2026-10-05T12:02:06+02:00 | bundle of ~17 older items; check each and implement the missing ones |
| 96d7fe6c642c7b16a8d952f4472755ef47a0e93c | 2026-10-05T11:59:05+02:00 | 2026-10-05T11:59:05+02:00 | add an Archived Tab on the client Features Page as the last tab in the sheet |
| c184b5561359720b46ad3dbe1b1e6eb7b688efc9 | 2026-10-05T11:53:16+02:00 | 2026-10-05T11:53:16+02:00 | Items with status Queued or Commited should not show as open but as Queued |
| 3944729a4122068919e7abf9009a1d440a55b72e | 2026-10-05T11:45:15+02:00 | 2026-10-05T11:45:15+02:00 | now that the format of Features is standard JSON lets mofify the storage, migrate to three file stores: .features .current .archived. The client lists should filter on the appropriate status. Archived Features get status Archived and are moved to .archive (we will worry later about how). The only other store is the ./DEVENVOPDEV.md file (which is the set of features actively being worked on). |
| 5fa30eceee388ff57320d7d44fd821bbbd1cb92e | 2026-10-05T11:39:48+02:00 | 2026-10-05T11:39:48+02:00 | bundle of ~17 older items; check each and implement the missing ones |
| 6f5f87b1587624ead8ed9bf16841b3aa8cf34c6e | 2026-10-05T11:35:16+02:00 | 2026-10-05T11:35:16+02:00 | on commit move feature from current state to .delivered, and make it show in Done list and remove from Current |
| 20ce5aaa9722ed9ac04d992f7d23f298dafac45b | 2026-10-05T10:59:18+02:00 | 2026-10-05T10:59:18+02:00 | allow editing a Queued Feature on the client |
| da62e9e46d28781ba9d54d9bb3a4a56b8a73a616 | 2026-10-05T10:54:19+02:00 | 2026-10-05T10:54:19+02:00 | The client's Done tab reads from `.wishlist` this is wrong the wishlist should show as open |
| fb563c22df0ac85ad8bbcdaad07cd9de0c468e07 | 2026-10-05T10:44:33+02:00 | 2026-10-05T10:44:33+02:00 | always save feature as JSON |
| 4ac7f048736923af35f86fadf3178440869152ae | 2026-10-05T09:30:37+02:00 | 2026-10-05T09:30:37+02:00 | always save feature as JSON |
| 7816e46a88b63ee3b8db0f763997532638f6116f | 2026-10-05T09:27:01+02:00 | 2026-10-05T09:27:01+02:00 | remove merge |
| 6087657b69f2b8d9ea4d63aef403722f19a7da72 | 2026-10-05T09:17:10+02:00 | 2026-10-05T09:17:10+02:00 | fix typescript errors |
| 6aa97ab0d0a94ff68b89475179048b9d7e750e43 | 2026-10-05T09:11:31+02:00 | 2026-10-05T09:11:31+02:00 | bundle of ~17 older items; check each and implement the missing ones |
| 2cf56faae4917c1f0a4515159a4f1f5b1cc3608b | 2026-10-05T08:57:10+02:00 | 2026-10-05T08:57:10+02:00 | make the client feature show page wide |
| c3c9e6b4d226065ef84cbd60bf0f133ac8c73746 | 2026-10-05T08:54:09+02:00 | 2026-10-05T08:54:09+02:00 | make the client feature show page wide |
| a185cb18327c2707c6d373fa15881422546fac73 | 2026-10-05T08:52:48+02:00 | 2026-10-05T08:52:48+02:00 | before copying the commit message to the commit name dialog, strip the id and show the description |
| b70859783e355346ab52ba3902a9f9c024225ff3 | 2026-10-05T08:49:54+02:00 | 2026-10-05T08:49:54+02:00 | {"id":"1bacb871-9a38-4ac2-b35b-5ed8ce2e05ee","createdAt":"2026-10-05 08:35 +02:00","priority":"Low","status":"Done","deliveredDate":"2026-10-05","description":"when an item is put on .wishlist set its status to Wished"} |
| 07eb69537406d6f22bd216f5a42f1186db26b5b0 | 2026-10-05T08:44:53+02:00 | 2026-10-05T08:44:53+02:00 | {"id":"a2024ac4-6b66-4130-8e86-c9e12a60cdb4","createdAt":"2026-10-05 08:34 +02:00","priority":"Low","status":"Done","deliveredDate":"2026-10-05","description":"remove Feature from .wishlist when started; started features are written to .backlog with status Queued"} |
| 38ed8e3299fde241441080408364b9c1b8f6b118 | 2026-10-05T08:32:38+02:00 | 2026-10-05T08:32:38+02:00 | {"id":"c03b6097-f485-447f-975c-7b4ba53c32be","createdAt":"2026-10-05 08:04 +02:00","priority":"Low","status":"Done","deliveredDate":"2026-10-05","description":"remove @shared/ppt-fields and return an empty list for the fields on the API"} |
| 5d07d7424239077dccf85a92a9cacb6c7711881f | 2026-10-05T08:11:39+02:00 | 2026-10-05T08:11:39+02:00 | move types |
| d0193c6deb57400f12b5d8374d3fd05e250cd9de | 2026-10-05T07:59:23+02:00 | 2026-10-05T07:59:23+02:00 | Move types |
| ded8af3f45b54b77b07686102cac9d5c2c35e274 | 2026-10-05T07:47:13+02:00 | 2026-10-05T07:47:13+02:00 | migrating |
| cded121106515aaa0af7dbc9ef1be1f765ca5a4a | 2026-10-05T07:33:30+02:00 | 2026-10-05T07:33:30+02:00 | Features are now persisted as stringified JSON lines (unique id, createdAt, priority, status, description, deliveredDate?) in .wishlist; legacy lines migrate on read and the API format is unchanged. Client 221 and server 191 tests pass at 100% coverage. |
| 631eb2923f21e20a9434a2bff6beba76d7e5ee1d | 2026-10-05T07:24:17+02:00 | 2026-10-05T07:24:17+02:00 | Move and rename Models |
| ce2661d14e86bbe73ac534ec1aecfb6c8554e48e | 2026-10-05T07:18:40+02:00 | 2026-10-05T07:18:40+02:00 | reset |
| 9dbcd2ba6963aaf478560a4b004b39acaa6fc318 | 2026-10-05T07:17:40+02:00 | 2026-10-05T07:17:40+02:00 | PPTFeature |
| e792c997cba171025669bc1f709b7a0037cb6f99 | 2026-10-05T07:14:24+02:00 | 2026-10-05T07:14:24+02:00 | Added GET /ppt/fields returning the unique PPTField instances from the shared model definitions via @shared/ppt-fields. Shared build and all server tests pass at 100% coverage (188 tests); client remains 100% (217 tests). Server library build remains blocked by pre-existing TypeScript errors in features.ts and test-runner.ts. |
| 5995b61c54a2b18fa668b4e9925b2a1114b169fc | 2026-10-05T06:36:34+02:00 | 2026-10-05T06:36:34+02:00 | Add a list of all known PPTField instances as defined in @shared to the Field Editor client page; load through GET /ppt/fields, surface loading/errors, and verify 100% coverage plus the client build. |
| 436094ad2e534d998accbba420d94b2d049bb568 | 2026-10-05T06:21:13+02:00 | 2026-10-05T06:21:13+02:00 | Improve the PPTField editor and its /models container styling with a responsive card layout, clearer field grouping, and prominent actions; verify the client build and full coverage. |
| e5efdfe7e2cfa2f1dba0a334ad749f46b6b83f94 | 2026-10-05T06:18:40+02:00 | 2026-10-05T06:18:40+02:00 | Added a selectable PPTField editor to /models; Save updates the page's in-memory registry only and Cancel resets unsaved edits. Full client/server coverage passes at 100% (217 client and 187 server tests), and the client build passes. Pending Git commit. |
| 057e48c79400b17875e1f3e4793209c3c775cec5 | 2026-10-05T06:10:03+02:00 | 2026-10-05T06:10:03+02:00 | Implemented a standalone client PPTField editor for id, type, name, and title, with validated save and cancel outputs; focused and full client/server suites pass at 100% coverage, and the client build passes. Pending Git commit. |
| 36f80057724571ca4118888a925c554867dd8fbc | 2026-10-05T05:57:38+02:00 | 2026-10-05T05:57:38+02:00 | export core types |
| 3e9c434f5daa472a94fa6b758c2a35f851f2065f | 2026-10-05T05:53:16+02:00 | 2026-10-05T05:53:16+02:00 | WIP |
| f38415b4212b055a25a36bd72c97e64d7a271cd1 | 2026-10-05T05:46:31+02:00 | 2026-10-05T05:46:31+02:00 | Wip |
| e8356bab18efc9bdbad49a08199aaee7c106c2d6 | 2026-10-05T05:36:21+02:00 | 2026-10-05T05:36:21+02:00 | cleanup |
| b40da84b4f285a48a4105f160473a8762f14be82 | 2026-10-05T05:33:53+02:00 | 2026-10-05T05:33:53+02:00 | add |
| df20199d1a2e400e0d41de4b8a0fd205a58b9a23 | 2026-10-05T05:32:17+02:00 | 2026-10-05T05:32:17+02:00 | add |
| 37f16e4f2ce49f293b061184f334d1bc5d67e022 | 2026-10-05T05:29:58+02:00 | 2026-10-05T05:29:58+02:00 | [ac1be3e3-811a-41a6-9df1-8ec72c1f101e] [Medium] [In progress] show busy indicator on client bottom toolbar |
| 0283fde8fda64f03cca531e9723416ec8fc442ab | 2026-10-05T05:28:30+02:00 | 2026-10-05T05:28:30+02:00 | Implement a client-wide busy indicator in the bottom toolbar for active HTTP requests, then test request start/completion/error behavior and verify all coverage remains at 100%. |
| fe9f3e6d6b26a2a5f85f83ced1fca21e9747967c | 2026-10-05T05:15:51+02:00 | 2026-10-05T05:15:51+02:00 | Add an empty standalone client page at /glossary and verify that the route resolves with a focused test and client build. |
| 56bd9eeecdff3e7ccf1b3358b51253fec0337dd6 | 2026-10-05T05:02:30+02:00 | 2026-10-05T05:02:30+02:00 | WIP / unifiying data / models |
| cf648327e13e60b28cfdd18a4b6ac8cae2581b84 | 2026-10-05T04:52:13+02:00 | 2026-10-05T04:52:13+02:00 | Add public empty Model and Field meta-model interfaces to the shared package as requested, then verify their export surface with the shared build and record completion. |
| 8342d5482fe26845662ad9799533a35dee64b43b | 2026-10-05T04:40:06+02:00 | 2026-10-05T04:40:06+02:00 | Record the clarified JSON feature schema decision to include both a committed boolean and a commit hash; close this design clarification without changing the current .features persistence format. |
| aab0d009527a95bb8f662925c2494d93cf0911bb | 2026-10-05T04:22:52+02:00 | 2026-10-05T04:22:52+02:00 | With the clarification that both versions should be maintained as release metadata and shown at runtime, add client and server version sources, expose the server version through the API, display both in the client status area, and cover the public interfaces. |
| 5af544f4bfc6f7336a51862385477bdab177c0d4 | 2026-10-05T03:52:04+02:00 | 2026-10-05T03:52:04+02:00 | Implement a server endpoint that safely undoes the latest Git commit, first inspecting existing Git endpoint conventions and choosing a non-destructive operation with public API tests. |
| 3858415993b9d86564c6d82662fd00facfcc3fd5 | 2026-10-05T03:43:33+02:00 | 2026-10-05T03:43:33+02:00 | wip |
| 8da932e4b77c925d8681c8a8ecc8fa24641ed855 | 2026-10-05T03:43:02+02:00 | 2026-10-05T03:43:02+02:00 | Add Committed to the shared feature status contract, server persistence/validation, and client controls; on successful commits, mark the active feature Committed instead of deleting it, clear active task state, and cover the behavior through server-backed tests. |
| 22c71308ca1c379455406ab1c1eae35a8d7dd66c | 2026-10-05T03:31:37+02:00 | 2026-10-05T03:31:37+02:00 | Implement feature duplicate merging using case-insensitive unique word tokens: four or more shared terms identify a duplicate; preserve the existing feature identity/status/priority and append the new description, with public API tests for threshold and persistence. |
| b0a165ff1a643786e7fcac43d85215419efd82af | 2026-10-05T03:22:00+02:00 | 2026-10-05T03:22:00+02:00 | Record the supplied feature-priority score mapping as the resolved design decision: scores 1–3 map to High, 4–7 to Medium, and 8–9 to Low; close the clarification task without changing production behavior. |
| 8defc67a7b952b6f751b14b94ea1aedb5994209e | 2026-10-05T03:10:41+02:00 | 2026-10-05T03:10:41+02:00 | Preserve HTTP failures from BackendService file load/save/folder methods; display failures in the file editor and browser, then verify server-backed error paths and 100% client coverage. |
| 86c5a7f18556ae2caa52e7ec7c3e321a0aec5098 | 2026-10-05T03:06:05+02:00 | 2026-10-05T03:06:05+02:00 | Consolidate exact duplicate feature, Git, test-run, and filesystem response/domain types into shared model modules; preserve existing import surfaces with type re-exports and validate shared, PPT, client, and server consumers. |
| f42b4cbca551374c231f80ca1a5a08a28fdfc345 | 2026-10-05T02:56:04+02:00 | 2026-10-05T02:56:04+02:00 | The duplicate-prevention request does not define the comparison rule or the user-visible response; move it to Questions rather than imposing an arbitrary duplicate policy. |
| 5c8916931f7e4fc9937fc01d47356e73fd39e6ec | 2026-10-05T02:49:05+02:00 | 2026-10-05T02:49:05+02:00 | Add an abort action for active features that removes the item from active work, persists it back to .features with status Aborted, and keeps errors visible if persistence fails. |
| 20b697eff1174e98f9a0fac85e471f94f667b9ad | 2026-10-05T02:38:26+02:00 | 2026-10-05T02:38:26+02:00 | features tabs |
| 942f1182c69345ca2f3d090eb670ba1356d11dbf | 2026-10-05T02:27:35+02:00 | 2026-10-05T02:27:35+02:00 | Review the repository's client/server architecture, runtime boundaries, and data-flow using project manifests and core entry points; add only evidence-backed improvement tasks to DEVENVOPDEV.md and .features. |
| 8ff5abd40a5a1deac0519ff778ea4cd8ea58af4d | 2026-10-05T02:14:20+02:00 | 2026-10-05T02:14:20+02:00 | Add a development-only GET /git/diff endpoint returning the unified diff from HEAD, including staged, unstaged, and untracked changes, with focused public API tests and error handling. |
| b8b5c0e4a4e7fcfc85102a08850075e6bac205e7 | 2026-10-05T02:10:52+02:00 | 2026-10-05T02:10:52+02:00 | Add a development-only GET /git/diff endpoint returning the unified diff from HEAD, including staged, unstaged, and untracked changes, with focused public API tests and error handling. |
| 3374963f03067f1cfd65f9745943d5f454fb58a0 | 2026-10-05T02:07:09+02:00 | 2026-10-05T02:07:09+02:00 | Add Questions as a valid feature status, migrate matching Questions tasks from DEVENVOPDEV.md into .features with preserved IDs, and remove the duplicate task entries. |
| 31c0b90a3940397ec45a7e4180b7e3b2ab696a01 | 2026-10-05T02:01:58+02:00 | 2026-10-05T02:01:58+02:00 | Hide the feature status marker and task metadata from the top toolbar display while preserving the raw API entry and refresh behavior. |
| dc665748fe4bbeeec9734d4d5904f6a5435f461b | 2026-10-05T01:50:21+02:00 | 2026-10-05T01:50:21+02:00 | Wip |
| 12f1ebf713da09d3cca5d1d189683daefadcaea3 | 2026-10-05T01:47:34+02:00 | 2026-10-05T01:47:34+02:00 | Display the cached last failed test run's process error, stdout, and stderr on the test-runner page, loading details initially and after each run. |
| a43d3529770d6027b2b711aa7841bfdb3b52cf7d | 2026-10-05T01:42:30+02:00 | 2026-10-05T01:42:30+02:00 | Make Low the default priority in new-feature forms, service calls, and API creation while preserving existing legacy feature priorities. |
| 44d23ec704d09f1e3e4f03962e248916d94cb5d7 | 2026-10-05T01:34:23+02:00 | 2026-10-05T01:34:23+02:00 | Prevent overlapping feature-list refreshes from overwriting newer results. |
| b900ab542e2b467df634f751a181647e97a3b584 | 2026-10-05T01:31:32+02:00 | 2026-10-05T01:31:32+02:00 | Move features marked Done into a separate completed list, keeping their records and allowing them to be reopened or edited. |
| b305e71734398b8b73a9e4ef57a9ddbcaed9d3a3 | 2026-10-05T01:26:07+02:00 | 2026-10-05T01:26:07+02:00 | Clear the active DEVENVOPDEV.md task when a successfully committed feature is removed, while preserving task and feature state if cleanup fails. |
| ae9bf41ab8c1ff41de638b1c9c7e340a7a0ffd5d | 2026-10-05T01:23:49+02:00 | 2026-10-05T01:23:49+02:00 | WIP |
| ca6b0527aba4347534e75ff2e3528527927b17ba | 2026-10-05T01:15:51+02:00 | 2026-10-05T01:15:51+02:00 | Editing feature descriptions from the client with a dialog, API update, and active-task synchronization. |
| 87e9d8c10d96d8c71632a9ed8e94151e26922a1c | 2026-10-05T01:13:37+02:00 | 2026-10-05T01:13:37+02:00 | Editing feature descriptions from the client with a dialog, API update, and active-task synchronization. |
| cbd016800edd3f86f366a89e8404e327326a6870 | 2026-10-05T01:02:35+02:00 | 2026-10-05T01:02:35+02:00 | Added a dedicated counted In progress feature section above the full list; it stays synchronized with refresh, Start, and status changes. All client (160) and server (127) tests pass at 100% coverage, and the client build succeeds. |
| e6ceb4495585f8fd6067bba807b7778c1666c32c | 2026-10-05T00:54:31+02:00 | 2026-10-05T00:54:31+02:00 | Improved contrast on feature-list priority and status badges with light value-specific backgrounds and dark text; all combinations exceed 9.9:1 contrast, all client (159) and server (127) tests pass at 100% coverage, and the client build succeeds. |
| e2707656c6827c1eb9c0a6a6f5e7e3dd1edede8d | 2026-10-05T00:49:28+02:00 | 2026-10-05T00:49:28+02:00 | Added a client Refresh control that reloads the feature list, remains available for empty lists, and shows/disables during loading; all client (159) and server (127) tests pass at 100% coverage, and the client build succeeds. |
| a646a6376bec70a8702d2204f5253e214c70703e | 2026-10-05T00:43:11+02:00 | 2026-10-05T00:43:11+02:00 | Improved the client feature list with spaced card-like rows and color-coded priority/status badges while retaining editable controls; all client (158) and server (127) tests pass at 100% coverage, and the client build succeeds. |
| cb7c051d60e69058141fa8419e79896bac5e94de | 2026-10-05T00:37:24+02:00 | 2026-10-05T00:37:24+02:00 | Enlarged the client commit dialog to a viewport-safe 48rem maximum width and increased its message editor to 8 rows; all client (157) and server (127) tests pass at 100% coverage, and the client build succeeds. |
| 44027347d9c18db7c1c22800999960b712ab828a | 2026-10-05T00:34:58+02:00 | 2026-10-05T00:34:58+02:00 | Added a GET /task API and displayed the first task entry from DEVENVOPDEV.md at the far right of the top toolbar with loading, empty, error, and manual refresh states; task refreshes after starting a feature. All client (156) and server (127) tests pass at 100% coverage, and the client build succeeds. |
| d8087046375f4358d9cbc9a9f7b6b15b6eaedaf7 | 2026-10-05T00:27:49+02:00 | 2026-10-05T00:27:49+02:00 | Updated feature Start and In progress selection to persist the feature status and add a deduplicated In progress item to DEVENVOPDEV.md; all client (152) and server (122) tests pass at 100% coverage, and the client build succeeds. |
| 34190de88b2680d1df84674e1c95c515c3f75cd0 | 2026-10-05T00:19:56+02:00 | 2026-10-05T00:19:56+02:00 | Made the current task more prominent in the client toolbar with a labeled, high-contrast pill and larger summary; client (150) and server (116) tests pass at 100% coverage, and the client build succeeds. |
| 856b17b70fb2a4e34344b29a65b47cfe755f9c97 | 2026-10-05T00:16:43+02:00 | 2026-10-05T00:16:43+02:00 | Added sortable ID, priority, status, and description headers to the client feature table; all client (150) and server (116) tests pass at 100% coverage, and the client build succeeds. |
| 0e22bd6117727f425c99a8518b5be40754267720 | 2026-10-05T00:11:53+02:00 | 2026-10-05T00:11:53+02:00 | Widened the client feature-list container to 72rem while keeping the feature-entry form capped at 48rem; all client (149) and server (116) tests pass at 100% coverage, and the client build succeeds. |
| 2c7ee27b08720edccbb513208b4502eb2c85f71b | 2026-10-05T00:10:25+02:00 | 2026-10-05T00:10:25+02:00 | Added persistent Backlog, In progress, and Done feature statuses to creation and editing, connecting In progress with active feature tracking; all client (149) and server (116) tests pass at 100% coverage, and the client build succeeds. |
| 8183e7972cb20a2f218a06a823e125474019282e | 2026-10-05T00:05:25+02:00 | 2026-10-05T00:05:25+02:00 | Added a client Mark done action using the existing UUID deletion API; successful completion refreshes the list and clears matching active work, while errors keep the row and show a message. All client (143) and server (104) tests pass at 100% coverage; build succeeds. |
| 966e7c8e26be1f6c317649b097c58683e95e6bb2 | 2026-10-05T00:03:41+02:00 | 2026-10-05T00:03:41+02:00 | Added a client Mark done action using the existing UUID deletion API; successful completion refreshes the list and clears matching active work, while errors keep the row and show a message. All client (143) and server (104) tests pass at 100% coverage; build succeeds. |
| 1f185338c0a3f6632603db1bdeb7b4a9b13507f3 | 2026-10-04T23:59:59+02:00 | 2026-10-04T23:59:59+02:00 | Added a client Mark done action using the existing UUID deletion API; successful completion refreshes the list and clears matching active work, while errors keep the row and show a message. All client (143) and server (104) tests pass at 100% coverage; build succeeds. |
| a0aa57879c637becb9f9688ab6c81f1abae8d0aa | 2026-10-04T23:58:28+02:00 | 2026-10-04T23:58:28+02:00 | Plan: add a Mark done action for each open feature, delete it through the existing UUID API, clear matching active work, and refresh the list only after successful removal; surface failures without losing the row. Cover success/error/duplicate action through the client HTTP integration tests, then run full coverage/build. |
| 12e815d9a218e883ac1d0be52cbb5bbe11b147f8 | 2026-10-04T23:56:38+02:00 | 2026-10-04T23:56:38+02:00 | Added High, Medium, and Low priorities to new and existing features, with Medium defaults for legacy entries and priority updates persisted through the client/API. All client (141) and server (104) tests pass at 100% coverage; the client build succeeds. |
| 4babc685f6ca5ff16868341b441c35d66aebcce7 | 2026-10-04T23:50:16+02:00 | 2026-10-04T23:50:16+02:00 | Displayed the latest cached test-run status in the fixed bottom toolbar with loading, empty, pass/fail/error, exit-code, and completion-time details; the test runner refreshes the shared status after runs. Client (134) and server (96) tests pass with 100% coverage; client build succeeds. |
| cfb6878e4f82e6ec7e6892a57959068d51a16c99 | 2026-10-04T23:49:17+02:00 | 2026-10-04T23:49:17+02:00 | Displayed the latest cached test-run status in the fixed bottom toolbar with loading, empty, pass/fail/error, exit-code, and completion-time details; the test runner refreshes the shared status after runs. Client (134) and server (96) tests pass with 100% coverage; client build succeeds. |
| 290e45ba45a839087ce192959b4ffffb6256edc7 | 2026-10-04T23:47:43+02:00 | 2026-10-04T23:47:43+02:00 | Displayed the latest cached test-run status in the fixed bottom toolbar with loading, empty, pass/fail/error, exit-code, and completion-time details; the test runner refreshes the shared status after runs. Client (134) and server (96) tests pass with 100% coverage; client build succeeds. |
| dc20112a393a8f4416f4cee247423e5378d2f9a6 | 2026-10-04T23:44:22+02:00 | 2026-10-04T23:44:22+02:00 | Connected Start to active feature tracking and DELETE /features/:id after successful Git commits; removal errors remain visible and preserve the active feature. Client (96) and server (130) tests pass with 100% coverage, and the client build succeeds. |
| 5e93e0f9816eea175a263a47a8ae80e209f61a85 | 2026-10-04T23:33:24+02:00 | 2026-10-04T23:33:24+02:00 | Clear the client feature description after successful submission while retaining it on backend errors; all 124 client tests pass with 100% coverage and the build succeeds. |
| 9fa3a166abd4322064dc8aca895420be2ed0e46c | 2026-10-04T23:28:23+02:00 | 2026-10-04T23:28:23+02:00 | Plan: add case-insensitive client-side search over feature ID and description, reset paging when search changes, test matching/no-results/paging through the public table UI, run 100% client coverage and build, then record completion. |
| 5b35df7e45d0b5789e370f98a4c0119c95e90f45 | 2026-10-04T23:26:26+02:00 | 2026-10-04T23:26:26+02:00 | Separated client feature rows into 8-character IDs and date-free descriptions, keeping full IDs accessible on hover; all 122 client tests pass at 100% coverage and the build succeeds. |
| 8381310cf50123fb9b8463537a9fbcece6134797 | 2026-10-04T23:16:28+02:00 | 2026-10-04T23:16:28+02:00 | Wrapped feature entry in a top-level submit form; Ctrl+S and Ctrl+Enter now submit through the form, with all 121 client tests passing at 100% coverage and the build succeeding. |
| 0424e0695d3d4b5d236aabe96deb620b03fa004d | 2026-10-04T23:03:57+02:00 | 2026-10-04T23:03:57+02:00 | Added GET /features and displayed saved feature entries below the client form, refreshing after successful submission; client (119 tests) and server (89 tests) pass with 100% coverage, and the client build succeeds. |
| 09115deef00e59aaf963c507b3f5e0ecf6c9cf15 | 2026-10-04T23:00:32+02:00 | 2026-10-04T23:00:32+02:00 | Added GET /features and displayed saved feature entries below the client form, refreshing after successful submission; client (119 tests) and server (89 tests) pass with 100% coverage, and the client build succeeds. |
| f030524f261a57e7279b8e14564f7bf274d61ce9 | 2026-10-04T22:53:46+02:00 | 2026-10-04T22:53:46+02:00 | Plan: connect the client feature-description form to POST /features, provide submitting/success/error feedback with public HTTP integration tests, verify all client coverage/build, and record completion in .history. |
| 704a1d521d2ef1ee421a7d64b03de611ad6b5b91 | 2026-10-04T22:52:08+02:00 | 2026-10-04T22:52:08+02:00 | Added public POST /features to append validated, timestamped, single-line feature descriptions to the configured root .features file in .history format; all 85 server tests pass with 100% coverage. |
| bbd542765ca1bd85876122f2675da1213b4df60d | 2026-10-04T22:47:09+02:00 | 2026-10-04T22:47:09+02:00 | Added the /feature client route with an in-memory feature-description form and navigation link; all 112 client tests pass with 100% coverage and the client build succeeds. |
| 7d1e01a3efbcbcd556ffe48cf433f85553c6f57d | 2026-10-04T22:41:44+02:00 | 2026-10-04T22:41:44+02:00 | Added a fixed bottom client toolbar containing the current-entry refresh and Git status controls; all 110 client tests pass with 100% coverage and the client build succeeds. |
| b45a129ecf7d8a3578471f2e6604e437339c913b | 2026-10-04T22:37:14+02:00 | 2026-10-04T22:37:14+02:00 | Made the client toolbar .current entry a keyboard-accessible refresh control that fetches and displays the latest entry on click; client tests pass with 100% coverage and the build succeeds. |
| 7775900fe303a9fc3a03250fd8e11db424405dea | 2026-10-04T22:32:43+02:00 | 2026-10-04T22:32:43+02:00 | Initialized the client commit dialog with the date-free .current summary; tests verify the app-provided default and rendered input, with client coverage at 100% and the build passing. |
| dc946ebcc4e6d2054ded758c0f5cfe444b73b557 | 2026-10-04T22:28:54+02:00 | 2026-10-04T22:28:54+02:00 | improve hover |
| 3cb1f0f77982fc2996506e521ea8f1a68c284878 | 2026-10-04T22:24:13+02:00 | 2026-10-04T22:24:13+02:00 | // [2026-10-04 22:23 +02:00] Added a server endpoint for the latest nonempty .current entry and a right-aligned client toolbar display that refreshes every 30 seconds; combined client/server coverage is 100% and the client build passes. |
| bd8db1ff399e68a32c782fa175abb1da9f672187 | 2026-10-04T22:19:15+02:00 | 2026-10-04T22:19:15+02:00 | fix test imports |
| ad22b50314866a69ce5b4798d1703cffa77c7560 | 2026-10-04T22:14:37+02:00 | 2026-10-04T22:14:37+02:00 | cleanup |
| 5dd9e7a31f3abb20eedeafc309f2cafe649f7088 | 2026-10-04T22:12:47+02:00 | 2026-10-04T22:12:47+02:00 | Split the 73 server public-API integration tests into seven domain-focused suites, replacing the monolithic public-api.spec.ts |
| 8872ea5c1d42ac0754b5b6686c5e7f00fc670eb6 | 2026-10-04T22:10:01+02:00 | 2026-10-04T22:10:01+02:00 | update |
| d80f00feeee22b57b4ed270af9125c4c9d371961 | 2026-10-04T22:04:36+02:00 | 2026-10-04T22:04:36+02:00 | Added an injectable backend authentication service with development allow-all defaults and HTTP integration coverage. |
| 7e4b3437862532956edc38af777ce48cf36f9040 | 2026-10-04T21:59:39+02:00 | 2026-10-04T21:59:39+02:00 | The test runner is now split into two columns: test controls and output on the left, cached result status on the right. On screens narrower than 720px, the cache panel stacks below the runner. |
| 47f87ec5ed8f9d0272684e2eeb5688607375f710 | 2026-10-04T21:51:17+02:00 | 2026-10-04T21:51:17+02:00 | test result cache status |
| 341ee68a4a4e215c80b696d7bc91567c61dd6ce9 | 2026-10-04T21:44:55+02:00 | 2026-10-04T21:44:55+02:00 | The commit flow now refreshes the Git log before opening the commit-name dialog, whether you’re already on the Git log page or navigate there first. If the refresh fails, the dialog stays closed and an error is shown. After a successful commit, the log refreshes again to show the new commit. |
| e6d0c451938419b9e138754e4b6a4f096455e9f0 | 2026-10-04T21:40:49+02:00 | 2026-10-04T21:40:49+02:00 | git log refresh |
| e46435ab07e6fc58162435dd08dce8d15f2924ef | 2026-10-04T21:38:23+02:00 | 2026-10-04T21:38:23+02:00 | test run cache |
| a67a1251c36bbf9c15d5996d58613e9948af1e6e | 2026-10-04T21:21:31+02:00 | 2026-10-04T21:21:31+02:00 | coverage 100% |
| 7b7fdfb25ee823b295a7a779d0345b67b5955e32 | 2026-10-04T21:12:53+02:00 | 2026-10-04T21:12:53+02:00 | increasing test coverage |
| 30a0ad45f3ab0701ffe7fb79e19ecb0c6fc2c5bd | 2026-10-04T21:03:12+02:00 | 2026-10-04T21:03:12+02:00 | history and ctrl-enter |
| 6b11edeba50f1686f3d94de0d3e31ceb41495388 | 2026-10-04T21:02:11+02:00 | 2026-10-04T21:02:11+02:00 | git commit hover |
| 376dde2cd5309701102f1890a4ab86373e9f6568 | 2026-10-04T20:47:12+02:00 | 2026-10-04T20:47:12+02:00 | commit name dialog |
| 457dcd42b7b671c21373cf4b023d7ccea84bdd40 | 2026-10-04T20:44:36+02:00 | 2026-10-04T20:44:36+02:00 | git log |
| c2cbd41d993f8eb7209b2653f0bc8073440b444f | 2026-10-04T20:34:55+02:00 | 2026-10-04T20:34:55+02:00 | colors and feedback |
| 2406b2b9015bbf3fb0dd378ecd42f782ec80c11e | 2026-10-04T20:31:05+02:00 | 2026-10-04T20:31:05+02:00 | snackbar on save |
| c14e5c94235b47f55870acc5dd8f7470630c76c8 | 2026-10-04T20:26:05+02:00 | 2026-10-04T20:26:05+02:00 | git status indicator |
| 9e299da6acc900bbb342e8b4341024dbb706ba88 | 2026-10-04T20:22:21+02:00 | 2026-10-04T20:22:21+02:00 | git status |
| abbb5dcaf4548f24d5484c527d65aea6484fbd5e | 2026-10-04T20:19:29+02:00 | 2026-10-04T20:19:29+02:00 | update styling |
| 02bdf382d5abf306ce5c4ce68df823ad33d00488 | 2026-10-04T20:07:08+02:00 | 2026-10-04T20:07:08+02:00 | styles |
| 6f14dcd7699af9364d7a6ab8a10055ec18b20757 | 2026-10-04T20:01:55+02:00 | 2026-10-04T20:01:55+02:00 | update colors |
| 6c6686ddb5580e3772c47d4f5fe8b795f4a776c7 | 2026-10-04T19:56:54+02:00 | 2026-10-04T19:56:54+02:00 | update colors |
| cad8debcec6ad7ef58c7c27c0035f18903bd2f49 | 2026-10-04T18:55:06+02:00 | 2026-10-04T18:55:06+02:00 | snackbar color |
| 28dd3b45080aa973609e3e97cd4e8a7e8e97f45f | 2026-10-04T18:53:35+02:00 | 2026-10-04T18:53:35+02:00 | commit message snackbar |
| 55e2b80007cc523f9039a24a42873dde0d41f974 | 2026-10-04T18:50:53+02:00 | 2026-10-04T18:50:53+02:00 | add be gitlog endpoint |
| bbe1d2d4c6b1f0dbe609d2413c24b94e216bc140 | 2026-10-04T18:48:01+02:00 | 2026-10-04T18:48:01+02:00 | commit from client |
| de828c33aa7aeca7148317facc828eaa992b841c | 2026-10-04T18:43:06+02:00 | 2026-10-04T18:43:06+02:00 | fix tests |
| 1528b8dacc01ad47dff13b9ff864236e2e97487e | 2026-10-04T18:40:39+02:00 | 2026-10-04T18:40:39+02:00 | fix test |
| c34db028c0420c362a4675227c24f5ecefe292dc | 2026-10-04T18:39:33+02:00 | 2026-10-04T18:39:33+02:00 | add git route |
| 99468dbc0ab34ba1b83b8aece8c9282f86bf1dac | 2026-10-04T18:34:41+02:00 | 2026-10-04T18:34:41+02:00 | updated |
| 47d0e5819ae5ddfefb864e8cf51f6d4d49492710 | 2026-10-04T18:34:29+02:00 | 2026-10-04T18:34:29+02:00 | fixing menu |
| cf21208bcce1d158e175254b06e66b7f0cbcec3a | 2026-10-04T18:26:54+02:00 | 2026-10-04T18:26:54+02:00 | fix todo link |
| 05d6cfd883d889982925aafc1ab5a04b11cb7ed0 | 2026-10-04T18:26:45+02:00 | 2026-10-04T18:26:45+02:00 | progress |
| ac8987d6b84f5e5904ed66208f884c03d2bee6ac | 2026-10-04T18:19:31+02:00 | 2026-10-04T18:19:31+02:00 | hide stderr |
| 0ebe7aa8a58a3515e8e5e04f120c3e90a5003aed | 2026-10-04T18:17:45+02:00 | 2026-10-04T18:17:45+02:00 | rrun with coverage |
| 4d216165feda94ff52c7cf7bc4a06f176f94b0a8 | 2026-10-04T18:13:37+02:00 | 2026-10-04T18:13:37+02:00 | add tests |
| d3c1cb6a0b57c54a00ac59950eb96db5912ff139 | 2026-10-04T18:11:01+02:00 | 2026-10-04T18:11:01+02:00 | fix tests |
| 0df6b3bb7087b394800f5c463b0140290cd858b8 | 2026-10-04T17:53:55+02:00 | 2026-10-04T17:53:55+02:00 | update |
| 9f5ac4cdda344f01d05eddc99d1ce3014d316525 | 2026-10-04T17:44:45+02:00 | 2026-10-04T17:44:45+02:00 | import test globals |
| 687c632d5ce51e3b85d1d4fd493bd39f250e4717 | 2026-10-04T17:42:07+02:00 | 2026-10-04T17:42:07+02:00 | add test runner |
| 85f826e9eedbd0246305724043787fa35c064a87 | 2026-10-04T17:36:47+02:00 | 2026-10-04T17:36:47+02:00 | server test runner |
| 0c2d3e93e834c590a4e27655aba7300afc8461b7 | 2026-10-04T17:22:39+02:00 | 2026-10-04T17:22:39+02:00 | update angular |
| f679e61bfc49f897703f5752a2ff0b016f8e0db3 | 2026-10-04T17:09:16+02:00 | 2026-10-04T17:09:16+02:00 | server watch |
| e95c854bb0f166ed85e06f5f4d9581871ddd57bc | 2026-10-04T17:04:31+02:00 | 2026-10-04T17:04:31+02:00 | server watch / Wip |
| 1c9c8888ca3b5910f9779bfaf2e50c504a928799 | 2026-10-04T16:59:18+02:00 | 2026-10-04T16:59:18+02:00 | npm run test:all:coverage |
| 268cbea0c8a47b02a5d75856d8489e971e77a735 | 2026-10-04T16:56:49+02:00 | 2026-10-04T16:56:49+02:00 | fix tests |
| 68a8942dbf3fd9e1cf678ec67a922d5a9a79be74 | 2026-10-04T16:55:22+02:00 | 2026-10-04T16:55:22+02:00 | console.error |
| fc76fd8a1f3fe27d55c13fc7a163a491207c0b06 | 2026-10-04T16:50:42+02:00 | 2026-10-04T16:50:42+02:00 | port lookup / tests |
| ecd304c0726a3bdb769545ce3a674513041231fb | 2026-10-04T16:44:46+02:00 | 2026-10-04T16:44:46+02:00 | silent |
| a897047bd5d57ce1dc218b82d3212892ac67c6f9 | 2026-10-04T16:40:46+02:00 | 2026-10-04T16:40:46+02:00 | client 100 |
| 3f15ffd2ccacac6f343a6a5cbe7b397360653f4c | 2026-10-04T16:31:36+02:00 | 2026-10-04T16:31:36+02:00 | test commands |
| fe255ef6b3cddf6ad3136ed173366c24afa14dd6 | 2026-10-04T16:29:00+02:00 | 2026-10-04T16:29:00+02:00 | logger |
| ea7222350803d6debe7c901f9ef986138af14a58 | 2026-10-04T16:23:56+02:00 | 2026-10-04T16:23:56+02:00 | tests |
| cad875b6b7c683b95264af48b0652b039d9cd722 | 2026-10-04T16:15:05+02:00 | 2026-10-04T16:15:05+02:00 | jest types |
| 67e9a2100e73f7477ce83af933fc9995c574270f | 2026-10-04T16:13:43+02:00 | 2026-10-04T16:13:43+02:00 | update ttypes |
| e821bea4c80580ee05672d46f11a7c27a677d3b1 | 2026-10-04T16:12:23+02:00 | 2026-10-04T16:12:23+02:00 | add types |
| 538a95901127a69782a97043fcfc098e120e8bd2 | 2026-10-04T16:11:06+02:00 | 2026-10-04T16:11:06+02:00 | jest test |
| 918bce842a881adf4bd93e8da9bd5c95a74e77f8 | 2026-10-04T16:09:40+02:00 | 2026-10-04T16:09:40+02:00 | fix edit links |
| 1ee5fe6bb9a35dc03cae28668fa1ae79b7b08b77 | 2026-10-04T15:54:25+02:00 | 2026-10-04T15:54:25+02:00 | fix promise |
| 943d7b40f1a2a1e6278d6bdb475b835d419e3150 | 2026-10-04T15:52:32+02:00 | 2026-10-04T15:52:32+02:00 | jest |
| 73f6f7dff98b02a4234641c0aa2cd97e2f8c7e3a | 2026-10-04T15:46:02+02:00 | 2026-10-04T15:46:02+02:00 | Implemented the in-process Supertest setup |
| b3c1d46b40308bdc9683f103b2b960dc048358dc | 2026-10-04T15:40:28+02:00 | 2026-10-04T15:40:28+02:00 | fix color / TODO |
| be1efc86b28dcf25b6f0a3c10048e1019ab380cf | 2026-10-04T15:35:21+02:00 | 2026-10-04T15:35:21+02:00 | add todo link |
| 5173e5311cf8f9472e71f60a48234be607457f57 | 2026-10-04T15:25:16+02:00 | 2026-10-04T15:25:16+02:00 | test colors |
| 78f1818c93df3a62e2951ec84af53666c166e66d | 2026-10-04T15:22:30+02:00 | 2026-10-04T15:22:30+02:00 | findAvailablePort |
| 0603c16b00c8a90cfd20aa9f1b44cdebd83cd13b | 2026-10-04T15:20:32+02:00 | 2026-10-04T15:20:32+02:00 | dynamic server port |
| 72d530c2cb175c9342a8e1f84a1ad60e7293cda2 | 2026-10-04T15:15:26+02:00 | 2026-10-04T15:15:26+02:00 | fix port |
| 9d06c74a4b804606c2d3182d046599d785535a4e | 2026-10-04T15:13:40+02:00 | 2026-10-04T15:13:40+02:00 | index promise |
| c1aa10abce344b1df0b2bd3d4f1f5dc25c37fed2 | 2026-10-04T15:07:07+02:00 | 2026-10-04T15:07:07+02:00 | add tests |
| b7fce330c16db43439dca284b6fb279175cf1c9e | 2026-10-04T14:51:22+02:00 | 2026-10-04T14:51:22+02:00 | make getFolders promise based |
| 2ed675f828d2f19ac769b87e647dc928ee4a5991 | 2026-10-04T14:49:43+02:00 | 2026-10-04T14:49:43+02:00 | make getFiles promise based |
| 5c23fc70181d62ade3647dd6c301eb35f926731c | 2026-10-04T14:48:57+02:00 | 2026-10-04T14:48:57+02:00 | make postFiles promise based |
| bfb96f689cf9d11d4bda75cc946122a5c9601b8e | 2026-10-04T14:42:49+02:00 | 2026-10-04T14:42:49+02:00 | add test |
| d5ab1b17dd8efb9934268104a91250358c5c652a | 2026-10-04T14:26:31+02:00 | 2026-10-04T14:26:31+02:00 | add tests |
| 6bafd78d30c762d283e3ffa3dc52f798d98df4cb | 2026-10-04T14:11:03+02:00 | 2026-10-04T14:11:03+02:00 | filename fix and binding |
| 96df1791d8f60539a007783d992c611fc8e8cec0 | 2026-10-04T14:04:24+02:00 | 2026-10-04T14:04:24+02:00 | edit main / menu |
| c4289fe96a879f6b09246d4e121e10cd03093978 | 2026-10-04T13:58:49+02:00 | 2026-10-04T13:58:49+02:00 | test / edit |
| 12558a2055328c35ea8a1baabc14b3ed53339f7c | 2026-10-04T13:55:43+02:00 | 2026-10-04T13:55:43+02:00 | add client url persistence |
| 7254b33fe37138e5bbceb10c37cd60f40643af14 | 2026-10-04T13:44:44+02:00 | 2026-10-04T13:44:44+02:00 | fix display empty files |
| abcf300bec8a53459c8e1c750f0d780041f14660 | 2026-10-04T13:40:34+02:00 | 2026-10-04T13:40:34+02:00 | move into system and editorOptions.language html (to display html / WIP) |
| 025c3c25d465d04dd83925a1cb927b57e97a34ad | 2025-07-26T17:55:57+02:00 | 2025-07-26T17:55:57+02:00 | cleanup ppt types / remove unused |
| 673674613fc57cddac26da2e591d57412415dd73 | 2025-06-26T16:04:45+02:00 | 2025-06-26T16:04:45+02:00 | Merge pull request #6 from frunjik/npm-outdated-june-2025 |
| 40b7adfa059407826afc72b9b0c7bba9bb8a65f9 | 2025-06-26T16:03:41+02:00 | 2025-06-26T16:03:41+02:00 | npm update --save |
| 38eaa9d6f74a9432f99ddc2d1c4ae855b60a4e54 | 2025-04-23T09:31:27+02:00 | 2025-04-23T09:31:27+02:00 | increase budget to 2MB |
| 747c61054d22c4fa7d3ca3456d68c76c54139cfe | 2025-04-23T09:28:30+02:00 | 2025-04-23T09:28:30+02:00 | disabled analytics |
| abe2fff5fb0bb943c528ec67ae82e423ce153a72 | 2025-04-23T09:25:46+02:00 | 2025-04-23T09:25:46+02:00 | Merge pull request #5 from frunjik/update-dependencies-README.md |
| c9d11f1470b8b4ff8ed4fa08dfcf26a7654559d7 | 2025-04-23T09:24:45+02:00 | 2025-04-23T09:24:45+02:00 | add dependencies |
| d14d91fffddcfa60de3a27357a23fb1c2742e327 | 2025-04-21T20:27:16+02:00 | 2025-04-21T20:27:16+02:00 | Merge pull request #4 from frunjik/rubico |
| c488029139c484b649d853dd5d69fa3f7a01fec8 | 2025-04-21T20:26:13+02:00 | 2025-04-21T20:26:13+02:00 | allowedCommonJsDependencies for rubico |
| 630247364b48ec04b9c7ec44800c755afc09bc71 | 2025-04-21T20:25:57+02:00 | 2025-04-21T20:25:57+02:00 | clean main |
| 17f963a5e543d1975a4b440bd99a9927840ae01f | 2025-04-21T20:19:33+02:00 | 2025-04-21T20:19:33+02:00 | styling - wip make readable |
| 103605818297d0a54a05a368f7198a9841893e27 | 2025-04-21T20:14:10+02:00 | 2025-04-21T20:14:10+02:00 | half working ... |
| b65ccf41e201f7f8893a4efe368599f102a34644 | 2025-04-21T20:07:25+02:00 | 2025-04-21T20:07:25+02:00 | rubico - wip |
| dc345c00c759804dd01a64b442684dbd94d6d5ec | 2025-04-21T19:40:51+02:00 | 2025-04-21T19:40:51+02:00 | add js workspace and libs |
| da20d1a17a896a5dfa405aaaa2685267cbb03e4d | 2025-04-21T19:23:27+02:00 | 2025-04-21T19:23:27+02:00 | js component |
| cdc2ca7ae98ee1722d3e65af09396c55609f1289 | 2025-04-21T02:07:46+02:00 | 2025-04-21T02:07:46+02:00 | script config.js module type |
| 73d71add69ea5fcc255bae1ab021cbb023dcd83d | 2025-04-21T00:44:33+02:00 | 2025-04-21T00:44:33+02:00 | trying to fix some test errors - WIP |
| 89b4e3d84d82a3b79ce84cb604eb756e122f3f05 | 2025-04-21T00:05:09+02:00 | 2025-04-21T00:05:09+02:00 | move types into shared |
| d970cdde35c52fea4e96eec8a7169dd13aee6fd7 | 2025-04-20T23:48:02+02:00 | 2025-04-20T23:48:02+02:00 | favicon |
| dde50ae1d25404150486cf4f06b8d55930000c48 | 2025-04-20T23:37:23+02:00 | 2025-04-20T23:37:23+02:00 | cleanup |
| ac61ce3133a342794366237226f0de4cb005f656 | 2025-04-20T23:36:58+02:00 | 2025-04-20T23:36:58+02:00 | remove cached files from ./scratch |
| ce47910b0ea186a4267d8b96f788a4457037dde8 | 2025-04-20T23:24:32+02:00 | 2025-04-20T23:24:32+02:00 | Merge pull request #3 from frunjik/multi-repo |
| cb82ff564beb3c1caeb783491bbda74a8a7c10c5 | 2025-04-20T23:21:45+02:00 | 2025-04-20T23:21:45+02:00 | restore readme |
| b2ca637483e32b57f7024be163b895242db89dba | 2025-04-20T23:16:42+02:00 | 2025-04-20T23:16:42+02:00 | update changelog |
| bcf2011c6882bca05ccb944e7bf637edd6ed24c6 | 2025-04-20T23:16:32+02:00 | 2025-04-20T23:16:32+02:00 | update changelog |
| 57b838bf7d54c0c9dc38f016d180fff22a02db27 | 2025-04-20T23:13:42+02:00 | 2025-04-20T23:13:42+02:00 | Merge branch 'main' into multi-repo |
| 553874e260dff170b6fae9dd27c3d229a5ae4352 | 2025-04-20T23:08:58+02:00 | 2025-04-20T23:08:58+02:00 | server root folder |
| b916bfa044ccf11cc09ad7884e0c88d40176d042 | 2025-04-20T23:08:45+02:00 | 2025-04-20T23:08:45+02:00 | build server before starting |
| ce6cde74257229980ab8a98467f2107bcce3755a | 2025-04-20T23:05:22+02:00 | 2025-04-20T23:05:22+02:00 | remove old server code |
| b5bd6733a0e147addeff8f1585daf9815494985c | 2025-04-20T23:02:52+02:00 | 2025-04-20T23:02:52+02:00 | remove old client files |
| 2d5c181f7c83f019372107f63039a7bec6c16b60 | 2025-04-20T23:00:56+02:00 | 2025-04-20T23:00:56+02:00 | add batch files - move into package.json later |
| 222fc8c9823ddda16ef00d52baf787730119cd01 | 2025-04-20T22:33:51+02:00 | 2025-04-20T22:33:51+02:00 | client wip |
| 5b7bdf3e1756c6c2b37bdf9cd294683b5734bf75 | 2025-04-20T21:36:56+02:00 | 2025-04-20T21:36:56+02:00 | pick other bg for body |
| b4aee20e3b3b4f8bf61fa23b52a7a23bb2d6a52a | 2025-04-20T21:30:11+02:00 | 2025-04-20T21:30:11+02:00 | window.host broken ... |
| 4765a26ac7179eb46416e05c69cafcd893d5edb0 | 2025-04-20T21:07:15+02:00 | 2025-04-20T21:07:15+02:00 | move / copy client to projects - WIP |
| c4e8f6a225750c7814591dc8569b50a231c2a592 | 2025-04-20T20:36:27+02:00 | 2025-04-20T20:36:27+02:00 | styles providers index - WIP |
| 33a5c68b52196f041e1a83f196a32c284e623889 | 2025-04-20T20:12:16+02:00 | 2025-04-20T20:12:16+02:00 | moving to projects - WIP |
| ab594cb2ef67e942f7e64804fe18d044eabc9c30 | 2025-04-20T19:31:31+02:00 | 2025-04-20T19:31:31+02:00 | build server and shared |
| 1dabc97529def908ae70e1dd2f3edf35a2324782 | 2025-04-20T19:02:33+02:00 | 2025-04-20T19:02:33+02:00 | Merge pull request #2 from frunjik/scratch |
| 245c46f140b1747f4156b8122f8c2b62206699f9 | 2025-04-20T19:01:34+02:00 | 2025-04-20T19:01:34+02:00 | remove contents |
| f7001862dcc7fbacbb5e32730f32db18d8a65400 | 2025-04-20T18:58:56+02:00 | 2025-04-20T18:58:56+02:00 | Merge branch 'main' into scratch |
| a23c84b5b18af088a008adf3b359c901be2ee946 | 2025-04-20T18:56:52+02:00 | 2025-04-20T18:56:52+02:00 | move into scratch and add to .gitignore |
| 0a5e46abb05ee680ad5236d2bb5813dc7fec75a5 | 2025-04-20T18:50:42+02:00 | 2025-04-20T18:50:42+02:00 | Merge pull request #1 from frunjik/fix-browser-filename |
| 5c6e6162bb9780514235435f35c9eccdc82a728e | 2025-04-20T18:48:09+02:00 | 2025-04-20T18:48:09+02:00 | fix filename setting and bind inEditorInit |
| 07cf335eb519a657548f454f821c0bff1c1df09c | 2025-04-20T18:23:57+02:00 | 2025-04-20T18:23:57+02:00 | copying initial setup |
| 9a7f6b5a422f5e2cf70f2e4a579ed8f6247b9b76 | 2025-04-20T18:02:50+02:00 | 2025-04-20T18:02:50+02:00 | move TODO.md into ./scratch and add to .gitignore |
| 15732a28f655a6cf1f57170a7c07deda891e16c6 | 2025-04-20T10:31:19+02:00 | 2025-04-20T10:31:19+02:00 | cleanup |
| bc4b537f066727e25302eb03afe537d5fbb0ba1a | 2025-04-20T10:01:54+02:00 | 2025-04-20T10:01:54+02:00 | update - log errors |
| 9c91874d3ca7af17f9295d2f7be452d03763c5d9 | 2025-04-20T09:54:54+02:00 | 2025-04-20T09:54:54+02:00 | fiddling with fs |
| 15d805720ff6cbf57179b88ede447c579e0e772d | 2025-04-19T22:33:41+02:00 | 2025-04-19T22:33:41+02:00 | set back to localhost |
| c03e0738c2db01d0ef4a1e0f15dd6155d39cc19d | 2025-04-19T22:28:01+02:00 | 2025-04-19T22:28:01+02:00 | preparing for tests |
| 5f1eacfc7d207d2c07b9bf2fbf8cb3ca92a4735d | 2025-04-19T21:42:43+02:00 | 2025-04-19T21:42:43+02:00 | move ppt into server (for now) so we can share it between client and server |
| 1048d4543ef15c2895e7e2d46761b2e698ad2181 | 2025-04-19T21:15:52+02:00 | 2025-04-19T21:15:52+02:00 | server tests - wip |
| 2a3daeb987d09774a7c66f8667aa067950858e54 | 2025-04-19T20:57:00+02:00 | 2025-04-19T20:57:00+02:00 | Merge branch file-system |
| 6d035d5b57667679e174b2201e236ca43f46fd4b | 2025-04-19T20:46:54+02:00 | 2025-04-19T20:46:54+02:00 | updated express |
| 65adacbccbc5c7b82c615bf211b4917f661403ab | 2025-04-19T20:44:04+02:00 | 2025-04-19T20:44:04+02:00 | broken |
| f194e409d1335028304d1d8de9a62c7b1d8b13ee | 2025-04-19T14:54:34+02:00 | 2025-04-19T14:54:34+02:00 | clrean up models |
| ba138dca3f7d37ac75838a07090ebabce213bcf6 | 2025-04-19T11:46:51+02:00 | 2025-04-19T11:46:51+02:00 | cleanup types |
| 2482b058fe420e6453421dd8a6c5e123d4cb23ba | 2025-04-19T07:35:35+02:00 | 2025-04-19T07:35:35+02:00 | cleanup |
| 6fd6487f8a12912eda0db019700ff61972210e13 | 2025-04-19T07:35:26+02:00 | 2025-04-19T07:35:26+02:00 | remove |
| a5a522bf0d39f2a7ebb76a492dca1fd0c81a5890 | 2025-04-19T07:30:33+02:00 | 2025-04-19T07:30:33+02:00 | WIP |
| 3f509a89e03c3cc51df9fa305d65231b07cb7843 | 2025-04-19T06:56:01+02:00 | 2025-04-19T06:56:01+02:00 | list edit tinkering |
| 68b7574996c6ed17c4d30458a198a28ef4938f48 | 2025-04-19T06:47:23+02:00 | 2025-04-19T06:47:23+02:00 | list compontnen wip |
| 3862b94d4a9a70f8ccf0e8002eeb71e18facfbf6 | 2025-04-19T06:28:26+02:00 | 2025-04-19T06:28:26+02:00 | list and item - wip |
| db457f90a77440748d5d88a20cae11fae937efa1 | 2025-04-19T05:52:16+02:00 | 2025-04-19T05:52:16+02:00 | list and item |
| a84de99a424875650066b24cb64bb97cdf98ba41 | 2025-04-19T05:28:50+02:00 | 2025-04-19T05:28:50+02:00 | list and list-item |
| 595dfb4edf3dc8d2965a32ead7deeaf50992783b | 2025-04-19T05:17:24+02:00 | 2025-04-19T05:17:24+02:00 | moved buttons |
| 05e27283cd52fe8e34ca2d83825aa38db3fab7fe | 2025-04-19T05:09:44+02:00 | 2025-04-19T05:09:44+02:00 | ppt-form initial |
| 68152fdec45bc8178bb6789eefe990c4787a91b4 | 2025-04-18T23:11:34+02:00 | 2025-04-18T23:11:34+02:00 | wip |
| b1308dd52fa2a9a1993b43d83007d2faf96c2b4d | 2025-04-18T23:09:53+02:00 | 2025-04-18T23:09:53+02:00 | forms wip |
| 44ee6df51443c08b8ca743c6b8251d8c361ad92d | 2025-04-18T23:06:18+02:00 | 2025-04-18T23:06:18+02:00 | model form wip |
| 744110fb0cfcb296840b9029d8c0da3150cef197 | 2025-04-18T22:41:11+02:00 | 2025-04-18T22:41:11+02:00 | ppt-form cleanup |
| 5dfe97f2b0d3fe38093b118e2cfb8a163e6fd572 | 2025-04-18T22:29:29+02:00 | 2025-04-18T22:29:29+02:00 | getting form to work |
| 9c31798142afc46c6e26a30e93e4b1bf6066c7a6 | 2025-04-18T22:12:11+02:00 | 2025-04-18T22:12:11+02:00 | reactiveformsmodule |
| e9081d2a4df5758f528b1f76aa3186c891bc5582 | 2025-04-18T21:51:57+02:00 | 2025-04-18T21:51:57+02:00 | remove unit |
| 53959d883037ce3d1de424feabd94dd28ad7d4e2 | 2025-04-18T20:24:36+02:00 | 2025-04-18T20:24:36+02:00 | angular export bug when nested control imports ReactiveFormsModule |
| 8c6159f50ceb1affdca34eec878d941d308d3ad1 | 2025-04-18T20:19:05+02:00 | 2025-04-18T20:19:05+02:00 | cleanup |
| 32fbb4bc7309e9fd1564ec03eaa7b75888712725 | 2025-04-18T20:18:02+02:00 | 2025-04-18T20:18:02+02:00 | fiddling |
| bef9b0a07702f9ba5a222dce21860b0532fb324a | 2025-04-18T19:54:50+02:00 | 2025-04-18T19:54:50+02:00 | form field problems (angular bug again ?) |
| 5ba5adb56b3ed95e0d0b3e6a2045199fa34cb790 | 2025-04-18T19:30:29+02:00 | 2025-04-18T19:30:29+02:00 | form |
| a7fdd036dcb082a6fa081669c7ab6f2fa9adc4c7 | 2025-04-18T19:11:43+02:00 | 2025-04-18T19:11:43+02:00 | static form |
| 9afab646108e9fb51c6402d0c0719be843873a63 | 2025-04-18T18:59:03+02:00 | 2025-04-18T18:59:03+02:00 | cleanup |
| 9ae7f8b23bd9eea8596616900d5ebe1df7ec3dd7 | 2025-04-18T18:53:20+02:00 | 2025-04-18T18:53:20+02:00 | core models |
| 2c1439a91e5290908627ec5f49db7b343fb8701a | 2025-04-18T18:49:06+02:00 | 2025-04-18T18:49:06+02:00 | ppt models |
| bf61af8b9c8c90c75c08dc29e17c8b2922a5cbde | 2025-04-18T18:35:03+02:00 | 2025-04-18T18:35:03+02:00 | ppt models |
| 9f89819850baf25505773a75c84f8a1e2695493c | 2025-04-18T18:07:37+02:00 | 2025-04-18T18:07:37+02:00 | initial ppt |
| 7956ae16c2e616c35a519cdeed2c8d4fa174137e | 2025-04-18T17:47:33+02:00 | 2025-04-18T17:47:33+02:00 | layout |
| 97d58ac78cbd578c21b9c51e7e55f71dcadf9c54 | 2025-04-18T17:28:14+02:00 | 2025-04-18T17:28:14+02:00 | host |
| 708f9be72b5c5415deab8104a7604e86ad1d72d9 | 2025-04-18T17:15:07+02:00 | 2025-04-18T17:15:07+02:00 | add assest/config.js and include in index.html |
| daf9c00e47e08d638f877fe36f720eb306be48b6 | 2025-04-18T17:14:34+02:00 | 2025-04-18T17:14:34+02:00 | add TODO |
| 101a450467ebcb0e455052c12210bd2785a9cfcb | 2025-04-18T04:00:17+02:00 | 2025-04-18T04:00:17+02:00 | Update Server initial root path |
| b3834a254806c01e79efc4fc730931f99f281be0 | 2025-04-18T03:50:02+02:00 | 2025-04-18T03:50:02+02:00 | update 0.0.2 |
| 9b834fb9523b16178f2913c5237d88e9c7e74acc | 2025-04-18T03:48:59+02:00 | 2025-04-18T03:48:59+02:00 | update npm packages |
| c0f4776602a167d3dec14505f5ae9960ab8acee9 | 2025-04-18T03:47:19+02:00 | 2025-04-18T03:47:19+02:00 | update |
| 7c4df5a75ecb354e0520e693201373bfbbb78b4f | 2025-04-18T03:46:55+02:00 | 2025-04-18T03:46:55+02:00 | updated npm packages and version number |
| e958a19e73a7f4b1f13a553086f03b196bfb3758 | 2025-04-18T03:35:10+02:00 | 2025-04-18T03:35:10+02:00 | Move Changelog |
| 9c72b17bbcfd49a2b01a3861c90675b70656005b | 2025-04-18T03:07:00+02:00 | 2025-04-18T03:07:00+02:00 | Empty Initial |
| 9bbf4f8cec096a7ff274e01efde0455f8568fb45 | 2025-04-18T02:29:18+02:00 | 2025-04-18T02:29:18+02:00 | Initial commit |

## Scope, sources and limitations

Git inventory pinned to fa30dafb52261868e89a87198fdd0a6f6c189d24. Snapshot generated at 2026-10-10T15:25:48.444Z.
Classification source: [reviewed outcome classifications](./work-effort-classifications.json).
Exact source hashes, original workflow/WorkPlan records, and extracted checkpoint evidence are retained in [the JSON snapshot](./work-effort-report.json).
- Scope is all reachable HEAD history and current repository records, not deleted branches, inaccessible chats or all work ever done.
- Cloud and local session-history discovery returned no rows for 7-day and 365-day queries during this analysis. Session/tool usage, costs, waiting and active human effort are unavailable, not zero.
- The current conversation confirms timestamped agent-rule, glossary and export work after the last completed evaluation, but a reliable task interval allocation is unavailable. It is not added to duration totals.
- All original delivery-flow/overhead measure text is retained in the evaluation rows; elapsed time is computed from timestamps, not extracted from prose.
- Long canvas and diagram windows explicitly include pauses and intervening work; their category is an outcome classification, not proof of exclusive activity.
- Older commits are inventoried but not classified from subjects alone. No duration or active effort is inferred from commit dates, counts or gaps.
- Workflow checkpoint statements may repeat ledger evidence. They corroborate intervals and preserve follow-ups, but are not added as independent durations.
- Existing workflow Product work labels need not equal Problem/Domain under the agreed outcome-based definition; originals are retained for review.
- Source hashes identify exact working-copy evidence, including uncommitted task state. sourceCommit identifies the Git inventory, not a claim that all source snapshots were committed there.
- Classification judgments are explicit and revisable. No time split is inferred for Mixed outcomes or cross-category overlaps.
- Incomplete or absent evaluation intervals remain unknown; elapsed union coverage is not evidence coverage for the full calendar period.

## Workflow checkpoint timing statements

These are corroborating records, not additional durations.
### [knowledge/workflows/active-workflow-toolbar-workflow.md](../../knowledge/workflows/active-workflow-toolbar-workflow.md)

- Line 14: - Completed at 2026-10-09 22:29:23 CEST. A hidden-tab interaction stalled during verification and was retried only after visibility was restored; the stalled check is not treated as acceptance evidence. Elapsed time includes permission and visibility waits; active effort and follow-up outcome remain unknown.
- Line 33: **Automatic refresh:** Without a click or page reload, the toolbar picked up the restored InteractiveCanvas selection by 2026-10-09 22:12:59 CEST. The 30-second interval is additionally verified with fake timers.
- Line 48: - Canvas selection restored; visible-browser toolbar picked it up automatically without a click or reload by 2026-10-09 22:17:16 CEST. Refinement complete. Changes remain uncommitted.

### [knowledge/workflows/active-workflow-view-workflow.md](../../knowledge/workflows/active-workflow-view-workflow.md)


### [knowledge/workflows/ai-credit-estimator-workflow.md](../../knowledge/workflows/ai-credit-estimator-workflow.md)

- Line 15: **Evaluation:** The `copilot-ai-credit-estimator` WorkEvaluation is complete. Goal and acceptance clarity are recorded. Decision latency and DevEnv process overhead remain unknown. Delivery elapsed time is based on the recorded start and completion timestamps and includes pauses; active effort is unknown. The outcome is verified by focused tests, coverage, build, and browser interaction, but no real user token export or post-release user outcome is available.

### [knowledge/workflows/client-test-repair.md](../../knowledge/workflows/client-test-repair.md)

- Line 6: - All 17 service tests pass with 100% statement/branch/function/line coverage; test-source TypeScript check and diff check pass. Test-only change; no production behavior or new Types. Append quality evidence without altering original scheduler completion/elapsed interval; follow-up effort unknown. Changes uncommitted.
- Line 10: - Type review: reuse IScheduler, whose every/cancel protocol already fits polling; callback ownership is explicit and tested. No new Type or further refactoring justified. No UI behavior change; runtime UI check not required for this dependency-only refactor. Phase cleared. Completion 01:46:40.493+02:00 gives 1m 21.466s wall-clock, not active effort. Metrics recorded; changes uncommitted.
- Line 16: - Completion at 2026-10-10T01:43:23.339+02:00: 2m 23.345s wall-clock, active effort/overhead unknown. Metrics updated, workflow completed. Test-only, so no new build/runtime check required. Changes uncommitted; next user review or requested commit.
- Line 24: - Metrics: completion 2026-10-10T01:38:52.919+02:00; 2m 45.424s wall-clock including opt-ins and verification. Active effort, waiting, latency and overhead unknown. Test-only: no production coverage/build requirement added; no new Type or runtime behavior introduced. Changes uncommitted. Next: user review or requested commit.

### [knowledge/workflows/darwin-workflow.md](../../knowledge/workflows/darwin-workflow.md)

- Line 27: - Pre-installation verification: 4 targeted server generation tests and 6 client preview/component tests passed; server test-source type-check and shared/client production builds passed. No generated native customizations installed. Pause for a source-branch commit before creating the trial so its corrected candidate can be pinned to committed content; the earlier ac76807 base does not contain these fixes. After commit approval, use the resulting commit as the proposed trial base and obtain exact branch/file installation approval. Discovery, invocation and effectiveness remain unverified; active effort remains unmeasured.

### [knowledge/workflows/devenv-export-workflow.md](../../knowledge/workflows/devenv-export-workflow.md)


### [knowledge/workflows/devenv-value-evaluation-workflow.md](../../knowledge/workflows/devenv-value-evaluation-workflow.md)

- Line 13: **Current process:** TDD links behavior to tests; coverage, type-checks/builds, runtime checks, and workflow checkpoints record implementation and verification evidence. We do not consistently record pre-work success conditions, a comparable baseline, decision/delivery elapsed time, human effort, process overhead, or post-delivery outcomes.
- Line 25: The `/workflow-todo` page shows a compact recorded/unknown count for each metric and displays completed evaluation titles with elapsed durations in their associated workflow rows; `/workflow-evaluations` displays metric definitions and full evaluation records read-only. Both views derive elapsed wall-clock duration from `startedAt` and `completedAt`; this is not active effort, which remains separately recorded or unknown. The workflow-row associations are presentation-only and explicitly keyed in the view; unmapped workflows show no associated evaluated item. Missing or unusable timestamps are shown explicitly. Neither view adds application instrumentation or automatic collection. Continue to record measures manually and update the JSON source.
- Line 33: 3. **At a stable completion or pause:** record completion time, acceptance result, evidence links, approximate active effort and DevEnv process overhead if participants can estimate them, and unresolved user-outcome evidence. Reconcile each measure against available evidence, calculate elapsed wall-clock time from recorded start and completion timestamps, and leave active effort or other values unknown when the evidence does not support them.
- Line 45: - Show elapsed-time distributions or trends only when repeated observations make them interpretable. Segment by role or work type only with enough comparable observations; do not rank individuals.
- Line 71: **Trial design:** Use small, low-risk, comparable coding tasks with the same acceptance conditions and tool/model setup. Alternate or randomize profiles across matched tasks where practical; start isolated sessions and record the selected profile and its revision so prior context or a profile change cannot silently contaminate the comparison. Preserve pre-work success conditions, outcome evidence, elapsed time, estimated active effort, process overhead, defects/rework, and unknowns. Compare outcomes and burdens separately rather than collapsing them into one score. Treat a small sample as descriptive; do not infer causation or generalize beyond the tested work.

### [knowledge/workflows/diagram-editor-workflow.md](../../knowledge/workflows/diagram-editor-workflow.md)

- Line 25: **Selection checkpoint (2026-10-09; superseded):** The active DevEnv Value Evaluation pilot began for selection and movement. Recorded the developer beneficiary, intended outcome, acceptance condition, absent-feature baseline, and start time; historical timing and effort are unavailable. Selection is now operable by pointer, Enter, and Space, with `aria-pressed` and a visible outline. The focused page suite passes (7 tests). Movement had not started at this checkpoint; no coverage or build check had been run. The stable checkpoint below supersedes this interim state.
- Line 29: **Stable checkpoint (2026-10-09 13:33 CEST):** Selection and free dragging of workspace items are implemented. Pointer, Enter, and Space activate selection; dragging persists positions through `moveDiagramElement`, accounting for item grab offset, workspace bounds, and scroll. Touch pointer coordinates and malformed drag states are covered. The full client suite passes (39 suites, 512 tests) with 100% statements, branches, functions, and lines globally and for `diagram-page.component.ts`; shared and client builds pass. The separate Jest-source TypeScript check initially reported TS2345 on the palette-button `it.each` readonly tuples; removed the unnecessary `as const`, and the test TypeScript check now passes. Browser-based visual/real-pointer verification and end-user outcome evidence remain unavailable. No new formal domain Type; selection remains component interaction state and persisted positions reuse `DiagramPoint`. Next: connection workflow.
- Line 31: **Stable checkpoint (2026-10-09 13:38 CEST):** Reverified after the narrow Jest test typing correction. The full client suite passes (39 suites, 513 tests) with 100% statements, branches, functions, and lines globally and for `diagram-page.component.ts`; Jest-source type-check and shared/client builds pass. The `it.each` palette cases now use object records instead of readonly tuples. This supersedes the prior stable checkpoint's type-check note. No visual browser interaction was performed. Next: connection workflow.

### [knowledge/workflows/full-glossary-export-workflow.md](../../knowledge/workflows/full-glossary-export-workflow.md)


### [knowledge/workflows/glossary-refinement.md](../../knowledge/workflows/glossary-refinement.md)


### [knowledge/workflows/interactive-canvas-workflow.md](../../knowledge/workflows/interactive-canvas-workflow.md)

- Line 13: **Evaluation:** The `interactive-canvas-clock-prototype` WorkEvaluation records the beneficiary, intended outcome, success condition, baseline, and start time. Active effort and post-delivery user outcome remain unknown until supported by evidence.
- Line 26: - Baseline: only the purpose overview could be loaded; connections were undirected and no execution boundaries were drawn. The existing editor suite had 97 passing tests. Active effort and user-understanding improvement remain unknown.
- Line 49: - Next: user comparison of hierarchy and state readability before applying any trial styles elsewhere. Comprehension improvement, user preference and active effort remain unknown; no design convention or ruleset change is adopted.
- Line 90: - Completion (2026-10-09T23:50:00+02:00): third Red/Green cycle proves overview labels constrained to 164px inside 180px boxes; normal sketch rendering preserved. 22 editor tests pass with 100% all-four coverage. Shared/client builds pass. Full client test-source type-check caught four new test-only MouseEvent/PointerEvent call mismatches; fixed by dispatching through actual canvas event bindings rather than casting; rechecked green. Changed-file diagnostics and diff check clear.
- Line 102: - Acceptance (2026-10-09 23:35:29 CEST): 20 editor tests pass with 100% statements/branches/functions/lines; client build passes. Test-source check has unrelated Glossary/Workflow TODO errors, no canvas diagnostics. Exact tests cover 6px versus 6.01px, newest overlapping line, part precedence, diagonal movement/old-position miss, coincident endpoints, selected stroke, non-dragging lines, draft preservation/default progression/empty labels and mode guards.
- Line 106: - Evaluation completed; elapsed 6 minutes 39 seconds to final visible acceptance, including decisions/gates. Active effort/overhead/follow-up usability unknown. Phase cleared; changes uncommitted. Next remains architectural-meaning discussion, not started.
- Line 115: - Acceptance (2026-10-09 23:23:44 CEST): 26 editor/surface/browser tests pass with 100% statements/branches/functions/lines for editor and changed drawing contracts. Client build passes; test-source check retains unrelated Glossary/Workflow TODO errors with no canvas diagnostics. No persistence, directed semantics, Morphic dependency, or changes to existing Diagram behavior.
- Line 118: - Checklist trial slice 2 of 3: existing mocks/contracts reused before tests; no Jest interception or test external I/O; approvals, observed Red, full coverage/build and separate compliance review performed. No omitted practice identified in final review. Corrections: misplaced cleanup caught by tests, two new test-sequence expectations fixed, and final rendering test uses public renameConnection rather than assigning the label. Friction: browser visibility required user assistance; immediate status sampling required waiting for UI update; narrow controls require normal page scrolling. Active effort/overhead unknown. One trial slice remains; effectiveness not yet established.
- Line 119: - Evaluation completed with 8 minutes 20 seconds wall-clock including decisions, gates and browser visibility waits. Phase cleared and saved/API state verified at completion. Changes uncommitted. Next is slice 5; do not start automatically.
- Line 127: - Acceptance (2026-10-09 23:11:10 CEST): ten editor tests pass with 100% statement/branch/function/line coverage. Exact assertions cover repeating four-position creation pattern, ids not reused after removal, topmost overlap hit, unchanged creation/drawing order on older-part selection, and selected border. Client build passes. Test-source check retains unrelated Glossary/Workflow TODO errors; no canvas diagnostics.
- Line 130: - Checklist trial slice 1 of 3: dependency check reused both existing mocks before tests; no Jest interception or test external I/O; required design approvals, observed Red, coverage, build, and separate compliance review performed. No missed applicable checks identified in this review; no production correction/rework after first Green. Friction: shared browser location was unclear; opened an integrated page before resuming with permission. Existing test-source errors explicitly reported. Active effort and overhead unknown. Two trial slices remain; effectiveness not yet established.
- Line 131: - Evaluation completed; elapsed 4 minutes 27 seconds including decisions, gate and browser-location assistance. Phase cleared; changes uncommitted. This checkpoint supersedes historical next-step statements above; next is slice 4, not started.
- Line 135: - Scheduler correction (2026-10-09 22:54 CEST): user approved reusing existing IScheduler/SCHEDULER for the editor's one-second invalidation, with cancellation and plain MockScheduler consumer tests. Preserve current-time reading; do not introduce IClock. Success: exact 1000ms registration, tick-driven redraw, cancellation on destruction, and no registration after failed surface initialization. Earlier deferral of this existing boundary was mistaken; correcting before committing.
- Line 136: - Correction complete (2026-10-09 22:55 CEST): Red observed missing scheduler registration (expected 1000, received undefined), then Green with injected SCHEDULER and optional cancellation callback. MockScheduler ticks verify redraw and cessation after destruction; failed initialization registers no recurring work. No Jest fake timers or time advancement remain in editor tests. Current-time output checked around synchronous painting without advancing wall time. Eight editor tests pass with 100% all-four coverage; client build and changed-file editor diagnostics pass. Existing IScheduler fits; no new Type or clock abstraction. No fresh live-browser check for this correction; earlier editor/surface acceptance remains separate evidence. Phase cleared; changes uncommitted.
- Line 144: - Completion (2026-10-09 22:52:09 CEST): subsequent visible 380px check verifies backing 320 x 301 matches CSS content, sketch ink, no horizontal overflow, and canvas bottom 639px above toolbar top 702.219px. Earlier hidden resize measurement is superseded, not used as acceptance. Live high-DPR change was verified in slice 1; current extraction's DPR behavior is covered by surface/adapter tests, not a new live DPR change.
- Line 146: - Evaluation completed with verified acceptance and 5 minutes 30 seconds wall-clock; active effort, process overhead, and follow-up outcome remain unknown. Phase cleared and toolbar displays TDD: idle. No additional meta-level insight identified. Next: slice 3 naming/selection decisions; do not start automatically.
- Line 148: ### Slice 2 acceptance (2026-10-09 22:42:03 CEST)
- Line 155: - Evaluation records acceptance and elapsed time; the structured record was added at this checkpoint rather than before Red. Outcome/baseline had been agreed in the saved plan and conversation, but this timing is a tracking gap, not retroactive evidence of a pre-work record. Active effort and follow-up usability unknown.
- Line 174: ### High-density acceptance and correction (2026-10-09 22:34:13 CEST)
- Line 183: ### Viewport stretch checkpoint (2026-10-09 22:03:56 CEST)
- Line 190: - The browser became hidden during verification; those bitmap checks were not accepted as runtime evidence. After the user restored visibility, automatic resize and paint delivery were reverified. Elapsed time includes permission and visibility waits; active effort and follow-up outcome remain unknown. Changes remain uncommitted.
- Line 192: ### Visible-browser verification (2026-10-09 21:57:38 CEST)
- Line 197: - Frame scheduling and pointer-coordinate evaluations now record verified completion and elapsed times. Real high-density rendering is still unverified; sizing evaluation and broader milestone remain incomplete. Tests cover DPR 2 and a subsequent DPR 1 change.
- Line 199: ### Pointer conversion checkpoint (2026-10-09 21:56:12 CEST)
- Line 205: - Reconciled scheduling elapsed time to its recorded green-checkpoint timestamp, not completion. Pointer conversion has 1 minute 39 seconds elapsed to this checkpoint; no active-effort estimate is inferred. Visible runtime acceptance remains outstanding. No new meta-level insight identified.
- Line 219: - The completed `interactive-canvas-typed-boundary` evaluation preserves all five metrics and records 4 minutes 43 seconds elapsed including user waits, not active effort. The sizing and broader editor evaluations remain incomplete.
- Line 289: The entries preserve supported baseline/results and linked commits, explicitly disclose retrospective registration and leave unrecorded start/completion timestamps, decision latency, active effort, overhead and user benefit unknown. Verified delivery is recorded in outcome evidence without inventing an exact completion time. This repair does not retroactively establish pre-work tracking.
- Line 297: For each production slice: Red-Green-Refactor, public-interface tests, 100% statement/branch/function/line coverage for changed modules, Type review, an appropriate client build, and real browser/pointer checks. Tests mock external boundaries and do not mutate the real filesystem. Record acceptance evidence, elapsed time, observed decision points, and unresolved user outcomes without inferring active effort or AI credits.

### [knowledge/workflows/knowledge-migration.md](../../knowledge/workflows/knowledge-migration.md)


### [knowledge/workflows/meta-export.md](../../knowledge/workflows/meta-export.md)


### [knowledge/workflows/principle-register-review.md](../../knowledge/workflows/principle-register-review.md)


### [knowledge/workflows/process-markdown-typed-json-inventory.md](../../knowledge/workflows/process-markdown-typed-json-inventory.md)


### [knowledge/workflows/ruleset-reduction-workflow.md](../../knowledge/workflows/ruleset-reduction-workflow.md)

- Line 41: - Metrics updated with in-progress review evidence; completion, active effort and impact remain unknown. Current work uncommitted.
- Line 137: - Fresh-session loading check (2026-10-10, session started 04:36 after cutover commit `22cce35` at 04:32): the session still received the pre-cutover guidance (P-NNN register, three-minute gate, old agents) as injected custom instructions, although HEAD `AGENTS.md` is the reduced ruleset and the worktree matches HEAD. No other instruction source was found: no `copilot-instructions.md`, `*.instructions.md`, agents or prompts in the repository or parent folders, nothing in `~/.copilot`, no match in VS Code user settings, and only the UI review skill is discoverable. Likely cause, unverified: the host cached guidance from before the cutover (last `AGENTS.md` revision before it was `1565e27`, 01:07). Effective loading therefore remains unverified; reloading the VS Code window and starting a new chat is the suggested next check. The representative-behavior check is still pending. No commit authorized.
- Line 138: - Later session (2026-10-10 ~04:41): injected instructions were the reduced AGENTS.md ruleset (no register, gate or old agents), which is evidence of effective loading; the chat's freshness and the host-cache cause above stay unconfirmed. Step 6 desk check: all 12 Must, 16 Should and 4 ranked Could ledger items map to AGENTS.md wording; unranked Could and all Won't items are absent as intended; AGENTS.md is 48 lines (60 ceiling) and its local links resolve. Executed behavior: two commit requests followed scope verification, exact-subject approval, no co-author trailer and a clean-worktree check; the checkpoint was refreshed before pausing. Not executed: test-repair/production-change and same-task metrics refinement trials, ledger open question 1 (full source inventory/preservation audit). The ledger `status` string was refreshed to match. Next: user choice between running the remaining trials or closing the preservation audit. Uncommitted until requested.
- Line 139: - Preservation audit, file level (2026-10-10 ~04:48, read-only): all 60 ledger decisions cite sources; the 19 distinct cited files are live or, for the four removed skills and two removed agents, present as identity-path members in the 144-entry reference ZIP. ZIP SHA256 matches the recorded `9ef01457…ac479`. The live `.agents/system-task-principles.md` is a non-binding pointer to the archived register, not active guidance. Not audited: whether each detailed obligation inside the archived sources is covered or deliberately retired; ledger open question 1 therefore stays open at obligation level. Next: user choice between an obligation-level audit (large, read-only) or the remaining behavior trials. Uncommitted until requested.
- Line 140: - Behavior trials (2026-10-10 ~04:55) ran in a scratch directory under the session folder, chosen by the user; nothing in the repo was touched and the scratch files were deleted afterwards. Jest 29.7 ran from the repo's node_modules with a scratch config (testRegex, because testMatch globs missed the dot-directory path). Results: (1) production change: Red observed (missing module), the first minimal implementation then failed one test on a trailing dash, was corrected, and ended Green with 100% statements/branches/functions/lines; no duplication or meaningful Type finding in a 5-line plain-JS function. (2) test-only repair: a deliberately wrong expectation failed; production output matched the agreed behavior, so only the test was corrected with an exact assertion, not loosened, and no production change was made. (3) same-task refinement with simulated opted-in tracking: the follow-up (accent stripping) was Red-first, then Green at 100%; tracking was not re-asked, baseline and completion evidence were recorded, and effort and impact stayed unknown. Not exercised: a real repo change, a real Angular/Express suite, and a fresh-chat run. Trial 2's failure was staged by me, so it tests the repair rule, not discovery of a natural regression. Ledger open question 1 (obligation-level preservation audit) remains open. Uncommitted until requested.
- Line 141: - Obligation-level audit (2026-10-10 ~05:00, read-only, archive extracted to a temp folder and deleted): all 30 active principles P-001..P-031 (P-013 retired) are cited by at least one ledger decision, all four removed skills, both removed agents and the optional UI/domain/typed-JSON/Demolition items have decisions, and archived `agent-practices.md` sections map to AGENTS.md, local UI conventions or deliberate Won't decisions. Findings requiring closure: (a) rule-change approval stays Must in live AGENTS.md and is retained as a user-approval safeguard; decision 33's Won't classification is therefore treated as a historical archival distinction rather than a live active rule. (b) The archived storage-order preference (Typed JSON, then YAML, then Markdown) remains historical context, not an active ruleset requirement. (c) The shared API contract preference remains historical context rather than a live active rule. (d) The README appearance/control-size requirement remains local/historical convention only; the reduced default retains the concrete local UI rules and intentionally drops the general statement from the always-on set. Deliberate reversals noted, not defects: P-029 (improve process without prior approval) is superseded by the approval rule, and P-005 (commit at stable checkpoints) by commit-only-on-request. This closes the preservation audit; no active-rule reintroduction applied. Uncommitted until requested.

### [knowledge/workflows/term-editing-workflow.md](../../knowledge/workflows/term-editing-workflow.md)


### [knowledge/workflows/test-boundary-mocks.md](../../knowledge/workflows/test-boundary-mocks.md)


### [knowledge/workflows/todo-view-workflow.md](../../knowledge/workflows/todo-view-workflow.md)

- Line 23: - Same-task styling refinement: right-align Tools with an automatic inline-start margin, preserving final DOM order and Material dropdown behavior. Browser measures zero gap to navigation right edge at 1280/768/320px; dropdown remains within viewport and no document overflow. Fresh client build, diagnostics and diff check pass. Append follow-up quality evidence to the opted-in evaluation without altering original completion/elapsed timestamps; follow-up effort unmeasured.
- Line 29: - WorkEvaluation completed at 01:30:37.535+02:00: 3m 13.425s wall-clock including approvals, not effort. Decision latency, active effort, waiting duration, overhead and user impact remain unknown. Phase cleared; no new domain Types or remaining refactoring justified. Changes uncommitted; next user review or requested commit.
- Line 33: - User opted into a separate refinement WorkEvaluation linked to TODO View. Record toolbar-status-order-and-workflow-alignment retrospectively; preserve the completed toolbar-global-grid-alignment record. Known request/build timestamps give 1m 27.843s wall-clock, not effort. Decision latency, active effort and process overhead remain unknown.
- Line 60: - User refinement: expanded context and timing reuse the header grid. Left fields align with Title; right fields start at Status and span the remaining width. Evidence aligns with Title; narrow layout still stacks without overflow.
- Line 73: ### Padded elapsed units
- Line 76: - Observed seven formatting failures before implementation, including zero duration, summed milliseconds and long durations. Existing elapsed value representation suffices; no new domain Type needed.
- Line 81: - User refinement: right-align the duration column and remove the visible Elapsed duration prefix. Keep exact formatted values, unknown/unavailable reasons and the incomplete dash; observed exact-text Red before implementation.
- Line 83: - User requested separate aligned title/status/duration columns and full available page width. Use a grid summary with a disclosure indicator; stack status/duration beneath the title on narrow screens. Incomplete evaluations retain no elapsed-duration claim and display a dash in their duration column. Observed separate-field test Red before implementation; data/Types unchanged.
- Line 85: - User refinement: place completion status and elapsed duration inline beside the title, with .75rem separation and natural wrapping on narrow screens. Native disclosure marker and behavior unchanged.
- Line 86: - User approved compact evaluation headers (title, completion status and elapsed duration) with expandable evidence, plus collapsed metric definitions and credit estimator. Native details/summary retains keyboard interaction and all existing content/controls. Missing completion means Not completed, not an inferred active lifecycle state.
- Line 94: - User approved moving Product and Meta subtotals and the grand total into a compact wrapping summary above the workflow table, with the subtle explanation directly underneath. Per-workflow elapsed totals stay in their rows; duplicate bottom totals removed. Existing calculation, deduplication and missing-duration semantics unchanged.
- Line 95: - Observed four top-summary tests fail before implementation. Reuse existing workflow groups and summedWorkflowElapsed; presentation-only rearrangement warrants no new domain Type.
- Line 114: - Approved view-only group subtotal rows and grand total at table bottom. Count unique associated evaluations within each group and overall; shared cross-group evaluations can make subtotals exceed grand total. Keep summed-elapsed/not-effort and missing-duration semantics.
- Line 115: - Workflow and evaluation opted in before Red. Reuse summedEvaluationElapsed (already filters unique dataset records) and existing HTTP mocks; no new Type, boundary or storage. Next: public-view exact totals/deduplication Red, implementation, coverage/types/build/browser.
- Line 117: - Type review: reuse WorkflowTodoList workflows/evaluationIds and unique validated dataset records; summedWorkflowElapsed gathers associations and delegates existing sum. Concrete shared test evaluation contributes once per group and once overall, contrasting repeated workflow associations; no new Type needed, no optional cleanup pending. Unknown/incomplete/unassociated semantics verified without test external I/O.
- Line 119: - Global workflow remains active canvas exploration; this presentation slice complete/uncommitted, phase idle. Evaluation tracks acceptance not demonstrated usefulness; latency/active effort/overhead unknown. Suggested subject: Add product and meta elapsed subtotals and grand total.
- Line 121: ### Summed evaluated elapsed time slice
- Line 123: - User approved per-workflow total beside completed count, labelled Summed elapsed (not effort). Sum completed evaluation durations only; missing timestamps remain explicit, never zero. Overlap/waiting caveat remains visible. Record workflow and evaluation before Red.
- Line 126: - Refactor reuses private elapsed parsing and formatting for individual/aggregate displays, preserving Unknown/Unavailable distinctions and summing milliseconds before rounding. An initial misplaced method insertion caused a syntax failure; corrected before final passing checks. No hidden test I/O or new dependencies. Existing WorkEvaluation timestamp projection reused; no new domain Type.
- Line 127: - Type review: elapsed parsing returns numeric milliseconds or existing explicit display failure strings; distinguishing known zero from missing duration is required and tested. Example: zero-duration completed evaluation counts as known; null start does not. A richer named result could replace display strings if another consumer needs structured failure reasons; not justified for this display-only slice.
- Line 128: - Visible desktop verifies collapsed active history reads 13 completed / Summed elapsed: 2h 12m 33s. At 320px summary >=44px high, document width305 <= viewport320 and existing horizontal table scrolling preserved. Total is sum of intervals, not effort or deduplicated wall-clock; disclaimer explains waiting/overlap and excluded unknown/unavailable counts.
- Line 129: - Global workflow remains active canvas exploration; this TODO-view follow-up complete, uncommitted, phase idle. Evaluation records acceptance, not user benefit; latency/effort/overhead unknown. Suggested subject: Show summed evaluated elapsed time per workflow.
- Line 133: - Approved: keep grouped table, remove repeated purpose column, top-align cells, collapse completed evaluations into count/disclosure with a vertical elapsed-time list and evidence navigation. Add View checkpoint using existing resume fields without switching workflows.
- Line 136: - Red observed missing details; implemented shared history template, array of completed summaries, count/disclosure, elapsed explanation/evidence link, four top-aligned columns with purpose communicated by group. 13 tests green; final old purpose-column assertion updated to grouped presentation and four headers. Next: verify all green, then checkpoint read-only loading/cancellation/errors tests before implementation. Phase cleared for continuation gate; no source authority change or workflow switch. Shared Types unchanged.
- Line 140: - Completion (2026-10-10T00:11:33+02:00): 18 tests green at 100% all-four coverage, full client test-source type-check and final client build pass. Changed-file diagnostics and diff formatting clear. Generated TODO Markdown twice identically; JSON stays authoritative, shared/API contract unchanged.
- Line 141: - Visible acceptance: collapsed canvas workflow row 97px high, summary 13 completed, all four cells top-aligned. Keyboard Enter expands the vertical history and elapsed-time explanation/evidence link. View checkpoint loads actual canvas workflow Markdown read-only, includes reference and heading-jump limitation, no editable controls, active canvas workflow unchanged. At 320px, table scrolls (271px visible / 672px content), document width305 <= window320, history/checkpoint controls 44px high, checkpoint pre has no horizontal overflow. Restored desktop.
- Line 143: - Global workflow selection remains InteractiveCanvas Prototype; this approved TODO-view follow-up complete without switching work. Evaluation records observable acceptance, not demonstrated user benefit; decision latency/active effort/process overhead unknown. Uncommitted; phase idle. Suggested subject: Compact workflow history and expose read-only checkpoints.
- Line 226: The evaluations view derives elapsed wall-clock duration for completed records from their existing `startedAt` and `completedAt` values. Incomplete records omit the duration; completed records with missing or invalid timestamps show an explicit unavailable/unknown value. This does not alter the JSON schema or imply active human effort. The display and error cases are covered through the component's public view.
- Line 234: The user clarified that completed-item durations should appear on the workflow items themselves, not in a separate list beneath the metric summary. The view now displays each associated completed evaluation title and derived elapsed wall-clock duration in a new column on the corresponding workflow row, using the same formatter as the evaluation detail page. The two current presentation mappings associate Diagram selection and movement with Minimal Typed Diagram Editor and Show current evaluation metrics on the Workflow TODO view with TODO View (DevEnv system layer). Unmatched workflows show no associated evaluated item; incomplete evaluations are not associated. The source data and Types are unchanged.

### [knowledge/workflows/ui-design-review-workflow.md](../../knowledge/workflows/ui-design-review-workflow.md)


### [knowledge/workflows/work-plans.md](../../knowledge/workflows/work-plans.md)

- Line 15: Build an evidence-backed comparison without equating elapsed sessions, commit gaps or agent execution time with human active effort.
- Line 25: Agree the reporting period and classification criteria before implementation. Proposed categories: Problem/Domain for work delivering or investigating the supported problem/domain; Meta/DevEnv for tooling, agent rules, workflows, test infrastructure, measurement and environment upkeep. Classify by intended outcome, not merely file path, and retain mixed/unclassified work rather than forcing a binary allocation. Gather as much available evidence as possible from WorkPlans and linked evaluations, knowledge/workflows/devenv-value-evaluation.json, workflow checkpoints and reports, timestamped user/assistant turns, session metadata and tool-execution records where accessible, Git commits/diffs and explicit user time records. Link every classification and time interval to its source and distinguish direct observations, estimates and unknowns. Report human active effort separately from elapsed delivery windows, waiting and agent/tool execution; never infer active effort from commit gaps, message gaps or whole-session duration. Avoid double counting overlapping tasks/sessions and parallel tool or agent activity; document allocation assumptions and missing evidence. Produce a report with category totals and proportions only where supported by comparable evidence, per-task breakdown, evidence coverage, mixed/unclassified time, limitations and reproducible derivation. Use authoritative typed JSON with generated Markdown for structured report data; agree any UI separately. Initial evidence inventory on 2026-10-10: the evaluation ledger has 46 evaluations, 38 with both startedAt/completedAt and 34 with a non-null delivery-flow-and-effort value; values may describe wall-clock time with active effort unknown, so inspect each rather than summing them blindly. Recent commits c7fcf3a, 57ce107 and 74d351d cover AgentPhaseGuide rules/glossary/export; e748394, b074703, ad87c42, d07e878 and e5f827f cover test infrastructure and planning, providing classification leads and commit timestamps but not durations. Cloud and local session-store queries over the last seven days returned no rows in this session; treat history availability as unresolved, not proof that no work occurred. This conversation also provides timestamped evidence of generic-core refinement, tracking-rule decisions and an in-memory export dry run; preserve accessible turns/checkpoints when the task starts. Success: a source-traceable comparison that explicitly reports unknown active effort and demonstrates no overlap double counting; do not present unsupported totals as measured time.

### [knowledge/workflows/workflow-evaluation-associations.md](../../knowledge/workflows/workflow-evaluation-associations.md)


### [knowledge/workflows/workflow-todo-list.md](../../knowledge/workflows/workflow-todo-list.md)


