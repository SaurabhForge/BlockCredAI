"use client";

import { FormEvent, useState } from "react";
import axios from "axios";
import { getBackendUrl } from "../lib/api";

type VerificationResult = {
  txHash: string;
  status: number;
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message;
  }
  if (error instanceof Error) return error.message;
  return "Verification submission failed.";
}

export default function SubmitVerification() {
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [jobDetails, setJobDetails]           = useState("");
  const [startDate, setStartDate]             = useState("");
  const [endDate, setEndDate]                 = useState("");
  const [loading, setLoading]                 = useState(false);
  const [result, setResult]                   = useState<VerificationResult | null>(null);
  const [error, setError]                     = useState<string | null>(null);

  const toUnix = (dateStr: string) => Math.floor(new Date(dateStr).getTime() / 1000);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!employeeAddress || !jobDetails || !startDate || !endDate) {
      setError("Please fill in all fields.");
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await axios.post<VerificationResult>(
        `${getBackendUrl()}/api/submitVerification`,
        {
          employeeAddress,
          jobDetails,
          startDate: toUnix(startDate),
          endDate:   toUnix(endDate),
          ipfsHash:  "",
        }
      );
      setResult(resp.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {/* Employee Wallet */}
      <div>
        <label htmlFor="sv-employee" className="block text-sm font-medium text-indigo-100 mb-1">
          Employee Wallet Address
        </label>
        <input
          id="sv-employee"
          type="text"
          autoComplete="off"
          placeholder="0x..."
          value={employeeAddress}
          onChange={(e) => setEmployeeAddress(e.target.value)}
          className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none"
        />
      </div>

      {/* Job Details */}
      <div>
        <label htmlFor="sv-details" className="block text-sm font-medium text-indigo-100 mb-1">
          Job Details
        </label>
        <textarea
          id="sv-details"
          rows={3}
          placeholder="E.g., Software Engineer at Google — worked on distributed systems"
          value={jobDetails}
          onChange={(e) => setJobDetails(e.target.value)}
          className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none resize-none"
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="sv-start" className="block text-sm font-medium text-indigo-100 mb-1">
            Start Date
          </label>
          <input
            id="sv-start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none [color-scheme:dark]"
          />
        </div>
        <div>
          <label htmlFor="sv-end" className="block text-sm font-medium text-indigo-100 mb-1">
            End Date
          </label>
          <input
            id="sv-end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/20 px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all outline-none [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full relative group px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-300/30 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        aria-busy={loading}
      >
        <span className="relative text-sm font-bold tracking-wider text-white flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting to Blockchain...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Submit Employment Record
            </>
          )}
        </span>
      </button>

      {/* Error */}
      {error && (
        <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Success */}
      {result && (
        <div role="status" className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2">
          <p className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Record submitted on-chain!
          </p>
          <p className="text-xs text-gray-400 break-all">Tx: {result.txHash}</p>
          <p className="text-xs text-gray-400">Status: {result.status === 1 ? "✅ Confirmed" : "⚠️ Failed"}</p>
        </div>
      )}
    </form>
  );
}
