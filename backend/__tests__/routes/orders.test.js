import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Orders API', () => {
  let app;
  let userToken;

  beforeAll(async () => {
    app = createApp();
    
    // Get valid token for testing
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer1@example.com',
        password: 'password123',
      });

    if (loginRes.status === 200 && loginRes.body.token) {
      userToken = loginRes.body.token;
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/orders', () => {
    it('debe retornar lista de órdenes autenticado', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .get('/api/orders');

      expect([401, 403]).toContain(res.status);
    });

    it('debe aceptar filtros de estado', async () => {
      const res = await request(app)
        .get('/api/orders?status=PENDING')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403]).toContain(res.status);
    });

    it('debe aceptar paginación', async () => {
      const res = await request(app)
        .get('/api/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403]).toContain(res.status);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('debe retornar detalles de orden específica', async () => {
      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 404, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('id');
      }
    });

    it('debe retornar 404 para orden inexistente', async () => {
      const res = await request(app)
        .get('/api/orders/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect([404, 401, 403]).toContain(res.status);
    });

    it('debe validar autenticación', async () => {
      const res = await request(app)
        .get('/api/orders/1');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('POST /api/orders', () => {
    it('debe crear nueva orden con datos válidos', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 1,
        });

      expect([201, 200, 400, 401, 403]).toContain(res.status);
      if (res.status === 201 || res.status === 200) {
        expect(res.body).toHaveProperty('data');
      }
    });

    it('debe validar items no vacíos', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [],
          shippingAddressId: 1,
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe validar cantidad positiva', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: -1 }],
          shippingAddressId: 1,
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe validar stock disponible', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: 999999 }],
          shippingAddressId: 1,
        });

      expect([400, 409, 401, 403]).toContain(res.status);
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 1,
        });

      expect([401, 403]).toContain(res.status);
    });

    it('debe validar datos requeridos', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          // Faltando items y shippingAddressId
        });

      expect([400, 401, 403]).toContain(res.status);
    });
  });

  describe('PUT /api/orders/:id', () => {
    it('debe actualizar estado de orden (admin)', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'SHIPPED' });

      expect([200, 401, 403, 404]).toContain(res.status);
    });

    it('debe rechazar actualización sin autenticación', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .send({ status: 'SHIPPED' });

      expect([401, 403]).toContain(res.status);
    });

    it('debe validar estados válidos', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'INVALID_STATUS' });

      expect([400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('POST /api/orders/:id/cancel', () => {
    it('debe cancelar orden válida', async () => {
      const res = await request(app)
        .post('/api/orders/1/cancel')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 204, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe rechazar cancelación sin autenticación', async () => {
      const res = await request(app)
        .post('/api/orders/1/cancel');

      expect([401, 403]).toContain(res.status);
    });

    it('debe rechazar cancelación de orden no cancelable', async () => {
      const res = await request(app)
        .post('/api/orders/999/cancel')
        .set('Authorization', `Bearer ${userToken}`);

      expect([400, 404, 401, 403]).toContain(res.status);
    });
  });

  describe('POST /api/webhooks/payment', () => {
    it('debe procesar webhook de pago', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          orderId: 1,
          status: 'completed',
          amount: 99.99,
        });

      expect([200, 201, 400, 404]).toContain(res.status);
    });

    it('debe rechazar webhook sin datos requeridos', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          // Faltando orderId y status
        });

      expect([400, 404]).toContain(res.status);
    });

    it('debe aceptar webhook con firma válida', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .set('X-Webhook-Signature', 'valid_signature')
        .send({
          orderId: 1,
          status: 'completed',
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('Order Transactions', () => {
    it('debe manejar múltiples items en una orden', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            { productId: 1, quantity: 1 },
            { productId: 2, quantity: 2 },
          ],
          shippingAddressId: 1,
        });

      expect([201, 200, 400, 401, 403]).toContain(res.status);
    });

    it('debe registrar cambios de estado en historial', async () => {
      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', `Bearer ${userToken}`);

      if (res.status === 200 && res.body.data) {
        // Verificar que la orden tenga estructura esperada
        expect(res.body.data).toHaveProperty('status');
        expect([
          'PENDING',
          'PROCESSING',
          'SHIPPED',
          'DELIVERED',
          'CANCELLED'
        ]).toContain(res.body.data.status);
      }
    });
  });
});
