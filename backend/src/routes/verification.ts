import { Router } from "express";
import { submitVerification } from "../services/blockchain";

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

    if (!employeeAddress || !jobDetails || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const receipt = await submitVerification(
      employerAddress,
      employeeAddress,
      jobDetails,
      Number(startDate),
      Number(endDate),
      ipfsHash || ""
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
