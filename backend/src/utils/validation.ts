import { isAddress } from "ethers";
import { AppError } from "./errors";

export function requireWalletAddress(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !isAddress(value.trim())) {
    throw new AppError(`${fieldName} must be a valid wallet address.`, 400);
  }

  return value.trim();
}

export function requireText(
  value: unknown,
  fieldName: string,
  options: { min?: number; max?: number } = {}
): string {
  if (typeof value !== "string") {
    throw new AppError(`${fieldName} is required.`, 400);
  }

  const sanitized = value.replace(/\s+/g, " ").trim();
  const min = options.min ?? 1;
  const max = options.max ?? 1000;

  if (sanitized.length < min) {
    throw new AppError(`${fieldName} must be at least ${min} characters.`, 400);
  }

  if (sanitized.length > max) {
    throw new AppError(`${fieldName} must be ${max} characters or fewer.`, 400);
  }

  return sanitized;
}

export function requireUnixTimestamp(value: unknown, fieldName: string): number {
  const numeric = typeof value === "number" ? value : Number(value);

  if (!Number.isInteger(numeric) || numeric <= 0) {
    throw new AppError(`${fieldName} must be a positive Unix timestamp.`, 400);
  }

  return numeric;
}
