import { masterPrisma } from '../config/prisma.js';
import bitacoraService from '../services/bitacora.service.js';

export const getInstances = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, status } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { nombre_mostrable: { contains: search, mode: 'insensitive' } },
      { db_name: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status !== undefined && status !== 'all') {
    where.status = status === 'true';
  }

  const [instances, totalCount] = await Promise.all([
    masterPrisma.instancias.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { usuario_instancia: true } },
      },
    }),
    masterPrisma.instancias.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: instances,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getInstanceById = async (req, res) => {
  const { id } = req.params;

  const instance = await masterPrisma.instancias.findUnique({
    where: { id: Number(id) },
    include: {
      usuario_instancia: {
        include: {
          usuarios: { select: { id: true, username: true, email: true, status: true } },
          roles: { select: { id: true, nombre: true } },
        },
      },
      _count: { select: { usuario_instancia: true } },
    },
  });

  if (!instance) {
    return res.status(404).json({ status: 'error', message: 'Instancia no encontrada' });
  }

  res.status(200).json({ status: 'success', data: instance });
};

export const createInstance = async (req, res) => {
  const { nombre_mostrable, db_name, status } = req.body;

  const existing = await masterPrisma.instancias.findUnique({ where: { db_name } });

  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Nombre de base de datos ya registrado' });
  }

  const instance = await masterPrisma.instancias.create({
    data: { nombre_mostrable, db_name, status: status ?? true },
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Instancias Master',
    payload_nuevo: instance,
  });

  res.status(201).json({ status: 'success', data: instance });
};

export const updateInstance = async (req, res) => {
  const { id } = req.params;
  const { nombre_mostrable, db_name, status } = req.body;

  const existing = await masterPrisma.instancias.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Instancia no encontrada' });
  }

  if (db_name && db_name !== existing.db_name) {
    return res.status(400).json({
      status: 'error',
      message: 'El nombre de la base de datos no puede modificarse',
    });
  }

  const data = {};
  if (nombre_mostrable !== undefined) data.nombre_mostrable = nombre_mostrable;
  if (status !== undefined) data.status = status;

  const updated = await masterPrisma.instancias.update({
    where: { id: Number(id) },
    data,
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Instancias Master',
    payload_nuevo: updated,
  });

  res.status(200).json({ status: 'success', data: updated });
};

export const updateInstanceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await masterPrisma.instancias.update({
    where: { id: Number(id) },
    data: { status },
  });

  bitacoraService.registrar({
    req,
    accion: status ? 'ACTIVAR' : 'DESACTIVAR',
    modulo: 'Instancias Master',
    payload_nuevo: { id: updated.id, status },
  });

  res.status(200).json({ status: 'success', data: updated });
};

export const deleteInstance = async (req, res) => {
  const { id } = req.params;

  const existing = await masterPrisma.instancias.findUnique({
    where: { id: Number(id) },
    include: { _count: { select: { usuario_instancia: true } } },
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Instancia no encontrada' });
  }

  if (existing._count.usuario_instancia > 0) {
    return res.status(400).json({
      status: 'error',
      message: `No se puede eliminar: ${existing._count.usuario_instancia} usuario(s) vinculado(s). Remueva las asignaciones primero.`,
    });
  }

  await masterPrisma.instancias.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Instancias Master',
    payload_previo: existing,
  });

  res.status(200).json({ status: 'success', message: 'Instancia eliminada' });
};
