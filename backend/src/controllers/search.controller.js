import { getTenantPrisma } from '../config/prisma.js';

/**
 * Verifica si el usuario tiene permiso 'see' para un módulo dado.
 * Replica la lógica del hook usePermissions del frontend.
 * @param {object} permisos - objeto de permisos del JWT (currentInstance.permisos)
 * @param {string} screen - clave del módulo a verificar
 */
const canSee = (permisos, screen) => {
  if (!permisos) return false;
  // Admin total: tiene permiso '*' en 'all'
  if (permisos['all']?.includes('*')) return true;
  // Permiso total en el módulo
  if (permisos[screen]?.includes('*')) return true;
  // Permiso 'see' en el módulo
  if (Array.isArray(permisos[screen]) && permisos[screen].includes('see')) return true;
  return false;
};

export const searchGlobal = async (req, res) => {
  try {
    const q = req.query.q || req.query.search || '';
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
      return res.json({ status: 'success', data: [] });
    }

    const queryStr = q.trim();
    const tenantPrisma = getTenantPrisma(req.user.currentInstance.db_name);
    const permisos = req.user.currentInstance?.permisos || {};

    // Ejecutar solo las búsquedas a las que el usuario tiene acceso
    const searches = await Promise.all([
      // 1. Clientes / Productores — screen key: 'clientes'
      canSee(permisos, 'clientes')
        ? tenantPrisma.clientes.findMany({
            where: { OR: [
              { nombre: { contains: queryStr, mode: 'insensitive' } },
              { cedula_rif: { contains: queryStr, mode: 'insensitive' } },
              { email: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, nombre: true, cedula_rif: true },
          })
        : [],

      // 2. Propiedades / Predios — screen key: 'propiedades'
      canSee(permisos, 'propiedades')
        ? tenantPrisma.propiedades.findMany({
            where: { OR: [
              { nombre: { contains: queryStr, mode: 'insensitive' } },
              { codigo_insai: { contains: queryStr, mode: 'insensitive' } },
              { punto_referencia: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, nombre: true, codigo_insai: true },
          })
        : [],

      // 3. Empleados / Inspectores — screen key: 'empleados'
      canSee(permisos, 'empleados')
        ? tenantPrisma.empleados.findMany({
            where: { OR: [
              { nombre: { contains: queryStr, mode: 'insensitive' } },
              { apellido: { contains: queryStr, mode: 'insensitive' } },
              { cedula: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, nombre: true, apellido: true, cedula: true },
          })
        : [],

      // 4. Inspecciones Generales — screen key: 'inspecciones'
      canSee(permisos, 'inspecciones')
        ? tenantPrisma.inspecciones.findMany({
            where: { OR: [
              { n_control: { contains: queryStr, mode: 'insensitive' } },
              { t_codigo: { contains: queryStr, mode: 'insensitive' } },
              { atendido_por_nombre: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, n_control: true, status: true, fecha_inspeccion: true },
          })
        : [],

      // 5. Planificaciones — screen key: 'planificaciones' (alias: 'planificacion')
      canSee(permisos, 'planificaciones') || canSee(permisos, 'planificacion')
        ? tenantPrisma.planificaciones.findMany({
            where: { OR: [
              { status: { contains: queryStr, mode: 'insensitive' } },
              { objetivo: { contains: queryStr, mode: 'insensitive' } },
              { actividad: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, status: true, fecha_programada: true, actividad: true },
          })
        : [],

      // 6. Actas de Silos — screen key: 'acta_silos' (alias: 'inspecciones_silos')
      canSee(permisos, 'acta_silos') || canSee(permisos, 'inspecciones_silos')
        ? tenantPrisma.acta_silos.findMany({
            where: { OR: [
              { lugar_ubicacion: { contains: queryStr, mode: 'insensitive' } },
              { observaciones: { contains: queryStr, mode: 'insensitive' } },
              { semana_epid: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, semana_epid: true, lugar_ubicacion: true },
          })
        : [],

      // 7. Avales Sanitarios — screen key: 'avales'
      canSee(permisos, 'avales')
        ? tenantPrisma.avales_sanitarios.findMany({
            where: { OR: [
              { numero_aval: { contains: queryStr, mode: 'insensitive' } },
              { codigo_predio: { contains: queryStr, mode: 'insensitive' } },
              { observaciones: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, numero_aval: true, codigo_predio: true },
          })
        : [],

      // 8. Oficinas — screen key: 'oficinas'
      canSee(permisos, 'oficinas')
        ? tenantPrisma.oficinas.findMany({
            where: { OR: [
              { nombre: { contains: queryStr, mode: 'insensitive' } },
              { direccion: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, nombre: true },
          })
        : [],

      // 9. Vehículos — screen key: 'vehiculos'
      canSee(permisos, 'vehiculos')
        ? tenantPrisma.vehiculos.findMany({
            where: { OR: [
              { placa: { contains: queryStr, mode: 'insensitive' } },
              { modelo: { contains: queryStr, mode: 'insensitive' } },
              { marca: { contains: queryStr, mode: 'insensitive' } },
            ]},
            take: 4,
            select: { id: true, placa: true, modelo: true, marca: true },
          })
        : [],
    ]);

    const [clientes, propiedades, empleados, inspecciones, planificaciones, silos, avales, oficinas, vehiculos] = searches;

    const results = [
      ...clientes.map(c => ({
        id: `cliente-${c.id}`,
        title: c.nombre,
        subtitle: `RIF/Cédula: ${c.cedula_rif}`,
        category: 'Productor',
        route: '/home/clientes',
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
        route: '/home/inspecciones',
      })),
      ...planificaciones.map(pl => ({
        id: `plan-${pl.id}`,
        title: `Planificación #${pl.id}`,
        subtitle: `${pl.actividad || pl.status}`,
        category: 'Planificación',
        route: '/home/planificacion',
      })),
      ...silos.map(s => ({
        id: `silo-${s.id}`,
        title: `Acta Silo #${s.id}`,
        subtitle: s.lugar_ubicacion || `Semana Epid: ${s.semana_epid || 'N/A'}`,
        category: 'Inspección de Silos',
        route: '/home/inspecciones-silos',
      })),
      ...avales.map(a => ({
        id: `aval-${a.id}`,
        title: `Aval #${a.numero_aval}`,
        subtitle: `Predio: ${a.codigo_predio || 'N/A'}`,
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
        subtitle: `${v.marca || ''} ${v.modelo || ''}`.trim(),
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
