import { Router } from "express";
import { submitVerification } from "../services/blockchain";
import { AppError } from "../utils/errors";
import { requireText, requireUnixTimestamp, requireWalletAddress } from "../utils/validation";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const {
      employerAddress,
      employeeAddress,
      jobDetails,
      startDate,
      endDate,
      ipfsHash
    } = req.body;

    if (employerAddress) {
      requireWalletAddress(employerAddress, "employerAddress");
    }

    const validatedEmployee = requireWalletAddress(employeeAddress, "employeeAddress");
    const validatedJobDetails = requireText(jobDetails, "jobDetails", { min: 3, max: 500 });
    const validatedStartDate = requireUnixTimestamp(startDate, "startDate");
    const validatedEndDate = requireUnixTimestamp(endDate, "endDate");
    const validatedIpfsHash =
      ipfsHash === undefined || ipfsHash === null
        ? ""
        : requireText(ipfsHash, "ipfsHash", { min: 1, max: 120 });

    if (validatedStartDate >= validatedEndDate) {
      throw new AppError("startDate must be earlier than endDate.", 400);
    }

    const receipt = await submitVerification(
      employerAddress,
      validatedEmployee,
      validatedJobDetails,
      validatedStartDate,
      validatedEndDate,
      validatedIpfsHash
    );
    res.json({
      txHash: receipt.hash,
      status: receipt.status
    });
  } catch (err) {
    next(err);
  }
});

export default router;
