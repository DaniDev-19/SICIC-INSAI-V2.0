import bitacoraService from '../services/bitacora.service.js';

export const getProgramas = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { tipo_programa_id } = req.query;

  const where = tipo_programa_id ? { tipo_programa_id: Number(tipo_programa_id) } : {};

  const [programas, totalCount] = await Promise.all([
    tenantPrisma.programas.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
      include: {
        t_programa: { select: { id: true, nombre: true } },
      },
    }),
    tenantPrisma.programas.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: programas,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getProgramaById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const programa = await tenantPrisma.programas.findUnique({
    where: { id: Number(id) },
    include: {
      t_programa: { select: { id: true, nombre: true } },
      programa_plaga: { include: { plagas: { select: { id: true, nombre: true } } } },
      programa_cultivo: { include: { cultivo: { select: { id: true, nombre: true } } } },
      programa_animales: { include: { animales: { select: { id: true, nombre: true } } } },
      programa_enfermedades: { include: { enfermedades: { select: { id: true, nombre: true } } } },
    },
  });

  if (!programa) {
    return res.status(404).json({
      status: 'error',
      message: 'Programa no encontrado',
    });
  }

  res.status(200).json({
    status: 'success',
    data: programa,
  });
};

export const createPrograma = async (req, res) => {
  const tenantPrisma = req.db;
  const { nombre, descripcion, tipo_programa_id, plagas_ids, cultivos_ids, animales_ids, enfermedades_ids } = req.body;

  const programa = await tenantPrisma.programas.create({
    data: {
      nombre,
      descripcion,
      tipo_programa_id,
      programa_plaga: plagas_ids ? { create: plagas_ids.map(id => ({ plaga_id: id })) } : undefined,
      programa_cultivo: cultivos_ids ? { create: cultivos_ids.map(id => ({ cultivo_id: id })) } : undefined,
      programa_animales: animales_ids ? { create: animales_ids.map(id => ({ animal_id: id })) } : undefined,
      programa_enfermedades: enfermedades_ids ? { create: enfermedades_ids.map(id => ({ enfermedad_id: id })) } : undefined,
    },
    include: {
      programa_plaga: true,
      programa_cultivo: true,
      programa_animales: true,
      programa_enfermedades: true,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Programas',
    payload_nuevo: programa,
  });

  res.status(201).json({
    status: 'success',
    data: programa,
  });
};

export const updatePrograma = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { nombre, descripcion, tipo_programa_id, plagas_ids, cultivos_ids, animales_ids, enfermedades_ids } = req.body;

  const existing = await tenantPrisma.programas.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Programa no encontrado' });
  }

  const updated = await tenantPrisma.programas.update({
    where: { id: Number(id) },
    data: {
      nombre,
      descripcion,
      tipo_programa_id,
      programa_plaga: plagas_ids ? {
        deleteMany: {},
        create: plagas_ids.map(id => ({ plaga_id: id }))
      } : undefined,
      programa_cultivo: cultivos_ids ? {
        deleteMany: {},
        create: cultivos_ids.map(id => ({ cultivo_id: id }))
      } : undefined,
      programa_animales: animales_ids ? {
        deleteMany: {},
        create: animales_ids.map(id => ({ animal_id: id }))
      } : undefined,
      programa_enfermedades: enfermedades_ids ? {
        deleteMany: {},
        create: enfermedades_ids.map(id => ({ enfermedad_id: id }))
      } : undefined,
    },
    include: {
      programa_plaga: true,
      programa_cultivo: true,
      programa_animales: true,
      programa_enfermedades: true,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Programas',
    payload_previo: existing,
    payload_nuevo: updated,
  });

  res.status(200).json({
    status: 'success',
    message: 'Programa actualizado exitosamente',
    data: updated,
  });
};

export const deletePrograma = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.programas.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Programa no encontrado' });
  }

  await tenantPrisma.programas.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Programas',
    payload_previo: toDelete,
  });

  res.status(200).json({
    status: 'success',
    message: 'Programa eliminado exitosamente',
  });
};

export const deleteManyProgramas = async (req, res) => {
  const tenantPrisma = req.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'Se requiere un arreglo de IDs' });
  }

  const numericIds = ids.map(id => Number(id));
  const itemsToDelete = await tenantPrisma.programas.findMany({ where: { id: { in: numericIds } } });

  await tenantPrisma.programas.deleteMany({ where: { id: { in: numericIds } } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR_MASIVO',
    modulo: 'Programas',
    payload_previo: itemsToDelete,
  });

  res.status(200).json({
    status: 'success',
    message: `Se eliminaron ${itemsToDelete.length} programas exitosamente.`,
    data: { deletedCount: itemsToDelete.length },
  });
};
