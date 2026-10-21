import { Request, Response, NextFunction } from 'express';
import { normalizePhone } from '../validators/auth';

interface RateLimitRecord {
  timestamps: number[];
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 3;
const attemptsMap = new Map<string, RateLimitRecord>();

/**
 * Resets the in-memory rate limit map (useful for test isolation)
 */
export function resetOtpRateLimits(): void {
  attemptsMap.clear();
}

/**
 * Simple in-memory rate limiter per phone: max 3 OTP requests per 10 min
 */
export function otpRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const rawPhone = req.body?.phone;
  if (!rawPhone || typeof rawPhone !== 'string') {
    // If phone is missing, let the Zod validator handle bad input format
    return next();
  }

  const phone = normalizePhone(rawPhone);
  const now = Date.now();
  const record = attemptsMap.get(phone) || { timestamps: [] };

  // Remove timestamps older than the 10-minute window
  const recent = record.timestamps.filter((ts) => now - ts < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS) {
    const oldest = recent[0];
    const retryAfterSec = Math.ceil((oldest + WINDOW_MS - now) / 1000);
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Too many OTP requests for this phone number. Please try again after ${Math.ceil(retryAfterSec / 60)} minutes.`,
      retryAfterSeconds: retryAfterSec,
    });
    return;
  }

  recent.push(now);
  attemptsMap.set(phone, { timestamps: recent });
  next();
}
