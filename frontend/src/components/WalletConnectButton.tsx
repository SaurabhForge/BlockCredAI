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
    <div className="flex items-center gap-3">
      {error && <span className="text-xs text-red-400 absolute -top-6 right-0">{error}</span>}

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
