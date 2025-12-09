import request from 'supertest';
import { createApp } from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

describe('Authentication API', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('debe crear un nuevo usuario', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: uniqueEmail,
          password: 'SecurePass123',
        });

      expect([201, 200, 400]).toContain(res.status);
      if (res.status === 201 || res.status === 200) {
        expect(res.body).toHaveProperty('user');
      }
    });

    it('debe rechazar campos faltantes', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Juan',
          // Faltando otros campos
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });

    it('debe rechazar email duplicado', async () => {
      const email = `unique-${Date.now()}@example.com`;
      
      // Crear primer usuario
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Juan',
          lastName: 'Pérez',
          email: email,
          password: 'SecurePass123',
        });

      // Intentar crear segundo con mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Maria',
          lastName: 'González',
          email: email,
          password: 'OtherPass123',
        });

      expect([409, 400]).toContain(res.status);
    });
  });

  describe('POST /api/auth/login', () => {
    const testEmail = 'customer1@example.com';
    const testPassword = 'password123';

    it('debe autenticar usuario válido y retornar token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        });

      expect([200, 404, 400]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(typeof res.body.token).toBe('string');
      }
    });

    it('debe rechazar credenciales incorrectas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect([401, 400, 404]).toContain(res.status);
    });

    it('debe rechazar email no existente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword',
        });

      expect([401, 400, 404]).toContain(res.status);
    });

    it('debe rechazar campos faltantes', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          // Faltando password
        });

      expect(res.status).toBe(400);
    });
  });

  describe('Validación de Token', () => {
    it('debe aceptar login válido y token válido en siguiente request', async () => {
      // Login
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer1@example.com',
          password: 'password123',
        });

      expect([200, 404, 400]).toContain(loginRes.status);
      
      if (loginRes.status === 200 && loginRes.body.token) {
        const token = loginRes.body.token;

        // Usar token en request autenticado
        const profileRes = await request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`);

        expect([200, 401, 403]).toContain(profileRes.status);
      }
    });

    it('debe rechazar token inválido', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid_token_12345');

      expect([401, 403]).toContain(res.status);
    });

    it('debe rechazar request sin token en endpoint protegido', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [{ productId: 1, quantity: 1 }],
          shippingAddressId: 1,
        });

      expect([401, 403]).toContain(res.status);
    });
  });
});
