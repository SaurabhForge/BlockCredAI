@echo off
title BlockCredAI Startup Script
echo Starting BlockCredAI Services...

echo 1. Starting Hardhat Node...
start "Blockchain Node" cmd /k "cd /d "%~dp0blockchain" && npx.cmd hardhat node"

echo Waiting 5 seconds for the Blockchain Node to start...
timeout /t 5 /nobreak >nul

echo 2. Deploying Smart Contract...
start "Deploy Contract" cmd /k "cd /d "%~dp0blockchain" && npx.cmd hardhat run scripts/deploy.ts --network localhost"

echo 3. Starting AI Service...
start "AI Service" cmd /k "cd /d "%~dp0backend\ai-service" && .venv\Scripts\uvicorn.exe app:app --reload --port 8001"

echo 4. Starting Backend Service...
start "Backend API" cmd /k "cd /d "%~dp0backend" && npm.cmd run dev"

echo 5. Starting Frontend App...
start "Frontend NextJS" cmd /k "cd /d "%~dp0frontend" && npm.cmd run dev"

echo.
echo ==============================================================
echo All services have been launched in separate windows!
echo Please wait a moment for the frontend server to become ready.
echo Then, open your browser and go to: http://localhost:3000
echo ==============================================================
echo.
pause
