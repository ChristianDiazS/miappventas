import logger from '../config/logger.js';
import { createBackup, cleanOldBackups, getRecentBackups } from '../utils/backupDatabase.js';
import cron from 'node-cron';

/**
 * Backup Scheduler Service
 * Manages automatic database backups with scheduling
 */

let backupSchedule = null;
let isBackupRunning = false;

/**
 * Initialize backup scheduler
 * Runs backup at specified interval (default: every 6 hours)
 */
function initializeBackupScheduler(cronExpression = '0 */6 * * *') {
  try {
    // Verify node-cron is installed
    if (!cron) {
      logger.error('node-cron is not installed. Install with: npm install node-cron');
      return false;
    }

    // Run initial backup immediately
    performBackup();

    // Schedule recurring backups
    backupSchedule = cron.schedule(cronExpression, () => {
      performBackup();
    });

    logger.info(`✅ Database backup scheduler initialized (schedule: ${cronExpression})`);
    return true;
  } catch (error) {
    logger.error(`Failed to initialize backup scheduler: ${error.message}`);
    return false;
  }
}

/**
 * Execute backup and cleanup old files
 */
async function performBackup() {
  if (isBackupRunning) {
    logger.warn('Backup already running, skipping...');
    return;
  }

  isBackupRunning = true;
  const startTime = Date.now();

  try {
    logger.info('🔄 Starting scheduled database backup...');
    const result = await createBackup();
    const duration = (Date.now() - startTime) / 1000;
    logger.info(`⏱️ Backup completed in ${duration.toFixed(2)} seconds`);

    // Clean old backups (keep last 10)
    cleanOldBackups(10);
  } catch (error) {
    logger.error(`❌ Backup failed: ${error.message}`);
  } finally {
    isBackupRunning = false;
  }
}

/**
 * Stop backup scheduler
 */
function stopBackupScheduler() {
  if (backupSchedule) {
    backupSchedule.stop();
    logger.info('Backup scheduler stopped');
  }
}

/**
 * Get backup status and statistics
 */
function getBackupStatus() {
  const recentBackups = getRecentBackups(5);
  let totalSize = 0;

  recentBackups.forEach(backup => {
    totalSize += backup.size;
  });

  return {
    status: backupSchedule ? 'active' : 'inactive',
    isRunning: isBackupRunning,
    totalBackups: recentBackups.length,
    totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    recentBackups: recentBackups.map(b => ({
      name: b.name,
      size: b.sizeFormatted,
      createdAt: b.createdAt.toISOString()
    }))
  };
}

/**
 * Manual backup endpoint handler
 */
async function handleManualBackup() {
  if (isBackupRunning) {
    return {
      success: false,
      message: 'Backup already running'
    };
  }

  try {
    isBackupRunning = true;
    const result = await createBackup();
    cleanOldBackups(10);

    return {
      success: true,
      message: 'Backup created successfully',
      backup: result
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  } finally {
    isBackupRunning = false;
  }
}

export {
  initializeBackupScheduler,
  stopBackupScheduler,
  performBackup,
  getBackupStatus,
  handleManualBackup
};
