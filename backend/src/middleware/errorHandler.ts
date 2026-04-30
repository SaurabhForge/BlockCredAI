import { Request, Response, NextFunction } from "express";
import { isProduction } from "../config";
import { AppError } from "../utils/errors";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(500).json({
      message: isProduction ? "Internal server error" : err.message
    });
    return;
  }

  res.status(500).json({
    message: "Internal server error"
  });
}
