import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

class StorageService {
  constructor() {
    this.mode = process.env.STORAGE_MODE || 'local';

    if (this.mode === 'r2') {
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: process.env.R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  /**
   * Procesa una imagen: la convierte a WebP y la sube al destino configurado.
   * @param {Buffer} fileBuffer Buffer de la imagen original.
   * @param {string} fileName Nombre deseado para el archivo (sin extensión).
   * @param {string} folder Carpeta de destino (ej: 'empleados', 'inspecciones').
   * @returns {Promise<string>} URL pública del archivo subido.
   */
  async uploadImage(fileBuffer, fileName, folder = 'general') {
    const timestamp = Date.now();
    const cleanName = fileName.toLowerCase().replace(/\s+/g, '-');
    const finalFileName = `${folder}/${cleanName}-${timestamp}.webp`;

    const webpBuffer = await sharp(fileBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    if (this.mode === 'r2') {
      return this.uploadToR2(webpBuffer, finalFileName);
    } else {
      return this.uploadToLocal(webpBuffer, finalFileName);
    }
  }

  async uploadToR2(buffer, fileName) {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: 'image/webp',
    });

    await this.s3Client.send(command);
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  }

  async uploadToLocal(buffer, fileName) {
    const uploadsDir = path.resolve('uploads');
    const fullPath = path.join(uploadsDir, fileName);
    const dir = path.dirname(fullPath);

    await fs.mkdir(dir, { recursive: true });

    await fs.writeFile(fullPath, buffer);

    return `${process.env.UPLOAD_URL_BASE}/${fileName}`;
  }

  /**
   * Elimina un archivo del almacenamiento.
   * @param {string} fileUrl 
   */
  async deleteFile(fileUrl) {
    if (!fileUrl) return;

    try {
      if (this.mode === 'r2') {
        const urlObj = new URL(fileUrl);
        const key = urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname;

        await this.s3Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
        }));
      } else {
        const fileName = fileUrl.split('/uploads/')[1];
        if (fileName) {
          const fullPath = path.resolve('uploads', fileName);
          await fs.unlink(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error eliminando archivo físico: ${fileUrl}`, error.message);
    }
  }
}

export default new StorageService();
