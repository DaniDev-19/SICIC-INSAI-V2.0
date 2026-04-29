import bitacoraService from '../services/bitacora.service.js';

export const getParroquias = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { municipio_id } = req.query;

    const where = municipio_id ? { municipio_id: Number(municipio_id) } : {};

    const [parroquias, totalCount] = await Promise.all([
        tenantPrisma.parroquias.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                municipios: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.parroquias.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: parroquias,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getParroquiaById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const parroquia = await tenantPrisma.parroquias.findUnique({
        where: { id: Number(id) },
        include: {
            municipios: { select: { id: true, nombre: true } },
        },
    });

    if (!parroquia) {
        return res.status(404).json({
            status: 'error',
            message: 'Parroquia no encontrada',
        });
    }

    res.status(200).json({
        status: 'success',
        data: parroquia,
    });
};

export const createParroquia = async (req, res) => {
    const tenantPrisma = req.db;
    const { codigo, nombre, area_km2, municipio_id } = req.body;

    const municipioExiste = await tenantPrisma.municipios.findUnique({
        where: { id: municipio_id },
    });

    if (!municipioExiste) {
        return res.status(400).json({
            status: 'error',
            message: 'El municipio especificado no existe',
        });
    }

    const duplicateCodigo = await tenantPrisma.parroquias.findFirst({
        where: { municipio_id, codigo },
    });

    if (duplicateCodigo) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe una parroquia con este código en el municipio seleccionado',
        });
    }

    const parroquia = await tenantPrisma.parroquias.create({
        data: { codigo, nombre, area_km2, municipio_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Parroquias',
        payload_nuevo: parroquia,
    });

    res.status(201).json({
        status: 'success',
        data: parroquia,
    });
};

export const updateParroquia = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { codigo, nombre, area_km2, municipio_id } = req.body;

    const existing = await tenantPrisma.parroquias.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Parroquia no encontrada',
        });
    }

    if (municipio_id && municipio_id !== existing.municipio_id) {
        const municipioExiste = await tenantPrisma.municipios.findUnique({
            where: { id: municipio_id },
        });

        if (!municipioExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El municipio especificado no existe',
            });
        }
    }

    const targetMunicipioId = municipio_id || existing.municipio_id;
    const targetCodigo = codigo || existing.codigo;

    if (codigo !== existing.codigo || municipio_id !== existing.municipio_id) {
        const duplicateCodigo = await tenantPrisma.parroquias.findFirst({
            where: {
                municipio_id: targetMunicipioId,
                codigo: targetCodigo,
                id: { not: Number(id) },
            },
        });

        if (duplicateCodigo) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe una parroquia con este código en el municipio seleccionado',
            });
        }
    }

    const updated = await tenantPrisma.parroquias.update({
        where: { id: Number(id) },
        data: { codigo, nombre, area_km2, municipio_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Parroquias',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Parroquia actualizada exitosamente',
        data: updated,
    });
};

export const deleteParroquia = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.sectores.findFirst({
        where: { parroquia_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar la parroquia porque tiene sectores asociados',
        });
    }

    const toDelete = await tenantPrisma.parroquias.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Parroquia no encontrada',
        });
    }

    await tenantPrisma.parroquias.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Parroquias',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Parroquia eliminada exitosamente',
    });
};

export const deleteManyParroquias = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.sectores.findMany({
        where: {
            parroquia_id: { in: numericIds },
        },
        select: {
            parroquia_id: true,
            parroquias: {
                select: { nombre: true },
            },
        },
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.parroquia_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.parroquias.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const parroquiasParaBorrar = await tenantPrisma.parroquias.findMany({
            where: { id: { in: deletableIds } },
        });

        await tenantPrisma.parroquias.deleteMany({
            where: { id: { in: deletableIds } },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Parroquias',
            payload_previo: parroquiasParaBorrar,
        });

        message = `Se eliminaron ${deletableIds.length} parroquias exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} parroquias no se pudieron eliminar por tener sectores asociados: (${inUseNames.join(', ')}).`;
        return res.status(200).json({
            status: 'warning',
            message,
            data: {
                deletedCount: deletableIds.length,
                skippedCount: inUseIds.length,
                skippedNames: inUseNames,
            },
        });
    }

    res.status(200).json({
        status: 'success',
        message,
        data: {
            deletedCount: deletableIds.length,
            skippedCount: 0,
        },
    });
};
