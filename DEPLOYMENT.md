# Deploy the website and API at one Render URL

Push these changes, then open your existing Web Service in https://dashboard.render.com.
Under Settings, replace these values:

| Setting | Value |
| --- | --- |
| Root Directory | Leave blank: remove backend |
| Build Command | npm ci --include=dev && npm ci --prefix backend --omit=dev && npm run build |
| Start Command | npm start |
| Instance Type | Free |
| Health Check Path | /api/health |
| Auto-Deploy | After CI Checks Pass |

Set NODE_ENV=production, NODE_VERSION=24, VITE_API_URL=/api, and VITE_SOCKET_URL=/.
Keep MONGODB_URI, MONGODB_DB_NAME, and JWT_SECRET in the backend environment.
Render's RENDER_EXTERNAL_URL is automatically allowed for browser connections.
For custom domains add the HTTPS origin to SOCKET_IO_CORS.

Save and choose Manual Deploy > Deploy latest commit. Open
https://full-stack-development-n0qo.onrender.com/ to use the website.
Check /api/health for atlas.connected: true. Keep Render's outbound ranges
in Atlas's IP access list. No separate Static Site is needed.

render.yaml supplies the same setup for Blueprint-managed services; pushing it
does not reconfigure an existing manual service. Clear any previous backend
Root Directory when migrating. Review changes before applying a Blueprint.

## Existing data persistence limitation

The backend uses local JSON storage and asynchronously mirrors it to Atlas.
Render Free loses local files on restart. The existing sync code may overwrite
Atlas with fresh local data afterward. Use a disposable test database until
storage restoration is corrected. This hosting change does not fix storage
or change default demo accounts.
