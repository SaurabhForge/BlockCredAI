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

---

## 🛠 Troubleshooting Common Issues

### 1. "Connect Wallet" button not working (Connection Failed)
**Issue:** You click the button to connect your wallet, but you receive a `Connection Failed` error or a `MetaMask not found` error.
**Fix:**
- You must have a Web3 Wallet extension installed in your browser, such as **[MetaMask](https://metamask.io/download/)**.
- Once installed, the app will automatically request MetaMask to connect and will attempt to add the `Hardhat Localhost 8545` network to your wallet so you can test seamlessly. Make sure to click **Approve** and **Switch Network** when prompted by MetaMask.

### 2. Ethers-User-Denied / Action Rejected Error
**Issue:** You receive an error saying the connection request was cancelled or rejected.
**Fix:** This happens if you accidentally click outside of the MetaMask popup or click "Cancel" when it asks for connection permissions. Click "Connect Wallet" again and ensure you explicitly press **"Connect"** inside the MetaMask extension window.

### 3. AI Service "Internal Server Error" (Port 8001 failing to start)
**Issue:** The frontend scanner throws an Internal Server Error, or `uvicorn app:app` fails during Step 5.
**Fix:** The AI service requires a Python environment. If you don't have Python installed, the backend will automatically catch the connection failure and return a **Graceful Mock Response** so that you can still test the frontend and blockchain components without the AI microservice crashing the app!
