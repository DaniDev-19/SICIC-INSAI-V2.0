import bitacoraService from '../services/bitacora.service.js';

export const getEnfermedades = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tipo_enfermedad_id } = req.query;

    const where = tipo_enfermedad_id ? { tipo_enfermedad_id: Number(tipo_enfermedad_id) } : {};

    const [enfermedades, totalCount] = await Promise.all([
        tenantPrisma.enfermedades.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                t_enfermedades: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.enfermedades.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: enfermedades,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getEnfermedadById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const enfermedad = await tenantPrisma.enfermedades.findUnique({
        where: { id: Number(id) },
        include: {
            t_enfermedades: { select: { id: true, nombre: true } },
        },
    });

    if (!enfermedad) {
        return res.status(404).json({
            status: 'error',
            message: 'Enfermedad no encontrada',
        });
    }

    res.status(200).json({
        status: 'success',
        data: enfermedad,
    });
};

export const createEnfermedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre, nombre_cientifico, zoonatica, descripcion, tipo_enfermedad_id } = req.body;

    const existingNombre = await tenantPrisma.enfermedades.findUnique({
        where: { nombre },
    });

    if (existingNombre) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una enfermedad con este nombre',
        });
    }

    if (nombre_cientifico) {
        const existingCientifico = await tenantPrisma.enfermedades.findUnique({
            where: { nombre_cientifico },
        });

        if (existingCientifico) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe una enfermedad con este nombre científico',
            });
        }
    }

    if (tipo_enfermedad_id) {
        const tipoExiste = await tenantPrisma.t_enfermedades.findUnique({
            where: { id: tipo_enfermedad_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de enfermedad especificado no existe',
            });
        }
    }

    const enfermedad = await tenantPrisma.enfermedades.create({
        data: { nombre, nombre_cientifico, zoonatica, descripcion, tipo_enfermedad_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Enfermedades',
        payload_nuevo: enfermedad,
    });

    res.status(201).json({
        status: 'success',
        data: enfermedad,
    });
};

export const updateEnfermedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre, nombre_cientifico, zoonatica, descripcion, tipo_enfermedad_id } = req.body;

    const existing = await tenantPrisma.enfermedades.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Enfermedad no encontrada',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.enfermedades.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una enfermedad con este nombre',
            });
        }
    }

    if (nombre_cientifico && nombre_cientifico !== existing.nombre_cientifico) {
        const cientificoDuplicate = await tenantPrisma.enfermedades.findUnique({
            where: { nombre_cientifico },
        });

        if (cientificoDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una enfermedad con este nombre científico',
            });
        }
    }

    if (tipo_enfermedad_id && tipo_enfermedad_id !== existing.tipo_enfermedad_id) {
        const tipoExiste = await tenantPrisma.t_enfermedades.findUnique({
            where: { id: tipo_enfermedad_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de enfermedad especificado no existe',
            });
        }
    }

    const updated = await tenantPrisma.enfermedades.update({
        where: { id: Number(id) },
        data: { nombre, nombre_cientifico, zoonatica, descripcion, tipo_enfermedad_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Enfermedades',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Enfermedad actualizada exitosamente',
        data: updated,
    });
};

export const deleteEnfermedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.enfermedades.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Enfermedad no encontrada',
        });
    }

    await tenantPrisma.enfermedades.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Enfermedades',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Enfermedad eliminada exitosamente',
    });
};

export const deleteManyEnfermedades = async (req, res) => {
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

    const toDelete = await tenantPrisma.enfermedades.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.enfermedades.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Enfermedades',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} enfermedades exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
