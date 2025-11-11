@echo off
REM IEM System - Stop Script
REM This script stops all running PM2 processes

echo ========================================
echo IEM System - Stopping Services
echo ========================================
echo.

where pm2 >nul 2>nul
if errorlevel 1 (
    echo PM2 not found. Attempting to stop processes manually...
    taskkill /F /FI "WINDOWTITLE eq IEM Backend Server*" 2>nul
    taskkill /F /FI "WINDOWTITLE eq IEM Frontend Server*" 2>nul
    echo Services stopped (manual method)
) else (
    echo Stopping PM2 services...
    call pm2 stop all
    echo.
    echo Current status:
    call pm2 status
)

echo.
echo ========================================
echo Services Stopped
echo ========================================
echo.
pause
