import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import inventoryService from '../services/inventory.service.js';
import actaSiloReporteService, { ACTA_SILO_REPORT_INCLUDE } from '../services/acta-silo-reporte.service.js';
import * as statusSyncService from '../services/status-sync.service.js';

function isAdminUser(req) {
  const permisos = req.user?.currentInstance?.permisos;
  const rol = req.user?.currentInstance?.rol?.toLowerCase() || '';
  return (
    permisos?.all?.includes('*') ||
    rol === 'admin' ||
    rol === 'administrador' ||
    rol === 'superadmin' ||
    rol === 'super_admin'
  );
}

function isInspectorUser(req) {
  const rol = req.user?.currentInstance?.rol?.toLowerCase() || '';
  return rol.includes('inspector') && !isAdminUser(req);
}

async function resolveEmpleadoId(req, tx) {
  const fromToken = req.user?.currentInstance?.empleado_id;
  if (fromToken) return fromToken;

  const usuarioGlobalId = req.user?.id;
  if (!usuarioGlobalId || !tx) return null;

  try {
    const empleado = await tx.empleados.findFirst({
      where: { usuario_global_id: usuarioGlobalId },
      select: { id: true },
    });
    return empleado ? empleado.id : null;
  } catch {
    return null;
  }
}

async function requireInspectorEnPlanificacion(tx, req, planificacionId) {
  if (!isInspectorUser(req)) return;

  const empleadoId = await resolveEmpleadoId(req, tx);
  if (!empleadoId) {
    const error = new Error(
      'Su usuario no tiene un empleado vinculado. No puede registrar actas de silos de campo.'
    );
    error.statusCode = 403;
    throw error;
  }

  const planificacion = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    select: { id: true },
  });
  if (!planificacion) {
    const error = new Error('La planificación indicada no existe');
    error.statusCode = 404;
    throw error;
  }

  const asignacion = await tx.planificacion_empleados.findFirst({
    where: {
      planificacion_id: Number(planificacionId),
      empleado_id: empleadoId,
    },
  });

  if (!asignacion) {
    const error = new Error(
      'No está asignado a esta planificación. Solo puede registrar actas de silos de visitas donde figura como inspector.'
    );
    error.statusCode = 403;
    throw error;
  }
}

async function buildActaSilosWhere(req, tx) {
  const { planificacion_id, q } = req.query;

  const where = {
    AND: [
      planificacion_id ? { planificacion_id: Number(planificacion_id) } : {},
    ],
  };

  if (q && q.trim()) {
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((token) => {
      where.AND.push({
        OR: [
          { semana_epid: { contains: token, mode: 'insensitive' } },
          { lugar_ubicacion: { contains: token, mode: 'insensitive' } },
          { n_silos: { contains: token, mode: 'insensitive' } },
          { observaciones: { contains: token, mode: 'insensitive' } },
          {
            planificaciones: {
              solicitudes: {
                clientes: {
                  nombre: { contains: token, mode: 'insensitive' },
                },
              },
            },
          },
          {
            planificaciones: {
              solicitudes: {
                propiedades: {
                  nombre: { contains: token, mode: 'insensitive' },
                },
              },
            },
          },
          {
            planificaciones: {
              solicitudes: {
                codigo: { contains: token, mode: 'insensitive' },
              },
            },
          },
        ],
      });
    });
  }

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tx || req.db));
    if (empleadoId) {
      where.AND.push({
        planificaciones: {
          planificacion_empleados: {
            some: { empleado_id: Number(empleadoId) },
          },
        },
      });
    } else {
      where.AND.push({ id: -1 });
    }
  }

  return where;
}

export const getActaSilos = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const where = await buildActaSilosWhere(req, tenantPrisma);

  const [actas, totalCount] = await Promise.all([
    tenantPrisma.acta_silos.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        planificaciones: {
          include: {
            solicitudes: {
              include: {
                clientes: true,
                propiedades: true
              }
            }
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
          solicitudes: {
            include: {
              clientes: true,
              propiedades: true
            }
          },
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

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));
    const isAssigned = acta.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado. No está asignado a esta inspección de silo.' });
    }
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

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      await requireInspectorEnPlanificacion(tx, req, planificacion_id);

      const empleado_id = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tx));

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
        await statusSyncService.syncFromInspeccion(tx, planificacion_id, 'FINALIZADA');
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
  const { fotos_eliminadas, ...data } = req.body;

  const existing = await tenantPrisma.acta_silos.findUnique({
    where: { id: Number(id) },
    include: {
      silo_fotos: true,
      planificaciones: {
        include: {
          planificacion_empleados: true
        }
      }
    }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Acta de Silo no encontrada' });
  }

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));
    const isAssigned = existing.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'No tiene permisos para modificar esta acta de silo.' });
    }
  }

  let newPhotoUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `silo-acta-extra-${Date.now()}-${index}`, 'silos')
    );
    newPhotoUrls = await Promise.all(uploadPromises);
  }

  if (data.fecha_notificacion) data.fecha_notificacion = new Date(data.fecha_notificacion);

  const fotoIdsToDelete = fotos_eliminadas
    ? (Array.isArray(fotos_eliminadas) ? fotos_eliminadas : JSON.parse(fotos_eliminadas))
        .map(Number)
        .filter((id) => Number.isFinite(id))
    : [];

  const response = await tenantPrisma.$transaction(async (tx) => {
    if (fotoIdsToDelete.length > 0) {
      const fotosToRemove = existing.silo_fotos.filter((f) => fotoIdsToDelete.includes(f.id));
      for (const foto of fotosToRemove) {
        await storageService.deleteFile(foto.imagen);
      }
      await tx.silo_fotos.deleteMany({
        where: {
          id: { in: fotoIdsToDelete },
          acta_silo_id: Number(id),
        },
      });
    }

    return await tx.acta_silos.update({
      where: { id: Number(id) },
      data: {
        ...data,
        silo_fotos: newPhotoUrls.length > 0 ? {
          create: newPhotoUrls.map(url => ({ imagen: url }))
        } : undefined
      }
    });
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
  const empleado_id = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));

  const toDelete = await tenantPrisma.acta_silos.findUnique({
    where: { id: Number(id) },
    include: {
      silo_fotos: true,
      seguimiento_inspecciones: true,
      planificaciones: {
        include: {
          planificacion_empleados: true
        }
      }
    }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Acta de Silo no encontrada' });
  }

  if (isInspectorUser(req)) {
    const isAssigned = toDelete.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleado_id
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'No tiene permisos para eliminar esta acta de silo.' });
    }
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

      await statusSyncService.syncOnActaSiloDelete(tx, toDelete.planificacion_id);

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

export const getActaSiloReporte = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const acta = await tenantPrisma.acta_silos.findUnique({
    where: { id: Number(id) },
    include: ACTA_SILO_REPORT_INCLUDE,
  });

  if (!acta) {
    return res.status(404).json({ status: 'error', message: 'Acta de Silo no encontrada' });
  }

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));
    const isAssigned = acta.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssigned) {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado. No está asignado a esta inspección de silo.' });
    }
  }

  try {
    const reporte = await actaSiloReporteService.buildActaSiloReporte(acta);
    res.status(200).json({ status: 'success', data: reporte });
  } catch (error) {
    console.error('Error preparando reporte de acta de silo:', error);
    res.status(500).json({ status: 'error', message: 'No se pudo preparar el acta' });
  }
};
