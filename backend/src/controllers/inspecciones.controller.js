import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import imageService from '../services/image.service.js';
import inventoryService from '../services/inventory.service.js';
import codigosService from '../services/inspeccion-codigos.service.js';
import excelService from '../services/excel.service.js';
import pdfService from '../services/pdf.service.js';
import { parseHoraInspeccion, formatHoraInspeccion } from '../utils/inspeccion-time.util.js';
import inspeccionReporteService, {
  INSPECCION_REPORT_INCLUDE,
} from '../services/inspeccion-reporte.service.js';

function parseAreasBody(areas_inspeccion) {
  if (areas_inspeccion === undefined || areas_inspeccion === null) return undefined;
  if (Array.isArray(areas_inspeccion)) return areas_inspeccion;
  if (typeof areas_inspeccion === 'string') {
    try {
      return JSON.parse(areas_inspeccion);
    } catch {
      return [];
    }
  }
  return [];
}

function isAdminUser(req) {
  const permisos = req.user?.currentInstance?.permisos;
  return (
    permisos?.all?.includes('*') ||
    req.user?.currentInstance?.rol?.toLowerCase() === 'administrador'
  );
}

function canAccessInspeccion(inspeccion, req) {
  const empleadoId = req.user?.currentInstance?.empleado_id;
  if (isAdminUser(req) || !empleadoId) return true;
  return inspeccion.planificaciones?.planificacion_empleados?.some(
    (pe) => pe.empleado_id === empleadoId
  );
}

/** Inspector debe estar en planificacion_empleados; admin queda exento. */
async function requireInspectorEnPlanificacion(tx, req, planificacionId) {
  if (isAdminUser(req)) return;

  const empleadoId = req.user?.currentInstance?.empleado_id;
  if (!empleadoId) {
    const error = new Error(
      'Su usuario no tiene un empleado vinculado. No puede registrar inspecciones de campo.'
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
      'No está asignado a esta planificación. Solo puede registrar inspecciones de visitas donde figura como inspector.'
    );
    error.statusCode = 403;
    throw error;
  }
}

function buildInspeccionesWhere(req) {
  const { status, planificacion_id, q } = req.query;
  const isAdmin = isAdminUser(req);
  const empleadoId = req.user?.currentInstance?.empleado_id;

  const where = {
    AND: [
      status ? { status } : {},
      planificacion_id ? { planificacion_id: Number(planificacion_id) } : {},
      q
        ? {
            OR: [
              { n_control: { contains: q, mode: 'insensitive' } },
              { t_codigo: { contains: q, mode: 'insensitive' } },
              { atendido_por_nombre: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  if (!isAdmin && empleadoId) {
    where.AND.push({
      planificaciones: {
        planificacion_empleados: {
          some: { empleado_id: empleadoId },
        },
      },
    });
  }

  return where;
}

export const getInspecciones = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const where = buildInspeccionesWhere(req);

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

  const isAdmin = isAdminUser(req);
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
    finalidades, insumos_consumidos, areas_inspeccion
  } = req.body;

  const empleado_id = req.user?.currentInstance?.empleado_id || null;

  if (!planificacion_id) {
    return res.status(400).json({
      status: 'error',
      message: 'planificacion_id es requerido',
    });
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      await requireInspectorEnPlanificacion(tx, req, planificacion_id);

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
          imageService.uploadInspectionPhoto(file.buffer, `${finalNControl}-foto-${index}`)
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
          hora_inspeccion: parseHoraInspeccion(hora_inspeccion),
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
          areas_inspeccion: parseAreasBody(areas_inspeccion) ?? [],
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
  const { finalidades, estado_abrev, fotos_eliminadas, areas_inspeccion, ...data } = req.body;

  const isAdmin = isAdminUser(req);
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
      imageService.uploadInspectionPhoto(
        file.buffer,
        `${existing.n_control}-extra-${Date.now()}-${index}`
      )
    );
    newPhotoUrls = await Promise.all(uploadPromises);
  }

  if (data.fecha_inspeccion) data.fecha_inspeccion = new Date(data.fecha_inspeccion);
  if (data.hora_inspeccion) data.hora_inspeccion = parseHoraInspeccion(data.hora_inspeccion);

  const fotoIdsToDelete = fotos_eliminadas
    ? (Array.isArray(fotos_eliminadas) ? fotos_eliminadas : JSON.parse(fotos_eliminadas))
        .map(Number)
        .filter((id) => Number.isFinite(id))
    : [];

  const response = await tenantPrisma.$transaction(async (tx) => {
    if (fotoIdsToDelete.length > 0) {
      const fotosToRemove = existing.inspeccion_fotos.filter((f) => fotoIdsToDelete.includes(f.id));
      for (const foto of fotosToRemove) {
        await storageService.deleteFile(foto.imagen);
      }
      await tx.inspeccion_fotos.deleteMany({
        where: {
          id: { in: fotoIdsToDelete },
          inspeccion_id: Number(id),
        },
      });
    }

    const updatePayload = { ...data };
    const areasParsed = parseAreasBody(areas_inspeccion);
    if (areasParsed !== undefined) {
      updatePayload.areas_inspeccion = areasParsed;
    }

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

  const isAdmin = isAdminUser(req);

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

const INSPECCIONES_EXPORT_COLUMNS = [
  { header: 'N° Control', key: 'n_control', width: 28 },
  { header: 'Código Formulario', key: 't_codigo', width: 18 },
  { header: 'Fecha', key: 'fecha', width: 14 },
  { header: 'Hora', key: 'hora', width: 10 },
  { header: 'Estatus', key: 'status', width: 16 },
  { header: 'Planificación', key: 'planificacion', width: 16 },
  { header: 'Solicitud', key: 'solicitud', width: 16 },
  { header: 'Productor', key: 'productor', width: 28 },
  { header: 'Predio', key: 'predio', width: 28 },
  { header: 'Código INSAI', key: 'codigo_insai', width: 16 },
  { header: 'Persona atendida', key: 'atendido', width: 24 },
  { header: 'UTM N/E/Zona', key: 'utm', width: 22 },
  { header: 'Finalidades', key: 'finalidades', width: 36 },
  { header: 'Cant. fotos', key: 'fotos', width: 12 },
];

async function fetchInspeccionesExportData(tenantPrisma, where) {
  const inspecciones = await tenantPrisma.inspecciones.findMany({
    where,
    orderBy: { fecha_inspeccion: 'desc' },
    include: {
      planificaciones: {
        include: {
          solicitudes: {
            include: {
              clientes: { select: { nombre: true } },
              propiedades: { select: { nombre: true, codigo_insai: true } },
            },
          },
        },
      },
      finalidad_inspeccion: { include: { finalidad: { select: { nombre: true } } } },
      inspeccion_fotos: { select: { id: true } },
    },
  });

  return inspecciones.map((i) => {
    const plan = i.planificaciones;
    const solic = plan?.solicitudes;
    return {
      n_control: i.n_control,
      t_codigo: i.t_codigo || '10-00-M00-P00-F01',
      fecha: i.fecha_inspeccion ? new Date(i.fecha_inspeccion).toLocaleDateString('es-VE') : 'N/A',
      hora: i.hora_inspeccion ? formatHoraInspeccion(i.hora_inspeccion) : 'N/A',
      status: i.status || 'N/A',
      planificacion: plan?.codigo || 'N/A',
      solicitud: solic?.codigo || 'N/A',
      productor: solic?.clientes?.nombre || 'N/A',
      predio: solic?.propiedades?.nombre || 'N/A',
      codigo_insai: solic?.propiedades?.codigo_insai || 'N/A',
      atendido: i.atendido_por_nombre || 'No especificado',
      utm: `${i.insp_utm_norte ?? ''} / ${i.insp_utm_este ?? ''} / ${i.insp_utm_zona ?? ''}`,
      finalidades:
        i.finalidad_inspeccion?.map((f) => f.finalidad?.nombre).filter(Boolean).join(', ') || 'N/A',
      fotos: i.inspeccion_fotos?.length ?? 0,
    };
  });
}

export const exportInspecciones = async (req, res) => {
  const tenantPrisma = req.db;
  const where = buildInspeccionesWhere(req);
  const data = await fetchInspeccionesExportData(tenantPrisma, where);

  const buffer = await excelService.generate({
    title: 'Reporte de Inspecciones de Campo - INSAI',
    columns: INSPECCIONES_EXPORT_COLUMNS,
    data,
    sheetName: 'Inspecciones',
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_inspecciones.xlsx');
  res.send(buffer);
};

export const exportInspeccionesPdf = async (req, res) => {
  const tenantPrisma = req.db;
  const where = buildInspeccionesWhere(req);
  const data = await fetchInspeccionesExportData(tenantPrisma, where);

  const buffer = await pdfService.generateTable({
    title: 'Reporte de Inspecciones de Campo - INSAI',
    columns: INSPECCIONES_EXPORT_COLUMNS,
    data,
    orientation: 'landscape',
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_inspecciones.pdf');
  res.send(buffer);
};

export const getInspeccionReporte = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const inspeccion = await tenantPrisma.inspecciones.findUnique({
    where: { id: Number(id) },
    include: INSPECCION_REPORT_INCLUDE,
  });

  if (!inspeccion) {
    return res.status(404).json({ status: 'error', message: 'Inspecci?n no encontrada' });
  }

  if (!canAccessInspeccion(inspeccion, req)) {
    return res.status(403).json({ status: 'error', message: 'Acceso denegado a esta inspecci?n.' });
  }

  try {
    const reporte = await inspeccionReporteService.buildInspeccionReporte(inspeccion);
    res.status(200).json({ status: 'success', data: reporte });
  } catch (error) {
    console.error('Error preparando reporte de inspecci?n:', error);
    res.status(500).json({ status: 'error', message: 'No se pudo preparar el acta' });
  }
};
