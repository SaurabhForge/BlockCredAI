# BlockCredAI
Decentralized Employment Verification System with AI-Based Resume Fraud Detection. Blockchain (Solidity + Ethereum) + Next.js + FastAPI. College blockchain mini-project with smart contracts, NFT badges, and fraud detection ML model.

## Local Setup & Running Locally

### Step 1: Clone Repository

```bash
git clone https://github.com/SaurabhForge/BlockCredAI.git
cd BlockCredAI
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your specific values provided in .env.example
```

### Step 3: Install Dependencies

Open your terminal and run the following commands sequentially:

```bash
# Blockchain Dependencies
cd blockchain && npm install && cd ..

# Backend Dependencies
cd backend && npm install && cd ..

# Frontend Dependencies
cd frontend && npm install && cd ..

# AI Service Dependencies
cd backend/ai-service && pip install -r requirements.txt && cd ..
```

### Step 4: Compile Smart Contract

```bash
cd blockchain
npm run compile
cd ..
```

### Step 5: Start All Services

You will need to test all layers. The easiest way on Windows is to run the provided batch script:
- Double-click **`start_all.bat`** in the root directory. It will automatically launch 5 terminal windows for all the required services.

Alternatively, to run manually, open 5 separate terminals:

**Terminal 1: Start Hardhat Node**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2: Deploy Contract**
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
# Notes: Copy deployed address to .env as BLOCKCRED_CONTRACT_ADDRESS
```

**Terminal 3: Start AI Service**
```bash
cd backend/ai-service
uvicorn app:app --reload --port 8001
```

**Terminal 4: Start Backend API**
```bash
cd backend
npm run dev
```

**Terminal 5: Start Frontend Application**
```bash
cd frontend
npm run dev
# Open http://localhost:3000 in your browser to view the application
```
