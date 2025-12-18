import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return next(new ApiError('Token no proporcionado', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError('Token inválido', 403));
  }
}

// Alias para compatibilidad
export function authenticate(req, res, next) {
  return authenticateToken(req, res, next);
}

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
}

export function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError('Usuario no autenticado', 401));
    }

    if (req.user.role !== requiredRole) {
      return next(new ApiError(`Se requiere rol ${requiredRole}`, 403));
    }

    next();
  };
}
