import bitacoraService from '../services/bitacora.service.js';

export const getCaracStatal = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [records, totalCount] = await Promise.all([
    tenantPrisma.carac_statal.findMany({
      skip,
      take: limit,
      include: {
        municipios: {
          select: { id: true, nombre: true, estados: { select: { id: true, nombre: true } } }
        }
      }
    }),
    tenantPrisma.carac_statal.count(),
  ]);

  res.status(200).json({
    status: 'success',
    data: records,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getCaracStatalByMunicipio = async (req, res) => {
  const tenantPrisma = req.db;
  const { municipio_id } = req.params;

  const record = await tenantPrisma.carac_statal.findUnique({
    where: { municipio_id: Number(municipio_id) },
    include: {
      municipios: {
        select: { id: true, nombre: true, estados: { select: { id: true, nombre: true } } }
      }
    }
  });

  if (!record) {
    return res.status(404).json({ status: 'error', message: 'Caracterización estatal no encontrada para este municipio' });
  }

  res.status(200).json({ status: 'success', data: record });
};

export const createOrUpdateCaracStatal = async (req, res) => {
  const tenantPrisma = req.db;
  const { municipio_id, ...data } = req.body;

  const existing = await tenantPrisma.carac_statal.findUnique({ where: { municipio_id: Number(municipio_id) } });

  let response;
  let accion;

  if (existing) {
    accion = 'ACTUALIZAR';
    response = await tenantPrisma.carac_statal.update({
      where: { municipio_id: Number(municipio_id) },
      data: { ...data, fecha_actualizacion: new Date() }
    });
  } else {
    accion = 'CREAR';
    response = await tenantPrisma.carac_statal.create({
      data: { ...data, municipio_id: Number(municipio_id) }
    });
  }

  bitacoraService.registrar({
    req,
    accion,
    modulo: 'Caracterización Estatal',
    payload_previo: existing || null,
    payload_nuevo: response
  });

  res.status(existing ? 200 : 201).json({ status: 'success', data: response });
};

export const deleteCaracStatal = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.carac_statal.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Registro no encontrado' });
  }

  await tenantPrisma.carac_statal.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Caracterización Estatal',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Registro eliminado exitosamente' });
};
