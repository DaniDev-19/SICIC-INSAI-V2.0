import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import inventoryService from '../services/inventory.service.js';

export const getInspecciones = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { status, planificacion_id, q } = req.query;

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
    return res.status(404).json({ status: 'error', message: 'Inspección no encontrada' });
  }

  res.status(200).json({ status: 'success', data: inspeccion });
};

export const createInspeccion = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    n_control, t_codigo, fecha_inspeccion, hora_inspeccion, atendido_por_nombre,
    atendido_por_cedula, atendido_por_email, atendido_por_tlf, insp_utm_norte,
    insp_utm_este, insp_utm_zona, google_maps_url, aspectos_constatados,
    medidas_ordenadas, posee_certificado, vigencia_dias, status, planificacion_id,
    finalidades, insumos_consumidos
  } = req.body;

  const empleado_id = req.user?.empleado_id || null;

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      if (n_control) {
        const existingByControl = await tx.inspecciones.findUnique({ where: { n_control } });
        if (existingByControl) {
          const error = new Error('Ya existe una inspección con este número de control.');
          error.statusCode = 400;
          throw error;
        }
      }

      let finalNControl = n_control;
      if (!finalNControl) {
        const lastRecord = await tx.inspecciones.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        });
        const nextId = (lastRecord?.id || 0) + 1;
        finalNControl = `INSP-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
      }

      let photoUrls = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file, index) =>
          storageService.uploadImage(file.buffer, `${finalNControl}-foto-${index}`, 'inspecciones')
        );
        photoUrls = await Promise.all(uploadPromises);
      }

      const insp = await tx.inspecciones.create({
        data: {
          n_control: finalNControl,
          t_codigo: t_codigo || '10-00-M00-P00-F01',
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
          finalidad_inspeccion: {
            create: JSON.parse(finalidades).map(f => ({
              finalidad_id: Number(f.finalidad_id),
              objetivo: f.objetivo
            }))
          },
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
            observaciones: `Consumo en Inspección: ${finalNControl}`
          });
        }
      }

      const plan = await tx.planificaciones.findUnique({
        where: { id: planificacion_id },
        select: { solicitud_id: true }
      });

      if (plan) {
        await tx.planificaciones.update({
          where: { id: planificacion_id },
          data: { status: status === 'FINALIZADA' ? 'FINALIZADA' : 'INSPECCIONANDO' }
        });

        await tx.solicitudes.update({
          where: { id: plan.solicitud_id },
          data: { estatus: status === 'FINALIZADA' ? 'FINALIZADA' : 'INSPECCIONANDO' }
        });
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
  const { finalidades, n_control, ...data } = req.body;

  const existing = await tenantPrisma.inspecciones.findUnique({
    where: { id: Number(id) },
    include: { inspeccion_fotos: true, planificaciones: true }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Inspección no encontrada' });
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
    const updated = await tx.inspecciones.update({
      where: { id: Number(id) },
      data: {
        ...data,
        finalidad_inspeccion: finalidades ? {
          deleteMany: {},
          create: JSON.parse(finalidades).map(f => ({
            finalidad_id: Number(f.finalidad_id),
            objetivo: f.objetivo
          }))
        } : undefined,
        inspeccion_fotos: newPhotoUrls.length > 0 ? {
          create: newPhotoUrls.map(url => ({ imagen: url }))
        } : undefined
      }
    });

    if (data.status === 'FINALIZADA' && existing.planificaciones) {
      await tx.planificaciones.update({
        where: { id: existing.planificacion_id },
        data: { status: 'FINALIZADA' }
      });

      await tx.solicitudes.update({
        where: { id: existing.planificaciones.solicitud_id },
        data: { estatus: 'FINALIZADA' }
      });
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

  const toDelete = await tenantPrisma.inspecciones.findUnique({
    where: { id: Number(id) },
    include: { inspeccion_fotos: true, avales_sanitarios: true, epidemiologia_hallazgos: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Inspección no encontrada' });
  }

  if (toDelete.avales_sanitarios.length > 0 || toDelete.epidemiologia_hallazgos.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar la inspección porque tiene avales o hallazgos epidemiológicos asociados.'
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

    res.status(200).json({ status: 'success', message: 'Inspección eliminada y stock restaurado' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
