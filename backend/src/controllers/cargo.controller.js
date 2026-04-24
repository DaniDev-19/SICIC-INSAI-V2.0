import { getTenantPrisma } from '../config/prisma.js';
import bitacoraService from '../services/bitacora.service.js';

const getTenantPrismaFromRequest = (req) => {
    const dbName = req.user?.currentInstance?.db_name;
    if (!dbName) {
        throw new Error('No se seleccionó una instancia operativa en la sesión');
    }
    return getTenantPrisma(dbName.trim());
};

export const getCargos = async (req, res) => {
    const tenantPrisma = getTenantPrismaFromRequest(req);
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
    const tenantPrisma = getTenantPrismaFromRequest(req);
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
    const tenantPrisma = getTenantPrismaFromRequest(req);
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
    const tenantPrisma = getTenantPrismaFromRequest(req);
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
            return res.status(404).json({
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
    const tenantPrisma = getTenantPrismaFromRequest(req);
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
    })

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
    const tenantPrisma = getTenantPrismaFromRequest(req);
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({
            status: 'error',
            message: 'Se requiere un arreglo de IDs para el borrado masivo',
        });
    }

    if (ids.length >= 50) {
        return res.status(400).json({
            status: 'error',
            message: 'No se pueden eliminar mas de 50 cargos a la vez por motivos de seguridad',
        });
    }

    const inUseCheck = await tenantPrisma.empleados.findMany({
        where: {
            cargo_id: { in: ids },
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
    const deletableIds = ids.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        await tenantPrisma.cargos.deleteMany({
            where: {
                id: { in: deletableIds },
            },
        });
        message = `Cargos con IDs ${deletableIds.join(', ')} eliminados exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` Cargos con IDs ${inUseIds.join(', ')} no se pudieron eliminar porque están siendo utilizados por empleados (${inUseNames.join(', ')}).`;
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