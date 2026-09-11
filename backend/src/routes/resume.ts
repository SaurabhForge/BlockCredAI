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

async function extractResumeText(file: Express.Multer.File): Promise<string> {
  try {
    // Use the legacy Node.js build of pdfjs-dist and point workerSrc to the
    // worker file so it can be loaded as a worker thread in Node.js.
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    // pdfjs-dist v6 uses package exports that block require.resolve for subpaths,
    // so we construct the worker path directly using path.resolve.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { pathToFileURL } = require("url");
    const workerPath = pathToFileURL(
      path.resolve(__dirname, "../../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs")
    ).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

    const uint8 = new Uint8Array(file.buffer);
    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      useSystemFonts: true,
    } as any);
    const pdfDoc = await loadingTask.promise;

    const pageTexts: string[] = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const pageText = (content.items as any[])
        .map((item: any) => item.str)
        .join(" ");
      pageTexts.push(pageText);
    }

    const text = pageTexts.join("\n").replace(/\s+/g, " ").trim();

    if (!text) {
      throw new Error("No selectable text found in PDF.");
    }

    return text.slice(0, 10000);
  } catch (error) {
    console.warn("Unable to extract text from the submitted resume PDF.", error);
    throw new AppError("Resume PDF could not be read. Please upload a text-based PDF.", 400);
  }
}

function estimateMismatchCount(claimedExperience: string, verifiedJobs: { jobDetails: string }[]): number {
  // No on-chain history means we have nothing to compare against — not a mismatch.
  // The AI model's base text score handles the risk assessment independently.
  if (verifiedJobs.length === 0) {
    return 0;
  }

  const normalizedClaim = claimedExperience.toLowerCase();
  const verifiedText = verifiedJobs.map((job) => job.jobDetails.toLowerCase()).join(" ");
  const claimKeywords = normalizedClaim
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);

  const unmatchedKeywords = claimKeywords.filter((token) => !verifiedText.includes(token));
  // Only flag as mismatch if the majority of keywords in the claim are absent from verified records
  return unmatchedKeywords.length > Math.max(3, claimKeywords.length * 0.6) ? 1 : 0;
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

      const resumeText = await extractResumeText(req.file);

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
