import bitacoraService from '../services/bitacora.service.js';

export const getEstados = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [estados, totalCount] = await Promise.all([
        tenantPrisma.estados.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.estados.count(),
    ]);

    res.status(200).json({
        status: 'success',
        data: estados,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getEstadoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const estado = await tenantPrisma.estados.findUnique({
        where: { id: Number(id) },
    });

    if (!estado) {
        return res.status(404).json({
            status: 'error',
            message: 'Estado no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: estado,
    });
};

export const createEstado = async (req, res) => {
    const tenantPrisma = req.db;
    const { codigo, nombre, area_km2 } = req.body;

    const existingNombre = await tenantPrisma.estados.findUnique({
        where: { nombre },
    });

    if (existingNombre) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un estado con este nombre',
        });
    }

    const existingCodigo = await tenantPrisma.estados.findUnique({
        where: { codigo },
    });

    if (existingCodigo) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un estado con este código',
        });
    }

    const estado = await tenantPrisma.estados.create({
        data: { codigo, nombre, area_km2 },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Estados',
        payload_nuevo: estado,
    });

    res.status(201).json({
        status: 'success',
        data: estado,
    });
};

export const updateEstado = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { codigo, nombre, area_km2 } = req.body;

    const existing = await tenantPrisma.estados.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Estado no encontrado',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.estados.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un estado con este nombre',
            });
        }
    }

    if (codigo && codigo !== existing.codigo) {
        const codeDuplicate = await tenantPrisma.estados.findUnique({
            where: { codigo },
        });

        if (codeDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un estado con este código',
            });
        }
    }

    const updated = await tenantPrisma.estados.update({
        where: { id: Number(id) },
        data: { codigo, nombre, area_km2 },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Estados',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Estado actualizado exitosamente',
        data: updated,
    });
};

export const deleteEstado = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.municipios.findFirst({
        where: { estado_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar el estado porque tiene municipios asociados',
        });
    }

    const toDelete = await tenantPrisma.estados.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Estado no encontrado',
        });
    }

    await tenantPrisma.estados.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Estados',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Estado eliminado exitosamente',
    });
};

export const deleteManyEstados = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.municipios.findMany({
        where: {
            estado_id: { in: numericIds },
        },
        select: {
            estado_id: true,
            estados: {
                select: { nombre: true },
            },
        },
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.estado_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.estados.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const estadosParaBorrar = await tenantPrisma.estados.findMany({
            where: { id: { in: deletableIds } },
        });

        await tenantPrisma.estados.deleteMany({
            where: { id: { in: deletableIds } },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Estados',
            payload_previo: estadosParaBorrar,
        });

        message = `Se eliminaron ${deletableIds.length} estados exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} estados no se pudieron eliminar por tener municipios asociados: (${inUseNames.join(', ')}).`;
        return res.status(200).json({
            status: 'warning',
            message,
            data: {
                deletedCount: deletableIds.length,
                skippedCount: inUseIds.length,
                skippedNames: inUseNames,
            },
        });
    }

    res.status(200).json({
        status: 'success',
        message,
        data: {
            deletedCount: deletableIds.length,
            skippedCount: 0,
        },
    });
};
