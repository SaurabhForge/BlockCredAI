# BlockCredAI — Tasks & Roadmap

> Status legend: ✅ Done · 🔄 In Progress · 🔲 Todo · ❌ Blocked

---

## Phase 1 — Core MVP (Complete ✅)

### Smart Contract
- [x] Write `BlockCredAI.sol` (ERC-721 + AccessControl)
- [x] `submitVerification()` — mint NFT + store `JobRecord`
- [x] `getEmployeeHistory()` — return all records for an address
- [x] `verifyEmployment()` — point-query a specific job for an employee
- [x] `grantEmployerRole()` — admin grants `EMPLOYER_ROLE`
- [x] Events: `JobSubmitted`, `JobVerified`
- [x] Hardhat config — local node + Sepolia testnet networks
- [x] Deployment script `scripts/deploy.ts`
- [x] Hardhat contract unit tests (`BlockCredAI.test.ts`)

### Backend API
- [x] Express server with TypeScript (`ts-node-dev`)
- [x] Centralised config (`config.ts`)
- [x] `POST /api/scanResume` — PDF upload, text extraction, blockchain query, AI call
- [x] `POST /api/submitVerification` — blockchain write (mint NFT)
- [x] `GET /` — health check
- [x] `services/blockchain.ts` — ethers.js read/write helpers
- [x] `services/aiClient.ts` — HTTP client to FastAPI
- [x] PDF text extraction (`pdfjs-dist` legacy build)
- [x] Mismatch detection algorithm (token-matching)
- [x] Specific employment claim counter (regex)
- [x] Deterministic fraud override logic
- [x] Multer file upload (memory storage, 2 MB, PDF-only)
- [x] Input validation helpers (`validation.ts`)
- [x] Rate limiter middleware (100 req / 15 min)
- [x] CORS middleware (env-configurable origins)
- [x] Security headers middleware
- [x] Centralised error handler (`AppError` class)
- [x] Graceful AI-service fallback (catch + mock)

### AI Service
- [x] FastAPI app (`app.py`)
- [x] `POST /predict` endpoint
- [x] `GET /health` endpoint
- [x] TF-IDF + Logistic Regression model training script (`model/train.py`)
- [x] Model persistence (`resume_fraud_model.joblib`)
- [x] Pydantic request/response schemas
- [x] Scoring logic with mismatch override
- [x] Python venv setup (`.venv/`)

### Frontend
- [x] Next.js 16 App Router project scaffold
- [x] Tailwind CSS + glassmorphism design system
- [x] `WalletConnectButton` — MetaMask connect + auto-add Hardhat network
- [x] `ResumeUpload` — PDF upload form + fraud result display
- [x] `SubmitVerification` — employer verification form
- [x] `lib/api.ts` — typed REST wrappers
- [x] `lib/blockchain.ts` — browser-side ethers.js helpers
- [x] Responsive layout (mobile stack → desktop side-by-side)
- [x] Accessibility: skip link, `aria-label`, `aria-busy`, hidden decorative SVGs
- [x] TypeScript strict mode

### DevOps & Tooling
- [x] Root `package.json` with cross-workspace scripts (`npm test`, `npm run build`)
- [x] `.env.example` with all required variables
- [x] `start_all.bat` — Windows one-click startup script
- [x] `render.yaml` — Render blueprint (3 services)
- [x] `openapi.json` — OpenAPI 3.0 specification
- [x] Playwright e2e test suite (5 scenarios)
- [x] `npm run automate` — Chrome automation script
- [x] `README.md`, `SETUP_GUIDE.md`, `PROJECT_SUMMARY.md`

---

## Phase 2 — Quality & Hardening 🔄

### Testing
- [x] Backend validation unit tests (`utils/validation.test.ts`)
- [x] Hardhat contract tests (role control, verification, NFT minting, invalid inputs)
- [x] Frontend TypeScript strict typecheck (`npm run typecheck`)
- [x] Playwright e2e: wallet connect, submit verification, resume scan flows
- [ ] 🔲 AI service unit tests (mock joblib model)
- [ ] 🔲 Backend integration tests (mock ethers.js + mock AI client)
- [ ] 🔲 Smart contract fuzz tests (Hardhat + echidna)
- [ ] 🔲 Frontend component tests (React Testing Library)

### Security
- [x] Rate limiting
- [x] CORS whitelist
- [x] File type validation (MIME + extension)
- [x] Request/upload size limits
- [x] Security headers (X-Frame-Options, Referrer-Policy, etc.)
- [x] Reject Hardhat default keys in production
- [ ] 🔲 Smart contract audit (manual or Slither)
- [ ] 🔲 Input sanitisation for XSS in job details display
- [ ] 🔲 `helmet.js` for complete HTTP security header suite
- [ ] 🔲 Content Security Policy header

### Performance
- [x] API timeouts on AI client HTTP calls
- [x] Bounded upload and body sizes
- [x] Lazy blockchain client creation (no wallet init on health check)
- [ ] 🔲 PDF text extraction caching (hash-based, avoid re-parsing same PDF)
- [ ] 🔲 On-chain history caching (short TTL, reduce RPC calls)

---

## Phase 3 — Feature Expansion 🔲

### Real PDF Support
- [ ] OCR for scanned (image-based) PDF resumes (Tesseract / Google Vision API)
- [ ] Multi-page PDF support (already works; test with 10+ page docs)
- [ ] Resume parsing into structured fields (name, company, dates)

### Storage & Identity
- [ ] Firebase / Firestore user profile storage
- [ ] OAuth2 / social login (Google, GitHub) alongside MetaMask
- [ ] IPFS document pinning via nft.storage (`NFT_STORAGE_KEY` wired up)
- [ ] W3C Verifiable Credentials compatibility layer

### Blockchain & Web3
- [ ] Employer self-service onboarding flow (request `EMPLOYER_ROLE` → admin approves)
- [ ] Multi-chain support (Polygon Mumbai testnet, Arbitrum Goerli)
- [ ] WalletConnect v2 (mobile wallet support)
- [ ] Revocation mechanism (employer can flag a record as revoked)
- [ ] IPFS-backed tokenURI for NFT metadata (ERC-721 compliant metadata JSON)

### AI / ML Improvements
- [ ] Replace synthetic training data with a real labelled resume dataset
- [ ] Add more ML features: sentence embeddings, date logic validation
- [ ] Named Entity Recognition (NER) for company name extraction
- [ ] A/B model comparison dashboard
- [ ] Drift monitoring for the deployed model

### UI / UX
- [ ] Employee dashboard: view all own NFT badges + job history
- [ ] Employer dashboard: list all submitted verifications
- [ ] Admin panel: grant/revoke `EMPLOYER_ROLE`
- [ ] Dark/light mode toggle
- [ ] Internationalisation (i18n) with `next-intl`
- [ ] Toast notifications (replace inline alerts)
- [ ] Copy-to-clipboard for transaction hashes and wallet addresses

---

## Phase 4 — Production Deployment 🔲

### Testnet
- [ ] Deploy contract to Sepolia testnet
- [ ] Update `.env` with Sepolia RPC URL + real private key
- [ ] Verify contract on Etherscan (Sepolia)

### Cloud Deployment (Render / GCP)
- [ ] Deploy AI service to Render (Python, free tier)
- [ ] Deploy Backend to Render (Node, free tier)
- [ ] Deploy Frontend to Render / Vercel (Node, free tier)
- [ ] Set all production env vars in Render dashboard
- [ ] Wire `NEXT_PUBLIC_BACKEND_URL` to production backend URL

### CI/CD
- [ ] GitHub Actions workflow: lint + typecheck + test on push
- [ ] Auto-deploy to Render on merge to `main`
- [ ] Playwright e2e run against staging environment

---

## Bugs & Known Issues

| ID | Severity | Description | Status |
|---|---|---|---|
| BUG-01 | Low | `start_all.bat` deploys contract but does not auto-update `.env` with the new address | 🔲 Open |
| BUG-02 | Low | AI service worker process (child of uvicorn) may leave zombie on Windows CTRL+C | 🔲 Open |
| BUG-03 | Low | `pdfjs-dist` legacy worker path resolution may differ in production Node build vs dev `ts-node` | 🔲 Needs testing |
| BUG-04 | Low | Hardhat node must be restarted if contract is redeployed (new address doesn't match `.env`) | 🔲 Documentation only |
