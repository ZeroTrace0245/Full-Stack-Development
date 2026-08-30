# Backend API Documentation

This document is a lightweight map of the existing backend modules. It does not change or replace the implementation.

## Route Modules

### Authentication

File:

```text
routes/auth.js
```

Purpose:

- Authentication-related requests
- User authentication flow

### Messages

File:

```text
routes/messages.js
```

Purpose:

- Message-related API operations

### Tasks

File:

```text
routes/tasks.js
```

Purpose:

- Task-related API operations

## Middleware

```text
middleware/auth.js
```

The project includes authentication middleware that can be used to protect backend operations.

## Data Models

The current backend includes:

- `models/User.js`
- `models/Message.js`
- `models/Task.js`

## Database

Database configuration is located at:

```text
config/database.js
```

The project also contains:

```text
db/mockStore.js
```

for mock/local data handling.

> For exact request methods, paths, parameters, and response bodies, refer to the existing route implementation. This file intentionally avoids changing or guessing the API contract.
