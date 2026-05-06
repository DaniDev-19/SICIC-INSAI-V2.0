import bitacoraService from '../services/bitacora.service.js';

export const getTAnimales = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [t_animales, totalCount] = await Promise.all([
        tenantPrisma.t_animales.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.t_animales.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: t_animales,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }

    });
};

export const getTAnimalesById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const tAnimales = await tenantPrisma.t_animales.findUnique({
        where: { id: Number(id) },
    });

    if (!tAnimales) {
        return res.status(404).json({
            status: 'error',
            message: 'Error Tipo de animal no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: tAnimales,
    });
};

export const createTAnimales = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingTAnimales = await tenantPrisma.t_animales.findUnique({
        where: { nombre },
    });

    if (existingTAnimales) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un Tipo de Animal con este nombre',
        });
    }

    const response = await tenantPrisma.t_animales.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Tipo de Animales',
        payload_nuevo: response
    });

    res.status(200).json({
        status: 'success',
        data: response,
    });
};

export const updateTAnimales = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingTAnimales = await tenantPrisma.t_animales.findUnique({
        where: { id: Number(id) },
    });

    if (!existingTAnimales) {
        return res.status(404).json({
            status: 'error',
            message: 'Tipo de Animales no encontrada'
        });
    }

    if (nombre && nombre !== existingTAnimales.nombre) {
        const nameDuplicate = await tenantPrisma.t_animales.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un tipo de animal con este nombre',
            });
        }
    }

    const response = await tenantPrisma.t_animales.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Tipo de Animal',
        payload_previo: existingTAnimales,
        payload_nuevo: response,
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Animal actualizado exitosamente',
        data: response,
    });
};

export const deleteTAnimal = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.animales.findFirst({
        where: { tipo_animal_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar el Tipo de Animal porque esta siendo utilizada por un Animal',
        });
    }

    const tAnimalToDelete = await tenantPrisma.t_animales.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.t_animales.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Tipo de Animal',
        payload_previo: tAnimalToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Tipo de Animal eliminada exitosamente',
    });
};


export const deleteManyTAnimal = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.animales.findMany({
        where: {
            tipo_animal_id: { in: numericIds },
        },
        select: {
            tipo_animal_id: true,
            t_animales: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.tipo_animal_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.t_animales.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const tiposParaBorrar = await tenantPrisma.t_animales.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.t_animales.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Tipo de Animal',
            payload_previo: tiposParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} tipos de animales exitosamente.`;
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

