import { prisma } from '../lib/prisma.js';
import { ApiError } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';
import { hashPassword, comparePassword } from '../utils/password.js';

export async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, phone } = req.body;
    
    // Validación básica
    if (!firstName || !lastName || !email || !password || !phone) {
      return next(new ApiError('Todos los campos son requeridos', 400));
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return next(new ApiError('El email ya está registrado', 400));
    }
    
    // Hash de la contraseña
    const passwordHash = await hashPassword(password);
    
    // Crear nuevo usuario
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
        phone,
        role: 'CUSTOMER'
      }
    });
    
    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      },
      token
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return next(new ApiError('El email ya existe', 400));
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return next(new ApiError('Email y contraseña requeridos', 400));
    }
    
    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return next(new ApiError('Usuario no encontrado', 404));
    }
    
    // Verificar contraseña
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return next(new ApiError('Contraseña incorrecta', 401));
    }
    
    // Generar token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user) {
      return next(new ApiError('Usuario no encontrado', 404));
    }
    
    // No devolver el hash de la contraseña
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

