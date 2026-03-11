export const validate = (schema) => (req, res, next) => {
  try {
    // O parse do Zod limpa campos extras que não estão no schema
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({
      error: "Falha na validação dos dados",
      details: error.errors.map(err => ({ field: err.path[0], message: err.message }))
    });
  }
};