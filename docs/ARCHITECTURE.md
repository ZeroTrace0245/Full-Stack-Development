# NovaSync Architecture

## Overview
NovaSync is a React/Vite frontend paired with an Express/MongoDB backend and Socket.IO for real-time messaging.

## Layers
- `src/` — browser UI and client-side state
- `backend/routes/` — HTTP endpoints
- `backend/models/` — MongoDB schemas
- `backend/services/` — application services
- `backend/middleware/` — cross-cutting request logic
- `backend/utils/` — reusable domain helpers

## Data flow
Browser → REST API → service/model → MongoDB. Real-time events use Socket.IO alongside the REST API.
