import { NextFunction, Request, Response } from "express";
import { config } from "../config";

type VisitorBucket = {
  count: number;
  resetAt: number;
};

const visitors = new Map<string, VisitorBucket>();

function getClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = getClientKey(req);
  const current = visitors.get(key);

  if (!current || current.resetAt <= now) {
    visitors.set(key, {
      count: 1,
      resetAt: now + config.rateLimitWindowMs
    });
    next();
    return;
  }

  if (current.count >= config.rateLimitMax) {
    res.status(429).json({
      message: "Too many requests. Please try again later."
    });
    return;
  }

  current.count += 1;
  visitors.set(key, current);
  next();
}
