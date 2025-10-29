@echo off

echo Starting Backend Server...
REM This command opens a new window for the backend
start "Backend" cmd /k "python backend\run_backend.py"

echo Starting Frontend Server...
REM This command opens another new window for the frontend
start "Frontend" cmd /k "cd frontend && echo Installing dependencies... && npm install && echo Starting server... && npm start"

echo Both servers are starting in new windows.
