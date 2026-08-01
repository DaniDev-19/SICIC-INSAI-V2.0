# Módulo de Reportes, Visualización PDF y Exportación - SICIC-INSAI V2.0

Este documento detalla la arquitectura de la sección de **Reportes** (`/reportes`), la previsualización interactiva de documentos PDF y la exportación masiva de datos a hojas de cálculo Excel desde el frontend.

---

## 1. Estructura de la Vista de Reportes (`src/pages/reportes`)

La interfaz de reportes se organiza en componentes modulares diseñados para brindar la máxima flexibilidad de filtrado al usuario:

- `ReportesPage.tsx`: Vista principal que reúne los paneles de configuración y tipos de informes.
- `PdfPreviewDialog.tsx`: Modal flotante de previsualización que renderiza el documento PDF directamente en el navegador.
- `FiltrosReporte.tsx`: Formulario de filtrado reactivo por rango de fechas (desde / hasta), estado, municipio, oficina insai y programa sanitario.

---

## 2. Visor Interactivo de PDF (`PdfPreviewDialog`)

El frontend utiliza un visor embebido seguro basado en Blob / Object URL para mostrar los documentos PDF generados por el backend:

### Flujo de Previsualización:
1. El usuario selecciona la inspección o acta de silo y pulsa el botón **"Previsualizar PDF"**.
2. El servicio correspondiente (`inspeccionesService.getPdf(id)`) realiza una petición HTTP solicitando el tipo de respuesta `blob`.
3. Se crea una URL de objeto en memoria:
   ```typescript
   const blob = await response.blob();
   const url = URL.createObjectURL(blob);
   ```
4. Se renderiza dentro de un elemento `<iframe src={url} className="w-full h-[80vh]" />` dentro del modal.
5. Al cerrar el modal, se ejecuta `URL.revokeObjectURL(url)` para evitar fugas de memoria en el navegador.

---

## 3. Descarga Masiva a Excel (`exportToExcel`)

En cada listado principal (Clientes, Propiedades, Inventario, Empleados), la barra de acciones incluye el botón **"Exportar Excel"**:

- Al hacer clic, se llama a la API con la configuración de filtros activos.
- El servidor retorna el stream binario de `exceljs`.
- Se activa la descarga automática en el cliente asignando el nombre oficial del archivo (ej. `Listado_Clientes_INSAI_2026.xlsx`).

---

## 4. Estándares de Diseño y UI

- **Botones con Feedback de Carga:** Muestran estados `isDownloading` con spinner interactivo mientras se genera el reporte.
- **Iconografía:** Utiliza Lucide React (`FileText`, `Download`, `Eye`, `Printer`).
- **Control de Permisos:** La funcionalidad de exportación está protegida según el rol del usuario mediante `useModulePermissions`.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
