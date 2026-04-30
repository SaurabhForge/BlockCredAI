"use client";

import { ethers } from "ethers";
import { blockCredAiAbi } from "./blockCredAiAbi";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export async function getProviderAndSigner() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not found");
  }
  
  const ethereum = window.ethereum;
  const provider = new ethers.BrowserProvider(ethereum);
  
  // 1. Request accounts
  await provider.send("eth_requestAccounts", []);
  
  // 2. Switch to Localhost 8545 (Hardhat defaults to Chain ID 31337)
  const targetChainId = "0x7a69"; // 31337 in hex
  
  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }],
    });
  } catch (switchError: unknown) {
    const errorCode =
      typeof switchError === "object" && switchError !== null && "code" in switchError
        ? Number((switchError as { code: number }).code)
        : undefined;

    // This error code indicates that the chain has not been added to MetaMask.
    if (errorCode === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: targetChainId,
              chainName: "Hardhat Localhost",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "GO ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        console.error("Failed to add the Localhost network:", addError);
        throw new Error("Failed to add Localhost 8545 network to MetaMask.");
      }
    } else {
      console.error("Failed to switch network:", switchError);
      throw new Error("Failed to switch to the Localhost 8545 network.");
    }
  }

  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getContractWithSigner() {
  if (!ethers.isAddress(CONTRACT_ADDRESS)) {
    throw new Error("Smart contract address is not configured.");
  }

  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, blockCredAiAbi, signer);
}
