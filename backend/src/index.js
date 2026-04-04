import app from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
  🚀 Servidor SICIC-INSAI V2.0 en funcionamiento
  📡 Puerto: ${PORT}
  🌍 Modo: ${process.env.NODE_ENV || 'development'}
  `);
});
