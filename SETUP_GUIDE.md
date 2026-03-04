# BlockCredAI - Complete Setup Guide

## Project Overview

BlockCredAI is a full-stack decentralized employment verification system with AI-based resume fraud detection. It combines blockchain (Solidity), Next.js frontend, Node.js backend, and Python AI services.

## Project Structure

```
BlockCredAI/
├── blockchain/          # Hardhat + Solidity smart contracts
│   ├── contracts/       # BlockCredAI.sol
│   ├── scripts/         # Deployment scripts
│   ├── test/           # Contract tests
│   ├── hardhat.config.ts
│   └── package.json
├── backend/            # Node.js/Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   └── package.json
├── frontend/           # Next.js 14 React app
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── ai-service/         # FastAPI Python service
│   ├── app.py
│   ├── model/
│   └── requirements.txt
├── .env.example
└── README.md
```

## Local Setup (5 Steps)

### Step 1: Clone Repository

```bash
git clone https://github.com/SaurabhForge/BlockCredAI.git
cd BlockCredAI
```

### Step 2: Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your values
```

### Step 3: Install Dependencies

```bash
# Blockchain
cd blockchain && npm install && cd ..

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# AI Service
cd ai-service && pip install -r requirements.txt && cd ..
```

### Step 4: Compile Smart Contract

```bash
cd blockchain
npm run compile
cd ..
```

### Step 5: Train AI Model

```bash
cd ai-service
python model/train.py
cd ..
```

## Running Locally (5 Terminals)

**Terminal 1: Start Hardhat Node**
```bash
cd blockchain
npx hardhat node
```

**Terminal 2: Deploy Contract**
```bash
cd blockchain
npx hardhat run scripts/deploy.ts --network localhost
# Copy deployed address to .env as BLOCKCRED_CONTRACT_ADDRESS
```

**Terminal 3: Start AI Service**
```bash
cd ai-service
uvicorn app:app --reload --port 8001
```

**Terminal 4: Start Backend**
```bash
cd backend
npm run dev
```

**Terminal 5: Start Frontend**
```bash
cd frontend
npm run dev
# Open http://localhost:3000
```

## Tech Stack

- **Blockchain**: Solidity 0.8.20, Hardhat, OpenZeppelin
- **Smart Contracts**: ERC721 NFT badges, AccessControl roles
- **Frontend**: Next.js 14, React, Tailwind CSS, ethers.js
- **Backend**: Node.js, Express, TypeScript
- **AI/ML**: Python, FastAPI, scikit-learn
- **Database**: Firebase/Firestore (optional), IPFS

## Key Features

✅ **Blockchain-based Employment Verification**
- ERC721 NFT badges for verified employment
- Immutable job records on-chain
- Role-based access control (employers, admins)

✅ **AI Resume Fraud Detection**
- TF-IDF + Logistic Regression model
- Real-time fraud probability scoring
- Mismatch detection between blockchain and resume

✅ **Full-Stack Integration**
- MetaMask wallet connection
- PDF resume upload & parsing
- IPFS document storage (optional)
- Responsive dark-mode UI

## API Endpoints

### POST /api/scanResume
Scans resume for fraud and checks blockchain history

```bash
curl -X POST http://localhost:4000/api/scanResume \
  -F "resume=@resume.pdf" \
  -F "walletAddress=0x..." \
  -F "claimedExperience=Worked at XYZ 2020-2022"
```

### POST /api/submitVerification
Employer submits employment verification

```bash
curl -X POST http://localhost:4000/api/submitVerification \
  -H "Content-Type: application/json" \
  -d '{
    "employeeAddress": "0x...",
    "jobDetails": "SDE @ Google",
    "startDate": 1609459200,
    "endDate": 1640995200,
    "ipfsHash": "Qm..."
  }'
```

## Smart Contract Functions

### submitVerification()
Employer submits verified job and mints NFT badge

### getEmployeeHistory()
Returns all verified job records for employee

### verifyEmployment()
Checks if specific job is verified for employee

## Demo Flow

1. Employee connects MetaMask
2. Uploads resume PDF
3. AI analyzes for fraud (background check)
4. Employer submits verification via contract
5. NFT badge minted to employee
6. Future scans show "Verified" status

## Deployment

### Sepolia Testnet

```bash
# In blockchain/
npx hardhat run scripts/deploy.ts --network sepolia
```

### Backend Deployment
- Render.com
- Railway.app
- Heroku

### Frontend Deployment
- Vercel
- Netlify

### AI Service Deployment
- Hugging Face Spaces
- AWS Lambda

## Next Steps

1. Add more comprehensive tests
2. Implement real PDF parsing
3. Integrate actual Firestore
4. Deploy to testnet
5. User authentication (OAuth2)
6. Enhanced UI/UX improvements

## Resources

- [Hardhat Docs](https://hardhat.org/)
- [Next.js Docs](https://nextjs.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [ethers.js](https://docs.ethers.org/)

## Support

For issues and questions, please open an issue on GitHub.

**Happy Building! 🚀**
