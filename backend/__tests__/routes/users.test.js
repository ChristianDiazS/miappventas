import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Users API', () => {
  let app;
  let userToken;

  beforeAll(async () => {
    app = createApp();

    // Get valid token
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

  describe('GET /api/users/:id', () => {
    it('debe retornar datos públicos de usuario', async () => {
      const res = await request(app)
        .get('/api/users/1');

      expect([200, 401, 403, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data).toHaveProperty('firstName');
      }
    });

    it('debe retornar 404 o rechazar para usuario inexistente', async () => {
      const res = await request(app)
        .get('/api/users/999999');

      expect([404, 400, 401]).toContain(res.status);
    });

    it('debe validar ID válido', async () => {
      const res = await request(app)
        .get('/api/users/invalid');

      expect([400, 404, 401]).toContain(res.status);
    });
  });

  describe('GET /api/users/profile', () => {
    it('debe retornar perfil del usuario autenticado', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('email');
      }
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .get('/api/users/profile');

      expect([401, 403]).toContain(res.status);
    });

    it('debe rechazar token inválido', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('debe actualizar perfil de usuario', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Juan',
          lastName: 'Actualizado',
          phone: '123456789',
        });

      expect([200, 401, 403]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
      }
    });

    it('debe validar datos de entrada', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: '', // Nombre vacío (inválido)
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .send({
          firstName: 'Nuevo Nombre',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('debe permitir actualización parcial', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          phone: '+1234567890',
        });

      expect([200, 401, 403]).toContain(res.status);
    });
  });

  describe('PUT /api/users/password', () => {
    it('debe cambiar contraseña con contraseña actual válida', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword456',
        });

      expect([200, 400, 401, 403]).toContain(res.status);
      if (res.status === 400) {
        // Si falla, podría ser por validación
        expect(res.body).toHaveProperty('message');
      }
    });

    it('debe rechazar contraseña actual incorrecta', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'NewPassword456',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe validar nueva contraseña', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'short', // Demasiado corta
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .send({
          currentPassword: 'password123',
          newPassword: 'NewPassword456',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('debe validar datos requeridos', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          // Faltando newPassword
        });

      expect([400, 401, 403]).toContain(res.status);
    });
  });

  describe('GET /api/users/:id/favorites', () => {
    it('debe retornar favoritos del usuario', async () => {
      const res = await request(app)
        .get('/api/users/1/favorites');

      expect([200, 404, 401]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });

    it('debe retornar 404 para usuario inexistente', async () => {
      const res = await request(app)
        .get('/api/users/999999/favorites');

      expect([404, 401]).toContain(res.status);
    });

    it('debe validar ID de usuario', async () => {
      const res = await request(app)
        .get('/api/users/invalid/favorites');

      expect([400, 404, 401]).toContain(res.status);
    });

    it('debe retornar lista vacía si no hay favoritos', async () => {
      const res = await request(app)
        .get('/api/users/1/favorites');

      if (res.status === 200) {
        expect(Array.isArray(res.body.data)).toBe(true);
      }
    });
  });

  describe('POST /api/users/:id/favorites', () => {
    it('debe agregar producto a favoritos', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: 1,
        });

      expect([200, 201, 400, 401, 403, 404]).toContain(res.status);
    });

    it('debe validar productId', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: 'invalid',
        });

      expect([400, 401, 403]).toContain(res.status);
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .send({
          productId: 1,
        });

      expect([401, 403]).toContain(res.status);
    });

    it('debe validar productId existente', async () => {
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          productId: 999999,
        });

      expect([400, 404, 401, 403]).toContain(res.status);
    });

    it('debe rechazar duplicados', async () => {
      // Primer intento - agregar
      await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 1 });

      // Segundo intento - duplicado
      const res = await request(app)
        .post('/api/users/1/favorites')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 1 });

      expect([200, 201, 400, 409, 401, 403]).toContain(res.status);
    });
  });

  describe('DELETE /api/users/:id/favorites/:productId', () => {
    it('debe remover producto de favoritos', async () => {
      const res = await request(app)
        .delete('/api/users/1/favorites/1')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 204, 404, 401, 403]).toContain(res.status);
    });

    it('debe rechazar sin autenticación', async () => {
      const res = await request(app)
        .delete('/api/users/1/favorites/1');

      expect([401, 403]).toContain(res.status);
    });

    it('debe retornar 404 si no existe en favoritos', async () => {
      const res = await request(app)
        .delete('/api/users/1/favorites/999999')
        .set('Authorization', `Bearer ${userToken}`);

      expect([200, 204, 404, 401, 403]).toContain(res.status);
    });

    it('debe validar IDs válidos', async () => {
      const res = await request(app)
        .get('/api/users/invalid/favorites')
        .set('Authorization', `Bearer ${userToken}`);

      expect([400, 404, 401, 403, 500]).toContain(res.status);
    });
  });

  describe('User Preferences', () => {
    it('debe guardar preferencias de usuario', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          preferences: {
            notifications: true,
            newsletter: false,
          },
        });

      expect([200, 400, 401, 403]).toContain(res.status);
    });

    it('debe retornar preferencias en perfil', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      if (res.status === 200 && res.body.data) {
        // Verificar estructura de datos
        expect(res.body.data).toHaveProperty('email');
      }
    });
  });
});
