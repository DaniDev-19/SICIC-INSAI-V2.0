import bitacoraService from '../services/bitacora.service.js';
import excelService from '../services/excel.service.js';

const parseTimeInput = (timeStr) => {
  if (!timeStr) return null;
  if (typeof timeStr !== 'string') return new Date(timeStr);
  if (timeStr.includes('T') || timeStr.includes('Z')) {
    return new Date(timeStr);
  }
  const parts = timeStr.split(':');
  const hh = parts[0].padStart(2, '0');
  const mm = (parts[1] || '00').padStart(2, '0');
  return new Date(`1970-01-01T${hh}:${mm}:00.000Z`);
};

export const getPlanificaciones = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, fecha_programada, q } = req.query;
  const { currentInstance } = req.user || {};
  const { rol, empleado_id } = currentInstance || {};

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

  if (rol === 'INSPECTOR' && empleado_id) {
    where.AND.push({
      planificacion_empleados: {
        some: {
          empleado_id: Number(empleado_id)
        }
      }
    });
  }

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
          empleados: {
            select: {
              id: true,
              cedula: true,
              nombre: true,
              apellido: true,
              telefono: true,
              email: true,
              status_laboral: true,
              cargo_id: true,
              oficina_id: true
            }
          }
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

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      const existingPlan = await tx.planificaciones.findUnique({ where: { solicitud_id } });
      if (existingPlan) {
        const error = new Error('Esta solicitud ya tiene una planificación asociada.');
        error.statusCode = 400;
        throw error;
      }

      if (codigo) {
        const existingByCode = await tx.planificaciones.findUnique({ where: { codigo } });
        if (existingByCode) {
          const error = new Error('Ya existe una planificación con ese código.');
          error.statusCode = 400;
          throw error;
        }
      }

      let finalCodigo = codigo;
      if (!finalCodigo) {
        const lastRecord = await tx.planificaciones.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        });
        const nextId = (lastRecord?.id || 0) + 1;
        finalCodigo = `PLAN-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
      }

      const plan = await tx.planificaciones.create({
        data: {
          codigo: finalCodigo,
          fecha_programada: new Date(fecha_programada),
          hora_inicio: parseTimeInput(hora_inicio),
          hora_fin: parseTimeInput(hora_fin),
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
    }, {
      isolationLevel: 'Serializable'
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Planificaciones',
      payload_nuevo: response
    });

    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    throw error;
  }
};


export const updatePlanificacion = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { empleados, codigo, ...data } = req.body;

  const existing = await tenantPrisma.planificaciones.findUnique({
    where: { id: Number(id) }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Planificación no encontrada' });
  }

  if (data.fecha_programada) data.fecha_programada = new Date(data.fecha_programada);
  if (data.hora_inicio) data.hora_inicio = parseTimeInput(data.hora_inicio);
  if (data.hora_fin) data.hora_fin = parseTimeInput(data.hora_fin);

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

export const exportPlanificaciones = async (req, res) => {
  const tenantPrisma = req.db;
  const { currentInstance } = req.user || {};
  const { rol, empleado_id } = currentInstance || {};

  const where = {};

  if (rol === 'INSPECTOR' && empleado_id) {
    where.planificacion_empleados = {
      some: {
        empleado_id: Number(empleado_id)
      }
    };
  }

  const planificaciones = await tenantPrisma.planificaciones.findMany({
    where,
    include: {
      solicitudes: {
        include: {
          clientes: { select: { nombre: true } },
          propiedades: { select: { nombre: true, codigo_insai: true } }
        }
      },
      planificacion_empleados: {
        include: {
          empleados: { select: { nombre: true } }
        }
      }
    },
    orderBy: { fecha_programada: 'desc' }
  });

  const data = planificaciones.map(p => ({
    codigo: p.codigo,
    actividad: p.actividad,
    fecha: p.fecha_programada ? new Date(p.fecha_programada).toLocaleDateString() : 'N/A',
    hora_inicio: p.hora_inicio ? new Date(p.hora_inicio).toISOString().substring(11, 16) : 'N/A',
    hora_fin: p.hora_fin ? new Date(p.hora_fin).toISOString().substring(11, 16) : 'N/A',
    prioridad: p.prioridad,
    status: p.status,
    solicitud: p.solicitudes?.codigo || 'N/A',
    solicitante: p.solicitudes?.clientes?.nombre || 'N/A',
    propiedad: p.solicitudes?.propiedades?.nombre || 'N/A',
    insai: p.solicitudes?.propiedades?.codigo_insai || 'N/A',
    tecnicos: p.planificacion_empleados?.map(pe => pe.empleados?.nombre).filter(Boolean).join(', ') || 'Sin asignar'
  }));

  const buffer = await excelService.generate({
    title: 'Reporte de Planificaciones de Visitas e Inspecciones - INSAI',
    columns: [
      { header: 'Código Planif.', key: 'codigo', width: 15 },
      { header: 'Actividad / Inspección', key: 'actividad', width: 35 },
      { header: 'Fecha Visita', key: 'fecha', width: 15 },
      { header: 'Hora Inicio', key: 'hora_inicio', width: 12 },
      { header: 'Hora Fin', key: 'hora_fin', width: 12 },
      { header: 'Prioridad', key: 'prioridad', width: 12 },
      { header: 'Estatus', key: 'status', width: 15 },
      { header: 'Trámite Asoc.', key: 'solicitud', width: 15 },
      { header: 'Productor', key: 'solicitante', width: 30 },
      { header: 'Predio Rural', key: 'propiedad', width: 30 },
      { header: 'Código INSAI Predio', key: 'insai', width: 20 },
      { header: 'Inspectores Asignados', key: 'tecnicos', width: 40 },
    ],
    data,
    sheetName: 'Planificaciones'
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_planificaciones.xlsx');
  res.send(buffer);
};
