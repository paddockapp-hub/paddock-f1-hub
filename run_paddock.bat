@echo off
title PADDOCK — One-Click Server Launcher 🏎️
color 0C
echo ========================================================
echo        🏎️ PADDOCK F1 Hub One-Click Launcher
echo ========================================================
echo.
echo Launching Node.js High-Performance Multi-Core Cluster Server...
echo.

cd /d "%~dp0"
start http://localhost:8888
node server.js

pause
