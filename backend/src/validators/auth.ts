import { z } from 'zod';

/**
 * Normalizes phone numbers:
 * 1. If 10 digits (Indian standard), prefixes +91
 * 2. If 11 digits starting with 0, strips leading 0 and prefixes +91
 * 3. If standard E.164 (+ followed by 10-15 digits), keeps as is
 */
export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // 1. If starts with +, valid international E.164
  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // 2. 10-digit Indian mobile number (starts with 6, 7, 8, or 9)
  if (/^[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }

  // 3. 11-digit Indian number starting with 0
  if (/^0[6-9]\d{9}$/.test(cleaned)) {
    return `+91${cleaned.slice(1)}`;
  }

  // 4. 12-digit Indian number starting with 91 (without +)
  if (/^91[6-9]\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Fallback prefix with +
  return `+${cleaned}`;
}

export const requestOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .transform(normalizePhone)
    .refine(
      (val) => /^\+[1-9]\d{9,14}$/.test(val),
      'Invalid phone number format. Provide 10-digit Indian number or E.164 format.'
    ),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .transform(normalizePhone)
    .refine(
      (val) => /^\+[1-9]\d{9,14}$/.test(val),
      'Invalid phone number format.'
    ),
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain numbers only'),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
