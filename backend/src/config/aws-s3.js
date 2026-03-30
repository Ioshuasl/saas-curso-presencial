import aws from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_REGION || 'us-east-1';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region,
});

export const s3 = new aws.S3();

/**
 * URLs públicas fixas (sem expiração). A leitura pública vem da política do bucket (s3:GetObject),
 * não de ACL no objeto — compatível com "Object ownership: Bucket owner enforced" (ACLs desativadas).
 * Não envie ACL no PutObject nesse modo.
 */

/**
 * URL pública fixa (virtual-hosted-style), sem query de assinatura e sem expiração.
 * @param {string} key - Key do objeto no bucket
 */
export function getPublicObjectUrl(key) {
  if (!key) {
    throw new Error('key é obrigatória para montar a URL pública.');
  }
  if (!bucketName) {
    throw new Error('AWS_BUCKET_NAME não configurado.');
  }
  const encodedKey = String(key)
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `https://${bucketName}.s3.${region}.amazonaws.com/${encodedKey}`;
}

/**
 * Compatível com código que chamava URL assinada: agora retorna a mesma URL pública fixa.
 * @param {string} objectName - Key do objeto
 */
export function getDownloadUrl(objectName) {
  return getPublicObjectUrl(objectName);
}

/**
 * Indica se a URL aponta para o bucket S3 configurado (virtual-hosted, path-style ou query antiga).
 */
export function isOurBucketUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return false;
  try {
    const url = new URL(fileUrl.trim());
    const bucket = (bucketName || '').toLowerCase();
    if (!bucket) return false;
    const host = url.hostname.toLowerCase();
    if (host.startsWith(`${bucket}.s3`) || host.startsWith(`${bucket}.s3-`)) return true;
    if (host.includes('.amazonaws.com')) {
      const p = url.pathname.replace(/^\/+/, '');
      if (p.toLowerCase().startsWith(`${bucket}/`)) return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Extrai a Key do objeto a partir de URL S3 (pública ou path "community/...").
 */
export function getKeyFromUrl(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string') return null;
  const trimmed = fileUrl.trim();
  if (trimmed.startsWith('community/') && !trimmed.startsWith('http')) {
    return trimmed;
  }
  try {
    const url = new URL(trimmed);
    const pathname = url.pathname.replace(/^\/+/, '');
    if (!pathname || !bucketName) return null;
    const bucket = bucketName;
    const host = url.hostname.toLowerCase();

    if (host.startsWith(`${bucket.toLowerCase()}.`)) {
      return decodeURIComponent(pathname);
    }

    if (host.startsWith('s3.') && host.includes('amazonaws.com')) {
      const i = pathname.indexOf('/');
      if (i === -1) return null;
      const possibleBucket = pathname.slice(0, i);
      const rest = pathname.slice(i + 1);
      if (possibleBucket === bucket) {
        return decodeURIComponent(rest);
      }
    }

    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

export function getObjectNameFromPresignedUrl(fileUrl) {
  return getKeyFromUrl(fileUrl);
}

/**
 * Upload a partir de arquivo Multer em memória ({ buffer, originalname, mimetype }).
 */
export async function uploadToS3(file, folder) {
  if (!file?.buffer) {
    throw new Error('Arquivo em memória (buffer) é obrigatório para uploadToS3.');
  }
  const ext = (file.originalname && path.extname(file.originalname)) || '';
  const base = file.originalname
    ? path.basename(file.originalname, ext)
    : 'file';
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const safeBase = base.replace(/[^\w.-]+/g, '_').slice(0, 120);
  const key = `${folder.replace(/\/+$/, '')}/${uniqueName}-${safeBase}${ext}`;

  const params = {
    Bucket: bucketName,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype || 'application/octet-stream',
  };

  await s3.upload(params).promise();
  const url = getPublicObjectUrl(key);
  return { key, url };
}

/**
 * Upload a partir de caminho no disco (fluxo atual com multer.diskStorage).
 * @returns {Promise<{ objectName: string, url: string }>}
 */
export async function uploadFile(filePath, objectName, contentType) {
  if (!filePath) {
    throw new Error('filePath é obrigatório para upload.');
  }
  const finalObjectName = objectName || path.basename(filePath);
  const stat = await fs.promises.stat(filePath);
  const stream = fs.createReadStream(filePath);
  const params = {
    Bucket: bucketName,
    Key: finalObjectName,
    Body: stream,
    ContentType: contentType || 'application/octet-stream',
    ContentLength: stat.size,
  };
  try {
    await s3.upload(params).promise();
  } finally {
    stream.destroy();
  }
  const url = getPublicObjectUrl(finalObjectName);
  return { objectName: finalObjectName, url };
}

export async function deleteFromS3(fileUrl) {
  const key = getKeyFromUrl(fileUrl);
  if (!key) return;
  await s3.deleteObject({ Bucket: bucketName, Key: key }).promise();
}

export async function deleteFileByUrl(fileUrl) {
  await deleteFromS3(fileUrl);
}

export async function deleteFile(objectName) {
  if (!objectName) {
    throw new Error('objectName é obrigatório para exclusão.');
  }
  await s3.deleteObject({ Bucket: bucketName, Key: objectName }).promise();
}

export async function fileExistsByObjectName(objectName) {
  if (!objectName) {
    throw new Error('objectName é obrigatório para verificação.');
  }
  try {
    await s3.headObject({ Bucket: bucketName, Key: objectName }).promise();
    return true;
  } catch (err) {
    if (err.code === 'NotFound' || err.statusCode === 404) {
      return false;
    }
    throw err;
  }
}

export async function fileExistsByUrl(fileUrl) {
  if (!fileUrl) {
    throw new Error('fileUrl é obrigatório para verificação.');
  }
  const key = getKeyFromUrl(fileUrl);
  if (!key) {
    throw new Error('Não foi possível extrair a chave da URL fornecida.');
  }
  return fileExistsByObjectName(key);
}

export async function getObjectStream(objectName) {
  if (!objectName) {
    throw new Error('objectName é obrigatório para stream.');
  }
  const head = await s3.headObject({ Bucket: bucketName, Key: objectName }).promise();
  const stream = s3.getObject({ Bucket: bucketName, Key: objectName }).createReadStream();
  return {
    stream,
    contentType: head.ContentType || 'application/octet-stream',
    size: head.ContentLength || 0,
  };
}
