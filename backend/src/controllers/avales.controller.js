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

  // Manejo de imágenes de hierros
  let hierroUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file, index) =>
      storageService.uploadImage(file.buffer, `aval-hierro-${numero_aval}-${index}`, 'avales/hierros')
    );
    hierroUrls = await Promise.all(uploadPromises);
  }

  try {
    const response = await tenantPrisma.$transaction(async (tx) => {
      // 1. Crear el Aval
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
          // Hallazgos Bov/Buf (uno a uno)
          aval_hallazgos_bov_buf: hallazgos_bov_buf ? {
            create: {
              ...JSON.parse(hallazgos_bov_buf),
              total_bov_buf: Object.values(JSON.parse(hallazgos_bov_buf)).reduce((a, b) => a + (Number(b) || 0), 0)
            }
          } : undefined,
          // Otras especies (uno a muchos)
          aval_hallazgos_otras: hallazgos_otras ? {
            create: JSON.parse(hallazgos_otras).map(h => ({
              tipo_animal_id: h.tipo_animal_id,
              machos: h.machos,
              hembras: h.hembras,
              crias: h.crias,
              total: (h.machos || 0) + (h.hembras || 0) + (h.crias || 0)
            }))
          } : undefined,
          // Imágenes de hierros
          aval_hierros: hierroUrls.length > 0 ? {
            create: hierroUrls.map(url => ({ hierro_img_url: url }))
          } : undefined
        }
      });

      // 2. Registrar biológicos y descontar inventario
      if (biologicos) {
        const parsedBiologicos = JSON.parse(biologicos);
        for (const bio of parsedBiologicos) {
          // Guardar en tabla de biológicos vinculada al aval
          await tx.aval_biologicos.create({
            data: {
              aval_id: aval.id,
              insumo_id: bio.insumo_id,
              fecha_vacunacion: bio.fecha_vacunacion ? new Date(bio.fecha_vacunacion) : null,
              pruebas_diagnosticas: bio.pruebas_diagnosticas
            }
          });

          // Registrar salida de inventario
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
