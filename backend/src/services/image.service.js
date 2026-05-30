import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';


class ImageService {
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

  resolveRelativePath(fileUrl) {
    if (!fileUrl) return null;
    const raw = String(fileUrl).trim();
    if (raw.includes('/uploads/')) {
      return raw.split('/uploads/')[1];
    }
    try {
      const pathname = new URL(raw).pathname;
      if (pathname.includes('/uploads/')) {
        return pathname.split('/uploads/')[1];
      }
    } catch {
      /* ruta relativa */
    }
    return raw.replace(/^\//, '').replace(/^uploads\//, '');
  }

  async uploadToR2(buffer, fileName) {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg',
    });
    await this.s3Client.send(command);
    return `${process.env.R2_PUBLIC_URL}/${fileName}`;
  }

  async uploadToLocal(buffer, fileName) {
    const uploadsDir = path.resolve('uploads');
    const fullPath = path.join(uploadsDir, fileName);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, buffer);

    const baseUrl = process.env.UPLOAD_URL_BASE || '/uploads';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/${fileName}`;
  }

  async uploadInspectionPhoto(fileBuffer, fileName) {
    const jpegBuffer = await sharp(fileBuffer).rotate().jpeg({ quality: 86 }).toBuffer();

    const timestamp = Date.now();
    const cleanName = String(fileName).toLowerCase().replace(/\s+/g, '-');
    const relativePath = `inspecciones/${cleanName}-${timestamp}.jpg`;

    if (this.mode === 'r2') {
      return this.uploadToR2(jpegBuffer, relativePath);
    }
    return this.uploadToLocal(jpegBuffer, relativePath);
  }

  async readFileBuffer(fileUrl) {
    if (!fileUrl) return null;

    if (this.mode === 'r2' || /^https?:\/\//i.test(fileUrl)) {
      const res = await fetch(fileUrl);
      if (!res.ok) return null;
      return Buffer.from(await res.arrayBuffer());
    }

    const relativePath = this.resolveRelativePath(fileUrl);
    if (!relativePath) return null;
    const fullPath = path.resolve('uploads', relativePath);
    return fs.readFile(fullPath);
  }

  async toPdfDataUrl(fileUrl) {
    try {
      const buffer = await this.readFileBuffer(fileUrl);
      if (!buffer) return null;
      const jpegBuffer = await sharp(buffer).jpeg({ quality: 88 }).toBuffer();
      return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
    } catch (error) {
      console.error(`No se pudo preparar imagen para PDF: ${fileUrl}`, error.message);
      return null;
    }
  }
}

export default new ImageService();
