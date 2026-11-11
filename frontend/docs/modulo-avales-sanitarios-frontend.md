# Módulo de Avales Sanitarios (Frontend)

Este documento detalla la arquitectura, experiencia de usuario (UI/UX), validaciones y lógica de negocio del módulo de Avales Zoosanitarios (`frontend/src/pages/Avales.tsx` y componentes asociados).

---

## 1. Propósito y Alcance Operativo

El módulo de Avales Sanitarios permite la certificación sanitaria oficial de predios y rebaños pecuarios, acreditando la vacunación obligatoria contra fiebre aftosa, rabia, brucelosis y otras enfermedades de control oficial por parte del INSAI.

### Componentes Clave
* **`Avales.tsx`:** Vista principal con tabla de avales emitidos, filtros por estado, búsqueda multi-término y modal de creación/edición.
* **`AvalDetailsModal.tsx`:** Modal de visualización rápida con ficha técnica completa, resumen de animales vacunados, biológicos aplicados, hierros ganaderos y botón de descarga PDF.
* **`ReporteAvalOficial.tsx`:** Documento imprimible oficial generado con `@react-pdf/renderer` para entrega física al productor.

---

## 2. Flexibilidad en la Carga de Biológicos y Vacunas

A solicitud de los médicos veterinarios e inspectores de campo, el sistema ofrece una modalidad dual para el registro de biológicos:

### 2.1. Carga desde Inventario Central
* El usuario puede buscar y seleccionar vacunas existentes en el catálogo del kardex (`Item`).
* Se autocompletan el nombre comercial del insumo, la marca del fabricante y el lote correspondiente.
* Opcionalmente descuenta del stock de la sede según los permisos del operador.

### 2.2. Entrada Manual de Biológicos
* Permite al usuario registrar biológicos sin necesidad de que existan previamente en el inventario del sistema.
* Campos capturados:
  * **Nombre de la Vacuna:** Por ejemplo, "Vacuna contra la Fiebre Aftosa", "Cepa 19", "Rabia Bivalente".
  * **Número de Lote:** Identificador del frasco o ampolla.
  * **Marca / Laboratorio Fabricante:** Ej. Biogénesis Bagó, MSD, Limor.
  * **Fecha de Aplicación:** Fecha en la que se inoculó el rebaño.
  * **Pruebas Diagnósticas:** Muestreos serológicos complementarios (Brucelosis, Tuberculosis, etc.).

---

## 3. Cálculo de Vigencia y Semáforo Visual de Estados

Para brindar una experiencia intuitiva al usuario final, el sistema calcula dinámicamente el periodo de validez del documento:

### 3.1. Fórmula de Cálculo de Días
```typescript
const diasVigenciaTotal = useMemo(() => {
  if (!aval?.fecha_emision || !aval?.fecha_vencimiento) return null;
  try {
    const emision = new Date(aval.fecha_emision.slice(0, 10));
    const vencimiento = new Date(aval.fecha_vencimiento.slice(0, 10));
    const diffMs = vencimiento.getTime() - emision.getTime();
    const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return dias > 0 ? dias : 0;
  } catch {
    return null;
  }
}, [aval?.fecha_emision, aval?.fecha_vencimiento]);
```

### 3.2. Indicadores Visuales (Badges)
* **Vigente (Verde):** La fecha actual es anterior a la fecha de vencimiento y faltan más de 15 días.
* **Por Vencer (Ámbar):** El aval está dentro de los últimos 15 días de vigencia legal.
* **Vencido (Rojo):** La fecha actual superó la fecha de caducidad estipulada en el certificado.
* En el encabezado del modal se expone la etiqueta combinada: `[VIGENCIA: X DÍAS TOTALES]`.

---

## 4. Registro y Visualización Multi-Especie

El formulario y el visor del aval dividen el censo pecuario en dos categorías estructuradas:

1. **Rebaño Bovino y Bufalino:**
   * Desglose individual de machos y hembras por grupos etarios:
     * Toros, Vacas, Novillos, Novillas, Mautes, Mautas, Becerros, Becerras.
     * Búfalos, Búfalas, Buvillos, Buvillas, Bumautes, Bumautas, Bucerros, Bucerras.
   * Totalizador reactivo automático en cabecera: `TOTAL: X Cabezas`.

2. **Otras Especies:**
   * Soporte para Porcinos, Ovinos, Caprinos, Equinos, Aves y Avícola.
   * Conteo discriminado en tres columnas: **Machos**, **Hembras** y **Crías**, con cálculo de subtotales inmediatos.

---

## 5. Visualización de Marcas de Hierro Ganadero

Para garantizar la resolución correcta de las marcas de hierro registradas en la inspección base:
* Se utiliza la utilidad transversal `resolveMediaUrl(h.hierro_img_url)` de `frontend/src/lib/media-url.ts`.
* Esta utilidad detecta automáticamente si el backend está configurado en almacenamiento local (`/uploads/...`) o en la nube (Cloudflare R2 / S3), reescribiendo la ruta para evitar imágenes rotas o errores de protocolo mixto (HTTP/HTTPS).

---

## 6. Manejo de Parámetros de URL y Prevención de Errores

Cuando el usuario navega a Avales proveniente de una inspección aprobada (`/home/avales?inspeccion_id=7&openModal=true`):
1. El componente lee los parámetros para precargar el formulario con los datos del predio y del productor.
2. Inmediatamente ejecuta `setSearchParams({}, { replace: true })` para limpiar la barra de direcciones.
3. Esto previene que una recarga accidental de la página abra involuntariamente el modal sobre un registro ya procesado o cause discrepancias en los hooks de ciclo de vida.

