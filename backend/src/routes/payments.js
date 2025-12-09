import express from 'express';
import {
  createPaymentSession,
  processPayment,
  handlePaymentWebhook,
  getPaymentStatus,
  refundPayment
} from '../controllers/paymentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Webhook (sin autenticación - público)
router.post('/webhook', handlePaymentWebhook);

// Rutas protegidas
router.use(authenticateToken);

router.post('/create-session', createPaymentSession);
router.post('/process', processPayment);
router.get('/:orderId', getPaymentStatus);
router.post('/:orderId/refund', refundPayment);

export default router;
