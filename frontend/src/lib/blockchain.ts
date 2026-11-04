"use client";

import { ethers } from "ethers";
import { blockCredAiAbi } from "./blockCredAiAbi";
import { EthereumProvider } from "../types/ethereum";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const HARDHAT_CHAIN_ID_HEX = "0x7a69"; // 31337 in hex

// In-memory cache for EIP-6963 announced providers
let discoveredEip6963Provider: EthereumProvider | null = null;

if (typeof window !== "undefined") {
  // Listen for EIP-6963 standard wallet announcements
  window.addEventListener("eip6963:announceProvider", (event: unknown) => {
    const detail = (event as CustomEvent)?.detail;
    if (detail?.provider) {
      const name = String(detail?.info?.name || "").toLowerCase();
      const rdns = String(detail?.info?.rdns || "").toLowerCase();
      if (name.includes("metamask") || rdns.includes("metamask") || !discoveredEip6963Provider) {
        discoveredEip6963Provider = detail.provider;
      }
    }
  });

  // Prompt extensions to announce themselves immediately
  try {
    window.dispatchEvent(new Event("eip6963:requestProvider"));
  } catch {
    // Ignore environment restrictions
  }
}

/**
 * Resolves the active MetaMask or Web3 provider via EIP-6963, multi-wallet providers,
 * or standard window.ethereum injection.
 */
export function getMetaMaskProvider(): EthereumProvider | null {
  if (typeof window === "undefined") {
    return null;
  }

  // 1. EIP-6963 discovered provider (modern standard)
  if (discoveredEip6963Provider) {
    return discoveredEip6963Provider;
  }

  // 2. window.ethereum with multi-wallet array
  const eth = window.ethereum;
  if (eth) {
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      const mm = eth.providers.find((p) => p.isMetaMask);
      if (mm) return mm;
      return eth.providers[0];
    }
    return eth;
  }

  return null;
}

/**
 * Asynchronously waits up to timeoutMs for MetaMask to finish injection into the DOM.
 */
export async function waitForProvider(timeoutMs = 1200): Promise<EthereumProvider | null> {
  const existing = getMetaMaskProvider();
  if (existing) return existing;

  if (typeof window === "undefined") return null;

  return new Promise((resolve) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve(getMetaMaskProvider());
      }
    }, timeoutMs);

    const onAnnounce = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        window.removeEventListener("eip6963:announceProvider", onAnnounce);
        resolve(getMetaMaskProvider());
      }
    };

    const onInitialized = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        window.removeEventListener("ethereum#initialized", onInitialized);
        resolve(getMetaMaskProvider());
      }
    };

    window.addEventListener("eip6963:announceProvider", onAnnounce);
    window.addEventListener("ethereum#initialized", onInitialized);

    try {
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    } catch {
      // Ignore
    }
  });
}

/**
 * Silently checks if a wallet is already connected and authorized (no popup).
 */
export async function getConnectedAccount(): Promise<string | null> {
  const ethereum = await waitForProvider(600);
  if (!ethereum) return null;

  try {
    const accounts = (await ethereum.request({ method: "eth_accounts" })) as string[];
    if (Array.isArray(accounts) && accounts.length > 0) {
      return accounts[0];
    }
  } catch {
    // Silent check failed (extension locked or asleep)
  }

  return null;
}

/**
 * Attempts to switch to Hardhat Localhost (31337). If not added, adds it.
 * Non-fatal: warns instead of throwing so wallet connection succeeds even if switch is skipped.
 */
async function ensureLocalhostNetwork(ethereum: EthereumProvider) {
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: HARDHAT_CHAIN_ID_HEX }],
    });
  } catch (switchError: unknown) {
    const errorCode =
      typeof switchError === "object" && switchError !== null && "code" in switchError
        ? Number((switchError as { code: number }).code)
        : undefined;

    // 4902: Chain has not been added to MetaMask
    if (errorCode === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: HARDHAT_CHAIN_ID_HEX,
              chainName: "Hardhat Localhost (BlockCredAI)",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Test ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        console.warn("[MetaMask] User dismissed or failed adding Localhost network:", addError);
      }
    } else {
      console.warn("[MetaMask] Network switch warning:", switchError);
    }
  }
}

export async function getProviderAndSigner() {
  const ethereum = await waitForProvider(1500);

  if (!ethereum) {
    throw new Error(
      "MetaMask was not detected in this browser tab. If you have the extension installed, please check the troubleshooting tips below."
    );
  }

  // 1. Request user to unlock / authorize accounts
  try {
    await ethereum.request({ method: "eth_requestAccounts" });
  } catch (reqError: unknown) {
    const errMsg = reqError instanceof Error ? reqError.message : String(reqError);
    const errCode =
      typeof reqError === "object" && reqError !== null && "code" in reqError
        ? Number((reqError as { code: number }).code)
        : undefined;

    if (errCode === 4001 || errMsg.toLowerCase().includes("user rejected")) {
      throw new Error("Connection cancelled: You declined the request in MetaMask.");
    }

    if (errMsg.toLowerCase().includes("extension not found") || errMsg.toLowerCase().includes("failed to connect")) {
      throw new Error(
        "MetaMask extension lost background connection. Please click the fox icon in your browser toolbar to unlock it, then refresh the page (F5)."
      );
    }

    throw new Error(`MetaMask connection error: ${errMsg}`);
  }

  // 2. Best-effort switch to Localhost network (Chain 31337)
  await ensureLocalhostNetwork(ethereum);

  // 3. Create Ethers BrowserProvider and retrieve Signer
  const provider = new ethers.BrowserProvider(ethereum as unknown as ethers.Eip1193Provider);
  const signer = await provider.getSigner();

  return { provider, signer, ethereum };
}

export async function getContractWithSigner() {
  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error("Smart contract address is not configured.");
  }

  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, blockCredAiAbi, signer);
}
