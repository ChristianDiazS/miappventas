import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { securityHeaders } from './middleware/securityHeaders.js';

// Routes
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payments.js';
import webhookRoutes from './routes/webhooks.js';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }));
  app.use(securityHeaders);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/webhooks', webhookRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend MiAppVentas en línea' });
  });

  // Error handling
  app.use(errorHandler);

  return app;
}
