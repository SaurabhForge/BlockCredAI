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
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
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
    if (!text) throw new Error("No selectable text found in PDF.");
    return text.slice(0, 10000);
  } catch (error) {
    console.warn("Unable to extract text from the submitted resume PDF.", error);
    throw new AppError("Resume PDF could not be read. Please upload a text-based PDF.", 400);
  }
}

/**
 * Count how many specific employment assertions exist in the claimed experience text.
 * Returns 0 for freshers/generic text, 1-6 for texts with concrete company/role claims.
 */
function countSpecificEmploymentClaims(text: string): number {
  const lower = text.toLowerCase();
  const patterns: RegExp[] = [
    /(worked|employed|working|interned|serving)\s+(at|for|with|in)\s+[a-z0-9]/g,
    /(engineer|developer|manager|analyst|lead|director|consultant|executive|officer|intern|architect|designer|associate)\s+(at|for|in|with)\s+[a-z0-9]/g,
    /\bat\s+[a-z0-9]{3,}/g,
    /\d+\s*(year|month|yr)s?\s*(of\s*)?(experience|at|in)/g,
    /(engineer|developer|manager|analyst|lead|director|consultant|executive|intern)\s*[,:\-–]\s*[a-z0-9]/g,
    /20\d\d\s*[-–to]+\s*(20\d\d|present|current)/g,
    /(company|employer|organization)\s*[:=]\s*[a-z0-9]/g,
  ];
  let total = 0;
  for (const pattern of patterns) {
    total += (lower.match(pattern) ?? []).length;
  }
  return Math.min(6, total);
}

// Words that appear in claims/records but carry no identity value for comparison
const MATCH_STOPWORDS = new Set([
  "years", "year", "month", "months", "experience", "work", "worked",
  "working", "with", "from", "have", "having", "team", "role", "position",
  "company", "firm", "organization", "using", "responsible", "developed",
  "managed", "built", "designed", "created", "leading", "senior", "junior",
  "multiple", "various", "overall", "total", "more", "than", "over",
]);

function estimateMismatchCount(claimedExperience: string, verifiedJobs: { jobDetails: string }[]): number {
  if (verifiedJobs.length === 0) {
    // No on-chain records. Return the claim count as mismatches so app.py
    // applies the correct penalty for unverifiable assertions.
    return countSpecificEmploymentClaims(claimedExperience);
  }

  const normalizedClaim = claimedExperience.toLowerCase();
  const verifiedText = verifiedJobs.map((job) => job.jobDetails.toLowerCase()).join(" ");

  // Extract meaningful identity tokens — filter stopwords and short tokens
  const toIdentityTokens = (text: string): string[] =>
    text.split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !MATCH_STOPWORDS.has(t));

  const claimKeywords = toIdentityTokens(normalizedClaim);
  const verifiedKeywords = new Set(toIdentityTokens(verifiedText));

  // A claim token is matched if it is in the verified token set OR appears as
  // a substring of the full verified text (catches plurals, abbreviations)
  const unmatchedKeywords = claimKeywords.filter(
    (token) => !verifiedKeywords.has(token) && !verifiedText.includes(token)
  );

  if (unmatchedKeywords.length === 0) return 0;

  // Proportional mismatch count (1–4)
  const ratio = unmatchedKeywords.length / Math.max(1, claimKeywords.length);
  if (ratio < 0.5) return 1;   // minority mismatch — minor discrepancy
  if (ratio < 0.75) return 2;  // majority mismatch — significant discrepancy
  return 4;                    // almost nothing matches — strong mismatch
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

      const aiResult = await getFraudScore(resumeText, claimedExperience, mismatches);
      let finalFraudProbability = aiResult.fraud_probability;
      let finalExplanation = aiResult.explanation;

      if (onChainHistory.length === 0) {
        const claimCount = countSpecificEmploymentClaims(claimedExperience);

        if (claimCount > 0) {
          // Candidate asserts specific past employment, but has ZERO verified
          // records on-chain (person did not work there / unverified claim) -> 100% Fraud
          finalFraudProbability = 1.0;
          finalExplanation =
            `100% Fraud Detected: No blockchain-verified employment records found for this candidate. ` +
            `The candidate claims ${claimCount} specific past employment position(s), but there is zero ` +
            `cryptographic verification on-chain confirming they worked there.`;
        } else {
          // Fresher or no specific corporate claims — rely on AI text score only
          finalFraudProbability = aiResult.fraud_probability;
          finalExplanation =
            `No on-chain corporate records found. Candidate is an entry-level applicant with no ` +
            `previous employment claims. AI text analysis indicates low fraud risk (${Math.round(aiResult.fraud_probability * 100)}%).`;
        }
      } else if (mismatches === 0) {
        // Records exist and all claims match on-chain verified records -> 0% Fraud
        if (aiResult.fraud_probability <= 0.5) {
          finalFraudProbability = 0;
          finalExplanation =
            `Verified on-chain: 0% fraud risk. All claimed experience matches ` +
            `${onChainHistory.length} cryptographic record(s) verified by employer(s).`;
        } else {
          finalFraudProbability = Math.max(0, Math.round((aiResult.fraud_probability - 0.3) * 100) / 100);
          finalExplanation =
            `Partially verified on-chain (${onChainHistory.length} record(s)), ` +
            `but resume wording contains unusual patterns.`;
        }
      } else {
        // Records exist but candidate claims employment that DOES NOT match verified records -> 100% Fraud
        finalFraudProbability = 1.0;
        finalExplanation =
          `100% Fraud Detected: Critical mismatch with blockchain employment records. ` +
          `Candidate claims employment that contradicts or does not match their ` +
          `${onChainHistory.length} verified on-chain record(s).`;
      }

      // If AI detects severe fraudulent text (impossible timeline, extreme inflation)
      if (aiResult.fraud_probability >= 0.8) {
        finalFraudProbability = 1.0;
        finalExplanation =
          `100% Fraud Detected: AI analysis identified severe fraudulent patterns, ` +
          `impossible career timelines, or fabricated credentials in the resume text.`;
      }

      res.json({
        fraudProbability: finalFraudProbability,
        explanation: finalExplanation,
        onChainJobs: onChainHistory
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
