import { getTenantPrisma } from '../config/prisma.js';

export const searchGlobal = async (req, res) => {
  try {
    const q = req.query.q || req.query.search || '';
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({ status: 'success', data: [] });
    }

    const queryStr = q.trim();
    const tenantPrisma = getTenantPrisma(req.user.currentInstance.db_name);

    const [
      clientes,
      propiedades,
      empleados,
      inspecciones,
      planificaciones,
      silos,
      avales,
      oficinas,
      vehiculos
    ] = await Promise.all([
      // 1. Clientes / Productores
      tenantPrisma.clientes.findMany({
        where: {
          OR: [
            { nombre: { contains: queryStr, mode: 'insensitive' } },
            { cedula_rif: { contains: queryStr, mode: 'insensitive' } },
            { email: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, nombre: true, cedula_rif: true },
      }),

      // 2. Propiedades / Predios
      tenantPrisma.propiedades.findMany({
        where: {
          OR: [
            { nombre: { contains: queryStr, mode: 'insensitive' } },
            { codigo_insai: { contains: queryStr, mode: 'insensitive' } },
            { direccion: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, nombre: true, codigo_insai: true },
      }),

      // 3. Empleados / Inspectores
      tenantPrisma.empleados.findMany({
        where: {
          OR: [
            { nombre: { contains: queryStr, mode: 'insensitive' } },
            { apellido: { contains: queryStr, mode: 'insensitive' } },
            { cedula: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, nombre: true, apellido: true, cedula: true },
      }),

      // 4. Inspecciones Generales
      tenantPrisma.inspecciones.findMany({
        where: {
          OR: [
            { n_control: { contains: queryStr, mode: 'insensitive' } },
            { t_codigo: { contains: queryStr, mode: 'insensitive' } },
            { atendido_por_nombre: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, n_control: true, status: true, fecha_inspeccion: true },
      }),

      // 5. Planificaciones
      tenantPrisma.planificaciones.findMany({
        where: {
          OR: [
            { status: { contains: queryStr, mode: 'insensitive' } },
            { observaciones: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, status: true, fecha_programada: true },
      }),

      // 6. Inspecciones de Silos
      tenantPrisma.inspecciones_silos.findMany({
        where: {
          OR: [
            { n_acta: { contains: queryStr, mode: 'insensitive' } },
            { empresa_razon_social: { contains: queryStr, mode: 'insensitive' } },
            { empresa_rif: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, n_acta: true, empresa_razon_social: true },
      }),

      // 7. Avales Sanitarios
      tenantPrisma.avales_sanitarios.findMany({
        where: {
          OR: [
            { n_aval: { contains: queryStr, mode: 'insensitive' } },
            { codigo_predio: { contains: queryStr, mode: 'insensitive' } },
            { nombre_predio: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, n_aval: true, nombre_predio: true },
      }),

      // 8. Oficinas
      tenantPrisma.oficinas.findMany({
        where: {
          OR: [
            { nombre: { contains: queryStr, mode: 'insensitive' } },
            { direccion: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, nombre: true },
      }),

      // 9. Vehículos
      tenantPrisma.vehiculos.findMany({
        where: {
          OR: [
            { placa: { contains: queryStr, mode: 'insensitive' } },
            { modelo: { contains: queryStr, mode: 'insensitive' } },
            { marca: { contains: queryStr, mode: 'insensitive' } },
          ],
        },
        take: 4,
        select: { id: true, placa: true, modelo: true, marca: true },
      }),
    ]);

    const results = [
      ...clientes.map(c => ({
        id: `cliente-${c.id}`,
        title: c.nombre,
        subtitle: `RIF/Cédula: ${c.cedula_rif}`,
        category: 'Productor',
        route: '/home/productores',
      })),
      ...propiedades.map(p => ({
        id: `prop-${p.id}`,
        title: p.nombre,
        subtitle: `Código INSAI: ${p.codigo_insai || 'N/A'}`,
        category: 'Predio / Propiedad',
        route: '/home/propiedades',
      })),
      ...empleados.map(e => ({
        id: `emp-${e.id}`,
        title: `${e.nombre} ${e.apellido}`,
        subtitle: `Cédula: ${e.cedula}`,
        category: 'Inspector / Empleado',
        route: '/home/empleados',
      })),
      ...inspecciones.map(i => ({
        id: `insp-${i.id}`,
        title: `Inspección #${i.n_control}`,
        subtitle: `Estatus: ${i.status || 'Completada'}`,
        category: 'Inspección General',
        route: '/home/inspecc-generales',
      })),
      ...planificaciones.map(pl => ({
        id: `plan-${pl.id}`,
        title: `Planificación #${pl.id}`,
        subtitle: `Estatus: ${pl.status}`,
        category: 'Planificación',
        route: '/home/planificacion',
      })),
      ...silos.map(s => ({
        id: `silo-${s.id}`,
        title: `Acta Silo #${s.n_acta}`,
        subtitle: s.empresa_razon_social,
        category: 'Inspección de Silos',
        route: '/home/inspecc-silos',
      })),
      ...avales.map(a => ({
        id: `aval-${a.id}`,
        title: `Aval Sanitarios #${a.n_aval}`,
        subtitle: `Predio: ${a.nombre_predio}`,
        category: 'Aval Sanitario',
        route: '/home/avales',
      })),
      ...oficinas.map(o => ({
        id: `ofi-${o.id}`,
        title: o.nombre,
        subtitle: 'Sede INSAI',
        category: 'Oficina',
        route: '/home/oficinas',
      })),
      ...vehiculos.map(v => ({
        id: `veh-${v.id}`,
        title: `Placa: ${v.placa}`,
        subtitle: `${v.marca || ''} ${v.modelo || ''}`,
        category: 'Vehículo',
        route: '/home/vehiculos',
      })),
    ];

    return res.json({
      status: 'success',
      data: results,
    });
  } catch (error) {
    console.error('Error en searchGlobal:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al ejecutar la búsqueda global',
    });
  }
};
