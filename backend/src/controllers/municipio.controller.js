import bitacoraService from '../services/bitacora.service.js';

export const getMunicipios = async (req, res) => {
    const tenantPrisma = req.db;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { estado_id } = req.query;

    const where = estado_id ? { estado_id: Number(estado_id) } : {};

    const [municipios, totalCount] = await Promise.all([
        tenantPrisma.municipios.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nombre: 'asc' },
            include: {
                estados: { select: { id: true, nombre: true } },
            },
        }),
        tenantPrisma.municipios.count({ where }),
    ]);

    res.status(200).json({
        status: 'success',
        data: municipios,
        pagination: {
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            limit,
        },
    });
};

export const getMunicipioById = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const municipio = await tenantPrisma.municipios.findUnique({
        where: { id: Number(id) },
        include: {
            estados: { select: { id: true, nombre: true } },
        },
    });

    if (!municipio) {
        return res.status(404).json({
            status: 'error',
            message: 'Municipio no encontrado',
        });
    }

    res.status(200).json({
        status: 'success',
        data: municipio,
    });
};

export const createMunicipio = async (req, res) => {
    const tenantPrisma = req.db;
    const { codigo, nombre, area_km2, estado_id } = req.body;

    const estadoExiste = await tenantPrisma.estados.findUnique({
        where: { id: estado_id },
    });

    if (!estadoExiste) {
        return res.status(400).json({
            status: 'error',
            message: 'El estado especificado no existe',
        });
    }

    const duplicateCodigo = await tenantPrisma.municipios.findFirst({
        where: { estado_id, codigo },
    });

    if (duplicateCodigo) {
        return res.status(400).json({
            status: 'error',
            message: 'Ya existe un municipio con este código en el estado seleccionado',
        });
    }

    const municipio = await tenantPrisma.municipios.create({
        data: { codigo, nombre, area_km2, estado_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'CREAR',
        modulo: 'Municipios',
        payload_nuevo: municipio,
    });

    res.status(201).json({
        status: 'success',
        data: municipio,
    });
};

export const updateMunicipio = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;
    const { codigo, nombre, area_km2, estado_id } = req.body;

    const existing = await tenantPrisma.municipios.findUnique({
        where: { id: Number(id) },
    });

    if (!existing) {
        return res.status(404).json({
            status: 'error',
            message: 'Municipio no encontrado',
        });
    }

    if (estado_id && estado_id !== existing.estado_id) {
        const estadoExiste = await tenantPrisma.estados.findUnique({
            where: { id: estado_id },
        });

        if (!estadoExiste) {
            return res.status(400).json({
                status: 'error',
                message: 'El estado especificado no existe',
            });
        }
    }

    const targetEstadoId = estado_id || existing.estado_id;
    const targetCodigo = codigo || existing.codigo;

    if (codigo !== existing.codigo || estado_id !== existing.estado_id) {
        const duplicateCodigo = await tenantPrisma.municipios.findFirst({
            where: {
                estado_id: targetEstadoId,
                codigo: targetCodigo,
                id: { not: Number(id) },
            },
        });

        if (duplicateCodigo) {
            return res.status(409).json({
                status: 'error',
                message: 'Ya existe un municipio con este código en el estado seleccionado',
            });
        }
    }

    const updated = await tenantPrisma.municipios.update({
        where: { id: Number(id) },
        data: { codigo, nombre, area_km2, estado_id },
    });

    bitacoraService.registrar({
        req,
        accion: 'ACTUALIZAR',
        modulo: 'Municipios',
        payload_previo: existing,
        payload_nuevo: updated,
    });

    res.status(200).json({
        status: 'success',
        message: 'Municipio actualizado exitosamente',
        data: updated,
    });
};

export const deleteMunicipio = async (req, res) => {
    const tenantPrisma = req.db;
    const { id } = req.params;

    const inUse = await tenantPrisma.parroquias.findFirst({
        where: { municipio_id: Number(id) },
    });

    if (inUse) {
        return res.status(400).json({
            status: 'error',
            message: 'No se puede eliminar el municipio porque tiene parroquias asociadas',
        });
    }

    const toDelete = await tenantPrisma.municipios.findUnique({
        where: { id: Number(id) },
    });

    if (!toDelete) {
        return res.status(404).json({
            status: 'error',
            message: 'Municipio no encontrado',
        });
    }

    await tenantPrisma.municipios.delete({
        where: { id: Number(id) },
    });

    bitacoraService.registrar({
        req,
        accion: 'ELIMINAR',
        modulo: 'Municipios',
        payload_previo: toDelete,
    });

    res.status(200).json({
        status: 'success',
        message: 'Municipio eliminado exitosamente',
    });
};

export const deleteManyMunicipios = async (req, res) => {
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

    const inUseCheck = await tenantPrisma.parroquias.findMany({
        where: {
            municipio_id: { in: numericIds },
        },
        select: {
            municipio_id: true,
            municipios: {
                select: { nombre: true },
            },
        },
    });

    const inUseIds = [...new Set(inUseCheck.map(item => item.municipio_id))];
    const inUseNames = [...new Set(inUseCheck.map(item => item.municipios.nombre))];
    const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

    let message = '';

    if (deletableIds.length > 0) {
        const municipiosParaBorrar = await tenantPrisma.municipios.findMany({
            where: { id: { in: deletableIds } },
        });

        await tenantPrisma.municipios.deleteMany({
            where: { id: { in: deletableIds } },
        });

        bitacoraService.registrar({
            req,
            accion: 'ELIMINAR_MASIVO',
            modulo: 'Municipios',
            payload_previo: municipiosParaBorrar,
        });

        message = `Se eliminaron ${deletableIds.length} municipios exitosamente.`;
    }

    if (inUseIds.length > 0) {
        message += ` ${inUseIds.length} municipios no se pudieron eliminar por tener parroquias asociadas: (${inUseNames.join(', ')}).`;
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
