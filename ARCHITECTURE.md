# BlockCredAI — Architecture Document

## 1. High-Level Architecture

BlockCredAI is a 4-tier full-stack dApp:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (MetaMask)                        │
│           Next.js 16 Frontend  :3000                         │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (REST)
┌──────────────────────▼──────────────────────────────────────┐
│          Node.js / Express Backend  :4000                    │
│   • PDF parsing (pdfjs-dist)                                 │
│   • Input validation                                         │
│   • Rate limiting / CORS / security headers                  │
└───────────┬────────────────────────────┬────────────────────┘
            │ JSON-RPC (ethers.js v6)    │ HTTP POST /predict
┌───────────▼──────────┐   ┌────────────▼───────────────────┐
│  Hardhat / EVM Node  │   │  Python FastAPI AI Service      │
│  :8545               │   │  :8001                          │
│  BlockCredAI.sol     │   │  TF-IDF + LogisticRegression    │
│  (ERC-721 + RBAC)    │   │  resume_fraud_model.joblib      │
└──────────────────────┘   └────────────────────────────────┘
```

---

## 2. Component Breakdown

### 2.1 Frontend — `frontend/`

| Item | Detail |
|---|---|
| Framework | Next.js 16 (Turbopack) with App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3, custom glassmorphism via `globals.css` |
| Blockchain client | `ethers.js` v6 (browser-side, via `window.ethereum`) |
| HTTP client | `fetch` (native) via `lib/api.ts` |
| Entry point | `src/app/page.tsx` |

**Key components:**

| Component | File | Purpose |
|---|---|---|
| `WalletConnectButton` | `components/WalletConnectButton.tsx` | MetaMask connect, auto-add Hardhat network, display address |
| `ResumeUpload` | `components/ResumeUpload.tsx` | PDF file input, wallet address + claimed experience form, calls `/api/scanResume`, renders fraud result |
| `SubmitVerification` | `components/SubmitVerification.tsx` | Employer form; calls `/api/submitVerification`; shows tx hash |

**Lib modules:**

| Module | File | Purpose |
|---|---|---|
| `api.ts` | `lib/api.ts` | Typed wrappers around backend REST calls |
| `blockchain.ts` | `lib/blockchain.ts` | ethers.js provider/contract helpers (browser-side read) |
| `blockCredAiAbi.ts` | `lib/blockCredAiAbi.ts` | ABI copy for browser-side contract reads |

---

### 2.2 Backend — `backend/`

| Item | Detail |
|---|---|
| Runtime | Node.js ≥ 22, TypeScript compiled via `ts-node-dev` (dev) / `tsc` (prod) |
| Framework | Express 4 |
| Blockchain | `ethers.js` v6 (server-side JSON-RPC signer) |
| PDF parsing | `pdfjs-dist` (legacy build, runs in Node) |
| File uploads | `multer` (memory storage, 2 MB limit, PDF MIME-only) |

**Directory structure:**
```
backend/src/
├── index.ts              # App bootstrap, middleware wiring
├── config.ts             # Centralised env-var config object
├── routes/
│   ├── resume.ts         # POST /api/scanResume (PDF upload + fraud detection)
│   └── verification.ts   # POST /api/submitVerification (blockchain write)
├── services/
│   ├── blockchain.ts     # ethers.js read/write helpers (getEmployeeHistory, submitVerification)
│   ├── aiClient.ts       # HTTP client to FastAPI /predict endpoint
│   └── blockCredAiAbi.ts # Contract ABI (server-side copy)
├── middleware/
│   ├── errorHandler.ts   # Centralised Express error handler
│   └── rateLimiter.ts    # express-rate-limit (100 req / 15 min)
└── utils/
    ├── errors.ts         # AppError class (message + HTTP status)
    └── validation.ts     # requireText, requireWalletAddress, requireUnixTimestamp helpers
```

**Request flow for `POST /api/scanResume`:**
```
Request
  → multer (file filter: PDF-only, 2 MB max)
  → requireWalletAddress(walletAddress)
  → requireText(claimedExperience, {min:10, max:2000})
  → extractResumeText(file)         # pdfjs-dist
  → getEmployeeHistory(wallet)      # ethers.js → blockchain
  → isClaimVerifiedByOnChainRecords # token-matching algorithm
  → countSpecificEmploymentClaims   # regex pattern counter
  → getFraudScore(text, exp, mismatches) # HTTP → FastAPI
  → deterministic override logic
  → res.json({ fraudProbability, explanation, onChainJobs })
```

---

### 2.3 Smart Contract — `blockchain/`

| Item | Detail |
|---|---|
| Language | Solidity 0.8.20 |
| Framework | Hardhat 3 |
| Libraries | OpenZeppelin Contracts v5 (`ERC721`, `AccessControl`) |
| Local network | Hardhat built-in node `:8545`, Chain ID `31337` |
| Testnet | Sepolia (via `SEPOLIA_RPC_URL` in `.env`) |

**Contract: `BlockCredAI.sol`**

```
BlockCredAI
  inherits: ERC721("BlockCredAI Employment Badge", "BCAIB")
  inherits: AccessControl

  Roles:
    DEFAULT_ADMIN_ROLE  → deployer (can grant EMPLOYER_ROLE)
    EMPLOYER_ROLE       → can call submitVerification()

  State:
    _jobCounter    uint256         (auto-increment job IDs)
    _tokenCounter  uint256         (auto-increment NFT token IDs)
    _employeeJobs  address → uint256[]    (employee → list of job IDs)
    _jobs          uint256 → JobRecord    (jobId → full record)

  Struct JobRecord:
    jobId, employer, employee, jobDetails (string),
    startDate (unix), endDate (unix), ipfsHash (string), tokenId

  Functions:
    submitVerification(employee, jobDetails, startDate, endDate, ipfsHash)
      → onlyEmployer; mints ERC-721 to employee; stores JobRecord; returns jobId
    getEmployeeHistory(employee) → JobRecord[]
    verifyEmployment(employee, jobId) → (exists, employer, jobDetails, ...)
    grantEmployerRole(employer) → onlyAdmin
    supportsInterface(interfaceId) → override(ERC721, AccessControl)

  Events:
    JobSubmitted(jobId, employer, employee)
    JobVerified(jobId, tokenId)
```

**Deployed addresses (local):**
- Contract: `0x5FbDB2315678afecb367f032d93F642f64180aa3` (first deployment on fresh Hardhat node)

---

### 2.4 AI Service — `backend/ai-service/`

| Item | Detail |
|---|---|
| Language | Python 3.11 |
| Framework | FastAPI + Uvicorn |
| ML | scikit-learn: `TfidfVectorizer` + `LogisticRegression` |
| Model file | `model/resume_fraud_model.joblib` |
| Virtual env | `.venv/` (created with `python -m venv .venv`) |

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Service info |
| `GET` | `/health` | `{"status":"ok","model_loaded":true}` |
| `POST` | `/predict` | Fraud prediction (see schema below) |

**`/predict` request schema:**
```json
{
  "resume_text": "string (10–10000 chars)",
  "claimed_experience": "string (10–2000 chars)",
  "unverified_mismatches": "int (0–10)"
}
```

**Scoring logic (in `app.py`):**
1. `base_prob` ← `model.predict_proba([resume_text])[0][1]`
2. If `unverified_mismatches > 0` → `fraud_prob = 1.0` (blockchain truth takes priority)
3. Else if `base_prob >= 0.80` → `fraud_prob = 1.0`
4. Else if `base_prob < 0.20` → `fraud_prob = 0.0`
5. Else → `fraud_prob = round(base_prob, 2)` (moderate, manual review)

> **Note:** The backend applies a second, higher-authority override layer on top of the AI score (see FR-03 in PRD). The AI score is only the final answer for entry-level candidates with no on-chain records.

---

## 3. Data Flow Diagrams

### Resume Scan Flow

```
Recruiter Browser
      │  POST /api/scanResume (multipart: PDF + walletAddress + claimedExperience)
      ▼
Backend :4000
      │── multer → extract PDF text (pdfjs-dist)
      │── ethers.js → Hardhat :8545 → getEmployeeHistory(wallet) → []JobRecord
      │── countSpecificEmploymentClaims(claimedExperience)
      │── isClaimVerifiedByOnChainRecords(claims, jobs)
      │── HTTP POST → AI Service :8001 /predict
      │                 ├── TF-IDF vectorise resume_text
      │                 └── LogisticRegression → base_prob
      │── deterministic override → finalFraudProbability
      └── JSON response → Browser
```

### Submit Verification Flow

```
Employer Browser
      │  POST /api/submitVerification (JSON body)
      ▼
Backend :4000
      │── validate inputs
      │── ethers.Wallet(PRIVATE_KEY).connect(JsonRpcProvider(:8545))
      │── contract.submitVerification(employee, jobDetails, start, end, ipfsHash)
      │       ├── Blockchain: _safeMint(employee, tokenId)  → ERC-721 NFT minted
      │       └── Blockchain: store JobRecord, emit events
      └── { txHash, status } → Browser
```

---

## 4. Environment & Configuration

All runtime config is centralised in `backend/src/config.ts` (server) and `.env.local` (frontend).

### Root-level `.env` (not used directly — copied into sub-packages)

| Variable | Default (local dev) | Purpose |
|---|---|---|
| `BLOCKCRED_CONTRACT_ADDRESS` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` | Deployed contract address |
| `PRIVATE_KEY` | Hardhat account #0 key | Signing wallet for backend |
| `RPC_URL` | `http://127.0.0.1:8545` | Ethereum JSON-RPC endpoint |
| `PORT` | `4000` | Backend HTTP port |
| `AI_URL` | `http://localhost:8001/predict` | AI service predict endpoint |
| `CORS_ORIGIN` | `http://localhost:3000` | Allowed frontend origin |

### `frontend/.env.local`

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| `NEXT_PUBLIC_BACKEND_URL` | `http://localhost:4000` |

---

## 5. Network Topology (Local Dev)

| Service | Port | Protocol | Started by |
|---|---|---|---|
| Next.js Frontend | 3000 | HTTP | `npm run dev` in `frontend/` |
| Express Backend | 4000 | HTTP | `npm run dev` in `backend/` |
| FastAPI AI Service | 8001 | HTTP | `uvicorn app:app` in `backend/ai-service/` |
| Hardhat EVM Node | 8545 | JSON-RPC (HTTP) | `npx hardhat node` in `blockchain/` |

---

## 6. Tech Stack Summary

| Layer | Technology | Version |
|---|---|---|
| Smart Contract | Solidity | 0.8.20 |
| Contract Framework | Hardhat | 3.x |
| Contract Libraries | OpenZeppelin Contracts | ^5.0.0 |
| Frontend Framework | Next.js | 16.2.4 |
| Frontend Language | TypeScript | ^5 |
| Frontend Styling | Tailwind CSS | ^3 |
| Web3 (browser) | ethers.js | ^6 |
| Backend Runtime | Node.js | ≥ 22.10.0 |
| Backend Framework | Express | ^4 |
| Backend Language | TypeScript | ^5 |
| Web3 (server) | ethers.js | ^6 |
| PDF Parsing | pdfjs-dist | legacy build |
| File Upload | multer | ^1 |
| AI Framework | FastAPI + Uvicorn | ^0.104 |
| AI Language | Python | 3.11 |
| ML Library | scikit-learn | ^1.3 |
| Model Serialisation | joblib | — |
| E2E Testing | Playwright | ^1.63 |
