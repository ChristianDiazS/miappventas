/**
 * Servicio de Envíos
 * Gestiona cálculo de costos, zonas, métodos y seguimiento
 */

import { PrismaClient } from '@prisma/client';
import logger from '../config/logger.js';

const prisma = new PrismaClient();

/**
 * Zonas geográficas y departamentos de Perú
 */
export const SHIPPING_ZONES = {
  COSTA: {
    name: 'Costa',
    departments: ['Lima', 'Callao', 'Ica', 'Arequipa', 'Moquegua', 'Tacna', 'La Libertad', 'Lambayeque', 'Piura'],
    baseRate: 'costa'
  },
  SIERRA: {
    name: 'Sierra',
    departments: ['Junín', 'Huancavelica', 'Ayacucho', 'Apurímac', 'Huánuco', 'Pasco', 'Ancash', 'Puno'],
    baseRate: 'sierra'
  },
  SELVA: {
    name: 'Selva',
    departments: ['Ucayali', 'Loreto', 'Madre de Dios', 'San Martín', 'Amazonas'],
    baseRate: 'selva'
  }
};

/**
 * Tarifa base predefinida (en centavos)
 * Structure: { method: { baseCost, costPerKg, estimatedDays } }
 */
const BASE_SHIPPING_RATES = {
  costa: {
    STANDARD: { baseCost: 1000, costPerKg: 500, estimatedDays: 3 }, // S/. 10 + S/. 5/kg
    EXPRESS: { baseCost: 2000, costPerKg: 800, estimatedDays: 1 }, // S/. 20 + S/. 8/kg
    PICKUP: { baseCost: 0, costPerKg: 0, estimatedDays: 1 } // Gratis, retira mismo día
  },
  sierra: {
    STANDARD: { baseCost: 2000, costPerKg: 1000, estimatedDays: 5 }, // S/. 20 + S/. 10/kg
    EXPRESS: { baseCost: 4000, costPerKg: 1500, estimatedDays: 2 }, // S/. 40 + S/. 15/kg
    PICKUP: { baseCost: 0, costPerKg: 0, estimatedDays: 1 }
  },
  selva: {
    STANDARD: { baseCost: 3000, costPerKg: 1500, estimatedDays: 7 }, // S/. 30 + S/. 15/kg
    EXPRESS: { baseCost: 5000, costPerKg: 2000, estimatedDays: 3 }, // S/. 50 + S/. 20/kg
    PICKUP: { baseCost: 0, costPerKg: 0, estimatedDays: 1 }
  }
};

/**
 * Obtener la zona geográfica de un departamento
 */
export function getZoneByDepartment(department) {
  for (const [key, zone] of Object.entries(SHIPPING_ZONES)) {
    if (zone.departments.includes(department)) {
      return zone.baseRate;
    }
  }
  return 'costa'; // Default si no encuentra
}

/**
 * Calcular costo de envío
 * @param {string} department - Departamento destino
 * @param {number} totalWeight - Peso total en kg
 * @param {string} method - STANDARD, EXPRESS, PICKUP
 * @returns {object} { cost, estimatedDays }
 */
export function calculateShippingCost(department, totalWeight = 0, method = 'STANDARD') {
  try {
    const zone = getZoneByDepartment(department);
    const rates = BASE_SHIPPING_RATES[zone];
    const methodRates = rates[method];

    if (!methodRates) {
      logger.warn(`Método de envío inválido: ${method}`);
      return { cost: 0, estimatedDays: 0, error: 'Método de envío no disponible' };
    }

    // Cálculo: baseCost + (peso * costPerKg)
    const cost = methodRates.baseCost + (totalWeight * methodRates.costPerKg);

    return {
      cost: Math.round(cost),
      estimatedDays: methodRates.estimatedDays,
      zone,
      method,
      breakdown: {
        baseCost: methodRates.baseCost,
        weightCost: Math.round(totalWeight * methodRates.costPerKg),
        total: Math.round(cost)
      }
    };
  } catch (error) {
    logger.error(`Error calculando costo de envío: ${error.message}`);
    return { cost: 0, estimatedDays: 0, error: error.message };
  }
}

/**
 * Inicializar zonas de envío en la BD (primera vez)
 */
export async function initializeShippingZones() {
  try {
    const existingZones = await prisma.shippingZone.count();
    
    if (existingZones > 0) {
      logger.info('Zonas de envío ya existen en BD');
      return;
    }

    // Crear zonas
    for (const [key, zone] of Object.entries(SHIPPING_ZONES)) {
      await prisma.shippingZone.create({
        data: {
          name: zone.name,
          departments: zone.departments,
          description: `Región ${zone.name}`,
          active: true
        }
      });
    }

    // Crear tasas por zona y método
    const zones = await prisma.shippingZone.findMany();

    for (const zone of zones) {
      const baseRate = SHIPPING_ZONES[zone.name.toUpperCase()]?.baseRate || 'costa';
      const rates = BASE_SHIPPING_RATES[baseRate];

      for (const [method, rate] of Object.entries(rates)) {
        await prisma.shippingRate.create({
          data: {
            zoneId: zone.id,
            method,
            baseCost: rate.baseCost,
            costPerKg: rate.costPerKg,
            estimatedDays: rate.estimatedDays,
            active: true
          }
        });
      }
    }

    logger.info('Zonas de envío e inicializadas correctamente');
  } catch (error) {
    logger.error(`Error inicializando zonas de envío: ${error.message}`);
  }
}

/**
 * Crear envío para una orden
 */
export async function createShipment(orderId, department, address, method = 'STANDARD') {
  try {
    // Obtener orden con items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      throw new Error(`Orden no encontrada: ${orderId}`);
    }

    // Calcular peso total
    const totalWeight = order.items.reduce((sum, item) => {
      return sum + (item.product.weight || 0) * item.quantity;
    }, 0);

    // Obtener tarifa de envío
    const zone = getZoneByDepartment(department);
    const shippingRate = await prisma.shippingRate.findFirst({
      where: {
        zone: { departments: { has: department } },
        method,
        active: true
      }
    });

    if (!shippingRate) {
      throw new Error(`No hay tarifa disponible para ${department} - ${method}`);
    }

    // Calcular costo
    const shippingCost = shippingRate.baseCost + (totalWeight * shippingRate.costPerKg);

    // Crear envío
    const shipment = await prisma.shipment.create({
      data: {
        orderId,
        shippingRateId: shippingRate.id,
        department,
        address,
        totalWeight,
        shippingCost,
        status: 'pending'
      }
    });

    // Actualizar orden con costo de envío
    await prisma.order.update({
      where: { id: orderId },
      data: { shippingCost }
    });

    logger.info(`Envío creado para orden ${orderId}: ${shippingCost} centavos`);
    return shipment;
  } catch (error) {
    logger.error(`Error creando envío: ${error.message}`);
    throw error;
  }
}

/**
 * Obtener costo de envío disponible
 */
export async function getAvailableShippingOptions(department) {
  try {
    const options = await prisma.shippingRate.findMany({
      where: {
        zone: { departments: { has: department } },
        active: true
      },
      include: { zone: true }
    });

    return options.map(option => ({
      method: option.method,
      baseCost: option.baseCost,
      costPerKg: option.costPerKg,
      estimatedDays: option.estimatedDays,
      zone: option.zone.name
    }));
  } catch (error) {
    logger.error(`Error obteniendo opciones de envío: ${error.message}`);
    return [];
  }
}

export default {
  getZoneByDepartment,
  calculateShippingCost,
  initializeShippingZones,
  createShipment,
  getAvailableShippingOptions
};
