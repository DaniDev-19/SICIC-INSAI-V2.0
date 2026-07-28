import { getTenantPrisma } from '../config/prisma.js';

/**
 * Determina si el usuario tiene rol administrativo (admin, superadmin, moderador).
 * Estos roles ven métricas generales del sistema.
 */
function isAdminUser(req) {
  const permisos = req.user?.currentInstance?.permisos;
  const rol = req.user?.currentInstance?.rol?.toLowerCase() || '';
  return (
    permisos?.all?.includes('*') ||
    rol === 'admin' ||
    rol === 'administrador' ||
    rol === 'superadmin' ||
    rol === 'super_admin' ||
    rol === 'super_administrador' ||
    rol === 'moderador' ||
    rol === 'moderator'
  );
}

async function resolveEmpleadoId(req, tenantPrisma) {
  const fromToken = req.user?.currentInstance?.empleado_id;
  if (fromToken) return fromToken;

  const usuarioGlobalId = req.user?.id;
  if (!usuarioGlobalId || !tenantPrisma) return null;

  try {
    const empleado = await tenantPrisma.empleados.findFirst({
      where: { usuario_global_id: usuarioGlobalId },
      select: { id: true },
    });
    return empleado ? empleado.id : null;
  } catch {
    return null;
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    const tenantPrisma = getTenantPrisma(req.user.currentInstance.db_name);
    const isAdmin = isAdminUser(req);

    if (isAdmin) {
      // --- VISTA ADMINISTRADOR / MODERADOR (métricas generales) ---
      const [
        totalPlanificaciones,
        totalInspecciones,
        totalEmpleados,
        totalPropiedades,
        totalProgramas,
        planificacionesPendientes,
        planificacionesEnProceso,
        planificacionesFinalizadas,
        recentPlanificacionesRaw,
        inspectoresList
      ] = await Promise.all([
        tenantPrisma.planificaciones.count(),
        tenantPrisma.inspecciones.count(),
        tenantPrisma.empleados.count({ where: { status_laboral: 'ACTIVO' } }),
        tenantPrisma.propiedades.count(),
        tenantPrisma.programas.count(),
        tenantPrisma.planificaciones.count({ where: { status: 'PENDIENTE' } }),
        tenantPrisma.planificaciones.count({ where: { status: 'EN_PROCESO' } }),
        tenantPrisma.planificaciones.count({ where: { status: 'FINALIZADA' } }),
        tenantPrisma.planificaciones.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            solicitudes: {
              include: {
                propiedades: { select: { nombre: true, codigo_insai: true } },
                t_solicitud: { select: { nombre: true } }
              }
            }
          }
        }),
        tenantPrisma.empleados.findMany({
          where: { status_laboral: 'ACTIVO' },
          take: 5,
          select: {
            id: true,
            nombre: true,
            apellido: true,
            cedula: true,
            _count: {
              select: { planificacion_empleados: true }
            }
          },
          orderBy: {
            planificacion_empleados: { _count: 'desc' }
          }
        })
      ]);

      const recentActivity = recentPlanificacionesRaw.map((p) => ({
        id: p.id,
        status: p.status,
        created_at: p.created_at,
        propiedades: p.solicitudes?.propiedades
          ? {
              nombre_predio: p.solicitudes.propiedades.nombre,
              codigo_propiedad: p.solicitudes.propiedades.codigo_insai || 'N/A',
            }
          : null,
        programas: p.solicitudes?.t_solicitud
          ? { nombre: p.solicitudes.t_solicitud.nombre }
          : null,
      }));

      // Generar datos dinámicos para los últimos 7 días
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const today = new Date();
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];

        const startOfDay = new Date(d.setHours(0, 0, 0, 0));
        const endOfDay = new Date(d.setHours(23, 59, 59, 999));

        const countPlan = await tenantPrisma.planificaciones.count({
          where: { created_at: { gte: startOfDay, lte: endOfDay } },
        });
        const countInsp = await tenantPrisma.inspecciones.count({
          where: { created_at: { gte: startOfDay, lte: endOfDay } },
        });

        chartData.push({
          name: dayName,
          planificaciones: countPlan,
          inspecciones: countInsp,
        });
      }

      return res.json({
        status: 'success',
        roleType: 'admin',
        data: {
          metrics: {
            totalPlanificaciones,
            totalInspecciones,
            totalEmpleados,
            totalPropiedades,
            totalProgramas,
            planificacionesPendientes,
            planificacionesEnProceso,
            planificacionesFinalizadas,
          },
          recentActivity,
          topInspectores: inspectoresList.map((e) => ({
            id: e.id,
            nombreCompleto: `${e.nombre} ${e.apellido}`,
            cedula: e.cedula,
            planificacionesAsignadas: e._count.planificacion_empleados,
          })),
          chartData,
        },
      });
    } else {
      // --- VISTA INSPECTOR / ROLES NO-ADMIN (filtrado por empleado_id) ---
      const empleadoId = await resolveEmpleadoId(req, tenantPrisma);

      if (!empleadoId) {
        return res.json({
          status: 'success',
          roleType: 'inspector',
          data: {
            metrics: {
              misPlanificaciones: 0,
              misPendientes: 0,
              misEnProceso: 0,
              misFinalizadas: 0,
              misInspecciones: 0,
            },
            recentActivity: [],
            topInspectores: [],
            chartData: [],
          },
        });
      }

      const whereEmpleado = {
        planificacion_empleados: {
          some: { empleado_id: empleadoId },
        },
      };

      const [
        misPlanificacionesTotal,
        misPendientes,
        misEnProceso,
        misFinalizadas,
        misProximasRaw,
        misInspecciones,
      ] = await Promise.all([
        tenantPrisma.planificaciones.count({ where: whereEmpleado }),
        tenantPrisma.planificaciones.count({ where: { ...whereEmpleado, status: 'PENDIENTE' } }),
        tenantPrisma.planificaciones.count({ where: { ...whereEmpleado, status: 'EN_PROCESO' } }),
        tenantPrisma.planificaciones.count({ where: { ...whereEmpleado, status: 'FINALIZADA' } }),
        tenantPrisma.planificaciones.findMany({
          where: whereEmpleado,
          take: 5,
          orderBy: { fecha_programada: 'asc' },
          include: {
            solicitudes: {
              include: {
                propiedades: { select: { nombre: true, codigo_insai: true } },
                t_solicitud: { select: { nombre: true } }
              }
            }
          }
        }),
        tenantPrisma.inspecciones.count({
          where: {
            planificaciones: whereEmpleado,
          },
        }),
      ]);

      const recentActivity = misProximasRaw.map((p) => ({
        id: p.id,
        status: p.status,
        created_at: p.created_at,
        propiedades: p.solicitudes?.propiedades
          ? {
              nombre_predio: p.solicitudes.propiedades.nombre,
              codigo_propiedad: p.solicitudes.propiedades.codigo_insai || 'N/A',
            }
          : null,
        programas: p.solicitudes?.t_solicitud
          ? { nombre: p.solicitudes.t_solicitud.nombre }
          : null,
      }));

      // Gráfico de los últimos 7 días para el inspector
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const today = new Date();
      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dayName = days[d.getDay()];

        const startOfDay = new Date(d.setHours(0, 0, 0, 0));
        const endOfDay = new Date(d.setHours(23, 59, 59, 999));

        const countPlan = await tenantPrisma.planificaciones.count({
          where: {
            ...whereEmpleado,
            created_at: { gte: startOfDay, lte: endOfDay },
          },
        });

        chartData.push({
          name: dayName,
          misPlanificaciones: countPlan,
        });
      }

      return res.json({
        status: 'success',
        roleType: 'inspector',
        data: {
          metrics: {
            misPlanificaciones: misPlanificacionesTotal,
            misPendientes,
            misEnProceso,
            misFinalizadas,
            misInspecciones,
          },
          recentActivity,
          chartData,
        },
      });
    }
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al obtener estadísticas del dashboard',
      details: error.message
    });
  }
};
