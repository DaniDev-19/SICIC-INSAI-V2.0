import bitacoraService from '../services/bitacora.service.js';

export const getProfesion = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { q, search } = req.query;
    const searchTerm = (q || search || '').trim();

    const where = {};
    if (searchTerm) {
        const tokens = searchTerm.split(/\s+/).filter(Boolean);
        where.AND = tokens.map((token) => ({
            nombre: { contains: token, mode: 'insensitive' }
        }));
    }

    const [profesiones, totalCount] = await Promise.all([
        tenantPrisma.profesiones.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.profesiones.count({ where })
    ]);

    res.status(200).json({
        status: 'success',
        data: profesiones,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }
    });
};

export const getProfesionById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const profesion = await tenantPrisma.profesiones.findUnique({
        where: { id: Number(id) },
    });

    if (!profesion) {
        return res.status(404).json({
            status: 'error',
            message: 'Profesión no encontrada',
        });

    }
    res.status(200).json({
        status: 'success',
        data: profesion,
    });
};

export const createProfesion = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingProfesion = await tenantPrisma.profesiones.findUnique({
        where: { nombre },
    });

    if (existingProfesion) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una profesión con este nombre',
        });
    }

    const profesion = await tenantPrisma.profesiones.create({
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Profesiones',
        payload_nuevo: profesion
    });

    res.status(201).json({
        status: 'success',
        data: profesion,
    });
};

export const updateProfesion = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingProfesion = await tenantPrisma.profesiones.findUnique({
        where: { id: Number(id) },
    });

    if (!existingProfesion) {
        return res.status(404).json({
            status: 'error',
            message: 'Profesión no encontrada',
        });
    }

    if (nombre && nombre !== existingProfesion.nombre) {
        const nameDuplicate = await tenantPrisma.profesiones.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una profesión con este nombre',
            });
        }
    }

    const updatedProfesion = await tenantPrisma.profesiones.update({
        where: { id: Number(id) },
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Profesiones',
        payload_previo: existingProfesion,
        payload_nuevo: updatedProfesion
    });

    res.status(200).json({
        status: 'success',
        message: 'Profesión actualizada correctamente',
        data: updatedProfesion,
    });
};

export const deleteProfesion = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.empleados.findFirst({
        where: { profesion_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar la profesion porque esta siendo utilizado por empleados',
        });
    }

    const profesionToDelete = await tenantPrisma.profesiones.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.profesiones.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Profesiones',
        payload_previo: profesionToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Profesión eliminada exitosamente',
    });
};

export const deleteManyProfesion = async (req, res) => {
    const tenantPrisma = req.db;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Se requiere un arreglo de IDs no vacío para el borrado masivo',
        });
    }

    if (ids.length >= 50) {
        return res.status(400).json({
            status: 'error',
            message: 'No se pueden eliminar más de 50 profesiones a la vez por motivos de seguridad',
        });
    }

    const numericIds = ids.map(id => Number(id));

    const inUseCheck = await tenantPrisma.empleados.findMany({
        where: {
            profesion_id: { in: numericIds },
        },
        select: {
            profesion_id: true,
            profesion: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.profesion_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.profesion.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const profesionesParaBorrar = await tenantPrisma.profesiones.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.profesiones.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Profesiones',
            payload_previo: profesionesParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} profesiones exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} profesiones no se pudieron eliminar por estar en uso: (${inUseNames.join(', ')}).`;
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


