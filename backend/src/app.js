import express from 'express';
import helmet from 'helmet';
import corsConfig from './config/cors.js';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes.js';
import roleRoutes from './routes/role.routes.js';

import bitacoraRoutes from './routes/bitacora.routes.js';
import cargoRoutes from './routes/cargo.routes.js';
import profesionRoutes from './routes/profesion.routes.js';
import tPropiedadesRouter from './routes/t_propiedades.routes.js'
import tCultivoRouter from './routes/t_cultivo.routes.js';
import tAnimalesRouter from './routes/t_animales.routes.js';
import cInsumosRouter from './routes/c_insumo.routes.js';
import tPlagasRouter from './routes/t_plagas.routes.js';
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
app.use('/api/bitacora', bitacoraRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/profesion', profesionRoutes);
app.use('/api/t_propiedad', tPropiedadesRouter);
app.use('./api/t_cultivo', tCultivoRouter);
app.use('(/api/t_animales', tAnimalesRouter);
app.use('/api/c_insumos', cInsumosRouter);
app.use('/api/t_plaga', tPlagasRouter);
app.use(errorHandler);


export default app;
