@echo off
echo ========================================
echo   HanoiTransit - Starting Frontend
echo ========================================
cd /d "%~dp0client"
echo Installing dependencies...
call npm install --no-audit --no-fund
echo.
echo Starting Vite dev server...
call npm run dev
pause

