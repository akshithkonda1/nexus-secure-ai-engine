# Ryuzen Workspace OS V2 — System Specification

This document captures the expanded, production-grade architecture for the Ryuzen Workspace OS V2 stack, covering frontend, backend, AWS infrastructure, connectors, and Toron intelligence. Use it as the canonical reference when implementing features or generating subsystem-specific scaffolding.

## Frontend (React + TypeScript + Vite)

### Authoritative folder layout
```
src/
 ├─ components/
 │   ├─ workspace/
 │   │   ├─ Quadrants.tsx
 │   │   ├─ WorkspaceSurface.tsx
 │   │   ├─ center/
 │   │   │   └─ DynamicWorkspace.tsx
 │   │   ├─ osbar/
 │   │   │   └─ OSBar.tsx
 │   │   └─ widgets/
 │   │       ├─ ListsWidget.tsx
 │   │       ├─ CalendarWidget.tsx
 │   │       ├─ TasksWidget.tsx
 │   │       └─ ConnectorsWidget.tsx
 │   ├─ navigation/
 │   │   ├─ TopNav.tsx
 │   │   └─ SideNav.tsx
 │   └─ toron/
 │       ├─ ToronBubble.tsx
 │       └─ ToronInsights.tsx
 ├─ layouts/
 │   └─ MainLayout.tsx
 ├─ pages/
 │   ├─ Workspace.tsx
 │   └─ workspace/
 │       ├─ ListsPanel.tsx
 │       ├─ CalendarPanel.tsx
 │       ├─ TasksPanel.tsx
 │       ├─ ConnectorsPanel.tsx
 │       ├─ PagesPanel.tsx
 │       ├─ NotesPanel.tsx
 │       ├─ BoardsPanel.tsx
 │       ├─ FlowsPanel.tsx
 │       └─ ToronPanel.tsx
 ├─ router/
 │   └─ index.tsx
 ├─ styles/
 │   ├─ theme.css
 │   └─ globals.css
 └─ utils/
     ├─ fetcher.ts
     ├─ api.ts
     ├─ state.ts
     └─ models.ts
```

### Routing
- Quadrants: `/workspace/lists`, `/workspace/calendar`, `/workspace/tasks`, `/workspace/connectors`
- OS Bar views: `/workspace/pages`, `/workspace/notes`, `/workspace/boards`, `/workspace/flows`
- Toron: `/workspace/toron`

### Interaction model
- Quadrants map to Intentions (lists), Time (calendar), Actions (tasks), and Systems (connectors); panels slide up with hover/press animations.
- OS Bar provides Pages, Notes, Boards, and Flows with soft hover and ripple cues; Toron bubble wiggles when attention is required.
- Center dynamic surface shows the active panel with glass/blur styling and grid overlay when active.

## Backend (FastAPI + Python 3.11)

### Folder layout
```
backend/
 ├─ main.py
 ├─ core/
 │   ├─ config.py
 │   ├─ security.py
 │   └─ aws.py
 ├─ routers/
 │   ├─ lists.py
 │   ├─ calendar.py
 │   ├─ tasks.py
 │   ├─ connectors.py
 │   ├─ pages.py
 │   ├─ notes.py
 │   ├─ boards.py
 │   ├─ flows.py
 │   └─ toron.py
 ├─ models/
 │   └─ workspace.py
 ├─ services/
 │   ├─ lists_service.py
 │   ├─ tasks_service.py
 │   ├─ calendar_service.py
 │   ├─ connectors_service.py
 │   ├─ pages_service.py
 │   ├─ toron_service.py
 │   └─ ai/
 │       └─ toron.py
 └─ aws/
     ├─ dynamo.py
     ├─ secrets.py
     ├─ s3.py
     └─ kms.py
```

### Data models
- **Lists**: `id`, `user_id`, `title`, `type`, `created_at`, `updated_at`
- **Tasks**: `id`, `user_id`, `title`, `status`, `list_id`, `due_date`, `created_at`, `updated_at`
- **Calendar**: `id`, `user_id`, `source`, `title`, `start`, `end`, `all_day`, `metadata`
- **Pages / Notes / Boards / Flows**: `id`, `user_id`, `content`, `type`, `links`, `toron_metadata`

## AWS Infrastructure

### DynamoDB tables (partitioned by `user_id`)
- `workspace_lists`
- `workspace_tasks`
- `workspace_calendar`
- `workspace_pages`

### S3 buckets (KMS-encrypted)
- `ryuzen-workspace-pages`
- `ryuzen-workspace-notes`
- `ryuzen-workspace-boards`
- `ryuzen-workspace-flows`

### Secrets Manager keys
- `/ryuzen/users/{user_id}/google`
- `/ryuzen/users/{user_id}/apple`
- `/ryuzen/users/{user_id}/microsoft`
- `/ryuzen/users/{user_id}/canvas`
- `/ryuzen/users/{user_id}/notion`
- `/ryuzen/users/{user_id}/meta`

### Lambda functions
- `connectors_sync` (Google, Apple, Microsoft, Canvas, Notion, Meta)
- `calendar_ingest`
- `toron_analyze`

## Connector framework

Each connector covers authentication, token storage via Secrets Manager, sync workers, normalizers, and error handlers.
- **Google**: Calendar, Drive, Gmail, Classroom; assignments → tasks, events → calendar, files → pages.
- **Microsoft**: Outlook, OneDrive, Teams.
- **Apple**: iCloud Calendar, Reminders via CalDAV.
- **Canvas**: personal access token for course data.
- **Notion**: pages, databases, blocks.
- **Meta**: Instagram insights, Facebook Pages, WhatsApp Business (optional).

## Toron intelligence system

- **Inputs**: lists, tasks, calendar, pages, notes, boards, flows, connector metadata.
- **Core functions**: temporal reasoning, priority mapping, flow analysis, system diagnosis, memory engine (DynamoDB summaries).
- **Outputs**: insights, suggestions, predictions, alerts, summaries, and action sets.

## State machine
```
IDLE
 → QUADRANT_VIEW
 → OSBAR_VIEW
 → TORON_ACTIVE
 → PANEL_VIEW
```

## Codex prompt pattern
```
You are generating the full Ryuzen Workspace OS V2 system.

Create all React components, all routes, all FastAPI routers, all AWS integration files, all data models, and all state logic exactly as defined in the following architecture:

[PASTE FULL SPEC]

Output each subsystem as separate blocks.
Do not modify unrelated files.
Ensure routing is consistent with React Router v6 and FastAPI.
Ensure all components export default.
Ensure all AWS functions are stubbed but correctly structured.
```
