@echo off

echo Starting Backend Server...
REM This command opens a new window for the backend
start "Backend" cmd /k "cd backend && echo Activating virtual environment... && venv\Scripts\activate && echo Installing dependencies... && pip install -r requirements.txt && echo Starting server... && python main.py"

echo Starting Frontend Server...
REM This command opens another new window for the frontend
start "Frontend" cmd /k "cd frontend && echo Installing dependencies... && npm install && echo Starting server... && npm start"

echo Both servers are starting in new windows.
