import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin) ||
  /https?:\/\/.*(loca\.lt|trycloudflare\.com|vercel\.app|ngrok)/.test(origin);

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
