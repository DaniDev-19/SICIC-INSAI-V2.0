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
import tPropiedadRouter from './routes/t_propiedad.routes.js'
import tCultivoRouter from './routes/t_cultivo.routes.js';
import tAnimalesRouter from './routes/t_animales.routes.js';
import cInsumosRouter from './routes/c_insumos.routes.js';
import tPlagasRouter from './routes/t_plagas.routes.js';
import tEnfermedadesRouter from './routes/t_enfermedades.routes.js';
import tEventoRouter from './routes/t_evento.routes.js';
import tSolicitudRouter from './routes/t_solicitud.routes.js';
import tProgramaRouter from './routes/t_programa.routes.js';
import finalidadRouter from './routes/finalidad.routes.js';
import tUnidadesRouter from './routes/t_unidades.routes.js';
import oficinasRouter from './routes/oficinas.routes.js';
import departamentoRouter from './routes/departamento.routes.js';
import contratoRouter from './routes/contrato.routes.js';
import estadoRouter from './routes/estado.routes.js';
import municipioRouter from './routes/municipio.routes.js';
import parroquiaRouter from './routes/parroquia.routes.js';
import sectorRouter from './routes/sector.routes.js';
import cultivoRouter from './routes/cultivo.routes.js';
import animalRouter from './routes/animal.routes.js';
import plagaRouter from './routes/plaga.routes.js';
import enfermedadRouter from './routes/enfermedad.routes.js';
import insumosRouter from './routes/insumos.routes.js';
import programasRouter from './routes/programas.routes.js';
import vehiculosRouter from './routes/vehiculos.routes.js';
import caracStatalRouter from './routes/carac_statal.routes.js';
import empleadosRouter from './routes/empleados.routes.js';
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
app.use('/api/t_propiedad', tPropiedadRouter);
app.use('/api/t_cultivo', tCultivoRouter);
app.use('/api/t_animales', tAnimalesRouter);
app.use('/api/c_insumos', cInsumosRouter);
app.use('/api/t_plaga', tPlagasRouter);
app.use('/api/t_enfermedad', tEnfermedadesRouter);
app.use('/api/t_evento', tEventoRouter);
app.use('/api/t_solicitud', tSolicitudRouter);
app.use('/api/t_programa', tProgramaRouter);
app.use('/api/finalidades', finalidadRouter);
app.use('/api/t_unidades', tUnidadesRouter);
app.use('/api/oficinas', oficinasRouter);
app.use('/api/departamentos', departamentoRouter);
app.use('/api/contratos', contratoRouter);
app.use('/api/estados', estadoRouter);
app.use('/api/municipios', municipioRouter);
app.use('/api/parroquias', parroquiaRouter);
app.use('/api/sectores', sectorRouter);
app.use('/api/cultivos', cultivoRouter);
app.use('/api/animales', animalRouter);
app.use('/api/plagas', plagaRouter);
app.use('/api/enfermedades', enfermedadRouter);
app.use('/api/insumos', insumosRouter);
app.use('/api/programas', programasRouter);
app.use('/api/vehiculos', vehiculosRouter);
app.use('/api/carac_statal', caracStatalRouter);
app.use('/api/empleados', empleadosRouter);
app.use(errorHandler);

export default app;
