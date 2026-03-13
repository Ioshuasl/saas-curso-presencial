import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pasta de destino: backend/uploads (relativo a backend/src/middlewares)
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');

// Garante que a pasta existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || '';
    const base = path.basename(file.originalname, ext) || 'file';
    const safeName = `${base.replace(/\s+/g, '-')}-${uniqueSuffix}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  // Opcional: restringir tipos (ex.: apenas imagens)
  // const allowed = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  // if (!allowed.includes(file.mimetype)) return cb(new Error('Tipo de arquivo não permitido'), false);
  cb(null, true);
};

const limits = {
  fileSize: 10 * 1024 * 1024, // 10 MB
};

const upload = multer({
  storage,
  fileFilter,
  limits,
});

/**
 * Middleware: um único arquivo no campo informado.
 * Uso: router.post('/rota', upload.single('campo'), handler)
 */
export const uploadSingle = (fieldName = 'file') => upload.single(fieldName);

/**
 * Middleware: vários arquivos no mesmo campo.
 * Uso: router.post('/rota', upload.array('campo', 10), handler)
 */
export const uploadArray = (fieldName = 'files', maxCount = 10) =>
  upload.array(fieldName, maxCount);

/**
 * Middleware: vários campos com um ou mais arquivos cada.
 * Uso: router.post('/rota', upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'anexos', maxCount: 5 }]), handler)
 */
export const uploadFields = (fields) => upload.fields(fields);

/**
 * Instância do multer para uso customizado (ex.: upload.single('outro'), upload.none(), etc.)
 */
export { upload };

/**
 * Caminho absoluto da pasta de uploads (útil para servir arquivos estáticos ou montar URL)
 */
export const UPLOADS_PATH = uploadsDir;
