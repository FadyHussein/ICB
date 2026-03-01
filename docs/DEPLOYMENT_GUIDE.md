# Deployment Guide

## ICB Sunday School Attendance Tracking System

This guide provides step-by-step instructions for deploying the ICB Sunday School Attendance Tracking System in a production environment.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Hardware Requirements](#hardware-requirements)
4. [Software Installation](#software-installation)
5. [Project Setup](#project-setup)
6. [Excel Configuration](#excel-configuration)
7. [Backend Configuration](#backend-configuration)
8. [Frontend Configuration](#frontend-configuration)
9. [Network Configuration](#network-configuration)
10. [Starting the System](#starting-the-system)
11. [Verification](#verification)
12. [User Access Setup](#user-access-setup)
13. [Backup Configuration](#backup-configuration)
14. [Troubleshooting](#troubleshooting)
15. [Maintenance](#maintenance)
16. [Security Considerations](#security-considerations)

---

## System Overview

The ICB Sunday School Attendance Tracking System consists of:

- **Backend Server**: Node.js/Express API server (Port 5000)
- **Frontend Application**: React/Vite web application (Port 5173)
- **Data Storage**: Excel file (`master-data.xlsx`)
- **Backup System**: Automatic backups in `data/backups/`

**Architecture:**
```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  Teacher Device │────────▶│  Backend Server  │────────▶│ Excel File  │
│  (Web Browser)  │  HTTP   │  (Port 5000)     │  Write  │             │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Backup System   │
                            │  (Automatic)     │
                            └──────────────────┘
```

---

## Prerequisites

### Required Knowledge
- Basic computer operation (Windows)
- Basic understanding of file systems and folders
- Ability to run command-line programs (minimal)
- Network configuration basics (for multi-device access)

### Required Access
- Administrator access to the host computer
- Access to network router (for port forwarding/IP configuration)
- Ability to install software on the host computer

---

## Hardware Requirements

### Host Computer (Server)

**Minimum Requirements:**
- **Processor**: Intel Core i3 or equivalent
- **RAM**: 4 GB
- **Storage**: 10 GB free space (1 GB for application, 9 GB for data/backups)
- **Network**: Ethernet or WiFi connection to local network
- **OS**: Windows 10 or Windows 11

**Recommended Requirements:**
- **Processor**: Intel Core i5 or better
- **RAM**: 8 GB or more
- **Storage**: 20 GB free space (SSD preferred)
- **Network**: Gigabit Ethernet connection
- **OS**: Windows 11

### Teacher Devices (Clients)

**Minimum Requirements:**
- **Any modern tablet or computer**
- **Browser**: Chrome, Edge, Firefox, or Safari (latest version)
- **Network**: WiFi connection to same local network as server
- **Screen Size**: 7 inches or larger (10+ inches recommended)

---

## Software Installation

### Step 1: Install Node.js

Node.js is required to run both the backend and frontend servers.

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version
   - Choose Windows Installer (.msi) 64-bit

2. **Install Node.js:**
   - Run the downloaded installer
   - Accept the license agreement
   - Use default installation location: `C:\Program Files\nodejs\`
   - **Important**: Check "Automatically install the necessary tools"
   - Click "Install"
   - Wait for installation to complete

3. **Verify Installation:**
   - Open Command Prompt (cmd.exe)
   - Type: `node --version`
   - Should display: `v18.x.x` or higher
   - Type: `npm --version`
   - Should display: `9.x.x` or higher

**If verification fails:**
- Restart computer
- Try verification again
- If still fails, reinstall Node.js

---

### Step 2: Install Git (Optional but Recommended)

Git helps with version control and updates.

1. **Download Git:**
   - Visit: https://git-scm.com/download/win
   - Download the latest version

2. **Install Git:**
   - Run installer
   - Use default settings
   - Choose "Use Git from the Windows Command Prompt"

3. **Verify Installation:**
   - Open Command Prompt
   - Type: `git --version`
   - Should display: `git version 2.x.x`

---

### Step 3: Install Microsoft Excel

Required for data storage and viewing attendance records.

- **Microsoft Excel 2016 or later** (part of Microsoft Office)
- If not installed, install Microsoft Office
- Verify Excel can open and edit `.xlsx` files

---

## Project Setup

### Step 1: Get Project Files

**Option A: Download ZIP File**
1. Obtain the project ZIP file
2. Extract to: `C:\ICB\SundaySchool\`
3. Ensure all files are extracted

**Option B: Clone from Git Repository (if available)**
```cmd
cd C:\
mkdir ICB
cd ICB
git clone <repository-url> SundaySchool
cd SundaySchool
```

### Step 2: Verify Project Structure

Navigate to the project folder and verify this structure exists:

```
C:\ICB\SundaySchool\
├── backend\
│   ├── src\
│   ├── scripts\
│   ├── package.json
│   └── .env.example
├── frontend\
│   ├── src\
│   ├── package.json
│   └── .env.example
├── data\
│   └── backups\
├── docs\
└── README.md
```

---

### Step 3: Install Dependencies

**Install Backend Dependencies:**
```cmd
cd C:\ICB\SundaySchool\backend
npm install
```

Wait for installation to complete (may take 2-5 minutes).

**Install Frontend Dependencies:**
```cmd
cd C:\ICB\SundaySchool\frontend
npm install
```

Wait for installation to complete (may take 2-5 minutes).

**Verify Installation:**
- No error messages displayed
- `node_modules` folder created in both `backend` and `frontend` directories

---

## Excel Configuration

### Step 1: Create Master Excel File

1. **Copy the Template:**
   - If a sample Excel file exists, copy it to: `C:\ICB\SundaySchool\data\master-data.xlsx`
   - Otherwise, create a new Excel file

2. **Excel File Structure:**

The Excel file must contain these sheets:

**Sheet 1: Teachers**
```
| ID | Name           | Programs              | Email                  |
|----|----------------|-----------------------|------------------------|
| 1  | John Smith     | Iqra,Islamic Studies  | john@icb.org          |
| 2  | Sarah Johnson  | Iqra                  | sarah@icb.org         |
| 3  | Ahmed Hassan   | Islamic Studies       | ahmed@icb.org         |
```

**Sheet 2: Students**
```
| ID | Name            | Program          | Level | Age | Notes    |
|----|-----------------|------------------|-------|-----|----------|
| 1  | Ali Mohamed     | Iqra             | 1     | 7   |          |
| 2  | Fatima Ahmed    | Iqra             | 1     | 8   |          |
| 3  | Omar Ibrahim    | Iqra             | 2     | 9   |          |
| 4  | Aisha Hassan    | Islamic Studies  | 1     | 10  |          |
```

**Sheet 3: Configuration**
```
| Setting             | Value |
|---------------------|-------|
| CurrentWeekNumber   | 1     |
| AcademicYear        | 2026  |
```

**Sheet 4: Programs**
```
| ID              | Name            | Description                          |
|-----------------|-----------------|--------------------------------------|
| iqra            | Iqra Program    | Quran reading program for children   |
| islamic-studies | Islamic Studies | Islamic knowledge and studies        |
```

**Sheet 5: Levels**
```
| Program         | LevelID | LevelName | Description      |
|-----------------|---------|-----------|------------------|
| iqra            | 1       | Level 1   | Beginner level   |
| iqra            | 2       | Level 2   | Intermediate     |
| islamic-studies | 1       | Level 1   | Foundation       |
| islamic-studies | 2       | Level 2   | Advanced         |
```

3. **Save the File:**
   - Save as: `C:\ICB\SundaySchool\data\master-data.xlsx`
   - File format: Excel Workbook (.xlsx)
   - Close Excel after saving

---

### Step 2: Populate Real Data

1. **Update Teachers Sheet:**
   - Add all actual teachers
   - Use correct names and contact information
   - Specify which programs each teacher teaches

2. **Update Students Sheet:**
   - Add all registered students
   - Assign correct program and level
   - Include any relevant notes

3. **Update Configuration:**
   - Set current week number (starts at 1 for new year)
   - Set academic year

4. **Verify Programs and Levels:**
   - Ensure programs match your offerings
   - Ensure levels are correctly defined

**Important:**
- Keep the sheet names exactly as specified
- Keep column headers exactly as specified
- IDs should be unique numbers
- Program IDs should be lowercase with hyphens (e.g., "iqra", "islamic-studies")

---

## Backend Configuration

### Step 1: Create Environment File

1. Navigate to backend folder:
   ```cmd
   cd C:\ICB\SundaySchool\backend
   ```

2. Copy the example environment file:
   ```cmd
   copy .env.example .env
   ```

3. Edit the `.env` file using Notepad:
   ```cmd
   notepad .env
   ```

### Step 2: Configure Environment Variables

Edit the `.env` file with these settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Excel File Configuration
EXCEL_FILE_PATH=../data/master-data.xlsx

# Backup Configuration
BACKUP_DIR=../data/backups
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30

# Rate Limiting (requests per 15 minutes)
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE=../logs/app.log

# CORS Configuration (for frontend access)
CORS_ORIGIN=http://localhost:5173
```

**Important Settings:**

- `PORT`: The port backend server runs on (default: 5000)
- `EXCEL_FILE_PATH`: Path to Excel file (relative to backend folder)
- `BACKUP_ENABLED`: Set to `true` to enable automatic backups
- `BACKUP_RETENTION_DAYS`: Number of days to keep old backups

**For Network Access:**
If teachers will access from other devices, update `CORS_ORIGIN`:
```env
CORS_ORIGIN=http://192.168.1.100:5173
```
Replace `192.168.1.100` with the actual IP address of the server computer.

Save and close the file.

---

## Frontend Configuration

### Step 1: Create Environment File

1. Navigate to frontend folder:
   ```cmd
   cd C:\ICB\SundaySchool\frontend
   ```

2. Copy the example environment file:
   ```cmd
   copy .env.example .env
   ```

3. Edit the `.env` file:
   ```cmd
   notepad .env
   ```

### Step 2: Configure API Endpoint

Edit the `.env` file:

```env
# Backend API URL
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Application Settings
VITE_APP_TITLE=ICB Sunday School Attendance
VITE_ORG_NAME=ICB Sunday School
```

**For Network Access:**
If teachers will access from tablets/other devices, update the API URL to use the server's IP address:

```env
VITE_API_BASE_URL=http://192.168.1.100:5000/api/v1
```

Replace `192.168.1.100` with the actual IP address of the server computer.

Save and close the file.

---

## Network Configuration

### Step 1: Find Server IP Address

1. Open Command Prompt on the server computer
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100`
5. Write down this IP address

### Step 2: Configure Windows Firewall

Allow incoming connections to the server:

1. **Open Windows Defender Firewall:**
   - Press Windows Key + R
   - Type: `wf.msc`
   - Press Enter

2. **Create Inbound Rule for Backend (Port 5000):**
   - Click "Inbound Rules" in left panel
   - Click "New Rule..." in right panel
   - Select "Port", click Next
   - Select "TCP", enter "5000", click Next
   - Select "Allow the connection", click Next
   - Check all profiles (Domain, Private, Public), click Next
   - Name: "ICB Attendance Backend"
   - Click Finish

3. **Create Inbound Rule for Frontend (Port 5173):**
   - Repeat above steps
   - Use port "5173"
   - Name: "ICB Attendance Frontend"

### Step 3: Test Network Connectivity

From a teacher's device (tablet/computer) on the same network:

1. Open web browser
2. Navigate to: `http://[SERVER-IP]:5173`
   - Replace `[SERVER-IP]` with the IP address from Step 1
   - Example: `http://192.168.1.100:5173`
3. If the page doesn't load, check firewall settings

---

## Starting the System

### Option 1: Manual Start (Development/Testing)

**Start Backend Server:**
```cmd
cd C:\ICB\SundaySchool\backend
npm start
```

Keep this Command Prompt window open. You should see:
```
Server running on port 5000
Excel file initialized: ../data/master-data.xlsx
```

**Start Frontend Server (in a new Command Prompt):**
```cmd
cd C:\ICB\SundaySchool\frontend
npm run dev
```

Keep this Command Prompt window open. You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

### Option 2: Production Build

For production deployment, build the frontend and serve it through the backend:

**Build Frontend:**
```cmd
cd C:\ICB\SundaySchool\frontend
npm run build
```

This creates optimized files in `frontend/dist/` folder.

**Serve Frontend from Backend:**
Configure backend to serve the built frontend files (requires additional setup).

### Option 3: Startup Script (Recommended for Production)

Create a batch file to start both servers automatically.

**Create `start-servers.bat` in project root:**
```batch
@echo off
echo Starting ICB Sunday School Attendance System...
echo.

echo Starting Backend Server...
start "ICB Backend" cmd /k "cd backend && npm start"

timeout /t 5 /nobreak

echo Starting Frontend Server...
start "ICB Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Keep these windows open while system is in use.
pause
```

**To use:**
1. Double-click `start-servers.bat`
2. Two Command Prompt windows will open (backend and frontend)
3. Wait 10-15 seconds for both to start
4. Access system at `http://localhost:5173` or `http://[SERVER-IP]:5173`

---

## Verification

### Step 1: Backend Verification

**Test Health Endpoint:**
1. Open web browser
2. Navigate to: `http://localhost:5000/api/v1/health`
3. Should display:
   ```json
   {
     "status": "healthy",
     "timestamp": "2026-02-23T...",
     "uptime": 123
   }
   ```

**Test Programs Endpoint:**
1. Navigate to: `http://localhost:5000/api/v1/config/programs`
2. Should display list of programs from Excel file

### Step 2: Frontend Verification

1. Open web browser
2. Navigate to: `http://localhost:5173`
3. Should see the landing page with program selection cards
4. Click on "Iqra Program"
5. Should navigate to level selection
6. Verify levels are displayed

### Step 3: Complete Flow Test

1. Start at landing page
2. Select a program
3. Select a level
4. Select a teacher
5. Mark attendance for students
6. Submit attendance
7. Verify confirmation page displays
8. Check Excel file for new sheet with today's date
9. Verify attendance data is in the sheet

**If any step fails, see [Troubleshooting](#troubleshooting) section.**

---

## User Access Setup

### Step 1: Prepare Access Instructions for Teachers

Create a simple instruction card with:

```
ICB Sunday School Attendance System

How to Access:
1. Connect your device to the ICB WiFi network
2. Open your web browser (Chrome, Safari, Edge)
3. Go to: http://192.168.1.100:5173
   (Replace with your actual server IP)

For help, contact: [Administrator Name/Phone]
```

### Step 2: Test from Teacher Devices

1. Have each teacher connect their device to the network
2. Have them access the URL
3. Walk through the attendance submission process
4. Verify they can complete the full workflow

### Step 3: Create Shortcuts (Optional)

**For tablets (iOS/Android):**
1. Open the application URL in browser
2. Use "Add to Home Screen" feature
3. Creates app-like icon on home screen
4. Easier access for teachers

---

## Backup Configuration

### Step 1: Verify Backup Directory

Ensure backup directory exists:
```cmd
cd C:\ICB\SundaySchool\data
dir backups
```

If it doesn't exist:
```cmd
mkdir backups
```

### Step 2: Configure Backup Settings

In `backend/.env`:
```env
BACKUP_ENABLED=true
BACKUP_RETENTION_DAYS=30
BACKUP_DIR=../data/backups
```

**Backup Behavior:**
- Automatic backup created before each write to Excel file
- Backups stored with timestamp: `master-data-backup-YYYYMMDD-HHMMSS.xlsx`
- Old backups automatically deleted after retention period

### Step 3: Manual Backup

To create a manual backup:
```cmd
cd C:\ICB\SundaySchool\data
copy master-data.xlsx backups\master-data-manual-backup-%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.xlsx
```

### Step 4: Test Backup Restoration

**To restore from a backup:**
1. Stop both servers
2. Navigate to backup folder
3. Find the backup file to restore
4. Copy it to `data/master-data.xlsx`
5. Restart servers

---

## Troubleshooting

### Issue: "Cannot start backend server"

**Symptoms:**
- Error: "Port 5000 is already in use"

**Solutions:**
1. Check if another program is using port 5000
2. Change port in `backend/.env` to different number (e.g., 5001)
3. Update frontend `.env` to match new port
4. Restart both servers

---

### Issue: "Frontend cannot connect to backend"

**Symptoms:**
- API calls fail
- "Network Error" messages in browser console

**Solutions:**
1. Verify backend server is running
2. Check backend URL in `frontend/.env`
3. Verify firewall allows connection
4. Check CORS configuration in `backend/.env`

---

### Issue: "Excel file locked" error

**Symptoms:**
- Error when submitting attendance
- Message about file being in use

**Solutions:**
1. Close Excel if file is open
2. Close any other programs using the Excel file
3. Restart the backend server
4. Check file permissions

---

### Issue: "No data appearing in Excel"

**Symptoms:**
- Submission succeeds but data not in file
- Empty sheets created

**Solutions:**
1. Verify Excel file path in `backend/.env`
2. Check file permissions (not read-only)
3. Verify Excel file structure matches requirements
4. Check backend console for error messages

---

### Issue: "Cannot access from teacher devices"

**Symptoms:**
- Works on server computer
- Doesn't work from tablets/other devices

**Solutions:**
1. Verify all devices on same network
2. Check Windows Firewall rules
3. Verify frontend `.env` uses server IP address
4. Test connectivity: `ping [SERVER-IP]` from teacher device
5. Try accessing backend directly: `http://[SERVER-IP]:5000/api/v1/health`

---

### Issue: "Slow performance"

**Symptoms:**
- Pages load slowly
- Submissions take long time

**Solutions:**
1. Check server computer resources (CPU, RAM)
2. Close unnecessary programs on server
3. Check network connectivity
4. Verify Excel file size (< 10MB optimal)
5. Consider hardware upgrade if persistent

---

## Maintenance

### Daily Tasks

**Before Sunday School:**
- [ ] Start both servers (if not auto-starting)
- [ ] Verify system is accessible
- [ ] Check Excel file is not open

**After Sunday School:**
- [ ] Verify all attendance submitted
- [ ] Check Excel file for data
- [ ] Create manual backup (optional)
- [ ] Can stop servers (or leave running)

### Weekly Tasks

- [ ] Review backup folder for successful backups
- [ ] Check disk space on server computer
- [ ] Review any error logs
- [ ] Update week number in Configuration sheet (if using weekly tracking)

### Monthly Tasks

- [ ] Clean up old backups (if retention not automatic)
- [ ] Review system performance
- [ ] Check for software updates
- [ ] Review Excel file size and consider archiving old data

### Yearly Tasks

- [ ] Archive previous year's data
- [ ] Reset week numbers in Configuration sheet
- [ ] Update academic year
- [ ] Review and update student/teacher lists
- [ ] Verify system still meets needs

---

### Updating the System

**To update application code:**

1. **Backup current system:**
   ```cmd
   cd C:\ICB
   xcopy SundaySchool SundaySchool-backup\ /E /I /H
   ```

2. **Stop servers**

3. **Update backend:**
   ```cmd
   cd C:\ICB\SundaySchool\backend
   git pull
   npm install
   ```

4. **Update frontend:**
   ```cmd
   cd C:\ICB\SundaySchool\frontend
   git pull
   npm install
   ```

5. **Restart servers and test**

---

### Monitoring System Health

**Health Check Endpoint:**
- URL: `http://localhost:5000/api/v1/health`
- Should always return `"status": "healthy"`

**Metrics Endpoint:**
- URL: `http://localhost:5000/api/v1/health/metrics`
- Shows system metrics:
  - Active requests
  - Total requests
  - Error count
  - Memory usage

**Check Regularly:**
- System responds quickly
- No error messages in server windows
- Excel file size reasonable (< 50MB)
- Backup folder has recent backups

---

## Security Considerations

### Data Security

1. **Local Network Only:**
   - System designed for local network use only
   - Do not expose to public internet
   - No external port forwarding

2. **Physical Security:**
   - Secure the server computer
   - Restrict physical access
   - Keep in locked room when possible

3. **Excel File Security:**
   - Regular backups
   - Store backups on separate drive
   - Consider encrypting backup files
   - Restrict file system permissions

### Access Control

1. **Network Level:**
   - Use WPA2/WPA3 encrypted WiFi
   - Strong WiFi password
   - Separate guest network if needed

2. **Application Level:**
   - Currently no user authentication (all teachers trusted)
   - Future: Could add teacher login system
   - Monitor for unusual activity

### Data Privacy

1. **Student Information:**
   - Limit data collection to necessary fields
   - Secure Excel file storage
   - Regular backup rotation
   - Clear data retention policy

2. **Compliance:**
   - Follow organizational policies
   - Comply with data protection regulations
   - Document data handling procedures

---

## Production Checklist

Before going live, verify:

- [ ] Node.js installed and verified
- [ ] Excel installed and working
- [ ] Project files extracted/cloned
- [ ] All npm dependencies installed
- [ ] Excel file created and populated with real data
- [ ] Backend `.env` configured
- [ ] Frontend `.env` configured
- [ ] Firewall rules created
- [ ] Network IP address configured
- [ ] Both servers start successfully
- [ ] Health endpoints accessible
- [ ] Frontend loads correctly
- [ ] Complete attendance submission tested
- [ ] Data appears correctly in Excel
- [ ] Backups are being created
- [ ] Teacher devices can access system
- [ ] Teachers trained on usage
- [ ] Documentation available and accessible
- [ ] Support plan in place

---

## Support and Resources

### Documentation

- **User Guide**: See `docs/USER_GUIDE.md` for teacher instructions
- **Admin Guide**: See `docs/ADMIN_GUIDE.md` for administrative tasks
- **Testing Guide**: See `docs/MANUAL_TESTING_CHECKLIST.md` for testing procedures

### Getting Help

1. **Check this deployment guide first**
2. **Review troubleshooting section**
3. **Check error messages in server windows**
4. **Contact technical administrator**

### Useful Commands Reference

```cmd
# Check Node.js version
node --version

# Check npm version
npm --version

# Find computer IP address
ipconfig

# Start backend manually
cd C:\ICB\SundaySchool\backend
npm start

# Start frontend manually
cd C:\ICB\SundaySchool\frontend
npm run dev

# View backend logs (if logging to file)
cd C:\ICB\SundaySchool\logs
type app.log

# Create manual backup
cd C:\ICB\SundaySchool\data
copy master-data.xlsx backups\manual-backup.xlsx
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-23
**Maintained By:** ICB Technical Team

**For questions or issues, contact:**
- Technical Administrator: [Name/Email/Phone]
- ICB Office: [Phone/Email]
