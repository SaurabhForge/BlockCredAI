import { Router } from "express";
import multer from "multer";
import { AppError } from "../utils/errors";
import { requireWalletAddress } from "../utils/validation";
import { getEmployeeHistory } from "../services/blockchain";
import { getFraudScore } from "../services/aiClient";

const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (_req, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      callback(new AppError("Only PDF files are supported.", 400));
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

// Directory of recognized corporate employers
const RECOGNIZED_COMPANIES = new Set([
  // Tech & Cloud Giants
  "google", "microsoft", "amazon", "apple", "meta", "facebook", "netflix", "openai", "nvidia", "intel",
  "ibm", "oracle", "cisco", "salesforce", "adobe", "qualcomm", "amd", "uber", "airbnb", "twitter",
  "linkedin", "spotify", "stripe", "coinbase", "dropbox", "github", "palantir", "snowflake", "databricks",
  // IT & Global Consulting
  "tcs", "infosys", "wipro", "hcl", "tech mahindra", "persistent", "cognizant", "accenture", "capgemini",
  "deloitte", "pwc", "ey", "kpmg", "mckinsey", "bcg", "bain", "slalom",
  // Asian Tech / Consumer / Fintech
  "flipkart", "swiggy", "zomato", "razorpay", "paytm", "grab", "gojek", "shopee", "byju", "cred",
  // Banking & Finance
  "goldman sachs", "jp morgan", "morgan stanley", "citigroup", "hsbc", "barclays", "standard chartered",
  // Demo & Testing Companies Seeded on BlockCredAI
  "techcorp", "innovatelabs", "startupxyz", "financehub", "acme corp"
]);

const NON_COMPANY_WORDS = new Set([
  "experience", "least", "most", "various", "multiple", "present", "current",
  "digital", "technical", "scale", "global", "startup", "internship", "intern",
  "developer", "engineer", "manager", "analyst", "lead", "team", "years", "months",
  "role", "work", "worked", "working", "position", "company", "firm", "client", "project",
  "school", "college", "university", "institute", "academy", "camp", "bootcamp",
  "solutions", "services", "technologies", "software", "development", "systems",
  "august", "september", "october", "november", "december", "january", "february", "march", "april", "may", "june", "july"
]);

function extractCompanyFromJobDetails(jobDetails: string): string | null {
  if (!jobDetails) return null;

  const lower = jobDetails.toLowerCase();
  for (const comp of RECOGNIZED_COMPANIES) {
    if (new RegExp(`\\b${comp}\\b`, "i").test(lower)) {
      return comp.replace(/\s+/g, "");
    }
  }

  const m = jobDetails.match(/(?:at|for|with|in|@)\s+([A-Za-z0-9&.\-_]+)/i);
  if (m) {
    const raw = m[1].toLowerCase().replace(/[^a-z0-9]/g, "");
    if (raw.length >= 3 && !NON_COMPANY_WORDS.has(raw)) {
      return raw;
    }
  }

  return null;
}

export type ExtractedProfile = {
  candidateName: string;
  primaryRole: string;
  detectedEmployers: string[];
  detectedEducation: string;
  estimatedExperienceYears: number;
};

/**
 * Parses structured candidate profile entities from raw resume text.
 */
function parseResumeEntities(resumeText: string): ExtractedProfile {
  const lower = resumeText.toLowerCase();

  // 1. Candidate Name (from top lines)
  const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let candidateName = "Candidate";
  for (const line of lines.slice(0, 5)) {
    const lLower = line.toLowerCase();
    if (
      !lLower.includes("resume") &&
      !lLower.includes("curriculum") &&
      !lLower.includes("@") &&
      !lLower.includes("phone") &&
      !lLower.includes("http") &&
      !lLower.includes("experience") &&
      !lLower.includes("summary") &&
      !lLower.includes("education") &&
      line.length >= 3 &&
      line.length <= 40 &&
      /^[A-Za-z\s.'-]+$/.test(line)
    ) {
      candidateName = line;
      break;
    }
  }

  // 2. Primary Role
  const roles = [
    "Full Stack Engineer", "Senior Software Engineer", "Software Engineer",
    "Frontend Developer", "Backend Developer", "DevOps Engineer",
    "Data Scientist", "Machine Learning Engineer", "AI Engineer",
    "Product Manager", "Project Manager", "QA Engineer", "Security Analyst",
    "Cloud Architect", "Systems Architect", "Mobile Developer", "UI/UX Designer"
  ];
  let primaryRole = "Professional";
  for (const r of roles) {
    if (new RegExp(`\\b${r}\\b`, "i").test(resumeText)) {
      primaryRole = r;
      break;
    }
  }

  // 3. Education
  const eduKeywords = [
    "Master of Science", "M.Tech", "M.S.", "Bachelor of Technology",
    "B.Tech", "Bachelor of Engineering", "B.E.", "B.S.", "Bachelor of Science",
    "MBA", "MCA", "BCA", "Ph.D.", "Diploma in Engineering"
  ];
  let detectedEducation = "Higher Education Degree";
  for (const edu of eduKeywords) {
    if (new RegExp(`\\b${edu}\\b`, "i").test(resumeText)) {
      detectedEducation = edu;
      break;
    }
  }

  // 4. Detected Corporate Employers
  const segments = lower.split(/[.;,\n]/);
  const corporateSegments = segments.filter(
    (seg) => !/\b(intern|internship|interned|trainee|fresher|student|class of)\b/.test(seg)
  );
  const corporateText = corporateSegments.join(" ");

  // Strip URLs, social profiles (linkedin.com, github.com), and emails before employer extraction
  const sanitizedCorporateText = corporateText
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/(?:linkedin|github|twitter|gitlab|medium)\.com\/\S+/gi, " ")
    .replace(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi, " ");

  const employers = new Set<string>();

  // Employment-context words that must appear near a company name for it to count as an employer.
  // Bare mentions in Skills/Tools sections ("AWS", "Microsoft Azure", "Google Cloud") are ignored.
  const EMPLOYMENT_CONTEXT = [
    "at", "for", "with", "joined", "worked", "working", "employed",
    "engineer at", "developer at", "analyst at", "manager at", "director at",
    "intern at", "consultant at", "lead at", "associate at", "architect at",
  ];
  const ctxPattern = EMPLOYMENT_CONTEXT.map(w => w.replace(/\s/g, "\\s+")).join("|");
  // Builds: /(?:at|for|with|...) {0,15} COMPANY | COMPANY {0,15} (?:at|for|...)/i
  function isEmployerContext(text: string, company: string): boolean {
    const esc = company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return (
      new RegExp(`(?:${ctxPattern})\\s{0,3}${esc}\\b`, "i").test(text) ||
      new RegExp(`\\b${esc}\\s{0,3}(?:employee|team|corp|technologies|inc|ltd|llc)`, "i").test(text)
    );
  }

  for (const comp of RECOGNIZED_COMPANIES) {
    // Social platforms: only count as employer if explicit role context present
    if (comp === "linkedin" || comp === "github") {
      if (isEmployerContext(sanitizedCorporateText, comp)) {
        employers.add(comp);
      }
      continue;
    }

    // All other companies: must appear in employment context, not just as a tool/skill mention
    if (isEmployerContext(sanitizedCorporateText, comp)) {
      employers.add(comp.replace(/\s+/g, ""));
    }
  }

  const regexes = [
    /(?:worked|employed|working|serving)\s+(?:at|for|with|in)\s+([a-z0-9&.\-_]{3,20})/gi,
    /(?:software engineer|developer|manager|analyst|architect|designer|svp|vp|director|ceo|cto|cfo)\s+(?:at|for|with|in)\s+([a-z0-9&.\-_]{3,20})/gi,
    /(?:company|employer|organization)\s*[:=\-–]\s*([a-z0-9&.\-_]{3,20})/gi,
  ];

  for (const reg of regexes) {
    let m: RegExpExecArray | null;
    while ((m = reg.exec(sanitizedCorporateText)) !== null) {
      const cleaned = m[1].toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleaned.length >= 3 && !NON_COMPANY_WORDS.has(cleaned) && cleaned !== "github" && cleaned !== "linkedin") {
        employers.add(cleaned);
      }
    }
  }

  // 5. Estimated Years
  const years = (resumeText.match(/\b(19\d\d|20\d\d)\b/g) || []).map(Number);
  let estimatedYears = 0;
  if (years.length >= 2) {
    const validYears = years.filter(y => y >= 2000 && y <= 2026);
    if (validYears.length >= 2) {
      estimatedYears = Math.min(25, Math.max(0, Math.max(...validYears) - Math.min(...validYears)));
    }
  }

  return {
    candidateName,
    primaryRole,
    detectedEmployers: Array.from(employers),
    detectedEducation,
    estimatedExperienceYears: estimatedYears,
  };
}

/**
 * POST /api/scanResume
 * Multi-part form: walletAddress, resume (PDF file), claimedExperience (optional string)
 */
router.post(
  "/",
  upload.single("resume"),
  async (req, res, next) => {
    try {
      const walletAddress = requireWalletAddress(req.body.walletAddress, "walletAddress");

      if (!req.file) {
        throw new AppError("Resume PDF is required.", 400);
      }

      // Extract text from PDF
      const resumeText = await extractResumeText(req.file);

      // Parse candidate profile entities directly from resume PDF
      const extractedProfile = parseResumeEntities(resumeText);

      // Claimed experience: user-provided text OR auto-synthesized from PDF profile
      let claimedExperience = typeof req.body.claimedExperience === "string" ? req.body.claimedExperience.trim() : "";
      if (claimedExperience.length < 5) {
        if (extractedProfile.detectedEmployers.length > 0) {
          claimedExperience = `Professional experience in ${extractedProfile.primaryRole} at ${extractedProfile.detectedEmployers.map(c => c.toUpperCase()).join(", ")}.`;
        } else {
          claimedExperience = `Entry-level candidate profile in ${extractedProfile.primaryRole} with background in ${extractedProfile.detectedEducation}.`;
        }
      }

      // Fetch on-chain history for candidate wallet
      const onChainHistory = await getEmployeeHistory(walletAddress);

      // Extract on-chain company names
      const onChainCompanyNames: string[] = [];
      for (const job of onChainHistory) {
        const comp = extractCompanyFromJobDetails(job.jobDetails);
        if (comp) {
          onChainCompanyNames.push(comp);
        }
      }

      // Combine user claimed experience text + extracted resume employers
      const combinedClaimText = `${claimedExperience} ${resumeText}`.toLowerCase();
      const allClaimedEmployers = new Set<string>(extractedProfile.detectedEmployers);

      for (const comp of RECOGNIZED_COMPANIES) {
        if (new RegExp(`\\b${comp}\\b`, "i").test(claimedExperience.toLowerCase())) {
          allClaimedEmployers.add(comp.replace(/\s+/g, ""));
        }
      }

      const claimedEmployersList = Array.from(allClaimedEmployers);
      const totalClaims = claimedEmployersList.length;

      // Cross-reference claims against on-chain records
      const verifiedEmployers = new Set<string>();
      for (const onComp of onChainCompanyNames) {
        if (
          claimedEmployersList.includes(onComp) ||
          combinedClaimText.includes(onComp)
        ) {
          verifiedEmployers.add(onComp);
        }
      }

      const hasOnChainRecords = onChainHistory.length > 0;
      const verifiedClaims = totalClaims === 0 ? 0 : Math.min(totalClaims, verifiedEmployers.size);
      const unverifiedClaims = Math.max(0, totalClaims - verifiedClaims);

      // Determine Blockchain Verification Status & Diagnostics
      let blockchainStatus: "verified" | "partial" | "mismatch" | "no_records";
      let blockchainSignal = 0.0;
      const riskSignals: string[] = [];
      const explanationParts: string[] = [];

      if (hasOnChainRecords) {
        if (totalClaims === 0) {
          blockchainStatus = "verified";
          blockchainSignal = 0.05;
          const comps = onChainCompanyNames.map(c => c.toUpperCase()).join(", ") || "verified employer";
          riskSignals.unshift(`✓ Verified on-chain credentials held (${comps})`);
          explanationParts.push(`Candidate wallet holds ${onChainHistory.length} employer-signed on-chain record(s) (${comps}). Profile is consistent with entry-level or junior credentials.`);
        } else if (verifiedClaims === totalClaims && totalClaims > 0) {
          blockchainStatus = "verified";
          blockchainSignal = 0.05;
          const comps = Array.from(verifiedEmployers).map(c => c.toUpperCase()).join(", ");
          riskSignals.unshift(`✓ All claimed employer(s) verified on-chain (${comps})`);
          explanationParts.push(`All ${totalClaims} claimed employment position(s) are cryptographically verified by employer-signed blockchain credentials.`);
        } else if (verifiedClaims > 0) {
          blockchainStatus = "partial";
          blockchainSignal = 0.40;
          const vComps = Array.from(verifiedEmployers).map(c => c.toUpperCase()).join(", ");
          riskSignals.push(`⚠ Partial verification: ${verifiedClaims} of ${totalClaims} claimed employer(s) verified on-chain (${vComps}). ${unverifiedClaims} position(s) unverified.`);
          explanationParts.push(`Partial on-chain verification: ${verifiedClaims} of ${totalClaims} claimed employer(s) confirmed on-chain, but ${unverifiedClaims} position(s) have no blockchain record.`);
        } else {
          blockchainStatus = "mismatch";
          blockchainSignal = 0.72;
          const onChainStr = onChainCompanyNames.map(c => c.toUpperCase()).join(", ") || "different employer";
          const claimedStr = claimedEmployersList.map(c => c.toUpperCase()).join(", ") || "claimed positions";
          riskSignals.push(`⚠ Blockchain Mismatch: Resume claims (${claimedStr}), but wallet only holds records for (${onChainStr})`);
          explanationParts.push(`Blockchain mismatch: Candidate claims experience at ${claimedStr}, but the provided wallet only holds records for ${onChainStr}.`);
        }
      } else {
        blockchainStatus = "no_records";
        if (totalClaims === 0) {
          blockchainSignal = 0.0;
          explanationParts.push("No on-chain records exist for this wallet.");
        } else {
          // Unverified corporate claim signal: calibrated scale
          blockchainSignal = Math.min(0.65, 0.28 + totalClaims * 0.07);
          riskSignals.push(`⚠ ${totalClaims} corporate employment claim(s) found with zero blockchain verification on this wallet`);
          explanationParts.push(`No on-chain records exist for this wallet. The candidate makes ${totalClaims} specific corporate employment claim(s) that cannot be cryptographically verified via blockchain.`);
        }
      }

      // Query AI Fraud Detection Service
      const aiResult = await getFraudScore(resumeText, claimedExperience, unverifiedClaims);
      const aiScore = aiResult.fraud_probability;

      // Only add positive entry-level message if AI text confirms authentic clean profile
      if (!hasOnChainRecords && totalClaims === 0 && aiScore < 0.25) {
        riskSignals.push("✓ Profile evaluated as entry-level / academic background with no unverified corporate claims");
        explanationParts.unshift("Candidate profile is consistent with an entry-level or fresher applicant with project and academic credentials.");
      }

      // Merge AI risk signals
      if (Array.isArray(aiResult.risk_signals)) {
        for (const sig of aiResult.risk_signals) {
          if (!riskSignals.includes(sig)) {
            riskSignals.push(sig);
          }
        }
      }

      // ── Calibrated Composite Scoring ──────────────────────────────────────
      let finalFraudProbability: number;

      if (hasOnChainRecords) {
        if (verifiedClaims === totalClaims && totalClaims > 0) {
          // Authoritative verification: 80% blockchain verified (0.05), 20% AI
          finalFraudProbability = 0.80 * blockchainSignal + 0.20 * aiScore;
        } else if (verifiedClaims === 0 && totalClaims > 0) {
          // Mismatch: 65% blockchain mismatch, 35% AI
          finalFraudProbability = 0.65 * blockchainSignal + 0.35 * aiScore;
        } else {
          // Partial or fresher with records
          finalFraudProbability = 0.60 * blockchainSignal + 0.40 * aiScore;
        }
      } else if (totalClaims > 0) {
        // No records + specific corporate claims: 45% unverifiable claim signal, 55% AI
        // If manual claim was provided but omitted all detected employers, add slight discrepancy factor
        const claimMismatchPenalty = (
          claimedExperience.length >= 10 &&
          allClaimedEmployers.size > 0 &&
          !Array.from(allClaimedEmployers).some(c => claimedExperience.toLowerCase().includes(c))
        ) ? 0.05 : 0.0;

        // If resume text indicates a career gap without explanation, note slight review factor
        const careerGapFactor = (/career break|career gap|sabbatical/i.test(resumeText)) ? 0.05 : 0.0;

        finalFraudProbability = 0.45 * blockchainSignal + 0.55 * aiScore + claimMismatchPenalty + careerGapFactor;
      } else {
        // Entry-level / fresher: AI text is primary
        finalFraudProbability = aiScore;
      }

      finalFraudProbability = Math.round(Math.min(0.98, Math.max(0.04, finalFraudProbability)) * 100) / 100;

      // Risk level categorization
      let riskLevel: string;
      if (finalFraudProbability < 0.25)      riskLevel = "Low Risk";
      else if (finalFraudProbability < 0.50) riskLevel = "Moderate Risk";
      else if (finalFraudProbability < 0.75) riskLevel = "High Risk";
      else                                    riskLevel = "Critical Risk";

      if (aiResult.explanation) {
        explanationParts.push(`AI Analysis: ${aiResult.explanation}`);
      }

      const finalExplanation = explanationParts.join(" ");

      res.json({
        fraudProbability: finalFraudProbability,
        riskLevel,
        blockchainStatus,
        aiTextScore: Math.round(aiScore * 100) / 100,
        verifiedClaims,
        totalClaims,
        riskSignals,
        explanation: finalExplanation,
        onChainJobs: onChainHistory,
        extractedProfile,
        aiDimensions: aiResult.dimensions,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
