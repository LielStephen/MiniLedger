import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Central error handling middleware
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json({
      error: 'Validation Error',
      message: formattedErrors[0]?.message || 'Invalid input data',
      details: formattedErrors,
    });
    return;
  }

  // 2. Multer Upload Errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Receipt image exceeds maximum size limit of 5MB',
      });
      return;
    }
    res.status(400).json({
      error: 'Upload Error',
      message: err.message,
    });
    return;
  }

  // 3. Custom AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.statusCode === 404 ? 'Not Found' : err.statusCode === 409 ? 'Conflict' : 'Bad Request',
      message: err.message,
    });
    return;
  }

  // 4. File filter or standard Error with message
  if (err.message && err.message.includes('Invalid file type')) {
    res.status(400).json({
      error: 'Bad Request',
      message: err.message,
    });
    return;
  }

  // 5. Postgres Check Constraint / Database errors
  if (err.code === '23514') {
    // Postgres check_violation
    res.status(400).json({
      error: 'Bad Request',
      message: 'Loan amount must be strictly greater than 0',
    });
    return;
  }

  // 6. Generic Fallback
  console.error('[UNHANDLED ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected server error occurred',
  });
}
