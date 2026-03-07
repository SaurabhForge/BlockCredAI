import axios from "axios";

const AI_URL = process.env.AI_URL || "http://localhost:8001/predict";

export async function getFraudScore(
  resumeText: string,
  claimedExperience: string,
  mismatches: number
) {
  try {
    const resp = await axios.post(AI_URL, {
      resume_text: resumeText,
      claimed_experience: claimedExperience,
      unverified_mismatches: mismatches
    });
    return resp.data;
  } catch (error) {
    console.warn(`[AI Service] AI prediction failed or service unreachable (${AI_URL}). Returning mock response.`);
    return {
      fraud_probability: mismatches > 0 ? 0.85 : 0.15,
      explanation: mismatches > 0
        ? "Mock Analysis: High probability of fraud due to mismatches in claimed experience vs verified on-chain history."
        : "Mock Analysis: Low probability of fraud. Claims match the provided history.",
      components: {
        text_analysis_score: 0.1,
        mismatch_penalty: 0.0
      }
    };
  }
}
