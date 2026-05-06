import bitacoraService from '../services/bitacora.service.js';

export const getTEvento = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_evento, totalCount] = await Promise.all([
        tenantPrisma.t_evento.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_evento.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_evento,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getTEventoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tEvento = await tenantPrisma.t_evento.findUnique({
        where: { id: Number(id) },
    });

    if (!tEvento) {
        return res.status(404).json({
            status: 'error',
            message: 'Error Tipo de Evento no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tEvento,
    });
};

export const createTEvento = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTEvento = await tenantPrisma.t_evento.findFirst({
        where: { nombre },
    });

    if (existingTEvento) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un Tipo de Evento con este nombre',
        });
    }

    const response = await tenantPrisma.t_evento.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Evento',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTEvento = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTEvento = await tenantPrisma.t_evento.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTEvento) {
        return res.status(404).json({
            status: 'error',
            message: 'Tipo de Evento no encontrada'
        });
    }

    if (nombre && nombre !== existingTEvento.nombre) {
        const nameDuplicate = await tenantPrisma.t_evento.findFirst({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un tipo de evento con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_evento.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Evento',
        payload_previo: existingTEvento,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Evento actualizado exitosamente',
        data: response,
    });
};

export const deleteTEvento = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.acta_silos.findFirst({
        where: { evento_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar el Tipo de Evento porque esta siendo utilizada por una acta de silos',
        });
    }

    const tEventoToDelete = await tenantPrisma.t_evento.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_evento.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Evento',
        payload_previo: tEventoToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Evento eliminada exitosamente',
    });
};


export const deleteManyTEvento = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.acta_silos.findMany({
        where: {
            evento_id: { in: numericIds },
        },
        select: {
            evento_id: true,
            t_evento: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.evento_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_evento.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_evento.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_evento.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Evento',
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

