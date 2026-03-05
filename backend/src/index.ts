import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import resumeRouter from "./routes/resume";
import verificationRouter from "./routes/verification";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/scanResume", resumeRouter);
app.use("/api/submitVerification", verificationRouter);

// Basic health check route
app.get("/", (req, res) => {
  res.send("BlockCredAI Backend is running!");
});

app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
