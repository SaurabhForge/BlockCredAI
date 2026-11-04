"use client";

import { useEffect, useState } from "react";
import { getConnectedAccount, getMetaMaskProvider, getProviderAndSigner } from "../lib/blockchain";

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
  const [copied, setCopied] = useState(false);

  // Auto-detect existing authorized connection on mount & listen to changes
  useEffect(() => {
    let mounted = true;

    async function checkExisting() {
      const activeAccount = await getConnectedAccount();
      if (mounted && activeAccount) {
        setAccount(activeAccount);
      }
    }

    checkExisting();

    const ethereum = getMetaMaskProvider();
    if (ethereum && typeof ethereum.on === "function") {
      const handleAccountsChanged = (accounts: unknown) => {
        if (!mounted) return;
        if (Array.isArray(accounts) && accounts.length > 0) {
          setAccount(accounts[0] as string);
          setError(null);
        } else {
          setAccount(null);
        }
      };

      ethereum.on("accountsChanged", handleAccountsChanged);

      return () => {
        mounted = false;
        if (typeof ethereum.removeListener === "function") {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
        }
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      const { signer } = await getProviderAndSigner();
      const addr = await signer.getAddress();
      setAccount(addr);
    } catch (connectError: unknown) {
      const msg = getErrorMessage(connectError);
      console.error("[WalletConnect]", msg, connectError);
      setError(msg);
    } finally {
      setIsConnecting(false);
    }
  };

  const copyAddress = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures
    }
  };

  const disconnect = () => {
    setAccount(null);
    setError(null);
  };

  return (
    <div className="flex items-center gap-3 relative">
      {/* Error Callout */}
      {error && (
        <div
          role="alert"
          className="absolute top-14 right-0 w-80 p-4 bg-red-950/90 border border-red-500/40 rounded-xl shadow-2xl z-50 backdrop-blur-md animate-in slide-in-from-top-2"
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
            <div className="flex flex-col gap-1.5 text-left text-xs">
              <span className="text-sm font-semibold text-red-200">Wallet Notice</span>
              <p className="text-red-300/90 leading-relaxed">{error}</p>

              {/* Action hints depending on error */}
              {error.toLowerCase().includes("refresh") && (
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-all w-fit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Refresh Page Now
                </button>
              )}

              {error.includes("not detected") && (
                <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1.5 text-[11px] text-gray-300">
                  <p className="font-semibold text-white">Already have MetaMask installed?</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-400">
                    <li><strong className="text-gray-200">Incognito mode:</strong> Extensions are disabled in Incognito unless enabled in Chrome settings.</li>
                    <li><strong className="text-gray-200">Site Permissions:</strong> Right-click MetaMask icon &gt; &apos;Site Access&apos; &gt; choose &apos;On all sites&apos;.</li>
                    <li><strong className="text-gray-200">Stale tab:</strong> Press <kbd className="px-1 bg-white/10 rounded font-mono">Ctrl+F5</kbd> to reload the tab.</li>
                  </ul>
                </div>
              )}

              {error.includes("metamask.io") && (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1"
                >
                  Download MetaMask Extension →
                </a>
              )}
            </div>

            <button
              onClick={() => setError(null)}
              aria-label="Dismiss wallet error"
              className="text-red-400/60 hover:text-red-200 transition-colors ml-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {account ? (
        <div className="flex items-center gap-2">
          {/* Connected Address Pill */}
          <button
            type="button"
            onClick={copyAddress}
            title="Click to copy address"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-400/30 hover:border-indigo-300 transition-all text-xs font-medium text-indigo-100 group"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="font-mono">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <span className="text-[10px] text-indigo-300/70 group-hover:text-indigo-200">
              {copied ? "✓ Copied" : "Copy"}
            </span>
          </button>

          {/* Disconnect button */}
          <button
            type="button"
            onClick={disconnect}
            title="Disconnect"
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          disabled={isConnecting}
          aria-label="Connect wallet"
          aria-busy={isConnecting}
          className="relative group px-5 py-2 rounded-full bg-indigo-600/30 border border-indigo-400/40 hover:bg-indigo-600/50 hover:border-indigo-300 transition-all duration-300 overflow-hidden"
        >
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-hidden="true"
          />
          <span className="relative text-xs font-semibold tracking-wide text-white flex items-center gap-2">
            {isConnecting ? (
              <>
                <svg
                  className="animate-spin h-3.5 w-3.5 text-indigo-300"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Connect Wallet
              </>
            )}
          </span>
        </button>
      )}
    </div>
  );
}
