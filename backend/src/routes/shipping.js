import express from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';
import {
  calculateShippingCost,
  getAvailableShippingOptions,
  createShipment,
  initializeShippingZones
} from '../services/shippingService.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/shipping/calculate
 * Calcular costo de envío sin crear registro
 */
router.post('/calculate', async (req, res) => {
  try {
    const { department, weight, method = 'STANDARD' } = req.body;

    if (!department) {
      return res.status(400).json({
        error: 'Departamento es requerido'
      });
    }

    const result = calculateShippingCost(department, weight || 0, method);

    if (result.error) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error(`Error calculando envío: ${error.message}`);
    res.status(500).json({ error: 'Error al calcular costo de envío' });
  }
});

/**
 * POST /api/shipping/options
 * Obtener opciones de envío disponibles para un departamento
 */
router.post('/options', async (req, res) => {
  try {
    const { department, weight = 0 } = req.body;

    if (!department) {
      return res.status(400).json({
        error: 'Departamento es requerido'
      });
    }

    // Obtener opciones de la BD
    const options = await getAvailableShippingOptions(department);

    // Calcular costo para cada método
    const optionsWithCost = options.map(option => ({
      ...option,
      cost: calculateShippingCost(department, weight, option.method).cost
    }));

    res.json({
      success: true,
      department,
      weight,
      options: optionsWithCost
    });
  } catch (error) {
    logger.error(`Error obteniendo opciones: ${error.message}`);
    res.status(500).json({ error: 'Error al obtener opciones de envío' });
  }
});

/**
 * POST /api/shipping/create
 * Crear envío para una orden
 */
router.post('/create', async (req, res) => {
  try {
    const { orderId, department, address, method = 'STANDARD' } = req.body;

    if (!orderId || !department || !address) {
      return res.status(400).json({
        error: 'orderId, department y address son requeridos'
      });
    }

    const shipment = await createShipment(orderId, department, address, method);

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    logger.error(`Error creando envío: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/shipping/track/:trackingNumber
 * Seguimiento de envío
 */
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await prisma.shipment.findFirst({
      where: { trackingNumber },
      include: { order: true, shippingRate: { include: { zone: true } } }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Envío no encontrado' });
    }

    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        department: shipment.department,
        address: shipment.address,
        carrierName: shipment.carrierName,
        shippedAt: shipment.shippedAt,
        deliveredAt: shipment.deliveredAt,
        zone: shipment.shippingRate.zone.name,
        method: shipment.shippingRate.method,
        estimatedDays: shipment.shippingRate.estimatedDays,
        shippingCost: shipment.shippingCost / 100 // convertir a soles
      }
    });
  } catch (error) {
    logger.error(`Error obteniendo seguimiento: ${error.message}`);
    res.status(500).json({ error: 'Error al obtener seguimiento' });
  }
});

/**
 * GET /api/shipping/zones
 * Obtener todas las zonas de envío
 */
router.get('/zones', async (req, res) => {
  try {
    const zones = await prisma.shippingZone.findMany({
      where: { active: true },
      include: { shippingRates: { where: { active: true } } }
    });

    res.json({
      success: true,
      data: zones
    });
  } catch (error) {
    logger.error(`Error obteniendo zonas: ${error.message}`);
    res.status(500).json({ error: 'Error al obtener zonas' });
  }
});

/**
 * GET /api/shipping/init
 * Inicializar zonas de envío (desarrollo)
 */
router.get('/init', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'No disponible en producción' });
    }

    await initializeShippingZones();
    res.json({ success: true, message: 'Zonas de envío inicializadas' });
  } catch (error) {
    logger.error(`Error inicializando: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

export default router;
