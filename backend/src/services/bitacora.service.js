import { getTenantPrisma } from '../config/prisma.js';


class BitacoraService {
  /**
   * @param {Object} params
   * @param {Object} params.req 
   * @param {string} params.accion 
   * @param {string} params.modulo 
   * @param {Object} [params.payload_previo] 
   * @param {Object} [params.payload_nuevo] 
   * @param {Object} [params.manualUser] 
   */

  async registrar({ req, accion, modulo, payload_previo = null, payload_nuevo = null, manualUser = null }) {
    try {
      let usuario_global_id, username_log, db_name;

      if (req?.user) {
        usuario_global_id = req.user.id;
        username_log = req.user.username;
        db_name = req.user.currentInstance?.db_name;
      } else if (manualUser) {
        usuario_global_id = manualUser.id;
        username_log = manualUser.username;
        db_name = manualUser.db_name;
      }

      if (!db_name) {
        console.warn('Bitacora: No se puede registrar acción sin db_name');
        return;
      }

      const prisma = getTenantPrisma(db_name);

      const empleado = await prisma.empleados.findFirst({
        where: { usuario_global_id: Number(usuario_global_id) },
        select: { id: true }
      });

      prisma.bitacora.create({
        data: {
          accion,
          modulo,
          usuario_global_id: Number(usuario_global_id),
          empleado_id: empleado?.id || null,
          username_log,
          payload_previo: payload_previo ? JSON.parse(JSON.stringify(payload_previo)) : null,
          payload_nuevo: payload_nuevo ? JSON.parse(JSON.stringify(payload_nuevo)) : null,
        }
      }).catch(err => console.error('Error al guardar en bitácora:', err));

    } catch (error) {
      console.error('Error crítico en BitacoraService:', error);
    }
  }

  async listar(dbName, { page = 1, limit = 20, modulo, accion, username }) {
    const prisma = getTenantPrisma(dbName);
    const skip = (page - 1) * limit;

    const where = {};
    if (modulo) where.modulo = modulo;
    if (accion) where.accion = accion;
    if (username) where.username_log = { contains: username, mode: 'insensitive' };

    const [total, logs] = await Promise.all([
      prisma.bitacora.count({ where }),
      prisma.bitacora.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip,
        take: Number(limit),
        include: {
          empleados: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        }
      })
    ]);

    return {
      logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit)
      }
    };
  }
}

export default new BitacoraService();
