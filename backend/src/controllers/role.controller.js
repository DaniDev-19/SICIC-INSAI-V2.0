import { masterPrisma } from '../config/prisma.js';
import bitacoraService from '../services/bitacora.service.js';

export const getRoles = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { search, status } = req.query;

  const where = {};
  
  if (search) {
    where.OR = [
      { nombre: { contains: search, mode: 'insensitive' } },
      { descripcion: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status !== undefined && status !== 'all') {
    where.status = status === 'true';
  }

  const [roles, totalCount] = await Promise.all([
    masterPrisma.roles.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
    }),
    masterPrisma.roles.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: roles,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getRoleById = async (req, res) => {
  const { id } = req.params;

  const role = await masterPrisma.roles.findUnique({
    where: { id: Number(id) },
  });

  if (!role) {
    return res.status(404).json({
      status: 'error',
      message: 'Rol no encontrado',
    });
  }

  res.status(200).json({
    status: 'success',
    data: role,
  });
};

export const createRole = async (req, res) => {
  const { nombre, descripcion, permisos } = req.body;

  const existingRole = await masterPrisma.roles.findUnique({
    where: { nombre },
  });

  if (existingRole) {
    return res.status(400).json({
      status: 'error',
      message: 'Ya existe un rol con este nombre',
    });
  }

  const role = await masterPrisma.roles.create({
    data: {
      nombre,
      descripcion,
      permisos: permisos || {},
      status: req.body.status !== undefined ? req.body.status : true,
    },
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Roles',
    payload_nuevo: role
  });

  res.status(201).json({
    status: 'success',
    message: 'Rol creado exitosamente',
    data: role,
  });
};

export const updateRole = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, permisos } = req.body;

  const existingRole = await masterPrisma.roles.findUnique({
    where: { id: Number(id) },
  });

  if (!existingRole) {
    return res.status(404).json({
      status: 'error',
      message: 'Rol no encontrado',
    });
  }

  if (nombre && nombre !== existingRole.nombre) {
    const nameDuplicate = await masterPrisma.roles.findUnique({
      where: { nombre },
    });
    if (nameDuplicate) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya existe otro rol con este nombre',
      });
    }
  }

  const updatedRole = await masterPrisma.roles.update({
    where: { id: Number(id) },
    data: {
      nombre,
      descripcion,
      permisos,
      status: req.body.status,
    },
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Roles',
    payload_previo: existingRole,
    payload_nuevo: updatedRole
  });

  res.status(200).json({
    status: 'success',
    message: 'Rol actualizado exitosamente',
    data: updatedRole,
  });
};

export const deleteRole = async (req, res) => {
  const { id } = req.params;

  const inUse = await masterPrisma.usuario_instancia.findFirst({
    where: { rol_id: Number(id) },
  });

  if (inUse) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar el rol porque está siendo utilizado por usuarios',
    });
  }

  const roleToDelete = await masterPrisma.roles.findUnique({
    where: { id: Number(id) },
  });

  await masterPrisma.roles.delete({
    where: { id: Number(id) },
  });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Roles',
    payload_previo: roleToDelete
  });

  res.status(200).json({
    status: 'success',
    message: 'Rol eliminado exitosamente',
  });
};

export const deleteManyRoles = async (req, res) => {
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
      message: 'No se pueden eliminar más de 50 registros a la vez por motivos de seguridad.',
    });
  }

  const inUseCheck = await masterPrisma.usuario_instancia.findMany({
    where: {
      rol_id: { in: ids },
    },
    select: {
      rol_id: true,
      roles: {
        select: { nombre: true },
      },
    },
  });

  const inUseIds = [...new Set(inUseCheck.map((item) => item.rol_id))];
  const inUseNames = [...new Set(inUseCheck.map((item) => item.roles.nombre))];
  const deletableIds = ids.filter((id) => !inUseIds.includes(id));

  let message = '';
  if (deletableIds.length > 0) {
    const rolesParaBorrar = await masterPrisma.roles.findMany({
      where: { id: { in: deletableIds } }
    });

    await masterPrisma.roles.deleteMany({
      where: {
        id: { in: deletableIds },
      },
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_MASIVO',
      modulo: 'Roles',
      payload_previo: rolesParaBorrar
    });

    message = `Se eliminaron ${deletableIds.length} roles correctamente.`;
  }

  if (inUseIds.length > 0) {
    message += ` No se pudieron eliminar los siguientes roles por estar en uso: ${inUseNames.join(', ')}.`;
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

export const updateRoleStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requiere el campo status',
    });
  }

  const role = await masterPrisma.roles.findUnique({
    where: { id: Number(id) },
  });

  if (!role) {
    return res.status(404).json({
      status: 'error',
      message: 'Rol no encontrado',
    });
  }

  if (status === false) {
    const currentUserInfo = await masterPrisma.usuario_instancia.findFirst({
      where: {
        usuario_id: req.user.id,
        instancia_id: req.user.currentInstance.id,
      },
    });

    if (currentUserInfo && currentUserInfo.rol_id === Number(id)) {
      return res.status(400).json({
        status: 'error',
        message: 'No puedes desactivar tu propio rol actual por motivos de seguridad.',
      });
    }

    const inUse = await masterPrisma.usuario_instancia.findFirst({
      where: { rol_id: Number(id) },
    });

    if (inUse) {
      return res.status(400).json({
        status: 'error',
        message: 'No se puede desactivar un rol que está siendo utilizado por uno o más usuarios.',
      });
    }
  }

  const updatedRole = await masterPrisma.roles.update({
    where: { id: Number(id) },
    data: { status },
  });

  res.status(200).json({
    status: 'success',
    message: `Rol ${status ? 'activado' : 'desactivado'} exitosamente`,
    data: updatedRole,
  });
};
