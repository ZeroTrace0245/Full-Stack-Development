# NovaSync

NovaSync is a full-stack task and team collaboration platform built with React, Express, and Socket.IO. This release expands the original Kanban board into a connected workspace with authentication, administration, reporting, and real-time communication.

## What's New

- Secure user registration and login with JWT authentication
- Separate administrator login and control center
- Admin tools for creating, editing, deleting, and assigning users
- Real-time team chat and direct messages
- Online presence and typing indicators
- Task assignment and assignment-locking controls
- Team member directory and admin-only reports
- Persistent backend storage for users, tasks, and messages
- Updated responsive interface with improved light and dark themes

## What's Changed

- Tasks now synchronize through the backend API instead of relying only on browser storage.
- Passwords are hashed with bcrypt rather than stored as plain text.
- Protected API routes now enforce authentication and role permissions.
- Messaging history is saved and restored between sessions.
- The development setup now starts both the React frontend and Node.js backend together.
- Backend persistence now uses a local JSON store, with Mongoose models included for future MongoDB migration.

## Run the Project

```bash
cp backend/.env.example backend/.env
npm install
npm --prefix backend install
npm run dev
```

The frontend runs at `http://localhost:54995`, and the backend API runs at `http://localhost:5000`.

For backend-specific details, see [BACKEND.md](BACKEND.md).
