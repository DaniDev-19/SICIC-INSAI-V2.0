import bitacoraService from '../services/bitacora.service.js';

export const getInsumos = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { categoria_id } = req.query;

  const where = categoria_id ? { categoria_id: Number(categoria_id) } : {};

  const [insumos, totalCount] = await Promise.all([
    tenantPrisma.insumos.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
      include: {
        c_insumos: { select: { id: true, nombre: true } },
        t_unidades: { select: { id: true, nombre: true, abreviatura: true } },
      },
    }),
    tenantPrisma.insumos.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: insumos,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getInsumoById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const insumo = await tenantPrisma.insumos.findUnique({
    where: { id: Number(id) },
    include: {
      c_insumos: { select: { id: true, nombre: true } },
      t_unidades: { select: { id: true, nombre: true, abreviatura: true } },
    },
  });

  if (!insumo) {
    return res.status(404).json({
      status: 'error',
      message: 'Insumo no encontrado',
    });
  }

  res.status(200).json({
    status: 'success',
    data: insumo,
  });
};

export const createInsumo = async (req, res) => {
  const tenantPrisma = req.db;
  const { codigo, nombre, marca, descripcion, categoria_id, unidad_medida_id } = req.body;

  if (codigo) {
    const existingCodigo = await tenantPrisma.insumos.findUnique({ where: { codigo } });
    if (existingCodigo) {
      return res.status(400).json({ status: 'error', message: 'Ya existe un insumo con este código' });
    }
  }

  const insumo = await tenantPrisma.insumos.create({
    data: { codigo, nombre, marca, descripcion, categoria_id, unidad_medida_id },
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Insumos',
    payload_nuevo: insumo,
  });

  res.status(201).json({
    status: 'success',
    data: insumo,
  });
};

export const updateInsumo = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const data = req.body;

  const existing = await tenantPrisma.insumos.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Insumo no encontrado' });
  }

  if (data.codigo && data.codigo !== existing.codigo) {
    const duplicate = await tenantPrisma.insumos.findUnique({ where: { codigo: data.codigo } });
    if (duplicate) {
      return res.status(409).json({ status: 'error', message: 'Ya existe un insumo con este código' });
    }
  }

  const updated = await tenantPrisma.insumos.update({
    where: { id: Number(id) },
    data,
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Insumos',
    payload_previo: existing,
    payload_nuevo: updated,
  });

  res.status(200).json({
    status: 'success',
    message: 'Insumo actualizado exitosamente',
    data: updated,
  });
};

export const deleteInsumo = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const inUse = await tenantPrisma.insumos_stock.findFirst({ where: { insumo_id: Number(id) } });
  if (inUse) {
    return res.status(400).json({ status: 'error', message: 'No se puede eliminar el insumo porque tiene stock asociado' });
  }

  const toDelete = await tenantPrisma.insumos.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Insumo no encontrado' });
  }

  await tenantPrisma.insumos.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Insumos',
    payload_previo: toDelete,
  });

  res.status(200).json({
    status: 'success',
    message: 'Insumo eliminado exitosamente',
  });
};

export const deleteManyInsumos = async (req, res) => {
  const tenantPrisma = req.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Se requiere un arreglo de IDs' });
  }

  const numericIds = ids.map(id => Number(id));

  const inUseCheck = await tenantPrisma.insumos_stock.findMany({
    where: { insumo_id: { in: numericIds } },
    select: { insumo_id: true },
  });

  const inUseIds = [...new Set(inUseCheck.map(item => item.insumo_id))];
  const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

  if (deletableIds.length > 0) {
    const itemsToDelete = await tenantPrisma.insumos.findMany({ where: { id: { in: deletableIds } } });
    await tenantPrisma.insumos.deleteMany({ where: { id: { in: deletableIds } } });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_MASIVO',
      modulo: 'Insumos',
      payload_previo: itemsToDelete,
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Se eliminaron ${deletableIds.length} insumos. ${inUseIds.length} omitidos por estar en uso.`,
    data: { deletedCount: deletableIds.length, skippedCount: inUseIds.length },
  });
};
