import express from 'express';
import helmet from 'helmet';
import corsConfig from './config/cors.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';
import { errorHandler } from './middlewares/error.handler.js';

const app = express();

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    message: 'Demasiados intentos. Por favor, espere un minuto.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(corsConfig);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor SICIC-INSAI online' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/roles', roleRoutes);

app.use(errorHandler);

export default app;
