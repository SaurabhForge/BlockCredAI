export const blockCredAiAbi = [
  "function submitVerification(address employee,string jobDetails,uint256 startDate,uint256 endDate,string ipfsHash) returns (uint256)",
  "function getEmployeeHistory(address employee) view returns ((uint256 jobId,address employer,address employee,string jobDetails,uint256 startDate,uint256 endDate,string ipfsHash,uint256 tokenId)[])"
] as const;
