import bitacoraService from '../services/bitacora.service.js';
import excelService from '../services/excel.service.js';

export const getClientes = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { q } = req.query;

  const where = q ? {
    OR: [
      { nombre: { contains: q, mode: 'insensitive' } },
      { cedula_rif: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ]
  } : {};

  const [clientes, totalCount] = await Promise.all([
    tenantPrisma.clientes.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
    }),
    tenantPrisma.clientes.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: clientes,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getClienteById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const cliente = await tenantPrisma.clientes.findUnique({
    where: { id: Number(id) },
    include: {
      propiedades: true,
    }
  });

  if (!cliente) {
    return res.status(404).json({ status: 'error', message: 'Cliente no encontrado' });
  }

  res.status(200).json({ status: 'success', data: cliente });
};

export const createCliente = async (req, res) => {
  const tenantPrisma = req.db;
  const { cedula_rif, nombre, codigo_runsai, telefono, email, direccion_fiscal } = req.body;

  const existing = await tenantPrisma.clientes.findUnique({ where: { cedula_rif } });
  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Ya existe un cliente con esta cédula/RIF' });
  }

  const response = await tenantPrisma.clientes.create({
    data: { cedula_rif, nombre, codigo_runsai, telefono, email, direccion_fiscal },
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Clientes',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updateCliente = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const data = req.body;

  const existing = await tenantPrisma.clientes.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Cliente no encontrado' });
  }

  if (data.cedula_rif && data.cedula_rif !== existing.cedula_rif) {
    const duplicate = await tenantPrisma.clientes.findUnique({ where: { cedula_rif: data.cedula_rif } });
    if (duplicate) {
      return res.status(400).json({ status: 'error', message: 'La cédula/RIF ya está registrada por otro cliente' });
    }
  }

  const response = await tenantPrisma.clientes.update({
    where: { id: Number(id) },
    data,
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Clientes',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteCliente = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.clientes.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Cliente no encontrado' });
  }

  const hasPropiedades = await tenantPrisma.propiedades.findFirst({ where: { due_o_id: Number(id) } });
  if (hasPropiedades) {
    return res.status(400).json({ status: 'error', message: 'No se puede eliminar el cliente porque tiene propiedades asociadas' });
  }

  await tenantPrisma.clientes.delete({ where: { id: Number(id) } });

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Clientes',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Cliente eliminado exitosamente' });
};

export const exportClientes = async (req, res) => {
  const tenantPrisma = req.db;
  const clientes = await tenantPrisma.clientes.findMany({ orderBy: { nombre: 'asc' } });

  const buffer = await excelService.generate({
    title: 'Reporte de Clientes/Productores - INSAI',
    columns: [
      { header: 'Cédula/RIF', key: 'cedula_rif', width: 20 },
      { header: 'Nombre', key: 'nombre', width: 40 },
      { header: 'Código RUNSAI', key: 'codigo_runsai', width: 20 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Dirección Fiscal', key: 'direccion_fiscal', width: 50 },
    ],
    data: clientes,
    sheetName: 'Clientes'
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=reporte_clientes.xlsx');
  res.send(buffer);
};
