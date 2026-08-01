import inventoryService from '../services/inventory.service.js';
import bitacoraService from '../services/bitacora.service.js';

export const getAllStock = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { oficina_id, q, search, low_stock } = req.query;
  const searchTerm = q || search;

  const where = {};
  if (oficina_id) {
    where.oficina_id = Number(oficina_id);
  }
  if (searchTerm && searchTerm.trim()) {
    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    where.AND = tokens.map((token) => ({
      insumos: {
        OR: [
          { nombre: { contains: token, mode: 'insensitive' } },
          { codigo: { contains: token, mode: 'insensitive' } },
          { marca: { contains: token, mode: 'insensitive' } }
        ]
      }
    }));
  }

  const stock = await tenantPrisma.insumos_stock.findMany({
    where,
    include: {
      insumos: {
        include: {
          c_insumos: true,
          t_unidades: true
        }
      },
      oficinas: {
        select: { id: true, nombre: true }
      }
    },
    orderBy: { updated_at: 'desc' }
  });

  let filteredStock = stock;
  if (low_stock === 'true') {
    filteredStock = stock.filter(
      (item) => Number(item.stock_actual) <= Number(item.stock_minimo)
    );
  }

  const totalCount = filteredStock.length;
  const paginatedData = filteredStock.slice(skip, skip + limit);

  res.status(200).json({
    status: 'success',
    data: paginatedData,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
    },
  });
};

export const getStockByOficina = async (req, res) => {
  const tenantPrisma = req.db;
  const { oficina_id } = req.params;
  const { q, search } = req.query;
  const searchTerm = q || search;

  const where = {
    oficina_id: Number(oficina_id)
  };

  if (searchTerm && searchTerm.trim()) {
    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    where.AND = tokens.map((token) => ({
      insumos: {
        OR: [
          { nombre: { contains: token, mode: 'insensitive' } },
          { codigo: { contains: token, mode: 'insensitive' } }
        ]
      }
    }));
  }

  const stock = await tenantPrisma.insumos_stock.findMany({
    where,
    include: {
      insumos: {
        include: {
          c_insumos: true,
          t_unidades: true
        }
      },
      oficinas: {
        select: { id: true, nombre: true }
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
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { insumo_id, oficina_id, tipo_movimiento, search, q } = req.query;
  const searchTerm = search || q;

  const where = {};
  if (insumo_id) where.insumo_id = Number(insumo_id);
  if (oficina_id) where.oficina_id = Number(oficina_id);
  if (tipo_movimiento) where.tipo_movimiento = String(tipo_movimiento);
  if (searchTerm && searchTerm.trim()) {
    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    where.AND = tokens.map((token) => ({
      OR: [
        { insumos: { nombre: { contains: token, mode: 'insensitive' } } },
        { insumos: { codigo: { contains: token, mode: 'insensitive' } } },
        { lote: { contains: token, mode: 'insensitive' } },
        { observaciones: { contains: token, mode: 'insensitive' } }
      ]
    }));
  }

  const [movimientos, totalCount] = await Promise.all([
    tenantPrisma.movimientos_insumos.findMany({
      where,
      skip,
      take: limit,
      include: {
        insumos: {
          include: {
            t_unidades: true,
            c_insumos: true
          }
        },
        oficinas: { select: { id: true, nombre: true } },
        empleados: { select: { id: true, nombre: true, apellido: true } },
        inspecciones: { select: { id: true, n_control: true } },
        avales_sanitarios: { select: { id: true, numero_aval: true } },
        acta_silos: { select: { id: true, n_silos: true } },
        seguimiento_inspecciones: { select: { id: true } }
      },
      orderBy: { created_at: 'desc' },
    }),
    tenantPrisma.movimientos_insumos.count({ where })
  ]);

  res.status(200).json({
    status: 'success',
    data: movimientos,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
      currentPage: page,
      limit,
    },
  });
};

export const getInventoryKPIs = async (req, res) => {
  const tenantPrisma = req.db;

  try {
    const [totalInsumos, allStock, totalMovimientos] = await Promise.all([
      tenantPrisma.insumos.count(),
      tenantPrisma.insumos_stock.findMany({
        select: { stock_actual: true, stock_minimo: true }
      }),
      tenantPrisma.movimientos_insumos.count()
    ]);

    const stockBajoCount = allStock.filter(
      (item) => Number(item.stock_actual) <= Number(item.stock_minimo)
    ).length;

    res.status(200).json({
      status: 'success',
      data: {
        totalInsumos,
        totalStockItems: allStock.length,
        stockBajoCount,
        totalMovimientos
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateStockItem = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const { stock_minimo, lote, fecha_vencimiento } = req.body;

  try {
    const existing = await tenantPrisma.insumos_stock.findUnique({
      where: { id: Number(id) }
    });

    if (!existing) {
      return res.status(404).json({ status: 'error', message: 'Registro de stock no encontrado' });
    }

    const updated = await tenantPrisma.insumos_stock.update({
      where: { id: Number(id) },
      data: {
        stock_minimo: stock_minimo !== undefined ? Number(stock_minimo) : undefined,
        lote: lote !== undefined ? (lote || null) : undefined,
        fecha_vencimiento: fecha_vencimiento !== undefined
          ? (fecha_vencimiento ? new Date(fecha_vencimiento) : null)
          : undefined,
        updated_at: new Date()
      },
      include: {
        insumos: { include: { c_insumos: true, t_unidades: true } },
        oficinas: { select: { id: true, nombre: true } }
      }
    });

    bitacoraService.registrar({
      req,
      accion: 'UPDATE_STOCK_CONFIG',
      modulo: 'Inventario Insumos',
      payload_anterior: { stock_minimo: existing.stock_minimo, lote: existing.lote },
      payload_nuevo: { stock_minimo: updated.stock_minimo, lote: updated.lote }
    });

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};


