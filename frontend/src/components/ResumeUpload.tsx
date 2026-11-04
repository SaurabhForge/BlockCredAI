"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { getBackendUrl } from "../lib/api";

type OnChainJob = {
  jobId: number;
  employer: string;
  employee: string;
  jobDetails: string;
  startDate: number;
  endDate: number;
  ipfsHash: string;
  tokenId: number;
};

type ExtractedProfile = {
  candidateName: string;
  primaryRole: string;
  detectedEmployers: string[];
  detectedEducation: string;
  estimatedExperienceYears: number;
};

type AiDimensions = {
  timeline_integrity?: number;
  seniority_alignment?: number;
  metrics_credibility?: number;
  skill_authenticity?: number;
};

type ScanResult = {
  fraudProbability: number;
  riskLevel: string;
  blockchainStatus: "verified" | "partial" | "mismatch" | "no_records";
  aiTextScore: number;
  verifiedClaims: number;
  totalClaims: number;
  riskSignals: string[];
  explanation: string;
  onChainJobs?: OnChainJob[];
  extractedProfile?: ExtractedProfile;
  aiDimensions?: AiDimensions;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message || error.message;
  if (error instanceof Error) return error.message;
  return "Unable to scan the resume right now.";
}

function fmtDate(unix: number): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function fmtAddr(addr: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function riskStyle(level: string) {
  switch (level) {
    case "Low Risk":
      return { color: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/30", bg: "bg-emerald-500/10", dot: "bg-emerald-400" };
    case "Moderate Risk":
      return { color: "text-amber-400", bar: "bg-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/10", dot: "bg-amber-400" };
    case "High Risk":
      return { color: "text-orange-400", bar: "bg-orange-500", border: "border-orange-500/30", bg: "bg-orange-500/10", dot: "bg-orange-400" };
    default: // Critical Risk
      return { color: "text-red-400", bar: "bg-red-500", border: "border-red-500/30", bg: "bg-red-500/10", dot: "bg-red-400" };
  }
}

function blockchainBadge(status: string) {
  if (status === "verified")
    return { label: "Verified On-Chain", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: "✓" };
  if (status === "partial")
    return { label: "Partial On-Chain Match", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: "⚠" };
  if (status === "mismatch")
    return { label: "Blockchain Mismatch", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: "✗" };
  return { label: "No Records Found On-Chain", color: "text-gray-400", bg: "bg-white/5", border: "border-white/10", icon: "○" };
}

function ScoreBar({ label, value, barColor }: { label: string; value: number; barColor: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`text-xs font-bold ${barColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${barColor.replace("text-", "bg-")}`}
          style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ResumeUpload() {
  const [file, setFile]               = useState<File | null>(null);
  const [claimedExp, setClaimedExp]   = useState("");
  const [walletAddress, setWalletAddr] = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<ScanResult | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !walletAddress) {
      setError("Please enter a wallet address and select a resume PDF.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF resume.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("walletAddress", walletAddress);
      if (claimedExp.trim()) {
        form.append("claimedExperience", claimedExp.trim());
      }

      const resp = await axios.post<ScanResult>(
        `${getBackendUrl()}/api/scanResume`, form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(resp.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const risk  = result ? riskStyle(result.riskLevel ?? "Critical Risk") : null;
  const chain = result ? blockchainBadge(result.blockchainStatus) : null;
  const pct   = result ? Math.round(result.fraudProbability * 100) : 0;
  const jobs: OnChainJob[] = result?.onChainJobs ?? [];

  const aiColor = result
    ? result.aiTextScore < 0.25 ? "text-emerald-400"
    : result.aiTextScore < 0.50 ? "text-amber-400"
    : "text-red-400"
    : "text-gray-400";

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>

      {/* Wallet address */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="walletAddress" className="block text-sm font-medium text-indigo-100">
            Candidate Wallet Address
          </label>
          <button
            type="button"
            onClick={() => setWalletAddr("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
            className="text-[11px] text-indigo-300 hover:text-indigo-200 underline decoration-indigo-400/50"
          >
            Use Demo Address (TechCorp)
          </button>
        </div>
        <input
          id="walletAddress" name="walletAddress" type="text" autoComplete="off" placeholder="0x…"
          className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white
                     focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none"
          value={walletAddress} onChange={(e) => setWalletAddr(e.target.value)}
        />
      </div>

      {/* Claimed experience (Optional) */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label htmlFor="claimedExperience" className="block text-sm font-medium text-indigo-100">
            Claimed Experience <span className="text-xs text-indigo-300/70 font-normal">(Optional — Auto-detected from PDF if blank)</span>
          </label>
        </div>
        <textarea
          id="claimedExperience" name="claimedExperience" rows={2}
          placeholder="E.g., Senior Software Engineer at TechCorp for 3 years (or leave empty to auto-detect from PDF)"
          className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-2.5 text-sm text-white
                     focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none resize-none"
          value={claimedExp} onChange={(e) => setClaimedExp(e.target.value)}
        />
      </div>

      {/* PDF upload */}
      <div>
        <label htmlFor="resumeDocument" className="block text-sm font-medium text-indigo-100 mb-1">
          Resume PDF (max 2 MB)
        </label>
        <div className="relative group">
          <input
            id="resumeDocument" name="resumeDocument" type="file" accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="w-full rounded-xl bg-black/40 border border-dashed border-white/20 px-4 py-5
                          text-center text-sm flex flex-col items-center gap-2 group-hover:border-indigo-300 transition-all">
            <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {file
              ? <span className="text-white font-medium break-all">{file.name}</span>
              : <span className="text-gray-400">Click or drag to upload resume PDF</span>}
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit" disabled={loading}
        className="w-full relative group px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
                   border border-indigo-300 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]
                   disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        aria-busy={loading}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-500/20
                        opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        <span className="relative text-sm font-bold tracking-wider text-white flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing Profile with AI & Blockchain…
            </>
          ) : "Scan & Verify Resume"}
        </span>
      </button>

      {/* Error */}
      {error && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* ── Result Panel ───────────────────────────────────────────────────── */}
      {result && risk && chain && (
        <div className="rounded-xl bg-gray-900/90 border border-indigo-400/20 overflow-hidden shadow-2xl space-y-0"
          role="status" aria-live="polite">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-indigo-950/20">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-base font-bold text-white">Verification & Risk Assessment</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${risk.color} ${risk.bg} ${risk.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} aria-hidden="true" />
              {result.riskLevel}
            </span>
          </div>

          <div className="p-5 space-y-5">

            {/* Extracted Resume Profile Card */}
            {result.extractedProfile && (
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
                <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mb-2.5">
                  Extracted Resume Profile
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400">Candidate / Role:</span>
                    <p className="text-white font-medium mt-0.5">
                      {result.extractedProfile.candidateName} · {result.extractedProfile.primaryRole}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-400">Education:</span>
                    <p className="text-white font-medium mt-0.5">
                      {result.extractedProfile.detectedEducation}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-400">Corporate Experience Detected:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {result.extractedProfile.detectedEmployers.length > 0 ? (
                        result.extractedProfile.detectedEmployers.map((emp, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-indigo-200 font-mono text-[11px] uppercase">
                            {emp}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">None detected (Entry-Level / Projects / Education)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fraud Probability Meter */}
            <div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Calibrated Fraud Risk</span>
                <span className={`text-3xl font-black ${risk.color}`}>
                  {pct}<span className="text-lg font-bold">%</span>
                </span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                  style={{ width: `${Math.max(4, pct)}%` }}
                  role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1.5 select-none">
                <span>4% Natural Baseline</span><span>50% Elevated Risk</span><span>98% High Fraud</span>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Verification Breakdown</p>

              {/* Blockchain status */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Blockchain Status</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${chain.color} ${chain.bg} ${chain.border}`}>
                  {chain.icon} {chain.label}
                </span>
              </div>

              {/* Claim count */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Claimed Positions Match</span>
                <span className="text-xs font-mono text-white bg-white/5 px-2 py-0.5 rounded">
                  {result.totalClaims === 0
                    ? "Entry-Level Profile (0 corporate claims)"
                    : `${result.verifiedClaims} verified / ${result.totalClaims} claimed`}
                </span>
              </div>

              {/* AI text score */}
              <ScoreBar label="AI Text Pattern Analysis (Fraud Probability)" value={result.aiTextScore} barColor={aiColor} />

              {/* Composite score */}
              <ScoreBar label="Composite Multimodal Fraud Score" value={result.fraudProbability} barColor={risk.color} />
            </div>

            {/* AI Diagnostics Sub-Metrics */}
            {result.aiDimensions && (
              <div className="p-4 rounded-xl bg-black/25 border border-white/5 space-y-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">AI Diagnostic Integrity</p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Timeline Integrity</span>
                      <span className="text-emerald-400 font-bold">{Math.round((result.aiDimensions.timeline_integrity ?? 0.95) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(result.aiDimensions.timeline_integrity ?? 0.95) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Seniority Plausibility</span>
                      <span className="text-emerald-400 font-bold">{Math.round((result.aiDimensions.seniority_alignment ?? 0.95) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(result.aiDimensions.seniority_alignment ?? 0.95) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Metrics Credibility</span>
                      <span className="text-emerald-400 font-bold">{Math.round((result.aiDimensions.metrics_credibility ?? 0.95) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(result.aiDimensions.metrics_credibility ?? 0.95) * 100}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Skill Authenticity</span>
                      <span className="text-emerald-400 font-bold">{Math.round((result.aiDimensions.skill_authenticity ?? 0.95) * 100)}%</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(result.aiDimensions.skill_authenticity ?? 0.95) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Signals */}
            {result.riskSignals && result.riskSignals.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                  Diagnostic Signals ({result.riskSignals.length})
                </p>
                <ul className="space-y-1.5">
                  {result.riskSignals.map((sig, i) => {
                    const isPositive = sig.startsWith("✓");
                    return (
                      <li key={i}
                        className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border
                          ${isPositive
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-300"
                            : "bg-red-500/5 border-red-500/20 text-red-300"
                          }`}>
                        <span className="mt-0.5 shrink-0 font-bold text-sm leading-none">
                          {isPositive ? "✓" : "⚠"}
                        </span>
                        <span className="leading-relaxed">{isPositive ? sig.slice(2).trim() : sig.replace(/^⚠\s*/, "")}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Analysis Summary */}
            <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/20 p-4">
              <p className="text-xs text-indigo-300/70 uppercase tracking-wider font-semibold mb-2">
                Executive Analysis Summary
              </p>
              <p className="text-sm text-indigo-100/90 leading-relaxed">{result.explanation}</p>
            </div>

            {/* On-Chain Records */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  On-Chain Blockchain Credentials
                </p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                  ${jobs.length > 0 ? "bg-indigo-500/20 text-indigo-300" : "bg-white/5 text-gray-500"}`}>
                  {jobs.length} {jobs.length === 1 ? "record" : "records"}
                </span>
              </div>

              {jobs.length === 0 ? (
                <div className="rounded-lg bg-white/5 border border-dashed border-white/10 p-5 text-center">
                  <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm text-gray-400 font-medium">No verified on-chain records for this wallet.</p>
                  <p className="text-xs text-gray-500 mt-1">An employer can submit one using the form on the right.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.jobId}
                      className="rounded-lg bg-black/40 border border-emerald-500/20 p-4 hover:border-emerald-400/40 transition-colors">
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <span className="text-xs text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Record #{job.jobId} · NFT #{job.tokenId}
                        </span>
                        <span className="text-xs text-gray-500">
                          {fmtDate(job.startDate)} – {fmtDate(job.endDate)}
                        </span>
                      </div>
                      <p className="text-sm text-white font-medium leading-snug mb-3">{job.jobDetails}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span>
                          <span className="text-gray-500">Employer </span>
                          <span className="font-mono text-gray-300" title={job.employer}>{fmtAddr(job.employer)}</span>
                        </span>
                        <span>
                          <span className="text-gray-500">Employee </span>
                          <span className="font-mono text-gray-300" title={job.employee}>{fmtAddr(job.employee)}</span>
                        </span>
                        {job.ipfsHash && (
                          <span>
                            <span className="text-gray-500">IPFS </span>
                            <span className="font-mono text-gray-300">{job.ipfsHash.slice(0, 16)}…</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </form>
  );
}
