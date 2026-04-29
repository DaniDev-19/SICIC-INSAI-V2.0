import bitacoraService from '../services/bitacora.service.js';

export const getVehiculos = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, tipo } = req.query;

  const where = {};
  if (status) where.status = status;
  if (tipo) where.tipo = tipo;

  const [vehiculos, totalCount] = await Promise.all([
    tenantPrisma.vehiculos.findMany({
      where,
      skip,
      take: limit,
      orderBy: { placa: 'asc' },
    }),
    tenantPrisma.vehiculos.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: vehiculos,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getVehiculoById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const vehiculo = await tenantPrisma.vehiculos.findUnique({
    where: { id: Number(id) },
  });

  if (!vehiculo) {
    return res.status(404).json({
      status: 'error',
      message: 'Vehículo no encontrado',
    });
  }

  res.status(200).json({
    status: 'success',
    data: vehiculo,
  });
};

export const createVehiculo = async (req, res) => {
  const tenantPrisma = req.db;
  const { placa, marca, modelo, tipo, color, status } = req.body;

  const existingPlaca = await tenantPrisma.vehiculos.findUnique({ where: { placa } });
  if (existingPlaca) {
    return res.status(400).json({ status: 'error', message: 'Ya existe un vehículo con esta placa' });
  }

  const vehiculo = await tenantPrisma.vehiculos.create({
    data: { placa, marca, modelo, tipo, color, status },
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Vehículos',
    payload_nuevo: vehiculo,
  });

  res.status(201).json({
    status: 'success',
    data: vehiculo,
  });
};

export const updateVehiculo = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const data = req.body;

  const existing = await tenantPrisma.vehiculos.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Vehículo no encontrado' });
  }

  if (data.placa && data.placa !== existing.placa) {
    const duplicate = await tenantPrisma.vehiculos.findUnique({ where: { placa: data.placa } });
    if (duplicate) {
      return res.status(409).json({ status: 'error', message: 'Ya existe un vehículo con esta placa' });
    }
  }

  const updated = await tenantPrisma.vehiculos.update({
    where: { id: Number(id) },
    data,
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Vehículos',
    payload_previo: existing,
    payload_nuevo: updated,
  });

  res.status(200).json({
    status: 'success',
    message: 'Vehículo actualizado exitosamente',
    data: updated,
  });
};

export const deleteVehiculo = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const inUse = await tenantPrisma.planificaciones.findFirst({ where: { vehiculo_id: Number(id) } });
  if (inUse) {
    return res.status(400).json({ status: 'error', message: 'No se puede eliminar el vehículo porque está asignado a una planificación' });
  }

  const toDelete = await tenantPrisma.vehiculos.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Vehículo no encontrado' });
  }

  await tenantPrisma.vehiculos.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Vehículos',
    payload_previo: toDelete,
  });

  res.status(200).json({
    status: 'success',
    message: 'Vehículo eliminado exitosamente',
  });
};

export const deleteManyVehiculos = async (req, res) => {
  const tenantPrisma = req.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Se requiere un arreglo de IDs' });
  }

  const numericIds = ids.map(id => Number(id));

  const inUseCheck = await tenantPrisma.planificaciones.findMany({
    where: { vehiculo_id: { in: numericIds } },
    select: { vehiculo_id: true },
  });

  const inUseIds = [...new Set(inUseCheck.map(item => item.vehiculo_id))];
  const deletableIds = numericIds.filter(id => !inUseIds.includes(id));

  if (deletableIds.length > 0) {
    const itemsToDelete = await tenantPrisma.vehiculos.findMany({ where: { id: { in: deletableIds } } });
    await tenantPrisma.vehiculos.deleteMany({ where: { id: { in: deletableIds } } });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_MASIVO',
      modulo: 'Vehículos',
      payload_previo: itemsToDelete,
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Se eliminaron ${deletableIds.length} vehículos. ${inUseIds.length} omitidos por estar en uso.`,
    data: { deletedCount: deletableIds.length, skippedCount: inUseIds.length },
  });
};
