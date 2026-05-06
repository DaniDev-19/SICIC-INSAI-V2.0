import { masterPrisma } from '../config/prisma.js';

/**
 * Middleware para manejar la idempotencia mediante el header X-Idempotency-Key.
 * Garantiza que una operación no se ejecute múltiples veces si se recibe la misma llave.
 */
export const idempotencyMiddleware = async (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  const key = req.headers['x-idempotency-key'];
  if (!key) {
    return next();
  }

  try {
    const existing = await masterPrisma.idempotency_keys.findUnique({
      where: { key_value: key }
    });

    if (existing) {
      return res.status(existing.response_status).json(existing.response_body);
    }

    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        masterPrisma.idempotency_keys.create({
          data: {
            key_value: key,
            response_status: res.statusCode,
            response_body: body,
            user_id: req.user?.id || null,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expira en 24h
          }
        }).catch(err => console.error('Error guardando idempotency key:', err));
      }

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    console.error('Idempotency Middleware Error:', error);
    next();
  }
};

export default idempotencyMiddleware;
