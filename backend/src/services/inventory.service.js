/**
 * Servicio de Inventario de Insumos
 * Maneja la lógica de negocio para el stock y trazabilidad de movimientos.
 */

class InventoryService {
  /**
   * Registra un movimiento de insumo y actualiza el stock actual.
   * @param {Object} params
   * @param {Object} params.tx - Instancia de transacción de Prisma
   * @param {number} params.insumo_id - ID del insumo
   * @param {number} params.oficina_id - ID de la oficina/sede
   * @param {string} params.tipo_movimiento - ENTRADA, SALIDA, AJUSTE_MAS, AJUSTE_MENOS, CONSUMO
   * @param {number} params.cantidad - Cantidad a mover (siempre positiva, la lógica de suma/resta depende del tipo)
   * @param {string} [params.lote] - Lote del insumo
   * @param {Date} [params.fecha_vencimiento] - Fecha de vencimiento (para nuevas entradas)
   * @param {number} [params.inspeccion_id] - Referencia a inspección
   * @param {number} [params.acta_silo_id] - Referencia a acta de silo
   * @param {number} [params.seguimiento_id] - Referencia a seguimiento
   * @param {number} [params.aval_id] - Referencia a aval sanitario
   * @param {number} [params.empleado_id] - ID del empleado responsable
   * @param {string} [params.observaciones] - Notas adicionales
   */
  async registrarMovimiento({
    tx,
    insumo_id,
    oficina_id,
    tipo_movimiento,
    cantidad,
    lote,
    fecha_vencimiento,
    inspeccion_id,
    acta_silo_id,
    seguimiento_id,
    aval_id,
    empleado_id,
    observaciones
  }) {
    const esSalida = ['SALIDA', 'AJUSTE_MENOS', 'CONSUMO'].includes(tipo_movimiento);
    const factor = esSalida ? -1 : 1;
    const cambioStock = Number(cantidad) * factor;

    // 1. Buscar si ya existe el stock para ese insumo/oficina/lote
    const currentStock = await tx.insumos_stock.findUnique({
      where: {
        insumo_id_oficina_id_lote: {
          insumo_id,
          oficina_id,
          lote: lote || null
        }
      }
    });

    if (esSalida) {
      if (!currentStock || Number(currentStock.stock_actual) < Number(cantidad)) {
        throw new Error(`Stock insuficiente para el insumo ID ${insumo_id} en la oficina ${oficina_id}${lote ? ` (Lote: ${lote})` : ''}. Disponible: ${currentStock?.stock_actual || 0}`);
      }
    }

    // 2. Actualizar o crear el registro de stock
    if (currentStock) {
      await tx.insumos_stock.update({
        where: { id: currentStock.id },
        data: {
          stock_actual: { increment: cambioStock },
          fecha_vencimiento: fecha_vencimiento || undefined, // Solo actualizar si se provee
          updated_at: new Date()
        }
      });
    } else {
      // Si es una salida y no existe, ya lanzamos error arriba. 
      // Si es entrada, creamos el registro.
      await tx.insumos_stock.create({
        data: {
          insumo_id,
          oficina_id,
          lote: lote || null,
          fecha_vencimiento,
          stock_actual: cambioStock,
          stock_minimo: 0
        }
      });
    }

    // 3. Registrar el movimiento para la trazabilidad ("Quién sacó qué...")
    return await tx.movimientos_insumos.create({
      data: {
        insumo_id,
        oficina_id,
        tipo_movimiento,
        cantidad,
        lote: lote || null,
        inspeccion_id,
        acta_silo_id,
        seguimiento_id,
        aval_id,
        empleado_id,
        observaciones,
        created_at: new Date()
      }
    });
  }

  /**
   * Obtiene el stock consolidado de un insumo por oficina
   */
  async getStock(tenantPrisma, insumo_id, oficina_id) {
    return await tenantPrisma.insumos_stock.findMany({
      where: {
        insumo_id,
        oficina_id
      }
    });
  }
}

export default new InventoryService();
