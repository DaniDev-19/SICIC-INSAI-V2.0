import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import excelService from '../services/excel.service.js';

export const getPropiedades = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { q, tipo_propiedad_id, due_o_id } = req.query;

  const where = {
    AND: [
      tipo_propiedad_id ? { tipo_propiedad_id: Number(tipo_propiedad_id) } : {},
      due_o_id ? { due_o_id: Number(due_o_id) } : {},
      q ? {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { codigo_insai: { contains: q, mode: 'insensitive' } },
          { rif: { contains: q, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const [propiedades, totalCount] = await Promise.all([
    tenantPrisma.propiedades.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
      include: {
        clientes: { select: { id: true, nombre: true, cedula_rif: true } },
        t_propiedad: { select: { id: true, nombre: true } },
      }
    }),
    tenantPrisma.propiedades.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: propiedades,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getPropiedadById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const propiedad = await tenantPrisma.propiedades.findUnique({
    where: { id: Number(id) },
    include: {
      clientes: true,
      t_propiedad: true,
      propiedad_hierro: true,
      propiedad_ubicacion: { include: { sectores: true } },
      propiedad_cultivo: { include: { cultivo: true, t_unidades_propiedad_cultivo_cantidad_unidad_idTot_unidades: true } },
      propiedad_animales: { include: { animales: true, t_unidades: true } },
    }
  });

  if (!propiedad) {
    return res.status(404).json({ status: 'error', message: 'Propiedad no encontrada' });
  }

  res.status(200).json({ status: 'success', data: propiedad });
};

export const createPropiedad = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    codigo_insai, nombre, rif, punto_referencia, hectareas_totales, status,
    tipo_propiedad_id, due_o_id, hierro, ubicacion, cultivos, animales
  } = req.body;

  let finalHierroImgUrl = null;
  if (req.file) {
    finalHierroImgUrl = await storageService.uploadImage(req.file.buffer, `hierro-${nombre}`, 'propiedades');
  }

  const response = await tenantPrisma.propiedades.create({
    data: {
      codigo_insai, nombre, rif, punto_referencia, hectareas_totales, status,
      tipo_propiedad_id, due_o_id,
      propiedad_hierro: hierro || finalHierroImgUrl ? {
        create: {
          num_reg_hierro: hierro?.num_reg_hierro,
          num_reg_ganadero: hierro?.num_reg_ganadero,
          hierro_img_url: finalHierroImgUrl
        }
      } : undefined,
      propiedad_ubicacion: ubicacion ? { create: ubicacion } : undefined,
      propiedad_cultivo: cultivos ? { create: cultivos } : undefined,
      propiedad_animales: animales ? { create: animales } : undefined,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Propiedades',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updatePropiedad = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const {
    codigo_insai, nombre, rif, punto_referencia, hectareas_totales, status,
    tipo_propiedad_id, due_o_id, hierro, ubicacion, cultivos, animales
  } = req.body;

  const existing = await tenantPrisma.propiedades.findUnique({
    where: { id: Number(id) },
    include: { propiedad_hierro: true }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Propiedad no encontrada' });
  }

  let finalHierroImgUrl = undefined;
  if (req.file) {
    finalHierroImgUrl = await storageService.uploadImage(req.file.buffer, `hierro-${nombre || existing.nombre}`, 'propiedades');
    if (existing.propiedad_hierro?.[0]?.hierro_img_url) {
      await storageService.deleteFile(existing.propiedad_hierro[0].hierro_img_url);
    }
  }

  const response = await tenantPrisma.propiedades.update({
    where: { id: Number(id) },
    data: {
      codigo_insai, nombre, rif, punto_referencia, hectareas_totales, status,
      tipo_propiedad_id, due_o_id,
      propiedad_hierro: (hierro || finalHierroImgUrl) ? {
        deleteMany: {},
        create: {
          num_reg_hierro: hierro?.num_reg_hierro || existing.propiedad_hierro?.[0]?.num_reg_hierro,
          num_reg_ganadero: hierro?.num_reg_ganadero || existing.propiedad_hierro?.[0]?.num_reg_ganadero,
          hierro_img_url: finalHierroImgUrl || existing.propiedad_hierro?.[0]?.hierro_img_url
        }
      } : undefined,
      propiedad_ubicacion: ubicacion ? {
        deleteMany: {},
        create: ubicacion
      } : undefined,
      propiedad_cultivo: cultivos ? {
        deleteMany: {},
        create: cultivos
      } : undefined,
      propiedad_animales: animales ? {
        deleteMany: {},
        create: animales
      } : undefined,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Propiedades',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deletePropiedad = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.propiedades.findUnique({
    where: { id: Number(id) },
    include: { propiedad_hierro: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Propiedad no encontrada' });
  }

  const hasSolicitudes = await tenantPrisma.solicitudes.findFirst({ where: { propiedad_id: Number(id) } });
  if (hasSolicitudes) {
    return res.status(400).json({ status: 'error', message: 'No se puede eliminar la propiedad porque tiene solicitudes asociadas' });
  }

  await tenantPrisma.propiedades.delete({ where: { id: Number(id) } });

  if (toDelete.propiedad_hierro?.[0]?.hierro_img_url) {
    await storageService.deleteFile(toDelete.propiedad_hierro[0].hierro_img_url);
  }

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Propiedades',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Propiedad eliminada exitosamente' });
};

export const exportPropiedades = async (req, res) => {
  const tenantPrisma = req.db;
  const propiedades = await tenantPrisma.propiedades.findMany({
    include: {
      clientes: { select: { nombre: true } },
      t_propiedad: { select: { nombre: true } }
    },
    orderBy: { nombre: 'asc' }
  });

  const data = propiedades.map(p => ({
    codigo: p.codigo_insai || 'N/A',
    nombre: p.nombre,
    rif: p.rif || 'N/A',
    productor: p.clientes?.nombre || 'N/A',
    tipo: p.t_propiedad?.nombre || 'N/A',
    superficie: p.hectareas_totales || 0,
    status: p.status
  }));

  const buffer = await excelService.generate({
    title: 'Reporte Nacional de Propiedades y Predios - INSAI',
    columns: [
      { header: 'Código INSAI', key: 'codigo', width: 20 },
      { header: 'Nombre del Predio', key: 'nombre', width: 40 },
      { header: 'RIF', key: 'rif', width: 20 },
      { header: 'Productor (Dueño)', key: 'productor', width: 40 },
      { header: 'Tipo de Propiedad', key: 'tipo', width: 25 },
      { header: 'Superficie (Ha)', key: 'superficie', width: 15 },
      { header: 'Estatus', key: 'status', width: 15 },
    ],
    data,
    sheetName: 'Propiedades'
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_propiedades.xlsx');
  res.send(buffer);
};
