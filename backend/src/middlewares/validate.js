import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  if (!schema || typeof schema.parse !== 'function') {
    return res.status(500).json({
      error: 'Schema de validação inválido',
      details: [{ field: 'schema', message: 'Middleware validate recebeu um schema inválido.' }],
    });
  }

  try {
    // O parse do Zod limpa campos extras que não estão no schema
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    const issues = error instanceof ZodError ? error.issues : [];

    return res.status(400).json({
      error: 'Falha na validação dos dados',
      details: issues.map((err) => ({ field: err.path[0], message: err.message })),
    });
  }
};