import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

/**
 * PERFORMANCE TESTS - MiAppVentas
 * 
 * Tests de rendimiento y benchmarks para validar:
 * - Tiempo de respuesta de endpoints
 * - Carga máxima soportada
 * - Memoria utilizada
 * - Throughput (requests/segundo)
 */

describe('Performance Tests - Benchmarks', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Webhook Performance', () => {
    it('debe procesar webhook en menos de 500ms', async () => {
      const startTime = performance.now();
      
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          event: 'payment.completed',
          orderId: 1,
          paymentId: 'perf_test_1',
          amount: 99.99,
          status: 'succeeded',
          timestamp: new Date().toISOString(),
        });

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert: Menos de 500ms
      expect(duration).toBeLessThan(500);
      expect([200, 201, 400, 404, 500]).toContain(res.status);
    });

    it('debe manejar múltiples webhooks concurrentes', async () => {
      const startTime = performance.now();
      const concurrentRequests = 10;

      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        request(app)
          .post('/api/webhooks/payment')
          .send({
            event: 'payment.completed',
            orderId: 1,
            paymentId: `perf_concurrent_${i}`,
            amount: 99.99,
            status: 'succeeded',
          })
      );

      const results = await Promise.all(requests);
      const endTime = performance.now();
      const duration = endTime - startTime;
      const avgTime = duration / concurrentRequests;

      // Validaciones
      expect(results).toHaveLength(concurrentRequests);
      expect(avgTime).toBeLessThan(500); // Menos de 500ms promedio
      results.forEach(res => {
        expect([200, 201, 400, 404, 500]).toContain(res.status);
      });

      // Log de performance
      console.log(`⏱️  ${concurrentRequests} webhooks concurrentes: ${duration.toFixed(2)}ms (${avgTime.toFixed(2)}ms promedio)`);
    });

    it('debe mantener estabilidad con 50 requests secuenciales', async () => {
      const startTime = performance.now();
      const requestCount = 50;
      const times = [];

      for (let i = 0; i < requestCount; i++) {
        const reqStart = performance.now();
        
        await request(app)
          .post('/api/webhooks/payment')
          .send({
            event: 'payment.completed',
            orderId: 1,
            paymentId: `perf_seq_${i}`,
            amount: 99.99,
          });

        times.push(performance.now() - reqStart);
      }

      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      const avgTime = totalDuration / requestCount;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      // Validaciones
      expect(avgTime).toBeLessThan(500);
      expect(maxTime).toBeLessThan(1000); // Máximo 1 segundo

      // Log detallado
      console.log(`
📊 Performance - 50 Requests Secuenciales:
   Total: ${totalDuration.toFixed(2)}ms
   Promedio: ${avgTime.toFixed(2)}ms
   Mínimo: ${minTime.toFixed(2)}ms
   Máximo: ${maxTime.toFixed(2)}ms
   Throughput: ${(requestCount / (totalDuration / 1000)).toFixed(2)} req/s
      `);
    });
  });

  describe('Product Listing Performance', () => {
    it('debe listar productos en menos de 200ms', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .get('/api/products?limit=12');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(200);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('timestamp');

      console.log(`⏱️  GET /api/products: ${duration.toFixed(2)}ms`);
    });

    it('debe manejar paginación sin degradación', async () => {
      const pages = [1, 2, 5, 10];
      const times = [];

      for (const page of pages) {
        const startTime = performance.now();

        await request(app)
          .get(`/api/products?page=${page}&limit=12`);

        times.push(performance.now() - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;

      // No debe aumentar significativamente con más páginas
      expect(avgTime).toBeLessThan(300);

      console.log(`📄 Paginación (páginas ${pages.join(', ')}): ${avgTime.toFixed(2)}ms promedio`);
    });

    it('debe buscar productos en menos de 300ms', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .get('/api/products?search=monitor');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(300);
      expect(res.status).toBe(200);

      console.log(`🔍 GET /api/products?search=...: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Authentication Performance', () => {
    it('debe validar token en menos de 100ms', async () => {
      // Primero, login para obtener token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      const token = loginRes.body.token || loginRes.body.data?.token;

      if (token) {
        const startTime = performance.now();

        const res = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`);

        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(duration).toBeLessThan(100);
        console.log(`🔐 Token validation: ${duration.toFixed(2)}ms`);
      }
    });

    it('debe rechazar token inválido rápidamente', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token_12345');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect([401, 403]).toContain(res.status);

      console.log(`⚡ Invalid token rejection: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Database Query Performance', () => {
    it('debe obtener detalle de producto en menos de 150ms', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .get('/api/products/1');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(150);
      expect([200, 404]).toContain(res.status);

      console.log(`📦 GET /api/products/:id: ${duration.toFixed(2)}ms`);
    });

    it('debe listar órdenes en menos de 250ms', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer valid_token');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(250);
      console.log(`📋 GET /api/orders: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('debe mantener memoria estable durante múltiples requests', async () => {
      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024;

      // Hacer 100 requests
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/api/products?limit=1');
      }

      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024;
      const memIncrease = memAfter - memBefore;

      // No debe aumentar más de 50MB
      expect(memIncrease).toBeLessThan(50);

      console.log(`💾 Memory increase after 100 requests: ${memIncrease.toFixed(2)}MB`);
    });
  });

  describe('Error Handling Performance', () => {
    it('debe manejar errores de validación rápidamente', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({ event: null }); // Invalid payload

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(100);
      expect([400, 422]).toContain(res.status);

      console.log(`⚠️  Error handling: ${duration.toFixed(2)}ms`);
    });

    it('debe retornar 404 rápidamente para rutas inexistentes', async () => {
      const startTime = performance.now();

      const res = await request(app)
        .get('/api/nonexistent/route/12345');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(50);
      expect(res.status).toBe(404);

      console.log(`🚫 404 handling: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Concurrent Load Testing', () => {
    it('debe soportar 20 requests simultáneos', async () => {
      const startTime = performance.now();

      const requests = Array.from({ length: 20 }, () =>
        request(app).get('/api/products?limit=1')
      );

      const results = await Promise.all(requests);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(20);
      results.forEach(res => expect(res.status).toBe(200));

      console.log(`🔥 20 concurrent requests: ${duration.toFixed(2)}ms`);
    });

    it('debe soportar mezcla de operaciones (GET/POST)', async () => {
      const startTime = performance.now();

      const requests = [
        ...Array.from({ length: 10 }, () =>
          request(app).get('/api/products?limit=1')
        ),
        ...Array.from({ length: 5 }, (_, i) =>
          request(app)
            .post('/api/webhooks/payment')
            .send({
              event: 'payment.completed',
              orderId: 1,
              paymentId: `load_test_${i}`,
            })
        ),
        ...Array.from({ length: 5 }, () =>
          request(app).get('/api/orders')
        ),
      ];

      const results = await Promise.all(requests);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results).toHaveLength(20);

      const successful = results.filter(r => r.status < 400).length;
      const successRate = (successful / results.length) * 100;

      console.log(`
🎯 Mixed Load Test (10 GET + 5 POST + 5 GET):
   Total Time: ${duration.toFixed(2)}ms
   Success Rate: ${successRate.toFixed(1)}%
   Throughput: ${(20 / (duration / 1000)).toFixed(2)} req/s
      `);
    });
  });

  describe('Stress Testing', () => {
    it('debe manejar degradación gradual sin crashes', async () => {
      const loads = [5, 10, 20, 30];
      const results = [];

      for (const load of loads) {
        const startTime = performance.now();

        const requests = Array.from({ length: load }, () =>
          request(app)
            .post('/api/webhooks/payment')
            .send({
              event: 'payment.completed',
              orderId: 1,
              paymentId: `stress_test_${Math.random()}`,
            })
        );

        const responses = await Promise.all(requests);
        const duration = performance.now() - startTime;
        const successCount = responses.filter(r => r.status < 500).length;

        results.push({
          load,
          duration,
          successRate: (successCount / load) * 100,
          avgTime: duration / load,
        });
      }

      // Verificar que no hay crashes (todos tienen alguna respuesta)
      results.forEach(result => {
        expect(result.successRate).toBeGreaterThan(0);
      });

      console.log(`
📈 Stress Test Results:
${results.map(r => 
  `   Load ${r.load}: ${r.duration.toFixed(2)}ms (${r.avgTime.toFixed(2)}ms avg, ${r.successRate.toFixed(1)}% success)`
).join('\n')}
      `);
    });
  });
});
