@echo off
setlocal enabledelayedexpansion

REM ============================================================
REM  NEXUS ERP - One-shot setup script (Windows)
REM  Installs all dependencies for backend, frontend, ml-service.
REM  Does NOT start the services - prints next steps when done.
REM ============================================================

echo.
echo ============================================================
echo  NEXUS ERP - Environment Setup
echo ============================================================
echo.
echo Prerequisites (verify these are installed BEFORE continuing):
echo   - Node.js 18 or newer       (node --version)
echo   - Python 3.11 or newer      (python --version)
echo   - MongoDB 8                 (mongod --version)
echo.
pause
echo.

REM ---- 1. Backend ----
echo [1/4] Installing backend dependencies...
pushd backend
call npm install
if errorlevel 1 (
    echo.
    echo  ERROR: backend npm install failed.
    popd
    exit /b 1
)
popd
echo   Done.
echo.

REM ---- 2. Frontend ----
echo [2/4] Installing frontend dependencies...
pushd frontend
call npm install
if errorlevel 1 (
    echo.
    echo  ERROR: frontend npm install failed.
    popd
    exit /b 1
)
popd
echo   Done.
echo.

REM ---- 3. ML service ----
echo [3/4] Setting up ML service (Python venv + pip install)...
pushd ml-service
if not exist venv (
    python -m venv venv
    if errorlevel 1 (
        echo.
        echo  ERROR: failed to create Python virtual environment.
        popd
        exit /b 1
    )
)
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt
if errorlevel 1 (
    echo.
    echo  ERROR: pip install failed.
    popd
    exit /b 1
)
call venv\Scripts\deactivate.bat
popd
echo   Done.
echo.

REM ---- 4. .env bootstrap ----
echo [4/4] Checking environment file...
if not exist backend\.env (
    if exist .env.example (
        copy .env.example backend\.env >nul
        echo   backend\.env created from .env.example - EDIT IT before running.
    ) else (
        echo   No .env.example found - create backend\.env manually.
    )
) else (
    echo   backend\.env already exists - leaving untouched.
)
echo.

echo ============================================================
echo  Setup complete.
echo ============================================================
echo.
echo Next steps (run each in its own terminal):
echo.
echo   1) Start MongoDB
echo      "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath C:\data\db
echo.
echo   2) Seed the database (only needed once, or after re-seeding)
echo      cd backend
echo      npm run seed
echo.
echo   3) Start the backend API
echo      cd backend
echo      npm run dev
echo      ^=^> http://localhost:5001
echo.
echo   4) Start the ML microservice
echo      cd ml-service
echo      venv\Scripts\activate
echo      python app.py
echo      ^=^> http://127.0.0.1:5000
echo.
echo   5) Train both stages (one-time after seeding)
echo      curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d "{\"stage\":\"stage_1\"}"
echo      curl -X POST http://127.0.0.1:5000/train -H "Content-Type: application/json" -d "{\"stage\":\"stage_2\"}"
echo.
echo   6) Start the frontend
echo      cd frontend
echo      npm run dev
echo      ^=^> http://localhost:3000
echo.
echo Demo logins:
echo   admin       - kavinda@nexus.lk / nexus123
echo   hr_manager  - malini@nexus.lk  / nexus123
echo.
endlocal
