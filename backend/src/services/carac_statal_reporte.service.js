import ExcelJS from 'exceljs';

/**
 * Servicio de recopilación y exportación de Caracterización Estatal
 */
class CaracStatalReporteService {
  /**
   * Obtiene todos los datos consolidados municipio por municipio
   */
  async buildCaracStatalData(tenantPrisma, estadoId = null) {
    const where = {};
    let estadoObj = null;

    if (estadoId && estadoId !== 'todos' && estadoId !== 'all') {
      const parsedId = Number(estadoId);
      if (!isNaN(parsedId) && parsedId > 0) {
        where.estado_id = parsedId;
        estadoObj = await tenantPrisma.estados.findUnique({
          where: { id: parsedId },
        });
      }
    }

    // 1. Obtener todos los municipios ordenados con su estado y carac_statal
    const municipios = await tenantPrisma.municipios.findMany({
      where,
      orderBy: { nombre: 'asc' },
      include: {
        estados: true,
        carac_statal: true,
      },
    });

    // 2. Obtener todas las propiedades con su ubicación y animales
    const propiedades = await tenantPrisma.propiedades.findMany({
      include: {
        propiedad_ubicacion: {
          include: {
            sectores: {
              include: {
                parroquias: {
                  include: {
                    municipios: true,
                  },
                },
              },
            },
          },
        },
        propiedad_animales: {
          include: {
            animales: {
              include: {
                t_animales: true,
              },
            },
          },
        },
      },
    });

    // 3. Mapear predios y animales por municipio_id
    const prediosPorMunicipio = new Map();
    const animalesPorMunicipio = new Map();

    for (const prop of propiedades) {
      const ubi = prop.propiedad_ubicacion?.[0];
      const munId = ubi?.sectores?.parroquias?.municipio_id;
      if (!munId) continue;

      // Conteo de predios
      prediosPorMunicipio.set(munId, (prediosPorMunicipio.get(munId) || 0) + 1);

      // Conteo de animales
      if (!animalesPorMunicipio.has(munId)) {
        animalesPorMunicipio.set(munId, {
          bovinos: 0,
          bufalinos: 0,
          porcinos: 0,
          pequenos_rumiantes: 0,
          equidos: 0,
          aves: 0,
        });
      }

      const animCounts = animalesPorMunicipio.get(munId);
      for (const pa of prop.propiedad_animales || []) {
        const cant = Number(pa.cantidad) || 0;
        const nombre = `${pa.animales?.nombre || ''} ${pa.animales?.t_animales?.nombre || ''}`.toLowerCase();

        if (/bovin|vaca|toro|buey|novill|maute|becerr/i.test(nombre)) {
          animCounts.bovinos += cant;
        } else if (/bufal|búfal|bucer/i.test(nombre)) {
          animCounts.bufalinos += cant;
        } else if (/porcin|cerdo|cochin|lechon/i.test(nombre)) {
          animCounts.porcinos += cant;
        } else if (/rumiant|caprin|ovin|cabra|oveja|chivo|cordero/i.test(nombre)) {
          animCounts.pequenos_rumiantes += cant;
        } else if (/equid|équid|caball|mulo|asno|burr|yegua|potro/i.test(nombre)) {
          animCounts.equidos += cant;
        } else if (/ave|pollo|gallina|gallo|pavo|pato|codorniz/i.test(nombre)) {
          animCounts.aves += cant;
        }
      }
    }

    // 4. Consolidar registros por municipio
    const records = municipios.map((m) => {
      const cs = m.carac_statal || {};
      const anim = animalesPorMunicipio.get(m.id) || {
        bovinos: 0,
        bufalinos: 0,
        porcinos: 0,
        pequenos_rumiantes: 0,
        equidos: 0,
        aves: 0,
      };

      const areaKm2 = Number(m.area_km2) || 0;

      return {
        id: m.id,
        municipio: m.nombre.toUpperCase(),
        estado: m.estados?.nombre?.toUpperCase() || 'YARACUY',
        area_km2: areaKm2,
        area_km2_formatted: areaKm2 > 0 ? `${areaKm2.toLocaleString('es-VE')} km²` : '-',
        num_veterinarios_oficiales: Number(cs.num_veterinarios_oficiales) || 0,
        num_paraveterinarios_oficiales: Number(cs.num_paraveterinarios_oficiales) || 0,
        num_administrativos_oficiales: Number(cs.num_administrativos_oficiales) || 0,
        num_vehiculos_operativos: Number(cs.num_vehiculos_operativos) || 0,
        num_predios: prediosPorMunicipio.get(m.id) || 0,
        bovinos: anim.bovinos,
        bufalinos: anim.bufalinos,
        porcinos: anim.porcinos,
        pequenos_rumiantes: anim.pequenos_rumiantes,
        equidos: anim.equidos,
        aves: anim.aves,
      };
    });

    // 5. Totales generales del estado
    const totales = records.reduce(
      (acc, r) => {
        acc.area_km2 += r.area_km2;
        acc.num_veterinarios_oficiales += r.num_veterinarios_oficiales;
        acc.num_paraveterinarios_oficiales += r.num_paraveterinarios_oficiales;
        acc.num_administrativos_oficiales += r.num_administrativos_oficiales;
        acc.num_vehiculos_operativos += r.num_vehiculos_operativos;
        acc.num_predios += r.num_predios;
        acc.bovinos += r.bovinos;
        acc.bufalinos += r.bufalinos;
        acc.porcinos += r.porcinos;
        acc.pequenos_rumiantes += r.pequenos_rumiantes;
        acc.equidos += r.equidos;
        acc.aves += r.aves;
        return acc;
      },
      {
        area_km2: 0,
        num_veterinarios_oficiales: 0,
        num_paraveterinarios_oficiales: 0,
        num_administrativos_oficiales: 0,
        num_vehiculos_operativos: 0,
        num_predios: 0,
        bovinos: 0,
        bufalinos: 0,
        porcinos: 0,
        pequenos_rumiantes: 0,
        equidos: 0,
        aves: 0,
      }
    );

    const estadoNombre = estadoObj?.nombre?.toUpperCase() || records[0]?.estado || 'ESTADO GENERAL';

    return {
      estado: estadoNombre,
      records,
      totales,
    };
  }

  /**
   * Genera el libro Excel idéntico a la plantilla institucional
   */
  async generateExcel(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('CARACTERIZACIÓN DEL ESTADO', {
      pageSetup: { orientation: 'landscape', paperSize: 9 },
    });

    const { estado, records, totales } = data;

    // Fila 1: Encabezado Institucional
    worksheet.mergeCells('A1:F2');
    const headerLeft = worksheet.getCell('A1');
    headerLeft.value = 'Gobierno Bolivariano de Venezuela  |  Ministerio del Poder Popular para la Agricultura Productiva y Tierras';
    headerLeft.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1F2937' } };
    headerLeft.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    worksheet.mergeCells('G1:M2');
    const headerRight = worksheet.getCell('G1');
    headerRight.value = 'INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)';
    headerRight.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF990000' } };
    headerRight.alignment = { vertical: 'middle', horizontal: 'right' };

    // Fila 3: Banner Rojo con Título
    worksheet.mergeCells('A3:M3');
    const banner = worksheet.getCell('A3');
    banner.value = `CARACTERIZACIÓN DEL ESTADO: ${estado}`;
    banner.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    banner.alignment = { vertical: 'middle', horizontal: 'center' };
    banner.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF990000' }, // Rojo oscuro institucional
    };
    worksheet.getRow(3).height = 28;

    // Fila 4 y 5: Encabezados de Tabla Multi-Nivel
    // Columnas A-G fusionadas verticalmente (Fila 4 a 5)
    const singleHeaders = [
      { col: 'A', name: 'MUNICIPIO', width: 22 },
      { col: 'B', name: 'AREA GEOGRAFICA DEL MUNICIPIO (Km2)', width: 22 },
      { col: 'C', name: 'NUMERO DE MEDICOS VETERINARIOS OFICIALES', width: 20 },
      { col: 'D', name: 'NUMERO DE PERSONAL PARAVETERINARIOS OFICIALES', width: 22 },
      { col: 'E', name: 'NUMERO DE PERSONAL ADMINISTRATIVO OFICIALES', width: 22 },
      { col: 'F', name: 'NUMERO DE VEHICULOS OPERATIVOS OFICIALES', width: 20 },
      { col: 'G', name: 'NUMERO DE PREDIOS', width: 18 },
    ];

    singleHeaders.forEach(({ col, name, width }) => {
      worksheet.mergeCells(`${col}4:${col}5`);
      const cell = worksheet.getCell(`${col}4`);
      cell.value = name;
      cell.font = { name: 'Arial', size: 8.5, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5E6E6' }, // Rosado/gris claro
      };
      worksheet.getColumn(col).width = width;
    });

    // Fila 4: Header Agrupador "POBLACION ANIMAL" (H4:M4)
    worksheet.mergeCells('H4:M4');
    const animHeader = worksheet.getCell('H4');
    animHeader.value = 'POBLACION ANIMAL';
    animHeader.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    animHeader.alignment = { vertical: 'middle', horizontal: 'center' };
    animHeader.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF990000' }, // Rojo oscuro
    };

    // Fila 5: Sub-columnas de Población Animal
    const animalHeaders = [
      { col: 'H', name: 'BOVINOS', width: 14 },
      { col: 'I', name: 'BUFALINOS', width: 14 },
      { col: 'J', name: 'PORCINOS', width: 14 },
      { col: 'K', name: 'PEQUEÑOS RUMIANTES', width: 16 },
      { col: 'L', name: 'EQUIDOS', width: 14 },
      { col: 'M', name: 'AVES', width: 14 },
    ];

    animalHeaders.forEach(({ col, name, width }) => {
      const cell = worksheet.getCell(`${col}5`);
      cell.value = name;
      cell.font = { name: 'Arial', size: 8, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFB30000' }, // Rojo medio
      };
      worksheet.getColumn(col).width = width;
    });

    worksheet.getRow(4).height = 26;
    worksheet.getRow(5).height = 26;

    // Bordes para los encabezados
    for (let r = 4; r <= 5; r++) {
      const row = worksheet.getRow(r);
      for (let c = 1; c <= 13; c++) {
        const cell = row.getCell(c);
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF999999' } },
          left: { style: 'thin', color: { argb: 'FF999999' } },
          bottom: { style: 'thin', color: { argb: 'FF999999' } },
          right: { style: 'thin', color: { argb: 'FF999999' } },
        };
      }
    }

    // Insertar Filas de Datos (Municipios)
    let currentRow = 6;
    records.forEach((r, idx) => {
      const row = worksheet.getRow(currentRow);
      row.values = [
        r.municipio,
        r.area_km2 > 0 ? `${r.area_km2.toLocaleString('es-VE')} km²` : '-',
        r.num_veterinarios_oficiales || 0,
        r.num_paraveterinarios_oficiales || 0,
        r.num_administrativos_oficiales || 0,
        r.num_vehiculos_operativos || 0,
        r.num_predios || 0,
        r.bovinos || 0,
        r.bufalinos || 0,
        r.porcinos || 0,
        r.pequenos_rumiantes || 0,
        r.equidos || 0,
        r.aves || 0,
      ];

      row.height = 20;

      // Formato y bordes de celdas
      for (let c = 1; c <= 13; c++) {
        const cell = row.getCell(c);
        cell.font = { name: 'Arial', size: 9 };
        cell.alignment = {
          vertical: 'middle',
          horizontal: c === 1 ? 'left' : 'center',
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        };
        if (idx % 2 === 1) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFDF8F8' },
          };
        }
      }

      currentRow++;
    });

    // Fila de Totales
    const totalRow = worksheet.getRow(currentRow);
    totalRow.values = [
      'TOTAL DEL ESTADO',
      totales.area_km2 > 0 ? `${totales.area_km2.toLocaleString('es-VE')} km²` : '-',
      totales.num_veterinarios_oficiales,
      totales.num_paraveterinarios_oficiales,
      totales.num_administrativos_oficiales,
      totales.num_vehiculos_operativos,
      totales.num_predios,
      totales.bovinos,
      totales.bufalinos,
      totales.porcinos,
      totales.pequenos_rumiantes,
      totales.equidos,
      totales.aves,
    ];
    totalRow.height = 24;

    for (let c = 1; c <= 13; c++) {
      const cell = totalRow.getCell(c);
      cell.font = { name: 'Arial', size: 9.5, bold: true, color: { argb: 'FF000000' } };
      cell.alignment = {
        vertical: 'middle',
        horizontal: c === 1 ? 'left' : 'center',
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0D0D0' }, // Rosado más oscuro
      };
      cell.border = {
        top: { style: 'medium', color: { argb: 'FF990000' } },
        left: { style: 'thin', color: { argb: 'FF999999' } },
        bottom: { style: 'medium', color: { argb: 'FF990000' } },
        right: { style: 'thin', color: { argb: 'FF999999' } },
      };
    }

    return await workbook.xlsx.writeBuffer();
  }
}

export default new CaracStatalReporteService();
