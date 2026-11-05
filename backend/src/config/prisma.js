import { PrismaClient as OperativeClient } from '@prisma/client';
import { PrismaClient as MasterClient } from '@prisma/client/master/index.js';
import dotenv from 'dotenv';

dotenv.config();

export const masterPrisma = new MasterClient();

const tenantClients = {};

/**
 *
 * @param {string} dbName
 */
export const getTenantPrisma = (dbName) => {
  if (tenantClients[dbName]) {
    return tenantClients[dbName];
  }

  console.log("🔍 [DEBUG RENDER]: NODE_ENV =", process.env.NODE_ENV);
  console.log("🔍 [DEBUG RENDER]: USE_STATIC_DB =", process.env.USE_STATIC_DB);
  console.log("🔍 [DEBUG RENDER]: MASTER_DATABASE_URL =", process.env.MASTER_DATABASE_URL ? "CONFIGURADA (oculta)" : "NO DEFINIDA");
  console.log("🔍 [DEBUG RENDER]: DATABASE_URL actual =", process.env.DATABASE_URL ? "CONFIGURADA (oculta)" : "NO DEFINIDA");

  let dynamicUrl;

  const useStaticUrl = process.env.NODE_ENV === 'production' && String(process.env.USE_STATIC_DB).trim() === 'true';

  if (useStaticUrl) {
    const urlMap = {
      'db_insai_operativa': process.env.DATABASE_URL,
      'db_sicic_insai_master': process.env.MASTER_DATABASE_URL
    };

    dynamicUrl = urlMap[dbName];

    if (!dynamicUrl) {
      throw new Error(`[CRITICAL] No se encontró URL estánea configurada en el entorno para la base de datos: "${dbName}"`);
    }
  } else {
    const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;
    dynamicUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}?schema=public`;
  }

  const prisma = new OperativeClient({
    datasources: {
      db: {
        url: dynamicUrl,
      },
    },
  });

  tenantClients[dbName] = prisma;
  return prisma;
};

export default masterPrisma;
