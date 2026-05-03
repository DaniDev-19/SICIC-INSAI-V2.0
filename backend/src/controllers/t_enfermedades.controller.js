import bitacoraService from "../services/bitacora.service.js";

export const getTEnfermedades = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_enfermedad, totalCount] = await Promise.all([
        tenantPrisma.t_enfermedadades.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_enfermedadades.conunt()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_enfermedad,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }
    });
};

export const getTEnfermedadById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tEnfermedad = await tenantPrisma.t_enfermedades.findUnique({
        where: { id: Number(id) },
    });

    if (!tEnfermedad) {
        return res.status(404).json({
            status: 'Error',
            message: 'Tipo de enfermedad no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tEnfermedad,
    });
};

export const createTEnfermedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTEnfermedad = await tenantPrisma.t_enfermedades.findUnique({
        where: { nombre },
    });

    if (existingTEnfermedad) {
        return res.status(400).json({
            status: 'Error',
            message: 'Ya existe un Tipo de Enfermedad con este nombre',
        });
    }

    const response = await tenantPrisma.t_enfermedadades.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Enfermedad',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTEnfermedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTEnfermedad = await tenantPrisma.t_enfermedades.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTEnfermedad) {
        return res.status(404).json({
            status: 'Error',
            message: 'Tipo de Enfermedad no encontrada'
        });
    }

    if (nombre && nombre !== existingTEnfermedad.nombre) {
        const nameDuplicate = await tenantPrisma.t_enfermedadades.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'Error',
                message: 'Ya existe un tipo de enfermedad con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_enfermedadades.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Enfermedad',
        payload_previo: existingTEnfermedad,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de enfermedad actualizado exitosamente',
        data: response,
    });
};

export const deleteTEnfermedad = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.enfermedades.findFirst({
        where: { tipo_enfermedad_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar el Tipo de Enfermedad porque esta siendo utilizada por una enfermedad',
        });
    }

    const tEnfermedadToDelete = await tenantPrisma.t_enfermedades.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_enfermedades.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Enfermedad',
        payload_previo: tEnfermedadToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de enfermedad eliminada exitosamente',
    });
};


export const deleteManyTEnfermedad = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.enfermedades.findMany({
        where: {
            tipo_enfermedad_id: { in: numericIds },
        },
        select: {
            tipo_enfermedad_id: true,
            t_enfermedades: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_enfermedad_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_enfermedades.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_enfermedades.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_enfermedades.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Enfermedad',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de enfermedad exitosamente.`;
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