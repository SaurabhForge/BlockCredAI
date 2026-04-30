import express from "express";
import cors from "cors";
import resumeRouter from "./routes/resume";
import verificationRouter from "./routes/verification";
import { config, getAllowedOrigins } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { rateLimiter } from "./middleware/rateLimiter";

const app = express();
const allowedOrigins = new Set(getAllowedOrigins());

app.disable("x-powered-by");
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json({ limit: config.requestLimit }));
app.use(rateLimiter);

app.use("/api/scanResume", resumeRouter);
app.use("/api/submitVerification", verificationRouter);

app.get("/", (req, res) => {
  res.json({
    name: "BlockCredAI Backend",
    status: "ok",
    apiUrl: config.publicApiUrl
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.info(`Backend listening on ${config.port}`);
});
