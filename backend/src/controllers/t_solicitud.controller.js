import bitacoraService from "../services/bitacora.service.js";

export const getTSolicitud = async () => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_solicitud, totalCount] = await Promise.all([
        tenantPrisma.t_solicitud.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_solicitud.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_solicitud,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }
    });
};

export const getTSolicitudById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const response = await tenantPrisma.t_solicitud.findUnique({
        where: { id: Number(id) }
    })

    if (!response) {
        return res.status(404).json({
            status: 'Error',
            message: 'El tipo de solicitud no se encuentra o es inexistente'
        });
    }

    res.status(200).json({
        status: 'success',
        data: response
    });
};

export const createTSolicitud = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTSolicitud = await tenantPrisma.t_solicitud.findFirst({
        where: { nombre },
    });

    if (existingTSolicitud) {
        return res.status(400).json({
            status: 'Error',
            message: 'Ya existe un tipo de solicitud con este nombre'
        });
    }

    const response = await tenantPrisma.t_solicitud.create({
        data: {
            nombre
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Solicitud',
        payload_nuevo: response
    });

    res.status(201).json({
        status: 'success',
        data: response,
    });
};

export const updateTSolicitud = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTSolicitud = await tenantPrisma.t_solicitud.findUnique({
        where: { id: Number(id) }
    });

    if (!existingTSolicitud) {
        return res.status(404).json({
            status: 'Error',
            message: 'Tipo de Solicitud no encontrada',
        });
    }

    if (nombre && nombre !== existingTSolicitud.nombre) {
        const nameDuplicate = await tenantPrisma.t_solicitud.findFirst({
            where: { nombre }
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'Error',
                message: 'Ya existe un Tipo de Solicitud con el mismo nombre'
            });
        }
    }

    const response = await tenantPrisma.t_solicitud.update({
        where: { id: Number(id) },
        data: {
            nombre,
        }
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Solicitud',
        payload_previo: existingTSolicitud,
        payload_nuevo: response,
    });

    res.status(201).json({
        status: 'success',
        message: 'Tipo de Solicitud actualizada correctamente',
        data: response,
    });
};

export const deleteTSolicitud = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.solicitudes.findFirst({
        where: { tipo_solicitud_id: Number(id) }
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar el tipo de solicitud ya que esta siendo utilizada por una solicitud',
        });

    }

    const tSolicitudToDelete = await tenantPrisma.t_solicitud.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_solicitud.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'success',
        modulo: 'Tipo de Solicitud',
        payload_previo: tSolicitudToDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Solicitud eliminada exitosamente',
    });
};


export const deleteManyTSolicitud = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.solicitudes.findMany({
        where: {
            tipo_solicitud_id: { in: numericIds },
        },
        select: {
            tipo_solicitud_id: true,
            t_solicitud: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_solicitud_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_solicitud.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_solicitud.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_solicitud.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Solicitud',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de solicitud exitosamente.`;
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
