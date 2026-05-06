import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import inventoryService from '../services/inventory.service.js';

export const getActaSilos = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { planificacion_id, q } = req.query;

  const where = {
    AND: [
      planificacion_id ? { planificacion_id: Number(planificacion_id) } : {},
      q ? {
        OR: [
          { semana_epid: { contains: q, mode: 'insensitive' } },
          { lugar_ubicacion: { contains: q, mode: 'insensitive' } },
          { n_silos: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const [actas, totalCount] = await Promise.all([
    tenantPrisma.acta_silos.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        planificaciones: {
          include: {
            solicitudes: { select: { codigo: true, descripcion: true } }
          }
        },
        t_unidades: true,
        t_evento: true,
        silo_fotos: true
      }
    }),
    tenantPrisma.acta_silos.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: actas,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getActaSiloById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const acta = await tenantPrisma.acta_silos.findUnique({
    where: { id: Number(id) },
    include: {
      planificaciones: {
        include: {
          solicitudes: true,
          vehiculos: true,
          planificacion_empleados: { include: { empleados: true } }
        }
      },
      t_unidades: true,
      t_evento: true,
      silo_fotos: true,
      seguimiento_inspecciones: true
    }
  });

  if (!acta) {
    return res.status(404).json({ status: 'error', message: 'Acta de Silo no encontrada' });
  }

  res.status(200).json({ status: 'success', data: acta });
};

export const createActaSilo = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    semana_epid, fecha_notificacion, lugar_ubicacion, cant_nacional,
    cant_importado, cant_afectado, cant_afectado_porcentaje, n_silos,
    n_galpones, c_instalada, c_operativa, c_almacenamiento, destino_objetivo,
    observaciones, medidas_recomendadas, evento_id, unidad_medida_id,
    planificacion_id, insumos_consumidos
  } = req.body;

  const empleado_id = req.user?.empleado_id || null;

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      // Evitar duplicados de acta para la misma planificación
      const existing = await tx.acta_silos.findFirst({
        where: { planificacion_id: Number(planificacion_id) }
      });
      if (existing) {
        const error = new Error('Esta planificación ya tiene un acta de silo registrada.');
        error.statusCode = 400;
        throw error;
      }

      let photoUrls = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map((file, index) =>
          storageService.uploadImage(file.buffer, `silo-acta-${Date.now()}-${index}`, 'silos')
        );
        photoUrls = await Promise.all(uploadPromises);
      }

      const acta = await tx.acta_silos.create({
        data: {
          semana_epid,
          fecha_notificacion: fecha_notificacion ? new Date(fecha_notificacion) : new Date(),
          lugar_ubicacion,
          cant_nacional,
          cant_importado,
          cant_afectado,
          cant_afectado_porcentaje,
          n_silos,
          n_galpones,
          c_instalada,
          c_operativa,
          c_almacenamiento,
          destino_objetivo,
          observaciones,
          medidas_recomendadas,
          evento_id: evento_id ? Number(evento_id) : null,
          unidad_medida_id: unidad_medida_id ? Number(unidad_medida_id) : null,
          planificacion_id: Number(planificacion_id),
          silo_fotos: {
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
            acta_silo_id: acta.id,
            empleado_id,
            observaciones: `Consumo en Acta de Silo: ${lugar_ubicacion}`
          });
        }
      }

      const plan = await tx.planificaciones.findUnique({
        where: { id: Number(planificacion_id) },
        select: { solicitud_id: true }
      });

      if (plan) {
        await tx.planificaciones.update({
          where: { id: Number(planificacion_id) },
          data: { status: 'FINALIZADA' }
        });

        await tx.solicitudes.update({
          where: { id: plan.solicitud_id },
          data: { estatus: 'FINALIZADA' }
        });
      }

      return acta;
    }, {
      isolationLevel: 'Serializable'
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Acta Silos',
      payload_nuevo: response
    });

    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    res.status(error.statusCode || 400).json({ status: 'error', message: error.message });
  }
};


export const updateActaSilo = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const data = req.body;

  const existing = await tenantPrisma.acta_silos.findUnique({
    where: { id: Number(id) },
    include: { silo_fotos: true }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Acta de Silo no encontrada' });
  }

  let newPhotoUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `silo-acta-extra-${Date.now()}-${index}`, 'silos')
    );
    newPhotoUrls = await Promise.all(uploadPromises);
  }

  if (data.fecha_notificacion) data.fecha_notificacion = new Date(data.fecha_notificacion);

  const response = await tenantPrisma.acta_silos.update({
    where: { id: Number(id) },
    data: {
      ...data,
      silo_fotos: newPhotoUrls.length > 0 ? {
        create: newPhotoUrls.map(url => ({ imagen: url }))
      } : undefined
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Acta Silos',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteActaSilo = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.acta_silos.findUnique({
    where: { id: Number(id) },
    include: { silo_fotos: true, seguimiento_inspecciones: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Acta de Silo no encontrada' });
  }

  if (toDelete.seguimiento_inspecciones.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar el acta porque tiene seguimientos asociados.'
    });
  }

  try {
    await tenantPrisma.$transaction(async (tx) => {
      await inventoryService.revertirMovimientosDeProceso({
        tx,
        proceso_id: Number(id),
        tipo_proceso: 'acta_silo',
        empleado_id
      });

      for (const foto of toDelete.silo_fotos) {
        await storageService.deleteFile(foto.imagen);
      }

      await tx.acta_silos.delete({ where: { id: Number(id) } });
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR',
      modulo: 'Acta Silos',
      payload_previo: toDelete
    });

    res.status(200).json({ status: 'success', message: 'Acta de Silo eliminada y stock restaurado' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
