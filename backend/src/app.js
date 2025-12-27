import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';
import { specs } from '../swagger-config.js';

// Security Middleware
import { globalLimiter, loginLimiter, apiLimiter, bruteForceProtection } from './middleware/rateLimiter.js';
import { auditLog } from './middleware/auditLog.js';
import { getCORSOptions, getSecurityHeaders } from './config/corsConfig.js';
import { redirectToHttps } from './config/httpsConfig.js';

// Routes
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';
import categoryRoutes from './routes/categories.js';
import superadminRoutes from './routes/superadmin.js';
import debugRoutes from './routes/debug.js';

export function createApp() {
  const app = express();

  // ============ SEGURIDAD - ETAPA 1: HTTPS ============
  // Redirigir HTTP a HTTPS en producción
  app.use(redirectToHttps);

  // ============ SEGURIDAD - ETAPA 2: HELMET & HEADERS ============
  // Helmet.js - Headers de seguridad automáticos
  app.use(helmet());
  
  // Headers de seguridad adicionales
  const secHeaders = getSecurityHeaders();
  app.use((req, res, next) => {
    Object.entries(secHeaders).forEach(([key, value]) => {
      res.set(key, value);
    });
    next();
  });

  // ============ SEGURIDAD - ETAPA 3: CORS RESTRICTIVO ============
  app.use(cors(getCORSOptions()));
  app.use(securityHeaders);

  // ============ SEGURIDAD - ETAPA 4: RATE LIMITING ============
  // Global rate limiter para todas las solicitudes
  app.use(globalLimiter);
  
  // API limiter más específico
  app.use('/api/', apiLimiter);

  // ============ SEGURIDAD - ETAPA 5: AUDITORÍA ============
  // Registrar todas las acciones en auditoría
  app.use(auditLog);

  // ============ PARSER MIDDLEWARE ============
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Swagger Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    swaggerOptions: {
      persistAuthorization: true,
      displayOperationId: true,
      filter: true,
      showRequestHeaders: true,
      docExpansion: 'list'
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'MiAppVentas API Documentation'
  }));

  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webhooks', webhookRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/superadmin', superadminRoutes);
  app.use('/api/debug', debugRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend MiAppVentas en línea' });
  });

  // Error handling
  app.use(errorHandler);

  return app;
}
