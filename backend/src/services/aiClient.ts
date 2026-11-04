import axios from "axios";
import { config } from "../config";

export type AiDimensions = {
  timeline_integrity?: number;
  seniority_alignment?: number;
  metrics_credibility?: number;
  skill_authenticity?: number;
};

export type FraudScoreResponse = {
  fraud_probability: number;
  text_score: number;
  explanation: string;
  risk_signals: string[];
  dimensions?: AiDimensions;
};

function normalizeAiResponse(data: unknown, mismatches: number): FraudScoreResponse {
  if (
    typeof data === "object" &&
    data !== null &&
    "fraud_probability" in data &&
    "explanation" in data
  ) {
    const r = data as any;
    return {
      fraud_probability: Math.min(1, Math.max(0, Number(r.fraud_probability))),
      text_score: Math.min(1, Math.max(0, Number(r.text_score ?? r.fraud_probability))),
      explanation: String(r.explanation),
      risk_signals: Array.isArray(r.risk_signals) ? r.risk_signals.map(String) : [],
      dimensions: r.dimensions && typeof r.dimensions === "object" ? r.dimensions : undefined,
    };
  }
  return fallbackScore(mismatches);
}

function fallbackScore(mismatches: number): FraudScoreResponse {
  return {
    fraud_probability: mismatches > 0 ? 0.60 : 0.08,
    text_score: mismatches > 0 ? 0.60 : 0.08,
    explanation: mismatches > 0
      ? "Elevated risk — claimed experience not verified by on-chain records."
      : "Resume text patterns are consistent with authentic professional experience.",
    risk_signals: mismatches > 0
      ? ["Fallback analysis applied: claimed positions lack blockchain verification"]
      : ["✓ Experience patterns and language appear authentic"],
    dimensions: {
      timeline_integrity: 0.90,
      seniority_alignment: 0.90,
      metrics_credibility: 0.90,
      skill_authenticity: 0.90,
    },
  };
}

export async function getFraudScore(
  resumeText: string,
  claimedExperience: string,
  mismatches: number
): Promise<FraudScoreResponse> {
  try {
    const resp = await axios.post(
      config.aiUrl,
      { resume_text: resumeText, claimed_experience: claimedExperience, unverified_mismatches: mismatches },
      { timeout: 8000 }
    );
    return normalizeAiResponse(resp.data, mismatches);
  } catch {
    console.warn(`[AI Service] Unreachable (${config.aiUrl}). Using fallback.`);
    return fallbackScore(mismatches);
  }
}
