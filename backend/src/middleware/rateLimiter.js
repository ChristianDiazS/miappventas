import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Rate Limiter Global - Limita solicitudes por IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por ventana
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta más tarde',
  standardHeaders: true, // Retorna información en el header `RateLimit-*`
  legacyHeaders: false, // Desactiva el header `X-RateLimit-*`
  skip: (req) => {
    // No limitar en desarrollo
    return process.env.NODE_ENV === 'development';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Límite de solicitudes excedido. Intenta de nuevo en unos minutos.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Rate Limiter para Login - Límite más estricto
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login por ventana
  message: 'Demasiados intentos de login, por favor intenta más tarde',
  skipSuccessfulRequests: true, // No contar los intentos exitosos
  skipFailedRequests: false, // Contar todos los intentos fallidos
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de login. Cuenta bloqueada temporalmente.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Rate Limiter con Throttling exponencial - Para intentos de fuerza bruta
const delayStore = new Map();

export const bruteForceProtection = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!delayStore.has(ip)) {
    delayStore.set(ip, { attempts: 0, firstAttempt: now });
  }
  
  const record = delayStore.get(ip);
  
  // Reset si pasó más de 1 hora
  if (now - record.firstAttempt > 3600000) {
    record.attempts = 0;
    record.firstAttempt = now;
  }
  
  record.attempts++;
  
  // Calcular delay exponencial: 1s, 2s, 4s, 8s, 16s, etc
  const delay = Math.min(Math.pow(2, record.attempts - 1) * 1000, 60000); // máximo 60s
  
  if (record.attempts > 5) {
    // Bloquear después de 5 intentos fallidos
    setTimeout(() => {
      res.status(429).json({
        success: false,
        message: `Demasiados intentos fallidos. Intenta de nuevo en ${Math.ceil(delay / 1000)} segundos.`,
        retryAfter: Math.ceil(delay / 1000)
      });
    }, delay);
  } else {
    next();
  }
};

// Rate Limiter para API publica - Más permisivo
export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // 30 solicitudes por minuto
  message: 'Demasiadas solicitudes a la API',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate Limiter para crear productos - Evitar spam
export const createProductLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // máximo 50 productos por hora por usuario
  keyGenerator: (req) => {
    // Usar el ID del usuario como clave, o IP con soporte IPv6
    return req.user?.id || ipKeyGenerator(req);
  },
  skip: (req) => {
    // No limitar a SUPERADMIN
    return req.user?.role === 'SUPERADMIN';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Límite de creación de productos excedido. Intenta mañana.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

// Rate Limiter para órdenes - Evitar spam de órdenes
export const createOrderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, // máximo 100 órdenes por hora por usuario
  keyGenerator: (req) => {
    // Usar el ID del usuario como clave, o IP con soporte IPv6
    return req.user?.id || ipKeyGenerator(req);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Límite de órdenes excedido. Intenta más tarde.',
      retryAfter: req.rateLimit.resetTime
    });
  }
});

export default globalLimiter;
