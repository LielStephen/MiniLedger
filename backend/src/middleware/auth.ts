import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthUser } from '../types/express';

/**
 * Authentication middleware that verifies the Bearer JWT token
 * and attaches user information to req.user.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication token missing or invalid',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    if (!decoded || !decoded.id || !decoded.phone) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token payload',
      });
      return;
    }

    req.user = {
      id: decoded.id,
      phone: decoded.phone,
    };
    next();
  } catch (err) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired or signature invalid',
    });
  }
}
