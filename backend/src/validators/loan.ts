import { z } from 'zod';

export const createLoanSchema = z.object({
  friendName: z
    .string({ required_error: 'Friend name is required' })
    .trim()
    .min(1, 'Friend name cannot be empty')
    .max(100, 'Friend name too long'),
  amount: z.preprocess((val) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number({ required_error: 'Amount is required', invalid_type_error: 'Amount must be a number' }).positive('Amount must be greater than zero')),
  dueDate: z
    .string({ required_error: 'Due date is required' })
    .refine((val) => {
      const d = new Date(val);
      return !isNaN(d.getTime());
    }, 'Invalid due date format. Must be a valid ISO date (e.g. YYYY-MM-DD)')
    .transform((val) => {
      // Normalize to YYYY-MM-DD format
      return new Date(val).toISOString().split('T')[0];
    }),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
