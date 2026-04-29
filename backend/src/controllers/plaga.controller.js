import bitacoraService from '../services/bitacora.service.js';

export const getPlagas = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tipo_plaga_id } = req.query;

    const where = tipo_plaga_id ? { tipo_plaga_id: Number(tipo_plaga_id) } : {};

    const [plagas, totalCount] = await Promise.all([
        tenantPrisma.plagas.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                t_plagas: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.plagas.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: plagas,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getPlagaById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const plaga = await tenantPrisma.plagas.findUnique({
        where: { id: Number(id) },
        include: {
            t_plagas: { select: { id: true, nombre: true } },
        },
    });

    if (!plaga) {
        return res.status(404).json({
            status: 'error',
            message: 'Plaga no encontrada',
        });
    }

    res.status(200).json({
        status: 'success',
        data: plaga,
    });
};

export const createPlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre, nombre_cientifico, descripcion, tipo_plaga_id } = req.body;

    const existingNombre = await tenantPrisma.plagas.findUnique({
        where: { nombre },
    });

    if (existingNombre) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una plaga con este nombre',
        });
    }

    if (nombre_cientifico) {
        const existingCientifico = await tenantPrisma.plagas.findUnique({
            where: { nombre_cientifico },
        });

        if (existingCientifico) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe una plaga con este nombre científico',
            });
        }
    }

    if (tipo_plaga_id) {
        const tipoExiste = await tenantPrisma.t_plagas.findUnique({
            where: { id: tipo_plaga_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de plaga especificado no existe',
            });
        }
    }

    const plaga = await tenantPrisma.plagas.create({
        data: { nombre, nombre_cientifico, descripcion, tipo_plaga_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Plagas',
        payload_nuevo: plaga,
    });

    res.status(201).json({
        status: 'success',
        data: plaga,
    });
};

export const updatePlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre, nombre_cientifico, descripcion, tipo_plaga_id } = req.body;

    const existing = await tenantPrisma.plagas.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Plaga no encontrada',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.plagas.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una plaga con este nombre',
            });
        }
    }

    if (nombre_cientifico && nombre_cientifico !== existing.nombre_cientifico) {
        const cientificoDuplicate = await tenantPrisma.plagas.findUnique({
            where: { nombre_cientifico },
        });

        if (cientificoDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una plaga con este nombre científico',
            });
        }
    }

    if (tipo_plaga_id && tipo_plaga_id !== existing.tipo_plaga_id) {
        const tipoExiste = await tenantPrisma.t_plagas.findUnique({
            where: { id: tipo_plaga_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de plaga especificado no existe',
            });
        }
    }

    const updated = await tenantPrisma.plagas.update({
        where: { id: Number(id) },
        data: { nombre, nombre_cientifico, descripcion, tipo_plaga_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Plagas',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Plaga actualizada exitosamente',
        data: updated,
    });
};

export const deletePlaga = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.plagas.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Plaga no encontrada',
        });
    }

    await tenantPrisma.plagas.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Plagas',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Plaga eliminada exitosamente',
    });
};

export const deleteManyPlagas = async (req, res) => {
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

    const toDelete = await tenantPrisma.plagas.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.plagas.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Plagas',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} plagas exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
