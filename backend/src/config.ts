import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

function readCsv(value: string | undefined): string[] {
  return (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: readNumber(process.env.PORT, 4000),
  aiUrl: process.env.AI_URL || "http://localhost:8001/predict",
  rpcUrl: process.env.RPC_URL || "http://127.0.0.1:8545",
  contractAddress: process.env.BLOCKCRED_CONTRACT_ADDRESS || "",
  privateKey: process.env.PRIVATE_KEY || "",
  allowedOrigins: readCsv(process.env.CORS_ORIGIN || process.env.CORS_ORIGINS),
  requestLimit: process.env.REQUEST_BODY_LIMIT || "100kb",
  uploadLimitBytes: readNumber(process.env.UPLOAD_LIMIT_BYTES, 2 * 1024 * 1024),
  rateLimitWindowMs: readNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: readNumber(process.env.RATE_LIMIT_MAX, 100),
  publicApiUrl: process.env.GCP_API_URL || process.env.API_URL || "http://localhost:4000"
};

export const isProduction = config.nodeEnv === "production";

export function getAllowedOrigins(): string[] {
  return Array.from(new Set([...DEFAULT_ALLOWED_ORIGINS, ...config.allowedOrigins]));
}
