import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Usuario } from '../models/index.js';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'chave_secreta_para_desenvolvimento';

function verifyTokenAsync(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

async function authenticateFromHeader(authHeader) {
  if (!authHeader) {
    throw new Error('TOKEN_NOT_PROVIDED');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2) {
    throw new Error('TOKEN_BAD_FORMAT');
  }

  const [scheme, token] = parts;
  if (!/^Bearer$/i.test(scheme)) {
    throw new Error('TOKEN_BAD_FORMAT');
  }

  const decoded = await verifyTokenAsync(token);
  const usuario = await Usuario.findByPk(decoded.id, {
    attributes: ['id', 'tenant_id', 'role', 'status'],
  });

  if (!usuario) {
    throw new Error('USER_NOT_FOUND');
  }
  if (!usuario.status) {
    throw new Error('USER_INACTIVE');
  }

  const tokenTenant = decoded.tenant_id;
  if (tokenTenant == null || tokenTenant === '') {
    throw new Error('TOKEN_WITHOUT_TENANT');
  }
  if (Number(tokenTenant) !== Number(usuario.tenant_id)) {
    throw new Error('TOKEN_TENANT_MISMATCH');
  }

  return usuario;
}

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  try {
    const usuario = await authenticateFromHeader(authHeader);

    req.userId = usuario.id;
    req.userRole = usuario.role;
    req.tenantId = usuario.tenant_id;

    return next();
  } catch (error) {
    if (error?.message === 'TOKEN_NOT_PROVIDED') {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    if (error?.message === 'TOKEN_BAD_FORMAT') {
      return res.status(401).json({ error: 'Erro no formato do token' });
    }
    if (error?.message === 'USER_NOT_FOUND') {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    if (error?.message === 'USER_INACTIVE') {
      return res.status(403).json({ error: 'Usuário inativo' });
    }
    if (error?.message === 'TOKEN_WITHOUT_TENANT') {
      return res.status(401).json({
        error: 'Token sem contexto de tenant. Faça login novamente.',
      });
    }
    if (error?.message === 'TOKEN_TENANT_MISMATCH') {
      return res.status(403).json({
        error: 'Token incompatível com o tenant do usuário',
      });
    }
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

/**
 * Versão opcional do auth:
 * - sem Authorization: segue como público
 * - com Authorization válido: popula req.userId/req.userRole/req.tenantId
 * - com Authorization inválido: retorna 401
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();

  try {
    const usuario = await authenticateFromHeader(authHeader);
    req.userId = usuario.id;
    req.userRole = usuario.role;
    req.tenantId = usuario.tenant_id;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.userRole !== 'ADMIN' && req.userRole !== 'SAAS_ADMIN') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }
  return next();
};
