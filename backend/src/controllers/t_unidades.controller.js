import bitacoraService from '../services/bitacora.service.js';

export const getTUnidades = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [unidades, totalCount] = await Promise.all([
        tenantPrisma.t_unidades.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_unidades.count(),
    ]);

    res.status(200).json({
        status: 'success',
        data: unidades,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getTUnidadById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const unidad = await tenantPrisma.t_unidades.findUnique({
        where: { id: Number(id) },
    });

    if (!unidad) {
        return res.status(404).json({
            status: 'error',
            message: 'Unidad no encontrada',
        });
    }

    res.status(200).json({
        status: 'success',
        data: unidad,
    });
};

export const createTUnidad = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre, abreviatura, tipo } = req.body;

    const existing = await tenantPrisma.t_unidades.findUnique({
        where: { nombre },
    });

    if (existing) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una unidad con este nombre',
        });
    }

    const unidad = await tenantPrisma.t_unidades.create({
        data: { nombre, abreviatura, tipo },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Unidades',
        payload_nuevo: unidad,
    });

    res.status(201).json({
        status: 'success',
        data: unidad,
    });
};

export const updateTUnidad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre, abreviatura, tipo } = req.body;

    const existing = await tenantPrisma.t_unidades.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Unidad no encontrada',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.t_unidades.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una unidad con este nombre',
            });
        }
    }

    const updated = await tenantPrisma.t_unidades.update({
        where: { id: Number(id) },
        data: { nombre, abreviatura, tipo },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Unidades',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Unidad actualizada exitosamente',
        data: updated,
    });
};

export const deleteTUnidad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.t_unidades.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Unidad no encontrada',
        });
    }

    await tenantPrisma.t_unidades.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Unidades',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Unidad eliminada exitosamente',
    });
};

export const deleteManyTUnidades = async (req, res) => {
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

    const toDelete = await tenantPrisma.t_unidades.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.t_unidades.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Unidades',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} unidades exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
