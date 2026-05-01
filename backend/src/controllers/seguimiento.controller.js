import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';

export const getSeguimientos = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { inspeccion_id, acta_silo_id, q } = req.query;

  const where = {
    AND: [
      inspeccion_id ? { inspeccion_id: Number(inspeccion_id) } : {},
      acta_silo_id ? { acta_silo_id: Number(acta_silo_id) } : {},
      q ? {
        OR: [
          { hallazgos_seguimiento: { contains: q, mode: 'insensitive' } },
          { status: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const [seguimientos, totalCount] = await Promise.all([
    tenantPrisma.seguimiento_inspecciones.findMany({
      where,
      skip,
      take: limit,
      orderBy: { fecha_seguimiento: 'desc' },
      include: {
        inspecciones: { select: { n_control: true, fecha_inspeccion: true } },
        acta_silos: { select: { semana_epid: true, lugar_ubicacion: true } },
        seguimiento_fotos: true
      }
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
    include: {
      inspecciones: true,
      acta_silos: true,
      seguimiento_fotos: true,
      movimientos_insumos: true
    }
  });

  if (!seguimiento) {
    return res.status(404).json({ status: 'error', message: 'Seguimiento no encontrado' });
  }

  res.status(200).json({ status: 'success', data: seguimiento });
};

export const createSeguimiento = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    fecha_seguimiento, hallazgos_seguimiento, recomendaciones_cumplidas,
    status, inspeccion_id, acta_silo_id
  } = req.body;

  let photoUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `seguimiento-${Date.now()}-${index}`, 'seguimientos')
    );
    photoUrls = await Promise.all(uploadPromises);
  }

  const response = await tenantPrisma.seguimiento_inspecciones.create({
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
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Seguimientos',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updateSeguimiento = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const data = req.body;

  const existing = await tenantPrisma.seguimiento_inspecciones.findUnique({
    where: { id: Number(id) },
    include: { seguimiento_fotos: true }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Seguimiento no encontrado' });
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

  const response = await tenantPrisma.seguimiento_inspecciones.update({
    where: { id: Number(id) },
    data: {
      ...data,
      seguimiento_fotos: newPhotoUrls.length > 0 ? {
        create: newPhotoUrls.map(url => ({ imagen: url }))
      } : undefined
    }
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

  const toDelete = await tenantPrisma.seguimiento_inspecciones.findUnique({
    where: { id: Number(id) },
    include: { seguimiento_fotos: true, movimientos_insumos: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Seguimiento no encontrado' });
  }

  if (toDelete.movimientos_insumos.length > 0) {
    return res.status(400).json({
      status: 'error',
      message: 'No se puede eliminar el seguimiento porque tiene movimientos de insumos asociados.'
    });
  }

  for (const foto of toDelete.seguimiento_fotos) {
    await storageService.deleteFile(foto.imagen);
  }

  await tenantPrisma.seguimiento_inspecciones.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Seguimientos',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Seguimiento eliminado exitosamente' });
};
