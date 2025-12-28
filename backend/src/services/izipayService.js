/**
 * Izipay Payment Integration
 * Configuration and utilities for Izipay API integration
 */

import logger from '../config/logger.js';

export const IZIPAY_CONFIG = {
  // Estos valores deben venir de variables de entorno
  apiKey: process.env.IZIPAY_API_KEY || 'test_key',
  apiUrl: process.env.IZIPAY_API_URL || 'https://api.sandbox.izipay.pe',
  merchantId: process.env.IZIPAY_MERCHANT_ID || 'test_merchant',
  
  // Timeouts y reintentos
  timeout: 10000,
  retries: 3,
  
  // Modos de operación
  mode: process.env.IZIPAY_MODE || 'sandbox', // 'sandbox' o 'production'
};

/**
 * Crear sesión de pago en Izipay
 */
export async function createPaymentSession(orderId, amount, currency = 'PEN') {
  const payload = {
    orderId: `order-${orderId}`,
    amount: Math.round(amount * 100), // Convertir a céntimos
    currency,
    description: `Order #${orderId}`,
    returnUrl: `${process.env.APP_URL || 'http://localhost:5173'}/checkout/success`,
    cancelUrl: `${process.env.APP_URL || 'http://localhost:5173'}/checkout/cancel`,
    merchantId: IZIPAY_CONFIG.merchantId,
    metadata: {
      orderId,
      timestamp: new Date().toISOString(),
    }
  };

  try {
    const response = await fetch(`${IZIPAY_CONFIG.apiUrl}/api/v1/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${IZIPAY_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(IZIPAY_CONFIG.timeout),
    });

    if (!response.ok) {
      throw new Error(`Izipay API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error(`Error creating Izipay session: ${error.message}`);
    throw error;
  }
}

/**
 * Obtener detalles de pago en Izipay
 */
export async function getPaymentDetails(sessionId) {
  try {
    const response = await fetch(
      `${IZIPAY_CONFIG.apiUrl}/api/v1/sessions/${sessionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${IZIPAY_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(IZIPAY_CONFIG.timeout),
      }
    );

    if (!response.ok) {
      throw new Error(`Izipay API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error(`Error getting payment details: ${error.message}`);
    throw error;
  }
}

/**
 * Refundar pago en Izipay
 */
export async function refundPayment(transactionId, amount = null) {
  const payload = {
    transactionId,
    ...(amount && { amount: Math.round(amount * 100) }), // Reembolso parcial
  };

  try {
    const response = await fetch(
      `${IZIPAY_CONFIG.apiUrl}/api/v1/refunds`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${IZIPAY_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(IZIPAY_CONFIG.timeout),
      }
    );

    if (!response.ok) {
      throw new Error(`Izipay API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logger.error(`Error refunding payment: ${error.message}`);
    throw error;
  }
}

/**
 * Validar webhook de Izipay
 */
export function validateIzipayWebhook(signature, body) {
  // Implementar validación de firma HMAC
  // Ejemplo simplificado
  return signature === `${IZIPAY_CONFIG.apiKey}:${JSON.stringify(body)}`;
}
