# Módulo de Inventario Agrícola y Trazabilidad Kardex - SICIC-INSAI V2.0

Este documento describe la arquitectura y componentes del módulo de **Inventario y Control de Insumos** (`/inventario`) en la interfaz de usuario.

---

## 1. Visión General del Módulo (`src/pages/inventario`)

El módulo de inventario permite administrar el catálogo de insumos agrícolas y vacunación, controlar las existencias de stock por oficina o centro de validación y registrar movimientos de Kardex (Entradas, Salidas, Ajustes y Despachos para inspección).

### Pestañas Principales:
1. **Catálogo de Insumos:** Registro de biológicos, vacunas, agroquímicos y herramientas con su categoría y unidad de medida.
2. **Existencias / Stock por Oficina:** Tabla de existencias actuales agrupadas por oficina INSAI, lote y fecha de vencimiento.
3. **Movimientos Kardex:** Historial detallado de movimientos de entrada y salida con responsable, acta vinculada y motivo.

---

## 2. Modal de Registro de Movimientos Kardex (`KardexMovementModal`)

Para garantizar el control riguroso de insumos y biológicos:

- **Validación de Stock Disponible:** Al seleccionar una salida o consumo por inspección, el formulario valida en tiempo real que la cantidad a despachar no supere el `stock_actual` del lote seleccionado.
- **Selects Dinámicos de Tipo de Movimiento:**
  - `ENTRADA`: Incrementa las existencias en el lote especificado.
  - `SALIDA`: Reduce existencias (ej. insumo vencido o dañado).
  - `AJUSTE`: Corrección justificada de inventario.
  - `DESPACHO_INSPECCION`: Vincula automáticamente el movimiento al id de la Inspección o Acta de Silo.

---

## 3. Custom Hook `useInventario`

La comunicación de datos se gestiona mediante el hook `use-inventario.ts`, el cual expone:

- `useInsumos()`: Listado del catálogo general de insumos.
- `useInsumosStock(oficinaId)`: Consulta de existencias filtradas por oficina.
- `useMovimientos(filters)`: Historial de movimientos con soporte de búsqueda multitérmino.
- `useCreateMovimiento()`: Mutation con invalidación automática de caché para refrescar stock al registrar una transacción.

---

## 4. Alertas Visuales de Stock Crítico

La interfaz aplica resaltados de color basados en los umbrales de stock:
- 🔴 **Rojo (Stock Crítico / Agotado):** `stock_actual <= stock_minimo`.
- 🟡 **Amarillo (Próximo a Vencer):** `fecha_vencimiento` dentro de los próximos 30 días.
- 🟢 **Verde (Stock Adecuado):** Existencias normales.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
