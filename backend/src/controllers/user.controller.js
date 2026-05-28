import { masterPrisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import bitacoraService from '../services/bitacora.service.js';

const usuarioInstanciaWhere = (usuario_id, instancia_id) => ({
  usuario_id_instancia_id: {
    usuario_id: Number(usuario_id),
    instancia_id: Number(instancia_id),
  },
});

export const getUsers = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, status } = req.query;

  const where = {};

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status !== undefined && status !== 'all') {
    where.status = status === 'true';
  }

  const [users, totalCount] = await Promise.all([
    masterPrisma.usuarios.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        created_at: true,
        usuario_instancia: {
          include: {
            instancias: { select: { id: true, nombre_mostrable: true } },
            roles: { select: { id: true, nombre: true } },
          },
        },
      },
    }),
    masterPrisma.usuarios.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: users,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getUserById = async (req, res) => {
  const { id } = req.params;

  const user = await masterPrisma.usuarios.findUnique({
    where: { id: Number(id) },
    include: {
      usuario_instancia: {
        include: {
          instancias: true,
          roles: true,
        },
      },
    },
  });

  if (!user) {
    return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
  }

  const { password_hash, ...userWithoutPassword } = user;
  res.status(200).json({ status: 'success', data: userWithoutPassword });
};

export const createUser = async (req, res) => {
  const { username, email, password, status, initial_assignment } = req.body;

  const existing = await masterPrisma.usuarios.findFirst({
    where: { OR: [{ email }, { username }] },
  });

  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Email o nombre de usuario ya en uso' });
  }

  if (initial_assignment) {
    const [instancia, rol] = await Promise.all([
      masterPrisma.instancias.findUnique({ where: { id: Number(initial_assignment.instancia_id) } }),
      masterPrisma.roles.findUnique({ where: { id: Number(initial_assignment.rol_id) } }),
    ]);

    if (!instancia) {
      return res.status(404).json({ status: 'error', message: 'Instancia no encontrada' });
    }

    if (!instancia.status) {
      return res.status(400).json({ status: 'error', message: 'La instancia está inactiva' });
    }

    if (!rol) {
      return res.status(404).json({ status: 'error', message: 'Rol no encontrado' });
    }

    if (!rol.status) {
      return res.status(400).json({ status: 'error', message: 'El rol está inactivo' });
    }
  }

  const password_hash = await bcrypt.hash(password, 10);

  const user = await masterPrisma.$transaction(async (tx) => {
    const created = await tx.usuarios.create({
      data: { username, email, password_hash, status: status ?? true },
    });

    if (initial_assignment) {
      await tx.usuario_instancia.create({
        data: {
          usuario_id: created.id,
          instancia_id: Number(initial_assignment.instancia_id),
          rol_id: Number(initial_assignment.rol_id),
        },
      });
    }

    return created;
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Usuarios Master',
    payload_nuevo: {
      id: user.id,
      username,
      email,
      ...(initial_assignment ? { initial_assignment } : {}),
    },
  });

  const { password_hash: _, ...userWithoutPassword } = user;
  res.status(201).json({ status: 'success', data: userWithoutPassword });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, status } = req.body;

  const existing = await masterPrisma.usuarios.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
  }

  if (username || email) {
    const duplicate = await masterPrisma.usuarios.findFirst({
      where: {
        id: { not: Number(id) },
        OR: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
      },
    });

    if (duplicate) {
      return res.status(400).json({ status: 'error', message: 'Email o nombre de usuario ya en uso' });
    }
  }

  const data = {};
  if (username !== undefined) data.username = username;
  if (email !== undefined) data.email = email;
  if (status !== undefined) data.status = status;
  if (password) data.password_hash = await bcrypt.hash(password, 10);

  const updated = await masterPrisma.usuarios.update({
    where: { id: Number(id) },
    data,
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Usuarios Master',
    payload_nuevo: { id: updated.id, username: updated.username, email: updated.email },
  });

  const { password_hash: _, ...userWithoutPassword } = updated;
  res.status(200).json({ status: 'success', data: userWithoutPassword });
};

export const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await masterPrisma.usuarios.update({
    where: { id: Number(id) },
    data: { status },
  });

  bitacoraService.registrar({
    req,
    accion: status ? 'ACTIVAR' : 'DESACTIVAR',
    modulo: 'Usuarios Master',
    payload_nuevo: { id: updated.id, status },
  });

  const { password_hash: _, ...userWithoutPassword } = updated;
  res.status(200).json({ status: 'success', data: userWithoutPassword });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  const existing = await masterPrisma.usuarios.findUnique({
    where: { id: Number(id) },
    select: { id: true, username: true, email: true },
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
  }

  await masterPrisma.usuarios.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Usuarios Master',
    payload_previo: existing,
  });

  res.status(200).json({ status: 'success', message: 'Usuario eliminado' });
};

export const assignInstance = async (req, res) => {
  const { id: usuario_id } = req.params;
  const { instancia_id, rol_id, permisos_personalizados } = req.body;

  const usuario = await masterPrisma.usuarios.findUnique({
    where: { id: Number(usuario_id) },
    select: { id: true },
  });

  if (!usuario) {
    return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
  }

  const [instancia, rol] = await Promise.all([
    masterPrisma.instancias.findUnique({ where: { id: Number(instancia_id) } }),
    masterPrisma.roles.findUnique({ where: { id: Number(rol_id) } }),
  ]);

  if (!instancia) {
    return res.status(404).json({ status: 'error', message: 'Instancia no encontrada' });
  }

  if (!instancia.status) {
    return res.status(400).json({ status: 'error', message: 'La instancia está inactiva' });
  }

  if (!rol) {
    return res.status(404).json({ status: 'error', message: 'Rol no encontrado' });
  }

  if (!rol.status) {
    return res.status(400).json({ status: 'error', message: 'El rol está inactivo' });
  }

  const assignment = await masterPrisma.usuario_instancia.upsert({
    where: usuarioInstanciaWhere(usuario_id, instancia_id),
    update: { rol_id: Number(rol_id), permisos_personalizados: permisos_personalizados ?? null },
    create: {
      usuario_id: Number(usuario_id),
      instancia_id: Number(instancia_id),
      rol_id: Number(rol_id),
      permisos_personalizados: permisos_personalizados ?? null,
    },
    include: {
      instancias: { select: { id: true, nombre_mostrable: true, db_name: true } },
      roles: { select: { id: true, nombre: true } },
    },
  });

  bitacoraService.registrar({
    req,
    accion: 'ASIGNAR_INSTANCIA',
    modulo: 'Usuarios Master',
    payload_nuevo: {
      usuario_id: Number(usuario_id),
      instancia_id: Number(instancia_id),
      rol_id: Number(rol_id),
    },
  });

  res.status(200).json({ status: 'success', data: assignment });
};

export const removeInstance = async (req, res) => {
  const { id: usuario_id, instancia_id } = req.params;

  const existing = await masterPrisma.usuario_instancia.findUnique({
    where: usuarioInstanciaWhere(usuario_id, instancia_id),
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Asignación no encontrada' });
  }

  await masterPrisma.usuario_instancia.delete({
    where: usuarioInstanciaWhere(usuario_id, instancia_id),
  });

  bitacoraService.registrar({
    req,
    accion: 'REMOVER_INSTANCIA',
    modulo: 'Usuarios Master',
    payload_previo: {
      usuario_id: Number(usuario_id),
      instancia_id: Number(instancia_id),
    },
  });

  res.status(200).json({ status: 'success', message: 'Acceso a instancia removido' });
};
