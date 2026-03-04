import { Router } from "express";
import multer from "multer";
import { getEmployeeHistory } from "../services/blockchain";
import { getFraudScore } from "../services/aiClient";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * POST /api/scanResume
 * body: walletAddress, claimedExperience (string), pdf file
 */
router.post(
  "/",
  upload.single("resume"),
  async (req, res, next) => {
    try {
      const { walletAddress, claimedExperience } = req.body;

      if (!walletAddress || !claimedExperience) {
        return res.status(400).json({ message: "Missing fields" });
      }

      // Simplified: extract text from PDF bytes (stub)
      const resumeText = `Resume for ${walletAddress}. Claims: ${claimedExperience}`;

      const onChainHistory = await getEmployeeHistory(walletAddress);
      const lowerClaim = claimedExperience.toLowerCase();

      let mismatches = 0;
      if (onChainHistory.length === 0 && lowerClaim.includes("worked")) {
        mismatches = 1;
      }

      const aiResult = await getFraudScore(
        resumeText,
        claimedExperience,
        mismatches
      );
      res.json({
        fraudProbability: aiResult.fraud_probability,
        explanation: aiResult.explanation,
        onChainJobs: onChainHistory
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
