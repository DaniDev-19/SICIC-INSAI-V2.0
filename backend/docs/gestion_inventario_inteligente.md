# Gestión de Inventario Inteligente (Kardex)

El sistema de inventario de SICIC-INSAI V2.0 está diseñado bajo el principio de "Trazabilidad Total", permitiendo saber exactamente quién sacó qué insumo, de qué oficina y para qué proceso.

---

##  Arquitectura del Servicio
El inventario opera a través del `InventoryService`, un servicio centralizado que actúa como un **Hub** para todos los módulos operativos.

### Tablas Principales:
- **`insumos_stock`**: El balance actual de cada insumo por oficina y lote.
- **`movimientos_insumos`**: El historial (Libro Mayor) de cada entrada, salida o ajuste.

---

## Inteligencia de Stock

### 1. Validación Estricta
El sistema impide que el stock caiga por debajo de cero. Cualquier intento de "salida" que supere el stock actual lanzará una excepción y detendrá la transacción de base de datos.

### 2. Reversión Automática (Smart Delete)
Si se elimina un proceso (un Aval, una Inspección o un Acta) que consumió insumos, el sistema detecta esos movimientos y los **revierte automáticamente**:
- Restaura la cantidad al stock de la oficina original.
- Registra un movimiento de tipo `ENTRADA` o `DEVOLUCION` marcado como "REVERSIÓN AUTOMÁTICA" para auditoría.

### 3. Alertas de Stock Bajo
El servicio compara el `stock_actual` con el `stock_minimo` definido. Si el balance es igual o menor, emite una advertencia en los logs del servidor (preparado para integrarse con el servicio de notificaciones).

---

##  Cómo se Integra en el Código

El `InventoryService` no se usa como middleware, sino que se inyecta directamente en las **transacciones** de los controladores:

```javascript
// Ejemplo de integración en un Controlador
await tx.$transaction(async (tx) => {
  // 1. Crear el registro principal (Aval, Silo, etc.)
  const result = await tx.proceso.create({...});
  
  // 2. Descontar inventario vinculado
  await inventoryService.registrarMovimiento({
    tx,
    insumo_id: 123,
    oficina_id: 1,
    tipo_movimiento: 'CONSUMO',
    cantidad: 10,
    aval_id: result.id,
    empleado_id: user.id
  });
});
```

---

## Trazabilidad de Auditoría
Cada movimiento en la tabla `movimientos_insumos` guarda referencias a:
- `inspeccion_id`
- `acta_silo_id`
- `seguimiento_id`
- `aval_id`

Esto permite generar reportes de costos y consumo de insumos por oficina o por tipo de inspección con un solo clic.

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
