import notificationService from '../services/notification.service.js';

export const getNotificaciones = async (req, res, next) => {
  try {
    const usuarioGlobalId = req.user.id;
    const { page, limit, unreadOnly, tipo } = req.query;

    const result = await notificationService.obtenerNotificacionesUsuario({
      db: req.db,
      usuario_global_id: usuarioGlobalId,
      page,
      limit,
      unreadOnly,
      tipo,
    });

    res.status(200).json({
      status: 'success',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const usuarioGlobalId = req.user.id;
    const result = await notificationService.contarNoLeidas({
      db: req.db,
      usuario_global_id: usuarioGlobalId,
    });

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const usuarioGlobalId = req.user.id;
    const { id } = req.params;

    const updated = await notificationService.marcarComoLeida({
      db: req.db,
      id,
      usuario_global_id: usuarioGlobalId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Notificación marcada como leída',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const usuarioGlobalId = req.user.id;

    const result = await notificationService.marcarTodasComoLeidas({
      db: req.db,
      usuario_global_id: usuarioGlobalId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Todas las notificaciones han sido marcadas como leídas',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const usuarioGlobalId = req.user.id;
    const { id } = req.params;

    await notificationService.eliminarNotificacion({
      db: req.db,
      id,
      usuario_global_id: usuarioGlobalId,
    });

    res.status(200).json({
      status: 'success',
      message: 'Notificación eliminada correctamente',
    });
  } catch (error) {
    next(error);
  }
};

export const createNotification = async (req, res, next) => {
  try {
    const { usuario_global_id, mensaje, tipo } = req.body;

    const notificacion = await notificationService.crearNotificacion({
      db: req.db,
      usuario_global_id,
      mensaje,
      tipo,
    });

    res.status(201).json({
      status: 'success',
      message: 'Notificación creada exitosamente',
      data: notificacion,
    });
  } catch (error) {
    next(error);
  }
};
