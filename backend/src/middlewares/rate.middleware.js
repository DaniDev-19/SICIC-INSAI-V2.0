import rateLimit from 'express-rate-limit';

/**
 * Limitador específico para operaciones de escritura (POST, PUT, PATCH, DELETE)
 * Evita el spam en rutas críticas que modifican la base de datos.
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // Límite de 50 solicitudes de escritura por IP
  message: {
    status: 'error',
    message: 'Has realizado demasiadas operaciones de escritura. Por favor, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Opcional: Podríamos personalizar el keyGenerator para usar req.user.id si está autenticado
  keyGenerator: (req) => {
    return req.user?.id ? `user_${req.user.id}` : req.ip;
  }
});

export default writeLimiter;
