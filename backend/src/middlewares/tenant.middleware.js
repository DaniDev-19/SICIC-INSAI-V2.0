import { getTenantPrismaFromRequest } from '../utils/dbConex.js';
import { ensureAreasInspeccionColumn } from '../utils/tenant-schema.js';

const schemaSyncedTenants = new Set();

/**
 * Middleware para inyectar automáticamente la instancia de Prisma 
 * del inquilino (tenant) en el objeto request.
 */
export const tenantMiddleware = async (req, res, next) => {
    try {
        req.db = getTenantPrismaFromRequest(req);
        const dbName = req.user?.currentInstance?.db_name?.trim();
        if (dbName && !schemaSyncedTenants.has(dbName)) {
            await ensureAreasInspeccionColumn(req.db);
            schemaSyncedTenants.add(dbName);
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default tenantMiddleware;
