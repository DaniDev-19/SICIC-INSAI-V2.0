export const errorHandler = (err, req, res, _next) => {
  console.error(`[Error] ${err.message}`);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Error de validación de datos',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  if (err.code?.startsWith('P')) {
    return res.status(500).json({
      status: 'error',
      message: 'Error en la base de datos',
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Error interno del servidor',
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
