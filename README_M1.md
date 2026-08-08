TeamPulse — M1 Static Front-End

This is a minimal React (Vite) scaffold implementing a static Kanban board UI (Board / Column / TaskCard) with mock data.

Run:
- npm install
- npm run dev

Component tree:
- App
  - Board
	- Column (x3)
	  - TaskCard (many)

Wireframe (ASCII):
[Header]
[ Board Title ]
| To Do | Doing | Done |
| card  | card  | card |

Notes:
- Uses CSS Modules for component styles (src/components/*.module.css).
- Mock data in src/mockData.js

Created files for M1:
- src/components/Board.jsx
- src/components/Column.jsx
- src/components/TaskCard.jsx
- src/components/*.module.css
- src/mockData.js
- src/App.module.css

Next steps: implement drag-and-drop and realtime syncing for M2.
