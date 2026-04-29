import bitacoraService from '../services/bitacora.service.js';

export const getEmpleados = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { q, departamento_id, status_laboral } = req.query;

  const where = {
    AND: [
      departamento_id ? { departamento_id: Number(departamento_id) } : {},
      status_laboral ? { status_laboral } : {},
      q ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
          { cedula: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const [empleados, totalCount] = await Promise.all([
    tenantPrisma.empleados.findMany({
      where,
      skip,
      take: limit,
      orderBy: { apellido: 'asc' },
      include: {
        cargos: { select: { nombre: true } },
        departamentos: { select: { nombre: true } },
        profesiones: { select: { nombre: true } },
        oficinas: { select: { nombre: true } },
        contrato: { select: { nombre: true } },
        empleado_foto: { select: { foto_url: true }, take: 1, orderBy: { created_at: 'desc' } },
      }
    }),
    tenantPrisma.empleados.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: empleados,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getEmpleadoById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const empleado = await tenantPrisma.empleados.findUnique({
    where: { id: Number(id) },
    include: {
      cargos: true,
      departamentos: true,
      profesiones: true,
      oficinas: true,
      contrato: true,
      empleado_foto: { orderBy: { created_at: 'desc' } },
      empleado_residencia: { include: { sectores: true } },
      empleados_programas: { include: { programas: true } },
    }
  });

  if (!empleado) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  res.status(200).json({ status: 'success', data: empleado });
};

export const createEmpleado = async (req, res) => {
  const tenantPrisma = req.db;
  const { 
    cedula, nombre, apellido, telefono, email, fechas_ingreso, status_laboral,
    contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
    foto_url, residencia, programas_ids 
  } = req.body;

  const existing = await tenantPrisma.empleados.findUnique({ where: { cedula } });
  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Ya existe un empleado con esta cédula' });
  }

  const response = await tenantPrisma.empleados.create({
    data: {
      cedula, nombre, apellido, telefono, email, 
      fechas_ingreso: fechas_ingreso ? new Date(fechas_ingreso) : null,
      status_laboral, contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
      empleado_foto: foto_url ? { create: { foto_url } } : undefined,
      empleado_residencia: residencia ? { create: residencia } : undefined,
      empleados_programas: programas_ids ? { 
        create: programas_ids.map(id => ({ programa_id: id })) 
      } : undefined,
    },
    include: {
      empleado_foto: true,
      empleado_residencia: true,
      empleados_programas: true,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Empleados',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updateEmpleado = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { 
    cedula, nombre, apellido, telefono, email, fechas_ingreso, status_laboral,
    contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
    foto_url, residencia, programas_ids 
  } = req.body;

  const existing = await tenantPrisma.empleados.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  if (cedula && cedula !== existing.cedula) {
    const duplicate = await tenantPrisma.empleados.findUnique({ where: { cedula } });
    if (duplicate) {
      return res.status(400).json({ status: 'error', message: 'La cédula ya está registrada por otro empleado' });
    }
  }

  const response = await tenantPrisma.empleados.update({
    where: { id: Number(id) },
    data: {
      cedula, nombre, apellido, telefono, email,
      fechas_ingreso: fechas_ingreso ? new Date(fechas_ingreso) : undefined,
      status_laboral, contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
      empleado_foto: foto_url ? { create: { foto_url } } : undefined, // Agregamos una nueva foto si viene
      empleado_residencia: residencia ? {
        deleteMany: {}, // Simplificamos borrando las anteriores (asumiendo flujo de una residencia principal)
        create: residencia
      } : undefined,
      empleados_programas: programas_ids ? {
        deleteMany: {},
        create: programas_ids.map(pid => ({ programa_id: pid }))
      } : undefined,
    },
    include: {
      empleado_foto: true,
      empleado_residencia: true,
      empleados_programas: true,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Empleados',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteEmpleado = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.empleados.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  // Verificar si tiene planificaciones o bitácora asociada si es necesario
  const inUse = await tenantPrisma.planificacion_empleados.findFirst({ where: { empleado_id: Number(id) } });
  if (inUse) {
     return res.status(400).json({ status: 'error', message: 'No se puede eliminar el empleado porque está asignado a planificaciones activas' });
  }

  await tenantPrisma.empleados.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Empleados',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Empleado eliminado exitosamente' });
};
