import { Router } from 'express';
import { uploadSingle } from '../middlewares/upload.js';
import { authMiddleware } from '../middlewares/auth.js';
import { uploadToS3 } from '../config/aws-s3.js';
import { resolveTenantIdForAdminRequest } from '../utils/tenantAdminContext.js';

const router = new Router();

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: Envio de arquivos (armazenamento em AWS S3)
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
 *                   example: https://bucket.s3.sa-east-1.amazonaws.com/tenants/1/uploads/arquivo.jpg
 *                 key:
 *                   type: string
 *                   example: tenants/1/uploads/arquivo.jpg
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
router.post('/', authMiddleware, uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado. Use o campo "file" no form-data.' });
    }

    const tenantId = await resolveTenantIdForAdminRequest(req);
    const prefix = `tenants/${tenantId}/uploads`;
    const { key, url } = await uploadToS3(req.file, prefix);
    return res.status(200).json({
      url,
      key,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao enviar arquivo para o S3.' });
  }
});

export default router;
