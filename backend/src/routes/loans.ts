import { Router, Request, Response, NextFunction } from 'express';
import { query } from '../db';
import { config } from '../config';
import { requireAuth } from '../middleware/auth';
import { uploadReceipt } from '../middleware/upload';
import { createLoanSchema } from '../validators/loan';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Protect all /loans endpoints with authentication middleware
router.use(requireAuth);

/**
 * POST /loans
 * Creates a loan entry with optional receipt image.
 * Accepts multipart/form-data or application/json.
 */
router.post(
  '/',
  uploadReceipt.single('receipt'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = createLoanSchema.parse(req.body);
      const userId = req.user!.id;

      let receiptUrl: string | null = null;
      if (req.file) {
        receiptUrl = `${config.baseUrl}/uploads/${req.file.filename}`;
      }

      const insertResult = await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, receipt_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, friend_name, amount, due_date, is_repaid, repaid_at, receipt_url, created_at;`,
        [userId, validated.friendName, validated.amount, validated.dueDate, receiptUrl]
      );

      const row = insertResult.rows[0];
      const todayStr = new Date().toISOString().split('T')[0];
      const dueDateStr = new Date(row.due_date).toISOString().split('T')[0];
      const isOverdue = !row.is_repaid && dueDateStr < todayStr;

      res.status(201).json({
        id: row.id,
        userId: row.user_id,
        friendName: row.friend_name,
        amount: parseFloat(row.amount),
        dueDate: dueDateStr,
        isRepaid: row.is_repaid,
        repaidAt: row.repaid_at,
        receiptUrl: row.receipt_url,
        isOverdue,
        createdAt: row.created_at,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /loans
 * Retrieves all loans for the authenticated user sorted by due_date ascending.
 * Includes computed isOverdue flag and daysOverdue count.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT id, user_id, friend_name, amount, due_date, is_repaid, repaid_at, receipt_url, created_at
       FROM loans
       WHERE user_id = $1
       ORDER BY due_date ASC, created_at DESC;`,
      [userId]
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const todayMs = new Date(todayStr).getTime();

    const loans = result.rows.map((row) => {
      const dueDateStr = new Date(row.due_date).toISOString().split('T')[0];
      const isOverdue = !row.is_repaid && dueDateStr < todayStr;
      const dueMs = new Date(dueDateStr).getTime();
      const daysOverdue = isOverdue
        ? Math.max(1, Math.round((todayMs - dueMs) / (1000 * 60 * 60 * 24)))
        : 0;

      return {
        id: row.id,
        userId: row.user_id,
        friendName: row.friend_name,
        amount: parseFloat(row.amount),
        dueDate: dueDateStr,
        isRepaid: row.is_repaid,
        repaidAt: row.repaid_at,
        receiptUrl: row.receipt_url,
        isOverdue,
        daysOverdue,
        createdAt: row.created_at,
      };
    });

    res.status(200).json(loans);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /loans/summary
 * Computes user's loan metrics (totalLent, totalRepaid, totalPending, overdueAmount, overdueCount)
 * using a single efficient SQL aggregation query.
 */
router.get('/summary', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT
         COALESCE(SUM(amount), 0)::numeric(12,2) AS "totalLent",
         COALESCE(SUM(CASE WHEN is_repaid = true THEN amount ELSE 0 END), 0)::numeric(12,2) AS "totalRepaid",
         COALESCE(SUM(CASE WHEN is_repaid = false THEN amount ELSE 0 END), 0)::numeric(12,2) AS "totalPending",
         COALESCE(SUM(CASE WHEN is_repaid = false AND due_date < CURRENT_DATE THEN amount ELSE 0 END), 0)::numeric(12,2) AS "overdueAmount",
         COUNT(CASE WHEN is_repaid = false AND due_date < CURRENT_DATE THEN 1 END)::int AS "overdueCount"
       FROM loans
       WHERE user_id = $1;`,
      [userId]
    );

    const data = result.rows[0];

    res.status(200).json({
      totalLent: parseFloat(data.totalLent),
      totalRepaid: parseFloat(data.totalRepaid),
      totalPending: parseFloat(data.totalPending),
      overdueAmount: parseFloat(data.overdueAmount),
      overdueCount: parseInt(data.overdueCount, 10),
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /loans/:id/repay
 * Marks a loan as repaid and records the repayment timestamp.
 * Only the owner of the loan can perform this action.
 * Returns 404 if loan not found, 409 if already repaid.
 */
router.patch('/:id/repay', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const loanId = req.params.id;
    const userId = req.user!.id;

    // Check if loan exists and belongs to user
    const checkResult = await query(
      `SELECT id, user_id, is_repaid FROM loans WHERE id = $1;`,
      [loanId]
    );

    if (checkResult.rowCount === 0) {
      throw new AppError('Loan not found', 404);
    }

    const loan = checkResult.rows[0];

    // Ensure ownership
    if (loan.user_id !== userId) {
      throw new AppError('Loan not found', 404);
    }

    // Check if already repaid
    if (loan.is_repaid) {
      throw new AppError('Loan is already marked as repaid', 409);
    }

    // Mark as repaid
    const updateResult = await query(
      `UPDATE loans
       SET is_repaid = true, repaid_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, friend_name, amount, due_date, is_repaid, repaid_at, receipt_url, created_at;`,
      [loanId, userId]
    );

    const updated = updateResult.rows[0];

    res.status(200).json({
      id: updated.id,
      userId: updated.user_id,
      friendName: updated.friend_name,
      amount: parseFloat(updated.amount),
      dueDate: new Date(updated.due_date).toISOString().split('T')[0],
      isRepaid: updated.is_repaid,
      repaidAt: updated.repaid_at,
      receiptUrl: updated.receipt_url,
      isOverdue: false,
      createdAt: updated.created_at,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
