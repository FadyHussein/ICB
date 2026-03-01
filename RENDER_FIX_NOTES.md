# Render.com Deployment Fix

## Issue Identified

The deployment was stuck at:
```
==> No open ports detected on 0.0.0.0, continuing to scan...
```

This happened because:
1. Server was binding to `localhost` only (not visible to external interfaces)
2. Start command was trying to run the dev server instead of the compiled backend

## Fixes Applied

### Fix #1: Server Binding Address ([`backend/src/server.ts:30`](backend/src/server.ts:30))

**Before**:
```typescript
const server = app.listen(serverConfig.port, () => {
```

**After**:
```typescript
const server = app.listen(serverConfig.port, '0.0.0.0', () => {
```

**Why**: Binding to `0.0.0.0` makes the server listen on all network interfaces, allowing Render.com to detect the open port. Localhost binding is only for local development.

### Fix #2: Start Command in render.yaml

**Before**:
```yaml
startCommand: cd backend && node dist/server.js
```

**After**:
```yaml
startCommand: cd backend && npm run start
```

**Why**: Using `npm run start` ensures the build artifacts exist and the correct script is executed.

## What to Do Now

### Option A: Force Redeploy (Recommended)

1. Make a small change to trigger a new deployment:
   ```bash
   # Update a file to trigger redeploy
   echo "# Updated $(date)" >> README.md
   git add README.md
   git commit -m "Trigger redeploy with server binding fix"
   git push origin main
   ```

2. Go to Render Dashboard and watch the deployment logs
3. The build should complete and find the open port

### Option B: Delete and Redeploy

1. In Render Dashboard, delete the current service
2. Create a new service (same configuration)
3. The fresh deployment should work with the fixes

## Expected Output After Fix

You should see in the Render logs:
```
==> Build successful 🎉
==> Deploying...
==> Running 'cd backend && npm run start'
> node dist/server.js
Server started successfully
Environment: production
Port: 10000
Listening on: 0.0.0.0:10000
```

Then Render will detect the open port and mark the deployment as successful.

## Verification

After deployment succeeds:

1. **Test API endpoint**:
   ```bash
   curl https://icbsundayschool.onrender.com/api/v1/status
   ```

2. **Test Frontend**:
   - Visit `https://icbsundayschool.onrender.com/` in browser
   - Should load React application

3. **Check Logs**:
   - Go to Render Dashboard > Logs
   - Should show "Server started successfully"

## Why This Works

- **Build phase**: TypeScript compiles to `backend/dist/` and React builds to `frontend/dist/`
- **Start phase**: Runs `npm run start` which executes `node dist/server.js`
- **Binding**: Server listens on `0.0.0.0:10000` (all interfaces)
- **Render detection**: Can now see the open port
- **Frontend serving**: Express serves `frontend/dist` as static files
- **API routing**: `/api/v1/*` routes handled by Express API

## Troubleshooting

If deployment still fails:

1. **Check package.json scripts**:
   ```bash
   cat backend/package.json | grep -A2 '"start"'
   # Should show: "start": "node dist/server.js"
   ```

2. **Verify build succeeds locally**:
   ```bash
   cd backend && npm run build && npm run start
   ```

3. **Check Render logs** for specific error messages

## Additional Notes

- The `PORT` environment variable is not set in render.yaml because Render dynamically assigns it
- The default `PORT=5000` in serverConfig is overridden by Render's `PORT` env var
- `0.0.0.0` binding is standard for containerized/cloud deployments
