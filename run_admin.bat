@echo off
title PADDOCK — Admin Panel One-Click Launcher 🔐
color 0A
echo ========================================================
echo        🔐 PADDOCK Admin Panel One-Click Launcher
echo ========================================================
echo.
echo Opening Admin Dashboard at http://localhost:8888/admin.html ...
echo Admin password is configured through the ADMIN_PASS environment variable.
echo.

start http://localhost:8888/admin.html

exit
