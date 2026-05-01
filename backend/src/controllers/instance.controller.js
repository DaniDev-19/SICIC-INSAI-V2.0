import { masterPrisma } from '../config/prisma.js';
import bitacoraService from '../services/bitacora.service.js';

export const getInstances = async (req, res) => {
  try {
    const instances = await masterPrisma.instancias.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.status(200).json({ status: 'success', data: instances });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getInstanceById = async (req, res) => {
  const { id } = req.params;
  try {
    const instance = await masterPrisma.instancias.findUnique({
      where: { id: Number(id) },
      include: {
        usuario_instancia: {
          include: { usuarios: { select: { username: true, email: true } } }
        }
      }
    });
    if (!instance) return res.status(404).json({ status: 'error', message: 'Instancia no encontrada' });
    res.status(200).json({ status: 'success', data: instance });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createInstance = async (req, res) => {
  const { nombre_mostrable, db_name, status } = req.body;
  try {
    const existing = await masterPrisma.instancias.findUnique({ where: { db_name } });
    if (existing) return res.status(400).json({ status: 'error', message: 'Nombre de DB ya registrado' });

    const instance = await masterPrisma.instancias.create({
      data: { nombre_mostrable, db_name, status }
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Instancias Master',
      payload_nuevo: instance
    });

    res.status(201).json({ status: 'success', data: instance });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateInstance = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await masterPrisma.instancias.update({
      where: { id: Number(id) },
      data
    });

    bitacoraService.registrar({
      req,
      accion: 'ACTUALIZAR',
      modulo: 'Instancias Master',
      payload_nuevo: updated
    });

    res.status(200).json({ status: 'success', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteInstance = async (req, res) => {
  const { id } = req.params;
  try {
    await masterPrisma.instancias.delete({ where: { id: Number(id) } });
    res.status(200).json({ status: 'success', message: 'Instancia eliminada' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
