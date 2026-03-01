# Render.com Deployment Guide

## ICB Sunday School Attendance Tracking System

This guide explains how to deploy the application to Render.com using persistent disk storage.

---

## Prerequisites

- GitHub account with repository containing this code
- Render.com account (free tier available)
- Domain or willing to use Render's default domain

---

## Deployment Steps

### 1. Prepare the Repository

Ensure all files are committed to GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Render Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository containing the ICB application
5. Configure the service:
   - **Name**: `icb-attendance-app`
   - **Environment**: Node
   - **Build Command**: (Will be read from render.yaml)
   - **Start Command**: (Will be read from render.yaml)
   - **Runtime**: Node
   - **Plan**: Free (or Paid if preferred)

### 3. Add Persistent Disk

1. In the Render dashboard, go to your service
2. Click **"Disks"** tab
3. Click **"+ Add Disk"**
4. Configure:
   - **Name**: `data`
   - **Mount Path**: `/var/data`
   - **Size**: 10 GB (adjust as needed)
5. Save

### 4. Environment Variables

The render.yaml file automatically sets up environment variables. However, you can override them:

1. Go to Service **Settings** → **Environment**
2. Verify these variables are set:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `CORS_ORIGIN`: `https://icbsundayschool.onrender.com`
   - `EXCEL_FILE_PATH`: `/var/data/master-data.xlsx`
   - `BACKUP_DIR`: `/var/data/backups`
   - `LOG_LEVEL`: `info`
   - `LOG_FILE`: `/var/data/logs/server.log`

### 5. Custom Domain (Optional)

1. Go to Service **Settings** → **Custom Domain**
2. Add your domain (e.g., `icbsundayschool.onrender.com`)
3. Update DNS records at your registrar with the CNAME provided by Render

### 6. Deploy

1. Click **"Deploy"** or just push to GitHub (auto-deploys if auto-deploy is enabled)
2. Watch the build logs in the Render dashboard
3. Wait for deployment to complete
4. Visit `https://icbsundayschool.onrender.com`

---

## Initial Setup

### First Deployment

On the first deployment, you need to upload the initial Excel file to the persistent disk:

1. After deployment completes, connect to the service shell:
   - Go to **Logs** → **Shell** tab (or use SSH if available)

2. Create the necessary directories:
```bash
mkdir -p /var/data/backups
mkdir -p /var/data/logs
```

3. Upload your `master-data.xlsx` file to `/var/data/`:
   - Option A: Use SFTP/SCP (if available)
   - Option B: Download from your local machine and upload via the shell
   - Option C: Copy from your GitHub repo if it's included

4. Verify the file exists:
```bash
ls -la /var/data/master-data.xlsx
```

### Data Migration from Local

If you have existing data in your local `data/master-data.xlsx`:

1. Copy the file to a temporary location on Render:
```bash
# Via SCP (if SSH is enabled)
scp -P 22 master-data.xlsx username@service-name-1a2b.onrender.com:/var/data/

# Or manually upload via provided interface
```

2. Verify the file is accessible at `/var/data/master-data.xlsx`

---

## File Structure on Render

```
/var/data/
├── master-data.xlsx          # Main data file
├── backups/                  # Automatic backup directory
│   ├── master-data_20260301_150000.xlsx
│   ├── master-data_20260301_160000.xlsx
│   └── ...
└── logs/
    └── server.log            # Application log file
```

---

## Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `10000` | Port Render assigns (required) |
| `CORS_ORIGIN` | `https://icbsundayschool.onrender.com` | Allows requests from frontend |
| `EXCEL_FILE_PATH` | `/var/data/master-data.xlsx` | Path to persistent Excel file |
| `BACKUP_DIR` | `/var/data/backups` | Backup storage directory |
| `LOG_LEVEL` | `info` | Logging verbosity |
| `LOG_FILE` | `/var/data/logs/server.log` | Server log file path |

---

## API Endpoints

After deployment, API endpoints are available at:

```
https://icbsundayschool.onrender.com/api/v1/
```

Examples:
- Students: `https://icbsundayschool.onrender.com/api/v1/students`
- Teachers: `https://icbsundayschool.onrender.com/api/v1/teachers`
- Attendance: `https://icbsundayschool.onrender.com/api/v1/attendance`

---

## Frontend Access

The React application is automatically served at:

```
https://icbsundayschool.onrender.com/
```

The API calls from the frontend use relative URLs (`/api/v1`), so they automatically connect to the same domain.

---

## Monitoring & Logs

1. **View Logs**:
   - Go to Service → **Logs** tab
   - See real-time application output

2. **Check Disk Usage**:
   - Go to Service → **Disks** tab
   - View current usage of persistent disk

3. **Monitor Performance**:
   - Go to Service → **Metrics** tab
   - Check CPU, RAM, and network usage

---

## Troubleshooting

### Issue: "Cannot find module" during build

**Solution**: Ensure all dependencies are properly installed. The build command in render.yaml should handle this.

### Issue: "Permission denied" accessing `/var/data/`

**Solution**: Run commands with proper permissions, or contact Render support for shell access.

### Issue: Frontend shows "Cannot GET /"

**Solution**: Ensure `npm run build` completed successfully in the frontend directory and frontend/dist exists.

### Issue: "CORS error" when accessing API

**Solution**: Check that `CORS_ORIGIN` environment variable is set correctly to your Render domain.

### Issue: Excel file not found on startup

**Solution**: Ensure `master-data.xlsx` exists at `/var/data/master-data.xlsx`. See "Initial Setup" section above.

### Issue: Backups not being created

**Solution**: Verify `/var/data/backups` directory exists and is writable. Create it if needed:
```bash
mkdir -p /var/data/backups
chmod 755 /var/data/backups
```

---

## Development vs Production

### Local Development
```bash
# Backend: Port 5000
npm run dev

# Frontend: Port 5173
npm run dev

# CORS_ORIGIN: http://localhost:5173
# VITE_API_BASE_URL: http://localhost:5000/api/v1
```

### Production (Render)
```bash
# Single service on Port 10000 (dynamically assigned)
npm run build && npm run start

# CORS_ORIGIN: https://icbsundayschool.onrender.com
# VITE_API_BASE_URL: /api/v1 (relative URL)
# Files stored in /var/data/
```

---

## Scaling

- **Free Plan**: Suitable for small deployments (< 1000 concurrent users)
- **Paid Plan**: Recommended for production use (better performance, uptime SLA)
- **Persistent Disk**: 10 GB should accommodate years of attendance records

---

## Backup Strategy

The application automatically creates backups before each write:

1. **Automatic Backups**: Stored in `/var/data/backups/`
2. **Retention**: Last 30 days or max 50 backups
3. **Download Backups**: Use Render's shell or SFTP to download backup files
4. **External Backup**: Consider downloading backups weekly to your local system

---

## Support & Maintenance

- Monitor logs regularly for errors
- Review disk usage monthly
- Download and archive backups periodically
- Keep application dependencies updated
- Plan for database migration if application grows significantly

For more information, visit [Render.com Documentation](https://render.com/docs).
