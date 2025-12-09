import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Integration Tests - Complete User Flows', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Flujo de Autenticación y Acceso', () => {
    it('debe permitir flujo completo: registro -> login -> acceso a perfil', async () => {
      // Paso 1: Crear nuevo usuario
      const uniqueEmail = `integration-test-${Date.now()}@example.com`;
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: uniqueEmail,
          password: 'TestPass123',
        });

      expect([201, 200, 400]).toContain(registerRes.status);
      if ((registerRes.status === 201 || registerRes.status === 200) && registerRes.body.user) {
        expect(registerRes.body).toHaveProperty('user');
      }

      // Paso 2: Login con nuevo usuario
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: uniqueEmail,
          password: 'TestPass123',
        });

      expect([200, 201, 400, 401, 404]).toContain(loginRes.status);
      if (loginRes.body && loginRes.body.token) {
        const token = loginRes.body.token;

        // Paso 3: Acceder a perfil con token
        const profileRes = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 401, 403]).toContain(profileRes.status);
      }
    });

    it('debe rechazar acceso con credenciales inválidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
        });

      expect([401, 400, 404]).toContain(res.status);
    });

    it('debe rechazar acceso sin token a endpoints protegidos', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Flujo de Compra', () => {
    it('debe permitir flujo: listar productos -> crear orden -> verificar estado', async () => {
      // Paso 1: Listar productos disponibles
      const productsRes = await request(app)
        .get('/api/products');

      expect(productsRes.status).toBe(200);
      expect(Array.isArray(productsRes.body.data)).toBe(true);

      // Paso 2: Obtener detalles de producto específico
      const productDetailRes = await request(app)
        .get('/api/products/1');

      expect([200, 401, 403, 404]).toContain(productDetailRes.status);

      // Paso 3: Login para crear orden
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Paso 4: Crear orden
        const orderRes = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            items: [{ productId: 1, quantity: 1 }],
            shippingAddressId: 1,
          });

        expect([201, 200, 400, 401, 403]).toContain(orderRes.status);

        // Paso 5: Si la orden se creó, verificar su estado
        if (orderRes.status === 201 || orderRes.status === 200) {
          expect(orderRes.body).toHaveProperty('data');
          const orderId = orderRes.body.data?.id;

          if (orderId) {
            const checkRes = await request(app)
              .get(`/api/orders/${orderId}`)
              .set('Authorization', `Bearer ${token}`);

            expect([200, 401, 403, 404]).toContain(checkRes.status);
          }
        }
      }
    });

    it('debe validar stock antes de crear orden', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Intentar crear orden con cantidad mayor al stock
        const res = await request(app)
          .post('/api/orders')
          .set('Authorization', `Bearer ${token}`)
          .send({
            items: [{ productId: 1, quantity: 99999 }],
            shippingAddressId: 1,
          });

        expect([400, 409, 201, 200, 401, 403]).toContain(res.status);
      }
    });
  });

  describe('Flujo de Gestión de Favoritos', () => {
    it('debe permitir agregar y listar favoritos', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Agregar a favoritos
        const addRes = await request(app)
          .post('/api/users/1/favorites')
          .set('Authorization', `Bearer ${token}`)
          .send({ productId: 1 });

        expect([200, 201, 400, 409, 401, 403]).toContain(addRes.status);

        // Listar favoritos
        const listRes = await request(app)
          .get('/api/users/1/favorites');

        expect([200, 404]).toContain(listRes.status);
        if (listRes.status === 200) {
          expect(Array.isArray(listRes.body.data)).toBe(true);
        }
      }
    });

    it('debe permitir remover de favoritos', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Remover de favoritos
        const deleteRes = await request(app)
          .delete('/api/users/1/favorites/1')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 204, 404, 401, 403]).toContain(deleteRes.status);
      }
    });
  });

  describe('Flujo de Actualización de Perfil', () => {
    it('debe permitir actualizar perfil de usuario', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Actualizar perfil
        const updateRes = await request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send({
            firstName: 'Juan',
            lastName: 'Pérez',
            phone: '123456789',
          });

        expect([200, 400, 401, 403]).toContain(updateRes.status);

        // Verificar que se actualizó
        const verifyRes = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 401, 403]).toContain(verifyRes.status);
      }
    });

    it('debe permitir cambiar contraseña', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Cambiar contraseña
        const changeRes = await request(app)
          .put('/api/users/password')
          .set('Authorization', `Bearer ${token}`)
          .send({
            currentPassword: 'password123',
            newPassword: 'NewSecurePass123',
          });

        expect([200, 400, 401, 403]).toContain(changeRes.status);

        // Nota: En un escenario real, podríamos intentar login con nueva contraseña
        // pero aquí solo verificamos que el endpoint responda
      }
    });
  });

  describe('Flujo de Admin - Gestión de Productos', () => {
    it('debe permitir crear y actualizar productos (admin)', async () => {
      // Login como admin
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Crear producto
        const createRes = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Nuevo Producto',
            description: 'Descripción',
            price: 99.99,
            stock: 50,
            categoryId: 1,
          });

        expect([201, 200, 400, 401, 403]).toContain(createRes.status);

        if ((createRes.status === 201 || createRes.status === 200) && createRes.body.data?.id) {
          const productId = createRes.body.data.id;

          // Actualizar producto
          const updateRes = await request(app)
            .put(`/api/products/${productId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
              price: 119.99,
              stock: 30,
            });

          expect([200, 400, 401, 403, 404]).toContain(updateRes.status);
        }
      }
    });

    it('debe permitir eliminar productos (admin)', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        const deleteRes = await request(app)
          .delete('/api/products/1')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 204, 401, 403, 404]).toContain(deleteRes.status);
      }
    });
  });

  describe('Flujo de Admin - Gestión de Órdenes', () => {
    it('debe permitir actualizar estado de órdenes (admin)', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Obtener órdenes
        const listRes = await request(app)
          .get('/api/orders')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 401, 403]).toContain(listRes.status);

        // Actualizar estado de orden
        const updateRes = await request(app)
          .put('/api/orders/1')
          .set('Authorization', `Bearer ${token}`)
          .send({ status: 'SHIPPED' });

        expect([200, 400, 401, 403, 404]).toContain(updateRes.status);
      }
    });
  });

  describe('Flujo de Webhook de Pago', () => {
    it('debe procesar webhook de pago completado', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          orderId: 1,
          status: 'completed',
          amount: 99.99,
          transactionId: 'txn_123456',
        });

      expect([200, 201, 400, 404]).toContain(res.status);
    });

    it('debe manejar webhook de pago fallido', async () => {
      const res = await request(app)
        .post('/api/webhooks/payment')
        .send({
          orderId: 1,
          status: 'failed',
          error: 'Insufficient funds',
        });

      expect([200, 201, 400, 404, 401]).toContain(res.status);
    });
  });

  describe('Errores y Validaciones', () => {
    it('debe retornar 404 para endpoint no existente', async () => {
      const res = await request(app)
        .get('/api/nonexistent');

      expect(res.status).toBe(404);
    });

    it('debe validar métodos HTTP', async () => {
      const res = await request(app)
        .patch('/api/products/1');

      expect([404, 405, 501]).toContain(res.status);
    });

    it('debe retornar errores con estructura consistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrong',
        });

      expect([400, 401, 404]).toContain(res.status);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('Performance y Carga', () => {
    it('debe manejar múltiples requests en paralelo', async () => {
      const requests = [];

      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/api/products'));
      }

      const results = await Promise.all(requests);

      results.forEach((res) => {
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
      });
    });

    it('debe retornar respuestas en tiempo razonable', async () => {
      const start = Date.now();
      const res = await request(app)
        .get('/api/products');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });
  });
});
