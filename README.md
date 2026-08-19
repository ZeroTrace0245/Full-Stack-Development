# NovaTrack

NovaTrack is a lightweight collaborative task management UI built with React + Vite. It provides a simple Kanban board (columns, task cards), team management, and reporting visualizations (mock data).

This repository is a developer scaffold and includes example pages, mock data, and utilities to jump-start an internal team sprint board.

Quick start
-----------

1. npm install
2. npm run dev
3. Open http://localhost:54995 in your browser

Project structure (high level)
------------------------------

- src/
  - components/    — Board, Column, TaskCard, Modal, ConfirmDialog
  - pages/         — LoginPage, Dashboard, TeamMembers, Reports
  - context/       — AuthContext
  - utils/         — small helpers (generateUsers, boardStorage)
  - App.jsx        — application boot and routing via AuthContext

Plans & Milestones
------------------

The project follows a short milestone plan. Below is the current plan and what "done" looks like.

| # | Date | Milestone | What "done" looks like |
|---|------|-----------|------------------------|
| M1 | 2 Aug | Static Front-End Skeleton | React app scaffolded, Board/Column/TaskCard UI with mock data, wireframe + component tree, repo live |
| M2 | 9 Aug | Working REST API | Express CRUD API, JWT auth, front end wired to endpoints, API contract documented |
| M3 | 16 Aug | Persistence & Offline Support | MongoDB via Mongoose replaces mock data, schema diagram, client-side caching |
| M4 | 23 Aug | Test Suite & CI | ≥3 server tests, ≥3 client tests, GitHub Actions running tests on every push, ≥1 real bug fixed |
| M5 | 30 Aug | Real-Time, DevOps & Launch | Socket.io live sync, Docker Compose setup, deployed app, final demo, submission package |

Development Notes & Decisions
-----------------------------

- App display name: NovaTrack (replaced previous display name)
- Persistence: board state persisted to localStorage via `src/utils/boardStorage.js` (no backend by default)
- Charts: simple inline SVG charts are used for Reports (mock data). Consider integrating a chart library for richer visuals.
State Management Architecture
-----------------------------
NovaTrack uses a centralized state management approach to handle the Kanban board data without prop-drilling, preparing the frontend for seamless backend integration.

* **Global State:** Managed via the React Context API to provide data to the Board, Columns, and Task Cards.
* **Persistence:** Data is temporarily saved to the browser's `localStorage` (via `src/utils/boardStorage.js`) to ensure tasks survive page refreshes during Milestone 1.
* **Backend Readiness:** The local state is intentionally structured to mimic MongoDB documents, allowing for an easy swap to REST API `fetch()` calls in Milestone 2.

**Task Data Schema (Current JSON Structure):**
```json
{
  "_id": "task_1724063845",
  "title": "Design Mica UI",
  "description": "Build frosted glass CSS for task cards",
  "status": "In Development",
  "assignee": "Sachitha",
  "priority": "High",
  "type": "UI"
}
Contributing
------------

- Fork, create a feature branch, make changes, submit a PR.
- Keep UI changes in `src/components` and pages in `src/pages`.

Screenshots and Plans
---------------------

I added the milestone tables above. To include the screenshots you showed me in the README, save the images into these paths in the repository:

- docs/screenshots/milestones_overview.png
- docs/screenshots/milestones_at_a_glance.png

After you add them, the images will render in the README automatically.

License
-------

MIT

