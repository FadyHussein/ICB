@echo off
REM ICB Sunday School - Frontend Server Startup Script
REM This script starts the React frontend development server

echo ========================================
echo ICB Sunday School Attendance System
echo Frontend Server Startup
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

REM Navigate to frontend directory
cd /d "%~dp0frontend"

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

REM Check if port 5173 is already in use
echo Checking if port 5173 is available...
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo WARNING: Port 5173 is already in use!
    echo ========================================
    echo.
    echo The frontend server is likely already running.
    echo Please close the existing server first, or check for other
    echo applications using port 5173.
    echo.
    echo To find what's using port 5173:
    echo   netstat -ano ^| findstr ":5173"
    echo.
    echo To stop existing servers:
    echo   - Close any other command windows running the frontend
    echo   - Or restart your computer
    echo.
    pause
    exit /b 1
)

REM Start the development server
echo Port 5173 is available!
echo Starting frontend development server...
echo.
echo Application will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
