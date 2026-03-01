# ICB Sunday School Attendance Tracking System

A full-stack web application for tracking attendance and academic progress of students at the Islamic Center of Boise Sunday School.

## 🚀 Quick Start

### Easy Startup (Recommended)

**Double-click:** [`start-icb-system.bat`](start-icb-system.bat)

This will automatically start both the backend and frontend servers in separate windows.

### Easy Shutdown

**Double-click:** [`stop-icb-system.bat`](stop-icb-system.bat)

This will automatically stop all running servers.

### Manual Startup

**Option 1 - Start Backend Only:**
- Double-click [`start-backend.bat`](start-backend.bat)
- Backend will run at: http://localhost:5000

**Option 2 - Start Frontend Only:**
- Double-click [`start-frontend.bat`](start-frontend.bat)
- Frontend will run at: http://localhost:5173

**Option 3 - Start Both Separately:**
1. Double-click [`start-backend.bat`](start-backend.bat)
2. Double-click [`start-frontend.bat`](start-frontend.bat)

### Stopping Servers

**Easiest:** Double-click [`stop-icb-system.bat`](stop-icb-system.bat)

**Manual:** Close the server command windows or press Ctrl+C in each window

## 📱 Accessing the System

### From the Server PC:
Open your browser to: **http://localhost:5173**

### From Teacher Devices (Tablets/Phones):
1. Find your server PC's IP address:
   - Open Command Prompt
   - Type: `ipconfig`
   - Look for "IPv4 Address" (e.g., 192.168.1.100)

2. On teacher devices, open browser to:
   - **http://[YOUR-PC-IP]:5173**
   - Example: http://192.168.1.100:5173

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Windows 10/11**
- **Local network** connection for teacher devices

## 📚 Documentation

- **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[User Guide](docs/USER_GUIDE.md)** - For teachers using the system
- **[Admin Guide](docs/ADMIN_GUIDE.md)** - System administration and maintenance
- **[Project Summary](PROJECT_SUMMARY.md)** - Technical overview
- **[Architecture](plans/icb-sunday-school-architecture.md)** - System architecture

## 🎯 Features

### For Teachers:
- ✅ Simple 5-step workflow
- ✅ Mark attendance with checkboxes
- ✅ Track page numbers/lessons
- ✅ Bulk update operations
- ✅ Works on tablets and phones

### For Administrators:
- ✅ Excel-based data storage
- ✅ Automatic backups
- ✅ Multi-user support (10-20 concurrent users)
- ✅ Easy data export and reporting
- ✅ System health monitoring

## 📊 System Components

```
ICB/
├── start-icb-system.bat    ← Double-click to start everything
├── start-backend.bat        ← Start backend only
├── start-frontend.bat       ← Start frontend only
├── backend/                 ← Node.js server
├── frontend/                ← React application
├── data/                    ← Excel data storage
│   └── master-data.xlsx     ← Student/teacher database
└── docs/                    ← Documentation
```

## 🔧 First-Time Setup

1. **Install Node.js** from https://nodejs.org/
2. **Double-click** [`start-icb-system.bat`](start-icb-system.bat)
3. **Wait** for automatic dependency installation (first run only)
4. **Access** the system at http://localhost:5173

## 📞 Support

For detailed help:
- **Setup Issues**: See [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- **Usage Questions**: See [User Guide](docs/USER_GUIDE.md)
- **Maintenance**: See [Admin Guide](docs/ADMIN_GUIDE.md)
- **Testing**: See [Manual Testing Checklist](docs/MANUAL_TESTING_CHECKLIST.md)

## 🎓 Programs Supported

- **Iqra Tracking**: Kindergarten, Levels 1-6, Quran
- **Islamic Studies Tracking**: Levels 1-6

## 🔒 Security Notes

- System designed for **local network** use only
- No internet connection required
- Data stored locally in Excel format
- Automatic backups before every write

## 📈 System Status

- **Backend Status**: Check http://localhost:5000/api/v1/status/health
- **API Documentation**: [Backend README](backend/README.md)
- **Frontend Documentation**: [Frontend README](frontend/README.md)

## 🛠️ Troubleshooting

**Problem:** Batch file won't run
- **Solution**: Make sure Node.js is installed

**Problem:** "Port already in use" error
- **Solution**: Close any existing server windows and try again

**Problem:** Can't access from tablets
- **Solution**: Check Windows Firewall settings (see [Deployment Guide](docs/DEPLOYMENT_GUIDE.md))

**Problem:** API errors (404)
- **Solution**: Make sure backend server is running

For more troubleshooting, see the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md).

---

**Islamic Center of Boise Sunday School** | Version 1.0 | 2026
