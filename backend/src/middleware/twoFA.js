import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generar secreto 2FA para un usuario
 * @param {string} email - Email del usuario
 * @returns {Object} { secret, qrCode }
 */
export async function generateTwoFASecret(email) {
  try {
    // Generar secreto aleatorio
    const secret = speakeasy.generateSecret({
      name: `MiAppVentas (${email})`,
      issuer: 'MiAppVentas',
      length: 32 // 32 caracteres para mayor seguridad
    });

    // Generar código QR
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode: qrCode,
      manualEntryKey: secret.base32, // Para ingreso manual en Google Authenticator
      backupCodes: generateBackupCodes() // Códigos de respaldo
    };
  } catch (error) {
    console.error('Error generando 2FA secret:', error);
    throw error;
  }
}

/**
 * Verificar token 2FA
 * @param {string} secret - Secreto almacenado del usuario
 * @param {string} token - Token ingresado por el usuario
 * @returns {boolean} True si el token es válido
 */
export function verifyTwoFAToken(secret, token) {
  try {
    // Permitir un token previo, actual y siguiente (ventana de 30 segundos)
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2 // Permite 2 pasos (30 segundos cada uno)
    });
  } catch (error) {
    console.error('Error verificando token 2FA:', error);
    return false;
  }
}

/**
 * Verificar código de respaldo
 * @param {string} backupCode - Código de respaldo ingresado
 * @param {Array} usedBackupCodes - Códigos ya utilizados
 * @returns {Object} { valid, code }
 */
export function verifyBackupCode(backupCode, usedBackupCodes = []) {
  try {
    // Asegurar que el código tenga el formato correcto
    const code = String(backupCode).replace(/\s/g, '').toUpperCase();
    
    // Verificar si ya fue usado
    if (usedBackupCodes.includes(code)) {
      return { valid: false, code: null, message: 'Este código de respaldo ya fue utilizado' };
    }
    
    // Formato válido: 6 caracteres alfanuméricos
    if (!/^[A-Z0-9]{6}$/.test(code)) {
      return { valid: false, code: null, message: 'Formato de código inválido' };
    }
    
    return { valid: true, code: code };
  } catch (error) {
    console.error('Error verificando código de respaldo:', error);
    return { valid: false, code: null };
  }
}

/**
 * Generar códigos de respaldo
 * Usuario puede usar estos códigos si pierde acceso al Google Authenticator
 * @returns {Array} Array de 10 códigos de respaldo
 */
export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = generateRandomCode(6);
    codes.push(code);
  }
  return codes;
}

/**
 * Generar código aleatorio
 * @param {number} length - Longitud del código
 * @returns {string} Código aleatorio
 */
function generateRandomCode(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Formatear códigos de respaldo para mostrar al usuario
 * @param {Array} codes - Array de códigos
 * @returns {string} Códigos formateados
 */
export function formatBackupCodes(codes) {
  return codes.map((code, index) => {
    return `${index + 1}. ${code}`;
  }).join('\n');
}

/**
 * Middleware para verificar 2FA en login
 */
export function require2FA(req, res, next) {
  // Verificar si el usuario tiene 2FA habilitado
  const user = req.user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Usuario no autenticado'
    });
  }
  
  // Si el usuario tiene 2FA pero no ha sido verificado en esta sesión
  if (user.twoFAEnabled && !req.session?.twoFAVerified) {
    return res.status(403).json({
      success: false,
      message: 'Se requiere verificación de 2FA',
      requiresTwoFA: true
    });
  }
  
  next();
}

/**
 * Generar QR temporal para mostrar durante setup
 */
export async function generateQRForSetup(email, secret) {
  try {
    const secretObject = {
      name: `MiAppVentas (${email})`,
      issuer: 'MiAppVentas'
    };
    
    // Crear otpauth URL manualmente si no lo tenemos
    const otpauth_url = `otpauth://totp/MiAppVentas%20(${encodeURIComponent(email)})?secret=${secret}&issuer=MiAppVentas`;
    
    const qrCode = await QRCode.toDataURL(otpauth_url);
    return qrCode;
  } catch (error) {
    console.error('Error generando QR para setup:', error);
    throw error;
  }
}

export default {
  generateTwoFASecret,
  verifyTwoFAToken,
  verifyBackupCode,
  generateBackupCodes,
  formatBackupCodes,
  require2FA,
  generateQRForSetup
};
