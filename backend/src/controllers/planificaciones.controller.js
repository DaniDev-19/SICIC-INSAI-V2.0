import bitacoraService from '../services/bitacora.service.js';

export const getPlanificaciones = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, fecha_programada, q } = req.query;

  const where = {
    AND: [
      status ? { status } : {},
      fecha_programada ? { fecha_programada: new Date(fecha_programada) } : {},
      q ? {
        OR: [
          { codigo: { contains: q, mode: 'insensitive' } },
          { actividad: { contains: q, mode: 'insensitive' } },
          { objetivo: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const [planificaciones, totalCount] = await Promise.all([
    tenantPrisma.planificaciones.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fecha_programada: 'desc' },
      include: {
        solicitudes: {
          include: {
            clientes: { select: { nombre: true } },
            propiedades: { select: { nombre: true } }
          }
        },
        vehiculos: { select: { placa: true, marca: true, modelo: true } },
        planificacion_empleados: {
          include: {
            empleados: { select: { id: true, nombre: true, apellido: true } }
          }
        }
      }
    }),
    tenantPrisma.planificaciones.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: planificaciones,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getPlanificacionById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const planificacion = await tenantPrisma.planificaciones.findUnique({
    where: { id: Number(id) },
    include: {
      solicitudes: {
        include: {
          clientes: true,
          propiedades: true,
          t_solicitud: true
        }
      },
      vehiculos: true,
      planificacion_empleados: {
        include: {
          empleados: true
        }
      },
      inspecciones: true,
      acta_silos: true
    }
  });

  if (!planificacion) {
    return res.status(404).json({ status: 'error', message: 'Planificación no encontrada' });
  }

  res.status(200).json({ status: 'success', data: planificacion });
};

export const createPlanificacion = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    codigo, fecha_programada, hora_inicio, hora_fin, prioridad,
    actividad, objetivo, convocatoria, punto_encuentro, ubicacion,
    aseguramiento, vehiculo_id, solicitud_id, status, empleados
  } = req.body;


  const existingPlan = await tenantPrisma.planificaciones.findUnique({ where: { solicitud_id } });
  if (existingPlan) {
    return res.status(400).json({ status: 'error', message: 'Esta solicitud ya tiene una planificación asociada.' });
  }

  let finalCodigo = codigo;
  if (!finalCodigo) {
    const lastRecord = await tenantPrisma.planificaciones.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextId = (lastRecord?.id || 0) + 1;
    finalCodigo = `PLAN-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
  }

  const response = await tenantPrisma.$transaction(async (tx) => {
    const plan = await tx.planificaciones.create({
      data: {
        codigo: finalCodigo,
        fecha_programada: new Date(fecha_programada),
        hora_inicio: hora_inicio ? new Date(`1970-01-01T${hora_inicio}`) : null,
        hora_fin: hora_fin ? new Date(`1970-01-01T${hora_fin}`) : null,
        prioridad: prioridad || 'MEDIA',
        actividad,
        objetivo,
        convocatoria,
        punto_encuentro,
        ubicacion,
        aseguramiento,
        vehiculo_id,
        solicitud_id,
        status: status || 'PENDIENTE',
        planificacion_empleados: {
          create: empleados.map(empId => ({ empleado_id: empId }))
        }
      }
    });

    await tx.solicitudes.update({
      where: { id: solicitud_id },
      data: { estatus: 'PLANIFICADA' }
    });

    return plan;
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Planificaciones',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updatePlanificacion = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { empleados, codigo, ...data } = req.body;

  const existing = await tenantPrisma.planificaciones.findUnique({
    where: { id: Number(id) },
    include: { solicitud_id: true }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Planificación no encontrada' });
  }

  if (data.fecha_programada) data.fecha_programada = new Date(data.fecha_programada);
  if (data.hora_inicio) data.hora_inicio = new Date(`1970-01-01T${data.hora_inicio}`);
  if (data.hora_fin) data.hora_fin = new Date(`1970-01-01T${data.hora_fin}`);

  const response = await tenantPrisma.$transaction(async (tx) => {

    const updated = await tx.planificaciones.update({
      where: { id: Number(id) },
      data: {
        ...data,
        planificacion_empleados: empleados ? {
          deleteMany: {},
          create: empleados.map(empId => ({ empleado_id: empId }))
        } : undefined
      }
    });

    if (data.status === 'INSPECCIONANDO') {
      await tx.solicitudes.update({
        where: { id: updated.solicitud_id },
        data: { estatus: 'INSPECCIONANDO' }
      });
    }

    return updated;
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Planificaciones',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deletePlanificacion = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.planificaciones.findUnique({
    where: { id: Number(id) },
    include: { inspecciones: true, acta_silos: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Planificación no encontrada' });
  }

  if (toDelete.inspecciones.length > 0 || toDelete.acta_silos.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar la planificación porque ya tiene inspecciones o actas asociadas.'
    });
  }

  await tenantPrisma.$transaction(async (tx) => {

    await tx.solicitudes.update({
      where: { id: toDelete.solicitud_id },
      data: { estatus: 'CREADA' }
    });

    await tx.planificaciones.delete({ where: { id: Number(id) } });
  });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Planificaciones',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Planificación eliminada y solicitud reseteada.' });
};
