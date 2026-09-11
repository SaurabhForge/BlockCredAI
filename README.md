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

For local development, keep `NEXT_PUBLIC_BACKEND_URL=http://localhost:4000`.
For GCP Cloud Run, set both `GCP_API_URL` and `NEXT_PUBLIC_GCP_API_URL` to the deployed HTTPS backend URL, for example:

```bash
GCP_API_URL=https://blockcredai-api-REGION.a.run.app
NEXT_PUBLIC_GCP_API_URL=https://blockcredai-api-REGION.a.run.app
CORS_ORIGIN=https://your-frontend-domain.com
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

## 🚀 Deployment on Render

This project is pre-configured for deployment on **[Render](https://render.com)** using the included Infrastructure-as-Code blueprint (`render.yaml`).

### 🌟 Method 1: 1-Click Blueprint Deployment (Recommended)

1. Navigate to your **[Render Blueprints Dashboard](https://dashboard.render.com/blueprints)**.
2. Click **New Blueprint Instance** (or **New +** → **Blueprint**).
3. Connect your GitHub repository: **`SaurabhForge/BlockCredAI`**.
4. Render will read `render.yaml` and configure all 3 microservices automatically:
   - 🌐 **`blockcredai-frontend`**: Next.js 16 Web Service
   - ⚙️ **`blockcredai-backend`**: Node.js/Express API & PDF verification service
   - 🧠 **`blockcredai-ai`**: FastAPI Python fraud detection service
5. Click **Apply**. Render will build and deploy all services in parallel!

---

### 🛠️ Method 2: Manual Web Service Deployment

If you prefer deploying services individually in the Render Dashboard:

#### 1. Backend API (`blockcredai-backend`)
* **Type**: Web Service
* **Root Directory**: `backend`
* **Runtime**: `Node`
* **Build Command**: `npm install --include=dev --legacy-peer-deps && npm run build`
* **Start Command**: `npm start`
* **Plan**: `Free`
* **Environment Variables**:
  ```env
  NODE_VERSION=22.14.0
  NODE_ENV=production
  PORT=10000
  CORS_ORIGIN=*
  AI_URL=https://blockcredai-ai.onrender.com/predict
  RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
  BLOCKCRED_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
  ```

#### 2. Frontend Web App (`blockcredai-frontend`)
* **Type**: Web Service
* **Root Directory**: `frontend`
* **Runtime**: `Node`
* **Build Command**: `npm install --include=dev --legacy-peer-deps && npm run build`
* **Start Command**: `npm start`
* **Plan**: `Free`
* **Environment Variables**:
  ```env
  NODE_VERSION=22.14.0
  NODE_ENV=production
  NEXT_PUBLIC_BACKEND_URL=https://blockcredai-backend.onrender.com
  ```

#### 3. AI Service (`blockcredai-ai`)
* **Type**: Web Service
* **Root Directory**: `backend/ai-service`
* **Runtime**: `Python`
* **Build Command**: `pip install --no-cache-dir -r requirements.txt`
* **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
* **Plan**: `Free`
* **Environment Variables**:
  ```env
  PYTHON_VERSION=3.11.9
  ```

---

### 📡 Render Production API Endpoints

Once deployed on Render, the backend serves the following production endpoints:

| Endpoint | Method | Content-Type | Description |
|---|---|---|---|
| `/` | `GET` | `application/json` | Service health status & metadata |
| `/api/scanResume` | `POST` | `multipart/form-data` | Uploads PDF resume, queries blockchain for verified history, runs AI fraud model, returns risk score & on-chain records |
| `/api/submitVerification` | `POST` | `application/json` | Mints ERC-721 badge NFT & writes verified employment record to smart contract |

#### Example cURL Request:
```bash
curl -X POST https://blockcredai-backend.onrender.com/api/scanResume \
  -F "resume=@resume.pdf;type=application/pdf" \
  -F "walletAddress=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" \
  -F "claimedExperience=Full Stack Engineer at StartupXYZ"
```

Full OpenAPI 3.0 specification is available in [`openapi.json`](./openapi.json).

---

### 🤖 Chrome E2E Automation Testing

The repository includes a complete automated testing suite powered by Playwright and Chrome:

```bash
# Run full visual Chrome automation (submits on-chain record + scans candidate):
npm run automate

# Run full headed Playwright test suite (5 passing scenarios):
npm run test:e2e:headed

# Open interactive Playwright UI:
npm run test:e2e:ui
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

---

## Quality, Security, and Testing

The project includes safeguards for common review criteria:

- Code quality: centralized backend configuration, typed frontend API results, strict frontend TypeScript, and removal of unused duplicate service code.
- Security: restricted CORS, request-size limits, PDF-only resume upload validation, simple rate limiting, safer production private-key handling, and standard security headers.
- Efficiency: API timeouts, bounded upload/body sizes, and lazy blockchain client creation so health checks do not initialize wallets unnecessarily.
- Testing: backend validation tests and Hardhat smart-contract tests for role control, verification submission, NFT minting, and invalid inputs.
- Accessibility: semantic form labels, alert/status regions, keyboard focus styles, a skip link, `aria-busy`, and hidden decorative SVGs.

Run the full quality check from the repository root:

```bash
npm test
```

The blockchain workspace uses Hardhat 3, which requires Node.js `22.10.0` or newer.
