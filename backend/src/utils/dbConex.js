import { getTenantPrisma } from "../config/prisma";

export const getTenantPrismaFromRequest = (req) => {
    const dbName = req.user?.currentInstance?.db_name;
    if (!dbName) {
        throw new Error('No se seleccionó una instancia operativa en la sesión');
    }
    return getTenantPrisma(dbName.trim());
};

export default getTenantPrismaFromRequest;