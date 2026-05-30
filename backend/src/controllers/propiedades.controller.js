import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import excelService from '../services/excel.service.js';
import pdfService from '../services/pdf.service.js';

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
        propiedad_ubicacion: { include: { sectores: true } },
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
    tipo_propiedad_id, due_o_id, hierro, ubicacion, cultivos, animales,
    productor
  } = req.body;

  let finalHierroImgUrl = null;
  if (req.file) {
    finalHierroImgUrl = await storageService.uploadImage(req.file.buffer, `hierro-${nombre}`, 'propiedades');
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      let finalDueoId = due_o_id;

      if (productor) {
        const existingClient = await tx.clientes.findUnique({
          where: { cedula_rif: productor.cedula_rif }
        });

        if (existingClient) {
          if (productor.codigo_runsai && productor.codigo_runsai !== existingClient.codigo_runsai) {
            const runsaiConflict = await tx.clientes.findFirst({
              where: {
                codigo_runsai: productor.codigo_runsai,
                id: { not: existingClient.id }
              }
            });
            if (runsaiConflict) {
              const error = new Error('El código RUNSAI ya está registrado por otro cliente');
              error.statusCode = 400;
              throw error;
            }
          }

          if (productor.email && productor.email !== existingClient.email) {
            const emailConflict = await tx.clientes.findFirst({
              where: {
                email: productor.email,
                id: { not: existingClient.id }
              }
            });
            if (emailConflict) {
              const error = new Error('El correo electrónico ya está registrado por otro cliente');
              error.statusCode = 400;
              throw error;
            }
          }

          const updatedClient = await tx.clientes.update({
            where: { id: existingClient.id },
            data: {
              nombre: productor.nombre,
              codigo_runsai: productor.codigo_runsai,
              telefono: productor.telefono,
              email: productor.email,
              direccion_fiscal: productor.direccion_fiscal,
            }
          });
          finalDueoId = updatedClient.id;
        } else {
          if (productor.codigo_runsai) {
            const runsaiExists = await tx.clientes.findFirst({ where: { codigo_runsai: productor.codigo_runsai } });
            if (runsaiExists) {
              const error = new Error('El código RUNSAI ya está registrado por otro cliente');
              error.statusCode = 400;
              throw error;
            }
          }

          if (productor.email) {
            const emailExists = await tx.clientes.findFirst({ where: { email: productor.email } });
            if (emailExists) {
              const error = new Error('El correo electrónico ya está registrado por otro cliente');
              error.statusCode = 400;
              throw error;
            }
          }

          const newClient = await tx.clientes.create({
            data: {
              cedula_rif: productor.cedula_rif,
              nombre: productor.nombre,
              codigo_runsai: productor.codigo_runsai,
              telefono: productor.telefono,
              email: productor.email,
              direccion_fiscal: productor.direccion_fiscal,
            }
          });
          finalDueoId = newClient.id;
        }
      }

      if (!finalDueoId) {
        const error = new Error('Se requiere un dueño (cliente) para la propiedad');
        error.statusCode = 400;
        throw error;
      }

      if (rif) {
        const existingRif = await tx.propiedades.findFirst({ where: { rif } });
        if (existingRif) {
          const error = new Error('Ya existe una propiedad con este RIF');
          error.statusCode = 400;
          throw error;
        }
      }

      if (codigo_insai) {
        const existing = await tx.propiedades.findUnique({ where: { codigo_insai } });
        if (existing) {
          const error = new Error('Ya existe una propiedad con este código INSAI');
          error.statusCode = 400;
          throw error;
        }
      }

      let finalCodigo = codigo_insai;
      if (!finalCodigo) {
        const lastRecord = await tx.propiedades.findFirst({
          orderBy: { id: 'desc' },
          select: { id: true }
        });
        const nextId = (lastRecord?.id || 0) + 1;
        finalCodigo = `PRO-${new Date().getFullYear()}-${nextId.toString().padStart(4, '0')}`;
      }

      return await tx.propiedades.create({
        data: {
          codigo_insai: finalCodigo,
          nombre,
          rif,
          punto_referencia,
          hectareas_totales,
          status: status || 'ACTIVA',
          tipo_propiedad_id,
          due_o_id: finalDueoId,
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
    }, {
      isolationLevel: 'Serializable'
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Propiedades',
      payload_nuevo: response
    });

    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    if (finalHierroImgUrl) {
      await storageService.deleteFile(finalHierroImgUrl);
    }

    if (error.statusCode === 400) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
    console.error('Error creando propiedad:', error);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
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

  if (rif && rif !== existing.rif) {
    const duplicate = await tenantPrisma.propiedades.findFirst({ where: { rif } });
    if (duplicate) {
      return res.status(400).json({ status: 'error', message: 'El RIF ya está registrado por otra propiedad' });
    }
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
      nombre, rif, punto_referencia, hectareas_totales, status,
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

export const deleteManyPropiedades = async (req, res) => {
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

  const toDelete = await tenantPrisma.propiedades.findMany({
    where: { id: { in: numericIds } },
    include: { solicitudes: true, propiedad_hierro: true }
  });

  const withSolicitudes = toDelete.filter(p => p.solicitudes && p.solicitudes.length > 0);
  const deletableIds = numericIds.filter(id => !withSolicitudes.some(p => p.id === id));

  if (deletableIds.length > 0) {
    const imagesToDelete = toDelete
      .filter(p => deletableIds.includes(p.id) && p.propiedad_hierro?.[0]?.hierro_img_url)
      .map(p => p.propiedad_hierro[0].hierro_img_url);

    await tenantPrisma.propiedades.deleteMany({
      where: { id: { in: deletableIds } },
    });

    for (const img of imagesToDelete) {
      await storageService.deleteFile(img);
    }

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_MASIVO',
      modulo: 'Propiedades',
      payload_previo: toDelete.filter(p => deletableIds.includes(p.id))
    });
  }

  if (withSolicitudes.length > 0) {
    return res.status(200).json({
      status: 'warning',
      message: `Se eliminaron ${deletableIds.length} propiedades. ${withSolicitudes.length} no se pudieron eliminar por tener solicitudes asociadas.`,
      data: {
        deletedCount: deletableIds.length,
        skippedCount: withSolicitudes.length,
        skippedNames: withSolicitudes.map(p => p.nombre)
      }
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Se eliminaron ${deletableIds.length} propiedades exitosamente.`,
    data: { deletedCount: deletableIds.length }
  });
};

export const exportPropiedades = async (req, res) => {
  const tenantPrisma = req.db;
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

  const propiedades = await tenantPrisma.propiedades.findMany({
    where,
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

  let filename = 'reporte_propiedades.xlsx';
  if (q || tipo_propiedad_id || due_o_id) {
    filename = 'reporte_propiedades_filtrado.xlsx';
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(buffer);
};

export const exportPropiedadesPdf = async (req, res) => {
  const tenantPrisma = req.db;
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

  const propiedades = await tenantPrisma.propiedades.findMany({
    where,
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

  const buffer = await pdfService.generateTable({
    title: 'Reporte Nacional de Propiedades y Predios - INSAI',
    columns: [
      { header: 'Código INSAI', key: 'codigo', width: 90 },
      { header: 'Nombre del Predio', key: 'nombre' },
      { header: 'RIF', key: 'rif', width: 70 },
      { header: 'Productor', key: 'productor' },
      { header: 'Tipo de Propiedad', key: 'tipo' },
      { header: 'Superficie (Ha)', key: 'superficie', width: 65 },
      { header: 'Estatus', key: 'status', width: 80 }
    ],
    data,
    orientation: 'landscape'
  });

  let filename = 'reporte_propiedades.pdf';
  if (q || tipo_propiedad_id || due_o_id) {
    filename = 'reporte_propiedades_filtrado.pdf';
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(buffer);
};
