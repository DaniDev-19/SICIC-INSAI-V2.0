export const errorHandler = (err, req, res, _next) => {

  if (process.env.NODE_ENV === 'development') {
    console.error('---------- ERROR START ----------');
    console.error(`[Message]: ${err.message}`);
    console.error(`[Code]: ${err.code}`);
    console.error(`[Stack]: ${err.stack}`);
    console.error('---------- ERROR END ----------');
  } else {
    console.error(`[Error]: ${err.message} | Path: ${req.path}`);
  }

  if (err.name === 'ZodError') {
    const issues = err.issues || err.errors || [];
    return res.status(400).json({
      status: 'error',
      message: 'Los datos enviados no son válidos',
      errors: issues.map((e) => ({
        campo: e.path.join('.'),
        mensaje: e.message,
      })),
    });
  }

  if (err.code?.startsWith('P')) {
    let statusCode = 500;
    let message = 'Error inesperado en la base de datos';

    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        const target = err.meta?.target || 'campo';
        message = `Ya existe un registro con ese dato único (${target})`;
        break;
      case 'P2003':
        statusCode = 400;
        message = 'No se puede completar la operación debido a una restricción de integridad (llave foránea)';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'El registro solicitado no fue encontrado';
        break;
      case 'P2000':
        statusCode = 400;
        message = 'El valor proporcionado es demasiado largo para el campo';
        break;
    }

    return res.status(statusCode).json({
      status: 'error',
      message,
      code: err.code,
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token de seguridad inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Su sesión ha expirado, por favor inicie sesión nuevamente',
    });
  }

  const statusCode = err.status || 500;
  const message = err.message || 'Ocurrió un error interno en el servidor';

  res.status(statusCode).json({
    status: 'error',
    message,
    detail: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
