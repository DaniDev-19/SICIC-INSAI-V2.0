import bitacoraService from '../services/bitacora.service.js';

export const getDepartamentos = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [departamentos, totalCount] = await Promise.all([
        tenantPrisma.departamentos.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.departamentos.count(),
    ]);

    res.status(200).json({
        status: 'success',
        data: departamentos,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getDepartamentoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const departamento = await tenantPrisma.departamentos.findUnique({
        where: { id: Number(id) },
    });

    if (!departamento) {
        return res.status(404).json({
            status: 'error',
            message: 'Departamento no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: departamento,
    });
};

export const createDepartamento = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existing = await tenantPrisma.departamentos.findUnique({
        where: { nombre },
    });

    if (existing) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un departamento con este nombre',
        });
    }

    const departamento = await tenantPrisma.departamentos.create({
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Departamentos',
        payload_nuevo: departamento,
    });

    res.status(201).json({
        status: 'success',
        data: departamento,
    });
};

export const updateDepartamento = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existing = await tenantPrisma.departamentos.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Departamento no encontrado',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.departamentos.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un departamento con este nombre',
            });
        }
    }

    const updated = await tenantPrisma.departamentos.update({
        where: { id: Number(id) },
        data: { nombre },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Departamentos',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Departamento actualizado exitosamente',
        data: updated,
    });
};

export const deleteDepartamento = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.departamentos.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Departamento no encontrado',
        });
    }

    await tenantPrisma.departamentos.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Departamentos',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Departamento eliminado exitosamente',
    });
};

export const deleteManyDepartamentos = async (req, res) => {
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

    const toDelete = await tenantPrisma.departamentos.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.departamentos.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Departamentos',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} departamentos exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
