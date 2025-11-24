@echo off
echo ========================================
echo   HanoiTransit - Quick Start
echo ========================================
echo.
echo Starting Backend Server...
start "HanoiTransit-Backend" cmd /k "%~dp0start-server.bat"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Client...
start "HanoiTransit-Frontend" cmd /k "%~dp0start-client.bat"
echo.
echo ========================================
echo   Both servers are starting...
echo   Backend: http://localhost:4000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
@echo off
echo ========================================
echo   HanoiTransit - Starting Backend
echo ========================================
cd /d "%~dp0server"
echo Installing dependencies...
call npm install --no-audit --no-fund
echo.
echo Starting server on port 4000...
node server.js

