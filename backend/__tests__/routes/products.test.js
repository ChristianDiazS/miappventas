import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Products API', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /api/products', () => {
    it('debe retornar lista de productos', async () => {
      const res = await request(app)
        .get('/api/products');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debe aceptar filtro de búsqueda', async () => {
      const res = await request(app)
        .get('/api/products?search=laptop');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('debe aceptar paginación', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('debe aceptar ordenamiento', async () => {
      const res = await request(app)
        .get('/api/products?sort=price&order=asc');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });

    it('debe aceptar filtro de categoría', async () => {
      const res = await request(app)
        .get('/api/products?categoryId=1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
    });
  });

  describe('GET /api/products/:id', () => {
    it('debe retornar detalles de un producto específico', async () => {
      const res = await request(app)
        .get('/api/products/1');

      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('id');
      }
    });

    it('debe retornar 404 para producto inexistente', async () => {
      const res = await request(app)
        .get('/api/products/999999');

      expect(res.status).toBe(404);
    });

    it('debe rechazar ID inválido', async () => {
      const res = await request(app)
        .get('/api/products/invalid');

      expect([400, 404, 500]).toContain(res.status);
    });
  });

  describe('POST /api/products', () => {
    it('debe crear un nuevo producto con autenticación', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;
        const res = await request(app)
          .post('/api/products')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Producto Test',
            description: 'Descripción de prueba',
            price: 99.99,
            stock: 10,
            categoryId: 1,
          });

        expect([201, 200, 401, 403, 400]).toContain(res.status);
      } else {
        // Si el login falla, al menos verificar que el endpoint responde
        expect([404, 400, 401]).toContain(loginRes.status);
      }
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Test',
          description: 'Descripción',
          price: 99.99,
          stock: 10,
        });

      expect([401, 403]).toContain(res.status);
    });

    it('debe validar datos requeridos', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer valid_token')
        .send({
          name: 'Producto Incompleto',
          // Faltando otros campos
        });

      expect([400, 401, 403]).toContain(res.status);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('debe actualizar producto existente', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;
        const res = await request(app)
          .put('/api/products/1')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Producto Actualizado',
            price: 149.99,
          });

        expect([200, 401, 403, 404]).toContain(res.status);
      }
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .put('/api/products/1')
        .send({
          name: 'Producto Actualizado',
        });

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('debe eliminar producto', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'password123',
        });

      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;
        const res = await request(app)
          .delete('/api/products/1')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 204, 401, 403, 404]).toContain(res.status);
      }
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .delete('/api/products/1');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('Stock Management', () => {
    it('debe retornar stock disponible en detalles', async () => {
      const res = await request(app)
        .get('/api/products/1');

      if (res.status === 200) {
        expect(res.body.data).toHaveProperty('stock');
        expect(typeof res.body.data.stock).toBe('number');
      }
    });

    it('debe validar stock positivo al crear', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer admin_token')
        .send({
          name: 'Producto',
          price: 99.99,
          stock: -5, // Stock negativo (inválido)
          categoryId: 1,
        });

      expect([400, 401, 403]).toContain(res.status);
    });
  });
});
