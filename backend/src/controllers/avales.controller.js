import inventoryService from '../services/inventory.service.js';
import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';

export const getAvales = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { q } = req.query;

  const where = q ? {
    OR: [
      { numero_aval: { contains: q, mode: 'insensitive' } },
      { codigo_predio: { contains: q, mode: 'insensitive' } }
    ]
  } : {};

  const [avales, totalCount] = await Promise.all([
    tenantPrisma.avales_sanitarios.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        inspecciones: { select: { n_control: true } },
        empleados_avales_sanitarios_medico_responsable_idToempleados: { select: { nombre: true, apellido: true } }
      }
    }),
    tenantPrisma.avales_sanitarios.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: avales,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const createAval = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    numero_aval, codigo_predio, fecha_emision, fecha_vencimiento,
    certificado_vacunacion_n, observaciones, inspeccion_id,
    medico_responsable_id, jefe_osa_id,
    hallazgos_bov_buf, hallazgos_otras, biologicos
  } = req.body;

  const empleado_id = req.user?.empleado_id || null;

  let hierroUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `aval-hierro-${numero_aval}-${index}`, 'avales/hierros')
    );
    hierroUrls = await Promise.all(uploadPromises);
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {

      const aval = await tx.avales_sanitarios.create({
        data: {
          numero_aval,
          codigo_predio,
          fecha_emision: fecha_emision ? new Date(fecha_emision) : new Date(),
          fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
          certificado_vacunacion_n,
          observaciones,
          inspeccion_id,
          medico_responsable_id,
          jefe_osa_id,
          aval_hallazgos_bov_buf: hallazgos_bov_buf ? {
            create: {
              ...JSON.parse(hallazgos_bov_buf),
              total_bov_buf: Object.values(JSON.parse(hallazgos_bov_buf)).reduce((a, b) => a + (Number(b) || 0), 0)
            }
          } : undefined,
          aval_hallazgos_otras: hallazgos_otras ? {
            create: JSON.parse(hallazgos_otras).map(h => ({
              tipo_animal_id: h.tipo_animal_id,
              machos: h.machos,
              hembras: h.hembras,
              crias: h.crias,
              total: (h.machos || 0) + (h.hembras || 0) + (h.crias || 0)
            }))
          } : undefined,
          aval_hierros: hierroUrls.length > 0 ? {
            create: hierroUrls.map(url => ({ hierro_img_url: url }))
          } : undefined
        }
      });


      if (biologicos) {
        const parsedBiologicos = JSON.parse(biologicos);
        for (const bio of parsedBiologicos) {

          await tx.aval_biologicos.create({
            data: {
              aval_id: aval.id,
              insumo_id: bio.insumo_id,
              fecha_vacunacion: bio.fecha_vacunacion ? new Date(bio.fecha_vacunacion) : null,
              pruebas_diagnosticas: bio.pruebas_diagnosticas
            }
          });


          await inventoryService.registrarMovimiento({
            tx,
            insumo_id: bio.insumo_id,
            oficina_id: bio.oficina_id,
            tipo_movimiento: 'CONSUMO',
            cantidad: bio.cantidad || 1,
            lote: bio.lote,
            aval_id: aval.id,
            empleado_id,
            observaciones: `Consumo automático por Aval ${numero_aval}`
          });
        }
      }

      return aval;
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Avales Sanitarios',
      payload_nuevo: response
    });

    res.status(201).json({ status: 'success', data: response });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getAvalById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const aval = await tenantPrisma.avales_sanitarios.findUnique({
    where: { id: Number(id) },
    include: {
      aval_biologicos: { include: { insumos: true } },
      aval_hallazgos_bov_buf: true,
      aval_hallazgos_otras: { include: { t_animales: true } },
      aval_hierros: true,
      inspecciones: true,
      empleados_avales_sanitarios_medico_responsable_idToempleados: true,
      empleados_avales_sanitarios_jefe_osa_idToempleados: true
    }
  });

  if (!aval) {
    return res.status(404).json({ status: 'error', message: 'Aval no encontrado' });
  }

  res.status(200).json({ status: 'success', data: aval });
};

export const updateAval = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const {
    codigo_predio, fecha_emision, fecha_vencimiento,
    certificado_vacunacion_n, observaciones,
    medico_responsable_id, jefe_osa_id,
    hallazgos_bov_buf, hallazgos_otras, biologicos
  } = req.body;

  const empleado_id = req.user?.empleado_id || null;

  const existing = await tenantPrisma.avales_sanitarios.findUnique({
    where: { id: Number(id) },
    include: { aval_hierros: true, aval_biologicos: true }
  });

  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Aval no encontrado' });
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {

      if (biologicos) {
        await inventoryService.revertirMovimientosDeProceso({
          tx,
          proceso_id: existing.id,
          tipo_proceso: 'aval',
          empleado_id
        });


        await tx.aval_biologicos.deleteMany({ where: { aval_id: existing.id } });


        const parsedBiologicos = JSON.parse(biologicos);
        for (const bio of parsedBiologicos) {
          await tx.aval_biologicos.create({
            data: {
              aval_id: existing.id,
              insumo_id: bio.insumo_id,
              fecha_vacunacion: bio.fecha_vacunacion ? new Date(bio.fecha_vacunacion) : null,
              pruebas_diagnosticas: bio.pruebas_diagnosticas
            }
          });

          await inventoryService.registrarMovimiento({
            tx,
            insumo_id: bio.insumo_id,
            oficina_id: bio.oficina_id,
            tipo_movimiento: 'CONSUMO',
            cantidad: bio.cantidad || 1,
            lote: bio.lote,
            aval_id: existing.id,
            empleado_id,
            observaciones: `Consumo actualizado por Aval ${existing.numero_aval}`
          });
        }
      }

      const updated = await tx.avales_sanitarios.update({
        where: { id: Number(id) },
        data: {
          codigo_predio,
          fecha_emision: fecha_emision ? new Date(fecha_emision) : undefined,
          fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : undefined,
          certificado_vacunacion_n,
          observaciones,
          medico_responsable_id,
          jefe_osa_id,
          aval_hallazgos_bov_buf: hallazgos_bov_buf ? {
            deleteMany: {},
            create: {
              ...JSON.parse(hallazgos_bov_buf),
              total_bov_buf: Object.values(JSON.parse(hallazgos_bov_buf)).reduce((a, b) => a + (Number(b) || 0), 0)
            }
          } : undefined,
          aval_hallazgos_otras: hallazgos_otras ? {
            deleteMany: {},
            create: JSON.parse(hallazgos_otras).map(h => ({
              tipo_animal_id: h.tipo_animal_id,
              machos: h.machos,
              hembras: h.hembras,
              crias: h.crias,
              total: (h.machos || 0) + (h.hembras || 0) + (h.crias || 0)
            }))
          } : undefined
        }
      });

      return updated;
    });

    bitacoraService.registrar({
      req,
      accion: 'ACTUALIZAR',
      modulo: 'Avales Sanitarios',
      payload_previo: existing,
      payload_nuevo: response
    });

    res.status(200).json({ status: 'success', data: response });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteAval = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const empleado_id = req.user?.empleado_id || null;

  const toDelete = await tenantPrisma.avales_sanitarios.findUnique({
    where: { id: Number(id) },
    include: { aval_hierros: true }
  });

  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Aval no encontrado' });
  }

  try {
    await tenantPrisma.$transaction(async (tx) => {
      await inventoryService.revertirMovimientosDeProceso({
        tx,
        proceso_id: Number(id),
        tipo_proceso: 'aval',
        empleado_id
      });

      for (const foto of toDelete.aval_hierros) {
        await storageService.deleteFile(foto.hierro_img_url);
      }

      await tx.avales_sanitarios.delete({ where: { id: Number(id) } });
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR',
      modulo: 'Avales Sanitarios',
      payload_previo: toDelete
    });

    res.status(200).json({ status: 'success', message: 'Aval eliminado y stock restaurado' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
