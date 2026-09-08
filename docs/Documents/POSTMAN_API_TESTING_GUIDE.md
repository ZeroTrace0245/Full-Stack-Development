# NovaSync Postman API Testing Guide

This guide explains how to test the NovaSync REST API with Postman and confirm that the application is connected to MongoDB Atlas.

## API Base URL

The local API base URL is:

```text
http://localhost:5000
```

Do not put the MongoDB Atlas connection string into Postman. Postman sends requests to the Express API, and the backend communicates with MongoDB Atlas.

## 1. Start the Backend

From the project root, run:

```powershell
npm run dev
```

Alternatively, start only the backend:

```powershell
npm run dev:backend
```

Keep the terminal open while testing in Postman.

## 2. Check the API and Atlas Connection

Create the following request in Postman:

- Method: `GET`
- URL: `http://localhost:5000/api/health`
- Body: none

A successful response should look similar to:

```json
{
  "status": "✅ NovaSync Backend is running",
  "atlas": {
    "configured": true,
    "connected": true
  },
  "timestamp": "2026-09-03T00:00:00.000Z"
}
```

The Atlas values mean:

- `configured: true`: `MONGODB_URI` exists in `backend/.env`.
- `connected: true`: the backend is currently connected to Atlas.
- `connected: false`: check the Atlas connection string, database credentials, and Network Access IP allowlist.

## 3. Register a Test User

Create the following request:

- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Body: **raw → JSON**

```json
{
  "username": "postmanuser",
  "email": "postmanuser@example.com",
  "password": "Test12345"
}
```

Make sure this header is present:

```text
Content-Type: application/json
```

The response should have status `201 Created` and include a JWT token:

```json
{
  "message": "User registered successfully",
  "token": "eyJ...",
  "user": {
    "username": "postmanuser",
    "email": "postmanuser@example.com",
    "role": "Standard User"
  }
}
```

Copy the complete `token` value. You will use it for protected API requests.

## 4. Log In

Create the following request:

- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Body: **raw → JSON**

```json
{
  "identifier": "postmanuser",
  "password": "Test12345"
}
```

The `identifier` can be the username or email address. Copy the token returned in the response.

## 5. Add Authorization to Protected Requests

Tasks, messages, users, and notifications require authentication.

In Postman:

1. Open the request's **Authorization** tab.
2. Select **Bearer Token**.
3. Paste the token returned by registration or login.

Alternatively, add the following header manually:

```text
Authorization: Bearer YOUR_TOKEN_HERE
```

Do not include quotation marks around the token.

## 6. Create a Task

Create the following request:

- Method: `POST`
- URL: `http://localhost:5000/api/tasks`
- Authorization: Bearer Token
- Body: **raw → JSON**

```json
{
  "title": "Test API connection",
  "description": "Task created using Postman",
  "boardId": "board-1",
  "columnId": "todo",
  "priority": "High",
  "type": "Feature",
  "dueDate": "2026-09-10",
  "estimate": 4,
  "labels": ["Postman", "API"],
  "progress": 0
}
```

Only `title` and `columnId` are required.

Valid values include:

- `priority`: `Low`, `Medium`, or `High`
- `type`: `Feature`, `Bug`, or `UI`
- `progress`: a number from `0` to `100`

Copy the task's `id` from the response for the next requests.

## 7. Get All Tasks

- Method: `GET`
- URL: `http://localhost:5000/api/tasks`
- Authorization: Bearer Token
- Body: none

To retrieve tasks for only one board, use:

```text
http://localhost:5000/api/tasks?boardId=board-1
```

## 8. Get One Task

Replace `TASK_ID` with the task ID returned when the task was created.

- Method: `GET`
- URL: `http://localhost:5000/api/tasks/TASK_ID`
- Authorization: Bearer Token
- Body: none

Example:

```text
http://localhost:5000/api/tasks/68b7example123
```

## 9. Update a Task

- Method: `PUT`
- URL: `http://localhost:5000/api/tasks/TASK_ID`
- Authorization: Bearer Token
- Body: **raw → JSON**

```json
{
  "title": "Updated Postman task",
  "description": "The API update request worked",
  "columnId": "in-progress",
  "priority": "Medium",
  "progress": 50
}
```

## 10. Delete a Task

- Method: `DELETE`
- URL: `http://localhost:5000/api/tasks/TASK_ID`
- Authorization: Bearer Token
- Body: none

## 11. Create a Team Message

- Method: `POST`
- URL: `http://localhost:5000/api/messages/team`
- Authorization: Bearer Token
- Body: **raw → JSON**

```json
{
  "projectId": "board-1",
  "content": "Hello from Postman!"
}
```

## 12. Get Team Messages

- Method: `GET`
- URL: `http://localhost:5000/api/messages/team/board-1`
- Authorization: Bearer Token
- Body: none

An optional message limit can be provided:

```text
http://localhost:5000/api/messages/team/board-1?limit=20
```

## Confirm That Data Reached MongoDB Atlas

NovaSync is an offline-first application. API changes are written to local storage first and then synchronized to Atlas, normally every 15 seconds.

After creating a user, task, or message:

1. Wait approximately 15 seconds.
2. Open MongoDB Atlas.
3. Go to **Database → Browse Collections**.
4. Open the `novasync` database.
5. Check the relevant users, tasks, or messages collection.

If the health endpoint reports `"connected": true` and the records appear in Atlas, the REST API and MongoDB Atlas synchronization are working.

## Recommended Testing Order

Run these requests in order:

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
POST   /api/tasks
GET    /api/tasks
GET    /api/tasks/TASK_ID
PUT    /api/tasks/TASK_ID
POST   /api/messages/team
GET    /api/messages/team/board-1
DELETE /api/tasks/TASK_ID
```

## Common Errors

### `401 No token provided`

The request needs a Bearer token. Add the token under the Postman **Authorization** tab.

### `403 Invalid or expired token`

Log in again and replace the old token with the newly returned token.

### `400 Bad Request`

Check that:

- **Body → raw → JSON** is selected.
- `Content-Type` is `application/json`.
- All required fields are provided.
- The JSON syntax is valid.

### Atlas is configured but not connected

Check the following:

- `MONGODB_URI` is correctly configured in `backend/.env`.
- The Atlas database username and password are correct.
- Special characters in the password are URI-encoded.
- Your current IP address is allowed under Atlas **Network Access**.
- The backend terminal does not show an Atlas connection error.

