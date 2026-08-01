import bitacoraService from '../services/bitacora.service.js';
import storageService from '../services/storage.service.js';
import imageService from '../services/image.service.js';
import excelService from '../services/excel.service.js';
import pdfService from '../services/pdf.service.js';

export const getEmpleados = async (req, res) => {
  const tenantPrisma = req.db;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const { q, search, departamento_id, status_laboral } = req.query;
  const searchTerm = q || search;

  const where = {
    AND: [
      departamento_id ? { departamento_id: Number(departamento_id) } : {},
      status_laboral ? { status_laboral } : {},
    ]
  };

  if (searchTerm && searchTerm.trim()) {
    const tokens = searchTerm.trim().split(/\s+/).filter(Boolean);
    tokens.forEach((token) => {
      where.AND.push({
        OR: [
          { nombre: { contains: token, mode: 'insensitive' } },
          { apellido: { contains: token, mode: 'insensitive' } },
          { cedula: { contains: token, mode: 'insensitive' } },
          { email: { contains: token, mode: 'insensitive' } },
          { telefono: { contains: token, mode: 'insensitive' } },
          { cargos: { nombre: { contains: token, mode: 'insensitive' } } },
          { departamentos: { nombre: { contains: token, mode: 'insensitive' } } },
          { oficinas: { nombre: { contains: token, mode: 'insensitive' } } },
        ]
      });
    });
  }

  const [empleados, totalCount] = await Promise.all([
    tenantPrisma.empleados.findMany({
      where,
      skip,
      take: limit,
      orderBy: { apellido: 'asc' },
      include: {
        cargos: { select: { nombre: true } },
        departamentos: { select: { nombre: true } },
        profesiones: { select: { nombre: true } },
        oficinas: { select: { nombre: true } },
        contrato: { select: { nombre: true } },
        empleado_foto: { select: { foto_url: true }, take: 1, orderBy: { created_at: 'desc' } },
        empleados_programas: { include: { programas: { select: { id: true, nombre: true } } } },
        empleado_residencia: {
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
    }),
    tenantPrisma.empleados.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: empleados,
    pagination: {
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      limit,
    },
  });
};

export const getEmpleadoById = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const empleado = await tenantPrisma.empleados.findUnique({
    where: { id: Number(id) },
    include: {
      cargos: true,
      departamentos: true,
      profesiones: true,
      oficinas: true,
      contrato: true,
      empleado_foto: { orderBy: { created_at: 'desc' } },
      empleado_residencia: {
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
      },
      empleados_programas: { include: { programas: true } },
      planificacion_empleados: {
        include: {
          planificaciones: true
        }
      }
    }
  });

  if (!empleado) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  let foto_data_url = null;
  const rawFotoUrl = empleado.empleado_foto?.[0]?.foto_url;
  if (rawFotoUrl) {
    foto_data_url = await imageService.toPdfDataUrl(rawFotoUrl);
  }

  res.status(200).json({ status: 'success', data: { ...empleado, foto_data_url } });
};

export const getEmpleadoReporte = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const empleado = await tenantPrisma.empleados.findUnique({
    where: { id: Number(id) },
    include: {
      cargos: true,
      departamentos: true,
      profesiones: true,
      oficinas: true,
      contrato: true,
      empleado_foto: { orderBy: { created_at: 'desc' } },
      empleado_residencia: {
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
      },
      empleados_programas: { include: { programas: true } },
      planificacion_empleados: {
        include: {
          planificaciones: true
        }
      }
    }
  });

  if (!empleado) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  let foto_data_url = null;
  const rawFotoUrl = empleado.empleado_foto?.[0]?.foto_url;
  if (rawFotoUrl) {
    foto_data_url = await imageService.toPdfDataUrl(rawFotoUrl);
  }

  res.status(200).json({
    status: 'success',
    data: {
      ...empleado,
      foto_data_url
    }
  });
};

export const createEmpleado = async (req, res) => {
  const tenantPrisma = req.db;
  const {
    cedula, nombre, apellido, telefono, email, fechas_ingreso, status_laboral,
    contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
    foto_url, residencia, programas_ids
  } = req.body;

  const existing = await tenantPrisma.empleados.findUnique({ where: { cedula } });
  if (existing) {
    return res.status(400).json({ status: 'error', message: 'Ya existe un empleado con esta cédula' });
  }

  let finalFotoUrl = foto_url;
  if (req.file) {
    finalFotoUrl = await storageService.uploadImage(req.file.buffer, `${nombre}-${apellido}`, 'empleados');
  }

  let parsedResidencia = residencia;
  if (typeof residencia === 'string') {
    try {
      parsedResidencia = JSON.parse(residencia);
    } catch (e) {
      console.error('Error parsing residencia JSON:', e);
    }
  }

  const residenciaData = parsedResidencia ? {
    sector_id: parsedResidencia.sector_id ? Number(parsedResidencia.sector_id) : null,
    direccion_detallada: parsedResidencia.direccion_detallada || null,
    punto_referencia: parsedResidencia.punto_referencia || null,
    google_maps_url: parsedResidencia.google_maps_url || null,
  } : undefined;

  const response = await tenantPrisma.empleados.create({
    data: {
      cedula, nombre, apellido, telefono, email,
      fechas_ingreso: fechas_ingreso ? new Date(fechas_ingreso) : null,
      status_laboral,
      contrato_id: contrato_id ? Number(contrato_id) : null,
      cargo_id: cargo_id ? Number(cargo_id) : null,
      departamento_id: departamento_id ? Number(departamento_id) : null,
      profesion_id: profesion_id ? Number(profesion_id) : null,
      oficina_id: oficina_id ? Number(oficina_id) : null,
      usuario_global_id: usuario_global_id ? Number(usuario_global_id) : null,
      empleado_foto: finalFotoUrl ? { create: { foto_url: finalFotoUrl } } : undefined,
      empleado_residencia: residenciaData ? { create: residenciaData } : undefined,
      empleados_programas: programas_ids ? {
        create: (Array.isArray(programas_ids) ? programas_ids : JSON.parse(programas_ids || '[]')).map((id) => ({ programa_id: Number(id) }))
      } : undefined,
    },
    include: {
      empleado_foto: true,
      empleado_residencia: {
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
      },
      empleados_programas: true,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'CREAR',
    modulo: 'Empleados',
    payload_nuevo: response
  });

  res.status(201).json({ status: 'success', data: response });
};

export const updateEmpleado = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;
  const {
    cedula, nombre, apellido, telefono, email, fechas_ingreso, status_laboral,
    contrato_id, cargo_id, departamento_id, profesion_id, oficina_id, usuario_global_id,
    foto_url, residencia, programas_ids
  } = req.body;

  const existing = await tenantPrisma.empleados.findUnique({ where: { id: Number(id) } });
  if (!existing) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  if (cedula && cedula !== existing.cedula) {
    const duplicate = await tenantPrisma.empleados.findUnique({ where: { cedula } });
    if (duplicate) {
      return res.status(400).json({ status: 'error', message: 'La cédula ya está registrada por otro empleado' });
    }
  }

  let finalFotoUrl = foto_url;
  if (req.file) {
    finalFotoUrl = await storageService.uploadImage(req.file.buffer, `${nombre || existing.nombre}-${apellido || existing.apellido}`, 'empleados');

    const oldFoto = await tenantPrisma.empleado_foto.findFirst({
      where: { empleado_id: Number(id) },
      orderBy: { created_at: 'desc' }
    });

    if (oldFoto) {
      await storageService.deleteFile(oldFoto.foto_url);
    }
  }

  let parsedResidencia = residencia;
  if (typeof residencia === 'string') {
    try {
      parsedResidencia = JSON.parse(residencia);
    } catch (e) {
      console.error('Error parsing residencia JSON:', e);
    }
  }

  const residenciaData = parsedResidencia ? {
    sector_id: parsedResidencia.sector_id ? Number(parsedResidencia.sector_id) : null,
    direccion_detallada: parsedResidencia.direccion_detallada || null,
    punto_referencia: parsedResidencia.punto_referencia || null,
    google_maps_url: parsedResidencia.google_maps_url || null,
  } : undefined;

  let parsedProgramasIds = programas_ids;
  if (typeof programas_ids === 'string') {
    try {
      parsedProgramasIds = JSON.parse(programas_ids);
    } catch (e) {
      console.error('Error parsing programas_ids JSON:', e);
    }
  }

  const response = await tenantPrisma.empleados.update({
    where: { id: Number(id) },
    data: {
      cedula, nombre, apellido, telefono, email,
      fechas_ingreso: fechas_ingreso ? new Date(fechas_ingreso) : undefined,
      status_laboral,
      contrato_id: contrato_id !== undefined ? (contrato_id ? Number(contrato_id) : null) : undefined,
      cargo_id: cargo_id !== undefined ? (cargo_id ? Number(cargo_id) : null) : undefined,
      departamento_id: departamento_id !== undefined ? (departamento_id ? Number(departamento_id) : null) : undefined,
      profesion_id: profesion_id !== undefined ? (profesion_id ? Number(profesion_id) : null) : undefined,
      oficina_id: oficina_id !== undefined ? (oficina_id ? Number(oficina_id) : null) : undefined,
      usuario_global_id: usuario_global_id !== undefined ? (usuario_global_id ? Number(usuario_global_id) : null) : undefined,
      empleado_foto: finalFotoUrl ? { create: { foto_url: finalFotoUrl } } : undefined,
      empleado_residencia: residenciaData ? {
        deleteMany: {},
        create: residenciaData
      } : undefined,
      empleados_programas: parsedProgramasIds ? {
        deleteMany: {},
        create: parsedProgramasIds.map((pid) => ({ programa_id: Number(pid) }))
      } : undefined,
    },
    include: {
      empleado_foto: true,
      empleado_residencia: {
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
      },
      empleados_programas: true,
    }
  });

  bitacoraService.registrar({
    req,
    accion: 'ACTUALIZAR',
    modulo: 'Empleados',
    payload_previo: existing,
    payload_nuevo: response
  });

  res.status(200).json({ status: 'success', data: response });
};

export const deleteEmpleado = async (req, res) => {
  const tenantPrisma = req.db;
  const { id } = req.params;

  const toDelete = await tenantPrisma.empleados.findUnique({ where: { id: Number(id) } });
  if (!toDelete) {
    return res.status(404).json({ status: 'error', message: 'Empleado no encontrado' });
  }

  const inUse = await tenantPrisma.planificacion_empleados.findFirst({ where: { empleado_id: Number(id) } });
  if (inUse) {
    return res.status(400).json({ status: 'error', message: 'No se puede eliminar el empleado porque está asignado a planificaciones activas' });
  }

  const fotos = await tenantPrisma.empleado_foto.findMany({
    where: { empleado_id: Number(id) }
  });

  await tenantPrisma.empleados.delete({ where: { id: Number(id) } });

  for (const foto of fotos) {
    await storageService.deleteFile(foto.foto_url);
  }

  bitacoraService.registrar({
    req,
    accion: 'ELIMINAR',
    modulo: 'Empleados',
    payload_previo: toDelete
  });

  res.status(200).json({ status: 'success', message: 'Empleado eliminado exitosamente' });
};
export const exportEmpleados = async (req, res) => {
  const tenantPrisma = req.db;
  const { q, search, departamento_id, status_laboral } = req.query;
  const searchTerm = (q || search || '').trim();

  const where = {
    AND: [
      departamento_id ? { departamento_id: Number(departamento_id) } : {},
      status_laboral ? { status_laboral } : {},
      searchTerm ? {
        OR: [
          { nombre: { contains: searchTerm, mode: 'insensitive' } },
          { apellido: { contains: searchTerm, mode: 'insensitive' } },
          { cedula: { contains: searchTerm, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const empleados = await tenantPrisma.empleados.findMany({
    where,
    include: {
      departamentos: { select: { nombre: true } },
      cargos: { select: { nombre: true } },
      oficinas: { select: { nombre: true } }
    },
    orderBy: { apellido: 'asc' }
  });

  const data = empleados.map(e => ({
    cedula: e.cedula,
    nombre_completo: `${e.nombre} ${e.apellido}`,
    email: e.email || 'N/A',
    telefono: e.telefono || 'N/A',
    departamento: e.departamentos?.nombre || 'N/A',
    cargo: e.cargos?.nombre || 'N/A',
    oficina: e.oficinas?.nombre || 'N/A',
    status: e.status_laboral
  }));

  const buffer = await excelService.generate({
    title: 'Reporte Nacional de Empleados - INSAI',
    columns: [
      { header: 'Cédula', key: 'cedula', width: 15 },
      { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Teléfono', key: 'telefono', width: 20 },
      { header: 'Departamento', key: 'departamento', width: 25 },
      { header: 'Cargo', key: 'cargo', width: 25 },
      { header: 'Oficina', key: 'oficina', width: 25 },
      { header: 'Estatus', key: 'status', width: 15 },
    ],
    data,
    sheetName: 'Empleados'
  });

  let filename = 'reporte_empleados.xlsx';
  if (q || departamento_id || status_laboral) {
    filename = 'reporte_empleados_filtrado.xlsx';
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  bitacoraService.registrar({
    req,
    accion: 'EXPORTAR_EXCEL',
    modulo: 'Empleados',
    payload_nuevo: { registros_exportados: data.length }
  });

  res.send(buffer);
};

export const exportEmpleadosPdf = async (req, res) => {
  const tenantPrisma = req.db;
  const { q, search, departamento_id, status_laboral } = req.query;
  const searchTerm = (q || search || '').trim();

  const where = {
    AND: [
      departamento_id ? { departamento_id: Number(departamento_id) } : {},
      status_laboral ? { status_laboral } : {},
      searchTerm ? {
        OR: [
          { nombre: { contains: searchTerm, mode: 'insensitive' } },
          { apellido: { contains: searchTerm, mode: 'insensitive' } },
          { cedula: { contains: searchTerm, mode: 'insensitive' } },
        ]
      } : {}
    ]
  };

  const empleados = await tenantPrisma.empleados.findMany({
    where,
    include: {
      departamentos: { select: { nombre: true } },
      cargos: { select: { nombre: true } },
      oficinas: { select: { nombre: true } }
    },
    orderBy: { apellido: 'asc' }
  });

  const data = empleados.map(e => ({
    cedula: e.cedula,
    nombre_completo: `${e.nombre} ${e.apellido}`,
    email: e.email || 'N/A',
    telefono: e.telefono || 'N/A',
    departamento: e.departamentos?.nombre || 'N/A',
    cargo: e.cargos?.nombre || 'N/A',
    oficina: e.oficinas?.nombre || 'N/A',
    status: e.status_laboral
  }));

  const buffer = await pdfService.generateTable({
    title: 'Reporte Nacional de Empleados - INSAI',
    columns: [
      { header: 'Cédula', key: 'cedula', width: 55 },
      { header: 'Nombre Completo', key: 'nombre_completo' },
      { header: 'Email', key: 'email' },
      { header: 'Teléfono', key: 'telefono', width: 65 },
      { header: 'Departamento', key: 'departamento' },
      { header: 'Cargo', key: 'cargo' },
      { header: 'Oficina', key: 'oficina' },
      { header: 'Estatus', key: 'status', width: 55 }
    ],
    data,
    orientation: 'landscape'
  });

  let filename = 'reporte_empleados.pdf';
  if (q || departamento_id || status_laboral) {
    filename = 'reporte_empleados_filtrado.pdf';
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  bitacoraService.registrar({
    req,
    accion: 'EXPORTAR_PDF',
    modulo: 'Empleados',
    payload_nuevo: { registros_exportados: data.length }
  });

  res.send(buffer);
};
