import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const ISSUER = 'SICIC-INSAI';

// Instancia TOTP con plugins crypto/base32 compatibles con Node.js (ESM)
// La API de otplib v13 requiere que se pasen los plugins explícitamente
const totp = new TOTP({
  crypto: new NobleCryptoPlugin(),
  base32: new ScureBase32Plugin(),
  epochTolerance: 1, // 1 ventana de tolerancia (~30s) para desfases de reloj
});

/**
 * Genera un secreto TOTP, la URL otpauth y la imagen QR en formato Base64 Data URL.
 * @param {string} username - Nombre del usuario para la etiqueta en la app autenticadora
 * @returns {Promise<{ secret: string, otpauthUrl: string, qrCodeUrl: string }>}
 */
export const generateMfaSecret = async (username) => {
  const secret = totp.generateSecret();
  const otpauthUrl = totp.toURI({
    secret,
    label: encodeURIComponent(username),
    issuer: ISSUER,
  });

  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl, {
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff',
    },
    width: 256,
  });

  return { secret, otpauthUrl, qrCodeUrl };
};

/**
 * Verifica un código TOTP de 6 dígitos ingresado por el usuario contra su secreto.
 * @param {string} token - Código de 6 dígitos ingresado por el usuario
 * @param {string} secret - Secreto TOTP guardado para el usuario
 * @returns {Promise<boolean>}
 */
export const verifyMfaToken = async (token, secret) => {
  if (!token || !secret) return false;
  try {
    const cleanToken = String(token).replace(/\s+/g, '');
    // En otplib v13, verify(token, options) retorna { valid, delta, ... } o null
    const result = await totp.verify(cleanToken, { secret });
    return !!(result?.valid);
  } catch (error) {
    console.error('Error al verificar token MFA:', error.message);
    return false;
  }
};

/**
 * Genera una lista de códigos de respaldo únicos para emergencias.
 * @param {number} count - Cantidad de códigos a generar (por defecto 8)
 * @returns {string[]} Lista de códigos alfanuméricos de 8 caracteres en formato XXXX-XXXX
 */
export const generateBackupCodes = (count = 8) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
};
