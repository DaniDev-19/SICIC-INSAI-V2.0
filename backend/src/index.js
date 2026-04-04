import app from './app.js';
import dotenv from 'dotenv';
import { masterPrisma, getTenantPrisma } from './config/prisma.js';

dotenv.config();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`
     Servidor SICIC-INSAI V2.0 en funcionamiento
     Puerto: ${PORT}
     Modo: ${process.env.NODE_ENV || 'development'}
  `);

  masterPrisma.$connect()
    .then(async () => {
      console.log('Base de Datos Master: CONECTADA');

      try {
        const instancias = await masterPrisma.instancias.findMany({
          where: { status: true },
        });

        if (instancias.length === 0) {
          console.log('Instancias Operativas: SIN DATOS (No hay instancias registradas)');
          return;
        }

        console.log(`Escaneando ${instancias.length} instancias operativas...`);

        for (const inst of instancias) {
          try {
            const tenantPrisma = getTenantPrisma(inst.db_name.trim());
            await tenantPrisma.$connect();
            console.table(`[OK] ENHORABUENA -> ${inst.nombre_mostrable} (${inst.db_name})`);
          } catch (tenantError) {
            console.error(`[FALLO] ALERTA  -> ${inst.nombre_mostrable} (${inst.db_name}) - Error: ${tenantError.message}`);
          }
        }
      } catch (dbError) {
        console.error('Error al intentar leer las instancias desde Master:', dbError.message);
      }
    })
    .catch((error) => {
      console.error('\n  ALERTA: No hay conexión con la Base de Datos Master.');
      console.error('Detalle:', error.message);
      console.log('(El chequeo de operativas no pudo realizarse sin Master)\n');
    });
});
