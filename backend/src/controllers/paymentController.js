import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Validar número de tarjeta usando algoritmo de Luhn
 */
function validateCardNumberLuhn(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

/**
 * Crear una sesión de pago con Izipay
 * POST /api/payments/create-session
 */
export async function createPaymentSession(req, res, next) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return next(new ApiError('Order ID es requerido', 400));
    }

    // Obtener orden con todos los detalles
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        items: { include: { product: true } },
        user: true,
        shippingAddress: true
      }
    });
    
    if (!order) {
      return next(new ApiError('Orden no encontrada', 404));
    }

    // Verificar que el usuario sea el dueño de la orden
    if (order.userId !== req.user.id) {
      return next(new ApiError('No autorizado', 403));
    }

    // Simular sesión de pago
    const paymentSession = {
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      paymentUrl: `https://checkout.izipay.pe/pay/${order.orderNumber}`,
      amount: order.total,
      orderId: order.orderNumber,
      status: 'pending'
    };

    res.json({
      success: true,
      message: 'Sesión de pago creada',
      data: paymentSession
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Procesar pago directo
 * POST /api/payments/process
 */
export async function processPayment(req, res, next) {
  try {
    const { orderId, cardData } = req.body;

    if (!orderId) {
      return next(new ApiError('Order ID es requerido', 400));
    }

    // Obtener orden
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return next(new ApiError('Orden no encontrada', 404));
    }

    // Verificar que el usuario sea el dueño
    if (order.userId !== req.user.id) {
      return next(new ApiError('No autorizado', 403));
    }

    // Validar datos de tarjeta si se proporcionan
    if (cardData) {
      const cardNumber = cardData.number?.replace(/\s/g, '');
      if (!cardNumber || !validateCardNumberLuhn(cardNumber)) {
        return next(new ApiError('Número de tarjeta inválido', 400));
      }

      if (cardData.expiry) {
        const [month, year] = cardData.expiry.split('/');
        const expMonth = parseInt(month);
        const expYear = parseInt(`20${year}`);
        const now = new Date();
        
        if (expMonth < 1 || expMonth > 12) {
          return next(new ApiError('Mes de expiración inválido', 400));
        }
        
        if (expYear < now.getFullYear() || (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)) {
          return next(new ApiError('Tarjeta expirada', 400));
        }
      }

      if (!cardData.cvc || !/^\d{3,4}$/.test(cardData.cvc)) {
        return next(new ApiError('CVC inválido', 400));
      }
    }

    // Crear transacción de pago
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear registro de pago y actualizar orden en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          userId: req.user.id,
          provider: 'IZIPAY',
          providerId: transactionId,
          amount: order.total,
          status: 'COMPLETED'
        }
      });

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'COMPLETED',
          status: 'CONFIRMED'
        }
      });

      return { payment, updatedOrder };
    });

    res.json({
      success: true,
      message: 'Pago procesado exitosamente',
      data: {
        transactionId,
        orderNumber: order.orderNumber,
        amount: order.total,
        status: 'COMPLETED',
        cardLast4: cardData?.number?.slice(-4)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Webhook de Izipay para confirmación de pago
 * POST /api/payments/webhook
 */
export async function handlePaymentWebhook(req, res, next) {
  try {
    const { data } = req.body;

    if (!data?.orderId || !data?.transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Datos de webhook inválidos'
      });
    }

    // Buscar orden por orderNumber
    const order = await prisma.order.findFirst({
      where: { orderNumber: data.orderId }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada'
      });
    }

    // Actualizar estado según webhook
    let paymentStatus = 'PENDING';
    let orderStatus = 'PENDING';

    if (data.status === 'approved' || data.status === 'completed') {
      paymentStatus = 'COMPLETED';
      orderStatus = 'CONFIRMED';
    } else if (data.status === 'failed' || data.status === 'declined') {
      paymentStatus = 'FAILED';
      orderStatus = 'PENDING';
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        status: orderStatus
      }
    });

    res.json({
      success: true,
      message: 'Webhook procesado',
      orderStatus: updatedOrder.status
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obtener estado de pago
 * GET /api/payments/:orderId
 */
export async function getPaymentStatus(req, res, next) {
  try {
    const { orderId } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: { payments: true }
    });
    
    if (!order) {
      return next(new ApiError('Orden no encontrada', 404));
    }

    // Verificar autorización
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return next(new ApiError('No autorizado', 403));
    }

    const latestPayment = order.payments?.[order.payments.length - 1];

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        amount: order.total,
        transactionId: latestPayment?.providerId || null,
        createdAt: order.createdAt,
        payments: order.payments
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Refund/Reembolso
 * POST /api/payments/:orderId/refund
 */
export async function refundPayment(req, res, next) {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) }
    });
    
    if (!order) {
      return next(new ApiError('Orden no encontrada', 404));
    }

    // Verificar autorización
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN' && req.user.role !== 'SUPERADMIN') {
      return next(new ApiError('No autorizado', 403));
    }

    // Solo permitir reembolso si el pago fue completado
    if (order.paymentStatus !== 'COMPLETED') {
      return next(new ApiError('No hay pago para reembolsar', 400));
    }

    // Actualizar orden con reembolso
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'REFUNDED'
      }
    });

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: {
        orderNumber: updatedOrder.orderNumber,
        refundAmount: updatedOrder.total,
        status: 'REFUNDED'
      }
    });
  } catch (error) {
    next(error);
  }
}
