# Security Checklist

- Never commit `.env` files or tokens.
- Use strong JWT secrets outside development.
- Hash passwords with bcrypt before persistence.
- Validate request bodies and route parameters.
- Restrict CORS origins in production.
- Apply least-privilege database credentials.
- Review Socket.IO authorization for protected events.
- Log security events without logging passwords or tokens.
