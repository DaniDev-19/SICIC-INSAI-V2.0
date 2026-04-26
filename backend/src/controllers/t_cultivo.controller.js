import bitacoraService from '../services/bitacora.service.js';

export const getTCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_cultivo, totalCount] = await Promise.all([
        tenantPrisma.t_cultivo.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_cultivo.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_cultivo,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getTCultivoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tCultivo = await tenantPrisma.t_cultivo.findUnique({
        where: { id: Number(id) },
    });

    if (!tCultivo) {
        return res.status(404).json({
            status: 'Error',
            message: 'Error Tipo de Cultivo no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tCultivo,
    });
};

export const createTCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTCultivo = await tenantPrisma.t_cultivo.findUnique({
        where: { nombre },
    });

    if (existingTCultivo) {
        return res.status(400).json({
            status: 'Error',
            message: 'Ya existe un Tipo de Cultivo con este nombre',
        });
    }

    const response = await tenantPrisma.t_cultivo.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Cultivo',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTCultivo = await tenantPrisma.t_cultivo.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTCultivo) {
        return res.status(404).json({
            status: 'Error',
            message: 'Tipo de Cultivo no encontrada'
        });
    }

    if (nombre && nombre !== existingTCultivo.nombre) {
        const nameDuplicate = await tenantPrisma.t_cultivo.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'Error',
                message: 'Ya existe un cultivo con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_cultivo.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Cultivo',
        payload_previo: existingTCultivo,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Cultivo actualizado exitosamente',
        data: response,
    });
};

export const deleteTCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.cultivo.findFirst({
        where: { tipo_cultivo_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar el Tipo de Cultivo porque esta siendo utilizada por un Cultivo',
        });
    }

    const tCultivoToDelete = await tenantPrisma.t_cultivo.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_cultivo.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Cultivo',
        payload_previo: tCultivoToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Cultivo eliminada exitosamente',
    });
};


export const deleteManyTCultivo = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.cultivo.findMany({
        where: {
            tipo_cultivo_id: { in: numericIds },
        },
        select: {
            tipo_cultivo_id: true,
            t_cultivo: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_cultivo_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_cultivo.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_cultivo.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_cultivo.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Cultivo',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de cultivos exitosamente.`;
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

