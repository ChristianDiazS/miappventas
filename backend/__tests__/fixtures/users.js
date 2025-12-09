// Fixtures para tests de usuarios (Prisma)
export const mockUser = {
  id: 1,
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@ejemplo.com',
  passwordHash: 'hashed_password_123',
  phone: '987654321',
  role: 'CUSTOMER',
  active: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockAdminUser = {
  id: 2,
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@ejemplo.com',
  passwordHash: 'hashed_password_456',
  phone: '987654322',
  role: 'ADMIN',
  active: true,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

export const mockNewUser = {
  firstName: 'Carlos',
  lastName: 'López',
  email: 'carlos@ejemplo.com',
  password: 'Password123!',
  phone: '987654323',
};

export const mockUserUpdate = {
  firstName: 'Juan',
  lastName: 'Pérez Actualizado',
  phone: '987654324',
};

export const mockInvalidUser = {
  firstName: '',
  email: 'invalid-email',
  password: '123',
};
