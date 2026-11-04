# BlockCredAI — Product Requirements Document (PRD)

## 1. Overview

**Product Name:** BlockCredAI  
**Version:** 1.0  
**Author:** Saurabh Kumar  
**Repository:** https://github.com/SaurabhForge/BlockCredAI  
**Type:** Full-Stack Decentralized Application (dApp) — College Mini-Project

### Problem Statement

Employment fraud is rampant. Candidates fabricate job titles, tenures, and company names on resumes with little risk of being caught. Traditional background checks are slow, expensive, and centralised — a single bad actor at a verification company can corrupt results. There is no tamper-proof, universally accessible record of verified employment history.

### Solution

BlockCredAI creates a decentralised employment verification system where:
- **Employers** write cryptographically signed, immutable job records to a blockchain smart contract.
- **Employees** receive an ERC-721 NFT badge as cryptographic proof of verified employment.
- **Recruiters / HR** upload a candidate's resume PDF; an AI model + blockchain cross-check produces a fraud probability score in seconds — with zero reliance on a centralised authority.

---

## 2. Goals & Non-Goals

### Goals
- Provide tamper-proof, on-chain storage of verified employment records.
- Issue ERC-721 NFT badges to employees upon employer verification.
- Detect resume fraud in real-time using an ML model (TF-IDF + Logistic Regression).
- Cross-reference resume claims against on-chain records to surface mismatches.
- Provide a modern, responsive web UI requiring only MetaMask for authentication.
- Be deployable on a local Hardhat node (dev) and Sepolia testnet (staging) with zero config changes beyond `.env`.

### Non-Goals (v1)
- Decentralised identity / DID standard (e.g., W3C Verifiable Credentials).
- Mobile native apps (iOS / Android).
- Real Firebase / Firestore persistence (optional integration, not required for core flow).
- OAuth2 user authentication — MetaMask wallet address IS the identity.
- IPFS pinning for resume PDFs (hash field supported in contract but pinning not wired end-to-end).
- Full PDF text generation / OCR — only text-layer PDFs are supported.

---

## 3. User Personas

| Persona | Role | Primary Action |
|---|---|---|
| **Employee / Candidate** | Web3 wallet holder | Connects wallet; receives NFT badge when employer verifies employment |
| **Employer / HR Manager** | Authorised blockchain signer | Submits employment verification; mints NFT to employee address |
| **Recruiter / Background Checker** | Anonymous scanner | Uploads candidate resume PDF + wallet address; receives fraud score |
| **Admin** | Smart contract `DEFAULT_ADMIN_ROLE` | Grants `EMPLOYER_ROLE` to employer addresses |

---

## 4. User Flows

### Flow 1 — Employer Submits Verification
1. Employer opens the app at `http://localhost:3000`.
2. Clicks **Connect Wallet** → MetaMask prompts; employer approves.
3. Fills the **Submit Employment Record** form:
   - Employee wallet address
   - Job details (e.g., "Senior SDE @ Google")
   - Start date / End date
   - (Optional) IPFS hash of supporting document
4. Clicks **Submit** → Backend calls `submitVerification()` on the smart contract.
5. Contract mints an ERC-721 NFT badge to the employee address.
6. UI shows transaction hash confirming success.

### Flow 2 — Recruiter Scans Resume
1. Recruiter opens the **AI Resume Scanner** panel.
2. Uploads candidate's resume PDF (≤ 2 MB, PDF only).
3. Enters candidate's wallet address and a brief description of the claimed experience.
4. Clicks **Scan Resume** → Backend:
   a. Extracts text from PDF using `pdfjs-dist`.
   b. Fetches candidate's on-chain employment history via `getEmployeeHistory()`.
   c. Counts specific employment claims in the text.
   d. Cross-references claims against on-chain records (token-matching algorithm).
   e. Calls AI `/predict` endpoint with resume text + mismatch count.
   f. Applies deterministic override logic to produce final fraud probability.
5. UI displays: fraud probability (0–100%), explanation, and all verified on-chain jobs.

### Flow 3 — Employee Checks Own Credentials
1. Employee connects MetaMask.
2. App can read their on-chain employment history via `getEmployeeHistory(walletAddress)`.
3. Each record shows: employer address, job details, start/end dates, NFT token ID, IPFS hash.

---

## 5. Functional Requirements

### FR-01: Wallet Connection
- App must detect `window.ethereum` (MetaMask).
- On connect, auto-add Hardhat localhost network (Chain ID `31337`) if not present.
- Display connected wallet address (truncated) in the navbar.

### FR-02: Submit Employment Verification (Employer)
- Input: `employeeAddress` (checksummed Ethereum address), `jobDetails` (3–500 chars), `startDate` (Unix timestamp), `endDate` (Unix timestamp > startDate), `ipfsHash` (optional, ≤ 120 chars).
- Must call `BlockCredAI.submitVerification()` on-chain.
- Must return `txHash` and `status` to the UI.
- Must reject if caller does not hold `EMPLOYER_ROLE`.

### FR-03: Resume Scan / Fraud Detection
- Input: `resume` (PDF file ≤ 2 MB), `walletAddress` (Ethereum address), `claimedExperience` (10–2000 chars).
- Extract text from PDF (server-side, `pdfjs-dist`).
- Fetch on-chain history for the wallet.
- Count specific employment claims in `claimedExperience`.
- Determine mismatches between claims and on-chain records.
- Call AI `/predict` with resume text + mismatch count.
- Apply deterministic override:

  | Condition | Fraud Probability |
  |---|---|
  | On-chain records exist AND claim matches | 0% |
  | On-chain records exist AND claim does NOT match | 100% |
  | No on-chain records AND candidate makes specific claims | 100% |
  | No on-chain records AND entry-level (no claims) | AI score |
  | AI score ≥ 80% (text-only severe pattern) | 100% |

### FR-04: AI Fraud Model
- Endpoint: `POST /predict` on `http://localhost:8001`.
- Input: `resume_text` (10–10 000 chars), `claimed_experience` (10–2000 chars), `unverified_mismatches` (0–10).
- Model: TF-IDF vectoriser + Logistic Regression trained on synthetic fraud/legitimate resume data.
- Output: `fraud_probability` (0.0–1.0) + `explanation` string.

### FR-05: Security Hardening
- Backend must validate all inputs (type, length, format) before touching the blockchain or AI service.
- CORS restricted to `CORS_ORIGIN` env var (wildcard allowed in dev).
- Rate limiting: 100 requests per 15-minute window per IP.
- Request body limit: 100 KB (JSON); file upload limit: 2 MB.
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.
- Production must reject Hardhat default private keys.

### FR-06: Graceful Degradation
- If AI service (port 8001) is unreachable, backend must catch the error and return a mock/safe response so the rest of the app still works.
- If blockchain node is unreachable, `getEmployeeHistory` returns `[]` instead of crashing.

### FR-07: Accessibility
- Skip-to-content link.
- Semantic HTML (`<nav aria-label>`, `<main id>`, `<footer>`).
- All form inputs have associated `<label>` elements.
- `aria-busy` on loading states.
- Decorative SVGs have `aria-hidden="true"`.
- Keyboard focus styles visible.

---

## 6. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Resume scan end-to-end latency | < 5 seconds (local) |
| Blockchain write (submitVerification) | < 15 seconds (local Hardhat) |
| PDF upload size limit | 2 MB |
| Rate limit | 100 req / 15 min per IP |
| Supported browsers | Chrome 100+, Firefox 100+, Edge 100+ (MetaMask required) |
| Node.js version | ≥ 22.10.0 (Hardhat 3 requirement) |
| Python version | 3.11+ |

---

## 7. API Contract

### `POST /api/scanResume`
- **Content-Type:** `multipart/form-data`
- **Fields:** `resume` (PDF file), `walletAddress` (string), `claimedExperience` (string)
- **Response:**
  ```json
  {
    "fraudProbability": 0.0,
    "explanation": "Verified on-chain: 0% fraud risk...",
    "onChainJobs": [ { "jobId": 1, "employer": "0x...", "jobDetails": "...", ... } ]
  }
  ```

### `POST /api/submitVerification`
- **Content-Type:** `application/json`
- **Body:** `{ employeeAddress, jobDetails, startDate, endDate, ipfsHash? }`
- **Response:**
  ```json
  { "txHash": "0x...", "status": 1 }
  ```

### `GET /`
- **Response:** `{ "name": "BlockCredAI Backend", "status": "ok", "apiUrl": "..." }`

---

## 8. Out-of-Scope / Future Roadmap

- [ ] Real PDF OCR for scanned (image-based) documents
- [ ] Firebase / Firestore user profile storage
- [ ] OAuth2 / social login alongside MetaMask
- [ ] IPFS document pinning (nft.storage integration)
- [ ] W3C Verifiable Credentials standard compliance
- [ ] Employer onboarding flow (self-service `EMPLOYER_ROLE` request + admin approval)
- [ ] Multi-chain support (Polygon, Arbitrum)
- [ ] Mobile wallet support (WalletConnect)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Sepolia testnet production deployment
