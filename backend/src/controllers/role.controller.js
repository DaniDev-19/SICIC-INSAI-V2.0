import { masterPrisma } from '../config/prisma.js';


export const getRoles = async (req, res) => {
  const roles = await masterPrisma.roles.findMany({
    orderBy: { nombre: 'asc' },
  });

  res.status(200).json({
    status: 'success',
    data: roles,
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

  // Verificar si ya existe un rol con ese nombre
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

  await masterPrisma.roles.delete({
    where: { id: Number(id) },
  });

  res.status(200).json({
    status: 'success',
    message: 'Rol eliminado exitosamente',
  });
};
