import bitacoraService from '../services/bitacora.service.js';

export const getTPrograma = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_programa, totalCount] = await Promise.all([
        tenantPrisma.t_programa.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_programa.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_programa,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getTProgramaById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tPrograma = await tenantPrisma.t_programa.findUnique({
        where: { id: Number(id) },
    });

    if (!tPrograma) {
        return res.status(404).json({
            status: 'Error',
            message: 'Error Tipo de Programa no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tPrograma,
    });
};

export const createTPrograma = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTPrograma = await tenantPrisma.t_programa.findUnique({
        where: { nombre },
    });

    if (existingTPrograma) {
        return res.status(400).json({
            status: 'Error',
            message: 'Ya existe un Tipo de Programa con este nombre',
        });
    }

    const response = await tenantPrisma.t_programa.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Programa',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTPrograma = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTPrograma = await tenantPrisma.t_programa.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTPrograma) {
        return res.status(404).json({
            status: 'Error',
            message: 'Tipo de Programa no encontrada'
        });
    }

    if (nombre && nombre !== existingTPrograma.nombre) {
        const nameDuplicate = await tenantPrisma.t_programa.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'Error',
                message: 'Ya existe un tipo de programa con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_programa.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Programa',
        payload_previo: existingTPrograma,
        payload_nuevo: response,
    });

    res.status(201).json({
        status: 'success',
        message: 'Tipo de Programa actualizado exitosamente',
        data: response,
    });
};

export const deleteTPrograma = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.programas.findFirst({
        where: { tipo_programa_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'Error',
            message: 'No se puede eliminar el Tipo de Programa porque esta siendo utilizada por un programa',
        });
    }

    const tProgramaToDelete = await tenantPrisma.t_programa.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_programa.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Programa',
        payload_previo: tProgramaToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Programa eliminada exitosamente',
    });
};


export const deleteManyTPrograma = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.programas.findMany({
        where: {
            tipo_programas_id: { in: numericIds },
        },
        select: {
            tipo_programa_id: true,
            t_programa: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_programa_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_programa.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_programa.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_programa.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Programa',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de programa exitosamente.`;
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

