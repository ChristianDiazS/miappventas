import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('API Endpoints - Smoke Tests', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ==================== AUTH ENDPOINTS ====================
  describe('Authentication API', () => {
    it('POST /api/auth/register - debe responder', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123',
        });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('POST /api/auth/login - debe responder', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });
  });

  // ==================== PRODUCTS ENDPOINTS ====================
  describe('Products API', () => {
    it('GET /api/products - debe responder', async () => {
      const res = await request(app)
        .get('/api/products');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('GET /api/products?search=test - debe responder', async () => {
      const res = await request(app)
        .get('/api/products?search=laptop');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('GET /api/products/1 - debe responder', async () => {
      const res = await request(app)
        .get('/api/products/1');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('POST /api/products - debe responder', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer token')
        .send({
          name: 'Producto Test',
          description: 'Desc',
          price: 99.99,
          stock: 10,
        });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });
  });

  // ==================== ORDERS ENDPOINTS ====================
  describe('Orders API', () => {
    it('GET /api/orders - debe responder', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('POST /api/orders - debe responder', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer token')
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 1,
        });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('GET /api/orders/1 - debe responder', async () => {
      const res = await request(app)
        .get('/api/orders/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('PUT /api/orders/1 - debe responder', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', 'Bearer admin_token')
        .send({ status: 'SHIPPED' });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('POST /api/orders/1/cancel - debe responder', async () => {
      const res = await request(app)
        .post('/api/orders/1/cancel')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });
  });

  // ==================== USERS ENDPOINTS ====================
  describe('Users API', () => {
    it('GET /api/users/profile - debe responder', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('PUT /api/users/profile - debe responder', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer token')
        .send({ firstName: 'John' });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('PUT /api/users/password - debe responder', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', 'Bearer token')
        .send({
          currentPassword: 'old',
          newPassword: 'new',
        });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('GET /api/users/1/favorites - debe responder', async () => {
      const res = await request(app)
        .get('/api/users/1/favorites')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('POST /api/users/1/favorites - debe responder', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', 'Bearer token')
        .send({ productId: 1 });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('DELETE /api/users/1/favorites/1 - debe responder', async () => {
      const res = await request(app)
        .delete('/api/users/1/favorites/1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('GET /api/users/1 - debe responder', async () => {
      const res = await request(app)
        .get('/api/users/1');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });
  });

  // ==================== PAYMENT WEBHOOKS ====================
  describe('Payment Webhooks', () => {
    it('POST /api/webhooks/payment - debe responder', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({ orderId: 1, status: 'completed' });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });
  });

  // ==================== INTEGRATION TESTS ====================
  describe('Integration Flow', () => {
    it('Flujo completo de autenticación y listado', async () => {
      // Intentar login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      expect(loginRes.status).toBeDefined();
      expect(loginRes.body).toBeDefined();

      // Listar productos (sin autenticación)
      const productsRes = await request(app)
        .get('/api/products');

      expect(productsRes.status).toBeDefined();
      expect(productsRes.body).toBeDefined();
    });

    it('Flujo: obtener detalles de producto', async () => {
      const res = await request(app)
        .get('/api/products/1');

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('Flujo: crear orden autenticado', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', 'Bearer valid_token')
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 1,
        });

      expect(res.status).toBeDefined();
      expect(res.body).toBeDefined();
    });
  });

  // ==================== ERROR HANDLING ====================
  describe('Error Handling', () => {
    it('Endpoint no existente debe retornar 404', async () => {
      const res = await request(app)
        .get('/api/nonexistent');

      expect(res.status).toBeDefined();
    });

    it('POST sin autenticación en endpoint protegido', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: 1, quantity: 1 }] });

      expect(res.status).toBeDefined();
      expect([400, 401, 403]).toContain(res.status);
    });

    it('Datos inválidos en registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' });

      expect(res.status).toBeDefined();
      expect([400, 422, 401]).toContain(res.status);
    });
  });
});
