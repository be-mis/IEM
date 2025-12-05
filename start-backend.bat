@echo off
echo ========================================
echo IEM Backend Server
echo ========================================
echo.
cd /d "%~dp0backend"
echo Starting backend on port 3001...
echo Backend will be accessible at:
echo - Local: http://localhost:3001
echo - Network: http://192.168.1.197:3001
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
npm start
