@echo off
echo ========================================
echo IEM System - Complete Deployment
echo ========================================
echo.
echo Step 1: Rebuilding Frontend...
echo ========================================
cd /d "%~dp0frontend"
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)
echo ✓ Frontend built successfully
echo.

echo Step 2: Installing serve (if needed)...
echo ========================================
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing 'serve' globally...
    npm install -g serve
)
echo ✓ Serve is ready
echo.

echo Step 3: Starting Backend Server...
echo ========================================
cd /d "%~dp0backend"
start "IEM Backend Server" cmd /k "echo IEM Backend Server && echo ==================== && echo Listening on http://192.168.1.197:3001 && echo Press Ctrl+C to stop && echo. && npm start"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

echo ✓ Backend server started
echo.

echo Step 4: Starting Frontend Server...
echo ========================================
cd /d "%~dp0frontend"
start "IEM Frontend Server" cmd /k "echo IEM Frontend Server && echo ==================== && echo Serving on http://192.168.1.197:3020 && echo Share this URL with network users && echo Press Ctrl+C to stop && echo. && serve -s build -l 3020"

echo ✓ Frontend server started
echo.

echo ========================================
echo ✓ IEM System Started Successfully!
echo ========================================
echo.
echo ACCESS INFORMATION:
echo ========================================
echo.
echo For LOCAL access (this machine):
echo   Frontend: http://localhost:3020
echo   Backend:  http://localhost:3001/health
echo.
echo For NETWORK access (other machines):
echo   Frontend: http://192.168.1.197:3020
echo   Backend:  http://192.168.1.197:3001/health
echo.
echo ========================================
echo.
echo Two new windows opened:
echo  1. Backend Server (port 3001)
echo  2. Frontend Server (port 3020)
echo.
echo To STOP servers: Close those windows or press Ctrl+C
echo.
echo Default Admin Login:
echo   Username: admin
echo   Password: admin123
echo.
echo Test Registration:
echo   1. Go to http://192.168.1.197:3020
echo   2. Click "Sign Up"
echo   3. Create an account
echo.
echo ========================================
pause
