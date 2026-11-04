# BlockCredAI — Memory & Context

> This file is a living reference for agents and developers. Update it whenever a significant decision, discovery, or state change happens.

---

## Project Identity

| Field | Value |
|---|---|
| **Project name** | BlockCredAI |
| **Tagline** | Decentralised Employment Verification with AI Fraud Detection |
| **Author** | Saurabh Kumar |
| **GitHub** | https://github.com/SaurabhForge/BlockCredAI |
| **Type** | Full-stack dApp — college mini-project / engineering showcase |
| **Started** | September 2026 |
| **Last updated** | November 2026 |

---

## Running State (Local Dev)

All 4 services are currently running in this Antigravity session:

| Service | Port | Task ID | Log |
|---|---|---|---|
| Hardhat EVM Node | 8545 | `task-25` | [task-25.log](file:///C:/Users/Saurabh%20Kumar/.gemini/antigravity/brain/eeae886e-6116-4ccc-894d-835f6221d6af/.system_generated/tasks/task-25.log) |
| Express Backend | 4000 | `task-29` | [task-29.log](file:///C:/Users/Saurabh%20Kumar/.gemini/antigravity/brain/eeae886e-6116-4ccc-894d-835f6221d6af/.system_generated/tasks/task-29.log) |
| FastAPI AI Service | 8001 | `task-30` | [task-30.log](file:///C:/Users/Saurabh%20Kumar/.gemini/antigravity/brain/eeae886e-6116-4ccc-894d-835f6221d6af/.system_generated/tasks/task-30.log) |
| Next.js Frontend | 3000 | `task-32` | [task-32.log](file:///C:/Users/Saurabh%20Kumar/.gemini/antigravity/brain/eeae886e-6116-4ccc-894d-835f6221d6af/.system_generated/tasks/task-32.log) |

**Frontend URL:** http://localhost:3000

---

## Deployed Contract

| Field | Value |
|---|---|
| Network | Hardhat localhost (Chain ID `31337`) |
| RPC URL | `http://127.0.0.1:8545` |
| Contract address | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |
| Contract name | `BlockCredAI` |
| Token name | `BlockCredAI Employment Badge` |
| Token symbol | `BCAIB` |
| Deployer / Admin | Hardhat Account #0 |

**Hardhat Account #0 (default admin + employer):**
- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

> ⚠️ These are well-known Hardhat test keys. Never use on mainnet. The backend explicitly blocks them in production mode.

---

## Key File Locations

| File | Path | Purpose |
|---|---|---|
| Smart contract | [`blockchain/contracts/BlockCredAI.sol`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/blockchain/contracts/BlockCredAI.sol) | ERC-721 + RBAC employment verification |
| Deploy script | [`blockchain/scripts/deploy.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/blockchain/scripts/deploy.ts) | Deploys contract to configured network |
| Hardhat config | [`blockchain/hardhat.config.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/blockchain/hardhat.config.ts) | Network, Solidity, and plugin config |
| Backend entry | [`backend/src/index.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/src/index.ts) | Express app bootstrap |
| Backend config | [`backend/src/config.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/src/config.ts) | All env-var config in one place |
| Resume route | [`backend/src/routes/resume.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/src/routes/resume.ts) | PDF scan + fraud detection pipeline |
| Verification route | [`backend/src/routes/verification.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/src/routes/verification.ts) | Blockchain write (mint NFT) |
| Blockchain service | [`backend/src/services/blockchain.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/src/services/blockchain.ts) | ethers.js read/write helpers |
| AI client | [`backend/src/services/aiClient.ts`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/src/services/aiClient.ts) | HTTP call to FastAPI /predict |
| AI service | [`backend/ai-service/app.py`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/ai-service/app.py) | FastAPI fraud detector |
| ML model | [`backend/ai-service/model/resume_fraud_model.joblib`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/ai-service/model/resume_fraud_model.joblib) | Trained TF-IDF + LR model |
| Frontend page | [`frontend/src/app/page.tsx`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/frontend/src/app/page.tsx) | Main single-page app |
| Wallet button | [`frontend/src/components/WalletConnectButton.tsx`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/frontend/src/components/WalletConnectButton.tsx) | MetaMask connect |
| Resume upload | [`frontend/src/components/ResumeUpload.tsx`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/frontend/src/components/ResumeUpload.tsx) | AI scanner UI |
| Submit verify | [`frontend/src/components/SubmitVerification.tsx`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/frontend/src/components/SubmitVerification.tsx) | Employer verification form |
| Backend .env | [`backend/.env`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/backend/.env) | Backend runtime config |
| Frontend .env | [`frontend/.env.local`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/frontend/.env.local) | Frontend runtime config |
| OpenAPI spec | [`openapi.json`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/openapi.json) | Full API specification |
| E2E tests | [`tests/`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/tests/) | Playwright test suite |
| Windows startup | [`start_all.bat`](file:///c:/Users/Saurabh%20Kumar/OneDrive/Desktop/BlockCredAI-main/start_all.bat) | Launches all 5 services in separate cmd windows |

---

## Architecture Decisions & Why

| Decision | Reason |
|---|---|
| **ERC-721 (NFT) for job badges** | Gives each verified job a unique, transferable, ownable token — the employee holds the NFT as a credential. |
| **AccessControl (not Ownable)** | Multiple employers need `EMPLOYER_ROLE` simultaneously; Ownable is single-owner only. |
| **Backend signs transactions (not MetaMask)** | Allows server-side automation (batch verifications, testing). Frontend MetaMask is used for wallet ID only. |
| **pdfjs-dist (not pdf-parse)** | `pdf-parse` has known issues with encrypted/complex PDFs; `pdfjs-dist` is the reference implementation. |
| **Deterministic override over raw AI score** | Blockchain truth is cryptographic proof — it must always beat a probabilistic ML score. AI is only the fallback for entry-level candidates with no on-chain records. |
| **Hardhat over Truffle/Foundry** | Hardhat 3 has first-class TypeScript support; Foundry was overkill for a college project. |
| **FastAPI (not Flask)** | FastAPI gives async support, auto OpenAPI docs, and Pydantic validation for free. |
| **No global state manager (Redux/Zustand)** | Single-page app with 3 components — React `useState` is sufficient. YAGNI. |
| **Tailwind CSS (no component library)** | Full design control, no bloat; glassmorphism custom styles are simpler with raw Tailwind utilities. |

---

## Fraud Detection Logic (Critical — Read Before Changing)

The fraud score pipeline has two layers. **Do not collapse them into one.**

**Layer 1 — AI Model** (`backend/ai-service/app.py`):
- Scores the raw resume text via TF-IDF + Logistic Regression.
- Also receives `unverified_mismatches` count which forces `1.0` if > 0.

**Layer 2 — Blockchain Override** (`backend/src/routes/resume.ts`):
```
IF on-chain records exist:
  IF claims match on-chain records  → 0% (cryptographically verified)
  IF claims DON'T match             → 100% (mismatch = fraud)
ELSE (no on-chain records):
  IF candidate makes specific job claims → 100% (unverifiable = fraud)
  IF entry-level (no claims)             → use Layer 1 AI score
```

This is intentional. Blockchain truth is deterministic and takes absolute priority over the ML model.

---

## Token Matching Algorithm (Mismatch Detection)

Located in `backend/src/routes/resume.ts` — `isClaimVerifiedByOnChainRecords()`.

Steps:
1. Lowercase both `claimedExperience` and each `job.jobDetails`.
2. Try direct substring match first.
3. Tokenise both strings (split on non-alphanumeric, min length 3, exclude stopwords).
4. Count overlapping tokens between claim and each job record.
5. If `matchingTokens / max(claimTokens, jobTokens) >= 0.4` → verified.

Stopwords (`MATCH_STOPWORDS`) are defined to exclude generic career words that would cause false positives (e.g., "experience", "worked", "senior").

---

## MetaMask Network Config (Auto-Added)

```json
{
  "chainId": "0x7A69",
  "chainName": "Hardhat Localhost 8545",
  "nativeCurrency": { "name": "Ether", "symbol": "ETH", "decimals": 18 },
  "rpcUrls": ["http://127.0.0.1:8545"]
}
```

The frontend calls `wallet_addEthereumChain` automatically on wallet connect to inject this.

---

## Common Commands

```bash
# Start Hardhat node
cmd /c "cd /d blockchain && npx hardhat node"

# Deploy contract (after node is running)
cmd /c "cd /d blockchain && npx hardhat run scripts/deploy.ts --network localhost"

# Start backend
cmd /c "cd /d backend && npm run dev"

# Start AI service
cmd /c "cd /d backend/ai-service && .venv\Scripts\uvicorn.exe app:app --reload --port 8001"

# Start frontend
cmd /c "cd /d frontend && npm run dev"

# Run all tests
npm test

# Run e2e tests (services must be running)
npm run test:e2e

# Run chrome automation
npm run automate
```

---

## Environment Variables Quick Reference

### `backend/.env`
```env
PORT=4000
AI_URL=http://localhost:8001/predict
RPC_URL=http://127.0.0.1:8545
BLOCKCRED_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
CORS_ORIGIN=http://localhost:3000
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

## Known Gotchas

1. **PowerShell `&&` not supported** — Always use `cmd /c "..."` to chain commands on Windows. PowerShell uses `;` but `&&` is cmd syntax.
2. **PowerShell execution policy** — `npx` via PowerShell throws `UnauthorizedAccess`. Use `cmd /c "npx ..."` instead.
3. **Contract address resets on Hardhat restart** — Every fresh `npx hardhat node` starts with a clean chain. The first contract deployed always lands at `0x5FbDB2315678afecb367f032d93F642f64180aa3` (deterministic from nonce 0). `.env` is already set to this address.
4. **AI model must be pre-trained** — `resume_fraud_model.joblib` must exist before starting the AI service. Run `python model/train.py` if the file is missing.
5. **pdfjs-dist worker path** — The `workerSrc` is set to an absolute file URL at runtime. If the backend is built (`npm run build`) and run from `dist/`, the relative path to `node_modules` changes. Test the production build if deploying to Render.
6. **OneDrive path spaces** — The project lives in `C:\Users\Saurabh Kumar\OneDrive\Desktop\...`. Always quote paths in shell commands.

---

## Conversation History

| Date | Action |
|---|---|
| Nov 4, 2026 | All 4 services started on localhost (Hardhat :8545, Backend :4000, AI :8001, Frontend :3000) |
| Nov 4, 2026 | Created PRD.md, ARCHITECTURE.md, DESIGN.md, TASKS.md, MEMORY.md |
