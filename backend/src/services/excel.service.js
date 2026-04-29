import ExcelJS from 'exceljs';

class ExcelService {
  /**
   * Genera un archivo Excel profesional.
   * @param {Object} options Opciones para la generación.
   * @param {string} options.title Título dinámico del reporte.
   * @param {Array} options.columns Configuración de columnas [{header, key, width}].
   * @param {Array} options.data Datos a insertar.
   * @param {string} options.sheetName Nombre de la pestaña.
   * @returns {Promise<Buffer>} El buffer del archivo Excel.
   */
  async generate({ title, columns, data, sheetName = 'Reporte' }) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    //  Título Dinámico
    worksheet.mergeCells('A1', String.fromCharCode(64 + columns.length) + '1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = title.toUpperCase();
    titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2E7D32' }, // Verde institucional
    };

    // Información del Reporte
    worksheet.getCell('A2').value = `Fecha de Generación: ${new Date().toLocaleString()}`;
    worksheet.getCell('A2').font = { italic: true };

    //  Configuración de Columnas
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20,
      style: { font: { name: 'Arial', size: 11 } }
    }));

    //  Estilo de Encabezados (Fila 4)
    const headerRow = worksheet.getRow(4);
    headerRow.values = columns.map(col => col.header);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B5E20' }, // Verde oscuro
      };
      cell.alignment = { horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    //  Insertar Datos 
    data.forEach((item, index) => {
      const row = worksheet.addRow(item);
      // Estilo de cebra
      if (index % 2 === 0) {
        row.eachCell(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF1F8E9' }
          };
        });
      }
    });

    // 6. Fila de Totalización 
    const totalRowNumber = worksheet.lastRow.number + 1;
    const totalRow = worksheet.getRow(totalRowNumber);

    // Ponemos el total en la primera columna 
    totalRow.getCell(1).value = 'TOTAL DE REGISTROS';
    totalRow.getCell(2).value = data.length;

    totalRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F5E9' }
      };
      cell.border = { top: { style: 'medium' } };
    });

    // Ajustar filtros
    worksheet.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: columns.length },
    };

    return await workbook.xlsx.writeBuffer();
  }
}

export default new ExcelService();
