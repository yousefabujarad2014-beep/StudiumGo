@echo off
title Studium
cd /d "%~dp0"
start "Studium server" cmd /k node server.js
timeout /t 2 >nul
start "" http://localhost:4175
