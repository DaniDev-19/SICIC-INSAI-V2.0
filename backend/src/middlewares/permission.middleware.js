/**
 *
 * @param {string} screen
 * @param {string} action
 */
export const checkPermission = (screen, action) => {
  return (req, res, next) => {
    const permisos = req.user?.currentInstance?.permisos;

    if (!permisos || typeof permisos !== 'object') {
      return res.status(403).json({
        status: 'error',
        message: 'Acceso denegado: sin permisos configurados.',
      });
    }

    if (permisos['all']?.includes('*')) {
      return next();
    }

    if (permisos[screen]?.includes('*')) {
      return next();
    }

    const pantalla = permisos[screen];

    if (!Array.isArray(pantalla)) {
      return res.status(403).json({
        status: 'error',
        message: `Acceso denegado: no tiene acceso a la sección "${screen}".`,
      });
    }

    if (!pantalla.includes(action)) {
      return res.status(403).json({
        status: 'error',
        message: `Acceso denegado: no tiene permiso para "${action}" en "${screen}".`,
      });
    }

    next();
  };
};
