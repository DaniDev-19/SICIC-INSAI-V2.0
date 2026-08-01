# Motor de Generación de Reportes PDF y Excel - SICIC-INSAI V2.0

Este documento describe la arquitectura de exportación y generación de documentos oficiales en formatos **PDF** (usando `pdfkit`) y **Excel** (usando `exceljs`) dentro del backend.

---

## 1. Visión General de Arquitectura

El sistema proporciona reportes dinámicos institucionales para trámites sanitarios, actas de inspección, certificados e inventarios. La generación de documentos está desacoplada en servicios reutilizables ubicados en `src/services/`:

- `pdf.service.js`: Motor base para estructuración de documentos PDFKit, membretes, paginación y diseño de celdas.
- `inspeccion-reporte.service.js`: Generador especializado de informes de inspección sanitaria.
- `acta-silo-reporte.service.js`: Generador especializado de actas epidemiológicas e inspección de silos.
- `excel.service.js`: Motor de exportación tabular para hojas de cálculo Excel.

---

## 2. Servicio de Generación PDF (`PDFService` & Reportes)

### Características Institucionales:
1. **Membrete Oficial INSAI:** Incorporación automática de logotipos institucionales (MPPAT / INSAI) desde activos locales (`src/assets/`).
2. **Formato y Margen Ajustado:** Configuración en tamaño Carta (Letter) u Oficio (Legal), con márgenes de 30pt a 50pt para maximizar el área imprimible.
3. **Tablas Dinámicas con Auto-Wrapping:** Manejo de celdas cuadradas y bordes vectoriales con salto de línea automático en texto largo.
4. **Numeración de Páginas y Firmas:** Bloque inferior estandarizado para firmas de inspectores, médicos veterinarios responsables y sello oficial de la oficina estatal.

### Flujo de Ejecución (Stream HTTP):
En lugar de guardar archivos temporales en el disco del servidor, los reportes PDF se compilan en memoria como un **Stream de Lectura** (Buffer/Stream) que se transmite directamente en la respuesta HTTP:

```javascript
// Ejemplo de respuesta HTTP para PDF
res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', `inline; filename=Inspeccion_${id}.pdf`);
doc.pipe(res);
```

---

## 3. Servicio de Generación Excel (`ExcelService`)

El servicio `excel.service.js` permite exportar cualquier conjunto de datos a formato `.xlsx` nativo.

### Características del Documento Excel:
- **Encabezados Institucionales:** Fila superior con color verde institucional INSAI (`#006633`), fuente en negrita blanca.
- **Auto-Ajuste de Columnas:** Cálculo dinámico del ancho de columna según la longitud de los datos.
- **Fila de Cierre y Totales:** Inserción automática de fila sumatoria o totalizador de registros.
- **Filtros Automáticos:** Inclusión nativa de la función AutoFilter de Excel en todos los campos.

### Ejemplo de Endpoint HTTP:
```javascript
// GET /api/empleados/export
const workbook = await excelService.generateReport({
  title: 'REPORTE GENERAL DE EMPLEADOS',
  columns: [ ... ],
  data: empleadosList
});

res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
res.setHeader('Content-Disposition', 'attachment; filename=Empleados.xlsx');
await workbook.xlsx.write(res);
res.end();
```

---

## 4. Prácticas de Mantenimiento y Extensión

1. **Formatos de Fecha y Moneda:** Todos los reportes aplican la zona horaria oficial y formateo numérico venezolano.
2. **Inclusión de Imágenes:** Las fotografías de inspecciones o silos registradas en la DB se procesan mediante `sharp` / `image.service.js` antes de insertarse en el PDF.
3. **Manejo de Errores:** Si falta un recurso gráfico o un campo opcional, el servicio incluye fallbacks elegantes sin interrumpir el renderizado del documento.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
