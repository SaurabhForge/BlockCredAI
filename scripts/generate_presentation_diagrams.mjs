import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(__dirname, "../presentation_assets");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 1. High-Level Design (HLD) HTML
const hldHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  body { background: #0f172a; color: #f8fafc; padding: 30px; width: 1400px; height: 750px; display: flex; flex-direction: column; justify-content: center; }
  .title-bar { text-align: center; margin-bottom: 25px; }
  .title-bar h1 { font-size: 28px; color: #38bdf8; font-weight: 700; letter-spacing: 1px; }
  .title-bar p { font-size: 14px; color: #94a3b8; }
  .container { display: grid; grid-template-columns: 1fr 1.2fr 1fr 1.2fr; gap: 20px; height: 580px; }
  .tier { background: #1e293b; border: 1.5px solid #334155; border-radius: 12px; padding: 18px; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
  .tier-header { font-size: 16px; font-weight: 700; padding-bottom: 10px; margin-bottom: 15px; border-bottom: 2px solid; text-align: center; text-transform: uppercase; letter-spacing: 0.5px; }
  .t1 { border-color: #38bdf8; color: #38bdf8; }
  .t2 { border-color: #818cf8; color: #818cf8; }
  .t3 { border-color: #a855f7; color: #a855f7; }
  .t4 { border-color: #10b981; color: #10b981; }
  .card { background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 12px; margin-bottom: 14px; }
  .card h3 { font-size: 14px; color: #f1f5f9; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
  .card p { font-size: 11.5px; color: #94a3b8; line-height: 1.4; }
  .badge { display: inline-block; padding: 2px 7px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-top: 6px; }
  .b-blue { background: #0284c7; color: #fff; }
  .b-indigo { background: #4f46e5; color: #fff; }
  .b-purple { background: #7e22ce; color: #fff; }
  .b-green { background: #059669; color: #fff; }
  .arrow { text-align: center; color: #64748b; font-size: 18px; margin: 4px 0; }
  .flow-footer { background: #1e293b; border: 1px dashed #475569; border-radius: 8px; padding: 8px 16px; text-align: center; font-size: 12px; color: #cbd5e1; margin-top: 15px; }
</style>
</head>
<body>
  <div class="title-bar">
    <h1>BLOCKCREDAI : HIGH-LEVEL SYSTEM ARCHITECTURE (HLD)</h1>
    <p>End-to-End Multi-Tier Architecture: Presentation Tier, API Gateway, AI Intelligence, and Decentralized Blockchain</p>
  </div>
  <div class="container">
    <!-- Tier 1 -->
    <div class="tier">
      <div class="tier-header t1">1. Presentation Tier</div>
      <div class="card">
        <h3>💻 Next.js 14 Web Portal</h3>
        <p>Responsive client interface built with React 18, TailwindCSS & Turbopack.</p>
        <span class="badge b-blue">HTTP :3000</span>
      </div>
      <div class="card">
        <h3>🦊 Web3 Wallet (MetaMask)</h3>
        <p>Injected EIP-1193 provider managing private keys, message signing, and role authentication.</p>
        <span class="badge b-blue">Ethers.js v6</span>
      </div>
      <div class="card">
        <h3>📄 Candidate & Employer UI</h3>
        <p>PDF upload, real-time risk indicators, and on-chain credential dashboard.</p>
        <span class="badge b-blue">Client State</span>
      </div>
    </div>

    <!-- Tier 2 -->
    <div class="tier">
      <div class="tier-header t2">2. API Gateway & Logic</div>
      <div class="card">
        <h3>🛡️ Express.js REST Gateway</h3>
        <p>TypeScript controller managing security headers, rate limiting, and request validation.</p>
        <span class="badge b-indigo">PORT 4000</span>
      </div>
      <div class="card">
        <h3>📑 PDF Parser Engine</h3>
        <p>Extracts unstructured plain-text tokens from candidate resume PDFs via pdfjs-dist.</p>
        <span class="badge b-indigo">Multer Storage</span>
      </div>
      <div class="card">
        <h3>⚖️ Cross-Verification Matcher</h3>
        <p>Compares claimed experiences with cryptographically verified on-chain history records.</p>
        <span class="badge b-indigo">Mismatch Logic</span>
      </div>
    </div>

    <!-- Tier 3 -->
    <div class="tier">
      <div class="tier-header t3">3. AI Intelligence Tier</div>
      <div class="card">
        <h3>⚡ FastAPI Inference Engine</h3>
        <p>High-performance asynchronous microservice running ML fraud scoring.</p>
        <span class="badge b-purple">PORT 8001</span>
      </div>
      <div class="card">
        <h3>📊 TF-IDF NLP Vectorizer</h3>
        <p>Bi-gram (1,2) text vectorization extracting 500 dominant lexical risk features.</p>
        <span class="badge b-purple">Scikit-Learn</span>
      </div>
      <div class="card">
        <h3>🧠 Logistic Regression Model</h3>
        <p>Balanced class classifier outputting base probability with mismatch risk calibration.</p>
        <span class="badge b-purple">Joblib Model</span>
      </div>
    </div>

    <!-- Tier 4 -->
    <div class="tier">
      <div class="tier-header t4">4. Blockchain & Web3 Tier</div>
      <div class="card">
        <h3>⛓️ Ethereum / Hardhat Node</h3>
        <p>Local EVM Cancun execution node providing JSON-RPC ledger persistence.</p>
        <span class="badge b-green">RPC :8545</span>
      </div>
      <div class="card">
        <h3>📜 BlockCredAI.sol Contract</h3>
        <p>ERC-721 badge minting, AccessControl role security (Admin/Employer), and job records.</p>
        <span class="badge b-green">Solidity 0.8.24</span>
      </div>
      <div class="card">
        <h3>📦 IPFS Storage (nft.storage)</h3>
        <p>Decentralized immutable storage for employer appointment letters and cryptographic hashes.</p>
        <span class="badge b-green">Content Hash</span>
      </div>
    </div>
  </div>
  <div class="flow-footer">
    🔄 Communication Flow: Client UI ➔ REST API Gateway ➔ AI Model (/predict) & Blockchain RPC (eth_call / submitVerification) ➔ NFT Badges & Fraud Scoring
  </div>
</body>
</html>
`;

// 2. Low-Level Design (LLD) HTML
const lldHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  body { background: #0f172a; color: #f8fafc; padding: 25px; width: 1400px; height: 750px; display: flex; flex-direction: column; justify-content: center; }
  .title-bar { text-align: center; margin-bottom: 18px; }
  .title-bar h1 { font-size: 26px; color: #a855f7; font-weight: 700; }
  .title-bar p { font-size: 13px; color: #94a3b8; }
  .grid-lld { display: grid; grid-template-columns: 1.1fr 1fr 1fr; gap: 16px; height: 610px; }
  .box { background: #1e293b; border: 1.5px solid #334155; border-radius: 10px; padding: 14px; display: flex; flex-direction: column; overflow: hidden; }
  .box-title { font-size: 15px; font-weight: 700; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid; }
  .bt-purple { border-color: #c084fc; color: #c084fc; }
  .bt-blue { border-color: #38bdf8; color: #38bdf8; }
  .bt-emerald { border-color: #34d399; color: #34d399; }
  .class-block { background: #0f172a; border: 1px solid #475569; border-radius: 6px; margin-bottom: 12px; padding: 10px; font-size: 11px; }
  .class-name { font-weight: bold; font-size: 12px; color: #facc15; margin-bottom: 4px; }
  .class-section { border-top: 1px dashed #334155; padding-top: 4px; margin-top: 4px; }
  .method { color: #67e8f9; font-family: 'Consolas', monospace; }
  .prop { color: #fed7aa; font-family: 'Consolas', monospace; }
  .comment { color: #94a3b8; font-style: italic; }
</style>
</head>
<body>
  <div class="title-bar">
    <h1>BLOCKCREDAI : LOW-LEVEL DESIGN (LLD) & COMPONENT SCHEMA</h1>
    <p>Smart Contract Internal Structure, API Controller Endpoints, Data Schemas, and AI Scoring Pipeline</p>
  </div>
  <div class="grid-lld">
    <!-- Box 1: Smart Contract LLD -->
    <div class="box">
      <div class="box-title bt-purple">Smart Contract Design (BlockCredAI.sol)</div>
      <div class="class-block">
        <div class="class-name">Struct: JobRecord</div>
        <div class="prop">+ uint256 jobId</div>
        <div class="prop">+ address employer</div>
        <div class="prop">+ address employee</div>
        <div class="prop">+ string jobDetails</div>
        <div class="prop">+ uint256 startDate, endDate</div>
        <div class="prop">+ string ipfsHash</div>
        <div class="prop">+ uint256 tokenId</div>
      </div>
      <div class="class-block">
        <div class="class-name">Contract: BlockCredAI (ERC721, AccessControl)</div>
        <div class="class-section">
          <div class="comment">// State Variables</div>
          <div class="prop">- bytes32 EMPLOYER_ROLE</div>
          <div class="prop">- mapping(address => JobRecord[]) employeeHistory</div>
          <div class="prop">- uint256 _nextJobId, _nextTokenId</div>
        </div>
        <div class="class-section">
          <div class="comment">// Public Methods</div>
          <div class="method">+ submitVerification(employee, details, start, end, ipfs)</div>
          <div class="method">+ getEmployeeHistory(employee): JobRecord[]</div>
          <div class="method">+ verifyEmployment(employee, details): bool</div>
          <div class="method">+ addEmployer(employerAddress) [onlyRole(ADMIN)]</div>
        </div>
      </div>
    </div>

    <!-- Box 2: Backend API & DTO Schema -->
    <div class="box">
      <div class="box-title bt-blue">Backend Layer & Express Controllers</div>
      <div class="class-block">
        <div class="class-name">POST /api/scanResume</div>
        <div class="prop">Request: FormData (walletAddress, claimedExp, resume.pdf)</div>
        <div class="prop">Pipeline: Multer -> extractResumeText() -> getEmployeeHistory() -> estimateMismatchCount() -> getFraudScore()</div>
        <div class="prop">Response: { fraudProbability, explanation, onChainJobs[] }</div>
      </div>
      <div class="class-block">
        <div class="class-name">POST /api/submitVerification</div>
        <div class="prop">Request: JSON { employeeAddress, jobDetails, startDate, endDate, ipfsHash }</div>
        <div class="prop">Guards: requireWalletAddress(), requireUnixTimestamp()</div>
        <div class="prop">Signer: ethers.Wallet(PRIVATE_KEY, provider)</div>
        <div class="prop">Response: { success: true, txHash, blockNumber }</div>
      </div>
      <div class="class-block">
        <div class="class-name">Utility: validation.ts</div>
        <div class="method">+ requireWalletAddress(val, field) -> string</div>
        <div class="method">+ requireText(val, field, opts) -> string</div>
        <div class="method">+ requireUnixTimestamp(val, field) -> number</div>
      </div>
    </div>

    <!-- Box 3: AI Service & NLP Pipeline -->
    <div class="box">
      <div class="box-title bt-emerald">FastAPI Machine Learning Pipeline</div>
      <div class="class-block">
        <div class="class-name">Pydantic Schemas</div>
        <div class="prop">ResumePayload: { resume_text: str[10..10k], claimed_exp: str[10..2k], mismatches: int[0..10] }</div>
        <div class="prop">FraudResponse: { fraud_probability: float[0..1], explanation: str }</div>
      </div>
      <div class="class-block">
        <div class="class-name">Model Pipeline: Pipeline([tfidf, clf])</div>
        <div class="method">1. TfidfVectorizer(max_features=500, ngram=(1,2))</div>
        <div class="method">2. LogisticRegression(C=1.0, class_weight='balanced')</div>
        <div class="method">3. base_prob = clf.predict_proba([text])[0][1]</div>
      </div>
      <div class="class-block">
        <div class="class-name">Calibration & Risk Formula</div>
        <div class="comment">// Clean resume with 0 mismatches:</div>
        <div class="method">if (mismatches == 0 && base &lt;= 0.40): prob = 0.0</div>
        <div class="comment">// Unverified claims penalty boost:</div>
        <div class="method">boost = min(0.5, 0.15 * mismatches)</div>
        <div class="method">fraud_prob = min(1.0, base_prob + boost)</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 3. Project Flowchart HTML
const flowchartHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  body { background: #0f172a; color: #f8fafc; padding: 25px; width: 1400px; height: 750px; display: flex; flex-direction: column; justify-content: center; }
  .title-bar { text-align: center; margin-bottom: 20px; }
  .title-bar h1 { font-size: 26px; color: #34d399; font-weight: 700; }
  .title-bar p { font-size: 13px; color: #94a3b8; }
  .flow-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; height: 600px; }
  .flow-column { background: #1e293b; border: 1.5px solid #334155; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; }
  .flow-col-title { font-size: 16px; font-weight: bold; text-align: center; padding-bottom: 10px; margin-bottom: 16px; border-bottom: 2px solid; }
  .fc-blue { border-color: #38bdf8; color: #38bdf8; }
  .fc-green { border-color: #10b981; color: #10b981; }
  .step { background: #0f172a; border-radius: 8px; border: 1px solid #334155; padding: 12px; margin-bottom: 12px; position: relative; }
  .step-num { position: absolute; right: 12px; top: 10px; background: #334155; color: #fff; font-size: 10px; font-weight: bold; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; }
  .step-name { font-size: 13px; font-weight: bold; color: #f1f5f9; margin-bottom: 4px; }
  .step-desc { font-size: 11px; color: #94a3b8; line-height: 1.35; }
  .arrow-down { text-align: center; color: #64748b; font-size: 16px; margin: -6px 0 6px 0; font-weight: bold; }
  .decision { border-color: #f59e0b; background: #1e1b4b; }
  .decision .step-name { color: #fbbf24; }
</style>
</head>
<body>
  <div class="title-bar">
    <h1>BLOCKCREDAI : SYSTEM WORKFLOW & EXECUTION FLOWCHART</h1>
    <p>Parallel Operational Paths: Employer Verification Minting vs. Recruiter AI Resume Screening</p>
  </div>
  <div class="flow-grid">
    <!-- Path A: Employer Verification Flow -->
    <div class="flow-column">
      <div class="flow-col-title fc-green">PATH A: Employer Verification & NFT Minting</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-name">Employer Connects MetaMask</div>
        <div class="step-desc">Employer authenticates wallet via Ethers.js and accesses Employer Portal.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-name">Input Credential Details</div>
        <div class="step-desc">Fills Employee Wallet Address, Job Title/Details, Start/End Timestamps, IPFS Document CID.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step decision">
        <div class="step-num">3</div>
        <div class="step-name">EVM AccessControl Verification</div>
        <div class="step-desc">Smart contract verifies if msg.sender possesses verified EMPLOYER_ROLE permissions.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-name">On-Chain State Commit & NFT Minting</div>
        <div class="step-desc">Creates immutable JobRecord struct in employee history mapping and mints ERC-721 badge.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-name">Cryptographic Receipt Dispatched</div>
        <div class="step-desc">Transaction confirmed with Block # and TxHash. Employee credential permanently verified on-chain.</div>
      </div>
    </div>

    <!-- Path B: AI Resume Scan Flow -->
    <div class="flow-column">
      <div class="flow-col-title fc-blue">PATH B: Candidate Scan & AI Fraud Detection</div>
      <div class="step">
        <div class="step-num">1</div>
        <div class="step-name">Upload Resume PDF & Experience Claim</div>
        <div class="step-desc">User provides candidate wallet address, claimed experience text, and uploads PDF resume.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step">
        <div class="step-num">2</div>
        <div class="step-name">PDF Parsing & Blockchain History Fetch</div>
        <div class="step-desc">Node.js backend extracts text via pdfjs-dist and queries getEmployeeHistory() on smart contract.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step decision">
        <div class="step-num">3</div>
        <div class="step-name">Lexical Cross-Verification Matching</div>
        <div class="step-desc">Evaluates keyword overlap between claimed experience and cryptographically verified job records.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step">
        <div class="step-num">4</div>
        <div class="step-name">FastAPI NLP Fraud Inference (/predict)</div>
        <div class="step-desc">TF-IDF Vectorizer + Logistic Regression predicts base risk score + mismatch boost adjustment.</div>
      </div>
      <div class="arrow-down">▼</div>
      <div class="step">
        <div class="step-num">5</div>
        <div class="step-name">Dashboard Verdict & Badges Displayed</div>
        <div class="step-desc">UI displays calibrated Fraud Risk %, explanation, and verified on-chain NFT badges.</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 4. Project Infographic / Conceptual Photo HTML
const photoHtml = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  body { background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%); color: #f8fafc; padding: 30px; width: 1400px; height: 750px; display: flex; flex-direction: column; justify-content: center; }
  .header { text-align: center; margin-bottom: 25px; }
  .header h1 { font-size: 32px; font-weight: 800; background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .header p { font-size: 15px; color: #94a3b8; margin-top: 5px; }
  .grid-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .card-feat { background: rgba(30, 41, 59, 0.7); border: 1.5px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border-radius: 14px; padding: 22px; box-shadow: 0 15px 35px rgba(0,0,0,0.4); }
  .icon-circle { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 15px; }
  .ic-1 { background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #38bdf8; }
  .ic-2 { background: rgba(168, 85, 247, 0.2); color: #a855f7; border: 1px solid #a855f7; }
  .ic-3 { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid #10b981; }
  .card-feat h2 { font-size: 18px; margin-bottom: 10px; color: #f8fafc; }
  .card-feat p { font-size: 13px; color: #94a3b8; line-height: 1.5; margin-bottom: 12px; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag { background: #0f172a; border: 1px solid #334155; padding: 4px 8px; border-radius: 6px; font-size: 11px; color: #cbd5e1; }
  .banner-stat { margin-top: 25px; background: rgba(15, 23, 42, 0.8); border: 1px solid #334155; border-radius: 12px; padding: 15px 25px; display: flex; justify-content: space-around; text-align: center; }
  .stat h3 { font-size: 24px; color: #38bdf8; font-weight: bold; }
  .stat p { font-size: 12px; color: #94a3b8; }
</style>
</head>
<body>
  <div class="header">
    <h1>BLOCKCREDAI : DECENTRALIZED IDENTITY & AI TRUST ECOSYSTEM</h1>
    <p>Eliminating Resume Fraud through Smart Contract Verification and Machine Learning Auditing</p>
  </div>
  <div class="grid-features">
    <div class="card-feat">
      <div class="icon-circle ic-1">⛓️</div>
      <h2>Cryptographic Verifiable Badges</h2>
      <p>Employment credentials are non-transferable ERC-721 tokens permanently anchored on the Ethereum Virtual Machine, eliminating fake experience certificates.</p>
      <div class="tags">
        <span class="tag">Solidity 0.8.24</span>
        <span class="tag">ERC-721 Soulbound</span>
        <span class="tag">OpenZeppelin</span>
      </div>
    </div>
    <div class="card-feat">
      <div class="icon-circle ic-2">🤖</div>
      <h2>AI Resume Fraud Detection</h2>
      <p>Natural Language Processing pipeline analyzes resume lexical patterns, claims consistency, and cross-references against on-chain records to detect inflation or fabrications.</p>
      <div class="tags">
        <span class="tag">FastAPI</span>
        <span class="tag">TF-IDF Vectorizer</span>
        <span class="tag">Logistic Regression</span>
      </div>
    </div>
    <div class="card-feat">
      <div class="icon-circle ic-3">⚡</div>
      <h2>Zero-Trust Instant Verification</h2>
      <p>Reduces enterprise background verification cycle from 2-4 weeks down to sub-second cryptographic lookups with zero intermediary verification agency fees.</p>
      <div class="tags">
        <span class="tag">Sub-Second Lookup</span>
        <span class="tag">Tamper-Proof</span>
        <span class="tag">Decentralized IPFS</span>
      </div>
    </div>
  </div>
  <div class="banner-stat">
    <div class="stat"><h3>0%</h3><p>Fraud with Cryptographic Match</p></div>
    <div class="stat"><h3>100%</h3><p>Immutable Ledger Records</p></div>
    <div class="stat"><h3>&lt; 1 sec</h3><p>Instant On-Chain Verification</p></div>
    <div class="stat"><h3>$0</h3><p>Intermediary Agency Cost</p></div>
  </div>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 750 } });

  // Render HLD
  await page.setContent(hldHtml);
  await page.screenshot({ path: path.join(outputDir, "hld_architecture.png") });
  console.log("Generated hld_architecture.png");

  // Render LLD
  await page.setContent(lldHtml);
  await page.screenshot({ path: path.join(outputDir, "lld_architecture.png") });
  console.log("Generated lld_architecture.png");

  // Render Flowchart
  await page.setContent(flowchartHtml);
  await page.screenshot({ path: path.join(outputDir, "project_flowchart.png") });
  console.log("Generated project_flowchart.png");

  // Render Project Photo / Ecosystem Infographic
  await page.setContent(photoHtml);
  await page.screenshot({ path: path.join(outputDir, "project_photo_ecosystem.png") });
  console.log("Generated project_photo_ecosystem.png");

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
