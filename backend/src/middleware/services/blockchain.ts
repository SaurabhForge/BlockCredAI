import { ethers } from "ethers";
import abi from "../../blockchain/artifacts/contracts/BlockCredAI.sol/BlockCredAI.json";

const CONTRACT_ADDRESS = process.env.BLOCKCRED_CONTRACT_ADDRESS!;
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const PRIVATE_KEY = process.env.PRIVATE_KEY!;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, abi.abi, wallet);

export async function getEmployeeHistory(address: string) {
  return contract.getEmployeeHistory(address);
}

export async function submitVerification(
  employerAddress: string,
  employee: string,
  jobDetails: string,
  startDate: number,
  endDate: number,
  ipfsHash: string
) {
  const tx = await contract.submitVerification(
    employee,
    jobDetails,
    startDate,
    endDate,
    ipfsHash
  );
  const receipt = await tx.wait();
  return receipt;
}
