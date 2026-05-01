import inventoryService from '../services/inventory.service.js';
import bitacoraService from '../services/bitacora.service.js';

export const getStockByOficina = async (req, res) => {
  const tenantPrisma = req.db;
  const { oficina_id } = req.params;
  const { q } = req.query;

  const stock = await tenantPrisma.insumos_stock.findMany({
    where: {
      oficina_id: Number(oficina_id),
      insumos: q ? {
        nombre: { contains: q, mode: 'insensitive' }
      } : undefined
    },
    include: {
      insumos: {
        include: {
          c_insumos: true,
          t_unidades: true
        }
      }
    },
    orderBy: { updated_at: 'desc' }
  });

  res.status(200).json({ status: 'success', data: stock });
};

export const registrarMovimientoManual = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    insumo_id, oficina_id, tipo_movimiento, cantidad,
    lote, fecha_vencimiento, observaciones
  } = req.body;

  const empleado_id = req.user?.empleado_id || null;

  try {
    const result = await tenantPrisma.$transaction(async (tx) => {
      const movimiento = await inventoryService.registrarMovimiento({
        tx,
        insumo_id,
        oficina_id,
        tipo_movimiento,
        cantidad,
        lote,
        fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : null,
        empleado_id,
        observaciones
      });
      return movimiento;
    });

    bitacoraService.registrar({
      req,
      accion: tipo_movimiento,
      modulo: 'Inventario Insumos',
      payload_nuevo: result
    });

    res.status(201).json({ status: 'success', data: result });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getMovimientos = async (req, res) => {
  const tenantPrisma = req.db;
  const { insumo_id, oficina_id } = req.query;

  const movimientos = await tenantPrisma.movimientos_insumos.findMany({
    where: {
      insumo_id: insumo_id ? Number(insumo_id) : undefined,
      oficina_id: oficina_id ? Number(oficina_id) : undefined
    },
    include: {
      insumos: true,
      oficinas: true,
      empleados: true,
      inspecciones: { select: { n_control: true } },
      avales_sanitarios: { select: { numero_aval: true } }
    },
    orderBy: { created_at: 'desc' },
    take: 50
  });

  res.status(200).json({ status: 'success', data: movimientos });
};
