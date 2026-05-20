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
    medio_recepcion, tipo_solicitud_id, solicitante_id, atendido_por_id, propiedad_id,
    planificacion
  } = req.body;

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      if (codigo) {
        const existing = await tx.solicitudes.findUnique({ where: { codigo } });
        if (existing) {
          const error = new Error('Ya existe una solicitud con este código');
          error.statusCode = 400;
          throw error;
        }
      }

      let finalCodigo = codigo;
      if (!finalCodigo) {
        const lastRecord = await tx.solicitudes.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        });
        const nextId = (lastRecord?.id || 0) + 1;
        finalCodigo = `SOL-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
      }

      const nuevaSolicitud = await tx.solicitudes.create({
        data: {
          codigo: finalCodigo,
          descripcion,
          fecha_resolucion: fecha_resolucion ? new Date(fecha_resolucion) : null,
          estatus: planificacion ? 'PLANIFICADA' : (estatus || 'CREADA'),
          prioridad: prioridad || 'MEDIA',
          medio_recepcion: medio_recepcion || 'PRESENCIAL',
          tipo_solicitud_id,
          solicitante_id,
          atendido_por_id: atendido_por_id || null,
          propiedad_id
        }
      });

      if (planificacion) {
        const lastPlan = await tx.planificaciones.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        });
        const nextPlanId = (lastPlan?.id || 0) + 1;
        const planCodigo = `PLA-${new Date().getFullYear()}-${nextPlanId.toString().padStart(4, '0')}`;

        const horaInicio = planificacion.hora_inicio ? new Date(`1970-01-01T${planificacion.hora_inicio}:00.000Z`) : null;
        const horaFin = planificacion.hora_fin ? new Date(`1970-01-01T${planificacion.hora_fin}:00.000Z`) : null;

        const nuevaPlanificacion = await tx.planificaciones.create({
          data: {
            codigo: planCodigo,
            solicitud_id: nuevaSolicitud.id,
            fecha_programada: new Date(planificacion.fecha_programada),
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            prioridad: planificacion.prioridad || prioridad || 'MEDIA',
            actividad: planificacion.actividad,
            objetivo: planificacion.objetivo,
            convocatoria: planificacion.convocatoria,
            punto_encuentro: planificacion.punto_encuentro,
            ubicacion: planificacion.ubicacion,
            aseguramiento: planificacion.aseguramiento,
            vehiculo_id: planificacion.vehiculo_id || null,
            status: 'PENDIENTE',
            planificacion_empleados: planificacion.empleados?.length > 0 ? {
              create: planificacion.empleados.map(empId => ({
                empleado_id: empId
              }))
            } : undefined
          }
        });
        nuevaSolicitud.planificacion = nuevaPlanificacion;
      }

      if (propiedad_id) {
        await tx.propiedades.update({
          where: { id: propiedad_id },
          data: { status: 'SOLICITUD_EN_PROCESO' }
        });
      }

      return nuevaSolicitud;
    }, {
      isolationLevel: 'Serializable'
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Solicitudes',
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


export const updateSolicitud = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { codigo, ...data } = req.body;

  try {
    const { response, existing } = await tenantPrisma.$transaction(async (tx) => {
      const existing = await tx.solicitudes.findUnique({ where: { id: Number(id) } });
      if (!existing) {
        const error = new Error('Solicitud no encontrada');
        error.statusCode = 404;
        throw error;
      }

      if (data.fecha_resolucion) data.fecha_resolucion = new Date(data.fecha_resolucion);

      const updated = await tx.solicitudes.update({
        where: { id: Number(id) },
        data,
      });

      // Update property status based on solicitud estatus
      if (data.estatus && existing.propiedad_id) {
        const isFinalState = ['FINALIZADA', 'RECHAZADA', 'CANCELADA'].includes(data.estatus.toUpperCase());
        await tx.propiedades.update({
          where: { id: existing.propiedad_id },
          data: { status: isFinalState ? 'ACTIVA' : 'EN_PROCESO_INSPECCION' }
        });
      }

      return { response: updated, existing };
    });

    bitacoraService.registrar({
      req,
      accion: 'ACTUALIZAR',
      modulo: 'Solicitudes',
      payload_previo: existing,
      payload_nuevo: response
    });

    res.status(200).json({ status: 'success', data: response });
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ status: 'error', message: error.message });
    }
    console.error('Error actualizando solicitud:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

export const deleteSolicitud = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  try {
    const toDelete = await tenantPrisma.$transaction(async (tx) => {
      const existing = await tx.solicitudes.findUnique({
        where: { id: Number(id) },
        include: { planificaciones: true }
      });

      if (!existing) {
        const error = new Error('Solicitud no encontrada');
        error.statusCode = 404;
        throw error;
      }

      if (existing.planificaciones) {
        const error = new Error('No se puede eliminar la solicitud porque ya tiene una planificación asociada. Elimine la planificación primero.');
        error.statusCode = 400;
        throw error;
      }

      await tx.solicitudes.delete({ where: { id: Number(id) } });

      if (existing.propiedad_id) {
        await tx.propiedades.update({
          where: { id: existing.propiedad_id },
          data: { status: 'ACTIVA' }
        });
      }

      return existing;
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR',
      modulo: 'Solicitudes',
      payload_previo: toDelete
    });

    res.status(200).json({ status: 'success', message: 'Solicitud eliminada exitosamente' });
  } catch (error) {
    if (error.statusCode === 404 || error.statusCode === 400) {
      return res.status(error.statusCode).json({ status: 'error', message: error.message });
    }
    console.error('Error eliminando solicitud:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
};

export const deleteManySolicitudes = async (req, res) => {
  const tenantPrisma = req.db;
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: 'Se requiere un arreglo de IDs no vacío para el borrado masivo',
    });
  }

  if (ids.length >= 50) {
    return res.status(400).json({
      status: 'error',
      message: 'No se pueden eliminar más de 50 registros a la vez por motivos de seguridad',
    });
  }

  const numericIds = ids.map(id => Number(id));

  const toDelete = await tenantPrisma.solicitudes.findMany({
    where: { id: { in: numericIds } },
    include: { planificaciones: true }
  });

  const withPlanificaciones = toDelete.filter(s => s.planificaciones);
  const deletableIds = numericIds.filter(id => !withPlanificaciones.some(s => s.id === id));

  if (deletableIds.length > 0) {
    const deletedSolicitudes = toDelete.filter(s => deletableIds.includes(s.id));
    const propIdsToRestore = deletedSolicitudes.map(s => s.propiedad_id).filter(Boolean);

    await tenantPrisma.$transaction(async (tx) => {
      await tx.solicitudes.deleteMany({
        where: { id: { in: deletableIds } },
      });

      if (propIdsToRestore.length > 0) {
        await tx.propiedades.updateMany({
          where: { id: { in: propIdsToRestore } },
          data: { status: 'ACTIVA' }
        });
      }
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_MASIVO',
      modulo: 'Solicitudes',
      payload_previo: deletedSolicitudes
    });
  }

  if (withPlanificaciones.length > 0) {
    return res.status(200).json({
      status: 'warning',
      message: `Se eliminaron ${deletableIds.length} solicitudes. ${withPlanificaciones.length} no se pudieron eliminar por tener planificaciones asociadas.`,
      data: {
        deletedCount: deletableIds.length,
        skippedCount: withPlanificaciones.length
      }
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Se eliminaron ${deletableIds.length} solicitudes exitosamente.`,
    data: { deletedCount: deletableIds.length }
  });
};
