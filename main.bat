@echo off
title Carbon Project Runner

echo Starting Backend...
start cmd /k "cd Carbon-backend && node server.js"

timeout /t 3

echo Starting Frontend...
start cmd /k "cd Carbon-frontend && npm run dev"

echo Both servers are running...
pause