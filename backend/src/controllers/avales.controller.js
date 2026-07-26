import inventoryService from '../services/inventory.service.js';
import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';

export const getAvales = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { q } = req.query;

  const where = { AND: [] };
  if (q && q.trim()) {
    const tokens = q.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((token) => {
      where.AND.push({
        OR: [
          { numero_aval: { contains: token, mode: 'insensitive' } },
          { codigo_predio: { contains: token, mode: 'insensitive' } },
          { inspecciones: { n_control: { contains: token, mode: 'insensitive' } } },
          {
            empleados_avales_sanitarios_medico_responsable_idToempleados: {
              nombre: { contains: token, mode: 'insensitive' }
            }
          },
          {
            empleados_avales_sanitarios_medico_responsable_idToempleados: {
              apellido: { contains: token, mode: 'insensitive' }
            }
          }
        ]
      });
    });
  }

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

  const parsedInspeccionId = (inspeccion_id && inspeccion_id !== 'none' && inspeccion_id !== 'null' && !isNaN(Number(inspeccion_id))) ? Number(inspeccion_id) : null;
  const parsedMedicoId = (medico_responsable_id && medico_responsable_id !== 'none' && medico_responsable_id !== 'null' && !isNaN(Number(medico_responsable_id))) ? Number(medico_responsable_id) : null;
  const parsedJefeOsaId = (jefe_osa_id && jefe_osa_id !== 'none' && jefe_osa_id !== 'null' && !isNaN(Number(jefe_osa_id))) ? Number(jefe_osa_id) : null;

  let hierroUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `aval-hierro-${numero_aval}-${index}`, 'avales/hierros')
    );
    hierroUrls = await Promise.all(uploadPromises);
  }

  let cleanBov = null;
  if (hallazgos_bov_buf) {
    try {
      const parsed = typeof hallazgos_bov_buf === 'string' ? JSON.parse(hallazgos_bov_buf) : hallazgos_bov_buf;
      const { id, aval_id, created_at, updated_at, ...rest } = parsed;
      cleanBov = {};
      for (const [k, v] of Object.entries(rest)) {
        cleanBov[k] = Number(v) || 0;
      }
      cleanBov.total_bov_buf = Object.values(cleanBov).reduce((a, b) => a + (Number(b) || 0), 0);
    } catch (e) {
      console.error('Error parsing hallazgos_bov_buf:', e);
    }
  }

  let cleanOtras = null;
  if (hallazgos_otras) {
    try {
      const parsed = typeof hallazgos_otras === 'string' ? JSON.parse(hallazgos_otras) : hallazgos_otras;
      cleanOtras = parsed.map(h => ({
        tipo_animal_id: Number(h.tipo_animal_id),
        machos: Number(h.machos) || 0,
        hembras: Number(h.hembras) || 0,
        crias: Number(h.crias) || 0,
        total: (Number(h.machos) || 0) + (Number(h.hembras) || 0) + (Number(h.crias) || 0)
      }));
    } catch (e) {
      console.error('Error parsing hallazgos_otras:', e);
    }
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      const aval = await tx.avales_sanitarios.create({
        data: {
          numero_aval,
          codigo_predio: codigo_predio || null,
          fecha_emision: fecha_emision ? new Date(fecha_emision) : new Date(),
          fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
          certificado_vacunacion_n: certificado_vacunacion_n || null,
          observaciones: observaciones || null,
          inspeccion_id: parsedInspeccionId,
          medico_responsable_id: parsedMedicoId,
          jefe_osa_id: parsedJefeOsaId,
          aval_hallazgos_bov_buf: cleanBov ? { create: cleanBov } : undefined,
          aval_hallazgos_otras: cleanOtras && cleanOtras.length > 0 ? { create: cleanOtras } : undefined,
          aval_hierros: hierroUrls.length > 0 ? {
            create: hierroUrls.map(url => ({ hierro_img_url: url }))
          } : undefined
        }
      });

      if (biologicos) {
        const parsedBiologicos = typeof biologicos === 'string' ? JSON.parse(biologicos) : biologicos;
        for (const bio of parsedBiologicos) {
          if (!bio.insumo_id) continue;
          await tx.aval_biologicos.create({
            data: {
              aval_id: aval.id,
              insumo_id: Number(bio.insumo_id),
              fecha_vacunacion: bio.fecha_vacunacion ? new Date(bio.fecha_vacunacion) : null,
              pruebas_diagnosticas: bio.pruebas_diagnosticas || null
            }
          });

          await inventoryService.registrarMovimiento({
            tx,
            insumo_id: Number(bio.insumo_id),
            oficina_id: Number(bio.oficina_id),
            tipo_movimiento: 'CONSUMO',
            cantidad: Number(bio.cantidad) || 1,
            lote: bio.lote || null,
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
    console.error('Error en createAval:', error);
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

  const parsedMedicoId = (medico_responsable_id && medico_responsable_id !== 'none' && medico_responsable_id !== 'null' && !isNaN(Number(medico_responsable_id))) ? Number(medico_responsable_id) : null;
  const parsedJefeOsaId = (jefe_osa_id && jefe_osa_id !== 'none' && jefe_osa_id !== 'null' && !isNaN(Number(jefe_osa_id))) ? Number(jefe_osa_id) : null;

  let cleanBov = null;
  if (hallazgos_bov_buf) {
    try {
      const parsed = typeof hallazgos_bov_buf === 'string' ? JSON.parse(hallazgos_bov_buf) : hallazgos_bov_buf;
      const { id, aval_id, created_at, updated_at, ...rest } = parsed;
      cleanBov = {};
      for (const [k, v] of Object.entries(rest)) {
        cleanBov[k] = Number(v) || 0;
      }
      cleanBov.total_bov_buf = Object.values(cleanBov).reduce((a, b) => a + (Number(b) || 0), 0);
    } catch (e) {
      console.error('Error parsing hallazgos_bov_buf in update:', e);
    }
  }

  let cleanOtras = null;
  if (hallazgos_otras) {
    try {
      const parsed = typeof hallazgos_otras === 'string' ? JSON.parse(hallazgos_otras) : hallazgos_otras;
      cleanOtras = parsed.map(h => ({
        tipo_animal_id: Number(h.tipo_animal_id),
        machos: Number(h.machos) || 0,
        hembras: Number(h.hembras) || 0,
        crias: Number(h.crias) || 0,
        total: (Number(h.machos) || 0) + (Number(h.hembras) || 0) + (Number(h.crias) || 0)
      }));
    } catch (e) {
      console.error('Error parsing hallazgos_otras in update:', e);
    }
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

        const parsedBiologicos = typeof biologicos === 'string' ? JSON.parse(biologicos) : biologicos;
        for (const bio of parsedBiologicos) {
          if (!bio.insumo_id) continue;
          await tx.aval_biologicos.create({
            data: {
              aval_id: existing.id,
              insumo_id: Number(bio.insumo_id),
              fecha_vacunacion: bio.fecha_vacunacion ? new Date(bio.fecha_vacunacion) : null,
              pruebas_diagnosticas: bio.pruebas_diagnosticas || null
            }
          });

          await inventoryService.registrarMovimiento({
            tx,
            insumo_id: Number(bio.insumo_id),
            oficina_id: Number(bio.oficina_id),
            tipo_movimiento: 'CONSUMO',
            cantidad: Number(bio.cantidad) || 1,
            lote: bio.lote || null,
            aval_id: existing.id,
            empleado_id,
            observaciones: `Consumo actualizado por Aval ${existing.numero_aval}`
          });
        }
      }

      const updated = await tx.avales_sanitarios.update({
        where: { id: Number(id) },
        data: {
          codigo_predio: codigo_predio || undefined,
          fecha_emision: fecha_emision ? new Date(fecha_emision) : undefined,
          fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : undefined,
          certificado_vacunacion_n: certificado_vacunacion_n || undefined,
          observaciones: observaciones || undefined,
          medico_responsable_id: parsedMedicoId,
          jefe_osa_id: parsedJefeOsaId,
          aval_hallazgos_bov_buf: cleanBov ? {
            deleteMany: {},
            create: cleanBov
          } : undefined,
          aval_hallazgos_otras: cleanOtras && cleanOtras.length > 0 ? {
            deleteMany: {},
            create: cleanOtras
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
    console.error('Error en updateAval:', error);
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
    console.error('Error en deleteAval:', error);
    res.status(400).json({ status: 'error', message: error.message });
  }
};
