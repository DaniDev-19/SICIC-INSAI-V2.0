import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);
    const isDevLocal = isDevelopment && origin && isLocalDevOrigin(origin);

    if ((!origin && isDevelopment) || isAllowedOrigin || isDevLocal) {
      callback(null, true);
    } else {
      callback(new Error('Acceso denegado por políticas de CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Idempotency-Key'],
  credentials: true,
  optionsSuccessStatus: 200,
};

export default cors(corsOptions);
