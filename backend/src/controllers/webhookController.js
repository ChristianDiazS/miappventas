import { prisma } from '../lib/prisma.js';

/**
 * Handle incoming payment webhooks
 * POST /api/webhooks/payment
 */
export async function handlePaymentWebhook(req, res, next) {
  try {
    const payload = req.body;

    // Validar que el payload no sea nulo
    if (!payload) {
      return res.status(400).json({
        success: false,
        message: 'Webhook payload is required',
      });
    }

    // Validar estructura básica
    if (!payload.event) {
      return res.status(400).json({
        success: false,
        message: 'Event type is required',
      });
    }

    const { event, orderId, paymentId, status, amount, refundId, errorMessage, errorCode } = payload;

    // Procesar diferentes tipos de eventos
    switch (event) {
      case 'payment.completed':
        return await handlePaymentCompleted(orderId, paymentId, amount, res);

      case 'payment.failed':
        return await handlePaymentFailed(orderId, paymentId, errorCode, errorMessage, res);

      case 'payment.pending':
        return await handlePaymentPending(orderId, paymentId, res);

      case 'payment.refunded':
        return await handlePaymentRefunded(orderId, refundId, amount, res);

      default:
        return res.status(400).json({
          success: false,
          message: `Unknown event type: ${event}`,
        });
    }
  } catch (error) {
    next(error);
  }
}

async function handlePaymentCompleted(orderId, paymentId, amount, res) {
  try {
    // Validar que orderId sea un número
    if (typeof orderId !== 'number' || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid orderId',
      });
    }

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Actualizar estado de la orden a confirmada
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'COMPLETED',
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment completed successfully',
      orderId,
      paymentId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing payment completion',
    });
  }
}

async function handlePaymentFailed(orderId, paymentId, errorCode, errorMessage, res) {
  try {
    // Validar que orderId sea un número
    if (typeof orderId !== 'number' || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid orderId',
      });
    }

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Actualizar estado de la orden a fallida
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'FAILED',
        paymentError: errorMessage || errorCode,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment failure recorded',
      orderId,
      paymentId,
      error: errorCode,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing payment failure',
    });
  }
}

async function handlePaymentPending(orderId, paymentId, res) {
  try {
    // Validar que orderId sea un número
    if (typeof orderId !== 'number' || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid orderId',
      });
    }

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Actualizar estado de la orden a pendiente
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PENDING',
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Payment pending recorded',
      orderId,
      paymentId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing payment pending',
    });
  }
}

async function handlePaymentRefunded(orderId, refundId, amount, res) {
  try {
    // Validar que orderId sea un número
    if (typeof orderId !== 'number' || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid orderId',
      });
    }

    // Verificar que la orden existe
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Actualizar estado de la orden a reembolsada
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
        refundId,
        refundAmount: amount,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      orderId,
      refundId,
      amount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing refund',
    });
  }
}
