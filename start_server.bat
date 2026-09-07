@echo off
title PADDOCK F1 Hub - Server Launcher
color 0C
echo ========================================================
echo        🏎️  PADDOCK F1 Hub - Server Launcher
echo ========================================================
echo.
echo Starting PADDOCK F1 Hub server...
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
echo.

echo Starting server on port 8888...
echo Server will be available at: http://localhost:8888
echo.
echo Press Ctrl+C to stop the server
echo ========================================================
echo.

timeout /t 3 /nobreak >nul

start http://localhost:8888

node server.js

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start!
    echo.
    pause
)
