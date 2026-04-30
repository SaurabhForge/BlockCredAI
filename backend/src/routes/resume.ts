import { Router } from "express";
import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { config } from "../config";
import { getEmployeeHistory } from "../services/blockchain";
import { getFraudScore } from "../services/aiClient";
import { AppError } from "../utils/errors";
import { requireText, requireWalletAddress } from "../utils/validation";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.uploadLimitBytes,
    files: 1
  },
  fileFilter(_req: Request, file: Express.Multer.File, callback: FileFilterCallback) {
    if (file.mimetype !== "application/pdf") {
      callback(new AppError("Resume must be uploaded as a PDF file.", 400));
      return;
    }

    callback(null, true);
  }
});
const router = Router();

function estimateMismatchCount(claimedExperience: string, verifiedJobs: { jobDetails: string }[]): number {
  if (verifiedJobs.length === 0) {
    return 1;
  }

  const normalizedClaim = claimedExperience.toLowerCase();
  const verifiedText = verifiedJobs.map((job) => job.jobDetails.toLowerCase()).join(" ");
  const claimKeywords = normalizedClaim
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);

  const unmatchedKeywords = claimKeywords.filter((token) => !verifiedText.includes(token));
  return unmatchedKeywords.length > Math.max(3, claimKeywords.length / 2) ? 1 : 0;
}

/**
 * POST /api/scanResume
 * body: walletAddress, claimedExperience (string), pdf file
 */
router.post(
  "/",
  upload.single("resume"),
  async (req, res, next) => {
    try {
      const walletAddress = requireWalletAddress(req.body.walletAddress, "walletAddress");
      const claimedExperience = requireText(req.body.claimedExperience, "claimedExperience", {
        min: 10,
        max: 2000
      });

      if (!req.file) {
        throw new AppError("Resume PDF is required.", 400);
      }

      const resumeText = [
        `Resume filename: ${req.file.originalname}`,
        `Wallet: ${walletAddress}`,
        `Claims: ${claimedExperience}`
      ].join("\n");

      const onChainHistory = await getEmployeeHistory(walletAddress);
      const mismatches = estimateMismatchCount(claimedExperience, onChainHistory);

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
