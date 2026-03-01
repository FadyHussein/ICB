# Render.com Build & Deployment Notes

## Key Changes Made for Render Compatibility

### 1. **Frontend Serving**
- **File**: [`backend/src/app.ts`](backend/src/app.ts)
- **Change**: Added static file serving from Express in production mode
- **Why**: Frontend must be built and served from the same Express server on a single port
- **Code**:
  ```typescript
  if (serverConfig.nodeEnv === 'production') {
    const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }
  ```

### 2. **CORS Configuration**
- **File**: [`backend/src/config/server.config.ts`](backend/src/config/server.config.ts)
- **Change**: Added dynamic CORS origin selection based on environment
- **Default for Production**: `https://icbsundayschool.onrender.com`
- **Why**: Localhost doesn't work in production; must match the actual domain

### 3. **Environment Variables**
- **Files**: [`backend/.env.example`](backend/.env.example), [`frontend/.env.example`](frontend/.env.example)
- **Changes**:
  - Documented production vs development settings
  - Frontend now uses relative API path `/api/v1` (works on any domain)
  - Backend Excel paths use `/var/data/` for persistent disk

### 4. **Build Configuration**
- **File**: `render.yaml` (new)
- **What it does**:
  - Defines build steps (install dependencies, build both frontend and backend)
  - Sets start command to run compiled backend
  - Configures persistent disk at `/var/data` with 10 GB
  - Sets all environment variables
  - Specifies runtime as Node.js

## Build Process on Render

When you push to GitHub:

1. **Build Phase**:
   ```bash
   cd backend && npm install && npm run build
   cd ../frontend && npm install && npm run build
   ```
   - Compiles TypeScript backend to `backend/dist/`
   - Builds React frontend to `frontend/dist/`

2. **Start Phase**:
   ```bash
   cd backend && node dist/server.js
   ```
   - Runs compiled backend
   - Serves frontend static files from `frontend/dist/`
   - Listens on port 10000 (assigned by Render)

3. **Persistent Disk**:
   - All files at `/var/data/` persist across deployments
   - `master-data.xlsx` stored there
   - Backups accumulate there

## What NOT to Commit to Git

- Don't commit `backend/dist/` (compiled during build)
- Don't commit `frontend/dist/` (compiled during build)
- Don't commit `node_modules/` directories
- Don't commit local `.env` files (use environment variables instead)

## First Time Setup on Render

1. **Render automatically creates**:
   - Node.js runtime environment
   - Persistent disk at `/var/data`

2. **You must provide**:
   - Initial `master-data.xlsx` file (upload to `/var/data/`)
   - Create subdirectories: `mkdir -p /var/data/backups /var/data/logs`

3. **After deployment, verify**:
   ```bash
   # Check if master-data.xlsx exists
   ls -la /var/data/master-data.xlsx
   
   # Check if app is running
   curl http://localhost:10000/api/v1/status
   ```

## Performance Considerations

- **Port**: 10000 (dynamically assigned by Render, don't hardcode)
- **Memory**: Free tier has 512MB RAM (sufficient for single-user backend)
- **Disk**: 10 GB persistent disk for 3+ years of attendance data
- **CPU**: Shared CPU on free tier (adequate for low-traffic use)

## Common Issues & Solutions

### Build Fails with "Cannot find module"

**Cause**: Missing dependencies in package.json  
**Solution**: 
```bash
npm install missing-module-name
git add package.json package-lock.json
git push origin main
```

### "No such file or directory: /var/data/master-data.xlsx"

**Cause**: Excel file not uploaded to persistent disk  
**Solution**: Connect to Render shell and upload file:
```bash
# Via web interface in Render Dashboard > Logs > Shell
mkdir -p /var/data/backups /var/data/logs
# Then upload master-data.xlsx to /var/data/
```

### CORS Error in Browser Console

**Cause**: `CORS_ORIGIN` environment variable is wrong  
**Solution**: 
1. Go to Render Dashboard > Environment Variables
2. Set `CORS_ORIGIN=https://icbsundayschool.onrender.com`
3. Restart service

### Frontend shows "Cannot GET /"

**Cause**: Frontend build failed or not serving  
**Solution**: 
1. Check build logs in Render Dashboard
2. Ensure `frontend/dist/index.html` exists
3. Verify `app.use(express.static(frontendBuildPath))` is in production code

## Monitoring

**View Live Logs**:
- Go to Render Dashboard > Service > Logs
- Real-time output of Express server

**Check Disk Usage**:
- Go to Render Dashboard > Service > Disks
- View current `/var/data` usage

**Test API**:
```bash
curl https://icbsundayschool.onrender.com/api/v1/status
```

**Test Frontend**:
- Visit https://icbsundayschool.onrender.com in browser

## Redeploying

Push changes to GitHub, Render automatically rebuilds and deploys:

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

Check deployment progress in Render Dashboard > Logs > Deploy.
