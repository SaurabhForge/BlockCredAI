@echo off
title BlockCredAI Startup Script
echo Starting BlockCredAI Services...

echo 1. Starting Hardhat Node...
start "Blockchain Node" cmd /k "cd C:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI\blockchain && npx hardhat node"

echo Waiting 5 seconds for the Blockchain Node to start...
timeout /t 5 /nobreak >nul

echo 2. Deploying Smart Contract...
start "Deploy Contract" cmd /k "cd C:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI\blockchain && npx hardhat run scripts/deploy.ts --network localhost"

echo 3. Starting AI Service...
start "AI Service" cmd /k "cd C:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI\backend\ai-service && uvicorn app:app --reload --port 8001"

echo 4. Starting Backend Service...
start "Backend API" cmd /k "cd C:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI\backend && npm run dev"

echo 5. Starting Frontend App...
start "Frontend NextJS" cmd /k "cd C:\Users\Saurabh Kumar\OneDrive\Desktop\BlockCredAI\frontend && npm run dev"

echo.
echo ==============================================================
echo All services have been launched in separate windows!
echo Please wait a moment for the frontend server to become ready.
echo Then, open your browser and go to: http://localhost:3000
echo ==============================================================
echo.
pause
