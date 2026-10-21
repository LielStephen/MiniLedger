import { app } from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`[MiniLedger API] Server running on port ${config.port}`);
  console.log(`[MiniLedger API] Base URL: ${config.baseUrl}`);
});

process.on('SIGTERM', () => {
  console.log('[MiniLedger API] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});
