# Render.com Setup Instructions - CRITICAL

## Current Issue

Your deployment succeeded but the backend can't find the Excel file. The logs show:
```
Excel file: /opt/render/project/src/data/master-data.xlsx
```

This is wrong. It should be:
```
Excel file: /var/data/master-data.xlsx
```

## Root Cause

The environment variables are not set in your Render dashboard.

## SOLUTION: Set Environment Variables in Render Dashboard

### Step 1: Go to Your Service Settings

1. Open [Render Dashboard](https://dashboard.render.com)
2. Click on your service: **icb-attendance-app**
3. Go to **Environment** tab (left sidebar)

### Step 2: Add These Environment Variables

Click **"Add Environment Variable"** and add each of these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://icbsundayschool.onrender.com` |
| `EXCEL_FILE_PATH` | `/var/data/master-data.xlsx` |
| `BACKUP_DIR` | `/var/data/backups` |
| `BACKUP_RETENTION_DAYS` | `30` |
| `MAX_BACKUPS` | `50` |
| `LOG_LEVEL` | `info` |
| `LOG_FILE` | `/var/data/logs/server.log` (optional - logs to console if not available) |
| `RATE_LIMIT_WINDOW_MS` | `60000` |
| `RATE_LIMIT_MAX_REQUESTS` | `100` |
| `RATE_LIMIT_ATTENDANCE_MAX` | `30` |
| `RATE_LIMIT_BULK_MAX` | `10` |

**IMPORTANT**: 
- Do NOT set the `PORT` variable - Render sets this automatically
- Click **"Save Changes"** after adding all variables

### Step 3: Redeploy

After saving environment variables:
1. Go to **Manual Deploy** section
2. Click **"Deploy latest commit"**
3. Wait for deployment to complete

### Step 4: Create Persistent Disk (If Not Done)

1. In your service dashboard, click **"Disks"** tab
2. If no disk exists, click **"+ Add Disk"**
3. Set:
   - **Name**: `data`
   - **Mount Path**: `/var/data`
   - **Size**: 10 GB
4. Click **"Create"**
5. This will trigger a redeploy automatically

### Step 5: Upload Initial Data

After the redeploy with correct environment variables:

1. Go to your service → **Shell** tab (or use SSH if enabled)
2. Create required directories:
   ```bash
   mkdir -p /var/data/backups
   mkdir -p /var/data/logs
   ```

3. Upload your `master-data.xlsx` file:
   - **Option A**: Use Render's file upload interface (if available)
   - **Option B**: Use SCP/SFTP:
     ```bash
     scp -P 22 data/master-data.xlsx username@your-service.onrender.com:/var/data/
     ```
   - **Option C**: Create a temporary upload endpoint (not recommended for production)

4. Verify file exists:
   ```bash
   ls -la /var/data/master-data.xlsx
   ```

You should see output like:
```
-rw-r--r-- 1 user user 54321 Mar 02 02:00 /var/data/master-data.xlsx
```

### Step 6: Verify Deployment

After setting environment variables and uploading the Excel file:

1. **Check Logs** (Render Dashboard → Logs):
   ```
   [info]: Excel file: /var/data/master-data.xlsx  ✓ (should show this path)
   [info]: Server started successfully
   ```

2. **Test API**:
   ```bash
   curl https://icbsundayschool.onrender.com/api/v1/status
   ```
   
   Expected response:
   ```json
   {
     "success": true,
     "data": {
       "status": "healthy",
       "timestamp": "2026-03-02T02:52:00.000Z"
     }
   }
   ```

3. **Test Frontend**:
   - Open: https://icbsundayschool.onrender.com
   - Click on "Iqra Tracking" or "Islamic Studies Tracking"
   - You should see levels load (not "Unable to connect to server")

## Quick Checklist

- [ ] Environment variables added in Render Dashboard
- [ ] Persistent disk created and mounted at `/var/data`
- [ ] Service redeployed after setting env vars
- [ ] Directories created: `/var/data/backups` and `/var/data/logs`
- [ ] `master-data.xlsx` uploaded to `/var/data/`
- [ ] Logs show correct Excel file path: `/var/data/master-data.xlsx`
- [ ] API responds successfully
- [ ] Frontend can load data

## Common Issues

### Issue: "Excel file not found"

**Cause**: File not uploaded or wrong path  
**Fix**: 
```bash
# In Render shell:
ls -la /var/data/
# If master-data.xlsx is missing, upload it
```

### Issue: "Permission denied" accessing `/var/data/`

**Cause**: Disk not mounted or permissions issue  
**Fix**: 
1. Check Disks tab - ensure disk is attached
2. Redeploy service
3. Check mount point: `df -h | grep /var/data`

### Issue: Still seeing "Unable to connect to server"

**Cause**: Frontend built before env vars were set  
**Fix**: 
1. Add environment variables
2. Trigger a fresh build: Click "Manual Deploy" → "Clear build cache & deploy"

### Issue: CORS errors in browser console

**Cause**: `CORS_ORIGIN` not set correctly  
**Fix**:
1. Set `CORS_ORIGIN=https://icbsundayschool.onrender.com`
2. Redeploy

## Alternative: Using render.yaml (Automatic Setup)

If you prefer automatic environment variable setup:

1. Ensure `render.yaml` is in your repository root
2. In Render dashboard, go to your service
3. Click **"Settings"** → **"Build & Deploy"**
4. Under **"Build Command"** and **"Start Command"**, click **"Use render.yaml"**
5. Save and redeploy

The `render.yaml` file already contains all the environment variables, so Render will set them automatically.

## Support

If issues persist after following these steps:
1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure persistent disk is mounted
4. Verify Excel file exists at the correct path
