import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Genera un token JWT firmado.
 * @param {object} payload 
 * @returns {string} 
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', {
    expiresIn: '8h',
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
    throw new Error('Token inválido o expirado');
  }
};
