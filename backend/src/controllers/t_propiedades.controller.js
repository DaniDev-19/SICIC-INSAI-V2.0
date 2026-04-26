import bitacoraService from '../services/bitacora.service.js';

export const getTPropiedad = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_propiedad, totalCount] = await Promise.all([
        tenantPrisma.t_propiedad.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_propiedad.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_propiedad,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getTPropiedadById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tPropiedad = await tenantPrisma.t_propiedad.findUnique({
        where: { id: Number(id) },
    });

    if (!tPropiedad) {
        return res.status(404).json({
            status: 'Error',
            message: 'Error Tipo de Propiedad no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tPropiedad,
    });
};

export const createTPropiedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTPropiedad = await tenantPrisma.t_propiedad.findUnique({
        where: { nombre },
    });

    if (existingTPropiedad) {
        return res.status(400).json({
            status: 'Error',
            message: 'Ya existe un Tipo de Propiedad con este nombre',
        });
    }

    const response = await tenantPrisma.t_propiedad.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Propiedad',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTPropiedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTPropiedad = await tenantPrisma.t_propiedad.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTPropiedad) {
        return res.status(404).json({
            status: 'Error',
            message: 'Tipo de Propiedad no encontrada'
        });
    }

    if (nombre && nombre !== existingTPropiedad.nombre) {
        const nameDuplicate = await tenantPrisma.t_propiedad.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'Error',
                message: 'Ya existe un cargo con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_propiedad.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Propiedad',
        payload_previo: existingTPropiedad,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Propiedad actualizado exitosamente',
        data: response,
    });
};

export const deleteTPropiedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.propiedades.findFirst({
        where: { tipo_propiedad_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar el Tipo de Propiedad porque esta siendo utilizada por una propiedad',
        });
    }

    const tPropiedadToDelete = await tenantPrisma.t_propiedad.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_propiedad.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Propiedad',
        payload_previo: tPropiedadToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Propiedad eliminada exitosamente',
    });
};


export const deleteManyTPropiedad = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.propiedades.findMany({
        where: {
            tipo_propiedad_id: { in: numericIds },
        },
        select: {
            tipo_propiedad_id: true,
            t_propiedad: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_propiedad_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_propiedad.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_propiedad.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_propiedad.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Propiedad',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de propiedad exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} tipos no se pudieron eliminar por estar en uso: (${inUseNames.join(', ')}).`;
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

