@echo off
REM ICB Sunday School - Backend Server Startup Script
REM This script starts the Node.js backend server

echo ========================================
echo ICB Sunday School Attendance System
echo Backend Server Startup
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Display Node.js version
echo Node.js version:
node --version
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    echo This may take a few minutes on first run...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
    echo.
)

REM Check if TypeScript build is needed
if not exist "dist" (
    echo Building TypeScript...
    echo.
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build TypeScript
        echo.
        pause
        exit /b 1
    )
    echo.
)

REM Check if port 5000 is already in use
echo Checking if port 5000 is available...
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo WARNING: Port 5000 is already in use!
    echo ========================================
    echo.
    echo The backend server is likely already running.
    echo Please close the existing server first, or check for other
    echo applications using port 5000.
    echo.
    echo To find what's using port 5000:
    echo   netstat -ano ^| findstr ":5000"
    echo.
    echo To stop existing servers:
    echo   - Close any other command windows running the backend
    echo   - Or restart your computer
    echo.
    pause
    exit /b 1
)

REM Start the server
echo Port 5000 is available!
echo Starting backend server...
echo.
echo Server will be available at: http://localhost:5000
echo API endpoint: http://localhost:5000/api/v1
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm start
