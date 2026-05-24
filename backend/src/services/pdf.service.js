import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PDFDocument from 'pdfkit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CINTILLO_PATH = path.join(__dirname, '../assets/cintillo-nuevo.png');

const BRAND = {
  primary: '#1B5E20',
  primaryDark: '#2E7D32',
  zebra: '#F1F8E9',
  border: '#BDBDBD',
  text: '#212121',
};

/**
 * Servicio global de PDF tabular (misma idea que excel.service.js).
 */
class PdfService {
  resolveCintilloPath(customPath) {
    if (customPath && fs.existsSync(customPath)) return customPath;
    if (fs.existsSync(CINTILLO_PATH)) return CINTILLO_PATH;
    return null;
  }

  /**
   * @param {Object} options
   * @param {string} options.title
   * @param {Array<{header: string, key: string, width?: number}>} options.columns
   * @param {Array<Record<string, unknown>>} options.data
   * @param {'portrait'|'landscape'} [options.orientation]
   * @param {string} [options.subtitle]
   * @param {string} [options.bannerPath]
   * @returns {Promise<Buffer>}
   */
  async generateTable({
    title,
    columns,
    data,
    orientation = 'landscape',
    subtitle,
    bannerPath,
  }) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: orientation,
        margins: { top: 40, bottom: 50, left: 40, right: 40 },
        bufferPages: true,
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      let cursorY = doc.page.margins.top;

      const cintillo = this.resolveCintilloPath(bannerPath);
      if (cintillo) {
        doc.image(cintillo, doc.page.margins.left, cursorY, {
          fit: [pageWidth, 48],
          align: 'center',
          valign: 'center',
        });
        cursorY += 54;
      }

      doc.y = cursorY;
      doc
        .font('Helvetica-Bold')
        .fontSize(14)
        .fillColor(BRAND.primaryDark)
        .text(String(title).toUpperCase(), { align: 'center' });

      doc.moveDown(0.35);
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(BRAND.text)
        .text(
          subtitle ||
            `SICIC • INSAI • Generado: ${new Date().toLocaleString('es-VE')}`,
          { align: 'center' }
        );

      doc.moveDown(0.8);

      const colCount = columns.length;
      const colWidth = pageWidth / colCount;
      const rowHeight = 20;
      const headerHeight = 24;
      const bottomLimit = doc.page.height - doc.page.margins.bottom - 30;

      const drawHeader = (y) => {
        let x = doc.page.margins.left;
        columns.forEach((col) => {
          doc.rect(x, y, colWidth, headerHeight).fillAndStroke(BRAND.primary, BRAND.border);
          doc
            .fillColor('#FFFFFF')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text(col.header, x + 4, y + 7, {
              width: colWidth - 8,
              align: 'center',
              ellipsis: true,
            });
          x += colWidth;
        });
        return y + headerHeight;
      };

      let y = drawHeader(doc.y);

      data.forEach((row, index) => {
        if (y + rowHeight > bottomLimit) {
          doc.addPage();
          y = drawHeader(doc.page.margins.top);
        }

        const fill = index % 2 === 0 ? BRAND.zebra : '#FFFFFF';
        let x = doc.page.margins.left;

        columns.forEach((col) => {
          doc.rect(x, y, colWidth, rowHeight).fillAndStroke(fill, BRAND.border);
          const value = row[col.key];
          doc
            .fillColor(BRAND.text)
            .font('Helvetica')
            .fontSize(7.5)
            .text(value === null || value === undefined ? '' : String(value), x + 4, y + 6, {
              width: colWidth - 8,
              ellipsis: true,
            });
          x += colWidth;
        });

        y += rowHeight;
      });

      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor(BRAND.primary)
        .text(`TOTAL DE REGISTROS: ${data.length}`, doc.page.margins.left, y + 10);

      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .font('Helvetica')
          .fontSize(7)
          .fillColor('#666666')
          .text(
            `Página ${i + 1} de ${pages.count}`,
            doc.page.margins.left,
            doc.page.height - doc.page.margins.bottom + 12,
            { width: pageWidth, align: 'right' }
          );
      }

      doc.end();
    });
  }
}

export default new PdfService();
