export const validateSchema = (schema) => (req, res, next) => {
  if (!schema) {
    console.error('Error: validatSchema recibió un esquema no definido');
    return next(new Error('Error interno del servidor: Falta el esquema de validación.'));
  }
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    next(error);
  }
};
