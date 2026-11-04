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

type ScanResult = {
  fraudProbability: number;
  explanation: string;
  onChainJobs?: OnChainJob[];
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) return error.response?.data?.message || error.message;
  if (error instanceof Error) return error.message;
  return "Unable to scan the resume right now.";
}

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(unix: number): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function fmtAddr(addr: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function riskLevel(p: number) {
  if (p < 0.4)
    return {
      label: "Low Risk",
      color: "text-emerald-400",
      bar: "bg-emerald-500",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
    };
  if (p < 0.65)
    return {
      label: "Medium Risk",
      color: "text-amber-400",
      bar: "bg-amber-500",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
    };
  return {
    label: "High Risk",
    color: "text-red-400",
    bar: "bg-red-500",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [claimedExp, setClaimedExp] = useState("");
  const [walletAddress, setWalletAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !walletAddress || !claimedExp) {
      setError("Please fill in all fields.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("walletAddress", walletAddress);
      form.append("claimedExperience", claimedExp);
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

  const risk = result ? riskLevel(result.fraudProbability) : null;
  const pct = result ? Math.round(result.fraudProbability * 100) : 0;
  const jobs: OnChainJob[] = result?.onChainJobs ?? [];

  return (
    <form className="flex flex-col flex-1 h-full justify-between" onSubmit={handleSubmit}>
      <div className="space-y-5">
        {/* ── Wallet address ── */}
      <div>
        <label htmlFor="walletAddress" className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
          Target Wallet Address
        </label>
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

      {/* ── Claimed experience ── */}
      <div>
        <label htmlFor="claimedExperience" className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
          Claimed Experience
        </label>
        <textarea
          id="claimedExperience"
          name="claimedExperience"
          rows={3}
          placeholder="E.g., Worked at Google from 2020-2022 as Software Engineer"
          className="w-full rounded-xl bg-[#080612] border border-purple-500/25 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 px-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition-all resize-none"
          value={claimedExp}
          onChange={(e) => setClaimedExp(e.target.value)}
        />
      </div>

      {/* ── PDF upload ── */}
      <div>
        <label htmlFor="resumeDocument" className="block text-xs sm:text-sm font-semibold text-gray-200 mb-2">
          Resume Document (PDF)
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
              <span className="text-gray-300 text-xs sm:text-sm">Click or drag to upload resume</span>
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
            <span>Analyzing Profile…</span>
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
      {result && risk && (
        <div
          className="rounded-xl bg-[#080612] border border-purple-500/30 overflow-hidden shadow-2xl mt-4"
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
              <span className="text-sm font-bold text-white">Analysis Complete</span>
            </div>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${risk.color} ${risk.bg} ${risk.border}`}>
              {risk.label}
            </span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            {/* Fraud probability bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-300 uppercase tracking-wider font-semibold">Fraud Probability</span>
                <span className={`text-xl font-extrabold ${risk.color}`}>{pct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                  style={{ width: `${pct}%` }}
                  role="meter"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <div className="flex justify-between text-[11px] text-gray-400 mt-1 select-none">
                <span>0% Legit</span>
                <span>50% Uncertain</span>
                <span>100% Fraud</span>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="rounded-xl bg-[#0D0B1A] border border-purple-500/20 p-3.5">
              <p className="text-[11px] text-purple-300 uppercase tracking-wider font-semibold mb-1">AI Explanation</p>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">{result.explanation}</p>
            </div>

            {/* On-Chain Records */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                  On-Chain Employment Records
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
