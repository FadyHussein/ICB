# ICB Sunday School Backend Server

Backend server for the ICB Sunday School Attendance & Academic Progress Tracking System.

## Overview

This is a Node.js/Express backend server that provides RESTful APIs for managing attendance and academic progress tracking. The system uses Excel spreadsheets as the primary data store with robust file locking mechanisms to ensure data integrity during concurrent access.

## Features

- **Excel Integration**: Read/write operations on Excel workbooks using ExcelJS
- **File Locking**: Robust concurrent access control using proper-lockfile
- **Automatic Backups**: Creates timestamped backups before every write operation
- **RESTful API**: Clean, well-documented REST endpoints
- **Input Validation**: Request validation using express-validator
- **Rate Limiting**: Protection against abuse with configurable rate limits
- **Logging**: Comprehensive logging with Winston
- **Error Handling**: Centralized error handling with meaningful error codes

## Technology Stack

- **Runtime**: Node.js v18+ / v20+
- **Framework**: Express.js v4
- **Language**: TypeScript v5
- **Excel Library**: ExcelJS v4
- **File Locking**: proper-lockfile v4
- **Security**: Helmet, CORS
- **Logging**: Winston v3

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # TypeScript interfaces
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── scripts/             # Utility scripts
├── .env                 # Environment variables
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript configuration
```

## Setup Instructions

### Prerequisites

- Node.js v18.x or v20.x LTS
- npm or pnpm package manager
- Windows 10/11 (or compatible OS)

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Adjust settings as needed (defaults work for local development)

4. **Create sample Excel file:**
   ```bash
   node scripts/create-sample-excel.js
   ```
   This creates `data/master-data.xlsx` with sample data.

5. **Build TypeScript:**
   ```bash
   npm run build
   ```

### Running the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000` (or configured PORT).

### Testing Multi-User Support

The system includes comprehensive testing scripts to verify multi-user capabilities:

**1. Verify File Locking:**
```bash
node scripts/verify-locking.js
```
Tests lock acquisition, concurrent access, stale lock detection, and performance.

**2. Test Backup System:**
```bash
node scripts/test-backups.js
```
Validates backup creation, integrity, retention, and restoration.

**3. Test Concurrent Access:**
```bash
node scripts/test-concurrent-access.js
```
Simulates 5-10 teachers submitting attendance simultaneously. Requires server running.

**4. Load Testing:**
```bash
node scripts/load-test.js
```
Runs 30-second load test with 10 concurrent users. Measures performance metrics.

**See Documentation:**
- Multi-User Guide: `../docs/MULTI_USER_GUIDE.md`
- Testing Results: `../docs/TESTING_RESULTS.md`

## API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Endpoints

#### Health Check
- **GET** `/health` - Check server status

#### Programs
- **GET** `/programs` - List available programs (Iqra, Islamic Studies)
- **GET** `/programs/:programId/levels` - Get levels for a program

#### Teachers
- **GET** `/teachers` - Get all teachers
  - Query params: `?program=iqra&level=2`
- **GET** `/teachers/:id` - Get specific teacher
- **POST** `/teachers` - Create new teacher
  ```json
  {
    "teacherName": "Ahmed Hassan",
    "program": "Both",
    "levels": ["1", "2"],
    "active": true
  }
  ```

#### Students
- **GET** `/students` - Get all students
  - Query params: `?program=iqra&level=2&activeOnly=true`
- **GET** `/students/:id` - Get specific student
- **POST** `/students` - Create new student
  ```json
  {
    "firstName": "Yusuf",
    "lastName": "Ibrahim",
    "program": "Iqra",
    "level": "2",
    "active": true,
    "parentName": "Ibrahim Ahmed",
    "parentPhone": "208-555-1234"
  }
  ```

#### Attendance
- **GET** `/attendance` - Get attendance records
  - Query params: `?program=iqra&level=2&date=2026-02-16`
- **POST** `/attendance/submit` - Submit attendance
  ```json
  {
    "program": "Iqra",
    "level": "2",
    "teacherId": "T001",
    "weekDate": "2026-02-16",
    "records": [
      {
        "studentId": "S001",
        "status": "present",
        "pageNumber": 15
      },
      {
        "studentId": "S002",
        "status": "absent",
        "pageNumber": null
      }
    ]
  }
  ```
- **POST** `/attendance/bulk-update` - Bulk update page numbers
  ```json
  {
    "program": "Iqra",
    "level": "2",
    "weekDate": "2026-02-16",
    "studentIds": ["S001", "S002"],
    "pageNumber": 20
  }
  ```
- **GET** `/attendance/stats` - Get attendance statistics
  - Query params: `?program=iqra&level=2&date=2026-02-16`

#### Configuration
- **GET** `/config/current-week` - Get current week info
- **POST** `/config/backup` - Create manual backup
- **GET** `/config/backups` - List available backups

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid program specified",
    "details": { ... }
  },
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

### Error Codes
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `FILE_LOCK_ERROR` - Excel file locked by another operation
- `EXCEL_READ_ERROR` - Failed to read Excel file
- `EXCEL_WRITE_ERROR` - Failed to write to Excel file
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `RATE_LIMIT_EXCEEDED` - Too many requests

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port |
| `NODE_ENV` | development | Environment (development/production) |
| `EXCEL_FILE_PATH` | ../data/master-data.xlsx | Path to Excel file |
| `BACKUP_DIR` | ../data/backups | Backup directory |
| `BACKUP_RETENTION_DAYS` | 30 | Days to keep backups |
| `MAX_BACKUPS` | 50 | Maximum number of backups |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `RATE_LIMIT_ATTENDANCE_MAX` | 30 | Max attendance submissions |
| `RATE_LIMIT_BULK_MAX` | 10 | Max bulk updates |
| `CORS_ORIGIN` | http://localhost:3000 | Allowed CORS origin |
| `LOG_LEVEL` | info | Logging level |

## Data Integrity

### File Locking
The system uses proper-lockfile to ensure only one write operation occurs at a time:
- Automatic lock acquisition before writes
- Configurable retry logic with exponential backoff
- Stale lock detection (10-second timeout)

### Automatic Backups
Before every write operation:
1. Current Excel file is backed up with timestamp
2. Backup stored in `data/backups/`
3. Old backups automatically cleaned based on retention policy

### Concurrency Handling
- Read operations are cached (30-second TTL)
- Write operations are queued and processed serially
- Lock-based synchronization prevents data corruption

## Development

### Available Scripts

- `npm run dev` - Start development server with ts-node
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (when implemented)
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier

### Adding New Features

1. **Add Model**: Define TypeScript interface in `src/models/`
2. **Add Service**: Implement business logic in `src/services/`
3. **Add Controller**: Create controller in `src/controllers/`
4. **Add Routes**: Define routes in `src/routes/`
5. **Add Validation**: Add validation rules in route file

## Troubleshooting

### Excel File Not Found
```
Error: Excel file not found
```
**Solution**: Run `node scripts/create-sample-excel.js` to create the file.

### File Lock Error
```
Error: Unable to acquire file lock
```
**Solution**: Another process may have the Excel file open. Close Excel and try again.

### Port Already in Use
```
Error: Port 5000 already in use
```
**Solution**: Change PORT in `.env` file or stop the process using port 5000.

### TypeScript Errors
```
Cannot find module 'express'
```
**Solution**: Run `npm install` to install all dependencies.

## Production Deployment

### Windows Deployment

1. **Install Node.js LTS** on the server PC

2. **Clone/Copy project** to server

3. **Install dependencies**:
   ```bash
   cd backend
   npm install --production
   ```

4. **Build application**:
   ```bash
   npm run build
   ```

5. **Create Excel file**:
   ```bash
   node scripts/create-sample-excel.js
   ```

6. **Configure environment**:
   - Edit `.env` for production settings
   - Set `NODE_ENV=production`

7. **Run as Windows service** (recommended):
   - Use NSSM (Non-Sucking Service Manager)
   - Or PM2: `pm2 start dist/server.js --name icb-backend`

8. **Configure firewall**:
   - Allow port 5000 (or configured port)
   - Restrict to local network only

### Network Configuration

- Server should be accessible only on local network
- Configure router to prevent external access
- Use static IP for the server PC
- Teachers access via: `http://<SERVER_IP>:5000`

## Maintenance

### Backup Management
- Backups created automatically before writes
- Manual backup: `POST /api/v1/config/backup`
- View backups: `GET /api/v1/config/backups`
- Backups stored in `data/backups/`

### Monitoring
- Check health: `GET /api/v1/health`
- View logs: Check console output or log files
- Monitor disk space for backups

### Updates
1. Stop server
2. Backup current installation
3. Pull/copy new code
4. Run `npm install`
5. Run `npm run build`
6. Restart server

## Security Notes

- System designed for trusted local network
- No authentication required (teacher selection based)
- Excel file access restricted to server process
- Rate limiting prevents abuse
- Input validation on all endpoints
- CORS configured for specific origin

## Support

For issues or questions:
1. Check troubleshooting section
2. Review logs for error details
3. Contact development team
4. Check architecture documentation in `plans/`

## License

MIT License - Islamic Center of Boise

---

**Version**: 1.0.0  
**Last Updated**: February 22, 2026
