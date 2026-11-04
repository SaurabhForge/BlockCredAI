"use client";

import { useState } from "react";
import { getProviderAndSigner } from "../lib/blockchain";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to connect wallet.";
}

export default function WalletConnectButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const { signer } = await getProviderAndSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
    } catch (connectError: unknown) {
      setError(getErrorMessage(connectError));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 relative">
      {/* Enhanced Error Display */}
      {error && (
        <div
          role="alert"
          className="absolute top-14 right-0 w-80 p-4 bg-[#140D26]/95 border border-red-500/30 rounded-xl shadow-2xl z-50 backdrop-blur-md animate-in slide-in-from-top-2"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 shrink-0 mt-0.5"
              aria-hidden="true"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex flex-col gap-1 text-left flex-1">
              <span className="text-sm font-semibold text-red-200">Connection Failed</span>
              <span className="text-xs text-red-300/80 leading-relaxed">
                {error.includes("MetaMask not found")
                  ? "A Web3 wallet like MetaMask is required to use this application. Please install the extension and try again."
                  : error.includes("ethers-user-denied") || error.includes("ACTION_REJECTED") || error.includes("4001")
                  ? "Connection request was cancelled or rejected. Please try again and click 'Approve' in MetaMask."
                  : error}
              </span>
              {error.includes("MetaMask not found") && (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                >
                  Download MetaMask
                  <svg className="w-3 h-3" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss wallet connection error"
              className="text-red-400/60 hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {account ? (
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#100C22] border border-white/10 shadow-sm">
          <div
            className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm font-mono text-gray-200">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          aria-label="Connect wallet"
          aria-busy={isConnecting}
          className="relative group px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#100C22] border border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/40 transition-all duration-300 shadow-sm disabled:opacity-50"
        >
          <span className="relative text-xs sm:text-sm font-medium text-white flex items-center gap-2">
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5 text-purple-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-purple-400/80" />
                <span>Connect Wallet</span>
              </>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
