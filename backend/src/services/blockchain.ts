import { ethers } from "ethers";
import dotenv from "dotenv";

import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = process.env.BLOCKCRED_CONTRACT_ADDRESS || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // default hardhat account 0

// Import ABI directly from the hardhat artifacts using require
const BlockCredAIArtifact = require("../../../blockchain/artifacts/contracts/BlockCredAI.sol/BlockCredAI.json");

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, BlockCredAIArtifact.abi, wallet);

export async function getEmployeeHistory(walletAddress: string) {
    try {
        const history = await contract.getEmployeeHistory(walletAddress);
        return history.map((record: any) => ({
            jobId: Number(record.jobId),
            employer: record.employer,
            employee: record.employee,
            jobDetails: record.jobDetails,
            startDate: Number(record.startDate),
            endDate: Number(record.endDate),
            ipfsHash: record.ipfsHash,
            tokenId: Number(record.tokenId),
        }));
    } catch (error) {
        console.error("Error fetching employee history:", error);
        return [];
    }
}

export async function submitVerification(
    employerAddress: string,
    employeeAddress: string,
    jobDetails: string,
    startDate: number,
    endDate: number,
    ipfsHash: string
) {
    try {
        // The employer must have the EMPLOYER_ROLE. For this demo, we'll assume
        // the private key used by the backend is the admin and can grant it or is the deployer.
        // We'll rely on the caller to handle role errors for now.
        const tx = await contract.submitVerification(
            employeeAddress,
            jobDetails,
            startDate,
            endDate,
            ipfsHash
        );
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        console.error("Error submitting verification:", error);
        throw error;
    }
}
