import bitacoraService from '../services/bitacora.service.js';

export const getFinalidades = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [finalidades, totalCount] = await Promise.all([
        tenantPrisma.finalidad.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.finalidad.count(),
    ]);

    res.status(200).json({
        status: 'success',
        data: finalidades,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getFinalidadById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const finalidad = await tenantPrisma.finalidad.findUnique({
        where: { id: Number(id) },
    });

    if (!finalidad) {
        return res.status(404).json({
            status: 'error',
            message: 'Finalidad no encontrada',
        });
    }

    res.status(200).json({
        status: 'success',
        data: finalidad,
    });
};

export const createFinalidad = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existing = await tenantPrisma.finalidad.findUnique({
        where: { nombre },
    });

    if (existing) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una finalidad con este nombre',
        });
    }

    const finalidad = await tenantPrisma.finalidad.create({
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Finalidad',
        payload_nuevo: finalidad,
    });

    res.status(201).json({
        status: 'success',
        data: finalidad,
    });
};

export const updateFinalidad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existing = await tenantPrisma.finalidad.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Finalidad no encontrada',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.finalidad.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una finalidad con este nombre',
            });
        }
    }

    const updated = await tenantPrisma.finalidad.update({
        where: { id: Number(id) },
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Finalidad',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Finalidad actualizada exitosamente',
        data: updated,
    });
};

export const deleteFinalidad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.finalidad.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Finalidad no encontrada',
        });
    }

    await tenantPrisma.finalidad.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Finalidad',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Finalidad eliminada exitosamente',
    });
};

export const deleteManyFinalidades = async (req, res) => {
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

    const toDelete = await tenantPrisma.finalidad.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.finalidad.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Finalidad',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} finalidades exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
