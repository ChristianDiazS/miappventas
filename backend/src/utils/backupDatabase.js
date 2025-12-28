import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import logger from '../config/logger.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Database Backup Utility
 * Creates automated PostgreSQL database backups
 * Runs scheduled backups every 6 hours
 */

const BACKUP_DIR = path.resolve('./backups');
const DB_HOST = process.env.DATABASE_HOST || 'localhost';
const DB_PORT = process.env.DATABASE_PORT || 5432;
const DB_NAME = process.env.DATABASE_NAME || 'miappventas';
const DB_USER = process.env.DATABASE_USER || 'postgres';
const DB_PASSWORD = process.env.DATABASE_PASSWORD || '';

/**
 * Ensure backup directory exists
 */
function ensureBackupDirExists() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    logger.info(`Backup directory created: ${BACKUP_DIR}`);
  }
}

/**
 * Create a backup file name with timestamp
 * Format: miappventas_YYYY-MM-DD_HH-mm-ss.sql
 */
function getBackupFileName() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `${DB_NAME}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.sql`;
}

/**
 * Execute pg_dump to create database backup
 */
function createBackup() {
  return new Promise((resolve, reject) => {
    ensureBackupDirExists();

    const backupFileName = getBackupFileName();
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);
    const backupFile = fs.createWriteStream(backupFilePath);

    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };

    // pg_dump command
    const pg_dump = spawn('pg_dump', [
      `-h ${DB_HOST}`,
      `-p ${DB_PORT}`,
      `-U ${DB_USER}`,
      '-v', // verbose
      '--no-password',
      '-F c', // custom format (more compression)
      DB_NAME
    ], { shell: true, env });

    backupFile.on('error', (err) => {
      logger.error(`Backup file write error: ${err.message}`);
      reject(err);
    });

    pg_dump.stdout.pipe(backupFile);

    pg_dump.on('error', (err) => {
      logger.error(`pg_dump error: ${err.message}`);
      reject(err);
    });

    pg_dump.on('close', (code) => {
      if (code === 0) {
        const fileSize = fs.statSync(backupFilePath).size;
        logger.info(`✅ Database backup created successfully: ${backupFileName} (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
        resolve({ fileName: backupFileName, filePath: backupFilePath, size: fileSize });
      } else {
        logger.error(`❌ pg_dump exited with code ${code}`);
        reject(new Error(`pg_dump failed with exit code ${code}`));
      }
    });
  });
}

/**
 * Delete old backups (keep only last N backups)
 * Default: keep 10 recent backups
 */
function cleanOldBackups(keepCount = 10) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return;

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(DB_NAME) && f.endsWith('.sql'))
      .map(f => ({
        name: f,
        path: path.join(BACKUP_DIR, f),
        mtime: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
      }))
      .sort((a, b) => b.mtime - a.mtime);

    if (files.length > keepCount) {
      const toDelete = files.slice(keepCount);
      toDelete.forEach(file => {
        fs.unlinkSync(file.path);
        logger.info(`🗑️ Old backup deleted: ${file.name}`);
      });
    }
  } catch (error) {
    logger.error(`Error cleaning old backups: ${error.message}`);
  }
}

/**
 * Get list of recent backups
 */
function getRecentBackups(limit = 10) {
  try {
    if (!fs.existsSync(BACKUP_DIR)) return [];

    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith(DB_NAME) && f.endsWith('.sql'))
      .map(f => {
        const filePath = path.join(BACKUP_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          size: stats.size,
          sizeFormatted: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          createdAt: stats.mtime,
          path: filePath
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return files;
  } catch (error) {
    logger.error(`Error reading backups: ${error.message}`);
    return [];
  }
}

/**
 * Restore database from backup
 * WARNING: This overwrites the current database
 */
function restoreBackup(backupFileName) {
  return new Promise((resolve, reject) => {
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(backupFilePath)) {
      reject(new Error(`Backup file not found: ${backupFileName}`));
      return;
    }

    const env = { ...process.env, PGPASSWORD: DB_PASSWORD };

    // pg_restore command
    const pg_restore = spawn('pg_restore', [
      `-h ${DB_HOST}`,
      `-p ${DB_PORT}`,
      `-U ${DB_USER}`,
      '-d', DB_NAME,
      '-v', // verbose
      '--no-password',
      '-c', // clean (drop objects before recreating)
      backupFilePath
    ], { shell: true, env });

    pg_restore.on('error', (err) => {
      logger.error(`pg_restore error: ${err.message}`);
      reject(err);
    });

    pg_restore.on('close', (code) => {
      if (code === 0) {
        logger.info(`✅ Database restored successfully from: ${backupFileName}`);
        resolve({ fileName: backupFileName, restored: true });
      } else {
        logger.error(`❌ pg_restore exited with code ${code}`);
        reject(new Error(`pg_restore failed with exit code ${code}`));
      }
    });
  });
}

export { createBackup, cleanOldBackups, getRecentBackups, restoreBackup, BACKUP_DIR };
