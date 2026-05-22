import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import inventoryService from '../services/inventory.service.js';
import codigosService from '../services/inspeccion-codigos.service.js';

export const getInspecciones = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, planificacion_id, q } = req.query;

  const permisos = req.user?.currentInstance?.permisos;
  const isAdmin = permisos?.all?.includes('*') || req.user?.currentInstance?.rol?.toLowerCase() === 'administrador';
  const empleadoId = req.user?.currentInstance?.empleado_id;

  const where = {
    AND: [
      status ? { status } : {},
      planificacion_id ? { planificacion_id: Number(planificacion_id) } : {},
      q ? {
        OR: [
          { n_control: { contains: q, mode: 'insensitive' } },
          { t_codigo: { contains: q, mode: 'insensitive' } },
          { atendido_por_nombre: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  if (!isAdmin && empleadoId) {
    where.AND.push({
      planificaciones: {
        planificacion_empleados: {
          some: {
            empleado_id: empleadoId
          }
        }
      }
    });
  }

  const [inspecciones, totalCount] = await Promise.all([
    tenantPrisma.inspecciones.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fecha_inspeccion: 'desc' },
      include: {
        planificaciones: {
          include: {
            solicitudes: {
              include: {
                clientes: { select: { nombre: true } },
                propiedades: { select: { nombre: true } }
              }
            }
          }
        },
        finalidad_inspeccion: { include: { finalidad: true } },
        inspeccion_fotos: true
      }
    }),
    tenantPrisma.inspecciones.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: inspecciones,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getInspeccionById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const permisos = req.user?.currentInstance?.permisos;
  const isAdmin = permisos?.all?.includes('*') || req.user?.currentInstance?.rol?.toLowerCase() === 'administrador';
  const empleadoId = req.user?.currentInstance?.empleado_id;

  const inspeccion = await tenantPrisma.inspecciones.findUnique({
    where: { id: Number(id) },
    include: {
      planificaciones: {
        include: {
          solicitudes: {
            include: {
              clientes: true,
              propiedades: true,
              t_solicitud: true
            }
          },
          vehiculos: true,
          planificacion_empleados: { include: { empleados: true } }
        }
      },
      finalidad_inspeccion: { include: { finalidad: true } },
      inspeccion_fotos: true,
      avales_sanitarios: true,
      epidemiologia_hallazgos: { include: { enfermedades: true } },
      seguimiento_inspecciones: true
    }
  });

  if (!inspeccion) {
    return res.status(404).json({ status: 'error', message: 'Inspecci?n no encontrada' });
  }

  if (!isAdmin && empleadoId) {
    const isAssigned = inspeccion.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado. No est? asignado a esta inspecci?n.' });
    }
  }

  res.status(200).json({ status: 'success', data: inspeccion });
};

export const previewCodigosInspeccion = async (req, res) => {
  const tenantPrisma = req.db;
  const { planificacion_id, fecha_inspeccion, estado_abrev, exclude_id } = req.query;

  if (!planificacion_id || !fecha_inspeccion) {
    return res.status(400).json({
      status: 'error',
      message: 'planificacion_id y fecha_inspeccion son requeridos',
    });
  }

  try {
    const codigos = await tenantPrisma.$transaction((tx) =>
      codigosService.resolverCodigosInspeccion(tx, {
        planificacionId: Number(planificacion_id),
        fechaInspeccion: fecha_inspeccion,
        estadoAbrev: estado_abrev || undefined,
        excludeId: exclude_id ? Number(exclude_id) : null,
      })
    );

    res.status(200).json({ status: 'success', data: codigos });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const createInspeccion = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    estado_abrev, fecha_inspeccion, hora_inspeccion, atendido_por_nombre,
    atendido_por_cedula, atendido_por_email, atendido_por_tlf, insp_utm_norte,
    insp_utm_este, insp_utm_zona, google_maps_url, aspectos_constatados,
    medidas_ordenadas, posee_certificado, vigencia_dias, status, planificacion_id,
    finalidades, insumos_consumidos
  } = req.body;

  const empleado_id = req.user?.currentInstance?.empleado_id || null;

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      const codigos = await codigosService.resolverCodigosInspeccion(tx, {
        planificacionId: planificacion_id,
        fechaInspeccion: fecha_inspeccion,
        estadoAbrev: estado_abrev,
      });

      const finalNControl = codigos.n_control;
      const finalTCodigo = codigos.t_codigo;

      let photoUrls = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file, index) =>
          storageService.uploadImage(file.buffer, `${finalNControl}-foto-${index}`, 'inspecciones')
        );
        photoUrls = await Promise.all(uploadPromises);
      }

      const finalidadesList = finalidades
        ? (Array.isArray(finalidades) ? finalidades : JSON.parse(finalidades))
        : [];

      const insp = await tx.inspecciones.create({
        data: {
          n_control: finalNControl,
          t_codigo: finalTCodigo,
          fecha_inspeccion: new Date(fecha_inspeccion),
          hora_inspeccion: hora_inspeccion ? new Date(`1970-01-01T${hora_inspeccion}`) : null,
          atendido_por_nombre,
          atendido_por_cedula,
          atendido_por_email,
          atendido_por_tlf,
          insp_utm_norte,
          insp_utm_este,
          insp_utm_zona,
          google_maps_url,
          aspectos_constatados,
          medidas_ordenadas,
          posee_certificado,
          vigencia_dias: Number(vigencia_dias) || 30,
          status: status || 'PENDIENTE',
          planificacion_id,
          finalidad_inspeccion: finalidadesList.length > 0 ? {
            create: finalidadesList.map((f) => ({
              finalidad_id: Number(f.finalidad_id),
              objetivo: f.objetivo,
            })),
          } : undefined,
          inspeccion_fotos: {
            create: photoUrls.map(url => ({ imagen: url }))
          }
        }
      });

      if (insumos_consumidos) {
        const parsedInsumos = typeof insumos_consumidos === 'string' ? JSON.parse(insumos_consumidos) : insumos_consumidos;
        for (const item of parsedInsumos) {
          await inventoryService.registrarMovimiento({
            tx,
            insumo_id: item.insumo_id,
            oficina_id: item.oficina_id,
            tipo_movimiento: 'CONSUMO',
            cantidad: item.cantidad,
            lote: item.lote,
            inspeccion_id: insp.id,
            empleado_id,
            observaciones: `Consumo en Inspecci?n: ${finalNControl}`
          });
        }
      }

      const plan = await tx.planificaciones.findUnique({
        where: { id: planificacion_id },
        select: {
          solicitud_id: true,
          solicitudes: {
            select: {
              propiedad_id: true
            }
          }
        }
      });

      if (plan) {
        await tx.planificaciones.update({
          where: { id: planificacion_id },
          data: { status: status || 'PENDIENTE' }
        });

        await tx.solicitudes.update({
          where: { id: plan.solicitud_id },
          data: { estatus: status || 'PENDIENTE' }
        });

        if (plan.solicitudes?.propiedad_id) {
          let propiedadStatus = 'ACTIVA';
          if (status === 'CUARENTENA') {
            propiedadStatus = 'CUARENTENA';
          } else if (status === 'NO_APROBADA') {
            propiedadStatus = 'NO_APROBADA';
          } else if (status === 'SEGUIMIENTO') {
            propiedadStatus = 'SEGUIMIENTO';
          } else if (status === 'FINALIZADA') {
            propiedadStatus = 'ACTIVA';
          }
          await tx.propiedades.update({
            where: { id: plan.solicitudes.propiedad_id },
            data: { status: propiedadStatus }
          });
        }
      }

      return insp;
    }, {
      isolationLevel: 'Serializable'
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Inspecciones',
      payload_nuevo: response
    });

    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    res.status(error.statusCode || 400).json({ status: 'error', message: error.message });
  }
};

export const updateInspeccion = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { finalidades, estado_abrev, ...data } = req.body;

  const permisos = req.user?.currentInstance?.permisos;
  const isAdmin = permisos?.all?.includes('*') || req.user?.currentInstance?.rol?.toLowerCase() === 'administrador';
  const empleadoId = req.user?.currentInstance?.empleado_id;

  const existing = await tenantPrisma.inspecciones.findUnique({
    where: { id: Number(id) },
    include: {
      inspeccion_fotos: true,
      planificaciones: {
        include: {
          planificacion_empleados: true
        }
      }
    }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Inspecci?n no encontrada' });
  }

  if (!isAdmin && empleadoId) {
    const isAssigned = existing.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'No tiene permisos para modificar esta inspecci?n.' });
    }
  }

  let newPhotoUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `${existing.n_control}-extra-${Date.now()}-${index}`, 'inspecciones')
    );
    newPhotoUrls = await Promise.all(uploadPromises);
  }

  if (data.fecha_inspeccion) data.fecha_inspeccion = new Date(data.fecha_inspeccion);
  if (data.hora_inspeccion) data.hora_inspeccion = new Date(`1970-01-01T${data.hora_inspeccion}`);

  const response = await tenantPrisma.$transaction(async (tx) => {
    const updatePayload = { ...data };

    if (
      codigosService.debenRegenerarCodigos(
        { ...data, estado_abrev, planificacion_id: data.planificacion_id },
        existing
      )
    ) {
      const codigos = await codigosService.resolverCodigosInspeccion(tx, {
        planificacionId: data.planificacion_id ?? existing.planificacion_id,
        fechaInspeccion: data.fecha_inspeccion ?? existing.fecha_inspeccion,
        estadoAbrev: estado_abrev ?? existing.n_control?.split('-')[0],
        excludeId: Number(id),
      });
      updatePayload.n_control = codigos.n_control;
      updatePayload.t_codigo = codigos.t_codigo;
    }

    const updated = await tx.inspecciones.update({
      where: { id: Number(id) },
      data: {
        ...updatePayload,
        finalidad_inspeccion: finalidades ? {
          deleteMany: {},
          create: (Array.isArray(finalidades) ? finalidades : JSON.parse(finalidades)).map((f) => ({
            finalidad_id: Number(f.finalidad_id),
            objetivo: f.objetivo,
          })),
        } : undefined,
        inspeccion_fotos: newPhotoUrls.length > 0 ? {
          create: newPhotoUrls.map(url => ({ imagen: url }))
        } : undefined
      }
    });

    if (data.status && existing.planificaciones) {
      await tx.planificaciones.update({
        where: { id: existing.planificacion_id },
        data: { status: data.status }
      });

      await tx.solicitudes.update({
        where: { id: existing.planificaciones.solicitud_id },
        data: { estatus: data.status }
      });

      if (existing.planificaciones.solicitud_id) {
        const solic = await tx.solicitudes.findUnique({
          where: { id: existing.planificaciones.solicitud_id },
          select: { propiedad_id: true }
        });
        if (solic?.propiedad_id) {
          let propiedadStatus = 'ACTIVA';
          if (data.status === 'CUARENTENA') {
            propiedadStatus = 'CUARENTENA';
          } else if (data.status === 'NO_APROBADA') {
            propiedadStatus = 'NO_APROBADA';
          } else if (data.status === 'SEGUIMIENTO') {
            propiedadStatus = 'SEGUIMIENTO';
          } else if (data.status === 'FINALIZADA') {
            propiedadStatus = 'ACTIVA';
          }
          await tx.propiedades.update({
            where: { id: solic.propiedad_id },
            data: { status: propiedadStatus }
          });
        }
      }
    }

    return updated;
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Inspecciones',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteInspeccion = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const empleado_id = req.user?.currentInstance?.empleado_id || null;

  const permisos = req.user?.currentInstance?.permisos;
  const isAdmin = permisos?.all?.includes('*') || req.user?.currentInstance?.rol?.toLowerCase() === 'administrador';

  const toDelete = await tenantPrisma.inspecciones.findUnique({
    where: { id: Number(id) },
    include: {
      inspeccion_fotos: true,
      avales_sanitarios: true,
      epidemiologia_hallazgos: true,
      planificaciones: {
        include: {
          planificacion_empleados: true
        }
      }
    }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Inspecci?n no encontrada' });
  }

  if (!isAdmin && empleado_id) {
    const isAssigned = toDelete.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleado_id
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'No tiene permisos para eliminar esta inspecci?n.' });
    }
  }

  if (toDelete.avales_sanitarios.length > 0 || toDelete.epidemiologia_hallazgos.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar la inspecci?n porque tiene avales o hallazgos epidemiol?gicos asociados.'
    });
  }

  try {
    await tenantPrisma.$transaction(async (tx) => {
      await inventoryService.revertirMovimientosDeProceso({
        tx,
        proceso_id: Number(id),
        tipo_proceso: 'inspeccion',
        empleado_id
      });

      for (const foto of toDelete.inspeccion_fotos) {
        await storageService.deleteFile(foto.imagen);
      }

      await tx.inspecciones.delete({ where: { id: Number(id) } });
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR',
      modulo: 'Inspecciones',
      payload_previo: toDelete
    });

    res.status(200).json({ status: 'success', message: 'Inspecci?n eliminada y stock restaurado' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
