import bitacoraService from '../services/bitacora.service.js';

export const getContratos = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [contratos, totalCount] = await Promise.all([
        tenantPrisma.contrato.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.contrato.count(),
    ]);

    res.status(200).json({
        status: 'success',
        data: contratos,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getContratoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const contrato = await tenantPrisma.contrato.findUnique({
        where: { id: Number(id) },
    });

    if (!contrato) {
        return res.status(404).json({
            status: 'error',
            message: 'Contrato no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: contrato,
    });
};

export const createContrato = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existing = await tenantPrisma.contrato.findUnique({
        where: { nombre },
    });

    if (existing) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un contrato con este nombre',
        });
    }

    const contrato = await tenantPrisma.contrato.create({
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Contratos',
        payload_nuevo: contrato,
    });

    res.status(201).json({
        status: 'success',
        data: contrato,
    });
};

export const updateContrato = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existing = await tenantPrisma.contrato.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Contrato no encontrado',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.contrato.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un contrato con este nombre',
            });
        }
    }

    const updated = await tenantPrisma.contrato.update({
        where: { id: Number(id) },
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Contratos',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Contrato actualizado exitosamente',
        data: updated,
    });
};

export const deleteContrato = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.contrato.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Contrato no encontrado',
        });
    }

    await tenantPrisma.contrato.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Contratos',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Contrato eliminado exitosamente',
    });
};

export const deleteManyContratos = async (req, res) => {
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

    const toDelete = await tenantPrisma.contrato.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.contrato.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Contratos',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} contratos exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
