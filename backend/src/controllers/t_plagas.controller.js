import bitacoraService from '../services/bitacora.service.js';

export const getTPlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_plagas, totalCount] = await Promise.all([
        tenantPrisma.t_plagas.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_plagas.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_plagas,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getTPlagaById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tPlaga = await tenantPrisma.t_plagas.findUnique({
        where: { id: Number(id) },
    });

    if (!tPlaga) {
        return res.status(404).json({
            status: 'error',
            message: 'Error Tipo de Plaga no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tPlaga,
    });
};

export const createTPlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTPlaga = await tenantPrisma.t_plagas.findUnique({
        where: { nombre },
    });

    if (existingTPlaga) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un Tipo de Plaga con este nombre',
        });
    }

    const response = await tenantPrisma.t_plagas.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Plaga',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTPlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTPlaga = await tenantPrisma.t_plagas.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTPlaga) {
        return res.status(404).json({
            status: 'error',
            message: 'Tipo de Plaga no encontrada'
        });
    }

    if (nombre && nombre !== existingTPlaga.nombre) {
        const nameDuplicate = await tenantPrisma.t_plagas.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un tipo de plaga con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_plagas.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Plagas',
        payload_previo: existingTPlaga,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Plaga actualizado exitosamente',
        data: response,
    });
};

export const deleteTPlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.plagas.findFirst({
        where: { tipo_plaga_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar el Tipo de Plaga porque esta siendo utilizada por una Plaga',
        });
    }

    const tPlagaToDelete = await tenantPrisma.t_plagas.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_plagas.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Plagas',
        payload_previo: tPlagaToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Plaga eliminada exitosamente',
    });
};


export const deleteManyTPlagas = async (req, res) => {
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
            message: 'No se pueden eliminar más de 50 registros a la vez por motivos de seguridad',
        });
    }

    const numericIds = ids.map(id => Number(id));

    const inUseCheck = await tenantPrisma.plagas.findMany({
        where: {
            tipo_plaga_id: { in: numericIds },
        },
        select: {
            tipo_plaga_id: true,
            t_plagas: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_plaga_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_plagas.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_plagas.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_plagas.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Plagas',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de plagas exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} tipos no se pudieron eliminar por estar en uso: (${inUseNames.join(', ')}).`;
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

