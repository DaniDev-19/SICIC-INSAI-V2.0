import bitacoraService from '../services/bitacora.service.js';

export const getCInsumos = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [c_insumos, totalCount] = await Promise.all([
        tenantPrisma.c_insumos.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.c_insumos.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: c_insumos,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getCInsumosById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const cInsumos = await tenantPrisma.c_insumos.findUnique({
        where: { id: Number(id) },
    });

    if (!cInsumos) {
        return res.status(404).json({
            status: 'Error',
            message: 'Error categoria de Insumos no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: cInsumos,
    });
};

export const createCInsumos = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingCInsumos = await tenantPrisma.c_insumos.findUnique({
        where: { nombre },
    });

    if (existingCInsumos) {
        return res.status(400).json({
            status: 'Error',
            message: 'Ya existe una categoria de insumos con este nombre',
        });
    }

    const response = await tenantPrisma.c_insumos.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Categoria de Insumos',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateCInsumos = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingCInsumos = await tenantPrisma.c_insumos.findUnique({
        where: { id: Number(id) },
    });

    if (!existingCInsumos) {
        return res.status(404).json({
            status: 'Error',
            message: 'Categoria de insumos no encontrada'
        });
    }

    if (nombre && nombre !== existingCInsumos.nombre) {
        const nameDuplicate = await tenantPrisma.c_insumos.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'Error',
                message: 'Ya existe una categoria de insumos con este nombre',
            });
        }
    }

    const response = await tenantPrisma.c_insumos.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Categoria de insumos',
        payload_previo: existingCInsumos,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Categoria de insumos actualizado exitosamente',
        data: response,
    });
};

export const deleteCInsumos = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.insumos.findFirst({
        where: { categoria_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar la Categoria porque esta siendo utilizada por un Insumo',
        });
    }

    const cInsumosToDelete = await tenantPrisma.c_insumos.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.c_insumos.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Categoria de Insumos',
        payload_previo: cInsumosToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Categoria de Insumos eliminada exitosamente',
    });
};


export const deleteManyCInsumos = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.insumos.findMany({
        where: {
            categoria_id: { in: numericIds },
        },
        select: {
            categoria_id: true,
            c_insumos: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.categoria_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.c_insumos.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.c_insumos.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.c_insumos.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Categoria de Insumos',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} categorias de insumos exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} categorias no se pudieron eliminar por estar en uso: (${inUseNames.join(', ')}).`;
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

