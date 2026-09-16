@echo off
title Darul Hijra College - Live Development Server
echo ===================================================
echo   Starting Darul Hijra College Portal (Live Reload)
echo   Any edits you make in the code will show instantly!
echo ===================================================
echo.
echo Opening http://localhost:8080 in your browser...
start http://localhost:8080
echo.
npm.cmd run dev
pause
