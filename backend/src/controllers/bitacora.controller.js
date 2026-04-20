import bitacoraService from '../services/bitacora.service.js';
import { getTenantPrisma } from '../config/prisma.js';


export const getLogs = async (req, res) => {
  try {
    if (!req.user || !req.user.currentInstance) {
      return res.status(400).json({ status: 'error', message: 'No se detectó una instancia activa en la sesión' });
    }

    const { db_name } = req.user.currentInstance;
    const { page, limit, modulo, accion, username } = req.query;

    const result = await bitacoraService.listar(db_name, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
      modulo,
      accion,
      username
    });

    res.status(200).json({
      status: 'success',
      data: result.logs,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in getLogs controller:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los registros de la bitácora'
    });
  }
};


export const getModulos = async (req, res) => {
  try {
    if (!req.user || !req.user.currentInstance) {
      return res.status(400).json({ status: 'error', message: 'ID de instancia no encontrado' });
    }

    const { db_name } = req.user.currentInstance;
    const prisma = getTenantPrisma(db_name);

    const modulos = await prisma.bitacora.groupBy({
      by: ['modulo'],
      _count: {
        modulo: true
      }
    });

    res.status(200).json({
      status: 'success',
      data: modulos.map(m => m.modulo)
    });
  } catch (error) {
    console.error('Error in getModulos controller:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener los módulos de la bitácora',
      error: error.message
    });
  }
};
