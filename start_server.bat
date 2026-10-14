@echo off
cd /d "%~dp0"
title Smart Waste Management Server
echo ========================================================
echo  Starting Smart Waste Management (Citizen & Admin Portal)
echo  Local URL: http://localhost:3000
echo ========================================================
timeout /t 1 /nobreak >nul
start http://localhost:3000
node backend\server.js
pause
