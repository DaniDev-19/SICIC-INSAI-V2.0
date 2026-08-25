import { masterPrisma } from '../config/prisma.js';

class NotificationService {
  /**
   * Crea una notificación para un usuario global específico
   */
  async crearNotificacion({ db, usuario_global_id, mensaje, tipo = 'INFO' }) {
    if (!usuario_global_id || !mensaje) {
      throw new Error('usuario_global_id y mensaje son requeridos');
    }

    return await db.notificaciones.create({
      data: {
        usuario_global_id: Number(usuario_global_id),
        mensaje: mensaje.trim(),
        tipo: tipo || 'INFO',
        leido: false,
      },
    });
  }

  /**
   * Crea notificaciones en lote para una lista de usuarios
   */
  async crearNotificacionesBatch({ db, usuarios_ids = [], mensaje, tipo = 'INFO' }) {
    if (!Array.isArray(usuarios_ids) || usuarios_ids.length === 0 || !mensaje) {
      return [];
    }

    const uniqueIds = [...new Set(usuarios_ids.map(Number).filter(Boolean))];
    const data = uniqueIds.map((userId) => ({
      usuario_global_id: userId,
      mensaje: mensaje.trim(),
      tipo: tipo || 'INFO',
      leido: false,
    }));

    return await db.notificaciones.createMany({
      data,
    });
  }

  /**
   * Notifica a todos los empleados asignados a una oficina específica
   */
  async notificarPorOficina({ db, oficina_id, mensaje, tipo = 'INFO' }) {
    if (!oficina_id) return;

    const empleados = await db.empleados.findMany({
      where: {
        oficina_id: Number(oficina_id),
        usuario_global_id: { not: null },
      },
      select: { usuario_global_id: true },
    });

    const userIds = empleados
      .map((e) => e.usuario_global_id)
      .filter((id) => id !== null && id !== undefined);

    if (userIds.length > 0) {
      await this.crearNotificacionesBatch({ db, usuarios_ids: userIds, mensaje, tipo });
    }
  }

  /**
   * Notifica a los usuarios con un determinado rol (ej. 'Administrador', 'Fiscal')
   */
  async notificarPorRol({ db, roleName, mensaje, tipo = 'INFO' }) {
    try {
      const role = await masterPrisma.roles.findFirst({
        where: { nombre: { equals: roleName, mode: 'insensitive' } },
      });

      if (!role) return;

      const usuarios = await masterPrisma.usuarios.findMany({
        where: {
          role_id: role.id,
          status: true,
        },
        select: { id: true },
      });

      const userIds = usuarios.map((u) => u.id);
      if (userIds.length > 0) {
        await this.crearNotificacionesBatch({ db, usuarios_ids: userIds, mensaje, tipo });
      }
    } catch (error) {
      console.error('[NotificationService] Error notificando por rol:', error.message);
    }
  }

  /**
   * Obtiene notificaciones paginadas para el usuario autenticado
   */
  async obtenerNotificacionesUsuario({ db, usuario_global_id, page = 1, limit = 10, unreadOnly = false, tipo }) {
    const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(limit));
    const take = Math.min(100, Math.max(1, Number(limit)));

    const where = {
      usuario_global_id: Number(usuario_global_id),
    };

    if (unreadOnly === true || unreadOnly === 'true') {
      where.leido = false;
    }

    if (tipo) {
      where.tipo = String(tipo).toUpperCase();
    }

    const [notificaciones, totalCount, unreadCount] = await Promise.all([
      db.notificaciones.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take,
      }),
      db.notificaciones.count({ where }),
      db.notificaciones.count({
        where: {
          usuario_global_id: Number(usuario_global_id),
          leido: false,
        },
      }),
    ]);

    return {
      data: notificaciones,
      pagination: {
        page: Number(page),
        limit: take,
        totalCount,
        totalPages: Math.ceil(totalCount / take) || 1,
        unreadCount,
      },
    };
  }

  /**
   * Cuenta notificaciones no leídas para un usuario
   */
  async contarNoLeidas({ db, usuario_global_id }) {
    const count = await db.notificaciones.count({
      where: {
        usuario_global_id: Number(usuario_global_id),
        leido: false,
      },
    });

    return { unreadCount: count };
  }

  /**
   * Marca una notificación como leída
   */
  async marcarComoLeida({ db, id, usuario_global_id }) {
    const notificacion = await db.notificaciones.findFirst({
      where: {
        id: Number(id),
        usuario_global_id: Number(usuario_global_id),
      },
    });

    if (!notificacion) {
      const error = new Error('Notificación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return await db.notificaciones.update({
      where: { id: Number(id) },
      data: { leido: true },
    });
  }

  /**
   * Marca todas las notificaciones del usuario como leídas
   */
  async marcarTodasComoLeidas({ db, usuario_global_id }) {
    const result = await db.notificaciones.updateMany({
      where: {
        usuario_global_id: Number(usuario_global_id),
        leido: false,
      },
      data: { leido: true },
    });

    return { updatedCount: result.count };
  }

  /**
   * Elimina una notificación perteneciente al usuario
   */
  async eliminarNotificacion({ db, id, usuario_global_id }) {
    const notificacion = await db.notificaciones.findFirst({
      where: {
        id: Number(id),
        usuario_global_id: Number(usuario_global_id),
      },
    });

    if (!notificacion) {
      const error = new Error('Notificación no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return await db.notificaciones.delete({
      where: { id: Number(id) },
    });
  }
}

export default new NotificationService();
