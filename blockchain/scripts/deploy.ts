import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contract with account:", deployer.address);

    // Assuming the contract requires deployer or no constructor arguments
    const BlockCredAI = await ethers.getContractFactory("BlockCredAI");
    const contract = await BlockCredAI.deploy();

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log("BlockCredAI deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
