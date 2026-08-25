import notificationService from './notification.service.js';

class InventoryService {
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
        console.warn(`[INVENTARIO] Consumo registrado con stock bajo/inexistente. Insumo ID: ${insumo_id}, Oficina ID: ${oficina_id}, Disponible: ${currentStock?.stock_actual || 0}`);
      }
    }

    if (currentStock) {
      const updated = await tx.insumos_stock.update({
        where: { id: currentStock.id },
        data: {
          stock_actual: { increment: cambioStock },
          fecha_vencimiento: fecha_vencimiento || undefined,
          updated_at: new Date()
        }
      });

      if (Number(updated.stock_actual) <= Number(updated.stock_minimo)) {
        console.warn(`[ALERTA INVENTARIO] Stock bajo para insumo ${insumo_id} en oficina ${oficina_id}. Actual: ${updated.stock_actual}`);
        tx.insumos.findUnique({ where: { id: insumo_id }, select: { nombre: true, codigo: true } })
          .then((insumoInfo) => {
            const nombreInsumo = insumoInfo?.nombre ? `"${insumoInfo.nombre}"` : `ID ${insumo_id}`;
            return notificationService.notificarPorOficina({
              db: tx,
              oficina_id,
              mensaje: `⚠️ Alerta de Inventario: El insumo ${nombreInsumo} está en nivel crítico o mínimo (Stock actual: ${updated.stock_actual}).`,
              tipo: 'STOCK',
            });
          })
          .catch((err) => console.error('[InventoryService] Error enviando alerta de stock:', err.message));
      }
    } else {
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

  async revertirMovimientosDeProceso({ tx, proceso_id, tipo_proceso, empleado_id }) {
    const where = {};
    if (tipo_proceso === 'aval') where.aval_id = proceso_id;
    if (tipo_proceso === 'inspeccion') where.inspeccion_id = proceso_id;
    if (tipo_proceso === 'acta_silo') where.acta_silo_id = proceso_id;
    if (tipo_proceso === 'seguimiento') where.seguimiento_id = proceso_id;

    const movimientos = await tx.movimientos_insumos.findMany({ where });

    for (const mov of movimientos) {
      const esSalidaOriginal = ['SALIDA', 'AJUSTE_MENOS', 'CONSUMO'].includes(mov.tipo_movimiento);
      const tipoInverso = esSalidaOriginal ? 'ENTRADA' : 'SALIDA';
      const factor = esSalidaOriginal ? 1 : -1;


      await tx.insumos_stock.update({
        where: {
          insumo_id_oficina_id_lote: {
            insumo_id: mov.insumo_id,
            oficina_id: mov.oficina_id,
            lote: mov.lote
          }
        },
        data: {
          stock_actual: { increment: Number(mov.cantidad) * factor },
          updated_at: new Date()
        }
      });

      await tx.movimientos_insumos.create({
        data: {
          insumo_id: mov.insumo_id,
          oficina_id: mov.oficina_id,
          tipo_movimiento: tipoInverso,
          cantidad: mov.cantidad,
          lote: mov.lote,
          empleado_id,
          observaciones: `REVERSIÓN AUTOMÁTICA por eliminación de ${tipo_proceso} ID ${proceso_id}. Ref Mov: ${mov.id}`
        }
      });
    }


  }

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
