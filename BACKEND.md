# NovaSync Backend

The NovaSync backend provides REST APIs and real-time communication for the task and team collaboration platform.

## Technology

- Node.js and Express
- Socket.IO for real-time messaging and activity updates
- JWT authentication with role-based access control
- bcryptjs password hashing
- MongoDB Atlas through Mongoose, with persistent local JSON storage as a fallback

## Features

- User registration, login, and profile authentication
- Admin user and role management
- Task creation, editing, assignment, and deletion
- Team and direct-message history
- Live messages, presence, typing indicators, and activity events

## Run Locally

```bash
cp backend/.env.example backend/.env
npm install
npm --prefix backend install
npm run dev
```

The API runs at `http://localhost:5000`. Check its status with:

```http
GET /api/health
```

Main API groups are available under `/api/auth`, `/api/tasks`, and `/api/messages`.

> Replace `JWT_SECRET` in `backend/.env` with a strong private value before deployment.

## Connect MongoDB Atlas (Free M0)

1. In Atlas, create an M0 cluster and a database user with read/write access.
2. In **Network Access**, add your current IP address. Avoid `0.0.0.0/0` except for a temporary test or a deployment whose firewall requires it.
3. Open **Connect → Drivers → Node.js** and copy the `mongodb+srv://...` connection string.
4. Copy `backend/.env.example` to `backend/.env`, then set:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=novasync
```

Do not commit `backend/.env`; it is ignored by Git. Start the project with `npm run dev`. A successful backend startup prints `Connected to MongoDB: novasync`. If `MONGODB_URI` is absent, NovaSync continues to use `backend/data/local-store.json`.

Atlas starts empty and does not automatically copy the demo users or data from local JSON storage. Register the first user through the app; if that user must be an administrator, update its `role` field to `Admin` in Atlas Data Explorer.
