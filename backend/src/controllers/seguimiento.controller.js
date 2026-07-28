import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import inventoryService from '../services/inventory.service.js';

const SEGUIMIENTO_INCLUDE = {
  inspecciones: {
    include: {
      planificaciones: {
        include: {
          solicitudes: {
            include: {
              clientes: { select: { id: true, nombre: true } },
              propiedades: { select: { id: true, nombre: true } }
            }
          },
          planificacion_empleados: true
        }
      }
    }
  },
  acta_silos: {
    include: {
      planificaciones: {
        include: {
          planificacion_empleados: true
        }
      }
    }
  },
  seguimiento_fotos: true
};

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

async function buildSeguimientosWhere(req, tenantPrisma) {
  const { inspeccion_id, acta_silo_id, q } = req.query;

  const where = {
    AND: [
      inspeccion_id ? { inspeccion_id: Number(inspeccion_id) } : {},
      acta_silo_id ? { acta_silo_id: Number(acta_silo_id) } : {},
    ]
  };

  if (q && q.trim()) {
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((token) => {
      where.AND.push({
        OR: [
          { hallazgos_seguimiento: { contains: token, mode: 'insensitive' } },
          { status: { contains: token, mode: 'insensitive' } },
          {
            inspecciones: {
              n_control: { contains: token, mode: 'insensitive' }
            }
          },
          {
            inspecciones: {
              planificaciones: {
                solicitudes: {
                  propiedades: {
                    nombre: { contains: token, mode: 'insensitive' }
                  }
                }
              }
            }
          },
          {
            inspecciones: {
              planificaciones: {
                solicitudes: {
                  clientes: {
                    nombre: { contains: token, mode: 'insensitive' }
                  }
                }
              }
            }
          },
          {
            acta_silos: {
              semana_epid: { contains: token, mode: 'insensitive' }
            }
          },
          {
            acta_silos: {
              lugar_ubicacion: { contains: token, mode: 'insensitive' }
            }
          }
        ]
      });
    });
  }

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));
    if (empleadoId) {
      where.AND.push({
        OR: [
          {
            inspecciones: {
              planificaciones: {
                planificacion_empleados: {
                  some: { empleado_id: Number(empleadoId) }
                }
              }
            }
          },
          {
            acta_silos: {
              planificaciones: {
                planificacion_empleados: {
                  some: { empleado_id: Number(empleadoId) }
                }
              }
            }
          }
        ]
      });
    } else {
      where.AND.push({ id: -1 });
    }
  }

  return where;
}

export const getSeguimientos = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const where = await buildSeguimientosWhere(req, tenantPrisma);

  const [seguimientos, totalCount] = await Promise.all([
    tenantPrisma.seguimiento_inspecciones.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: 'desc' },
      include: SEGUIMIENTO_INCLUDE
    }),
    tenantPrisma.seguimiento_inspecciones.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: seguimientos,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getSeguimientoById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const seguimiento = await tenantPrisma.seguimiento_inspecciones.findUnique({
    where: { id: Number(id) },
    include: SEGUIMIENTO_INCLUDE
  });

  if (!seguimiento) {
    return res.status(404).json({ status: 'error', message: 'Seguimiento no encontrado' });
  }

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));
    const isAssignedInspeccion = seguimiento.inspecciones?.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    const isAssignedSilo = seguimiento.acta_silos?.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssignedInspeccion && !isAssignedSilo) {
      return res.status(403).json({ status: 'error', message: 'Acceso denegado. No está asignado a esta inspección o seguimiento.' });
    }
  }

  res.status(200).json({ status: 'success', data: seguimiento });
};

export const createSeguimiento = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    fecha_seguimiento, hallazgos_seguimiento, recomendaciones_cumplidas,
    status, inspeccion_id, acta_silo_id, insumos_consumidos
  } = req.body;

  const empleado_id = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));

  let photoUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `seguimiento-${Date.now()}-${index}`, 'seguimientos')
    );
    photoUrls = await Promise.all(uploadPromises);
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      const seguimiento = await tx.seguimiento_inspecciones.create({
        data: {
          fecha_seguimiento: fecha_seguimiento ? new Date(fecha_seguimiento) : new Date(),
          hallazgos_seguimiento,
          recomendaciones_cumplidas: recomendaciones_cumplidas === 'true' || recomendaciones_cumplidas === true,
          status,
          inspeccion_id: inspeccion_id ? Number(inspeccion_id) : null,
          acta_silo_id: acta_silo_id ? Number(acta_silo_id) : null,
          seguimiento_fotos: {
            create: photoUrls.map(url => ({ imagen: url }))
          }
        },
        include: SEGUIMIENTO_INCLUDE
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
            seguimiento_id: seguimiento.id,
            empleado_id,
            observaciones: `Consumo en Seguimiento ID: ${seguimiento.id}`
          });
        }
      }

      return seguimiento;
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Seguimientos',
      payload_nuevo: response
    });

    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const updateSeguimiento = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const data = req.body;

  const existing = await tenantPrisma.seguimiento_inspecciones.findUnique({
    where: { id: Number(id) },
    include: SEGUIMIENTO_INCLUDE
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Seguimiento no encontrado' });
  }

  if (isInspectorUser(req)) {
    const empleadoId = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));
    const isAssignedInspeccion = existing.inspecciones?.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    const isAssignedSilo = existing.acta_silos?.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleadoId
    );
    if (!isAssignedInspeccion && !isAssignedSilo) {
      return res.status(403).json({ status: 'error', message: 'No tiene permisos para modificar este seguimiento.' });
    }
  }

  let newPhotoUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `seguimiento-extra-${Date.now()}-${index}`, 'seguimientos')
    );
    newPhotoUrls = await Promise.all(uploadPromises);
  }

  if (data.fecha_seguimiento) data.fecha_seguimiento = new Date(data.fecha_seguimiento);
  if (data.recomendaciones_cumplidas !== undefined) {
    data.recomendaciones_cumplidas = data.recomendaciones_cumplidas === 'true' || data.recomendaciones_cumplidas === true;
  }
  if (!data.inspeccion_id) delete data.inspeccion_id;
  if (!data.acta_silo_id) delete data.acta_silo_id;

  const response = await tenantPrisma.seguimiento_inspecciones.update({
    where: { id: Number(id) },
    data: {
      ...data,
      seguimiento_fotos: newPhotoUrls.length > 0 ? {
        create: newPhotoUrls.map(url => ({ imagen: url }))
      } : undefined
    },
    include: SEGUIMIENTO_INCLUDE
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Seguimientos',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteSeguimiento = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const empleado_id = req.user?.currentInstance?.empleado_id || (await resolveEmpleadoId(req, tenantPrisma));

  const toDelete = await tenantPrisma.seguimiento_inspecciones.findUnique({
    where: { id: Number(id) },
    include: SEGUIMIENTO_INCLUDE
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Seguimiento no encontrado' });
  }

  if (isInspectorUser(req)) {
    const isAssignedInspeccion = toDelete.inspecciones?.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleado_id
    );
    const isAssignedSilo = toDelete.acta_silos?.planificaciones?.planificacion_empleados?.some(
      pe => pe.empleado_id === empleado_id
    );
    if (!isAssignedInspeccion && !isAssignedSilo) {
      return res.status(403).json({ status: 'error', message: 'No tiene permisos para eliminar este seguimiento.' });
    }
  }

  try {
    await tenantPrisma.$transaction(async (tx) => {
      await inventoryService.revertirMovimientosDeProceso({
        tx,
        proceso_id: Number(id),
        tipo_proceso: 'seguimiento',
        empleado_id
      });

      for (const foto of toDelete.seguimiento_fotos) {
        await storageService.deleteFile(foto.imagen);
      }

      await tx.seguimiento_inspecciones.delete({ where: { id: Number(id) } });
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR',
      modulo: 'Seguimientos',
      payload_previo: toDelete
    });

    res.status(200).json({ status: 'success', message: 'Seguimiento eliminado y stock restaurado' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
