import { verifyToken } from '../utils/token.js';
import { masterPrisma } from '../config/prisma.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'No autorizado. Por favor inicia sesión.',
    });
  }

  try {
    const decoded = verifyToken(token);

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { id: decoded.id },
      select: { id: true, status: true, username: true, email: true },
    });

    if (!usuario || !usuario.status) {
      return res.status(401).json({
        status: 'error',
        message: 'El usuario ya no tiene acceso o no existe',
      });
    }

    req.user = decoded;

    next();
  } catch (_error) {
    return res.status(401).json({
      status: 'error',
      message: 'Token inválido o expirado',
    });
  }
};
