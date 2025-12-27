import { prisma } from '../lib/prisma.js';

/**
 * Middleware de auditoría - Registra todas las acciones en la base de datos
 * Nota: Solo registra acciones de usuarios autenticados para evitar logs vacíos
 */
export async function auditLog(req, res, next) {
  // Solo registrar si hay usuario autenticado
  if (req.user?.id) {
    // Capturar el método original de res.json() para interceptar la respuesta
    const originalJson = res.json;
    
    res.json = function(data) {
      // Después de que se envía la respuesta, registrar en auditoría
      setImmediate(async () => {
        try {
          await logAction({
            userId: req.user.id,
            action: getAction(req.method, req.path),
            entity: getEntity(req.path),
            entityId: getEntityId(req.path, data),
            orderId: getOrderId(req.path, data),
            status: res.statusCode
          });
        } catch (error) {
          console.error('Error registrando auditoría:', error.message);
        }
      });
      
      return originalJson.call(this, data);
    };
  }
  
  next();
}

/**
 * Registrar acción en la base de datos
 */
async function logAction(auditData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: auditData.userId,
        orderId: auditData.orderId || null,
        action: auditData.action,
        entity: auditData.entity,
        entityId: auditData.entityId,
        previousData: null,
        newData: null
      }
    });
  } catch (error) {
    // Silenciar errores de auditoría para no interrumpir las operaciones
    console.log(`[AUDIT] ${auditData.action} - ${auditData.entity}:${auditData.entityId}`);
  }
}

/**
 * Obtener tipo de acción basado en método HTTP
 */
function getAction(method, path) {
  if (path.includes('login')) return 'login';
  if (path.includes('logout')) return 'logout';
  if (path.includes('register')) return 'register';
  
  switch (method) {
    case 'POST': return 'create';
    case 'GET': return 'read';
    case 'PUT':
    case 'PATCH': return 'update';
    case 'DELETE': return 'delete';
    default: return 'access';
  }
}

/**
 * Obtener entity desde el path
 */
function getEntity(path) {
  const parts = path.split('/').filter(p => p);
  const apiIndex = parts.indexOf('api');
  
  if (apiIndex !== -1 && apiIndex + 1 < parts.length) {
    // Retornar el recurso después de /api/
    return parts[apiIndex + 1].replace(/s$/, ''); // Singularizar (products -> product)
  }
  return 'unknown';
}

/**
 * Obtener el ID de la entidad del path o datos
 */
function getEntityId(path, data) {
  const parts = path.split('/').filter(p => p);
  
  // Buscar un número en el path (ID)
  for (let i = 0; i < parts.length; i++) {
    if (!isNaN(parts[i]) && parts[i] !== '') {
      return parseInt(parts[i]);
    }
  }
  
  // Si no encontramos en path, intentar del response
  if (data && typeof data === 'object') {
    if (data.id) return data.id;
    if (data.data?.id) return data.data.id;
  }
  
  return 0; // Default
}

/**
 * Obtener orderId si existe
 */
function getOrderId(path, data) {
  if (path.includes('/orders/') || path.includes('/admin/orders')) {
    return getEntityId(path, data);
  }
  
  if (data && typeof data === 'object') {
    if (data.orderId) return data.orderId;
    if (data.data?.orderId) return data.data.orderId;
  }
  
  return null;
}

/**
 * Registrar acción específica manualmente
 */
export async function logSpecificAction(userId, action, entity, entityId, details = {}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        orderId: details.orderId || null,
        previousData: details.previousData || null,
        newData: details.newData || null
      }
    });
  } catch (error) {
    console.log(`[AUDIT] ${action} on ${entity}:${entityId}`);
  }
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuditLogs(filters = {}) {
  try {
    const whereClause = {};
    
    if (filters.userId) whereClause.userId = parseInt(filters.userId);
    if (filters.action) whereClause.action = filters.action;
    if (filters.entity) whereClause.entity = filters.entity;
    
    return await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 100
    });
  } catch (error) {
    console.error('Error obteniendo logs:', error.message);
    return [];
  }
}

/**
 * Limpiar logs antiguos
 */
export async function cleanOldAuditLogs(daysOld = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });
    
    console.log(`Logs eliminados: ${result.count}`);
    return result.count;
  } catch (error) {
    console.error('Error limpiando logs:', error.message);
    return 0;
  }
}

export default {
  auditLog,
  logSpecificAction,
  getAuditLogs,
  cleanOldAuditLogs
};
