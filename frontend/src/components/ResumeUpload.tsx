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
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor.replace("text-", "bg-")}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [claimedExp, setClaimedExp] = useState("");
  const [walletAddress, setWalletAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        `${getBackendUrl()}/api/scanResume`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(resp.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const risk = result ? riskStyle(result.riskLevel ?? "Critical Risk") : null;
  const chain = result ? blockchainBadge(result.blockchainStatus) : null;
  const pct = result ? Math.round(result.fraudProbability * 100) : 0;
  const jobs: OnChainJob[] = result?.onChainJobs ?? [];

  const aiColor = result
    ? result.aiTextScore < 0.25
      ? "text-emerald-400"
      : result.aiTextScore < 0.5
      ? "text-amber-400"
      : "text-red-400"
    : "text-gray-400";

  return (
    <form className="flex flex-col flex-1 h-full justify-between" onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* ── Wallet address ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="walletAddress" className="block text-xs sm:text-sm font-semibold text-gray-200">
              Candidate Wallet Address
            </label>
            <button
              type="button"
              onClick={() => setWalletAddr("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")}
              className="text-[11px] text-purple-300 hover:text-purple-200 underline decoration-purple-400/50 transition-colors"
            >
              Use Demo Address (TechCorp)
            </button>
          </div>
          <input
            id="walletAddress"
            name="walletAddress"
            type="text"
            autoComplete="off"
            placeholder="0x..."
            className="w-full rounded-xl bg-[#080612] border border-purple-500/60 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.22)] px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition-all"
            value={walletAddress}
            onChange={(e) => setWalletAddr(e.target.value)}
          />
        </div>

        {/* ── Claimed experience (Optional) ── */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="claimedExperience" className="block text-xs sm:text-sm font-semibold text-gray-200">
              Claimed Experience{" "}
              <span className="text-[11px] text-purple-300/70 font-normal">
                (Optional — Auto-detected from PDF if blank)
              </span>
            </label>
          </div>
          <textarea
            id="claimedExperience"
            name="claimedExperience"
            rows={3}
            placeholder="E.g., Senior Software Engineer at TechCorp for 3 years (or leave empty to auto-detect from PDF)"
            className="w-full rounded-xl bg-[#080612] border border-purple-500/25 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition-all resize-none"
            value={claimedExp}
            onChange={(e) => setClaimedExp(e.target.value)}
          />
        </div>

        {/* ── PDF upload ── */}
        <div>
          <label htmlFor="resumeDocument" className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
            Resume Document (PDF, max 2 MB)
          </label>
          <div className="relative group">
            <input
              id="resumeDocument"
              name="resumeDocument"
              type="file"
              accept="application/pdf"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="w-full rounded-xl bg-[#080612] border border-dashed border-purple-500/35 px-4 py-6 text-center text-xs sm:text-sm text-gray-200 flex flex-col items-center justify-center gap-2 group-hover:border-purple-400/70 group-hover:bg-purple-950/20 transition-all">
              <div
                className="w-7 h-7 rounded-full bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform"
                aria-hidden="true"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              {file ? (
                <span className="text-white font-medium text-xs break-all">{file.name}</span>
              ) : (
                <span className="text-gray-300 text-xs sm:text-sm">Click or drag to upload resume PDF</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom action container (flexible spacing for equal height alignment) ── */}
      <div className="mt-6 pt-2 space-y-4">
        {/* ── Submit button ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6366F1] via-[#7C3AED] to-[#9333EA] hover:from-[#5255F5] hover:to-[#8828E0] shadow-[0_4px_25px_rgba(124,58,237,0.4)] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          aria-busy={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Analyzing Profile with AI &amp; Blockchain…</span>
            </>
          ) : (
            "Verify Candidate"
          )}
        </button>

        {/* ── Error ── */}
        {error && (
          <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-xs sm:text-sm text-red-300 text-center font-medium">{error}</p>
          </div>
        )}

        {/* ── Result panel ── */}
        {result && risk && chain && (
          <div
            className="rounded-xl bg-[#080612] border border-purple-500/30 overflow-hidden shadow-2xl mt-4 space-y-0"
            role="status"
            aria-live="polite"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-purple-500/20 bg-purple-950/20">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold text-white">Verification &amp; Risk Assessment</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${risk.color} ${risk.bg} ${risk.border}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} aria-hidden="true" />
                {result.riskLevel}
              </span>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
              {/* Extracted Resume Profile Card */}
              {result.extractedProfile && (
                <div className="p-3.5 rounded-xl bg-[#0D0B1A] border border-purple-500/20">
                  <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-2">
                    Extracted Resume Profile
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
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
                            <span key={i} className="px-2 py-0.5 rounded bg-white/10 text-purple-200 font-mono text-[11px] uppercase">
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
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Calibrated Fraud Risk</span>
                  <span className={`text-2xl font-black ${risk.color}`}>
                    {pct}<span className="text-base font-bold">%</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                    style={{ width: `${Math.max(4, pct)}%` }}
                    role="meter"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-gray-400 mt-1 select-none">
                  <span>4% Natural Baseline</span>
                  <span>50% Elevated Risk</span>
                  <span>98% High Fraud</span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="p-3.5 rounded-xl bg-[#0D0B1A] border border-purple-500/20 space-y-3">
                <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold">Verification Breakdown</p>

                {/* Blockchain status */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Blockchain Status</span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${chain.color} ${chain.bg} ${chain.border}`}>
                    {chain.icon} {chain.label}
                  </span>
                </div>

                {/* Claim count */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">Claimed Positions Match</span>
                  <span className="text-xs font-mono text-white bg-white/10 px-2 py-0.5 rounded">
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
                <div className="p-3.5 rounded-xl bg-[#0D0B1A] border border-purple-500/20 space-y-2.5">
                  <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold">AI Diagnostic Integrity</p>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
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
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 border ${
                            isPositive
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                              : "bg-red-500/10 border-red-500/20 text-red-300"
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 font-bold text-sm leading-none">
                            {isPositive ? "✓" : "⚠"}
                          </span>
                          <span className="leading-relaxed">
                            {isPositive ? sig.slice(2).trim() : sig.replace(/^⚠\s*/, "")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* Executive Analysis Summary */}
              <div className="rounded-xl bg-[#0D0B1A] border border-purple-500/20 p-3.5">
                <p className="text-xs text-purple-300 uppercase tracking-wider font-semibold mb-1">
                  Executive Analysis Summary
                </p>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{result.explanation}</p>
              </div>

              {/* On-Chain Records */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                    On-Chain Blockchain Credentials
                  </p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      jobs.length > 0 ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {jobs.length} {jobs.length === 1 ? "record" : "records"}
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="rounded-xl bg-white/[0.02] border border-dashed border-purple-500/20 p-4 text-center">
                    <svg
                      className="w-6 h-6 text-gray-500 mx-auto mb-1.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-xs text-gray-300">No verified on-chain records found for this wallet.</p>
                    <p className="text-[11px] text-gray-400 mt-1">An employer can submit one using the form on the right.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {jobs.map((job) => (
                      <div
                        key={job.jobId}
                        className="rounded-xl bg-[#0D0B1A] border border-purple-500/20 p-3 hover:border-purple-400/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                          <span className="text-[11px] text-purple-300 font-mono bg-purple-500/15 px-2 py-0.5 rounded-full">
                            Record #{job.jobId} · Badge #{job.tokenId}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {fmtDate(job.startDate)} – {fmtDate(job.endDate)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-white font-medium leading-snug mb-2">{job.jobDetails}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
                          <span>
                            <span className="text-gray-400">Employer: </span>
                            <span className="font-mono text-gray-200" title={job.employer}>
                              {fmtAddr(job.employer)}
                            </span>
                          </span>
                          <span>
                            <span className="text-gray-400">Employee: </span>
                            <span className="font-mono text-gray-200" title={job.employee}>
                              {fmtAddr(job.employee)}
                            </span>
                          </span>
                          {job.ipfsHash && (
                            <span>
                              <span className="text-gray-400">IPFS: </span>
                              <span className="font-mono text-gray-200" title={job.ipfsHash}>
                                {job.ipfsHash.slice(0, 16)}…
                              </span>
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
      </div>
    </form>
  );
}
