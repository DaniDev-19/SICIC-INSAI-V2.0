import { getTenantPrisma } from '../config/prisma.js';

const getTenantPrismaFromRequest = (req) => {
    const dbName = req.user?.currentInstance?.db_name;
    if(!dbName) {
        throw new Error('No se seleccionó una instancia operativa en la sesión');
    }
    return getTenantPrisma(dbName.trim());
};

export const getProfesion = async (req, res) => {
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [profesion, totalCount] = await Promise.all([
        tenantPrisma.profesion.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.profesion.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: profesion,
        pagination: {
            totalCount,
            totalPagges: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }
    });
};

export const getProfesionById = async (req, res) => {
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const { id } = req.params;

    const profesion = await tenantPrisma.profesion.findUnique({
        where: { id: Number(id) },
    });

    if (!profesion) {
        return res.status(404).json({
            status: 'error',
            Message: 'Profesion no encontrada',
        });

    }
        res.status(200).json({
            status: 'success',
            data: profesion,
        });
};

export const createProfesion = async (req, res) =>  {
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const { nombre } = req.body;

    const existingProfesion = await tenantPrisma.profesion.findUnique({
        where: { nombre },
    });

    if(existingProfesion) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una profesión con este nombre',
        });
    }

    const profesion = await tenantPrisma.profesion.create({

        data: { nombre },
    });

    res.status(201).json({
        status: 'success',
        data: profesion,
    });
};

export const updateProfesion = async (req, res) => {
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const { id } = req.params;
    const { nombre } = req.body;

    const existingProfesion = await tenantPrisma.profesion.findUnique({
        where: { id: Number(id) },
    });

    if (!existingProfesion) {
        return res.status(404).josn({
            status: 'error',
            message: 'Profesión no encontrada',
        });
    }

    if (nombre && nombre !== existingProfesion.nombre) {
        const nameDuplicate = await tenantPrisma.profesion.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(404).json({
                status: 'error',
                message: 'Ya existe una profesión con este nombre',
            });
        }
    }

    const updateProfesion = await tenantPrisma.profesion.update({
        where: { id: Number(id) },
        data: { nombre },
    });

    res.status(200).json({
        status: 'success',
        message: 'Profesión actualizada correctamente',
        data: updateProfesion,
    });
};

export const deleteProfesion = async (req, res) => {
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const { id } = req.params;

    const inUse = await tenantPrisma.empleados.findFirst({
        where: { profesion_id: Number(id) },s
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar la profesion porque esta siendo utilizado por empleados',
        });
    }

    await tenantPrisma.profesion.delete({
        where: { id: Number(id) },
    });

    res.status(200).json({
        status: 'success',
        message: 'Profesion eliminada exitosamente',
    });
};

export const deleteManyProfesion = async (req, res) => {
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const { ids } = req.body;

    if(!ids || !Array.isArray(ids)) {
        return res.status(400).json({
            status: 'error',
            message: 'Se requiere un arreglo de IDs para el borrado masivo',
        });
    }

    if (ids.length >= 50) {
        return res.status(400).json({
            status: 'error',
            message: 'No se pueden eliminar mas de 50 cargos a la vez por motivos de seguridad',
        });
    }

    const inUseCheck = await tenantPrisma.empleados.findMany({
        where: {
            profesion_id: { in: ids },
        },
        select: {
            profesion_id:true,
            profesion: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.profesion_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.profesion.nombre))];
    const deletableIds = ids.filter(id => !inUseIds.includes(id));

    let message = '';

    if(deletableIds.length > 0) {
        await tenantPrisma.profesion.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });
        message = `Profesion con IDs ${deletableIds.join(', ')} eliminados exitosamente.`; 
    }

    if (inUseIds.length > 0) {
        message += ` Profesion con IDs ${inUseIds.join(', ')} no se pudieron eliminar porque están siendo utilizados por empleados (${inUseNames.join(', ')}).`;
        return res.status(200).json({
            status: 'warning',
            message,
            data: {
                deletedCount: deletableIds.length,
                skippedCount: inUseIds.length,
                skippedNames: inUseNames,
            }
        });
    }

    res.status(200).json({
        status: 'success',
        message,
        data: {
            deletedCount: deletableIds.length,
            skippedCount: 0,
        }
    });
};


