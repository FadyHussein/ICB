# ICB Sunday School Attendance & Academic Progress Tracking System
## Complete System Architecture & Technical Specifications

**Version:** 1.0  
**Date:** February 22, 2026  
**Project:** Islamic Center of Boise (ICB) Sunday School Management System

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Model & Excel Schema](#data-model--excel-schema)
5. [API Specifications](#api-specifications)
6. [Frontend Architecture](#frontend-architecture)
7. [Concurrency & Data Integrity Strategy](#concurrency--data-integrity-strategy)
8. [Project File Structure](#project-file-structure)
9. [Security Considerations](#security-considerations)
10. [Development Phases](#development-phases)

---

## Executive Summary

### System Overview
The ICB Sunday School Tracking System is a full-stack web application designed to streamline attendance and academic progress tracking for both Iqra and Islamic Studies programs. The system operates on a server-agent architecture with a central server hosted on the Islamic Center's main PC, accessible by 10-20 concurrent teachers via web browsers on the local network.

### Key Features
- Dual program support (Iqra Tracking & Islamic Studies Tracking)
- Multi-level class organization (Kindergarten through Level 6, plus Quran)
- Teacher authentication via dynamic selection
- Real-time attendance marking with progress tracking
- Bulk update capabilities
- Automatic timestamping and data persistence
- Concurrent multi-user access with data integrity guarantees
- Excel-based data storage for easy access and backup

### Design Principles
- **Simplicity:** Easy-to-use interface for non-technical teachers
- **Reliability:** Robust data integrity with concurrent access support
- **Maintainability:** Clear separation of concerns, well-documented code
- **Performance:** Optimized for local network with minimal latency
- **Accessibility:** Responsive design for tablets and various devices

---

## Technology Stack

### Backend Stack

#### **Primary Framework: Node.js with Express.js**
**Rationale:**
- Cross-platform compatibility (Windows, Linux, Mac)
- Excellent Excel integration via `exceljs` library
- Fast development with JavaScript/TypeScript
- Strong ecosystem for real-time operations
- Easy deployment on Windows without complex dependencies

#### **Excel Library: ExcelJS**
**Features:**
- Read/write Excel files (.xlsx format)
- Stream-based operations for large files
- Cell-level formatting and data validation
- Formula support
- Thread-safe operations with proper locking

#### **File Locking: Proper-lockfile**
**Purpose:**
- Ensures atomic Excel file operations
- Prevents concurrent write conflicts
- Cross-platform file locking mechanism

#### **Additional Backend Dependencies:**
```json
{
  "express": "^4.18.x",
  "exceljs": "^4.3.x",
  "proper-lockfile": "^4.1.x",
  "cors": "^2.8.x",
  "helmet": "^7.1.x",
  "express-rate-limit": "^7.1.x",
  "winston": "^3.11.x",
  "dotenv": "^16.3.x",
  "uuid": "^9.0.x"
}
```

### Frontend Stack

#### **Framework: React with TypeScript**
**Rationale:**
- Component-based architecture matches UI structure
- Strong type safety with TypeScript
- Excellent developer experience
- Large ecosystem and community support
- Optimal for dynamic, interactive interfaces

#### **State Management: React Context API + Custom Hooks**
**Rationale:**
- Sufficient for application complexity
- No external state library needed
- Reduces bundle size
- Easier onboarding for developers

#### **UI Framework: Material-UI (MUI)**
**Rationale:**
- Professional, accessible components out-of-the-box
- Responsive design built-in
- Consistent design language
- Good documentation
- Touch-friendly for tablets

#### **Routing: React Router v6**
**Rationale:**
- Industry-standard React routing
- Declarative routing configuration
- Support for nested routes
- Browser history management

#### **HTTP Client: Axios**
**Rationale:**
- Promise-based HTTP client
- Interceptors for request/response handling
- Automatic JSON transformation
- Better error handling than fetch

#### **Additional Frontend Dependencies:**
```json
{
  "react": "^18.2.x",
  "react-dom": "^18.2.x",
  "react-router-dom": "^6.20.x",
  "@mui/material": "^5.14.x",
  "@mui/icons-material": "^5.14.x",
  "@emotion/react": "^11.11.x",
  "@emotion/styled": "^11.11.x",
  "axios": "^1.6.x",
  "typescript": "^5.3.x"
}
```

### Development Tools

- **Build Tool:** Vite (Fast development server, optimized production builds)
- **Package Manager:** npm or pnpm
- **Code Quality:** ESLint, Prettier
- **Version Control:** Git
- **Testing:** Jest (unit tests), React Testing Library (component tests)

### Deployment Environment

- **Operating System:** Windows 10/11
- **Node.js Runtime:** v18.x LTS or v20.x LTS
- **Network:** Local network (192.168.x.x range)
- **Port:** 3000 (frontend dev), 5000 (backend API)
- **Production Build:** Static frontend served by Express backend

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Local Network (LAN)                          │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Teacher    │  │   Teacher    │  │   Teacher    │          │
│  │   Device 1   │  │   Device 2   │  │   Device N   │          │
│  │  (Browser)   │  │  (Browser)   │  │  (Browser)   │          │
│  └───────┬──────┘  └───────┬──────┘  └───────┬──────┘          │
│          │                 │                 │                   │
│          └─────────────────┼─────────────────┘                   │
│                            │                                     │
│                     HTTP Requests                                │
│                            │                                     │
│  ┌─────────────────────────▼──────────────────────────┐         │
│  │         ICB Main PC (Server Host)                  │         │
│  │                                                     │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │   Web Server (Express.js on Node.js)        │ │         │
│  │  │                                              │ │         │
│  │  │  ┌────────────────┐  ┌──────────────────┐  │ │         │
│  │  │  │  Static File   │  │   REST API       │  │ │         │
│  │  │  │  Serving       │  │   Endpoints      │  │ │         │
│  │  │  │  (Frontend)    │  │   (Backend)      │  │ │         │
│  │  │  └────────────────┘  └──────────────────┘  │ │         │
│  │  │                                              │ │         │
│  │  │  ┌─────────────────────────────────────┐   │ │         │
│  │  │  │   Business Logic Layer              │   │ │         │
│  │  │  │  - Attendance Service               │   │ │         │
│  │  │  │  - Progress Service                 │   │ │         │
│  │  │  │  - Teacher Service                  │   │ │         │
│  │  │  │  - Student Service                  │   │ │         │
│  │  │  └─────────────────────────────────────┘   │ │         │
│  │  │                                              │ │         │
│  │  │  ┌─────────────────────────────────────┐   │ │         │
│  │  │  │   Data Access Layer                 │   │ │         │
│  │  │  │  - Excel Reader/Writer              │   │ │         │
│  │  │  │  - File Lock Manager                │   │ │         │
│  │  │  │  - Data Validation                  │   │ │         │
│  │  │  └─────────────────────────────────────┘   │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  │                         │                          │         │
│  │                         ▼                          │         │
│  │  ┌──────────────────────────────────────────────┐ │         │
│  │  │   File System (Excel Storage)                │ │         │
│  │  │                                              │ │         │
│  │  │  ┌─────────────────────────────────────┐   │ │         │
│  │  │  │  master-data.xlsx                   │   │ │         │
│  │  │  │  - Teachers Sheet                   │   │ │         │
│  │  │  │  - Students Sheet                   │   │ │         │
│  │  │  │  - Iqra Attendance Sheets           │   │ │         │
│  │  │  │  - Islamic Studies Attendance       │   │ │         │
│  │  │  └─────────────────────────────────────┘   │ │         │
│  │  │                                              │ │         │
│  │  │  ┌─────────────────────────────────────┐   │ │         │
│  │  │  │  Backup Files (Timestamped)         │   │ │         │
│  │  │  └─────────────────────────────────────┘   │ │         │
│  │  └──────────────────────────────────────────────┘ │         │
│  └─────────────────────────────────────────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Application Flow Diagram

```
┌─────────────┐
│   Landing   │
│    Page     │
│ (ICB Logo)  │
└──────┬──────┘
       │
       ├──────────────────┬──────────────────┐
       │                  │                  │
       ▼                  ▼                  │
┌─────────────┐    ┌─────────────┐          │
│    Iqra     │    │  Islamic    │          │
│  Tracking   │    │   Studies   │          │
└──────┬──────┘    └──────┬──────┘          │
       │                  │                  │
       ├──────────────────┘                  │
       │                                     │
       ▼                                     │
┌─────────────────────────┐                 │
│  Level Selection        │                 │
│  - Kindergarten         │                 │
│  - Levels 1-6           │                 │
│  - Quran (Iqra only)    │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Teacher Selection      │                 │
│  (Dynamic List from     │                 │
│   Excel)                │                 │
└──────────┬──────────────┘                 │
           │                                 │
           ▼                                 │
┌─────────────────────────┐                 │
│  Student Attendance     │◄────────────────┘
│  Interface              │   (Back/Home)
│  - Student List         │
│  - Attendance Checkboxes│
│  - Progress Tracking    │
│  - Bulk Update          │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Submit to Server       │
│  - Validate Data        │
│  - Timestamp            │
│  - Save to Excel        │
└──────────┬──────────────┘
           │
           ▼
┌─────────────────────────┐
│  Success Confirmation   │
│  - Display Results      │
│  - Option to Continue   │
└─────────────────────────┘
```

### Component Architecture Layers

#### 1. **Presentation Layer (React Frontend)**
- User interface components
- Form handling and validation
- Client-side routing
- State management
- User feedback (loading, errors, success messages)

#### 2. **API Layer (Express.js Routes)**
- RESTful endpoints
- Request validation
- Error handling middleware
- CORS configuration
- Rate limiting

#### 3. **Business Logic Layer (Services)**
- Attendance management
- Progress tracking
- Teacher authentication
- Student roster management
- Data aggregation and reporting

#### 4. **Data Access Layer (Excel Integration)**
- Excel file reading/writing
- File locking and synchronization
- Data transformation
- Backup management
- Error recovery

#### 5. **Storage Layer (Excel Files)**
- Master data storage
- Timestamped backups
- Data integrity validation

---

## Data Model & Excel Schema

### Excel Workbook Structure

**File Name:** `master-data.xlsx`  
**Location:** `{PROJECT_ROOT}/data/master-data.xlsx`

The master Excel workbook consists of multiple worksheets organized by function:

#### **Sheet 1: Teachers**

| Column | Field Name    | Type   | Description                          | Example           |
|--------|---------------|--------|--------------------------------------|-------------------|
| A      | TeacherID     | String | Unique identifier (UUID)             | T001              |
| B      | TeacherName   | String | Full name of teacher                 | Ahmed Hassan      |
| C      | Program       | String | Iqra or Islamic Studies or Both      | Both              |
| D      | Level         | String | Level(s) taught (comma-separated)    | 1,2               |
| E      | Active        | Boolean| Active status (TRUE/FALSE)           | TRUE              |
| F      | DateAdded     | Date   | Date teacher was added to system     | 2026-01-15        |

**Sample Data:**
```
TeacherID | TeacherName        | Program         | Level      | Active | DateAdded
----------|-------------------|-----------------|------------|--------|------------
T001      | Ahmed Hassan      | Both            | 1,2        | TRUE   | 2026-01-15
T002      | Fatima Ali        | Iqra            | K,1        | TRUE   | 2026-01-15
T003      | Omar Abdullah     | Islamic Studies | 3,4        | TRUE   | 2026-01-20
T004      | Aisha Mohammed    | Iqra            | Quran      | TRUE   | 2026-01-25
```

#### **Sheet 2: Students**

| Column | Field Name    | Type   | Description                          | Example           |
|--------|---------------|--------|--------------------------------------|-------------------|
| A      | StudentID     | String | Unique identifier (UUID)             | S001              |
| B      | FirstName     | String | Student's first name                 | Yusuf             |
| C      | LastName      | String | Student's last name                  | Ibrahim           |
| D      | Program       | String | Iqra or Islamic Studies              | Iqra              |
| E      | Level         | String | Current level                        | 2                 |
| F      | Active        | Boolean| Active enrollment status             | TRUE              |
| G      | DateEnrolled  | Date   | Enrollment date                      | 2026-01-15        |
| H      | ParentName    | String | Parent/guardian name                 | Ibrahim Ahmed     |
| I      | ParentPhone   | String | Contact phone number                 | (208) 555-1234    |

**Sample Data:**
```
StudentID | FirstName | LastName | Program    | Level | Active | DateEnrolled | ParentName    | ParentPhone
----------|-----------|----------|------------|-------|--------|--------------|---------------|-------------
S001      | Yusuf     | Ibrahim  | Iqra       | 2     | TRUE   | 2026-01-15   | Ibrahim Ahmed | 208-555-1234
S002      | Zahra     | Hassan   | Iqra       | 2     | TRUE   | 2026-01-15   | Hassan Ali    | 208-555-5678
S003      | Maryam    | Omar     | Islamic St.| 3     | TRUE   | 2026-01-20   | Omar Abdullah | 208-555-9012
```

#### **Sheet 3: Iqra_Kindergarten_Attendance**

| Column     | Field Name      | Type    | Description                              | Example           |
|------------|-----------------|---------|------------------------------------------|-------------------|
| A          | StudentID       | String  | Reference to Students sheet              | S001              |
| B          | StudentName     | String  | Full name for readability                | Yusuf Ibrahim     |
| C          | Week_2026-01-05 | String  | Week 1 data: P=Present, A=Absent, Page # | P:5               |
| D          | Week_2026-01-12 | String  | Week 2 data                              | P:7               |
| E          | Week_2026-01-19 | String  | Week 3 data                              | A:-               |
| ...        | ...             | ...     | Continues for each Sunday                | ...               |

**Data Format for Each Week Cell:**
- `P:{pageNumber}` - Present with page/lesson number
- `A:-` - Absent
- Empty - Not yet recorded

**Sample Data:**
```
StudentID | StudentName   | Week_2026-01-05 | Week_2026-01-12 | Week_2026-01-19
----------|---------------|-----------------|-----------------|----------------
S001      | Yusuf Ibrahim | P:5             | P:7             | P:9
S002      | Zahra Hassan  | P:5             | A:-             | P:6
```

#### **Sheet 4-10: Additional Attendance Sheets**

Similar structure for each program/level combination:
- `Iqra_Level1_Attendance`
- `Iqra_Level2_Attendance`
- `Iqra_Level3_Attendance`
- `Iqra_Level4_Attendance`
- `Iqra_Level5_Attendance`
- `Iqra_Level6_Attendance`
- `Iqra_Quran_Attendance`
- `IslamicStudies_Level1_Attendance`
- `IslamicStudies_Level2_Attendance`
- `IslamicStudies_Level3_Attendance`
- `IslamicStudies_Level4_Attendance`
- `IslamicStudies_Level5_Attendance`
- `IslamicStudies_Level6_Attendance`

#### **Sheet: Metadata**

| Column | Field Name         | Type   | Description                          | Example           |
|--------|--------------------|--------|--------------------------------------|-------------------|
| A      | Key                | String | Configuration key                    | LastBackup        |
| B      | Value              | String | Configuration value                  | 2026-02-22 12:00  |
| C      | Description        | String | Human-readable description           | Last backup time  |

**Sample Data:**
```
Key               | Value              | Description
------------------|-------------------|----------------------------------
SchoolYearStart   | 2026-09-01        | Academic year start date
CurrentWeek       | 2026-02-16        | Current Sunday date
LastBackup        | 2026-02-22 12:00  | Last automatic backup timestamp
Version           | 1.0               | Data schema version
```

### Data Validation Rules

1. **TeacherID & StudentID:**
   - Format: `T{3-digit number}` or `S{3-digit number}`
   - Auto-generated, sequential
   - Unique across the sheet

2. **Program Field:**
   - Allowed values: "Iqra", "Islamic Studies", "Both"
   - Case-insensitive validation

3. **Level Field:**
   - For Iqra: K, 1, 2, 3, 4, 5, 6, Quran
   - For Islamic Studies: 1, 2, 3, 4, 5, 6
   - Multiple levels comma-separated for teachers

4. **Attendance Format:**
   - Present: `P:{number}` where number is page/lesson (1-999)
   - Absent: `A:-`
   - Empty cell: No data recorded yet

5. **Date Fields:**
   - ISO 8601 format: YYYY-MM-DD
   - Validated on input
   - Week columns use Sunday's date

6. **Phone Numbers:**
   - Format: (XXX) XXX-XXXX or XXX-XXX-XXXX
   - Optional field

### Entity Relationship Model

```
┌─────────────────┐            ┌─────────────────┐
│    Teachers     │            │    Students     │
├─────────────────┤            ├─────────────────┤
│ TeacherID (PK)  │            │ StudentID (PK)  │
│ TeacherName     │            │ FirstName       │
│ Program         │            │ LastName        │
│ Level           │            │ Program         │
│ Active          │            │ Level           │
│ DateAdded       │            │ Active          │
└────────┬────────┘            │ DateEnrolled    │
         │                     │ ParentName      │
         │                     │ ParentPhone     │
         │                     └────────┬────────┘
         │                              │
         │                              │
         │     ┌────────────────────────┘
         │     │
         │     │
         ▼     ▼
┌─────────────────────────────┐
│  Attendance Records         │
│  (Multiple Sheets by        │
│   Program/Level)            │
├─────────────────────────────┤
│ StudentID (FK)              │
│ StudentName                 │
│ Week_YYYY-MM-DD (repeating) │
│   - Format: P:# or A:-      │
└─────────────────────────────┘
```

### Backup Strategy

**Automatic Backups:**
- Created before any write operation
- Stored in `{PROJECT_ROOT}/data/backups/`
- Naming convention: `master-data_YYYYMMDD_HHMMSS.xlsx`
- Retention: Keep last 30 backups, delete older ones
- Backup triggered on:
  - Attendance submission
  - Student/teacher data modification
  - Manual backup request

**Manual Backups:**
- Admin interface to create on-demand backup
- Export specific sheets or date ranges
- Download capability for external storage

---

## API Specifications

### Base URL
```
http://{SERVER_IP}:5000/api/v1
```

### API Endpoints

#### **1. Teachers API**

##### GET `/teachers`
Get all active teachers or filtered by program/level.

**Query Parameters:**
- `program` (optional): Filter by program (iqra, islamic-studies)
- `level` (optional): Filter by level (k, 1-6, quran)

**Request:**
```http
GET /api/v1/teachers?program=iqra&level=2
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "teacherId": "T001",
      "teacherName": "Ahmed Hassan",
      "program": "Both",
      "levels": ["1", "2"],
      "active": true,
      "dateAdded": "2026-01-15"
    },
    {
      "teacherId": "T002",
      "teacherName": "Fatima Ali",
      "program": "Iqra",
      "levels": ["K", "1"],
      "active": true,
      "dateAdded": "2026-01-15"
    }
  ],
  "count": 2,
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

##### POST `/teachers`
Create a new teacher record.

**Request Body:**
```json
{
  "teacherName": "Omar Abdullah",
  "program": "Islamic Studies",
  "levels": ["3", "4"],
  "active": true
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "teacherId": "T003",
    "teacherName": "Omar Abdullah",
    "program": "Islamic Studies",
    "levels": ["3", "4"],
    "active": true,
    "dateAdded": "2026-02-22"
  },
  "message": "Teacher created successfully"
}
```

#### **2. Students API**

##### GET `/students`
Get all active students or filtered by program/level.

**Query Parameters:**
- `program` (required): iqra or islamic-studies
- `level` (required): k, 1-6, or quran
- `activeOnly` (optional, default: true): Filter active students only

**Request:**
```http
GET /api/v1/students?program=iqra&level=2
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "studentId": "S001",
      "firstName": "Yusuf",
      "lastName": "Ibrahim",
      "fullName": "Yusuf Ibrahim",
      "program": "Iqra",
      "level": "2",
      "active": true,
      "dateEnrolled": "2026-01-15",
      "parentName": "Ibrahim Ahmed",
      "parentPhone": "208-555-1234"
    },
    {
      "studentId": "S002",
      "firstName": "Zahra",
      "lastName": "Hassan",
      "fullName": "Zahra Hassan",
      "program": "Iqra",
      "level": "2",
      "active": true,
      "dateEnrolled": "2026-01-15",
      "parentName": "Hassan Ali",
      "parentPhone": "208-555-5678"
    }
  ],
  "count": 2,
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

##### POST `/students`
Create a new student record.

**Request Body:**
```json
{
  "firstName": "Maryam",
  "lastName": "Omar",
  "program": "Islamic Studies",
  "level": "3",
  "active": true,
  "parentName": "Omar Abdullah",
  "parentPhone": "208-555-9012"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "studentId": "S003",
    "firstName": "Maryam",
    "lastName": "Omar",
    "fullName": "Maryam Omar",
    "program": "Islamic Studies",
    "level": "3",
    "active": true,
    "dateEnrolled": "2026-02-22",
    "parentName": "Omar Abdullah",
    "parentPhone": "208-555-9012"
  },
  "message": "Student created successfully"
}
```

#### **3. Attendance API**

##### GET `/attendance`
Get attendance records for specific program/level/date.

**Query Parameters:**
- `program` (required): iqra or islamic-studies
- `level` (required): k, 1-6, or quran
- `date` (optional): Specific Sunday date (YYYY-MM-DD), defaults to current week

**Request:**
```http
GET /api/v1/attendance?program=iqra&level=2&date=2026-02-16
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "program": "Iqra",
    "level": "2",
    "weekDate": "2026-02-16",
    "records": [
      {
        "studentId": "S001",
        "studentName": "Yusuf Ibrahim",
        "status": "present",
        "pageNumber": 15
      },
      {
        "studentId": "S002",
        "studentName": "Zahra Hassan",
        "status": "absent",
        "pageNumber": null
      }
    ]
  },
  "count": 2,
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

##### POST `/attendance/submit`
Submit attendance and progress data for multiple students.

**Request Body:**
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
    },
    {
      "studentId": "S003",
      "status": "present",
      "pageNumber": 12
    }
  ]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "recordsProcessed": 3,
    "recordsSuccessful": 3,
    "recordsFailed": 0,
    "weekDate": "2026-02-16",
    "timestamp": "2026-02-22T19:15:30.000Z"
  },
  "message": "Attendance submitted successfully"
}
```

##### POST `/attendance/bulk-update`
Update page numbers for multiple checked students at once.

**Request Body:**
```json
{
  "program": "Iqra",
  "level": "2",
  "weekDate": "2026-02-16",
  "studentIds": ["S001", "S003", "S005"],
  "pageNumber": 20
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "studentsUpdated": 3,
    "pageNumber": 20,
    "timestamp": "2026-02-22T19:20:00.000Z"
  },
  "message": "Bulk update completed successfully"
}
```

#### **4. Configuration API**

##### GET `/config/current-week`
Get the current Sunday date for the week.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "currentWeek": "2026-02-16",
    "schoolYearStart": "2026-09-01",
    "weekNumber": 20
  },
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

##### POST `/config/backup`
Trigger manual backup of the master Excel file.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "backupFile": "master-data_20260222_190000.xlsx",
    "backupPath": "./data/backups/master-data_20260222_190000.xlsx",
    "timestamp": "2026-02-22T19:00:00.000Z"
  },
  "message": "Backup created successfully"
}
```

#### **5. Health Check API**

##### GET `/health`
Check server and Excel file status.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "excelFileAccessible": true,
    "lastBackup": "2026-02-22T12:00:00.000Z",
    "serverUptime": 86400,
    "activeConnections": 5
  },
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

### Error Response Format

All API errors follow this structure:

**Response (4xx or 5xx):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid program specified",
    "details": {
      "field": "program",
      "value": "invalid-program",
      "allowedValues": ["iqra", "islamic-studies"]
    }
  },
  "timestamp": "2026-02-22T19:00:00.000Z"
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Invalid request parameters
- `NOT_FOUND` - Resource not found
- `FILE_LOCK_ERROR` - Excel file is locked by another operation
- `EXCEL_READ_ERROR` - Failed to read Excel file
- `EXCEL_WRITE_ERROR` - Failed to write to Excel file
- `INTERNAL_SERVER_ERROR` - Unexpected server error
- `RATE_LIMIT_EXCEEDED` - Too many requests

### API Security Headers

All responses include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

### Rate Limiting

- **General endpoints:** 100 requests per minute per IP
- **Attendance submission:** 30 requests per minute per IP
- **Bulk updates:** 10 requests per minute per IP

---

## Frontend Architecture

### Component Hierarchy

```
App
├── Router
│   ├── LandingPage
│   │   └── ProgramSelector (Iqra / Islamic Studies)
│   │
│   ├── LevelSelectionPage
│   │   ├── Header (with Back button)
│   │   └── LevelGrid
│   │       └── LevelCard (K, 1-6, Quran)
│   │
│   ├── TeacherSelectionPage
│   │   ├── Header (with Back button)
│   │   └── TeacherList
│   │       └── TeacherCard
│   │
│   ├── AttendancePage
│   │   ├── Header (Session Info, Back button)
│   │   ├── StudentList
│   │   │   └── StudentRow
│   │   │       ├── AttendanceCheckbox
│   │   │       └── ProgressInput (page number)
│   │   ├── BulkUpdatePanel
│   │   │   ├── PageNumberInput
│   │   │   └── BulkUpdateButton
│   │   └── SubmitButton
│   │
│   └── ConfirmationPage
│       ├── SuccessMessage
│       ├── SummaryStats
│       └── NavigationButtons (Home / Continue)
│
├── Shared Components
│   ├── Header
│   ├── LoadingSpinner
│   ├── ErrorAlert
│   ├── SuccessAlert
│   └── ConfirmationDialog
│
└── Context Providers
    ├── AppStateContext (Global state)
    ├── ThemeContext (ICB branding)
    └── NotificationContext (Alerts & messages)
```

### Routing Structure

```typescript
// Route Configuration
const routes = [
  {
    path: '/',
    element: <LandingPage />,
    exact: true
  },
  {
    path: '/level-selection',
    element: <LevelSelectionPage />,
    // Query params: ?program=iqra or ?program=islamic-studies
  },
  {
    path: '/teacher-selection',
    element: <TeacherSelectionPage />,
    // Query params: ?program=iqra&level=2
  },
  {
    path: '/attendance',
    element: <AttendancePage />,
    // Query params: ?program=iqra&level=2&teacherId=T001
  },
  {
    path: '/confirmation',
    element: <ConfirmationPage />,
    // State passed via navigation
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
];
```

### State Management Structure

#### **AppStateContext**

```typescript
interface AppState {
  // Session data
  selectedProgram: 'iqra' | 'islamic-studies' | null;
  selectedLevel: string | null; // 'K', '1'-'6', 'Quran'
  selectedTeacher: Teacher | null;
  currentWeek: string; // ISO date of current Sunday
  
  // Student data
  students: Student[];
  
  // Attendance data
  attendanceRecords: Map<string, AttendanceRecord>; // studentId -> record
  
  // UI state
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setProgram: (program: string) => void;
  setLevel: (level: string) => void;
  setTeacher: (teacher: Teacher) => void;
  loadStudents: () => Promise<void>;
  updateAttendance: (studentId: string, data: AttendanceData) => void;
  submitAttendance: () => Promise<void>;
  resetSession: () => void;
}
```

#### **NotificationContext**

```typescript
interface NotificationState {
  notifications: Notification[];
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  clearNotification: (id: string) => void;
  clearAll: () => void;
}
```

### Key Component Specifications

#### **1. LandingPage Component**

**Purpose:** Entry point with ICB logo and program selection

**Props:** None

**Features:**
- Display ICB logo prominently
- Two large, touch-friendly buttons for program selection
- Responsive layout (mobile, tablet, desktop)

**User Actions:**
- Click "Iqra Tracking" → Navigate to level selection (program=iqra)
- Click "Islamic Studies Tracking" → Navigate to level selection (program=islamic-studies)

#### **2. LevelSelectionPage Component**

**Purpose:** Select class level

**Props:** 
- `program` (from query params or context)

**Features:**
- Display program name in header
- Grid layout of level cards
- Different level options based on program:
  - Iqra: K, 1, 2, 3, 4, 5, 6, Quran
  - Islamic Studies: 1, 2, 3, 4, 5, 6

**User Actions:**
- Click level card → Navigate to teacher selection
- Click back → Return to landing page

#### **3. TeacherSelectionPage Component**

**Purpose:** Authenticate teacher for session

**Props:**
- `program` (from context)
- `level` (from context)

**Features:**
- Fetch teachers dynamically from API filtered by program/level
- Display as list or grid of cards
- Show teacher name clearly
- Loading state while fetching data

**User Actions:**
- Click teacher card → Navigate to attendance page with teacher set
- Click back → Return to level selection

#### **4. AttendancePage Component**

**Purpose:** Main interface for marking attendance and tracking progress

**Props:**
- `program`, `level`, `teacher` (from context)

**Features:**
- **Header Section:**
  - Display session info (Program, Level, Teacher, Date)
  - Back button to teacher selection
  - Current week display
  
- **Student List Section:**
  - Load students for selected program/level
  - Scrollable list if many students
  - Each row shows:
    - Student name
    - Attendance checkbox
    - Page/lesson number input (enabled only if present)
  - Real-time validation of page numbers (positive integers only)
  
- **Bulk Update Panel:**
  - Input field for page number
  - "Update All Checked" button
  - Disabled if no students checked
  
- **Submit Section:**
  - Submit button (disabled until at least one record)
  - Confirmation dialog before submission
  - Loading state during submission

**User Actions:**
- Check/uncheck attendance → Enable/disable page input for that student
- Enter page number → Update individual student progress
- Enter bulk page number and click update → Update all checked students
- Click submit → Confirm and submit to server
- Successful submission → Navigate to confirmation page

#### **5. ConfirmationPage Component**

**Purpose:** Display submission results and next actions

**Props:**
- `submissionResult` (from navigation state)

**Features:**
- Success icon and message
- Summary statistics:
  - Total students processed
  - Students marked present
  - Students marked absent
  - Average page number (if applicable)
- Navigation options:
  - "Return Home" → Reset session, go to landing
  - "Continue with Same Class" → Return to attendance page, keep session

### Responsive Design Breakpoints

```css
/* Mobile: < 600px */
- Single column layout
- Full-width components
- Larger touch targets (minimum 48x48px)
- Stacked navigation

/* Tablet: 600px - 1024px */
- Two-column grid for level selection
- Comfortable spacing
- Optimized for touch

/* Desktop: > 1024px */
- Multi-column layouts where appropriate
- Keyboard navigation support
- Mouse hover states
```

### Styling and Theming

**Color Palette:**
```typescript
const theme = {
  primary: '#1B5E20',      // Islamic green (primary buttons, headers)
  secondary: '#FFB300',    // Gold accent (highlights, active states)
  background: '#F5F5F5',   // Light gray (page background)
  surface: '#FFFFFF',      // White (cards, panels)
  error: '#D32F2F',        // Red (errors, validation)
  success: '#388E3C',      // Green (success messages)
  text: {
    primary: '#212121',    // Dark gray (main text)
    secondary: '#757575',  // Medium gray (secondary text)
    disabled: '#BDBDBD',   // Light gray (disabled text)
  }
};
```

**Typography:**
- Font Family: 'Roboto', 'Arial', sans-serif
- Headings: Bold, larger sizes (H1: 32px, H2: 24px, H3: 18px)
- Body: Regular, 16px (14px on mobile)
- Button Text: Medium weight, uppercase, 14px

---

## Concurrency & Data Integrity Strategy

### Challenge Overview

With 10-20 concurrent teachers potentially submitting attendance simultaneously, we need robust strategies to prevent:
- Data corruption from simultaneous Excel writes
- Lost updates (one teacher's submission overwriting another's)
- Race conditions in file access
- Inconsistent state between server memory and Excel file

### Solution Architecture

#### **1. File Locking Mechanism**

**Implementation:** Using `proper-lockfile` library

```typescript
// Pseudo-code for file locking
async function writeToExcel(data) {
  const lockFile = 'data/master-data.xlsx.lock';
  
  // Acquire exclusive lock (blocks until available)
  const release = await lockfile.lock(lockFile, {
    retries: {
      retries: 10,
      minTimeout: 100,
      maxTimeout: 2000
    },
    stale: 10000 // Lock expires after 10 seconds
  });
  
  try {
    // Critical section - exclusive access to Excel file
    await performExcelOperation(data);
  } finally {
    // Always release lock
    await release();
  }
}
```

**Benefits:**
- Prevents concurrent writes
- Automatic retry with exponential backoff
- Stale lock detection prevents deadlocks
- Cross-process lock support

#### **2. Operation Queuing**

**Implementation:** In-memory queue for write operations

```typescript
// Write operation queue
class ExcelWriteQueue {
  private queue: Array<WriteOperation> = [];
  private processing: boolean = false;
  
  async enqueue(operation: WriteOperation): Promise<Result> {
    return new Promise((resolve, reject) => {
      this.queue.push({ operation, resolve, reject });
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const { operation, resolve, reject } = this.queue.shift();
      
      try {
        const result = await this.executeWithLock(operation);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    
    this.processing = false;
  }
  
  private async executeWithLock(operation: WriteOperation): Promise<Result> {
    // Acquire lock, execute, release lock
    // Implementation from section 1
  }
}
```

**Benefits:**
- Serializes write operations
- Maintains FIFO order
- Prevents lock contention
- Returns promises for async handling

#### **3. Optimistic Locking with Versioning**

**Implementation:** Track sheet version/timestamp

```typescript
// Metadata sheet tracking
interface SheetMetadata {
  sheetName: string;
  lastModified: string; // ISO timestamp
  modifiedBy: string;   // TeacherID
  version: number;      // Incremental version
}

async function submitAttendance(data: AttendanceSubmission) {
  // 1. Read current version
  const currentVersion = await getSheetVersion(data.sheetName);
  
  // 2. Acquire lock and read sheet
  const release = await acquireLock();
  try {
    const latestVersion = await getSheetVersion(data.sheetName);
    
    // 3. Check if version changed (conflict detection)
    if (latestVersion > currentVersion) {
      throw new ConflictError('Sheet modified by another user');
    }
    
    // 4. Write data
    await writeAttendanceData(data);
    
    // 5. Increment version
    await updateSheetVersion(data.sheetName, latestVersion + 1, data.teacherId);
  } finally {
    await release();
  }
}
```

**Benefits:**
- Detects conflicts before writing
- Prevents silent data loss
- Provides user feedback on conflicts
- Allows retry with fresh data

#### **4. Automatic Backup Before Write**

**Implementation:** Snapshot before modification

```typescript
async function safeWrite(operation: WriteOperation): Promise<Result> {
  // 1. Create timestamped backup
  const backupPath = await createBackup('master-data.xlsx');
  
  try {
    // 2. Perform write operation
    const result = await performWrite(operation);
    
    // 3. Verify write success
    await verifyDataIntegrity();
    
    return result;
  } catch (error) {
    // 4. Restore from backup on failure
    await restoreFromBackup(backupPath);
    throw error;
  }
}
```

**Benefits:**
- Point-in-time recovery
- Protection against corruption
- Audit trail of changes
- Disaster recovery capability

#### **5. Cell-Level Granularity**

**Strategy:** Write to specific cells, not entire sheets

```typescript
async function updateAttendanceCell(
  studentId: string,
  weekDate: string,
  value: string
): Promise<void> {
  const sheetName = getSheetName(program, level);
  const cellAddress = calculateCellAddress(studentId, weekDate);
  
  await writeQueue.enqueue({
    type: 'CELL_UPDATE',
    sheetName,
    cellAddress,
    value,
    timestamp: new Date().toISOString()
  });
}
```

**Benefits:**
- Minimizes write scope
- Reduces lock time
- Lower conflict probability
- Faster operations

#### **6. Read Caching Strategy**

**Implementation:** Cache read-only data with TTL

```typescript
class ExcelCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 60000; // 1 minute
  
  async get(key: string): Promise<any> {
    const entry = this.cache.get(key);
    
    if (entry && (Date.now() - entry.timestamp) < this.TTL) {
      return entry.data; // Cache hit
    }
    
    // Cache miss - fetch from Excel
    const data = await readFromExcel(key);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  invalidate(key: string): void {
    this.cache.delete(key);
  }
}
```

**Benefits:**
- Reduces Excel file reads
- Faster response times
- Lower file system load
- Configurable freshness

#### **7. Transaction Log**

**Implementation:** Append-only log of operations

```typescript
interface TransactionLogEntry {
  id: string;
  timestamp: string;
  teacherId: string;
  operation: 'ATTENDANCE_SUBMIT' | 'BULK_UPDATE' | 'STUDENT_ADD';
  data: any;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  error?: string;
}

async function logTransaction(entry: TransactionLogEntry): Promise<void> {
  // Append to transaction log file (JSON lines format)
  await appendToFile('data/transaction-log.jsonl', JSON.stringify(entry) + '\n');
}
```

**Benefits:**
- Audit trail of all changes
- Debugging aid
- Recovery from logs if needed
- Performance analytics

### Concurrency Flow Diagram

```
Teacher 1               Teacher 2               Server Queue            Excel File
    │                       │                         │                      │
    │─Submit Attendance────>│                         │                      │
    │                       │─Submit Attendance──────>│                      │
    │                       │                         │                      │
    │                       │                    ┌────▼────┐                │
    │                       │                    │ Queue   │                │
    │                       │                    │ Op1, Op2│                │
    │                       │                    └────┬────┘                │
    │                       │                         │                      │
    │                       │                    Process Op1                 │
    │                       │                         │                      │
    │                       │                         │──Acquire Lock───────>│
    │                       │                         │<─Lock Acquired───────│
    │                       │                         │                      │
    │                       │                         │──Create Backup──────>│
    │                       │                         │<─Backup Created──────│
    │                       │                         │                      │
    │                       │                         │──Write Data─────────>│
    │                       │                         │<─Write Success───────│
    │                       │                         │                      │
    │<─Success Response─────│                         │──Release Lock───────>│
    │                       │                         │                      │
    │                       │                    Process Op2                 │
    │                       │                         │                      │
    │                       │                         │──Acquire Lock───────>│
    │                       │                         │<─Lock Acquired───────│
    │                       │                         │                      │
    │                       │                         │──Create Backup──────>│
    │                       │                         │<─Backup Created──────│
    │                       │                         │                      │
    │                       │                         │──Write Data─────────>│
    │                       │                         │<─Write Success───────│
    │                       │                         │                      │
    │                       │<─Success Response───────│──Release Lock───────>│
    │                       │                         │                      │
```

### Error Handling & Recovery

**Retry Strategy:**
```typescript
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}
```

**Conflict Resolution:**
- Detect conflicts using version checking
- Notify user of conflict
- Offer to retry with latest data
- Option to view conflicting changes
- Manual resolution if necessary

---

## Project File Structure

```
icb-sunday-school/
│
├── backend/                          # Node.js/Express backend
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── server.config.ts      # Server settings (port, CORS, etc.)
│   │   │   ├── excel.config.ts       # Excel file paths and settings
│   │   │   └── logger.config.ts      # Winston logger configuration
│   │   │
│   │   ├── controllers/              # Route controllers
│   │   │   ├── teachers.controller.ts
│   │   │   ├── students.controller.ts
│   │   │   ├── attendance.controller.ts
│   │   │   └── config.controller.ts
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── teacher.service.ts
│   │   │   ├── student.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   ├── excel.service.ts      # Excel read/write operations
│   │   │   ├── backup.service.ts     # Backup management
│   │   │   ├── lock.service.ts       # File locking
│   │   │   └── validation.service.ts # Data validation
│   │   │
│   │   ├── models/                   # TypeScript interfaces/types
│   │   │   ├── teacher.model.ts
│   │   │   ├── student.model.ts
│   │   │   ├── attendance.model.ts
│   │   │   └── api-response.model.ts
│   │   │
│   │   ├── routes/                   # API route definitions
│   │   │   ├── index.ts              # Route aggregator
│   │   │   ├── teachers.routes.ts
│   │   │   ├── students.routes.ts
│   │   │   ├── attendance.routes.ts
│   │   │   └── config.routes.ts
│   │   │
│   │   ├── middleware/               # Express middleware
│   │   │   ├── error-handler.ts      # Global error handling
│   │   │   ├── request-logger.ts     # Request logging
│   │   │   ├── rate-limiter.ts       # Rate limiting
│   │   │   ├── validator.ts          # Request validation
│   │   │   └── cors.ts               # CORS configuration
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── date-utils.ts         # Date formatting, Sunday calculation
│   │   │   ├── excel-utils.ts        # Excel helper functions
│   │   │   ├── id-generator.ts       # UUID/ID generation
│   │   │   └── logger.ts             # Logger instance
│   │   │
│   │   ├── types/                    # Custom type declarations
│   │   │   └── express.d.ts          # Extended Express types
│   │   │
│   │   ├── app.ts                    # Express app configuration
│   │   └── server.ts                 # Server entry point
│   │
│   ├── tests/                        # Backend tests
│   │   ├── unit/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── integration/
│   │   │   └── api/
│   │   └── fixtures/                 # Test data
│   │       └── sample-data.xlsx
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env                          # Environment variables (gitignored)
│
├── frontend/                         # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── assets/
│   │       └── icb-logo.png          # ICB logo
│   │
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── Layout.tsx
│   │   │   │
│   │   │   ├── common/               # Shared components
│   │   │   │   ├── LoadingSpinner.tsx
│   │   │   │   ├── ErrorAlert.tsx
│   │   │   │   ├── SuccessAlert.tsx
│   │   │   │   ├── ConfirmDialog.tsx
│   │   │   │   └── Button.tsx
│   │   │   │
│   │   │   ├── landing/
│   │   │   │   ├── LandingPage.tsx
│   │   │   │   └── ProgramSelector.tsx
│   │   │   │
│   │   │   ├── level/
│   │   │   │   ├── LevelSelectionPage.tsx
│   │   │   │   ├── LevelGrid.tsx
│   │   │   │   └── LevelCard.tsx
│   │   │   │
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherSelectionPage.tsx
│   │   │   │   ├── TeacherList.tsx
│   │   │   │   └── TeacherCard.tsx
│   │   │   │
│   │   │   ├── attendance/
│   │   │   │   ├── AttendancePage.tsx
│   │   │   │   ├── SessionHeader.tsx
│   │   │   │   ├── StudentList.tsx
│   │   │   │   ├── StudentRow.tsx
│   │   │   │   ├── BulkUpdatePanel.tsx
│   │   │   │   └── SubmitPanel.tsx
│   │   │   │
│   │   │   └── confirmation/
│   │   │       ├── ConfirmationPage.tsx
│   │   │       ├── SummaryStats.tsx
│   │   │       └── NavigationButtons.tsx
│   │   │
│   │   ├── context/                  # React Context providers
│   │   │   ├── AppStateContext.tsx
│   │   │   ├── ThemeContext.tsx
│   │   │   └── NotificationContext.tsx
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── useAppState.ts
│   │   │   ├── useNotification.ts
│   │   │   ├── useTeachers.ts
│   │   │   ├── useStudents.ts
│   │   │   └── useAttendance.ts
│   │   │
│   │   ├── services/                 # API service layer
│   │   │   ├── api.ts                # Axios instance configuration
│   │   │   ├── teachers.service.ts
│   │   │   ├── students.service.ts
│   │   │   ├── attendance.service.ts
│   │   │   └── config.service.ts
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   ├── teacher.types.ts
│   │   │   ├── student.types.ts
│   │   │   ├── attendance.types.ts
│   │   │   └── api.types.ts
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── date-utils.ts
│   │   │   ├── validators.ts
│   │   │   └── formatters.ts
│   │   │
│   │   ├── styles/                   # Global styles
│   │   │   ├── theme.ts              # MUI theme configuration
│   │   │   ├── global.css
│   │   │   └── variables.css
│   │   │
│   │   ├── App.tsx                   # Root component
│   │   ├── main.tsx                  # Entry point
│   │   └── vite-env.d.ts             # Vite type declarations
│   │
│   ├── tests/                        # Frontend tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   │
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
│
├── data/                             # Excel data storage
│   ├── master-data.xlsx              # Main data file
│   ├── backups/                      # Automatic backups
│   │   └── master-data_YYYYMMDD_HHMMSS.xlsx
│   ├── templates/                    # Excel templates
│   │   └── master-data-template.xlsx
│   └── transaction-log.jsonl         # Transaction audit log
│
├── docs/                             # Documentation
│   ├── api-documentation.md          # API reference
│   ├── setup-guide.md                # Installation instructions
│   ├── user-manual.md                # End-user guide
│   └── developer-guide.md            # Development guidelines
│
├── scripts/                          # Utility scripts
│   ├── setup-data.js                 # Initialize Excel file structure
│   ├── backup-restore.js             # Backup/restore utilities
│   ├── seed-data.js                  # Seed sample data for testing
│   └── deploy.js                     # Deployment script
│
├── .gitignore
├── README.md                         # Project overview
├── CHANGELOG.md                      # Version history
└── LICENSE                           # License information
```

### Key File Descriptions

#### **Backend Key Files**

**[`server.ts`](backend/src/server.ts):**
- Application entry point
- Starts Express server
- Initializes services
- Handles graceful shutdown

**[`excel.service.ts`](backend/src/services/excel.service.ts):**
- Core Excel operations (read, write, update)
- Workbook and worksheet management
- Cell manipulation
- Data validation

**[`lock.service.ts`](backend/src/services/lock.service.ts):**
- File locking implementation
- Lock acquisition and release
- Stale lock detection
- Queue management

**[`attendance.service.ts`](backend/src/services/attendance.service.ts):**
- Attendance business logic
- Record validation
- Bulk updates
- Data aggregation

#### **Frontend Key Files**

**[`App.tsx`](frontend/src/App.tsx):**
- Root component
- Router configuration
- Global providers
- Error boundaries

**[`AppStateContext.tsx`](frontend/src/context/AppStateContext.tsx):**
- Global state management
- Session data
- State actions
- Context provider

**[`AttendancePage.tsx`](frontend/src/components/attendance/AttendancePage.tsx):**
- Main attendance interface
- Student list rendering
- Bulk operations
- Form submission

**[`api.ts`](frontend/src/services/api.ts):**
- Axios instance
- Request/response interceptors
- Error handling
- Base URL configuration

---

## Security Considerations

### Local Network Security

Since this application operates on a local network (LAN), security considerations focus on:

#### **1. Network Access Control**

**Firewall Configuration:**
- Open only required port (5000 for API)
- Restrict access to local network subnet (e.g., 192.168.1.0/24)
- Block external WAN access to the server

**Network Isolation:**
- Server should not be directly accessible from internet
- Use router NAT to isolate internal network
- Consider VLAN for Sunday School devices if network supports it

#### **2. Authentication & Authorization**

**Teacher Authentication:**
- Selection-based authentication (sufficient for trusted local network)
- No passwords required (reduces friction)
- Teacher list dynamically loaded from Excel
- Session-based tracking of who submitted what

**Future Enhancements (Optional):**
- PIN-based authentication for teachers
- Admin interface with password protection
- Role-based access control (teacher vs. admin)

#### **3. Data Protection**

**Excel File Security:**
- File system permissions: Read/write only by server process user
- No direct Excel file access from network shares
- Automatic backups with retention policy
- Transaction logging for audit trail

**Sensitive Data:**
- Parent phone numbers in Excel (minimal exposure)
- No highly sensitive data (no SSNs, payment info, etc.)
- Regular backups stored securely

#### **4. Application Security**

**Input Validation:**
- Server-side validation of all inputs
- Type checking with TypeScript
- Sanitization of user inputs
- Prevention of injection attacks

**HTTP Security Headers:**
```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // For MUI
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
})
```

**CORS Configuration:**
```javascript
cors({
  origin: ['http://localhost:3000', 'http://192.168.1.*'], // Adjust for local network
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

**Rate Limiting:**
- Prevent abuse of API endpoints
- Different limits for different endpoint types
- IP-based rate limiting

#### **5. Error Handling**

**Secure Error Messages:**
- Don't expose internal file paths
- Generic error messages to clients
- Detailed logging server-side only
- Stack traces only in development mode

**Logging:**
```javascript
// Winston logger configuration
logger.error({
  message: 'Excel write failed',
  error: error.message,
  teacherId: teacher.id,
  timestamp: new Date().toISOString(),
  // Don't log sensitive data
});
```

#### **6. Backup & Recovery**

**Backup Security:**
- Automatic backups before each write
- Timestamped backup files
- 30-day retention policy
- Backup directory restricted access
- Option to export backups to external USB drive

**Disaster Recovery:**
- Document backup restore procedure
- Test restore process regularly
- Keep offline backups weekly
- Recovery plan documentation

#### **7. System Hardening**

**Windows Server Configuration:**
- Keep Windows updated
- Enable Windows Defender
- Disable unnecessary services
- User account with minimal privileges for server process
- Enable Windows Firewall with specific port rules

**Node.js Security:**
- Use LTS version of Node.js
- Keep dependencies updated
- Regular `npm audit` checks
- Remove dev dependencies in production

#### **8. Physical Security**

**Server PC Protection:**
- Server PC in secure location (office/storage room)
- Physical access restricted to authorized personnel
- Screen lock when unattended
- Backup storage in separate secure location

### Security Best Practices

1. **Regular Updates:**
   - Keep all dependencies up to date
   - Monitor security advisories
   - Apply Windows security patches

2. **Access Logs:**
   - Log all API requests with IP and timestamp
   - Monitor for unusual patterns
   - Review logs periodically

3. **Data Validation:**
   - Validate all inputs on server side
   - Type checking with TypeScript
   - Sanitize data before Excel operations

4. **Secure Configuration:**
   - Use environment variables for sensitive config
   - Don't commit `.env` file
   - Rotate secrets if exposed

5. **Monitoring:**
   - Monitor server resource usage
   - Alert on errors or failures
   - Health check endpoint for monitoring

---

## Development Phases

### Phase 1: Foundation & Setup
**Objective:** Set up development environment and core infrastructure

**Tasks:**
- [ ] Initialize Git repository and version control
- [ ] Set up project directory structure
- [ ] Configure backend (Node.js, Express, TypeScript)
- [ ] Configure frontend (React, Vite, TypeScript)
- [ ] Install and configure dependencies
- [ ] Set up ESLint, Prettier for code quality
- [ ] Create Excel template structure with all sheets
- [ ] Configure environment variables
- [ ] Set up basic logging infrastructure

**Deliverables:**
- Project skeleton with all directories
- Running dev servers (frontend & backend)
- Excel template file with proper structure
- Basic README with setup instructions

**Dependencies:** None

---

### Phase 2: Backend Core - Excel Integration
**Objective:** Implement Excel reading and writing capabilities

**Tasks:**
- [ ] Implement Excel service with ExcelJS
  - [ ] Read workbook and worksheets
  - [ ] Read specific cells and ranges
  - [ ] Write data to cells
  - [ ] Create new sheets dynamically
- [ ] Implement file locking service
  - [ ] Lock acquisition and release
  - [ ] Queue management
  - [ ] Error handling
- [ ] Implement backup service
  - [ ] Create timestamped backups
  - [ ] Restore from backup
  - [ ] Cleanup old backups
- [ ] Implement data validation utilities
- [ ] Write unit tests for Excel operations

**Deliverables:**
- Working Excel service with full CRUD operations
- File locking system preventing concurrent writes
- Automatic backup before write operations
- Unit tests with >80% coverage

**Dependencies:** Phase 1 complete

---

### Phase 3: Backend API - Teachers & Students
**Objective:** Implement API endpoints for teacher and student data

**Tasks:**
- [ ] Create data models (TypeScript interfaces)
- [ ] Implement teacher service
  - [ ] Get all teachers
  - [ ] Filter teachers by program/level
  - [ ] Add new teacher
- [ ] Implement student service
  - [ ] Get all students
  - [ ] Filter students by program/level
  - [ ] Add new student
- [ ] Create API routes and controllers
- [ ] Implement request validation middleware
- [ ] Add error handling middleware
- [ ] Write integration tests for APIs

**Deliverables:**
- RESTful API endpoints for teachers
- RESTful API endpoints for students
- Request validation and error handling
- API integration tests

**Dependencies:** Phase 2 complete

---

### Phase 4: Backend API - Attendance
**Objective:** Implement attendance submission and retrieval

**Tasks:**
- [ ] Implement attendance service
  - [ ] Get attendance for program/level/week
  - [ ] Submit attendance records
  - [ ] Bulk update functionality
  - [ ] Calculate summary statistics
- [ ] Create attendance routes and controllers
- [ ] Implement transaction logging
- [ ] Add versioning for conflict detection
- [ ] Implement retry logic for operations
- [ ] Write integration tests for attendance APIs

**Deliverables:**
- Attendance submission endpoint
- Bulk update endpoint
- Attendance retrieval endpoint
- Transaction logging system
- Integration tests

**Dependencies:** Phase 3 complete

---

### Phase 5: Frontend Core - Routing & State
**Objective:** Set up frontend architecture and navigation

**Tasks:**
- [ ] Configure React Router
- [ ] Create route definitions
- [ ] Implement AppStateContext
  - [ ] State structure
  - [ ] State actions
  - [ ] Context provider
- [ ] Implement NotificationContext
- [ ] Create custom hooks
  - [ ] useAppState
  - [ ] useNotification
  - [ ] useTeachers
  - [ ] useStudents
  - [ ] useAttendance
- [ ] Configure MUI theme with ICB branding
- [ ] Create layout components (Header, Layout)

**Deliverables:**
- Working routing system
- Global state management
- Custom hooks for API integration
- Themed UI framework
- Layout components

**Dependencies:** Phase 1 complete

---

### Phase 6: Frontend UI - Landing & Selection
**Objective:** Build landing page and selection interfaces

**Tasks:**
- [ ] Create LandingPage component
  - [ ] ICB logo display
  - [ ] Program selection buttons
  - [ ] Responsive design
- [ ] Create LevelSelectionPage component
  - [ ] Level grid layout
  - [ ] Level cards
  - [ ] Back navigation
- [ ] Create TeacherSelectionPage component
  - [ ] Fetch teachers from API
  - [ ] Display teacher list/grid
  - [ ] Teacher selection
  - [ ] Loading states
- [ ] Implement common components
  - [ ] LoadingSpinner
  - [ ] ErrorAlert
  - [ ] SuccessAlert
- [ ] Add responsive design styles

**Deliverables:**
- Landing page with program selection
- Level selection interface
- Teacher selection interface
- Common UI components
- Responsive layouts for all devices

**Dependencies:** Phase 5 complete

---

### Phase 7: Frontend UI - Attendance Interface
**Objective:** Build main attendance tracking interface

**Tasks:**
- [ ] Create AttendancePage component
  - [ ] Session header with info
  - [ ] Student list component
  - [ ] Individual student rows
  - [ ] Attendance checkboxes
  - [ ] Progress input fields
  - [ ] Real-time validation
- [ ] Create BulkUpdatePanel component
  - [ ] Bulk page number input
  - [ ] Update all checked students
  - [ ] Validation
- [ ] Create SubmitPanel component
  - [ ] Submit button
  - [ ] Confirmation dialog
  - [ ] Loading state
  - [ ] Error handling
- [ ] Implement form state management
- [ ] Add keyboard navigation support

**Deliverables:**
- Fully functional attendance interface
- Bulk update capability
- Form validation
- Submission with confirmation
- Keyboard accessibility

**Dependencies:** Phase 6 complete

---

### Phase 8: Frontend UI - Confirmation & Feedback
**Objective:** Build confirmation and feedback interfaces

**Tasks:**
- [ ] Create ConfirmationPage component
  - [ ] Success message display
  - [ ] Summary statistics
  - [ ] Navigation buttons
- [ ] Create SummaryStats component
  - [ ] Present/absent counts
  - [ ] Average progress display
- [ ] Implement error handling flows
  - [ ] Network errors
  - [ ] Validation errors
  - [ ] Conflict errors
- [ ] Add notification system
  - [ ] Toast notifications
  - [ ] Error alerts
  - [ ] Success messages
- [ ] Implement loading states throughout app

**Deliverables:**
- Confirmation page with statistics
- Comprehensive error handling
- Notification system
- Loading states for async operations

**Dependencies:** Phase 7 complete

---

### Phase 9: Integration & Testing
**Objective:** Integrate all components and perform comprehensive testing

**Tasks:**
- [ ] Integration testing
  - [ ] End-to-end user flows
  - [ ] Multi-user concurrent access testing
  - [ ] File locking verification
  - [ ] Data integrity validation
- [ ] Performance testing
  - [ ] Load testing with 20 concurrent users
  - [ ] Response time benchmarks
  - [ ] Excel operation performance
- [ ] Browser compatibility testing
  - [ ] Chrome, Firefox, Safari, Edge
  - [ ] Tablet devices (iPad, Android tablets)
  - [ ] Mobile devices (optional)
- [ ] Security testing
  - [ ] Input validation
  - [ ] XSS prevention
  - [ ] Rate limiting
  - [ ] Error message security
- [ ] Fix bugs and issues discovered

**Deliverables:**
- Comprehensive test suite
- Performance benchmarks
- Bug fixes
- Test reports
- Browser compatibility matrix

**Dependencies:** Phases 1-8 complete

---

### Phase 10: Documentation & Deployment
**Objective:** Complete documentation and deploy to production

**Tasks:**
- [ ] Write API documentation
- [ ] Create setup/installation guide
- [ ] Write user manual for teachers
- [ ] Create developer guide
- [ ] Document backup/restore procedures
- [ ] Create deployment script
- [ ] Set up production environment on Windows PC
  - [ ] Install Node.js LTS
  - [ ] Configure firewall
  - [ ] Set up automatic startup
  - [ ] Configure backups
- [ ] Seed initial teacher and student data
- [ ] Train teachers on using the system
- [ ] Deploy to production
- [ ] Monitor initial usage

**Deliverables:**
- Complete documentation suite
- Production deployment
- Initial data seeded
- Teacher training completed
- System monitoring in place

**Dependencies:** Phase 9 complete

---

### Phase 11: Post-Launch Support & Enhancements
**Objective:** Monitor, support, and enhance the system

**Tasks:**
- [ ] Monitor system usage and performance
- [ ] Collect user feedback
- [ ] Fix any production issues
- [ ] Optimize based on real-world usage
- [ ] Consider future enhancements:
  - [ ] Reporting and analytics dashboard
  - [ ] Export attendance to PDF
  - [ ] Email notifications to parents
  - [ ] Mobile app version
  - [ ] Student/parent portal
  - [ ] Admin interface for managing teachers/students

**Deliverables:**
- Stable production system
- User feedback incorporated
- Performance optimizations
- Enhancement roadmap

**Dependencies:** Phase 10 complete

---

## Development Timeline Visualization

```
Phase 1: Foundation & Setup
│████│
│
Phase 2: Backend Core - Excel
     │████████│
     │
Phase 3: Backend API - Teachers & Students
              │██████│
              │
Phase 4: Backend API - Attendance
                     │████████│
                     │
Phase 5: Frontend Core - Routing & State
                              │██████│
                              │
Phase 6: Frontend UI - Landing & Selection
                                     │████████│
                                     │
Phase 7: Frontend UI - Attendance
                                              │██████████│
                                              │
Phase 8: Frontend UI - Confirmation
                                                          │██████│
                                                          │
Phase 9: Integration & Testing
                                                                 │████████████│
                                                                 │
Phase 10: Documentation & Deployment
                                                                             │████████│
                                                                             │
Phase 11: Post-Launch Support
                                                                                      │████████████...│
```

---

## Appendix

### A. Technology Justifications

**Why Node.js/Express over .NET or Python?**
- Simpler deployment on Windows (no IIS configuration)
- JavaScript/TypeScript ecosystem excellent for web development
- ExcelJS library mature and well-maintained
- Easier for web developers to contribute
- Fast development cycle

**Why React over Vue or Angular?**
- Largest ecosystem and community
- Best TypeScript integration
- Component model fits UI requirements perfectly
- Material-UI provides polished components
- Easier to find developers with React experience

**Why Excel over Database?**
- Requirement: Must use Excel for data storage
- Familiar format for non-technical users
- Easy manual data entry and viewing
- Built-in backup (just copy file)
- No database installation/maintenance required

**Why Material-UI over other UI frameworks?**
- Professional appearance out-of-the-box
- Excellent accessibility
- Touch-friendly for tablets
- Comprehensive component library
- Good documentation and examples

### B. Alternative Approaches Considered

**Alternative 1: Desktop Application (Electron)**
- **Pros:** No server needed, simpler deployment
- **Cons:** No concurrent multi-user access, harder to maintain
- **Decision:** Web app better for multi-user requirement

**Alternative 2: Database + Excel Export**
- **Pros:** Better data integrity, easier queries
- **Cons:** Requirement is to use Excel as primary storage
- **Decision:** Excel must be the source of truth per requirements

**Alternative 3: Google Sheets API**
- **Pros:** Real-time collaboration, cloud-based
- **Cons:** Requires internet, Google account management, data not fully local
- **Decision:** Local network requirement makes this unsuitable

### C. Known Limitations & Risks

**Limitations:**
1. Excel file size will grow over time (mitigated by archiving old years)
2. Complex queries on Excel data are slower than database
3. No built-in multi-user access in Excel format
4. Formula corruption risk if file manually edited

**Risks:**
1. **File Corruption:** Mitigated by automatic backups before each write
2. **Lock Failures:** Mitigated by retry logic and stale lock detection
3. **Network Issues:** Handled by error handling and retry mechanisms
4. **Excel Compatibility:** Using .xlsx format, compatible with Excel 2007+
5. **Concurrent Writes:** Solved by file locking and operation queuing

### D. Future Enhancement Ideas

1. **Reporting Dashboard:**
   - Weekly attendance summaries
   - Progress tracking over time
   - Student performance analytics
   - Teacher workload distribution

2. **Parent Portal:**
   - Parents can view their child's attendance
   - Progress reports sent to parents
   - Communication with teachers

3. **Mobile Application:**
   - Native iOS/Android app
   - Offline capability with sync
   - Push notifications

4. **Advanced Analytics:**
   - Identify at-risk students
   - Attendance trends and patterns
   - Progress benchmarking

5. **Integration Capabilities:**
   - Email notifications
   - SMS alerts
   - Calendar integration
   - PDF report generation

### E. Glossary

- **ICB:** Islamic Center of Boise
- **Iqra:** Arabic for "Read" - Quranic reading program
- **LAN:** Local Area Network
- **REST:** Representational State Transfer (API architecture)
- **CRUD:** Create, Read, Update, Delete (database operations)
- **MUI:** Material-UI (React component library)
- **TTL:** Time To Live (cache duration)
- **UUID:** Universally Unique Identifier

---

## Conclusion

This architecture document provides a comprehensive blueprint for developing the ICB Sunday School Attendance and Academic Progress Tracking System. The design prioritizes:

1. **Simplicity:** Easy-to-use interface for non-technical teachers
2. **Reliability:** Robust data integrity with concurrent access support
3. **Maintainability:** Clear code structure and documentation
4. **Performance:** Optimized for local network deployment
5. **Security:** Appropriate security measures for local network environment

The modular architecture allows for phased development, with each phase building on previous work. The technology stack chosen (Node.js/Express + React + Excel) balances modern web development practices with the specific requirement of Excel-based data storage.

With proper implementation following this architecture, the system will successfully support 10-20 concurrent teachers tracking attendance and academic progress for multiple programs and levels, all while maintaining data integrity and providing a excellent user experience.

---

**Document End**
