import axios from "axios";

const AI_URL = process.env.AI_URL || "http://localhost:8001/predict";

export async function getFraudScore(
  resumeText: string,
  claimedExperience: string,
  mismatches: number
) {
  const resp = await axios.post(AI_URL, {
    resume_text: resumeText,
    claimed_experience: claimedExperience,
    unverified_mismatches: mismatches
  });
  return resp.data;
}
