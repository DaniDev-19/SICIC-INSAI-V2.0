export const validateSchema = (schema) => (req, res, next) => {
  if (!schema) {
    console.error('Error: validatSchema recibió un esquema no definido');
    return next(new Error('Error interno del servidor: Falta el esquema de validación.'));
  }
  try {
    const validated = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (validated.body) req.body = validated.body;
    if (validated.query) Object.assign(req.query, validated.query);
    if (validated.params) Object.assign(req.params, validated.params);

    next();
  } catch (error) {
    next(error);
  }
};
