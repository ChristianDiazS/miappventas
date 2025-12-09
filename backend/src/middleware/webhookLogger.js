/**
 * Webhook Logger and Monitoring
 * Sistema de logging y monitoreo para webhooks de pago
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../../logs');
const WEBHOOKS_LOG = path.join(LOGS_DIR, 'webhooks.log');
const WEBHOOKS_ERROR_LOG = path.join(LOGS_DIR, 'webhooks-error.log');
const WEBHOOKS_METRICS = path.join(LOGS_DIR, 'webhooks-metrics.json');

// Estadísticas en memoria
let webhookMetrics = {
  total: 0,
  successful: 0,
  failed: 0,
  byEvent: {},
  byStatus: {},
  avgResponseTime: 0,
  lastUpdated: new Date().toISOString(),
};

/**
 * Inicializar directorio de logs
 */
async function initializeLogsDir() {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating logs directory:', error);
  }
}

/**
 * Log de webhook exitoso
 */
export async function logWebhookSuccess(
  event,
  orderId,
  paymentId,
  responseTime,
  metadata = {}
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'INFO',
    event,
    orderId,
    paymentId,
    responseTime,
    status: 'SUCCESS',
    ...metadata,
  };

  try {
    await initializeLogsDir();
    
    // Escribir en log principal
    const logLine = `[${timestamp}] [${logEntry.level}] Event: ${event}, Order: ${orderId}, PaymentId: ${paymentId}, Time: ${responseTime}ms\n`;
    await fs.appendFile(WEBHOOKS_LOG, logLine);

    // Actualizar métricas
    await updateMetrics(event, 'success', responseTime);

    console.log(`✅ Webhook logged: ${event} (${orderId})`);
  } catch (error) {
    console.error('Error logging webhook:', error);
  }
}

/**
 * Log de error de webhook
 */
export async function logWebhookError(
  event,
  orderId,
  paymentId,
  error,
  responseTime,
  metadata = {}
) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    event,
    orderId,
    paymentId,
    error: error.message || String(error),
    stack: error.stack,
    responseTime,
    status: 'FAILED',
    ...metadata,
  };

  try {
    await initializeLogsDir();

    // Escribir en log de errores
    const errorLine = `[${timestamp}] [${logEntry.level}] Event: ${event}, Order: ${orderId}, Error: ${logEntry.error}\n`;
    await fs.appendFile(WEBHOOKS_ERROR_LOG, errorLine);

    // Escribir JSON detallado
    const detailedLog = JSON.stringify(logEntry, null, 2);
    await fs.appendFile(WEBHOOKS_ERROR_LOG, `${detailedLog}\n\n`);

    // Actualizar métricas
    await updateMetrics(event, 'error', responseTime);

    console.error(`❌ Webhook error logged: ${event} (${orderId}) - ${logEntry.error}`);
  } catch (error) {
    console.error('Error logging webhook error:', error);
  }
}

/**
 * Actualizar métricas
 */
async function updateMetrics(event, status, responseTime) {
  try {
    // Actualizar contadores
    webhookMetrics.total += 1;

    if (status === 'success') {
      webhookMetrics.successful += 1;
    } else {
      webhookMetrics.failed += 1;
    }

    // Por evento
    if (!webhookMetrics.byEvent[event]) {
      webhookMetrics.byEvent[event] = { count: 0, success: 0, error: 0 };
    }
    webhookMetrics.byEvent[event].count += 1;
    if (status === 'success') {
      webhookMetrics.byEvent[event].success += 1;
    } else {
      webhookMetrics.byEvent[event].error += 1;
    }

    // Por status
    if (!webhookMetrics.byStatus[status]) {
      webhookMetrics.byStatus[status] = 0;
    }
    webhookMetrics.byStatus[status] += 1;

    // Promedio de tiempo de respuesta
    const totalTime = webhookMetrics.avgResponseTime * (webhookMetrics.total - 1);
    webhookMetrics.avgResponseTime = (totalTime + responseTime) / webhookMetrics.total;
    webhookMetrics.lastUpdated = new Date().toISOString();

    // Guardar métricas
    await initializeLogsDir();
    await fs.writeFile(
      WEBHOOKS_METRICS,
      JSON.stringify(webhookMetrics, null, 2)
    );
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
}

/**
 * Obtener métricas actuales
 */
export function getWebhookMetrics() {
  return {
    ...webhookMetrics,
    successRate: (webhookMetrics.successful / webhookMetrics.total * 100).toFixed(2) + '%',
  };
}

/**
 * Obtener resumen de logs
 */
export async function getWebhookLogsSummary(limit = 50) {
  try {
    await initializeLogsDir();
    
    const logs = await fs.readFile(WEBHOOKS_LOG, 'utf-8');
    const lines = logs.split('\n').filter(l => l.trim());
    
    return {
      totalLines: lines.length,
      recent: lines.slice(-limit),
      metrics: getWebhookMetrics(),
    };
  } catch (error) {
    console.error('Error reading logs:', error);
    return { error: error.message };
  }
}

/**
 * Obtener errores de logs
 */
export async function getWebhookErrors(limit = 20) {
  try {
    await initializeLogsDir();
    
    const errorLogs = await fs.readFile(WEBHOOKS_ERROR_LOG, 'utf-8');
    const entries = errorLogs.split('\n\n').filter(e => e.trim());
    
    return {
      totalErrors: entries.length,
      recent: entries.slice(-limit),
    };
  } catch (error) {
    console.error('Error reading error logs:', error);
    return { error: error.message };
  }
}

/**
 * Middleware para logging automático de webhooks
 */
export function webhookLoggingMiddleware(req, res, next) {
  const startTime = Date.now();

  // Interceptar el método send original
  const originalSend = res.send;
  
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const event = req.body?.event || 'unknown';
    const orderId = req.body?.orderId || 'unknown';
    const paymentId = req.body?.paymentId || 'unknown';

    // Log automático
    if (res.statusCode < 400) {
      logWebhookSuccess(event, orderId, paymentId, responseTime, {
        statusCode: res.statusCode,
        path: req.path,
      });
    } else {
      logWebhookError(
        event,
        orderId,
        paymentId,
        new Error(`HTTP ${res.statusCode}`),
        responseTime,
        { path: req.path, statusCode: res.statusCode }
      );
    }

    return originalSend.call(this, data);
  };

  next();
}

/**
 * Limpiar logs antiguos (mantener últimos N días)
 */
export async function cleanupOldLogs(daysToKeep = 30) {
  try {
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000;

    for (const logFile of [WEBHOOKS_LOG, WEBHOOKS_ERROR_LOG]) {
      const stats = await fs.stat(logFile);
      const fileAge = now - stats.mtimeMs;

      if (fileAge > maxAge) {
        await fs.unlink(logFile);
        console.log(`✨ Cleaned up old log file: ${logFile}`);
      }
    }
  } catch (error) {
    console.error('Error cleaning up logs:', error);
  }
}

/**
 * Exportar logs a CSV
 */
export async function exportLogsToCSV(outputPath) {
  try {
    await initializeLogsDir();
    
    const logs = await fs.readFile(WEBHOOKS_LOG, 'utf-8');
    const lines = logs.split('\n').filter(l => l.trim());

    // Convertir a CSV
    const csvHeader = 'timestamp,level,event,orderId,paymentId,responseTime,status\n';
    const csvLines = lines.map(line => {
      // Parsear la línea de log
      const match = line.match(/\[(.*?)\].*?Event: (.*?), Order: (.*?), PaymentId: (.*?), Time: (.*?)ms/);
      if (match) {
        return `${match[1]},INFO,${match[2]},${match[3]},${match[4]},${match[5]},SUCCESS`;
      }
      return line;
    });

    const csvContent = csvHeader + csvLines.join('\n');
    await fs.writeFile(outputPath, csvContent);

    console.log(`📊 Logs exported to CSV: ${outputPath}`);
    return { success: true, path: outputPath };
  } catch (error) {
    console.error('Error exporting logs:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Monitoreo en tiempo real
 */
export class WebhookMonitor {
  constructor() {
    this.listeners = [];
    this.isMonitoring = false;
  }

  /**
   * Suscribirse a eventos de webhook
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  /**
   * Emitir evento
   */
  emit(event, data) {
    this.listeners.forEach(listener => listener(event, data));
  }

  /**
   * Obtener alerta si hay demasiados errores
   */
  checkErrorRate() {
    const metrics = getWebhookMetrics();
    const errorRate = (metrics.failed / metrics.total) * 100;

    if (errorRate > 10) {
      return {
        alert: true,
        severity: 'HIGH',
        message: `Error rate is ${errorRate.toFixed(2)}%`,
        metrics,
      };
    }

    return { alert: false };
  }

  /**
   * Obtener alerta si hay latencia alta
   */
  checkLatency() {
    const metrics = getWebhookMetrics();
    const avgTime = metrics.avgResponseTime;

    if (avgTime > 500) {
      return {
        alert: true,
        severity: 'MEDIUM',
        message: `Average response time is ${avgTime.toFixed(2)}ms`,
        metrics,
      };
    }

    return { alert: false };
  }
}

// Exportar instancia de monitor
export const webhookMonitor = new WebhookMonitor();
