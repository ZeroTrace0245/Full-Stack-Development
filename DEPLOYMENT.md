# Deploy NovaSync on Render

This repository has two npm applications. The Vite frontend is at the repository
root; the Express/Socket.IO backend is in `backend/`. Deploy them separately.

## Fix the existing failed Web Service

In https://dashboard.render.com, open the existing Web Service > Settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Instance Type | Free |
| Health Check Path | `/api/health` |
| Auto-Deploy | After CI Checks Pass |

In Environment, set `NODE_VERSION=24`, `NODE_ENV=production`, `MONGODB_URI`
to your Atlas URI, `MONGODB_DB_NAME` to your existing database name, and
`JWT_SECRET` to a long random secret. Set `SOCKET_IO_CORS` to the frontend's
public HTTPS origin with no trailing slash (comma-separate additional origins).
Save, then use Manual Deploy > Deploy latest commit.

In Render > Connect > Outbound, copy the backend's outbound ranges and add them
to Atlas > Network Access > IP Access List at https://cloud.mongodb.com.

## Create the frontend

Choose New > Static Site and connect the same GitHub repository:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Root Directory | Leave blank |
| Build Command | `npm ci && npm run build` |
| Publish Directory | `dist` |
| Auto-Deploy | After CI Checks Pass |

Set `NODE_VERSION=24`. Set `VITE_API_URL` to the backend's actual public URL
**with `/api` appended**, and `VITE_SOCKET_URL` to that URL **without `/api`**.
For example: `https://YOUR-BACKEND.onrender.com/api` and
`https://YOUR-BACKEND.onrender.com`. Never put Atlas credentials in the frontend.

Add Redirects/Rewrites: source `/*`, destination `/index.html`, action Rewrite.
Once Render assigns the frontend URL, update the backend's `SOCKET_IO_CORS` to
that exact origin. Rebuild the frontend whenever its VITE variables change.

## Optional: create both services with a Blueprint

`render.yaml` defines the same configuration. Push it, choose New > Blueprint,
and select this repository. Supply the prompted environment values. Use the
actual assigned public URLs, updating them after creation if necessary.
For already-created services, the manual settings above avoid creating duplicates.
Merely pushing render.yaml does not reconfigure a manually created service.

## CI and verification

`.github/workflows/ci.yml` installs both lockfiles, lints the code, builds the
frontend, runs the existing frontend unit tests, and checks backend JS syntax.
It deliberately does not run `verify:sync`, which connects to a real Atlas DB.
No Atlas secrets are required by CI. Runtime/API integration is not tested by CI.

After deployment, open the backend's `/api/health` endpoint and confirm
`atlas.connected` is true. Open the frontend and verify sign-in, a data change,
and real-time messaging. A healthy HTTP response alone does not prove Atlas sync.

## Current persistence limitation

The backend currently uses `backend/data/local-store.json` as its primary store
and mirrors it to Atlas asynchronously. Render Free discards local files on
restart, redeploy, or idle shutdown. More seriously, the current sync code treats
a missing sync-state file as dirty local data, which can overwrite an existing
Atlas snapshot with a fresh local store. Do not use this setup with valuable
data until startup restoration and persistence are corrected. Use a separate
disposable Atlas database for deployment testing. This deployment configuration
does not change the application's storage design or default demo accounts.

Render Free sleeps after inactivity; the first API request can be slow.

References:
- https://render.com/docs/blueprint-spec
- https://render.com/docs/free
- https://render.com/docs/deploys#integrating-with-ci
