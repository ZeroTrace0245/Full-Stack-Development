# NovaSync — Design Refresh & MongoDB Atlas Sync

NovaSync brings a refreshed collaboration workspace together with MongoDB Atlas synchronization, expanded account settings, and notifications. This release improves task management, messaging, and reporting while keeping backend data available locally when Atlas is unreachable.

## What's new

- **Refreshed task board:** Search tasks and labels, filter by priority or assignee, use focus mode, collapse columns, and toggle the activity feed.
- **Expanded task forms:** Create and edit tasks with labels, progress, subtasks, relationships, and comments.
- **Updated messaging:** Navigate between Team chat, Direct messages, and a new decision log for saved team messages.
- **Clearer reports:** Review completion, workload, task types, overdue work, and blockers, with CSV export and activity replay.
- **Account settings:** Update profiles, avatars, timezones, passwords, and preferences through a dedicated settings page for users and administrators.
- **Notifications:** Publish administrator announcements, receive task-assignment alerts, and track read notifications.
- **Workspace navigation:** Access account details, settings, and sign-out from the shared sidebar.

## Atlas and backend updates

- Added MongoDB Atlas synchronization for users, tasks, messages, and notifications, plus a combined revisioned offline snapshot.
- Retained durable local JSON storage as the REST API's primary store, with asynchronous Atlas synchronization and connection retries.
- Added Atlas connection flags to `/api/health` and connection/synchronization messages to backend terminal output.
- Added profile-update and notification endpoints alongside existing authentication, task, and messaging APIs.
- Organized backend responsibilities across database configuration, storage, routes, middleware, models, and the offline synchronization service.
- Included `npm --prefix backend run verify:sync` to inspect Atlas collection counts.

## Documentation

- Updated the README with the current architecture, backend file structure, API routes, and Atlas configuration instructions.
- Included all 70 screenshot and diagram assets covering the original interface, full-stack release, latest refresh, Atlas connections, and API evidence.
- Distinguished earlier interface screenshots from the latest refresh; not every screen has a replacement design.

## Setup notes

Configure `backend/.env` using `backend/.env.example`. Set `MONGODB_URI` and `MONGODB_DB_NAME` to enable Atlas synchronization, or leave the URI empty for local-only backend storage. Set a private `JWT_SECRET` before using the application outside local development.

## Known limitations

- Atlas synchronization is asynchronous and does not provide per-record conflict merging. An API success confirms the local operation, not completed cloud synchronization.
- The decision log remains in browser local storage and is not synchronized to Atlas.
- Local backend persistence still requires a running API server; it does not provide a fully offline browser application.
- The collection-count verification script is not an automated end-to-end test suite.
