import express from 'express';
import { handlePaymentWebhook } from '../controllers/webhookController.js';

const router = express.Router();

/**
 * POST /api/webhooks/payment
 * Recibe webhooks de pago sin autenticación
 */
router.post('/payment', handlePaymentWebhook);

export default router;
