import multer from 'multer';
const storage = multer.memoryStorage();

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
