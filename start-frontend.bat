@echo off
echo ========================================
echo IEM Frontend Server
echo ========================================
echo.

REM Check if serve is installed
where serve >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing 'serve' globally...
    npm install -g serve
)

cd /d "%~dp0frontend"
echo Serving frontend on port 3020...
echo Frontend will be accessible at:
echo - Local: http://localhost:3020
echo - Network: http://192.168.1.197:3020
echo.
echo Share this URL with network users: http://192.168.1.197:3020
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
serve -s build -l 3020
