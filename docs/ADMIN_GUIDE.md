# Administrator Guide

## ICB Sunday School Attendance Tracking System

This guide covers administrative tasks for managing and maintaining the attendance tracking system.

---

## Table of Contents

1. [Administrator Responsibilities](#administrator-responsibilities)
2. [System Overview](#system-overview)
3. [Excel File Management](#excel-file-management)
4. [Managing Teachers](#managing-teachers)
5. [Managing Students](#managing-students)
6. [Managing Programs and Levels](#managing-programs-and-levels)
7. [Configuration Management](#configuration-management)
8. [Viewing Attendance Data](#viewing-attendance-data)
9. [Backup Management](#backup-management)
10. [System Monitoring](#system-monitoring)
11. [Troubleshooting](#troubleshooting)
12. [Performance Optimization](#performance-optimization)
13. [Security and Access](#security-and-access)
14. [Regular Maintenance Tasks](#regular-maintenance-tasks)
15. [Year-End Procedures](#year-end-procedures)

---

## Administrator Responsibilities

As the system administrator, you are responsible for:

- ✅ Starting and stopping the system
- ✅ Managing the Excel master data file
- ✅ Adding/removing teachers and students
- ✅ Monitoring system health
- ✅ Managing backups
- ✅ Troubleshooting issues
- ✅ Training users
- ✅ Maintaining documentation
- ✅ Data integrity and security

---

## System Overview

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Teacher Devices                     │
│         (Tablets/Computers on WiFi)                  │
└────────────────────┬────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────┐
│              Frontend Server (Port 5173)             │
│                 React Application                    │
└────────────────────┬────────────────────────────────┘
                     │ API Calls
                     ▼
┌─────────────────────────────────────────────────────┐
│              Backend Server (Port 5000)              │
│            Node.js/Express API                       │
└────────────────────┬────────────────────────────────┘
                     │ Read/Write
                     ▼
┌─────────────────────────────────────────────────────┐
│              Excel File (master-data.xlsx)           │
│         - Teachers      - Configuration              │
│         - Students      - Attendance Data            │
│         - Programs      - Daily Sheets               │
└─────────────────────────────────────────────────────┘
                     │ Backup
                     ▼
┌─────────────────────────────────────────────────────┐
│              Backup System (data/backups/)           │
│         Automatic backups before each write          │
└─────────────────────────────────────────────────────┘
```

### Key Components

**Backend (`backend/src/`):**
- API endpoints for data access
- Excel file reading/writing
- File locking mechanism
- Backup management
- Request validation

**Frontend (`frontend/src/`):**
- User interface for teachers
- API integration
- State management
- Form validation

**Data Storage (`data/master-data.xlsx`):**
- Teachers sheet
- Students sheet
- Programs sheet
- Levels sheet
- Configuration sheet
- Daily attendance sheets (created automatically)

---

## Excel File Management

### Understanding the Excel File Structure

The `master-data.xlsx` file is the heart of the system. It contains:

#### 1. Teachers Sheet

**Purpose:** Lists all teachers who can submit attendance

**Columns:**
- `ID` (Number): Unique teacher identifier
- `Name` (Text): Full teacher name
- `Programs` (Text): Comma-separated list (e.g., "Iqra,Islamic Studies")
- `Email` (Text): Contact email (optional)
- `Phone` (Text): Contact phone (optional)

**Example:**
```
| ID | Name           | Programs              | Email           | Phone        |
|----|----------------|-----------------------|-----------------|--------------|
| 1  | Ahmed Hassan   | Iqra,Islamic Studies  | ahmed@icb.org   | 555-0101     |
| 2  | Sarah Johnson  | Iqra                  | sarah@icb.org   | 555-0102     |
| 3  | Omar Ibrahim   | Islamic Studies       | omar@icb.org    | 555-0103     |
```

**Rules:**
- ID must be unique
- Name is required
- Programs must match program IDs from Programs sheet
- Separate multiple programs with commas, no spaces

---

#### 2. Students Sheet

**Purpose:** Lists all registered students

**Columns:**
- `ID` (Number): Unique student identifier
- `Name` (Text): Full student name
- `Program` (Text): Program ID (e.g., "iqra")
- `Level` (Number): Level number
- `Age` (Number): Student age (optional)
- `ParentName` (Text): Parent/guardian name (optional)
- `Phone` (Text): Contact phone (optional)
- `Notes` (Text): Any special notes (optional)

**Example:**
```
| ID | Name          | Program         | Level | Age | ParentName    | Phone    |
|----|---------------|-----------------|-------|-----|---------------|----------|
| 1  | Ali Mohamed   | iqra            | 1     | 7   | Mohamed Ali   | 555-1001 |
| 2  | Fatima Ahmed  | iqra            | 1     | 8   | Ahmed Hassan  | 555-1002 |
| 3  | Omar Hassan   | iqra            | 2     | 9   | Hassan Omar   | 555-1003 |
| 4  | Aisha Ibrahim | islamic-studies | 1     | 10  | Ibrahim Said  | 555-1004 |
```

**Rules:**
- ID must be unique
- Name, Program, and Level are required
- Program must match program ID from Programs sheet
- Level must exist in Levels sheet for that program

---

#### 3. Programs Sheet

**Purpose:** Defines available programs

**Columns:**
- `ID` (Text): Program identifier (lowercase, hyphenated)
- `Name` (Text): Display name
- `Description` (Text): Brief description

**Example:**
```
| ID              | Name            | Description                        |
|-----------------|-----------------|-------------------------------------|
| iqra            | Iqra Program    | Quran reading program for children |
| islamic-studies | Islamic Studies | Islamic knowledge and studies      |
```

**Rules:**
- ID must be lowercase, use hyphens instead of spaces
- ID must be unique
- Name is what teachers see in the interface

---

#### 4. Levels Sheet

**Purpose:** Defines levels within each program

**Columns:**
- `Program` (Text): Program ID
- `LevelID` (Number): Level identifier
- `LevelName` (Text): Display name
- `Description` (Text): Brief description (optional)

**Example:**
```
| Program         | LevelID | LevelName | Description          |
|-----------------|---------|-----------|----------------------|
| iqra            | 1       | Level 1   | Beginner level       |
| iqra            | 2       | Level 2   | Intermediate         |
| iqra            | 3       | Level 3   | Advanced             |
| islamic-studies | 1       | Level 1   | Foundation studies   |
| islamic-studies | 2       | Level 2   | Advanced studies     |
```

**Rules:**
- Program must match program ID from Programs sheet
- LevelID unique within each program (can repeat across programs)
- LevelName is what teachers see

---

#### 5. Configuration Sheet

**Purpose:** System configuration settings

**Columns:**
- `Setting` (Text): Setting name
- `Value` (Text/Number): Setting value

**Example:**
```
| Setting            | Value      |
|--------------------|------------|
| CurrentWeekNumber  | 5          |
| AcademicYear       | 2026       |
| SystemVersion      | 1.0        |
```

**Important Settings:**
- `CurrentWeekNumber`: Current week of the program (1-52)
- `AcademicYear`: Current academic year

---

#### 6. Daily Attendance Sheets

**Purpose:** Store submitted attendance data

**Naming:** Created automatically with date: `YYYY-MM-DD` (e.g., "2026-02-23")

**Columns:**
- `WeekNumber` (Number): Week number
- `Program` (Text): Program ID
- `Level` (Number): Level number
- `Teacher` (Text): Teacher name
- `StudentID` (Number): Student ID
- `StudentName` (Text): Student name
- `Present` (Boolean): TRUE if present, FALSE if absent
- `PageNumber` (Number): Page completed (if present)
- `Notes` (Text): Teacher notes
- `SubmittedAt` (DateTime): Submission timestamp

**Note:** These sheets are created automatically by the system. Don't create them manually.

---

### Opening and Editing the Excel File

**⚠️ IMPORTANT: Follow these steps to avoid conflicts!**

#### Safe Editing Procedure

1. **Stop the servers first:**
   - If running, stop both backend and frontend
   - This prevents file locking conflicts

2. **Open Excel file:**
   - Navigate to: `C:\ICB\SundaySchool\data\master-data.xlsx`
   - Open with Microsoft Excel

3. **Make your changes:**
   - Edit data as needed
   - Follow the rules for each sheet

4. **Save and close:**
   - Save the file (Ctrl+S)
   - Close Excel completely
   - Verify Excel is closed (check taskbar)

5. **Restart servers:**
   - Start backend server
   - Start frontend server
   - Changes will be reflected immediately

**❌ Never:**
- Leave Excel file open while servers are running
- Make changes while teachers are submitting attendance
- Edit daily attendance sheets directly (causes data issues)

---

## Managing Teachers

### Adding a New Teacher

1. **Stop servers and open Excel file**

2. **Go to Teachers sheet**

3. **Find the next available ID:**
   - Look at the last row
   - Add 1 to the highest ID

4. **Add new row:**
   ```
   | ID | Name         | Programs    | Email         | Phone    |
   |----|--------------|-------------|---------------|----------|
   | 10 | New Teacher  | iqra        | new@icb.org   | 555-9999 |
   ```

5. **Save and close Excel**

6. **Restart servers**

7. **Test:**
   - Open application
   - Navigate to teacher selection
   - Verify new teacher appears

### Removing a Teacher

1. **Stop servers and open Excel file**

2. **Go to Teachers sheet**

3. **Delete the entire row** for that teacher

4. **Save and close Excel**

5. **Restart servers**

**⚠️ Warning:** Don't just delete the teacher's name. Delete the entire row or clear all cells in the row.

### Updating Teacher Information

1. **Stop servers and open Excel file**

2. **Go to Teachers sheet**

3. **Find the teacher's row**

4. **Update the information:**
   - Name: Change as needed
   - Programs: Add or remove programs
   - Email/Phone: Update contact info

5. **Save and close Excel**

6. **Restart servers**

### Assigning Teachers to Programs

Teachers can teach one or multiple programs.

**Single Program:**
```
Programs: iqra
```

**Multiple Programs:**
```
Programs: iqra,islamic-studies
```

**Rules:**
- Separate with commas
- No spaces after commas
- Program IDs must match Programs sheet
- Case-sensitive

---

## Managing Students

### Adding a New Student

1. **Stop servers and open Excel file**

2. **Go to Students sheet**

3. **Find the next available ID**

4. **Add new row:**
   ```
   | ID | Name        | Program | Level | Age | ParentName  | Phone    |
   |----|-------------|---------|-------|-----|-------------|----------|
   | 50 | New Student | iqra    | 1     | 7   | Parent Name | 555-8888 |
   ```

5. **Verify:**
   - Program exists in Programs sheet
   - Level exists in Levels sheet for that program

6. **Save and close Excel**

7. **Restart servers**

### Removing a Student

**Option 1: Permanent Removal**
1. Stop servers and open Excel file
2. Go to Students sheet
3. Delete the entire row
4. Save and close Excel
5. Restart servers

**Option 2: Archive (Recommended)**
1. Create an "Archived" sheet if it doesn't exist
2. Copy the student row to Archived sheet
3. Add a column for "ArchivedDate"
4. Delete from Students sheet
5. Keeps historical record

### Moving Student to Different Level

**Example: Promoting student from Level 1 to Level 2**

1. **Stop servers and open Excel file**

2. **Go to Students sheet**

3. **Find the student's row**

4. **Change the Level column:**
   - Old: Level 1
   - New: Level 2

5. **Save and close Excel**

6. **Restart servers**

### Bulk Adding Students

**Using Excel:**

1. Stop servers and open Excel file
2. Prepare data in separate spreadsheet
3. Copy and paste into Students sheet
4. Ensure IDs are unique
5. Verify all required columns filled
6. Save and close Excel
7. Restart servers

**Template for bulk import:**
```
| ID | Name  | Program | Level | Age | ParentName | Phone |
|----|-------|---------|-------|-----|------------|-------|
| 51 | Ali   | iqra    | 1     | 7   | Parent 1   | 555-1 |
| 52 | Fatma | iqra    | 1     | 8   | Parent 2   | 555-2 |
| 53 | Omar  | iqra    | 2     | 9   | Parent 3   | 555-3 |
```

---

## Managing Programs and Levels

### Adding a New Program

1. **Update Programs Sheet:**
   ```
   | ID          | Name            | Description              |
   |-------------|-----------------|--------------------------|
   | arabic      | Arabic Program  | Arabic language studies  |
   ```

2. **Add Levels for the Program in Levels Sheet:**
   ```
   | Program | LevelID | LevelName | Description    |
   |---------|---------|-----------|----------------|
   | arabic  | 1       | Level 1   | Beginner       |
   | arabic  | 2       | Level 2   | Intermediate   |
   ```

3. **Save and restart servers**

### Adding a New Level to Existing Program

1. **Go to Levels sheet**

2. **Add new row:**
   ```
   | Program | LevelID | LevelName | Description |
   |---------|---------|-----------|-------------|
   | iqra    | 4       | Level 4   | Expert      |
   ```

3. **Save and restart servers**

### Removing a Program

**⚠️ Warning:** Only do this if no students are enrolled and no historical data exists.

1. Remove from Programs sheet
2. Remove all levels from Levels sheet
3. Verify no students have this program
4. Delete or archive relevant attendance sheets
5. Save and restart servers

---

## Configuration Management

### Updating Week Number

**When:** Start of each new week (usually Sunday night or Monday)

**How:**
1. Stop servers and open Excel file
2. Go to Configuration sheet
3. Find "CurrentWeekNumber" row
4. Increment the value by 1
   - Week 1 → Week 2
   - Week 2 → Week 3
   - etc.
5. Save and close Excel
6. Restart servers

**Example:**
```
Before:
| Setting           | Value |
|-------------------|-------|
| CurrentWeekNumber | 5     |

After:
| Setting           | Value |
| ------------------|-------|
| CurrentWeekNumber | 6     |
```

### Starting New Academic Year

**When:** Beginning of new school year

**How:**
1. **Archive previous year's data:**
   - Copy entire Excel file to archive folder
   - Rename: `master-data-2026.xlsx`

2. **Update Configuration:**
   - Reset CurrentWeekNumber to 1
   - Update AcademicYear to new year

3. **Clean up attendance sheets:**
   - Delete old daily attendance sheets
   - Or move to archive file

4. **Update student levels:**
   - Promote students to next level as appropriate

5. **Update teacher/student lists:**
   - Remove graduated students
   - Add new students
   - Update teacher assignments

6. **Restart and test**

---

## Viewing Attendance Data

### Accessing Daily Attendance Records

1. **Open Excel file** (stop servers first)

2. **Navigate to date sheet:**
   - Sheet names are dates: "2026-02-23"
   - Most recent dates are newest sheets

3. **View the data:**
   - Each row is one student's attendance
   - Multiple teachers/levels can submit on same day

### Analyzing Attendance

**Student Attendance Rate:**
1. Count present vs. total submissions for a student
2. Calculate percentage
3. Use Excel formulas:
   ```
   =COUNTIF(G:G, TRUE) / COUNTA(G:G)
   ```

**Class Attendance by Date:**
1. Filter by Program and Level
2. Count present students
3. Generate reports

**Weekly/Monthly Reports:**
1. Combine data from multiple date sheets
2. Use Excel pivot tables
3. Create charts and graphs

### Exporting Data

**To CSV:**
1. Open Excel file
2. Select sheet to export
3. File → Save As → CSV
4. Use for external analysis

**To PDF:**
1. Select sheet
2. File → Print → Save as PDF
3. Good for sharing reports

---

## Backup Management

### Understanding the Backup System

**Automatic Backups:**
- Created before each write to Excel file
- Stored in: `data/backups/`
- Named: `master-data-backup-YYYYMMDD-HHMMSS.xlsx`
- Example: `master-data-backup-20260223-143022.xlsx`

**Retention:**
- Configurable in `backend/.env`
- Default: 30 days
- Older backups automatically deleted

### Creating Manual Backup

**Method 1: Windows Copy**
```cmd
cd C:\ICB\SundaySchool\data
copy master-data.xlsx backups\manual-backup-%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.xlsx
```

**Method 2: Excel Save As**
1. Open master-data.xlsx
2. File → Save As
3. Navigate to backups folder
4. Add date to filename
5. Save

### Restoring from Backup

**⚠️ Critical Procedure - Be Careful!**

1. **Stop both servers immediately**

2. **Identify backup to restore:**
   - Navigate to: `data/backups/`
   - Find the correct backup file by timestamp
   - Open it to verify it's the right one

3. **Create safety backup of current file:**
   ```cmd
   cd C:\ICB\SundaySchool\data
   copy master-data.xlsx master-data-before-restore.xlsx
   ```

4. **Restore the backup:**
   ```cmd
   copy backups\master-data-backup-YYYYMMDD-HHMMSS.xlsx master-data.xlsx
   ```
   - Replace YYYYMMDD-HHMMSS with actual backup filename

5. **Verify restoration:**
   - Open master-data.xlsx
   - Verify data is correct
   - Close Excel

6. **Restart servers**

7. **Test system thoroughly**

### Backup Best Practices

- ✅ Keep backups on separate drive/location
- ✅ Test restores periodically
- ✅ Create manual backups before major changes
- ✅ Document why you're restoring from backup
- ✅ Verify backup integrity regularly

---

## System Monitoring

### Health Endpoints

**Health Check:**
- URL: `http://localhost:5000/api/v1/health`
- Returns: System status and uptime
- Check this regularly

**Example Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-23T14:30:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

**Metrics Endpoint:**
- URL: `http://localhost:5000/api/v1/health/metrics`
- Returns: System metrics

**Example Response:**
```json
{
  "success": true,
  "data": {
    "activeRequests": 2,
    "totalRequests": 150,
    "errors": 0,
    "uptime": 3600,
    "memory": {
      "used": 45000000,
      "total": 8000000000
    }
  }
}
```

### Monitoring Dashboard (Manual)

Create a simple monitoring checklist:

**Daily Checks:**
- [ ] Both servers running
- [ ] Health endpoint returns "healthy"
- [ ] No error messages in console
- [ ] Excel file accessible
- [ ] Recent backups exist

**Weekly Checks:**
- [ ] Review error logs
- [ ] Check disk space
- [ ] Verify backup system working
- [ ] Review system performance
- [ ] Update week number

**Monthly Checks:**
- [ ] Review and clean old backups
- [ ] Check Excel file size (< 50MB ideal)
- [ ] Review attendance data quality
- [ ] Update software if needed
- [ ] Review user feedback

### Log Files

**Backend Logs:**
- Location: `logs/app.log` (if logging to file enabled)
- Contains: API requests, errors, warnings

**Checking Logs:**
```cmd
cd C:\ICB\SundaySchool\logs
type app.log
```

**Looking for Errors:**
```cmd
findstr /i "error" app.log
```

### Performance Monitoring

**Key Metrics:**
- Response time (< 1 second ideal)
- Memory usage (< 500MB ideal)
- Active connections (monitor during peak usage)
- Error rate (should be near 0%)

**Tools:**
- Windows Task Manager (monitor resource usage)
- Browser Developer Tools (Network tab)
- Backend console output

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Backend won't start

**Error: "Port 5000 already in use"**

**Solution:**
1. Find process using port 5000:
   ```cmd
   netstat -ano | findstr :5000
   ```
2. Note the PID (last column)
3. Kill the process:
   ```cmd
   taskkill /PID <PID> /F
   ```
4. Or change port in `backend/.env`

---

#### Issue: Excel file is locked

**Error: "File is locked by another process"**

**Solutions:**
1. Close Excel if open
2. Check Task Manager for Excel processes
3. Close any Excel processes
4. Restart backend server

---

#### Issue: Students not appearing

**Symptoms:** Teacher selects program/level, no students shown

**Solutions:**
1. Verify Students sheet has students for that program/level
2. Check program ID matches exactly (case-sensitive)
3. Check level number is correct
4. Restart backend server
5. Check console for errors

---

#### Issue: Teacher not in list

**Symptoms:** Teacher can't find their name

**Solutions:**
1. Verify teacher exists in Teachers sheet
2. Check spelling is exact
3. Verify program assignment is correct
4. Restart backend server

---

#### Issue: Submission fails

**Symptoms:** Teacher gets error when submitting

**Solutions:**
1. Check Excel file is not open
2. Verify file permissions (not read-only)
3. Check disk space available
4. Check backend console for specific error
5. Verify network connectivity

---

#### Issue: Wrong data in Excel

**Symptoms:** Data doesn't match what teacher submitted

**Solutions:**
1. Check date sheet (teacher may have wrong date)
2. Verify student IDs match
3. Check for manual edits that corrupted data
4. Restore from backup if necessary

---

#### Issue: Slow performance

**Symptoms:** Pages load slowly, submissions take long time

**Solutions:**
1. Check server computer resources (CPU, RAM)
2. Close unnecessary programs
3. Check Excel file size (archive old data if > 50MB)
4. Verify network connection
5. Consider hardware upgrade

---

## Performance Optimization

### Excel File Optimization

**When Excel file gets large (> 50MB):**

1. **Archive old attendance data:**
   - Create new workbook: `attendance-archive-2026.xlsx`
   - Move old daily sheets to archive
   - Keep current year in main file

2. **Clean up unnecessary data:**
   - Remove unused columns
   - Delete duplicate entries
   - Remove test data

3. **Optimize formulas:**
   - Avoid volatile formulas (NOW, TODAY)
   - Use calculated values instead

### Server Optimization

**Backend:**
- Restart weekly to clear memory
- Monitor memory usage
- Update Node.js to latest LTS version

**Frontend:**
- Build for production (npm run build)
- Enable caching
- Minimize bundle size

### Network Optimization

- Use wired Ethernet for server if possible
- Position WiFi router centrally
- Reduce network congestion during usage hours
- Consider dedicated network for system

---

## Security and Access

### Network Security

**Firewall Configuration:**
- Only allow connections from local network
- Block external access
- Keep ports 5000 and 5173 restricted to LAN

**WiFi Security:**
- Use WPA2/WPA3 encryption
- Strong password
- Change password periodically
- Consider MAC address filtering

### Data Security

**Excel File:**
- Restrict file system permissions
- Only administrator can edit
- Regular backups to secure location
- Consider encrypting backups

**Backup Security:**
- Store backups on separate physical drive
- Consider offsite backup copy
- Encrypt sensitive backups
- Limit access to backup folder

### Access Control

**Current System:**
- No authentication (trust-based)
- All teachers can access
- No role-based permissions

**Future Enhancements:**
- Add teacher login system
- Role-based access (teacher, admin)
- Audit logging
- Session management

---

## Regular Maintenance Tasks

### Daily Checklist

**Sunday (Usage Day):**
- [ ] Start servers before Sunday School
- [ ] Verify system accessible
- [ ] Monitor for issues during use
- [ ] Verify submissions successful
- [ ] Create manual backup after all submissions

**Weekdays:**
- [ ] Check system health (if servers running continuously)
- [ ] Review any error reports from teachers

### Weekly Checklist

- [ ] Update week number in Configuration sheet
- [ ] Review attendance data for completeness
- [ ] Check backup folder for recent backups
- [ ] Clean up old temporary files
- [ ] Review system logs for errors

### Monthly Checklist

- [ ] Review disk space usage
- [ ] Clean up old backups (beyond retention period)
- [ ] Review Excel file size
- [ ] Update student/teacher lists as needed
- [ ] Check for software updates
- [ ] Review system performance metrics

### Quarterly Checklist

- [ ] Complete system backup (full project folder)
- [ ] Review and update documentation
- [ ] Test restore procedure
- [ ] Review security settings
- [ ] Plan for system improvements
- [ ] Review user feedback

---

## Year-End Procedures

### End of Academic Year

**1. Data Archival:**
```
Step 1: Create archive folder
- Create: data/archives/2026/

Step 2: Archive Excel file
- Copy master-data.xlsx to archives folder
- Rename: master-data-2026.xlsx

Step 3: Archive backups
- Copy entire backups folder to archives
- Rename: backups-2026

Step 4: Generate reports
- Create yearly attendance summary
- Generate statistics
- Export to PDF
```

**2. System Reset:**
```
Step 1: Clean Excel file
- Delete all daily attendance sheets
- Keep: Teachers, Students, Programs, Levels, Configuration

Step 2: Update Configuration
- Set CurrentWeekNumber to 1
- Update AcademicYear to new year

Step 3: Update student levels
- Promote students to next level
- Archive graduated students

Step 4: Update teacher assignments
- Verify teacher programs
- Add new teachers
- Archive departed teachers
```

**3. Testing:**
```
Step 1: Restart servers
Step 2: Test complete workflow
Step 3: Verify data writes correctly
Step 4: Check backups working
Step 5: Train any new teachers
```

---

## Advanced Topics

### Database Migration (Future)

If the system grows beyond Excel's capabilities:

**Signs you need a database:**
- Excel file > 100MB
- Performance issues
- Concurrent access conflicts
- Complex querying needs

**Migration Path:**
- PostgreSQL or MySQL recommended
- Keep Excel as backup
- Migrate historical data
- Update backend to use database
- Frontend changes minimal

### Scaling the System

**For larger organizations:**
- Deploy on dedicated server
- Use proper database
- Implement authentication
- Add admin dashboard
- Enhanced reporting tools
- Mobile app development

### Integration Possibilities

**Future integrations:**
- Parent portal for viewing attendance
- SMS/email notifications
- Google Sheets synchronization
- Student information system integration
- Online payment integration

---

## Quick Reference Commands

### Starting the System

```cmd
REM Start both servers
cd C:\ICB\SundaySchool
start-servers.bat

REM Or manually:
REM Terminal 1:
cd C:\ICB\SundaySchool\backend
npm start

REM Terminal 2:
cd C:\ICB\SundaySchool\frontend
npm run dev
```

### Stopping the System

```cmd
REM In each terminal window:
Ctrl+C
```

### Checking Health

```cmd
REM Open browser:
http://localhost:5000/api/v1/health
```

### Creating Backup

```cmd
cd C:\ICB\SundaySchool\data
copy master-data.xlsx backups\manual-backup-%DATE:~-4,4%%DATE:~-10,2%%DATE:~-7,2%.xlsx
```

### Viewing Logs

```cmd
cd C:\ICB\SundaySchool\logs
type app.log

REM Find errors:
findstr /i "error" app.log
```

---

## Support Resources

### Internal Documentation

- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`
- **User Guide**: `docs/USER_GUIDE.md`
- **Testing Checklist**: `docs/MANUAL_TESTING_CHECKLIST.md`
- **Multi-User Guide**: `docs/MULTI_USER_GUIDE.md`

### External Resources

- **Node.js Documentation**: https://nodejs.org/docs
- **Excel Support**: https://support.microsoft.com/excel
- **React Documentation**: https://react.dev

### Getting Technical Help

**For system issues:**
1. Check this guide first
2. Review error messages
3. Check log files
4. Search for similar issues online
5. Contact development team

**For data issues:**
1. Create backup immediately
2. Document the problem
3. Don't make changes without backup
4. Restore from backup if needed
5. Contact administrator

---

## Appendix: Excel Formulas

### Useful Formulas for Attendance Analysis

**Count present students:**
```excel
=COUNTIF(G:G, TRUE)
```

**Count absent students:**
```excel
=COUNTIF(G:G, FALSE)
```

**Attendance rate:**
```excel
=COUNTIF(G:G, TRUE) / COUNTA(G:G)
```

**Average page number:**
```excel
=AVERAGE(H:H)
```

**Students by program:**
```excel
=COUNTIF(Students!C:C, "iqra")
```

---

## Appendix: Troubleshooting Decision Tree

```
Problem Reported
    │
    ├─ System Won't Start
    │   ├─ Check if Node.js installed
    │   ├─ Check if port in use
    │   └─ Check error messages
    │
    ├─ Data Not Appearing
    │   ├─ Check Excel file structure
    │   ├─ Restart backend server
    │   └─ Check console errors
    │
    ├─ Submission Fails
    │   ├─ Check if Excel is open
    │   ├─ Check file permissions
    │   └─ Check disk space
    │
    └─ Slow Performance
        ├─ Check server resources
        ├─ Check network connectivity
        └─ Check Excel file size
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-23
**Maintained By:** ICB Technical Team

**For administrator support:**
- Technical Questions: [Contact Info]
- System Issues: [Contact Info]
- Emergency: [Contact Info]
