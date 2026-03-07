"use client";

import { ethers } from "ethers";
const BlockCredAI = require("../../../blockchain/artifacts/contracts/BlockCredAI.sol/BlockCredAI.json");

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export async function getProviderAndSigner() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }
  
  const ethereum = (window as any).ethereum;
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
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
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
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, BlockCredAI.abi, signer);
}
