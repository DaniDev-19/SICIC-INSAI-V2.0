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
      { codigo_runsai: { contains: q, mode: 'insensitive' } },
    ]
  } : {};

  const [clientes, totalCount] = await Promise.all([
    tenantPrisma.clientes.findMany({
      where,
      skip,
      take: limit,
      orderBy: { nombre: 'asc' },
      include: {
        propiedades: {
          include: {
            t_propiedad: true,
            propiedad_ubicacion: {
              include: {
                sectores: {
                  include: {
                    parroquias: {
                      include: {
                        municipios: {
                          include: {
                            estados: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
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
      propiedades: {
        include: {
          t_propiedad: true,
          propiedad_ubicacion: {
            include: {
              sectores: {
                include: {
                  parroquias: {
                    include: {
                      municipios: {
                        include: {
                          estados: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
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

  if (codigo_runsai) {
    const runsaiExists = await tenantPrisma.clientes.findFirst({ where: { codigo_runsai } });
    if (runsaiExists) {
      return res.status(400).json({ status: 'error', message: 'El código RUNSAI ya está registrado por otro cliente' });
    }
  }

  if (email) {
    const emailExists = await tenantPrisma.clientes.findFirst({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ status: 'error', message: 'El correo electrónico ya está registrado por otro cliente' });
    }
  }

  const response = await tenantPrisma.clientes.create({
    data: { cedula_rif, nombre, codigo_runsai, telefono, email, direccion_fiscal },
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Clientes',
    payload_nuevo: response,
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

  if (data.codigo_runsai && data.codigo_runsai !== existing.codigo_runsai) {
    const runsaiExists = await tenantPrisma.clientes.findFirst({
      where: {
        codigo_runsai: data.codigo_runsai,
        id: { not: Number(id) }
      }
    });
    if (runsaiExists) {
      return res.status(400).json({ status: 'error', message: 'El código RUNSAI ya está registrado por otro cliente' });
    }
  }

  if (data.email && data.email !== existing.email) {
    const emailExists = await tenantPrisma.clientes.findFirst({
      where: {
        email: data.email,
        id: { not: Number(id) },
      },
    });
    if (emailExists) {
      return res.status(400).json({ status: 'error', message: 'El correo electrónico ya está registrado por otro cliente' });
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

export const deleteManyClientes = async (req, res) => {
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

  const toDelete = await tenantPrisma.clientes.findMany({
    where: { id: { in: numericIds } },
    include: { propiedades: true }
  });

  const withPropiedades = toDelete.filter(c => c.propiedades && c.propiedades.length > 0);
  const deletableIds = numericIds.filter(id => !withPropiedades.some(c => c.id === id));

  if (deletableIds.length > 0) {
    await tenantPrisma.clientes.deleteMany({
      where: { id: { in: deletableIds } },
    });

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_MASIVO',
      modulo: 'Clientes',
      payload_previo: toDelete.filter(c => deletableIds.includes(c.id))
    });
  }

  if (withPropiedades.length > 0) {
    return res.status(200).json({
      status: 'warning',
      message: `Se eliminaron ${deletableIds.length} clientes. ${withPropiedades.length} no se pudieron eliminar por tener propiedades asociadas.`,
      data: {
        deletedCount: deletableIds.length,
        skippedCount: withPropiedades.length,
        skippedNames: withPropiedades.map(c => c.nombre)
      }
    });
  }

  res.status(200).json({
    status: 'success',
    message: `Se eliminaron ${deletableIds.length} clientes exitosamente.`,
    data: { deletedCount: deletableIds.length }
  });
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
