import { expect } from "chai";
import { network } from "hardhat";
import { ZeroAddress } from "ethers";
import { describe, it } from "node:test";

describe("BlockCredAI", function () {
  async function expectRevert(promise: Promise<unknown>, message: string) {
    try {
      await promise;
      expect.fail(`Expected transaction to revert with: ${message}`);
    } catch (error) {
      expect(error).to.be.instanceOf(Error);
      expect((error as Error).message).to.include(message);
    }
  }

  async function deployFixture() {
    const { ethers } = await network.create();
    const [admin, employer, employee, outsider] = await ethers.getSigners();
    const contract = await ethers.deployContract("BlockCredAI");

    await contract.waitForDeployment();

    return { admin, employer, employee, outsider, contract };
  }

  it("grants the deployer admin rights", async function () {
    const { admin, contract } = await deployFixture();
    const adminRole = await contract.DEFAULT_ADMIN_ROLE();

    expect(await contract.hasRole(adminRole, admin.address)).to.equal(true);
  });

  it("allows an admin to grant employer role", async function () {
    const { employer, contract } = await deployFixture();
    const employerRole = await contract.EMPLOYER_ROLE();

    await contract.grantEmployerRole(employer.address);

    expect(await contract.hasRole(employerRole, employer.address)).to.equal(true);
  });

  it("rejects verification submissions from non-employers", async function () {
    const { employee, outsider, contract } = await deployFixture();

    await expectRevert(
      contract
        .connect(outsider)
        .submitVerification(employee.address, "Software Engineer", 1714521600, 1746057600, "ipfs://resume"),
      "Not employer"
    );
  });

  it("mints a badge and stores employment history for verified work", async function () {
    const { employer, employee, contract } = await deployFixture();

    await contract.grantEmployerRole(employer.address);

    const tx = await contract
      .connect(employer)
      .submitVerification(employee.address, "Software Engineer", 1714521600, 1746057600, "ipfs://resume");
    await tx.wait();

    const submittedEvents = await contract.queryFilter(contract.filters.JobSubmitted());
    const verifiedEvents = await contract.queryFilter(contract.filters.JobVerified());

    expect(submittedEvents).to.have.length(1);
    expect(submittedEvents[0].args.jobId).to.equal(1n);
    expect(submittedEvents[0].args.employer).to.equal(employer.address);
    expect(submittedEvents[0].args.employee).to.equal(employee.address);
    expect(verifiedEvents).to.have.length(1);
    expect(verifiedEvents[0].args.jobId).to.equal(1n);
    expect(verifiedEvents[0].args.tokenId).to.equal(1n);

    expect(await contract.ownerOf(1)).to.equal(employee.address);

    const records = await contract.getEmployeeHistory(employee.address);
    expect(records).to.have.length(1);
    expect(records[0].employer).to.equal(employer.address);
    expect(records[0].employee).to.equal(employee.address);
    expect(records[0].jobDetails).to.equal("Software Engineer");
    expect(records[0].tokenId).to.equal(1n);
  });

  it("rejects invalid employees and date ranges", async function () {
    const { employer, employee, contract } = await deployFixture();

    await contract.grantEmployerRole(employer.address);

    await expectRevert(
      contract
        .connect(employer)
        .submitVerification(ZeroAddress, "Software Engineer", 1714521600, 1746057600, ""),
      "Invalid employee"
    );

    await expectRevert(
      contract
        .connect(employer)
        .submitVerification(employee.address, "Software Engineer", 1746057600, 1714521600, ""),
      "Invalid dates"
    );
  });

  it("rejects empty job details", async function () {
    const { employer, employee, contract } = await deployFixture();

    await contract.grantEmployerRole(employer.address);

    await expectRevert(
      contract.connect(employer).submitVerification(employee.address, "", 1714521600, 1746057600, ""),
      "Missing job details"
    );
  });
});
