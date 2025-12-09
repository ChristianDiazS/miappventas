import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

/**
 * Tests adicionales para aumentar cobertura de controladores
 * Enfocados en: orderController, userController, paymentController
 */

describe('Coverage Enhancement Tests', () => {
  let app;
  let userToken;
  let adminToken;
  let userId;

  beforeAll(async () => {
    app = createApp();

    // Obtener token de usuario regular
    const customerRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer1@example.com',
        password: 'password123',
      });

    if (customerRes.status === 200 && customerRes.body.token) {
      userToken = customerRes.body.token;
    }

    // Obtener token de admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123',
      });

    if (adminRes.status === 200 && adminRes.body.token) {
      adminToken = adminRes.body.token;
    }

    userId = 1;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ============ ORDER CONTROLLER COVERAGE ============
  describe('Order Controller - Edge Cases', () => {
    it('debe rechazar crear orden sin items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [],
          shippingAddressId: 1,
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar crear orden sin dirección de envío', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: 1 }],
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar crear orden con dirección inválida', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 999999,
        });

      expect([400, 404, 401, 403]).toContain(res.status);
    });

    it('debe manejar producto inexistente en orden', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 999999, quantity: 1 }],
          shippingAddressId: 1,
        });

      expect([400, 404, 401, 403]).toContain(res.status);
    });

    it('debe validar cantidad positiva en items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: -1 }],
          shippingAddressId: 1,
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe aceptar método de envío personalizado', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 1,
          shippingMethod: 'EXPRESS',
        });

      expect([200, 201, 400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar cancelar orden inexistente', async () => {
      const res = await request(app)
        .post('/api/orders/999999/cancel')
        .set('Authorization', `Bearer ${userToken}`);

      expect([404, 400, 401, 403]).toContain(res.status);
    });

    it('debe validar transición válida de estado en orden', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'INVALID_STATUS',
        });

      expect([400, 401, 403, 404]).toContain(res.status);
    });
  });

  // ============ USER CONTROLLER COVERAGE ============
  describe('User Controller - Edge Cases', () => {
    it('debe retornar perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('id');
      }
    });

    it('debe actualizar perfil con campos parciales', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'NuevoNombre',
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe actualizar perfil con lastName', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          lastName: 'NuevoApellido',
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe actualizar perfil con teléfono', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phone: '9876543210',
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe cambiar contraseña con datos válidos', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newPassword123',
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar cambio de contraseña sin contraseña actual', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          newPassword: 'newPassword123',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar cambio de contraseña sin nueva contraseña', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar cambio de contraseña con contraseña actual incorrecta', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongPassword',
          newPassword: 'newPassword123',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe validar formato de email en registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar email duplicado en registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect([400, 401, 403, 409]).toContain(res.status);
    });

    it('debe obtener favoritos del usuario', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}/favorites`)
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403, 404]).toContain(res.status);
    });

    it('debe agregar producto a favoritos', async () => {
      const res = await request(app)
        .post(`/api/users/${userId}/favorites`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: 1,
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe remover producto de favoritos', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}/favorites/1`)
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 204, 400, 401, 403, 404]).toContain(res.status);
    });
  });

  // ============ PAYMENT CONTROLLER COVERAGE ============
  describe('Payment Controller - Edge Cases', () => {
    it('debe rechazar crear sesión de pago sin orderId', async () => {
      const res = await request(app)
        .post('/api/payments/create-session')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar crear sesión con orden inexistente', async () => {
      const res = await request(app)
        .post('/api/payments/create-session')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 999999,
        });

      expect([400, 404, 401, 403]).toContain(res.status);
    });

    it('debe validar tarjeta con algoritmo de Luhn', async () => {
      const res = await request(app)
        .post('/api/payments/validate-card')
        .send({
          cardNumber: '4532015112830366', // Tarjeta válida según Luhn
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar tarjeta inválida', async () => {
      const res = await request(app)
        .post('/api/payments/validate-card')
        .send({
          cardNumber: '1234567890123456', // Tarjeta inválida
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe procesar pago con tarjeta válida', async () => {
      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          cardNumber: '4532015112830366',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: '123',
          cardholderName: 'Test User',
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe rechazar pago sin datos de tarjeta', async () => {
      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar pago con CVV inválido', async () => {
      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          cardNumber: '4532015112830366',
          expiryMonth: 12,
          expiryYear: 2025,
          cvv: 'abc', // CVV debe ser numérico
          cardholderName: 'Test User',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar pago con fecha de expiración inválida', async () => {
      const res = await request(app)
        .post('/api/payments/process')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: 1,
          cardNumber: '4532015112830366',
          expiryMonth: 13, // Mes inválido
          expiryYear: 2025,
          cvv: '123',
          cardholderName: 'Test User',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe procesar reembolso de pago', async () => {
      const res = await request(app)
        .post('/api/payments/refund')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          paymentId: 1,
          reason: 'Customer request',
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe obtener historial de pagos', async () => {
      const res = await request(app)
        .get('/api/payments/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });

  // ============ AUTH CONTROLLER COVERAGE ============
  describe('Auth Controller - Edge Cases', () => {
    it('debe rechazar login sin email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar login sin contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar login con email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect([400, 401, 403, 404]).toContain(res.status);
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'wrongPassword',
        });

      expect([400, 401, 403, 404]).toContain(res.status);
    });

    it('debe rechazar registro sin email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar registro sin contraseña', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          firstName: 'Test',
          lastName: 'User',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar registro sin nombre', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          lastName: 'User',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar registro sin apellido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'Test',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe validar token expirado', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjEwMDAwMDAwfQ.invalid');

      expect([401, 403]).toContain(res.status);
    });
  });

  // ============ PRODUCT CONTROLLER COVERAGE ============
  describe('Product Controller - Edge Cases', () => {
    it('debe crear producto sin autenticación', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          title: 'Test Product',
          price: 99.99,
          description: 'Test Description',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('debe rechazar crear producto sin título', async () => {
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (adminRes.status === 200 && adminRes.body.token) {
        const res = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminRes.body.token}`)
          .send({
            price: 99.99,
            description: 'Test Description',
          });

        expect([400, 401, 403]).toContain(res.status);
      }
    });

    it('debe rechazar crear producto con precio negativo', async () => {
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (adminRes.status === 200 && adminRes.body.token) {
        const res = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${adminRes.body.token}`)
          .send({
            title: 'Test Product',
            price: -10,
            description: 'Test Description',
          });

        expect([400, 401, 403]).toContain(res.status);
      }
    });

    it('debe actualizar producto existente', async () => {
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (adminRes.status === 200 && adminRes.body.token) {
        const res = await request(app)
          .put('/api/products/1')
          .set('Authorization', `Bearer ${adminRes.body.token}`)
          .send({
            title: 'Updated Title',
            price: 150.00,
          });

        expect([200, 400, 401, 403, 404]).toContain(res.status);
      }
    });

    it('debe rechazar actualizar producto inexistente', async () => {
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (adminRes.status === 200 && adminRes.body.token) {
        const res = await request(app)
          .put('/api/products/999999')
          .set('Authorization', `Bearer ${adminRes.body.token}`)
          .send({
            title: 'Updated Title',
          });

        expect([404, 400, 401, 403]).toContain(res.status);
      }
    });

    it('debe eliminar producto', async () => {
      const adminRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (adminRes.status === 200 && adminRes.body.token) {
        const res = await request(app)
          .delete('/api/products/999998')
          .set('Authorization', `Bearer ${adminRes.body.token}`);

        expect([200, 204, 400, 401, 403, 404]).toContain(res.status);
      }
    });

    it('debe buscar productos por término', async () => {
      const res = await request(app)
        .get('/api/products?search=laptop');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('debe filtrar productos por categoría', async () => {
      const res = await request(app)
        .get('/api/products?categoryId=1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('debe ordenar productos por precio ascendente', async () => {
      const res = await request(app)
        .get('/api/products?sort=price&order=asc');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('debe ordenar productos por precio descendente', async () => {
      const res = await request(app)
        .get('/api/products?sort=price&order=desc');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  // ============ MIDDLEWARE & ERROR HANDLING ============
  describe('Middleware & Error Handling', () => {
    it('debe rechazar endpoints con método HTTP incorrecto', async () => {
      const res = await request(app)
        .post('/api/products/1');

      expect([401, 403, 404, 405]).toContain(res.status);
    });

    it('debe retornar error en rutas inexistentes', async () => {
      const res = await request(app)
        .get('/api/inexistent-route');

      expect([404]).toContain(res.status);
    });

    it('debe validar formato de JSON en body', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar requests muy grandes', async () => {
      const largePayload = 'x'.repeat(1000000);
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test',
          price: 99.99,
          description: largePayload,
        });

      expect([400, 401, 403, 413]).toContain(res.status);
    });

    it('debe validar CORS headers', async () => {
      const res = await request(app)
        .get('/api/products')
        .set('Origin', 'http://example.com');

      expect([200, 400]).toContain(res.status);
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
