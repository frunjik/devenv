# DevEnv architecture

Generated from [devenv-c4.json](./devenv-c4.json). Do not edit independently. Regenerate using [devenv-c4.md](./devenv-c4.md).

Date: 2026-10-07. Current-architecture draft for review, not a proposed redesign.

Legend: boxes are labelled architectural elements; arrows are directed interactions; labelled groups show view-specific boundaries. Data-store containers do not imply separate processes.

## System context: DevEnv

No independent external application integration is established by the inspected paths. Git and test tooling appear in the deployment view; WMS examples are content, not a live integration.

```mermaid
flowchart TB
subgraph group0["Context"]
direction TB
user["DevEnv user<br/>[Person]<br/>Frames outcomes and works with notes,<br/>tickets, artifacts and development<br/>feedback"]
devenv["DevEnv<br/>[Software System]<br/>Connects intended outcomes to work,<br/>artifacts, tests and changes"]
end
user -->|"Frames work and reviews outcomes"| devenv
```

## Containers: DevEnv

Filesystem stores are logical responsibilities, not separate services or necessarily separate disks. The shared package is a compile-time library, not a running container. Ticket persistence describes startServer; createApp defaults to an in-memory store.

```mermaid
flowchart TB
subgraph group0["User"]
direction TB
user["DevEnv user<br/>[Person]<br/>Frames outcomes and works with notes,<br/>tickets, artifacts and development<br/>feedback"]
end
subgraph group1["DevEnv system boundary"]
direction TB
client["DevEnv client<br/>[Container]<br/>Angular / TypeScript<br/>Presents inquiry, planning, glossary,<br/>files and development actions"]
api["DevEnv API<br/>[Container]<br/>Node.js / Express<br/>Validates requests, applies ticket<br/>rules and accesses local resources"]
workspace["Workspace resources<br/>[Container: data store]<br/>Filesystem / JSON / Markdown<br/>Source, glossary, concerns, workflows<br/>and other project resources"]
tickets["Ticket store<br/>[Container: data store]<br/>JSON file<br/>Persists tickets and their change<br/>history"]
cache["Test-run cache<br/>[Container: data store]<br/>JSON file<br/>Persists the last test-run result"]
end
user -->|"Works through the browser UI"| client
client -->|"Requests data and actions<br/>HTTP / JSON; test responses stream<br/>NDJSON"| api
api -->|"Reads resources and edits files<br/>Filesystem I/O"| workspace
api -->|"Loads and persists tickets and history<br/>Filesystem I/O"| tickets
api -->|"Stores and retrieves test results<br/>Filesystem I/O"| cache
```

## Deployment: local development

The browser may share the development host or be on another machine. The API defaults to port 3000. Export paths belong to the API machine. This does not specify production hosting, scaling or authentication guarantees.

```mermaid
flowchart TB
subgraph group0["User"]
direction TB
user["DevEnv user<br/>[Person]<br/>Frames outcomes and works with notes,<br/>tickets, artifacts and development<br/>feedback"]
end
subgraph group1["Browser execution environment"]
direction TB
client["DevEnv client<br/>[Container]<br/>Angular / TypeScript<br/>Presents inquiry, planning, glossary,<br/>files and development actions"]
end
subgraph group2["Development host"]
direction TB
devserver["Angular development server<br/>[Infrastructure node]<br/>Angular CLI<br/>Serves client assets during local<br/>development"]
api["DevEnv API<br/>[Container]<br/>Node.js / Express<br/>Validates requests, applies ticket<br/>rules and accesses local resources"]
tools["Development subprocesses<br/>[Execution environment]<br/>Git / Node.js / npm / Jest<br/>Execute Git operations and the<br/>maintained tests"]
workspace["Workspace resources<br/>[Container: data store]<br/>Filesystem / JSON / Markdown<br/>Source, glossary, concerns, workflows<br/>and other project resources"]
tickets["Ticket store<br/>[Container: data store]<br/>JSON file<br/>Persists tickets and their change<br/>history"]
cache["Test-run cache<br/>[Container: data store]<br/>JSON file<br/>Persists the last test-run result"]
export["Export destination<br/>[Filesystem resource]<br/>Server-local folder<br/>Receives the curated DevEnv clone<br/>package"]
end
user -->|"Works through the browser UI"| client
client -->|"Loads client assets<br/>HTTP"| devserver
client -->|"Requests data and actions<br/>HTTP / JSON; test responses stream<br/>NDJSON"| api
api -->|"Reads resources and edits files<br/>Filesystem I/O"| workspace
api -->|"Loads and persists tickets and history<br/>Filesystem I/O"| tickets
api -->|"Stores and retrieves test results<br/>Filesystem I/O"| cache
api -->|"Starts Git and test commands<br/>Child processes; development routes"| tools
tools -->|"Operates on repository and source<br/>Filesystem I/O"| workspace
api -->|"Stages and installs a curated clone<br/>Filesystem copy / rename"| export
```

## Limits

Selective source inspection, not runtime verification or a complete integration inventory. No component or dynamic diagrams yet. Mermaid flowcharts express C4-style views, not the experimental Mermaid C4 syntax.
