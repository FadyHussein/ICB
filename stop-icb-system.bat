@echo off
REM ICB Sunday School - System Shutdown Script
REM This script stops both the backend and frontend servers

echo ========================================
echo ICB Sunday School Attendance System
echo System Shutdown
echo ========================================
echo.

echo Checking for running servers...
echo.

set BACKEND_RUNNING=0
set FRONTEND_RUNNING=0

REM Check if backend is running (port 5000)
netstat -ano | findstr ":5000" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    set BACKEND_RUNNING=1
)

REM Check if frontend is running (port 5173)
netstat -ano | findstr ":5173" | findstr "LISTENING" >nul
if %ERRORLEVEL% EQU 0 (
    set FRONTEND_RUNNING=1
)

if %BACKEND_RUNNING% EQU 0 (
    if %FRONTEND_RUNNING% EQU 0 (
        echo No servers are currently running.
        echo.
        pause
        exit /b 0
    )
)

if %BACKEND_RUNNING% EQU 1 (
    echo [Found] Backend server on port 5000
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do (
        echo Stopping backend server (PID: %%a)...
        taskkill /PID %%a /F >nul 2>&1
    )
)

if %FRONTEND_RUNNING% EQU 1 (
    echo [Found] Frontend server on port 5173
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173" ^| findstr "LISTENING"') do (
        echo Stopping frontend server (PID: %%a)...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo.
echo ========================================
echo Servers Stopped Successfully
echo ========================================
echo.
echo You can now:
echo   - Start the system again with start-icb-system.bat
echo   - Make configuration changes
echo   - Update the Excel data file
echo.
pause
