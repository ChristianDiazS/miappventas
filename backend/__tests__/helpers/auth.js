// Helper para JWT y autenticación en tests
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

export const generateTestToken = (userId, role = 'customer') => {
  return jwt.sign(
    {
      id: userId,
      email: `user${userId}@test.com`,
      role: role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const generateAdminToken = (userId) => {
  return generateTestToken(userId, 'admin');
};

export const generateExpiredToken = () => {
  return jwt.sign(
    {
      id: '507f1f77bcf86cd799439011',
      email: 'expired@test.com',
      role: 'customer',
    },
    JWT_SECRET,
    { expiresIn: '-1h' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getAuthHeader = (token) => {
  return { Authorization: `Bearer ${token}` };
};

export const mockAuthMiddleware = (userId, role = 'customer') => {
  return (req, res, next) => {
    req.user = {
      id: userId,
      email: `user${userId}@test.com`,
      role: role,
    };
    next();
  };
};
