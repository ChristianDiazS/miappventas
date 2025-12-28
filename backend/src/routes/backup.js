import express from 'express';
import fs from 'fs';
import path from 'path';
import { handleManualBackup, getBackupStatus, getRecentBackups } from '../services/backupService.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import logger from '../config/logger.js';

const router = express.Router();

/**
 * GET /api/backup/status
 * Get current backup status and recent backups
 * Requires: SUPERADMIN role
 */
router.get('/status', authenticateToken, authorizeRole('SUPERADMIN'), (req, res) => {
  try {
    const status = getBackupStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error(`Error fetching backup status: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching backup status',
      error: error.message
    });
  }
});

/**
 * POST /api/backup/create
 * Create manual database backup
 * Requires: SUPERADMIN role
 */
router.post('/create', authenticateToken, authorizeRole('SUPERADMIN'), async (req, res) => {
  try {
    const result = await handleManualBackup();

    if (result.success) {
      logger.info(`Manual backup created by ${req.user.email}`);
      res.json({
        success: true,
        message: result.message,
        backup: result.backup
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    logger.error(`Error creating backup: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error creating backup',
      error: error.message
    });
  }
});

/**
 * GET /api/backup/list
 * Get list of recent backups
 * Requires: SUPERADMIN role
 */
router.get('/list', authenticateToken, authorizeRole('SUPERADMIN'), (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const backups = getRecentBackups(limit);

    res.json({
      success: true,
      count: backups.length,
      data: backups.map(b => ({
        name: b.name,
        size: b.sizeFormatted,
        createdAt: b.createdAt.toISOString(),
        path: b.path
      }))
    });
  } catch (error) {
    logger.error(`Error listing backups: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error listing backups',
      error: error.message
    });
  }
});

/**
 * POST /api/backup/restore/:fileName
 * Restore database from backup (DANGEROUS - requires confirmation)
 * Requires: SUPERADMIN role + confirmation header
 */
router.post('/restore/:fileName', authenticateToken, authorizeRole('SUPERADMIN'), async (req, res) => {
  try {
    const { fileName } = req.params;
    const confirmationToken = req.headers['x-backup-restore-token'];

    // Security: require explicit confirmation token for restore operation
    if (confirmationToken !== process.env.BACKUP_RESTORE_TOKEN) {
      logger.warn(`Unauthorized restore attempt by ${req.user.email} for backup: ${fileName}`);
      return res.status(403).json({
        success: false,
        message: 'Restore operation requires valid confirmation token'
      });
    }

    // Import restore function
    const { restoreBackup } = await import('../utils/backupDatabase.js');

    const result = await restoreBackup(fileName);

    logger.warn(`🚨 Database restored by ${req.user.email} from backup: ${fileName}`);

    res.json({
      success: true,
      message: result.message,
      warning: '⚠️ Database has been restored. All data since this backup was created has been lost.'
    });
  } catch (error) {
    logger.error(`Error restoring backup: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error restoring backup',
      error: error.message
    });
  }
});

/**
 * DELETE /api/backup/:fileName
 * Delete a specific backup file
 * Requires: SUPERADMIN role
 */
router.delete('/:fileName', authenticateToken, authorizeRole('SUPERADMIN'), async (req, res) => {
  try {
    const { fileName } = req.params;
    const { BACKUP_DIR } = await import('../utils/backupDatabase.js');

    const backupPath = path.join(BACKUP_DIR, fileName);

    // Security: validate file is in backup directory
    if (!backupPath.startsWith(BACKUP_DIR)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid backup file path'
      });
    }

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup file not found'
      });
    }

    fs.unlinkSync(backupPath);
    logger.info(`Backup deleted by ${req.user.email}: ${fileName}`);

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    logger.error(`Error deleting backup: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error deleting backup',
      error: error.message
    });
  }
});

export default router;
