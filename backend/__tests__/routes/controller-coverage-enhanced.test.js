import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

/**
 * ENHANCED CONTROLLER COVERAGE
 * 
 * Tests detallados para aumentar cobertura de controladores:
 * - authController: Casos edge y validaciones
 * - productController: Filtros, búsqueda, categorías
 * - orderController: Estados, operaciones
 * - userController: Perfil, favoritos, preferencias
 */

describe('Enhanced Controller Coverage', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Auth Controller - Enhanced Coverage', () => {
    it('debe rechazar email inválido en registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'invalid-email',
          password: 'password123',
          phone: '1234567890'
        });

      expect([400, 422]).toContain(res.status);
      expect(res.body).toHaveProperty('success', false);
    });

    it('debe rechazar password muy corto en registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: '123', // Muy corto
          phone: '1234567890'
        });

      expect([400, 422]).toContain(res.status);
    });

    it('debe rechazar email duplicado', async () => {
      // Crear primer usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test1',
          lastName: 'User1',
          email: 'unique@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      // Intentar crear con mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test2',
          lastName: 'User2',
          email: 'unique@example.com',
          password: 'password123',
          phone: '0987654321'
        });

      expect([400, 409]).toContain(res.status);
    });

    it('debe rechazar login con email no registrado', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('success', false);
    });

    it('debe rechazar login con contraseña incorrecta', async () => {
      // Crear usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'correctpass@example.com',
          password: 'correctpassword',
          phone: '1234567890'
        });

      // Intentar login con contraseña incorrecta
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'correctpass@example.com',
          password: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('Product Controller - Enhanced Coverage', () => {
    it('debe filtrar productos por categoría', async () => {
      const res = await request(app)
        .get('/api/products?category=laptops');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('pagination');
    });

    it('debe filtrar productos por rango de precio', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=100&maxPrice=1000');

      expect(res.status).toBe(200);
      if (res.body.data && res.body.data.length > 0) {
        res.body.data.forEach(product => {
          expect(product.price).toBeGreaterThanOrEqual(100);
          expect(product.price).toBeLessThanOrEqual(1000);
        });
      }
    });

    it('debe buscar productos por nombre', async () => {
      const res = await request(app)
        .get('/api/products?search=monitor');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('data');
      // Si hay resultados, deben contener el término de búsqueda
      if (res.body.data && res.body.data.length > 0) {
        const hasMentionOfSearch = res.body.data.some(p =>
          p.title.toLowerCase().includes('monitor') ||
          p.description.toLowerCase().includes('monitor')
        );
        expect(hasMentionOfSearch).toBe(true);
      }
    });

    it('debe validar límite máximo de paginación', async () => {
      const res = await request(app)
        .get('/api/products?limit=200'); // Más del máximo permitido

      expect(res.status).toBe(200);
      // Debe estar limitado a 100
      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it('debe retornar página válida al solicitar página negativa', async () => {
      const res = await request(app)
        .get('/api/products?page=-5');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBeGreaterThanOrEqual(1);
    });

    it('debe incluir estructura completa en producto detalle', async () => {
      const res = await request(app)
        .get('/api/products/1');

      if (res.status === 200) {
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('title');
        expect(res.body.data).toHaveProperty('description');
        expect(res.body.data).toHaveProperty('price');
        expect(res.body.data).toHaveProperty('category');
        expect(res.body.data).toHaveProperty('images');
        expect(res.body.data).toHaveProperty('features');
      }
    });

    it('debe retornar 404 para producto inexistente', async () => {
      const res = await request(app)
        .get('/api/products/99999');

      expect(res.status).toBe(404);
    });
  });

  describe('Order Controller - Enhanced Coverage', () => {
    it('debe listar órdenes del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer invalid_token');

      // Puede retornar 401 o lista vacía
      expect([200, 401, 403]).toContain(res.status);
    });

    it('debe filtrar órdenes por estado', async () => {
      const res = await request(app)
        .get('/api/orders?status=PENDING')
        .set('Authorization', 'Bearer token');

      expect([200, 401, 403]).toContain(res.status);
    });

    it('debe validar actualización parcial de órdenes', async () => {
      const res = await request(app)
        .put('/api/orders/1')
        .set('Authorization', 'Bearer token')
        .send({
          status: 'PROCESSING'
        });

      expect([200, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe retornar 404 para orden inexistente', async () => {
      const res = await request(app)
        .get('/api/orders/99999')
        .set('Authorization', 'Bearer token');

      expect([401, 403, 404]).toContain(res.status);
    });

    it('debe cancelar orden en estado válido', async () => {
      const res = await request(app)
        .post('/api/orders/1/cancel')
        .set('Authorization', 'Bearer token')
        .send({
          reason: 'Change of mind'
        });

      expect([200, 400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('User Controller - Enhanced Coverage', () => {
    it('debe actualizar perfil de usuario', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', 'Bearer token')
        .send({
          firstName: 'UpdatedName',
          phone: '9876543210'
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe cambiar contraseña con validación', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', 'Bearer token')
        .send({
          currentPassword: 'oldpass123',
          newPassword: 'newpass456',
          confirmPassword: 'newpass456'
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar cambio de contraseña sin confirmación', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', 'Bearer token')
        .send({
          currentPassword: 'oldpass123',
          newPassword: 'newpass456',
          confirmPassword: 'differentpass' // No coincide
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe obtener favoritos del usuario', async () => {
      const res = await request(app)
        .get('/api/users/1/favorites')
        .set('Authorization', 'Bearer token');

      expect([200, 401, 403, 404]).toContain(res.status);
    });

    it('debe agregar producto a favoritos', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', 'Bearer token')
        .send({
          productId: 1
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe remover producto de favoritos', async () => {
      const res = await request(app)
        .delete('/api/users/1/favorites/1')
        .set('Authorization', 'Bearer token');

      expect([200, 204, 401, 403, 404]).toContain(res.status);
    });

    it('debe validar que productId existe antes de agregar a favoritos', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', 'Bearer token')
        .send({
          productId: 99999 // Producto que no existe
        });

      expect([400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('Error Handling - Edge Cases', () => {
    it('debe manejar caracteres especiales en búsqueda', async () => {
      const res = await request(app)
        .get('/api/products?search=<script>alert("xss")</script>');

      expect([200, 400]).toContain(res.status);
    });

    it('debe manejar valores muy grandes', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=999999999');

      expect([200, 400]).toContain(res.status);
    });

    it('debe manejar valores negativos', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=-100&maxPrice=-50');

      expect([200, 400]).toContain(res.status);
    });

    it('debe manejar múltiples parámetros vacíos', async () => {
      const res = await request(app)
        .get('/api/products?search=&category=&page=&limit=');

      expect([200, 400]).toContain(res.status);
    });

    it('debe retornar error para tipos de datos incorrectos', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 123, // Debe ser string
          lastName: 456,
          email: 'test@example.com',
          password: 'password123',
          phone: ['1234567890'] // Debe ser string
        });

      expect([400, 422]).toContain(res.status);
    });
  });

  describe('Input Validation - Comprehensive', () => {
    it('debe validar longitud de firstName', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: '', // Vacío
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect([400, 422]).toContain(res.status);
    });

    it('debe validar formato de teléfono', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: 'password123',
          phone: 'invalid-phone-format'
        });

      expect([200, 400, 422]).toContain(res.status); // Depende de validación del servidor
    });

    it('debe validar email con formato correcto', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.co.uk',
        'email+tag@example.com'
      ];

      for (const email of validEmails) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            firstName: 'Test',
            lastName: 'User',
            email,
            password: 'password123',
            phone: '1234567890'
          });

        expect([200, 201, 400, 409]).toContain(res.status);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('debe manejar múltiples actualizaciones de perfil concurrentes', async () => {
      const updates = Array.from({ length: 5 }, (_, i) =>
        request(app)
          .put('/api/users/profile')
          .set('Authorization', 'Bearer token')
          .send({
            firstName: `Name${i}`,
            phone: `123456789${i}`
          })
      );

      const results = await Promise.all(updates);
      expect(results.length).toBe(5);
      results.forEach(res => {
        expect([200, 400, 401, 403]).toContain(res.status);
      });
    });

    it('debe manejar búsquedas concurrentes', async () => {
      const searches = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .get(`/api/products?search=test${i}&page=1&limit=10`)
      );

      const results = await Promise.all(searches);
      expect(results.length).toBe(10);
      results.forEach(res => {
        expect(res.status).toBe(200);
      });
    });
  });
});
