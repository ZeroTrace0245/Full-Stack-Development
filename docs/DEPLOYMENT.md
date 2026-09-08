# Deployment Notes

## Build
Run `npm run build` to produce the Vite production bundle.

## Backend
Run `npm --prefix backend start` with production environment variables configured by the hosting platform.

## Production checklist
- Set `NODE_ENV=production`.
- Configure MongoDB connection securely.
- Configure the frontend API origin.
- Restrict CORS.
- Enable HTTPS.
- Monitor application logs and health checks.
