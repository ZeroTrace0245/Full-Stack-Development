# Testing Guide

## Current checks
- Frontend lint: `npm run lint`
- Backend verification: `npm --prefix backend run verify:sync`

## Test priorities
1. Authentication and authorization
2. Task creation/update/delete
3. Offline synchronization
4. Message delivery
5. Input validation

Keep tests deterministic and avoid real production credentials or databases.
