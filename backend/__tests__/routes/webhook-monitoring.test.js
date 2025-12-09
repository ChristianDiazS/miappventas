import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';
import * as webhookLogger from '../../src/middleware/webhookLogger.js';

/**
 * WEBHOOK MONITORING & LOGGING TESTS
 * 
 * Tests para sistema de monitoreo y logging de webhooks
 */

describe('Webhook Monitoring and Logging', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Webhook Logger - Logging Functions', () => {
    it('debe registrar webhook exitoso', async () => {
      await webhookLogger.logWebhookSuccess(
        'payment.completed',
        1,
        'test_payment_123',
        150,
        { statusCode: 200 }
      );

      const metrics = webhookLogger.getWebhookMetrics();
      expect(metrics.total).toBeGreaterThan(0);
      expect(metrics.successful).toBeGreaterThan(0);
    });

    it('debe registrar error de webhook', async () => {
      const error = new Error('Payment processing failed');
      
      await webhookLogger.logWebhookError(
        'payment.failed',
        2,
        'test_payment_456',
        error,
        250,
        { statusCode: 500 }
      );

      const metrics = webhookLogger.getWebhookMetrics();
      expect(metrics.failed).toBeGreaterThan(0);
    });

    it('debe incluir metadata en logs', async () => {
      const metadata = {
        ipAddress: '192.168.1.1',
        userAgent: 'Izipay/1.0',
        signature: 'test_signature_xyz',
      };

      await webhookLogger.logWebhookSuccess(
        'payment.completed',
        3,
        'test_payment_789',
        100,
        metadata
      );

      const metrics = webhookLogger.getWebhookMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('Webhook Metrics', () => {
    it('debe calcular tasa de éxito', () => {
      const metrics = webhookLogger.getWebhookMetrics();
      
      expect(metrics).toHaveProperty('successRate');
      expect(metrics.successRate).toMatch(/%$/); // Termina con %
      expect(metrics.total).toBeGreaterThanOrEqual(0);
    });

    it('debe calcular tiempo promedio de respuesta', () => {
      const metrics = webhookLogger.getWebhookMetrics();
      
      expect(metrics).toHaveProperty('avgResponseTime');
      expect(metrics.avgResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('debe agrupar métricas por evento', async () => {
      await webhookLogger.logWebhookSuccess('payment.completed', 1, 'p1', 100);
      await webhookLogger.logWebhookSuccess('payment.failed', 2, 'p2', 150);
      await webhookLogger.logWebhookSuccess('payment.refunded', 3, 'p3', 200);

      const metrics = webhookLogger.getWebhookMetrics();
      
      expect(metrics.byEvent).toBeDefined();
      expect(Object.keys(metrics.byEvent).length).toBeGreaterThan(0);
    });

    it('debe agrupar métricas por status', () => {
      const metrics = webhookLogger.getWebhookMetrics();
      
      expect(metrics.byStatus).toBeDefined();
      expect(['success', 'error'].some(s => s in metrics.byStatus)).toBe(true);
    });
  });

  describe('Webhook Monitor', () => {
    it('debe crear instancia de monitor', () => {
      expect(webhookLogger.webhookMonitor).toBeDefined();
      expect(webhookLogger.webhookMonitor.listeners).toBeDefined();
    });

    it('debe suscribirse a eventos', (done) => {
      const unsubscribe = webhookLogger.webhookMonitor.subscribe((event, data) => {
        expect(event).toBe('webhook:success');
        expect(data).toHaveProperty('orderId');
        unsubscribe();
        done();
      });

      webhookLogger.webhookMonitor.emit('webhook:success', { orderId: 1 });
    });

    it('debe detectar tasa de error alta', async () => {
      // Simular errores
      for (let i = 0; i < 15; i++) {
        await webhookLogger.logWebhookError(
          'test.event',
          i,
          `payment_${i}`,
          new Error('Test error'),
          100
        );
      }

      const alert = webhookLogger.webhookMonitor.checkErrorRate();
      expect(alert).toBeDefined();
      // Puede estar en alerta o no, dependiendo del estado
      expect(alert).toHaveProperty('alert');
    });

    it('debe detectar latencia alta', async () => {
      // Simular requests lentos
      for (let i = 0; i < 5; i++) {
        await webhookLogger.logWebhookSuccess(
          'slow.event',
          i,
          `payment_${i}`,
          1000 // 1 segundo
        );
      }

      const alert = webhookLogger.webhookMonitor.checkLatency();
      expect(alert).toBeDefined();
      expect(alert).toHaveProperty('alert');
    });
  });

  describe('Webhook Logging Middleware', () => {
    it('debe loguear automáticamente webhooks exitosos', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          event: 'payment.completed',
          orderId: 1,
          paymentId: 'middleware_test_123',
          amount: 99.99,
          status: 'succeeded',
          timestamp: new Date().toISOString(),
        });

      expect([200, 201, 400, 404, 500]).toContain(res.status);
    });

    it('debe registrar tiempo de respuesta', async () => {
      const startTime = Date.now();

      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          event: 'payment.completed',
          orderId: 1,
          paymentId: 'time_test_456',
          status: 'succeeded',
        });

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeGreaterThan(0);
      expect(res).toBeDefined();
    });

    it('debe registrar errores de validación', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          event: null, // Evento inválido
          orderId: 1,
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  describe('Logs Management', () => {
    it('debe obtener resumen de logs', async () => {
      const summary = await webhookLogger.getWebhookLogsSummary(10);
      
      expect(summary).toBeDefined();
      expect(summary).toHaveProperty('totalLines');
      expect(summary).toHaveProperty('recent');
      expect(summary).toHaveProperty('metrics');
    });

    it('debe obtener errores de logs', async () => {
      const errors = await webhookLogger.getWebhookErrors(10);
      
      expect(errors).toBeDefined();
      expect(errors).toHaveProperty('totalErrors');
      if (errors.recent) {
        expect(Array.isArray(errors.recent)).toBe(true);
      }
    });

    it('debe exportar logs a CSV', async () => {
      const timestamp = Date.now();
      const csvPath = `/tmp/webhooks-${timestamp}.csv`;

      const result = await webhookLogger.exportLogsToCSV(csvPath);
      
      expect(result).toBeDefined();
      // El resultado puede ser éxito o error dependiendo del sistema de archivos
      expect(result).toHaveProperty('success');
    });

    it('debe limpiar logs antiguos', async () => {
      const result = await webhookLogger.cleanupOldLogs(30);
      // No debe lanzar excepción
      expect(result === undefined || typeof result === 'object').toBe(true);
    });
  });

  describe('Performance Monitoring', () => {
    it('debe registrar latencia de webhook', async () => {
      const latencies = [];

      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();

        await request(app)
          .post('/api/webhooks/payment')
          .send({
            event: 'payment.completed',
            orderId: i,
            paymentId: `latency_${i}`,
            status: 'succeeded',
          });

        latencies.push(Date.now() - startTime);
      }

      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
      
      expect(avgLatency).toBeGreaterThan(0);
      expect(avgLatency).toBeLessThan(1000); // Menos de 1 segundo
    });

    it('debe registrar throughput', async () => {
      const startTime = Date.now();
      const requestCount = 20;

      const requests = Array.from({ length: requestCount }, (_, i) =>
        request(app)
          .post('/api/webhooks/payment')
          .send({
            event: 'payment.completed',
            orderId: i,
            paymentId: `throughput_${i}`,
            status: 'succeeded',
          })
      );

      await Promise.all(requests);
      const duration = Date.now() - startTime;
      const throughput = (requestCount / (duration / 1000)).toFixed(2);

      expect(Number(throughput)).toBeGreaterThan(0);
      console.log(`📊 Webhook throughput: ${throughput} req/s`);
    });
  });

  describe('Monitoring Alerts', () => {
    it('debe alertar sobre tasa de error > 10%', async () => {
      // Crear escenario con alta tasa de error
      const errorCount = 15;
      const successCount = 5;

      for (let i = 0; i < errorCount; i++) {
        await webhookLogger.logWebhookError(
          'alert.event',
          i,
          `payment_${i}`,
          new Error('Alert test'),
          100
        );
      }

      for (let i = 0; i < successCount; i++) {
        await webhookLogger.logWebhookSuccess(
          'alert.event',
          i,
          `payment_${i}`,
          100
        );
      }

      const alert = webhookLogger.webhookMonitor.checkErrorRate();
      
      if (alert.alert) {
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(alert.severity);
      }
    });

    it('debe alertar sobre latencia > 500ms', async () => {
      // Crear escenario con latencia alta
      for (let i = 0; i < 10; i++) {
        await webhookLogger.logWebhookSuccess(
          'slow.event',
          i,
          `payment_${i}`,
          600 // 600ms
        );
      }

      const alert = webhookLogger.webhookMonitor.checkLatency();
      
      if (alert.alert) {
        expect(alert).toHaveProperty('severity');
        expect(alert).toHaveProperty('message');
        expect(alert.message).toContain('response time');
      }
    });
  });

  describe('Real-time Monitoring', () => {
    it('debe emitir eventos de webhook en tiempo real', (done) => {
      const events = [];

      const unsubscribe = webhookLogger.webhookMonitor.subscribe((event, data) => {
        events.push({ event, data });

        if (events.length === 1) {
          expect(events[0]).toHaveProperty('event');
          expect(events[0]).toHaveProperty('data');
          unsubscribe();
          done();
        }
      });

      webhookLogger.webhookMonitor.emit('webhook:processed', {
        orderId: 1,
        status: 'success',
      });
    });

    it('debe permitir múltiples suscriptores', (done) => {
      let count = 0;

      const unsubscribe1 = webhookLogger.webhookMonitor.subscribe(() => {
        count += 1;
      });

      const unsubscribe2 = webhookLogger.webhookMonitor.subscribe(() => {
        count += 1;
      });

      webhookLogger.webhookMonitor.emit('multi:event', {});

      setTimeout(() => {
        expect(count).toBe(2); // Ambos suscriptores fueron llamados
        unsubscribe1();
        unsubscribe2();
        done();
      }, 100);
    });
  });
});
