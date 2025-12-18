import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getDashboardStats,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAuditLogs,
  getReportsByDateRange,
  getSystemHealth,
  getGlobalSettings,
  updateGlobalSettings,
} from '../controllers/superadminController.js';

const router = express.Router();

// Middleware: Requerir SUPERADMIN role en todas las rutas
router.use(authenticate);
router.use(authorize('SUPERADMIN'));

// ============== DASHBOARD ==============
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/health', getSystemHealth);

// ============== ADMIN MANAGEMENT ==============
router.get('/admins', getAllAdmins);
router.post('/admins', createAdmin);
router.put('/admins/:id', updateAdmin);
router.delete('/admins/:id', deleteAdmin);

// ============== AUDIT LOGS ==============
router.get('/audit-logs', getAuditLogs);

// ============== REPORTS ==============
router.get('/reports', getReportsByDateRange);

// ============== SETTINGS ==============
router.get('/settings', getGlobalSettings);
router.put('/settings', updateGlobalSettings);

export default router;
