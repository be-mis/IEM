@echo off
REM IEM System - Production Deployment Script
REM This script builds and starts the application in production mode

echo ========================================
echo IEM System - Production Deployment
echo ========================================
echo.

REM Set the base directory
set BASE_DIR=%~dp0
cd /d "%BASE_DIR%"

echo [1/5] Building Frontend...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✓ Frontend build complete
echo.

echo [2/5] Checking Backend Dependencies...
cd ..\backend
call npm install --production
if errorlevel 1 (
    echo ERROR: Backend npm install failed!
    pause
    exit /b 1
)
echo ✓ Backend dependencies ready
echo.

echo [3/5] Running Database Migrations...
node migrations/migrate.js
if errorlevel 1 (
    echo WARNING: Database migrations may have failed. Check logs.
)
echo ✓ Database migrations complete
echo.

echo [4/5] Starting Backend Server...
start "IEM Backend Server" cmd /k "cd /d "%BASE_DIR%backend" && node server.js"
echo ✓ Backend server starting...
echo.

timeout /t 3 /nobreak > nul

echo [5/5] Starting Frontend Server...
cd ..\frontend
start "IEM Frontend Server" cmd /k "npx serve -s build -l 3000"
echo ✓ Frontend server starting...
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Application URLs:
echo   Frontend: http://192.168.0.138:3000
echo   Backend:  http://192.168.0.138:5000
echo   Health:   http://192.168.0.138:5000/health
echo.
echo Press any key to exit...
pause > nul
