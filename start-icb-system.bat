@echo off
REM ICB Sunday School - Complete System Startup Script
REM This script starts both the backend and frontend servers

echo ========================================
echo ICB Sunday School Attendance System
echo Complete System Startup
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

echo Node.js version: 
node --version
echo.

REM Check if servers are already running
echo Checking system status...
echo.

set BACKEND_RUNNING=0
set FRONTEND_RUNNING=0

netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    set BACKEND_RUNNING=1
    echo [!] Backend already running on port 5000
)

netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    set FRONTEND_RUNNING=1
    echo [!] Frontend already running on port 5173
)

if %BACKEND_RUNNING% EQU 1 (
    if %FRONTEND_RUNNING% EQU 1 (
        echo.
        echo ========================================
        echo System Already Running!
        echo ========================================
        echo.
        echo Both servers are already active:
        echo   Backend:  http://localhost:5000
        echo   Frontend: http://localhost:5173
        echo.
        echo Access the application at: http://localhost:5173
        echo.
        echo If you need to restart:
        echo   1. Close the existing server windows
        echo   2. Run this script again
        echo.
        pause
        exit /b 0
    )
)

if %BACKEND_RUNNING% EQU 1 (
    echo.
    echo WARNING: Backend is already running.
    echo Only the frontend server will be started.
    echo.
    pause
    start "ICB Frontend Server" cmd /k "%~dp0start-frontend.bat"
    goto :show_success
)

if %FRONTEND_RUNNING% EQU 1 (
    echo.
    echo WARNING: Frontend is already running.
    echo Only the backend server will be started.
    echo.
    pause
    start "ICB Backend Server" cmd /k "%~dp0start-backend.bat"
    goto :show_success
)

echo All ports available!
echo.
echo Starting ICB Sunday School System...
echo.
echo This will open two command windows:
echo 1. Backend Server (Port 5000)
echo 2. Frontend Server (Port 5173)
echo.
echo To stop the servers, close both command windows or press Ctrl+C in each
echo.
pause

REM Start backend server in a new window
echo Starting Backend Server...
start "ICB Backend Server" cmd /k "%~dp0start-backend.bat"

REM Wait a few seconds for backend to initialize
timeout /t 5 /nobreak >nul

REM Start frontend server in a new window
echo Starting Frontend Server...
start "ICB Frontend Server" cmd /k "%~dp0start-frontend.bat"

:show_success

echo.
echo ========================================
echo System Startup Complete!
echo ========================================
echo.
echo Backend Server: http://localhost:5000
echo Frontend Application: http://localhost:5173
echo.
echo Teachers can access the system at:
echo http://localhost:5173
echo.
echo Or from other devices on the network at:
echo http://[YOUR-PC-IP]:5173
echo.
echo To find your PC's IP address, run: ipconfig
echo Look for "IPv4 Address" under your active network adapter
echo.
echo Both servers are running in separate windows.
echo Close this window, but keep the server windows open.
echo.
pause
