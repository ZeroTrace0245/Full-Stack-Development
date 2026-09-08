# Error Handling

Use consistent error responses so the frontend can present useful messages.

Recommended shape:
```json
{
  "success": false,
  "message": "Human-readable message",
  "code": "STABLE_ERROR_CODE"
}
```

Do not expose stack traces, database credentials, or internal filesystem paths to clients.
