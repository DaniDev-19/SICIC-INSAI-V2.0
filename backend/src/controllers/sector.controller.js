import bitacoraService from '../services/bitacora.service.js';

export const getSectores = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { parroquia_id } = req.query;

    const where = parroquia_id ? { parroquia_id: Number(parroquia_id) } : {};

    const [sectores, totalCount] = await Promise.all([
        tenantPrisma.sectores.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                parroquias: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.sectores.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: sectores,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getSectorById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const sector = await tenantPrisma.sectores.findUnique({
        where: { id: Number(id) },
        include: {
            parroquias: { select: { id: true, nombre: true } },
        },
    });

    if (!sector) {
        return res.status(404).json({
            status: 'error',
            message: 'Sector no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: sector,
    });
};

export const createSector = async (req, res) => {
    const tenantPrisma = req.db;
    const { codigo, nombre, parroquia_id } = req.body;

    const parroquiaExiste = await tenantPrisma.parroquias.findUnique({
        where: { id: parroquia_id },
    });

    if (!parroquiaExiste) {
        return res.status(400).json({
            status: 'error',
            message: 'La parroquia especificada no existe',
        });
    }

    const duplicateCodigo = await tenantPrisma.sectores.findFirst({
        where: { parroquia_id, codigo },
    });

    if (duplicateCodigo) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un sector con este código en la parroquia seleccionada',
        });
    }

    const sector = await tenantPrisma.sectores.create({
        data: { codigo, nombre, parroquia_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Sectores',
        payload_nuevo: sector,
    });

    res.status(201).json({
        status: 'success',
        data: sector,
    });
};

export const updateSector = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { codigo, nombre, parroquia_id } = req.body;

    const existing = await tenantPrisma.sectores.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Sector no encontrado',
        });
    }

    if (parroquia_id && parroquia_id !== existing.parroquia_id) {
        const parroquiaExiste = await tenantPrisma.parroquias.findUnique({
            where: { id: parroquia_id },
        });

        if (!parroquiaExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'La parroquia especificada no existe',
            });
        }
    }

    const targetParroquiaId = parroquia_id || existing.parroquia_id;
    const targetCodigo = codigo || existing.codigo;

    if (codigo !== existing.codigo || parroquia_id !== existing.parroquia_id) {
        const duplicateCodigo = await tenantPrisma.sectores.findFirst({
            where: {
                parroquia_id: targetParroquiaId,
                codigo: targetCodigo,
                id: { not: Number(id) },
            },
        });

        if (duplicateCodigo) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un sector con este código en la parroquia seleccionada',
            });
        }
    }

    const updated = await tenantPrisma.sectores.update({
        where: { id: Number(id) },
        data: { codigo, nombre, parroquia_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Sectores',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Sector actualizado exitosamente',
        data: updated,
    });
};

export const deleteSector = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const toDelete = await tenantPrisma.sectores.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Sector no encontrado',
        });
    }

    await tenantPrisma.sectores.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Sectores',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Sector eliminado exitosamente',
    });
};

export const deleteManySectores = async (req, res) => {
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

    const toDelete = await tenantPrisma.sectores.findMany({
        where: { id: { in: numericIds } },
    });

    await tenantPrisma.sectores.deleteMany({
        where: { id: { in: numericIds } },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR_MASIVO',
        modulo: 'Sectores',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: `Se eliminaron ${toDelete.length} sectores exitosamente.`,
        data: {
            deletedCount: toDelete.length,
        },
    });
};
