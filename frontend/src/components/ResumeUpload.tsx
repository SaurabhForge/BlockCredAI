"use client";

import { useState } from "react";
import axios from "axios";

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [claimedExp, setClaimedExp] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !walletAddress || !claimedExp) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("resume", file);
      form.append("walletAddress", walletAddress);
      form.append("claimedExperience", claimedExp);

      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/scanResume`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(resp.data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-indigo-200 mb-1">Target Wallet Address</label>
          <input
            type="text"
            placeholder="0x..."
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-200 mb-1">Claimed Experience</label>
          <textarea
            placeholder="E.g., Worked at Google from 2020-2022 as Software Engineer"
            rows={3}
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
            value={claimedExp}
            onChange={(e) => setClaimedExp(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-indigo-200 mb-1">Resume Document (PDF)</label>
          <div className="relative group">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full rounded-xl glass-hover bg-black/40 border border-white/10 border-dashed px-4 py-6 text-center text-sm text-gray-400 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group-hover:border-indigo-400/50">
              <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? <span className="text-white font-medium">{file.name}</span> : <span>Click or drag to upload resume</span>}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full relative group px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-400/30 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="relative text-sm font-bold tracking-wider text-white flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing Profile...
            </>
          ) : (
            "Verify Candidate"
          )}
        </span>
      </button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-xl bg-gray-900 border border-indigo-500/30 p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl"></div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Analysis Complete
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-black/40 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-400 mb-1">Fraud Probability</p>
              <p className={`text-2xl font-bold ${result.fraudProbability > 0.5 ? 'text-red-400' : 'text-emerald-400'}`}>
                {Math.round(result.fraudProbability * 100)}%
              </p>
            </div>
            <div className="bg-black/40 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-gray-400 mb-1">On-Chain Records</p>
              <p className="text-2xl font-bold text-indigo-400">
                {result.onChainJobs?.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-indigo-950/30 rounded-lg p-4 border border-indigo-500/20">
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
