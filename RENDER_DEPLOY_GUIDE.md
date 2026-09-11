# 🚀 Deploying BlockCredAI to Render

This repository is configured for deployment on [Render](https://render.com) using the included `render.yaml` Blueprint or via manual Web Services.

---

## ⚡ Method 1: Automatic 1-Click Deployment (Recommended)

The repository includes a `render.yaml` file that configures all three services with correct build commands, start commands, root directories, and environment variables.

1. Go to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** at the top right and select **Blueprint**.
3. Connect your GitHub account and select your repository:
   **`SaurabhForge/BlockCredAI`**
4. Render will read `render.yaml` and list the 3 services:
   * **`blockcredai-frontend`** (Next.js web application)
   * **`blockcredai-backend`** (Node.js/Express API)
   * **`blockcredai-ai`** (Python/FastAPI Fraud Detector)
5. Click **Apply**.
6. Render will automatically build and deploy all services!

---

## 🛠️ Method 2: Manual Web Service Setup (Step-by-Step)

If you prefer to configure services manually on the Render dashboard:

### 1. Deploy the Backend API (`blockcredai-backend`)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect `https://github.com/SaurabhForge/BlockCredAI`.
3. Configure the following fields:
   * **Name**: `blockcredai-backend`
   * **Region**: Oregon (or nearest to you)
   * **Branch**: `main`
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Plan**: `Free`
4. In **Environment Variables**, add:
   * `NODE_ENV` = `production`
   * `PORT` = `10000`
   * `CORS_ORIGIN` = `*`
   * `AI_URL` = `https://blockcredai-ai.onrender.com/predict`
   * `RPC_URL` = `https://ethereum-sepolia-rpc.publicnode.com`
5. Click **Deploy Web Service**.
6. Copy your deployed Backend URL (e.g., `https://blockcredai-backend.onrender.com`).

---

### 2. Deploy the Frontend (`blockcredai-frontend`)
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect `https://github.com/SaurabhForge/BlockCredAI`.
3. Configure the following fields:
   * **Name**: `blockcredai-frontend`
   * **Region**: Oregon (match backend region)
   * **Branch**: `main`
   * **Root Directory**: `frontend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install && npm run build`
   * **Start Command**: `npm start`
   * **Plan**: `Free`
4. In **Environment Variables**, add:
   * `NODE_ENV` = `production`
   * `NEXT_PUBLIC_BACKEND_URL` = Your backend URL (e.g. `https://blockcredai-backend.onrender.com`)
5. Click **Deploy Web Service**.

---

### 3. (Optional) Deploy the Python AI Service (`blockcredai-ai`)
1. Click **New +** → **Web Service**.
2. Connect `https://github.com/SaurabhForge/BlockCredAI`.
3. Configure:
   * **Name**: `blockcredai-ai`
   * **Root Directory**: `backend/ai-service`
   * **Runtime**: `Python`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
   * **Plan**: `Free`
4. In **Environment Variables**:
   * `PYTHON_VERSION` = `3.11.9`
5. Click **Deploy Web Service**.

*(Note: If the AI service is not deployed or is waking up from sleep, the backend automatically uses an intelligent fallback heuristic, ensuring zero downtime.)*

---

## 🔒 Notes on Free Tier
* Render Free Tier spins down inactive web services after 15 minutes of inactivity. When a request arrives, it may take 30–50 seconds to wake up (cold start).
* Keep CORS settings as configured (`*` or `.onrender.com`), which has already been configured in `backend/src/index.ts`.
