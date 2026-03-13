import { Router } from 'express';
import { uploadSingle } from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = new Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Envio de arquivos (armazenamento local em backend/uploads)
 */

/**
 * @swagger
 * /uploads:
 *   post:
 *     summary: Enviar um arquivo
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo a enviar (máx. 10 MB)
 *     responses:
 *       200:
 *         description: Arquivo enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: /api/uploads/arquivo-1234567890-123456789.jpg
 *                 filename:
 *                   type: string
 *                 originalname:
 *                   type: string
 *                 size:
 *                   type: integer
 *       400:
 *         description: Nenhum arquivo enviado
 *       401:
 *         description: Não autorizado
 */
router.post('/', authMiddleware, uploadSingle('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "file" no form-data.' });
  }
  const url = `/api/uploads/${req.file.filename}`;
  return res.status(200).json({
    url,
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

export default router;
