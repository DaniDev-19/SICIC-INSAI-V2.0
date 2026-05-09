import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    status: 'error',
    message: 'Has realizado demasiadas operaciones de escritura. Por favor, espera 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.user?.id ? `user_${req.user.id}` : ipKeyGenerator(req);
  },
});

export default writeLimiter;
