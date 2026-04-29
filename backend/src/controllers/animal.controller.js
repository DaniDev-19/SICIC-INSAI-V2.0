import bitacoraService from '../services/bitacora.service.js';

export const getAnimales = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { tipo_animal_id } = req.query;

    const where = tipo_animal_id ? { tipo_animal_id: Number(tipo_animal_id) } : {};

    const [animales, totalCount] = await Promise.all([
        tenantPrisma.animales.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                t_animales: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.animales.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: animales,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getAnimalById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const animal = await tenantPrisma.animales.findUnique({
        where: { id: Number(id) },
        include: {
            t_animales: { select: { id: true, nombre: true } },
        },
    });

    if (!animal) {
        return res.status(404).json({
            status: 'error',
            message: 'Animal no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: animal,
    });
};

export const createAnimal = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre, nombre_cientifico, dieta, esperanza_vida, habitat_principal, peso_promedio_kg, longitud_promedio_mt, descripcion, tipo_animal_id } = req.body;

    const existingNombre = await tenantPrisma.animales.findUnique({
        where: { nombre },
    });

    if (existingNombre) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un animal con este nombre',
        });
    }

    if (nombre_cientifico) {
        const existingCientifico = await tenantPrisma.animales.findUnique({
            where: { nombre_cientifico },
        });

        if (existingCientifico) {
            return res.status(400).json({
                status: 'error',
                message: 'Ya existe un animal con este nombre científico',
            });
        }
    }

    if (tipo_animal_id) {
        const tipoExiste = await tenantPrisma.t_animales.findUnique({
            where: { id: tipo_animal_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de animal especificado no existe',
            });
        }
    }

    const animal = await tenantPrisma.animales.create({
        data: { nombre, nombre_cientifico, dieta, esperanza_vida, habitat_principal, peso_promedio_kg, longitud_promedio_mt, descripcion, tipo_animal_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Animales',
        payload_nuevo: animal,
    });

    res.status(201).json({
        status: 'success',
        data: animal,
    });
};

export const updateAnimal = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre, nombre_cientifico, dieta, esperanza_vida, habitat_principal, peso_promedio_kg, longitud_promedio_mt, descripcion, tipo_animal_id } = req.body;

    const existing = await tenantPrisma.animales.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Animal no encontrado',
        });
    }

    if (nombre && nombre !== existing.nombre) {
        const nameDuplicate = await tenantPrisma.animales.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un animal con este nombre',
            });
        }
    }

    if (nombre_cientifico && nombre_cientifico !== existing.nombre_cientifico) {
        const cientificoDuplicate = await tenantPrisma.animales.findUnique({
            where: { nombre_cientifico },
        });

        if (cientificoDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un animal con este nombre científico',
            });
        }
    }

    if (tipo_animal_id && tipo_animal_id !== existing.tipo_animal_id) {
        const tipoExiste = await tenantPrisma.t_animales.findUnique({
            where: { id: tipo_animal_id },
        });

        if (!tipoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El tipo de animal especificado no existe',
            });
        }
    }

    const updated = await tenantPrisma.animales.update({
        where: { id: Number(id) },
        data: { nombre, nombre_cientifico, dieta, esperanza_vida, habitat_principal, peso_promedio_kg, longitud_promedio_mt, descripcion, tipo_animal_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Animales',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Animal actualizado exitosamente',
        data: updated,
    });
};

export const deleteAnimal = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.animales.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Animal no encontrado',
        });
    }

    await tenantPrisma.animales.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Animales',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Animal eliminado exitosamente',
    });
};

export const deleteManyAnimales = async (req, res) => {
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

    const toDelete = await tenantPrisma.animales.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.animales.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Animales',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} animales exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
