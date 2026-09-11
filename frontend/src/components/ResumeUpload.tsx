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
  if (p < 0.4)  return { label: "Low Risk",    color: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-500/30", bg: "bg-emerald-500/10" };
  if (p < 0.65) return { label: "Medium Risk", color: "text-amber-400",   bar: "bg-amber-500",   border: "border-amber-500/30",   bg: "bg-amber-500/10"   };
  return         { label: "High Risk",         color: "text-red-400",     bar: "bg-red-500",     border: "border-red-500/30",     bg: "bg-red-500/10"     };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ResumeUpload() {
  const [file, setFile]               = useState<File | null>(null);
  const [claimedExp, setClaimedExp]   = useState("");
  const [walletAddress, setWalletAddr] = useState("");
  const [loading, setLoading]         = useState(false);
  const [result, setResult]           = useState<ScanResult | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !walletAddress || !claimedExp) { setError("Please fill in all fields."); return; }
    if (file.type !== "application/pdf")        { setError("Please upload a PDF resume."); return; }

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
  const pct  = result ? Math.round(result.fraudProbability * 100) : 0;
  const jobs: OnChainJob[] = result?.onChainJobs ?? [];

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>

      {/* ── Wallet address ── */}
      <div>
        <label htmlFor="walletAddress" className="block text-sm font-medium text-indigo-100 mb-1">
          Target Wallet Address
        </label>
        <input
          id="walletAddress" name="walletAddress" type="text" autoComplete="off" placeholder="0x…"
          className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white
                     focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none"
          value={walletAddress}
          onChange={(e) => setWalletAddr(e.target.value)}
        />
      </div>

      {/* ── Claimed experience ── */}
      <div>
        <label htmlFor="claimedExperience" className="block text-sm font-medium text-indigo-100 mb-1">
          Claimed Experience
        </label>
        <textarea
          id="claimedExperience" name="claimedExperience" rows={3}
          placeholder="E.g., Worked at Google from 2020-2022 as Software Engineer"
          className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white
                     focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none resize-none"
          value={claimedExp}
          onChange={(e) => setClaimedExp(e.target.value)}
        />
      </div>

      {/* ── PDF upload ── */}
      <div>
        <label htmlFor="resumeDocument" className="block text-sm font-medium text-indigo-100 mb-1">
          Resume Document (PDF)
        </label>
        <div className="relative group">
          <input
            id="resumeDocument" name="resumeDocument" type="file" accept="application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className="w-full rounded-xl bg-black/40 border border-dashed border-white/20 px-4 py-6
                          text-center text-sm text-gray-300 flex flex-col items-center gap-2
                          group-hover:border-indigo-300 transition-all">
            <svg className="w-6 h-6 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {file
              ? <span className="text-white font-medium break-all">{file.name}</span>
              : <span className="text-gray-400">Click or drag to upload resume</span>}
          </div>
        </div>
      </div>

      {/* ── Submit button ── */}
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
              Analyzing Profile…
            </>
          ) : "Verify Candidate"}
        </span>
      </button>

      {/* ── Error ── */}
      {error && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* ── Result panel ── */}
      {result && risk && (
        <div className="rounded-xl bg-gray-900/80 border border-indigo-400/20 overflow-hidden shadow-xl"
          role="status" aria-live="polite">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-base font-bold text-white">Analysis Complete</span>
            </div>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${risk.color} ${risk.bg} ${risk.border}`}>
              {risk.label}
            </span>
          </div>

          <div className="p-5 space-y-5">

            {/* Fraud probability bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Fraud Probability</span>
                <span className={`text-2xl font-extrabold ${risk.color}`}>{pct}%</span>
              </div>
              <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${risk.bar}`}
                  style={{ width: `${pct}%` }}
                  role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1 select-none">
                <span>0% Legit</span><span>50% Uncertain</span><span>100% Fraud</span>
              </div>
            </div>

            {/* AI Explanation */}
            <div className="rounded-lg bg-indigo-950/40 border border-indigo-500/20 p-4">
              <p className="text-xs text-indigo-300/60 uppercase tracking-wider font-semibold mb-1">AI Explanation</p>
              <p className="text-sm text-indigo-100/80 leading-relaxed">{result.explanation}</p>
            </div>

            {/* On-Chain Records */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  On-Chain Employment Records
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
                  <p className="text-sm text-gray-500">No verified on-chain records for this wallet.</p>
                  <p className="text-xs text-gray-600 mt-1">An employer can submit one using the form →</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <div key={job.jobId}
                      className="rounded-lg bg-black/40 border border-indigo-500/20 p-4 hover:border-indigo-400/40 transition-colors">

                      {/* Row 1: badge + dates */}
                      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-full">
                          Record #{job.jobId} · NFT #{job.tokenId}
                        </span>
                        <span className="text-xs text-gray-500">
                          {fmtDate(job.startDate)} – {fmtDate(job.endDate)}
                        </span>
                      </div>

                      {/* Row 2: job title */}
                      <p className="text-sm text-white font-medium leading-snug mb-3">{job.jobDetails}</p>

                      {/* Row 3: addresses */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span>
                          <span className="text-gray-600">Employer </span>
                          <span className="font-mono text-gray-400" title={job.employer}>{fmtAddr(job.employer)}</span>
                        </span>
                        <span>
                          <span className="text-gray-600">Employee </span>
                          <span className="font-mono text-gray-400" title={job.employee}>{fmtAddr(job.employee)}</span>
                        </span>
                        {job.ipfsHash && (
                          <span>
                            <span className="text-gray-600">IPFS </span>
                            <span className="font-mono text-gray-400">{job.ipfsHash.slice(0, 16)}…</span>
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
