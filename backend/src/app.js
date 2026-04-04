import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors'; // Manejo automático de errores asíncronos

import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middlewares/error.handler.js';

const app = express();

// Middlewares de Seguridad y Utilidad
app.use(helmet()); // Seguridad de cabeceras HTTP
app.use(cors()); // Permitir peticiones desde otros dominios (frontend)
app.use(morgan('dev')); // Registro de peticiones en consola
app.use(express.json()); // Parsear JSON en el cuerpo de las peticiones

// Rutas de la API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Servidor SICIC-INSAI online' });
});

// Registrar módulos
app.use('/api/auth', authRoutes);

// Manejador de errores global (Debe ir al final)
app.use(errorHandler);

export default app;
