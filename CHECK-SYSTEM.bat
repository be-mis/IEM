@echo off
setlocal enabledelayedexpansion
echo ========================================
echo IEM System - Pre-Deployment Check
echo ========================================
echo.

set "PASS=1"

echo [1/7] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ Node.js is installed
    node --version
) else (
    echo ✗ Node.js NOT found! Please install Node.js
    set "PASS=0"
)
echo.

echo [2/7] Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ npm is installed
    npm --version
) else (
    echo ✗ npm NOT found! Please install Node.js
    set "PASS=0"
)
echo.

echo [3/7] Checking MySQL/MariaDB service...
sc query MySQL80 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ✓ MySQL service found
    sc query MySQL80 | find "RUNNING" >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✓ MySQL is RUNNING
    ) else (
        echo ✗ MySQL is NOT running! Start it with: net start MySQL80
        set "PASS=0"
    )
) else (
    sc query MariaDB >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo ✓ MariaDB service found
        sc query MariaDB | find "RUNNING" >nul
        if !ERRORLEVEL! EQU 0 (
            echo ✓ MariaDB is RUNNING
        ) else (
            echo ✗ MariaDB is NOT running! Start it with: net start MariaDB
            set "PASS=0"
        )
    ) else (
        echo ✗ MySQL/MariaDB service NOT found!
        set "PASS=0"
    )
)
echo.

echo [4/7] Checking backend dependencies...
if exist "%~dp0backend\node_modules" (
    echo ✓ Backend dependencies installed
) else (
    echo ✗ Backend dependencies NOT installed!
    echo   Run: cd backend ^&^& npm install
    set "PASS=0"
)
echo.

echo [5/7] Checking frontend dependencies...
if exist "%~dp0frontend\node_modules" (
    echo ✓ Frontend dependencies installed
) else (
    echo ✗ Frontend dependencies NOT installed!
    echo   Run: cd frontend ^&^& npm install
    set "PASS=0"
)
echo.

echo [6/7] Checking frontend build...
if exist "%~dp0frontend\build\index.html" (
    echo ✓ Frontend build exists
) else (
    echo ⚠ Frontend NOT built yet
    echo   Run: cd frontend ^&^& npm run build
)
echo.

echo [7/7] Checking configuration files...
if exist "%~dp0frontend\.env" (
    echo ✓ Frontend .env exists
    findstr "REACT_APP_API_BASE=http://192.168.1.197:3001/api" "%~dp0frontend\.env" >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✓ Frontend configured for network (192.168.1.197:3001)
    ) else (
        echo ⚠ Frontend .env may need IP update
    )
) else (
    echo ✗ Frontend .env NOT found!
    set "PASS=0"
)

if exist "%~dp0backend\.env" (
    echo ✓ Backend .env exists
    findstr "PORT=3001" "%~dp0backend\.env" >nul
    if !ERRORLEVEL! EQU 0 (
        echo ✓ Backend configured for port 3001
    ) else (
        echo ⚠ Backend .env may need port update
    )
) else (
    echo ✗ Backend .env NOT found!
    set "PASS=0"
)
echo.

echo ========================================
if "%PASS%"=="1" (
    echo ✓✓✓ SYSTEM READY FOR DEPLOYMENT ✓✓✓
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Run migrations: cd backend ^&^& npm run migrate
    echo 2. Build frontend: cd frontend ^&^& npm run build
    echo 3. Start system:   Double-click START-SYSTEM.bat
    echo.
    echo OR use the all-in-one command:
    echo    START-SYSTEM.bat
) else (
    echo ✗✗✗ SYSTEM NOT READY ✗✗✗
    echo ========================================
    echo.
    echo Please fix the issues above before deploying.
)
echo.

echo ========================================
echo Network Information:
echo ========================================
ipconfig | findstr "IPv4"
echo.

pause
