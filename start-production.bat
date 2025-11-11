@echo off
REM IEM System - Quick Start Script (Using PM2)
REM This script starts the application using PM2 for auto-restart capabilities

echo ========================================
echo IEM System - Quick Start (PM2)
echo ========================================
echo.

REM Set the base directory
set BASE_DIR=%~dp0
cd /d "%BASE_DIR%"

REM Check if PM2 is installed
where pm2 >nul 2>nul
if errorlevel 1 (
    echo PM2 not found. Installing PM2 globally...
    call npm install -g pm2
    if errorlevel 1 (
        echo ERROR: Failed to install PM2!
        pause
        exit /b 1
    )
)

echo [1/4] Building Frontend...
cd frontend
if not exist "build" (
    echo Build folder not found. Running npm run build...
    call npm run build
    if errorlevel 1 (
        echo ERROR: Frontend build failed!
        pause
        exit /b 1
    )
)
echo ✓ Frontend ready
echo.

echo [2/4] Starting Backend with PM2...
cd ..\backend
call pm2 delete iem-backend 2>nul
call pm2 start server.js --name iem-backend
if errorlevel 1 (
    echo ERROR: Failed to start backend!
    pause
    exit /b 1
)
echo ✓ Backend started
echo.

echo [3/4] Starting Frontend with PM2...
cd ..\frontend
call pm2 delete iem-frontend 2>nul
call pm2 serve build 3000 --name iem-frontend --spa
if errorlevel 1 (
    echo ERROR: Failed to start frontend!
    pause
    exit /b 1
)
echo ✓ Frontend started
echo.

echo [4/4] Saving PM2 Configuration...
call pm2 save
echo ✓ Configuration saved
echo.

echo ========================================
echo Application Started Successfully!
echo ========================================
echo.
echo Application URLs:
echo   Frontend: http://192.168.0.138:3000
echo   Backend:  http://192.168.0.138:5000
echo   Health:   http://192.168.0.138:5000/health
echo.
echo PM2 Commands:
echo   Status:  pm2 status
echo   Logs:    pm2 logs
echo   Stop:    pm2 stop all
echo   Restart: pm2 restart all
echo.
echo Opening PM2 status...
call pm2 status
echo.
echo Press any key to exit...
pause > nul
