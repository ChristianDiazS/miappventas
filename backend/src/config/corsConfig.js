/**
 * Configuración CORS restrictiva para producción
 * 
 * CORS (Cross-Origin Resource Sharing) permite solicitudes desde otros dominios
 * Restringirlo solo a dominios confiables previene ataques de terceros
 */

const allowedOrigins = [
  'http://localhost:5173',      // Desarrollo local
  'http://localhost:3000',      // Desarrollo local (puerto alternativo)
  'http://127.0.0.1:5173',      // Localhost
  process.env.CORS_ORIGIN,      // Configurado en .env
  process.env.FRONTEND_URL,     // URL de producción del frontend
].filter(Boolean); // Remover undefined/null

/**
 * Configuración CORS para Express
 * Retorna objeto con opciones seguras
 */
export function getCORSOptions() {
  return {
    // Dominios permitidos
    origin: function(origin, callback) {
      // Permitir sin origin (mobile apps, curl, postman en desarrollo)
      if (!origin) {
        if (process.env.NODE_ENV === 'production') {
          return callback(new Error('CORS - Origin requerido en producción'));
        }
        return callback(null, true);
      }
      
      // Verificar si el origen está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ CORS bloqueado: ${origin}`);
        callback(new Error(`CORS error: ${origin} no está autorizado`));
      }
    },
    
    // Métodos HTTP permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
    // Headers permitidos
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-API-Key',
      'Accept',
      'Origin'
    ],
    
    // Headers que el navegador puede acceder desde la respuesta
    exposedHeaders: [
      'X-Total-Count',      // Para paginación
      'X-Total-Pages',
      'X-Current-Page',
      'RateLimit-Limit',
      'RateLimit-Remaining',
      'RateLimit-Reset'
    ],
    
    // Permite enviar cookies y credenciales
    credentials: true,
    
    // Cache de CORS preflight por 24 horas
    maxAge: 86400,
    
    // Permitir solicitudes simples sin preflight
    optionsSuccessStatus: 200
  };
}

/**
 * Headers de seguridad adicionales (HSTS, CSP, etc)
 */
export function getSecurityHeaders() {
  return {
    // HSTS - Forzar HTTPS (máximo 1 año)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // CSP - Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'"
    ].join('; '),
    
    // X-Content-Type-Options - Prevenir MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // X-Frame-Options - Prevenir clickjacking
    'X-Frame-Options': 'DENY',
    
    // X-XSS-Protection - Protección contra XSS (navegadores antiguos)
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer-Policy - Controlar información de referrer
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions-Policy - Controlar características del navegador
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
    
    // No guardar en caché (para login/logout)
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
}

/**
 * Configuración de CORS por ruta (ejemplo)
 */
export const corsConfig = {
  // Rutas públicas - CORS permitido
  public: {
    '/api/auth/login': getCORSOptions(),
    '/api/auth/register': getCORSOptions(),
    '/api/products': { ...getCORSOptions(), methods: ['GET', 'OPTIONS'] }
  },
  
  // Rutas protegidas - CORS restringido
  protected: {
    '/api/superadmin': { ...getCORSOptions(), credentials: true },
    '/api/users': { ...getCORSOptions(), credentials: true },
    '/api/orders': { ...getCORSOptions(), credentials: true },
    '/api/payments': { ...getCORSOptions(), credentials: true }
  }
};

export default {
  getCORSOptions,
  getSecurityHeaders,
  corsConfig
};
