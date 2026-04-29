import bitacoraService from '../services/bitacora.service.js';

export const getOficinas = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [oficinas, totalCount] = await Promise.all([
        tenantPrisma.oficinas.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.oficinas.count(),
    ]);

    res.status(200).json({
        status: 'success',
        data: oficinas,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getOficinaById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const oficina = await tenantPrisma.oficinas.findUnique({
        where: { id: Number(id) },
    });

    if (!oficina) {
        return res.status(404).json({
            status: 'error',
            message: 'Oficina no encontrada',
        });
    }

    res.status(200).json({
        status: 'success',
        data: oficina,
    });
};

export const createOficina = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre, ubicacion_gms, es_centro_validacion, direccion } = req.body;

    const existing = await tenantPrisma.oficinas.findUnique({
        where: { nombre },
    });

    if (existing) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una oficina con este nombre',
        });
    }

    const oficina = await tenantPrisma.oficinas.create({
        data: { nombre, ubicacion_gms, es_centro_validacion, direccion },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Oficinas',
        payload_nuevo: oficina,
    });

    res.status(201).json({
        status: 'success',
        data: oficina,
    });
};

export const updateOficina = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre, ubicacion_gms, es_centro_validacion, direccion } = req.body;

    const existing = await tenantPrisma.oficinas.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Oficina no encontrada',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.oficinas.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una oficina con este nombre',
            });
        }
    }

    const updated = await tenantPrisma.oficinas.update({
        where: { id: Number(id) },
        data: { nombre, ubicacion_gms, es_centro_validacion, direccion },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Oficinas',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Oficina actualizada exitosamente',
        data: updated,
    });
};

export const deleteOficina = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.oficinas.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Oficina no encontrada',
        });
    }

    await tenantPrisma.oficinas.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Oficinas',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Oficina eliminada exitosamente',
    });
};

export const deleteManyOficinas = async (req, res) => {
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

    const toDelete = await tenantPrisma.oficinas.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.oficinas.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Oficinas',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} oficinas exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
