import { ethers } from "ethers";
import { config, isProduction } from "../config";
import { AppError } from "../utils/errors";
import { blockCredAiAbi } from "./blockCredAiAbi";

export type JobRecord = {
    jobId: number;
    employer: string;
    employee: string;
    jobDetails: string;
    startDate: number;
    endDate: number;
    ipfsHash: string;
    tokenId: number;
};

type ChainJobRecord = {
    jobId: bigint;
    employer: string;
    employee: string;
    jobDetails: string;
    startDate: bigint;
    endDate: bigint;
    ipfsHash: string;
    tokenId: bigint;
};

const HARDHAT_PRIVATE_KEYS = new Set([
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a004497e5da9362c4e5fe146d21f59001d11e02a02539dc"
]);

function getProvider() {
    return new ethers.JsonRpcProvider(config.rpcUrl);
}

function getContractAddress(): string {
    if (!ethers.isAddress(config.contractAddress)) {
        throw new AppError("BLOCKCRED_CONTRACT_ADDRESS is not configured.", 503);
    }

    return config.contractAddress;
}

function getSigner() {
    if (!config.privateKey) {
        throw new AppError("PRIVATE_KEY is required to submit verifications.", 503);
    }

    if (isProduction && HARDHAT_PRIVATE_KEYS.has(config.privateKey.toLowerCase())) {
        throw new AppError("Production cannot use a default Hardhat private key.", 503);
    }

    return new ethers.Wallet(config.privateKey, getProvider());
}

function getReadContract() {
    return new ethers.Contract(getContractAddress(), blockCredAiAbi, getProvider());
}

function getWriteContract() {
    return new ethers.Contract(getContractAddress(), blockCredAiAbi, getSigner());
}

function formatJobRecord(record: ChainJobRecord): JobRecord {
    return {
        jobId: Number(record.jobId),
        employer: record.employer,
        employee: record.employee,
        jobDetails: record.jobDetails,
        startDate: Number(record.startDate),
        endDate: Number(record.endDate),
        ipfsHash: record.ipfsHash,
        tokenId: Number(record.tokenId)
    };
}

export async function getEmployeeHistory(walletAddress: string): Promise<JobRecord[]> {
    try {
        const contract = getReadContract();
        const history = await contract.getEmployeeHistory(walletAddress);
        return (history as ChainJobRecord[]).map(formatJobRecord);
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
        const contract = getWriteContract();
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
