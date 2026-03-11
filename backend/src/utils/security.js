import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET || 'chave_secreta_para_desenvolvimento';

export const gerarHash = async (senha) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(senha, salt);
};

export const compararHash = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

// Nova função para gerar o Token JWT
export const gerarToken = (payload) => {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
};