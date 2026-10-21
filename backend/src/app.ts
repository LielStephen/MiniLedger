import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth';
import loanRoutes from './routes/loans';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

export function createApp(): Application {
  const app = express();

  // Security headers & Cross-Origin Resource Sharing
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allows mobile apps to load uploaded receipt images
  }));
  app.use(cors());

  // Request body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files for uploaded loan receipts
  app.use('/uploads', express.static(config.uploadDir));

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'MiniLedger API', timestamp: new Date().toISOString() });
  });

  // Mount API route modules
  app.use('/auth', authRoutes);
  app.use('/loans', loanRoutes);

  // 404 handler for unknown endpoints
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found', message: 'Endpoint not found' });
  });

  // Centralized error handling
  app.use(errorHandler);

  return app;
}

export const app = createApp();
