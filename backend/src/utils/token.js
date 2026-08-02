import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Genera un token JWT firmado.
 * @param {object} payload
 * @returns {string}
 */
export const generateToken = (payload) => {

  if (!process.env.JWT_SECRET) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }

  const expireTime = process.env.JWT_EXPIRED ? (isNaN(process.env.JWT_EXPIRED) ? process.env.JWT_EXPIRED : parseInt(process.env.JWT_EXPIRED)) : '15m';

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expireTime,
  });
};

/**
 * Verifica la validez de un token JWT.
 * @param {string} token
 * @returns {object}
 * @throws {Error}
 */

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
  } catch (error) {
    throw new Error('Token inválido o expirado', error);
  }
};
