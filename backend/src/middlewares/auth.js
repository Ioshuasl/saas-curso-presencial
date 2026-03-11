import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'chave_secreta_para_desenvolvimento';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // O padrão é "Bearer TOKEN", então dividimos a string
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Erro no formato do token' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token malformatado' });
  }

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    // Injetamos os dados do token na requisição para uso nos controllers
    req.userId = decoded.id;
    req.userRole = decoded.role;
    
    return next();
  });
};

// Middleware opcional para restringir apenas a ADMINS
export const adminOnly = (req, res, next) => {
  if (req.userRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  return next();
};