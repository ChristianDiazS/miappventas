import dotenv from 'dotenv';
import { connectDB } from './src/config/database.js';
import { createApp } from './src/app.js';
import { initializeBackupScheduler } from './src/services/backupService.js';
import { initializeSentry } from './src/config/sentry.js';
import logger from './src/config/logger.js';

dotenv.config();

// Initialize Sentry for error tracking (if configured)
const sentryEnabled = initializeSentry(null, process.env.NODE_ENV);

// Database
connectDB();

const app = createApp();

// Re-initialize Sentry with app instance (for request handler middleware)
if (sentryEnabled && process.env.SENTRY_DSN) {
  const { initializeSentry: reinitSentry } = await import('./src/config/sentry.js');
  reinitSentry(app, process.env.NODE_ENV);
}

// Initialize automatic backup scheduler (every 6 hours)
// Schedule: "0 */6 * * *" = runs at 00:00, 06:00, 12:00, 18:00
const backupSchedule = process.env.BACKUP_SCHEDULE || '0 */6 * * *';
if (process.env.NODE_ENV === 'production') {
  initializeBackupScheduler(backupSchedule);
} else {
  logger.info('Backup scheduler disabled in development mode');
}

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  logger.info(`📍 Ambiente: ${process.env.NODE_ENV}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});
