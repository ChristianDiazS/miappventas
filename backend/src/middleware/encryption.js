import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'fallback-secret-key-change-in-production';

/**
 * Encriptar datos sensibles (números de tarjeta, SSN, etc)
 * @param {string} data - Datos a encriptar
 * @returns {string} Datos encriptados en base64
 */
export function encryptSensitiveData(data) {
  if (!data) return null;
  try {
    return CryptoJS.AES.encrypt(String(data), ENCRYPTION_SECRET).toString();
  } catch (error) {
    console.error('Error al encriptar datos:', error.message);
    return null;
  }
}

/**
 * Desencriptar datos sensibles
 * @param {string} encryptedData - Datos encriptados
 * @returns {string} Datos desencriptados
 */
export function decryptSensitiveData(encryptedData) {
  if (!encryptedData) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error al desencriptar datos:', error.message);
    return null;
  }
}

/**
 * Enmascarar número de tarjeta
 * Ejemplo: 4532 1234 5678 9010 → 4532 **** **** 9010
 */
export function maskCardNumber(cardNumber) {
  if (!cardNumber) return null;
  const cleaned = String(cardNumber).replace(/\D/g, '');
  if (cleaned.length < 12) return null;
  
  const first4 = cleaned.slice(0, 4);
  const last4 = cleaned.slice(-4);
  return `${first4} **** **** ${last4}`;
}

/**
 * Enmascarar email
 * Ejemplo: usuario@example.com → u****@example.com
 */
export function maskEmail(email) {
  if (!email) return null;
  const [local, domain] = email.split('@');
  if (!domain) return null;
  
  const masked = local.charAt(0) + '*'.repeat(local.length - 2) + local.charAt(local.length - 1);
  return `${masked}@${domain}`;
}

/**
 * Enmascarar nombre
 * Ejemplo: Juan Pérez → J**** P****
 */
export function maskName(name) {
  if (!name) return null;
  const parts = name.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
  }).join(' ');
}

/**
 * Enmascarar número de teléfono
 * Ejemplo: +1234567890 → +123 *** ****
 */
export function maskPhone(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length < 10) return null;
  
  const prefix = cleaned.slice(0, 3);
  const middle = '*'.repeat(3);
  const suffix = cleaned.slice(-4);
  return `+${prefix} ${middle} ${suffix}`;
}

/**
 * Generar hash de datos (para verificación sin almacenar)
 * @param {string} data - Datos a hashear
 * @returns {string} Hash SHA-256
 */
export function hashData(data) {
  if (!data) return null;
  return CryptoJS.SHA256(String(data)).toString();
}

export default {
  encryptSensitiveData,
  decryptSensitiveData,
  maskCardNumber,
  maskEmail,
  maskName,
  maskPhone,
  hashData
};
