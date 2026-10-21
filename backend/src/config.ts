import dotenv from 'dotenv';
import path from 'path';

// Load .env configuration
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback to current dir .env

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/miniledger',
  jwtSecret: process.env.JWT_SECRET || 'super-secret-jwt-key-miniledger-2026',
  jwtExpiresIn: '7d',
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  uploadDir: path.resolve(__dirname, '../../uploads'),
};
