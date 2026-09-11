import { network } from "hardhat";

/**
 * Seeds the BlockCredAI contract with demo employment records
 * so the "On-Chain Records" panel in the scanner shows real data.
 *
 * Run:  npx hardhat run scripts/seed.ts --network localhost
 */
async function main() {
  const { ethers } = await network.create();
  const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [deployer, alice, bob] = await ethers.getSigners();

  const contract = await ethers.getContractAt("BlockCredAI", CONTRACT_ADDRESS, deployer);

  console.log("Seeding on-chain employment records...\n");

  const records = [
    {
      employee: alice.address,
      jobDetails: "Software Engineer at TechCorp — Backend development with Node.js and PostgreSQL",
      startDate: Math.floor(new Date("2021-06-01").getTime() / 1000),
      endDate:   Math.floor(new Date("2023-08-31").getTime() / 1000),
      ipfsHash:  "",
    },
    {
      employee: alice.address,
      jobDetails: "Senior Developer at InnovateLabs — Led a team of 5, React and AWS",
      startDate: Math.floor(new Date("2023-09-01").getTime() / 1000),
      endDate:   Math.floor(new Date("2024-12-31").getTime() / 1000),
      ipfsHash:  "",
    },
    {
      employee: bob.address,
      jobDetails: "Data Analyst at FinanceHub — Python, pandas, and Tableau dashboards",
      startDate: Math.floor(new Date("2022-01-01").getTime() / 1000),
      endDate:   Math.floor(new Date("2024-06-30").getTime() / 1000),
      ipfsHash:  "",
    },
    // Also seed for Hardhat account #0 (the default wallet used in the UI demo)
    {
      employee: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
      jobDetails: "Full Stack Engineer at StartupXYZ — Built customer dashboard with Next.js",
      startDate: Math.floor(new Date("2020-03-01").getTime() / 1000),
      endDate:   Math.floor(new Date("2022-09-30").getTime() / 1000),
      ipfsHash:  "",
    },
  ];

  for (const r of records) {
    const tx = await contract.submitVerification(
      r.employee,
      r.jobDetails,
      r.startDate,
      r.endDate,
      r.ipfsHash
    );
    await tx.wait();
    console.log(`✅ Submitted: ${r.jobDetails.slice(0, 60)}...`);
    console.log(`   Employee: ${r.employee}`);
    console.log(`   Tx: ${tx.hash}\n`);
  }

  console.log("Done! Seeded", records.length, "on-chain employment records.");
  console.log("\nEmployee addresses with records:");
  console.log(" •", alice.address, "  (2 records)");
  console.log(" •", bob.address, "  (1 record)");
  console.log(" •", "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "  (1 record)");
}

main().catch((e) => { console.error(e); process.exit(1); });
