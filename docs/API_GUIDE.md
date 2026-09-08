# API Guide

Use the backend URL configured by your environment. Keep secrets in local `.env` files and never commit them.

## Conventions
- JSON request and response bodies
- HTTP status codes communicate success/failure
- Authentication uses the project auth middleware
- Validate user-controlled input before persistence

## Local development
1. Start the backend with `npm --prefix backend run dev`.
2. Start the frontend with `npm run dev:frontend`.
3. Use the Postman collection in `.postman/` for endpoint checks.
