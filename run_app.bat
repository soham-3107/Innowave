@echo off
echo ===================================================
echo        Launching ORCA Marine Intelligence Suite
echo ===================================================

echo [1/2] Starting Backend API (FastAPI) on port 8000...
start "ORCA Backend" cmd /k "cd /d "%~dp0backend" && .\venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Frontend UI (Next.js) on port 3000...
start "ORCA Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Waiting 5 seconds for servers to start...
timeout /t 5 /nobreak >nul

echo Opening ORCA in browser...
start http://localhost:3000

echo.
echo ===================================================
echo ORCA is now running at: http://localhost:3000
echo Backend API docs at:   http://127.0.0.1:8000/docs
echo ===================================================
pause
