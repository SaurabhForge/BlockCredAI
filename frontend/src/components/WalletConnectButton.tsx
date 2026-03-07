"use client";

import { useState } from "react";
import { getProviderAndSigner } from "../lib/blockchain";

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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 relative">
      {/* Enhanced Error Display */}
      {error && (
        <div className="absolute top-14 right-0 w-72 p-4 bg-red-500/10 border border-red-500/30 rounded-xl glass shadow-xl z-50 animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex flex-col gap-1 text-left">
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
                  className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  Download MetaMask
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {account ? (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-indigo-500/30">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-sm font-medium text-indigo-100 placeholder-opacity-70">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="relative group px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative text-sm font-semibold tracking-wide text-white flex items-center gap-2">
            {isConnecting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connecting...
              </>
            ) : (
              "Connect Wallet"
            )}
          </span>
        </button>
      )}
    </div>
  );
}
