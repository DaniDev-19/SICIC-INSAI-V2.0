import { masterPrisma } from '../config/prisma.js';

/**
 * Middleware para manejar la idempotencia mediante el header X-Idempotency-Key.
 * Garantiza que una operación no se ejecute múltiples veces si se recibe la misma llave.
 */
export const idempotencyMiddleware = async (req, res, next) => {
  // Solo aplicamos a métodos que no son GET
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  const key = req.headers['x-idempotency-key'];
  if (!key) {
    return next();
  }

  try {
    // 1. Buscar si la llave ya existe
    const existing = await masterPrisma.idempotency_keys.findUnique({
      where: { key_value: key }
    });

    if (existing) {
      // Si la llave ya existe, devolvemos la respuesta guardada
      return res.status(existing.response_status).json(existing.response_body);
    }

    // 2. Si no existe, interceptamos la respuesta original para guardarla
    const originalJson = res.json;
    res.json = function (body) {
      // Solo guardamos respuestas exitosas o errores del cliente que queramos cachear (opcional)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Guardar de forma asíncrona para no bloquear la respuesta
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
