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

  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT } = process.env;

  const dynamicUrl = `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${dbName}?schema=public`;

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
