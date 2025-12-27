/**
 * HTTPS Configuration - Configuración para HTTPS en producción
 * 
 * En producción:
 * - Usar certificados SSL/TLS válidos (Let's Encrypt es gratuito)
 * - Configurar HSTS (HTTP Strict Transport Security)
 * - Redirigir HTTP a HTTPS automáticamente
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Crear servidor HTTPS con certificados
 * @param {Object} app - Express app
 * @returns {https.Server} Servidor HTTPS
 */
export function createHttpsServer(app) {
  // En producción, usar certificados válidos
  const certPath = process.env.SSL_CERT_PATH;
  const keyPath = process.env.SSL_KEY_PATH;
  
  if (!certPath || !keyPath) {
    console.warn('⚠️  Certificados SSL no configurados. Usando HTTP en desarrollo.');
    console.warn('   Para producción, configura SSL_CERT_PATH y SSL_KEY_PATH en .env');
    return null;
  }
  
  try {
    const cert = fs.readFileSync(certPath);
    const key = fs.readFileSync(keyPath);
    
    const options = {
      cert: cert,
      key: key,
      // Opciones de seguridad adicionales
      honorCipherOrder: true,
      secureOptions: require('constants').SSL_OP_NO_TLSv1 | require('constants').SSL_OP_NO_TLSv1_1,
      // Cipher suites seguros
      ciphers: [
        'ECDHE-ECDSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-ECDSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'DHE-RSA-AES128-GCM-SHA256',
        'DHE-RSA-AES256-GCM-SHA384'
      ].join(':')
    };
    
    const server = https.createServer(options, app);
    console.log('✅ Servidor HTTPS configurado correctamente');
    return server;
  } catch (error) {
    console.error('❌ Error cargando certificados SSL:', error.message);
    throw error;
  }
}

/**
 * Middleware para redirigir HTTP a HTTPS
 * Usar en producción
 */
export function redirectToHttps(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // Si ya es HTTPS, continuar
  if (req.protocol === 'https' || req.headers['x-forwarded-proto'] === 'https') {
    return next();
  }
  
  // Redirigir a HTTPS
  res.redirect(`https://${req.headers.host}${req.url}`);
}

/**
 * Configuración de seguridad para producción
 */
export function getProductionSecurityConfig() {
  return {
    // HSTS - Forzar HTTPS
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true
    },
    
    // Content Security Policy
    csp: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.stripe.com'],
        frameSrc: ["'self'", 'https://js.stripe.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    
    // Headers de referencia
    referrerPolicy: 'strict-origin-when-cross-origin',
    
    // Permisos del navegador
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
      payment: ['self']
    }
  };
}

/**
 * Validar configuración HTTPS
 */
export function validateHttpsConfig() {
  const nodeEnv = process.env.NODE_ENV;
  
  if (nodeEnv === 'production') {
    const required = ['SSL_CERT_PATH', 'SSL_KEY_PATH'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error('❌ CONFIGURACIÓN HTTPS INCOMPLETA EN PRODUCCIÓN:');
      missing.forEach(key => {
        console.error(`  - Falta: ${key}`);
      });
      console.error('\n   Instrucciones para generar certificados:');
      console.error('   1. Usar Let\'s Encrypt (gratuito): https://letsencrypt.org');
      console.error('   2. O generar certificado autofirmado (solo desarrollo):');
      console.error('      openssl req -nodes -new -x509 -keyout key.pem -out cert.pem -days 365');
      process.exit(1);
    }
  }
}

/**
 * Verificar que los certificados son válidos
 */
export function verifyCertificates(certPath, keyPath) {
  try {
    // Verificar que los archivos existen
    if (!fs.existsSync(certPath)) {
      throw new Error(`Certificado no encontrado: ${certPath}`);
    }
    if (!fs.existsSync(keyPath)) {
      throw new Error(`Clave privada no encontrada: ${keyPath}`);
    }
    
    // Leer y validar que sean archivos válidos
    const cert = fs.readFileSync(certPath, 'utf8');
    const key = fs.readFileSync(keyPath, 'utf8');
    
    if (!cert.includes('BEGIN CERTIFICATE') || !cert.includes('END CERTIFICATE')) {
      throw new Error('Certificado inválido');
    }
    if (!key.includes('BEGIN') || !key.includes('END')) {
      throw new Error('Clave privada inválida');
    }
    
    console.log('✅ Certificados validados correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error validando certificados:', error.message);
    return false;
  }
}

/**
 * Configuración completa para app.js
 */
export const httpsConfig = {
  createHttpsServer,
  redirectToHttps,
  getProductionSecurityConfig,
  validateHttpsConfig,
  verifyCertificates
};

export default httpsConfig;
