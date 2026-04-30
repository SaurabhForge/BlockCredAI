import axios from "axios";
import { config } from "../config";

type FraudScoreResponse = {
  fraud_probability: number;
  explanation: string;
  components?: {
    text_analysis_score: number;
    mismatch_penalty: number;
  };
};

function normalizeAiResponse(data: unknown, mismatches: number): FraudScoreResponse {
  if (
    typeof data === "object" &&
    data !== null &&
    "fraud_probability" in data &&
    "explanation" in data
  ) {
    const response = data as FraudScoreResponse;
    return {
      fraud_probability: Math.min(1, Math.max(0, Number(response.fraud_probability))),
      explanation: String(response.explanation)
    };
  }

  return fallbackScore(mismatches);
}

function fallbackScore(mismatches: number): FraudScoreResponse {
  return {
    fraud_probability: mismatches > 0 ? 0.85 : 0.15,
    explanation:
      mismatches > 0
        ? "Fallback analysis: high risk because claimed experience was not found in verified on-chain history."
        : "Fallback analysis: low risk because no obvious mismatch was found against verified on-chain history.",
    components: {
      text_analysis_score: mismatches > 0 ? 0.35 : 0.1,
      mismatch_penalty: mismatches > 0 ? 0.5 : 0
    }
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
      {
        resume_text: resumeText,
        claimed_experience: claimedExperience,
        unverified_mismatches: mismatches
      },
      { timeout: 5000 }
    );
    return normalizeAiResponse(resp.data, mismatches);
  } catch (error) {
    console.warn(
      `[AI Service] Prediction failed or service unreachable (${config.aiUrl}). Returning fallback response.`
    );
    return fallbackScore(mismatches);
  }
}
