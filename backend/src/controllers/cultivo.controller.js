import bitacoraService from '../services/bitacora.service.js';

export const getCultivos = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tipo_cultivo_id, search } = req.query;

    const where = {};

    if (tipo_cultivo_id && tipo_cultivo_id !== 'all') {
        where.tipo_cultivo_id = Number(tipo_cultivo_id);
    }

    if (search) {
        where.OR = [
            { nombre: { contains: search, mode: 'insensitive' } },
            { nombre_cientifico: { contains: search, mode: 'insensitive' } },
            { descripcion: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [cultivos, totalCount] = await Promise.all([
        tenantPrisma.cultivo.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                t_cultivo: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.cultivo.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: cultivos,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getCultivoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const cultivo = await tenantPrisma.cultivo.findUnique({
        where: { id: Number(id) },
        include: {
            t_cultivo: { select: { id: true, nombre: true } },
        },
    });

    if (!cultivo) {
        return res.status(404).json({
            status: 'error',
            message: 'Cultivo no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: cultivo,
    });
};

export const createCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre, nombre_cientifico, descripcion, tipo_cultivo_id } = req.body;

    const existingNombre = await tenantPrisma.cultivo.findUnique({
        where: { nombre },
    });

    if (existingNombre) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un cultivo con este nombre',
        });
    }

    if (nombre_cientifico) {
        const existingCientifico = await tenantPrisma.cultivo.findUnique({
            where: { nombre_cientifico },
        });

        if (existingCientifico) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe un cultivo con este nombre científico',
            });
        }
    }

    if (tipo_cultivo_id) {
        const tipoExiste = await tenantPrisma.t_cultivo.findUnique({
            where: { id: tipo_cultivo_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de cultivo especificado no existe',
            });
        }
    }

    const cultivo = await tenantPrisma.cultivo.create({
        data: { nombre, nombre_cientifico, descripcion, tipo_cultivo_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Cultivos',
        payload_nuevo: cultivo,
    });

    res.status(201).json({
        status: 'success',
        data: cultivo,
    });
};

export const updateCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre, nombre_cientifico, descripcion, tipo_cultivo_id } = req.body;

    const existing = await tenantPrisma.cultivo.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Cultivo no encontrado',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.cultivo.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un cultivo con este nombre',
            });
        }
    }

    if (nombre_cientifico && nombre_cientifico !== existing.nombre_cientifico) {
        const cientificoDuplicate = await tenantPrisma.cultivo.findUnique({
            where: { nombre_cientifico },
        });

        if (cientificoDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un cultivo con este nombre científico',
            });
        }
    }

    if (tipo_cultivo_id && tipo_cultivo_id !== existing.tipo_cultivo_id) {
        const tipoExiste = await tenantPrisma.t_cultivo.findUnique({
            where: { id: tipo_cultivo_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de cultivo especificado no existe',
            });
        }
    }

    const updated = await tenantPrisma.cultivo.update({
        where: { id: Number(id) },
        data: { nombre, nombre_cientifico, descripcion, tipo_cultivo_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Cultivos',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Cultivo actualizado exitosamente',
        data: updated,
    });
};

export const deleteCultivo = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.cultivo.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Cultivo no encontrado',
        });
    }

    await tenantPrisma.cultivo.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Cultivos',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Cultivo eliminado exitosamente',
    });
};

export const deleteManyCultivos = async (req, res) => {
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

    const toDelete = await tenantPrisma.cultivo.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.cultivo.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Cultivos',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} cultivos exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
