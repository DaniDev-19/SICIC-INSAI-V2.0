import { getTenantPrismaFromRequest } from '../utils/dbConex.js';

/**
 * Middleware para inyectar automáticamente la instancia de Prisma 
 * del inquilino (tenant) en el objeto request.
 */
export const tenantMiddleware = (req, res, next) => {
    try {
        req.db = getTenantPrismaFromRequest(req);
        next();
    } catch (error) {
        next(error);
    }
};

export default tenantMiddleware;
