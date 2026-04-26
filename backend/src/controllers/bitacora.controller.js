import bitacoraService from '../services/bitacora.service.js';


export const getLogs = async (req, res) => {
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
};


export const getModulos = async (req, res) => {
  const prisma = req.db;

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
};
