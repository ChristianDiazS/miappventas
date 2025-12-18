import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ============== DASHBOARD STATS ==============

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total users
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { active: true } });

    // Total orders & revenue
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
    });

    // Orders this month
    const monthOrders = await prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    const monthRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: startOfMonth } },
    });

    // Orders last 30 days (trending)
    const last30DaysOrders = await prisma.order.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    // Average order value
    const avgOrderValue = totalOrders > 0 ? (totalRevenue._sum.total || 0) / totalOrders : 0;

    // Top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _count: true,
      _sum: { subtotal: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 5,
    });

    // Enrich top products with details
    const topProductsEnriched = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, title: true, price: true },
        });
        return {
          productId: item.productId,
          title: product?.title || 'Unknown',
          sales: item._count,
          revenue: item._sum.subtotal || 0,
        };
      })
    );

    // Payment methods distribution
    const paymentsByMethod = await prisma.payment.groupBy({
      by: ['provider'],
      _count: true,
      _sum: { amount: true },
    });

    // Order status distribution
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      _sum: { total: true },
    });

    res.json({
      summary: {
        totalUsers,
        activeUsers,
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        avgOrderValue: Math.round(avgOrderValue),
      },
      thisMonth: {
        orders: monthOrders,
        revenue: monthRevenue._sum.total || 0,
      },
      last30Days: {
        orders: last30DaysOrders,
      },
      topProducts: topProductsEnriched,
      paymentsByMethod,
      ordersByStatus,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// ============== ADMIN MANAGEMENT ==============

export const getAllAdmins = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'SUPERADMIN'] },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({
      where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    });

    res.json({
      admins,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

export const createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Validations
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['ADMIN', 'SUPERADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role,
        phone: '',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    // Log this action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'admin_created',
        entity: 'user',
        entityId: newAdmin.id,
        newData: {
          email: newAdmin.email,
          role: newAdmin.role,
        },
      },
    });

    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, active } = req.body;

    // Prevent downgrading the only SUPERADMIN
    if (role !== 'SUPERADMIN') {
      const superadminCount = await prisma.user.count({
        where: { role: 'SUPERADMIN' },
      });

      if (superadminCount === 1) {
        const currentUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
        if (currentUser.role === 'SUPERADMIN') {
          return res.status(400).json({ error: 'Cannot downgrade the only SUPERADMIN' });
        }
      }
    }

    const previousData = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    const updatedAdmin = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role }),
        ...(active !== undefined && { active }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        active: true,
        updatedAt: true,
      },
    });

    // Log this action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'admin_updated',
        entity: 'user',
        entityId: parseInt(id),
        previousData: { role: previousData.role, active: previousData.active },
        newData: { role: updatedAdmin.role, active: updatedAdmin.active },
      },
    });

    res.json(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({ error: 'Failed to update admin' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting the only SUPERADMIN
    const superadminCount = await prisma.user.count({
      where: { role: 'SUPERADMIN' },
    });

    const userToDelete = await prisma.user.findUnique({ where: { id: parseInt(id) } });

    if (userToDelete.role === 'SUPERADMIN' && superadminCount === 1) {
      return res.status(400).json({ error: 'Cannot delete the only SUPERADMIN' });
    }

    // Log before deletion
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'admin_deleted',
        entity: 'user',
        entityId: parseInt(id),
        newData: {
          email: userToDelete.email,
          role: userToDelete.role,
        },
      },
    });

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
};

// ============== AUDIT LOGS ==============

export const getAuditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { action, userId, startDate, endDate } = req.query;

    const where = {};

    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.auditLog.count({ where });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// ============== REPORTS ==============

export const getReportsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Daily revenue
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        paymentStatus: 'COMPLETED',
      },
      select: { createdAt: true, total: true },
    });

    // Group by day
    const dailyRevenue = {};
    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      dailyRevenue[day] = (dailyRevenue[day] || 0) + order.total;
    });

    // Top customers
    const topCustomers = await prisma.order.groupBy({
      by: ['userId'],
      _count: true,
      _sum: { total: true },
      where: {
        createdAt: { gte: start, lte: end },
      },
      orderBy: { _sum: { total: 'desc' } },
      take: 10,
    });

    const topCustomersEnriched = await Promise.all(
      topCustomers.map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.userId },
          select: { email: true, firstName: true, lastName: true },
        });
        return {
          userId: item.userId,
          name: `${user?.firstName} ${user?.lastName}`,
          email: user?.email,
          orders: item._count,
          totalSpent: item._sum.total || 0,
        };
      })
    );

    res.json({
      dateRange: { startDate, endDate },
      dailyRevenue,
      topCustomers: topCustomersEnriched,
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ error: 'Failed to generate reports' });
  }
};

// ============== SYSTEM HEALTH ==============

export const getSystemHealth = async (req, res) => {
  try {
    const dbCheck = await prisma.user.count(); // Simple DB check

    const health = {
      status: 'ok',
      database: 'connected',
      timestamp: new Date(),
      metrics: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    };

    res.json(health);
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
};

// ============== SETTINGS ==============

export const getGlobalSettings = async (req, res) => {
  try {
    // For now, return default settings
    // TODO: Implement GlobalSettings model in Prisma
    const settings = {
      appName: 'Un Poquito Variado',
      maintenanceMode: false,
      maxProductsPerPage: 12,
      enableNewsletter: true,
      enableReviews: true,
      defaultCurrency: 'PEN',
      defaultLanguage: 'es',
      supportEmail: 'soporte@unpoquitovariado.com',
      privacyPolicy: 'https://example.com/privacy',
      termsOfService: 'https://example.com/terms',
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateGlobalSettings = async (req, res) => {
  try {
    const { ...settingsData } = req.body;

    // Log this action
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'settings_updated',
        entity: 'settings',
        entityId: 1,
        newData: settingsData,
      },
    });

    // TODO: Save to database when GlobalSettings model is created
    res.json({
      message: 'Settings updated successfully',
      settings: settingsData,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};
