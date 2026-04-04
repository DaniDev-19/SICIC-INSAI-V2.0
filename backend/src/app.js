import express from 'express';
import helmet from 'helmet';
import corsConfig from './config/cors.js';
import morgan from 'morgan';

import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.handler.js';

const app = express();

app.use(helmet());
app.use(corsConfig);
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor SICIC-INSAI online' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
