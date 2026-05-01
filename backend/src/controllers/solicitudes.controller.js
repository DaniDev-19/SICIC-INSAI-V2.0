import bitacoraService from '../services/bitacora.service.js';

export const getSolicitudes = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { estatus, prioridad, solicitante_id, propiedad_id, q } = req.query;

  const where = {
    AND: [
      estatus ? { estatus } : {},
      prioridad ? { prioridad } : {},
      solicitante_id ? { solicitante_id: Number(solicitante_id) } : {},
      propiedad_id ? { propiedad_id: Number(propiedad_id) } : {},
      q ? {
        OR: [
          { codigo: { contains: q, mode: 'insensitive' } },
          { descripcion: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const [solicitudes, totalCount] = await Promise.all([
    tenantPrisma.solicitudes.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        clientes: { select: { id: true, nombre: true, cedula_rif: true } },
        propiedades: { select: { id: true, nombre: true, codigo_insai: true } },
        t_solicitud: { select: { id: true, nombre: true } },
        empleados: { select: { id: true, nombre: true, apellido: true } },
      }
    }),
    tenantPrisma.solicitudes.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: solicitudes,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getSolicitudById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const solicitud = await tenantPrisma.solicitudes.findUnique({
    where: { id: Number(id) },
    include: {
      clientes: true,
      propiedades: {
        include: {
          t_propiedad: true,
          propiedad_ubicacion: { include: { sectores: true } }
        }
      },
      t_solicitud: true,
      empleados: true,
      planificaciones: {
        include: {
          planificacion_empleados: { include: { empleados: true } },
          vehiculos: true
        }
      }
    }
  });

  if (!solicitud) {
    return res.status(404).json({ status: 'error', message: 'Solicitud no encontrada' });
  }

  res.status(200).json({ status: 'success', data: solicitud });
};

export const createSolicitud = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    codigo, descripcion, fecha_resolucion, estatus, prioridad,
    medio_recepcion, tipo_solicitud_id, solicitante_id, atendido_por_id, propiedad_id
  } = req.body;

  let finalCodigo = codigo;
  if (!finalCodigo) {
    const lastRecord = await tenantPrisma.solicitudes.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextId = (lastRecord?.id || 0) + 1;
    finalCodigo = `SOL-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
  }

  const response = await tenantPrisma.solicitudes.create({
    data: {
      codigo: finalCodigo,
      descripcion,
      fecha_resolucion: fecha_resolucion ? new Date(fecha_resolucion) : null,
      estatus: estatus || 'CREADA',
      prioridad: prioridad || 'MEDIA',
      medio_recepcion: medio_recepcion || 'PRESENCIAL',
      tipo_solicitud_id,
      solicitante_id,
      atendido_por_id: atendido_por_id || null,
      propiedad_id
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Solicitudes',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updateSolicitud = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { codigo, ...data } = req.body;

  const existing = await tenantPrisma.solicitudes.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Solicitud no encontrada' });
  }

  if (data.fecha_resolucion) data.fecha_resolucion = new Date(data.fecha_resolucion);

  const response = await tenantPrisma.solicitudes.update({
    where: { id: Number(id) },
    data,
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Solicitudes',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteSolicitud = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.solicitudes.findUnique({
    where: { id: Number(id) },
    include: { planificaciones: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Solicitud no encontrada' });
  }

  if (toDelete.planificaciones) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar la solicitud porque ya tiene una planificación asociada. Elimine la planificación primero.'
    });
  }

  await tenantPrisma.solicitudes.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Solicitudes',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Solicitud eliminada exitosamente' });
};
