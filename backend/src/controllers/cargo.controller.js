import bitacoraService from '../services/bitacora.service.js';

export const getCargos = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [cargos, totalCount] = await Promise.all([
        tenantPrisma.cargos.findMany({
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
        }),
        tenantPrisma.cargos.count()
    ]);

    res.status(200).json({
        status: 'success',
        data: cargos,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        }
    });
};

export const getCargoById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const cargo = await tenantPrisma.cargos.findUnique({
        where: { id: Number(id) },
    });

    if (!cargo) {
        return res.status(404).json({
            status: 'error',
            message: 'Cargo no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: cargo,
    });
};

export const createCargo = async (req, res) => {
    const tenantPrisma = req.db;
    const { nombre } = req.body;

    const existingCargo = await tenantPrisma.cargos.findUnique({
        where: { nombre },
    });

    if (existingCargo) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un cargo con este nombre',
        });
    }

    const cargo = await tenantPrisma.cargos.create({
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Cargos',
        payload_nuevo: cargo
    });

    res.status(201).json({
        status: 'success',
        data: cargo,
    });
};

export const updateCargo = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { nombre } = req.body;

    const existingCargo = await tenantPrisma.cargos.findUnique({
        where: { id: Number(id) },
    });

    if (!existingCargo) {
        return res.status(404).json({
            status: 'error',
            message: 'Cargo no encontrado',
        });
    }

    if (nombre && nombre !== existingCargo.nombre) {
        const nameDuplicate = await tenantPrisma.cargos.findUnique({
            where: { nombre },
        });

        if (nameDuplicate) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un cargo con este nombre',
            });
        }
    }

    const updatedCargo = await tenantPrisma.cargos.update({
        where: { id: Number(id) },
        data: {
            nombre,
        },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Cargos',
        payload_previo: existingCargo,
        payload_nuevo: updatedCargo
    });

    res.status(200).json({
        status: 'success',
        message: 'Cargo actualizado exitosamente',
        data: updatedCargo,
    });
};

export const deleteCargo = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.empleados.findFirst({
        where: { cargo_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar el cargo porque esta siendo utilizado por empleados',
        });
    }

    const cargoToDelete = await tenantPrisma.cargos.findUnique({
        where: { id: Number(id) },
    });

    await tenantPrisma.cargos.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Cargos',
        payload_previo: cargoToDelete
    });

    res.status(200).json({
        status: 'success',
        message: 'Cargo eliminado exitosamente',
    });
};


export const deleteManyCargos = async (req, res) => {
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
            message: 'No se pueden eliminar más de 50 cargos a la vez por motivos de seguridad',
        });
    }

    const numericIds = ids.map(id => Number(id));

    const inUseCheck = await tenantPrisma.empleados.findMany({
        where: {
            cargo_id: { in: numericIds },
        },
        select: {
            cargo_id: true,
            cargos: {
                select: { nombre: true }
            }
        }
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.cargo_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.cargos.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {

        const cargosParaBorrar = await tenantPrisma.cargos.findMany({
            where: { id: { in: deletableIds } }
        });

        await tenantPrisma.cargos.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Cargos',
            payload_previo: cargosParaBorrar
        });

        message = `Se eliminaron ${deletableIds.length} cargos exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} cargos no se pudieron eliminar por estar en uso: (${inUseNames.join(', ')}).`;
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
