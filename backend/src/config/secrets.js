/**
 * Secrets Management - Gestión centralizada de secretos y variables de entorno
 * 
 * IMPORTANTE: En producción, usar:
 * - AWS Secrets Manager
 * - HashiCorp Vault
 * - Azure Key Vault
 * - Google Cloud Secret Manager
 * 
 * Este archivo es para desarrollo. No commit .env a git!
 */

// Validar que las variables de entorno críticas existan
const requiredSecrets = [
  'JWT_SECRET',
  'DATABASE_URL',
  'ENCRYPTION_SECRET',
  'STRIPE_SECRET_KEY',
  'CORS_ORIGIN'
];

function validateSecrets() {
  const missing = [];
  
  requiredSecrets.forEach(secret => {
    if (!process.env[secret]) {
      missing.push(secret);
    }
  });
  
  if (missing.length > 0) {
    console.error('⚠️  VARIABLES DE ENTORNO CRÍTICAS FALTANTES:');
    missing.forEach(secret => {
      console.error(`  - ${secret}`);
    });
    console.error('\n⚠️  Por favor, define estas variables en tu archivo .env');
    
    // En producción, fallar si faltan secretos
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Secretos disponibles
export const secrets = {
  // Auth
  jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '15m',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Encryption
  encryptionSecret: process.env.ENCRYPTION_SECRET || 'dev-encryption-key',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
  
  // Izipay - Procesamiento de Pagos
  izipayApiKey: process.env.IZIPAY_API_KEY,
  izipayMerchantId: process.env.IZIPAY_MERCHANT_ID,
  
  // Email
  emailProvider: process.env.EMAIL_PROVIDER || 'smtp',
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailHost: process.env.EMAIL_HOST,
  emailPort: parseInt(process.env.EMAIL_PORT || '587'),
  
  // App
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  appPort: parseInt(process.env.PORT || '3000'),
  
  // 2FA
  twoFAWindow: parseInt(process.env.TWO_FA_WINDOW || '2'),
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  loginRateLimitMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || '5'),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'session-secret-change-in-production'
};

/**
 * Obtener secreto de forma segura
 * Valida que existe y lanza error si no
 */
export function getSecret(key) {
  if (!(key in secrets)) {
    throw new Error(`Secreto desconocido: ${key}`);
  }
  
  const value = secrets[key];
  if (value === undefined || value === null) {
    console.warn(`⚠️  Secreto no configurado: ${key}`);
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Secreto crítico no configurado: ${key}`);
    }
  }
  
  return value;
}

/**
 * Validar que la contraseña cumple con requisitos mínimos
 */
export function validatePasswordStrength(password) {
  const minLength = 12;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};:'",.<>?]/.test(password);
  
  const isValid = password.length >= minLength &&
                  hasUppercase &&
                  hasLowercase &&
                  hasNumbers &&
                  hasSpecialChar;
  
  return {
    isValid,
    requirements: {
      minLength: { met: password.length >= minLength, message: `Mínimo ${minLength} caracteres` },
      hasUppercase: { met: hasUppercase, message: 'Al menos una mayúscula' },
      hasLowercase: { met: hasLowercase, message: 'Al menos una minúscula' },
      hasNumbers: { met: hasNumbers, message: 'Al menos un número' },
      hasSpecialChar: { met: hasSpecialChar, message: 'Al menos un carácter especial' }
    }
  };
}

/**
 * Rotar secretos (para implementar rotación periódica)
 * En producción, usar el servicio de secrets de tu cloud provider
 */
export function rotateSecret(secretKey, newValue) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️  Rotación de secretos solo soportada en producción`);
    return false;
  }
  
  // Aquí iría la lógica de rotación con AWS/Azure/GCP
  console.log(`🔄 Rotando secreto: ${secretKey}`);
  
  // TODO: Implementar rotación con servicio de cloud
  return true;
}

/**
 * Auditar acceso a secretos (logging de seguridad)
 */
export function auditSecretAccess(secretKey, userId, action = 'read') {
  console.log(`[AUDIT] Acceso a secreto: ${secretKey} por usuario ${userId} - acción: ${action}`);
  
  // TODO: Enviar a sistema de auditoría centralizado
}

// Validar secretos al iniciar la aplicación
if (process.env.NODE_ENV !== 'test') {
  validateSecrets();
}

export default secrets;
