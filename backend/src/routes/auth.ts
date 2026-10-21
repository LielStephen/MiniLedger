import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { config } from '../config';
import { requestOtpSchema, verifyOtpSchema } from '../validators/auth';
import { otpRateLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * SHA-256 helper for securely hashing OTPs
 */
function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * POST /auth/request-otp
 * Generates 6-digit OTP, stores hashed code, expires in 5 min,
 * prints mock OTP in server console, never returns it in HTTP response.
 */
router.post(
  '/request-otp',
  otpRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone } = requestOtpSchema.parse(req.body);

      // Generate random 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const codeHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Invalidate any previously unused OTPs for this phone number
      await query(
        `UPDATE otps SET used = true WHERE phone = $1 AND used = false;`,
        [phone]
      );

      // Store hashed OTP
      await query(
        `INSERT INTO otps (phone, code_hash, expires_at, used)
         VALUES ($1, $2, $3, false);`,
        [phone, codeHash, expiresAt.toISOString()]
      );

      // Explicit log requirement for interview and demo verification
      console.log(`[MOCK OTP] ${phone} -> ${otp}`);

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully to your phone number',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /auth/verify-otp
 * Verifies OTP code, provisions user if new, and returns 7-day JWT.
 */
router.post(
  '/verify-otp',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, otp } = verifyOtpSchema.parse(req.body);
      const codeHash = hashOtp(otp);

      // Check for valid, unexpired, unused OTP
      const otpResult = await query(
        `SELECT id, expires_at FROM otps
         WHERE phone = $1 AND code_hash = $2 AND used = false AND expires_at > CURRENT_TIMESTAMP
         ORDER BY created_at DESC
         LIMIT 1;`,
        [phone, codeHash]
      );

      if (otpResult.rowCount === 0) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid or expired OTP code',
        });
        return;
      }

      const otpRecord = otpResult.rows[0];

      // Mark OTP as used
      await query(`UPDATE otps SET used = true WHERE id = $1;`, [otpRecord.id]);

      // Create user if not exists or fetch existing
      const userResult = await query<{ id: string; phone: string; created_at: string }>(
        `INSERT INTO users (phone)
         VALUES ($1)
         ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
         RETURNING id, phone, created_at;`,
        [phone]
      );

      const user = userResult.rows[0];

      // Sign JWT with 7d expiration
      const token = jwt.sign(
        { id: user.id, phone: user.phone },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        token,
        user: {
          id: user.id,
          phone: user.phone,
          createdAt: user.created_at,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
