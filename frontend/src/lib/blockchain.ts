"use client";

import { ethers } from "ethers";
const BlockCredAI = require("../../../blockchain/artifacts/contracts/BlockCredAI.sol/BlockCredAI.json");

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!;

export async function getProviderAndSigner() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { provider, signer };
}

export async function getContractWithSigner() {
  const { signer } = await getProviderAndSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, BlockCredAI.abi, signer);
}
