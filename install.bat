@echo off
title PADDOCK F1 Hub - Installation Check
color 0B
echo ========================================================
echo        🏎️  PADDOCK F1 Hub - Installation Check
echo ========================================================
echo.

echo Checking system requirements...
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [X] Node.js is NOT installed
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo After installation, run this script again.
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js is installed (version: %NODE_VERSION%)
)

echo.
echo [2/4] Checking file structure...
if exist "server.js" (
    echo [OK] server.js found
) else (
    echo [X] server.js NOT found
    echo Please ensure all files are in the correct directory.
    pause
    exit /b 1
)

if exist "paddock\index.html" (
    echo [OK] paddock/index.html found
) else (
    echo [X] paddock/index.html NOT found
    echo Please ensure all files are in the correct directory.
    pause
    exit /b 1
)

echo.
echo [3/4] Checking port availability...
netstat -ano | findstr :8888 >nul 2>&1
if %errorlevel% neq 0 (
    echo [OK] Port 8888 is available
) else (
    echo [WARNING] Port 8888 is already in use
    echo You may need to change the port or stop the conflicting service.
)

echo.
echo [4/4] Creating necessary directories...
if not exist "paddock\css" mkdir "paddock\css"
if not exist "paddock\js" mkdir "paddock\js"
echo [OK] Directory structure verified

echo.
echo ========================================================
echo              Installation Check Complete!
echo ========================================================
echo.
echo All requirements are met. You can now start the server:
echo.
echo   - Double-click: start_server.bat
echo   - Or run: node server.js
echo.
echo Server will be available at: http://localhost:8888
echo.
pause
