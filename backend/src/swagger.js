/**
 * Swagger Configuration para SUPERADMIN API
 * Guardar como: backend/src/swagger.js
 */

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Un Poquito Variado - SUPERADMIN API',
      version: '1.0.0',
      description: 'API de administración SUPERADMIN para gestionar la plataforma e-commerce',
      contact: {
        name: 'API Support',
        email: 'support@unpoquitovariado.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
      {
        url: 'https://api.unpoquitovariado.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token para autenticación',
        },
      },
      schemas: {
        DashboardStats: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                totalUsers: { type: 'integer' },
                activeUsers: { type: 'integer' },
                totalOrders: { type: 'integer' },
                totalRevenue: { type: 'integer' },
                avgOrderValue: { type: 'integer' },
              },
            },
            thisMonth: {
              type: 'object',
              properties: {
                orders: { type: 'integer' },
                revenue: { type: 'integer' },
              },
            },
            topProducts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'integer' },
                  title: { type: 'string' },
                  sales: { type: 'integer' },
                  revenue: { type: 'integer' },
                },
              },
            },
          },
        },
        Admin: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'SUPERADMIN'] },
            active: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuditLog: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            userId: { type: 'integer' },
            action: { type: 'string' },
            entity: { type: 'string' },
            entityId: { type: 'integer' },
            previousData: { type: 'object' },
            newData: { type: 'object' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/superadmin.js'],
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
