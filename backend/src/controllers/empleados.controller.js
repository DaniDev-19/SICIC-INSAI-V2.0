import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import excelService from '../services/excel.service.js';

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

  let finalFotoUrl = foto_url;
  if (req.file) {
    finalFotoUrl = await storageService.uploadImage(req.file.buffer, `${nombre}-${apellido}`, 'empleados');
  }

  const response = await tenantPrisma.empleados.create({
    data: {
      cedula, nombre, apellido, telefono, email,
      fechas_ingreso: fechas_ingreso ? new Date(fechas_ingreso) : null,
      status_laboral, contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
      empleado_foto: finalFotoUrl ? { create: { foto_url: finalFotoUrl } } : undefined,
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

  let finalFotoUrl = foto_url;
  if (req.file) {
    finalFotoUrl = await storageService.uploadImage(req.file.buffer, `${nombre || existing.nombre}-${apellido || existing.apellido}`, 'empleados');

    const oldFoto = await tenantPrisma.empleado_foto.findFirst({
      where: { empleado_id: Number(id) },
      orderBy: { created_at: 'desc' }
    });

    if (oldFoto) {
      await storageService.deleteFile(oldFoto.foto_url);
    }
  }

  const response = await tenantPrisma.empleados.update({
    where: { id: Number(id) },
    data: {
      cedula, nombre, apellido, telefono, email,
      fechas_ingreso: fechas_ingreso ? new Date(fechas_ingreso) : undefined,
      status_laboral, contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
      empleado_foto: finalFotoUrl ? { create: { foto_url: finalFotoUrl } } : undefined, // Agregamos una nueva foto si viene
      empleado_residencia: residencia ? {
        deleteMany: {},
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

  const inUse = await tenantPrisma.planificacion_empleados.findFirst({ where: { empleado_id: Number(id) } });
  if (inUse) {
    return res.status(400).json({ status: 'error', message: 'No se puede eliminar el empleado porque está asignado a planificaciones activas' });
  }

  const fotos = await tenantPrisma.empleado_foto.findMany({
    where: { empleado_id: Number(id) }
  });

  await tenantPrisma.empleados.delete({ where: { id: Number(id) } });

  for (const foto of fotos) {
    await storageService.deleteFile(foto.foto_url);
  }

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Empleados',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Empleado eliminado exitosamente' });
};

export const exportEmpleados = async (req, res) => {
  const tenantPrisma = req.db;

  const empleados = await tenantPrisma.empleados.findMany({
    include: {
      departamentos: { select: { nombre: true } },
      cargos: { select: { nombre: true } },
      oficinas: { select: { nombre: true } }
    },
    orderBy: { apellido: 'asc' }
  });

  const data = empleados.map(e => ({
    cedula: e.cedula,
    nombre_completo: `${e.nombre} ${e.apellido}`,
    email: e.email || 'N/A',
    telefono: e.telefono || 'N/A',
    departamento: e.departamentos?.nombre || 'N/A',
    cargo: e.cargos?.nombre || 'N/A',
    oficina: e.oficinas?.nombre || 'N/A',
    status: e.status_laboral
  }));

  const buffer = await excelService.generate({
    title: 'Reporte Nacional de Empleados - INSAI',
    columns: [
      { header: 'Cédula', key: 'cedula', width: 15 },
      { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Oficina', key: 'oficina', width: 25 },
      { header: 'Estatus', key: 'status', width: 15 },
    ],
    data,
    sheetName: 'Empleados'
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_empleados.xlsx');

  bitacoraService.registrar({
    req,
    accion: 'EXPORTAR_EXCEL',
    modulo: 'Empleados',
    payload_nuevo: { registros_exportados: data.length }
  });

  res.send(buffer);
};
