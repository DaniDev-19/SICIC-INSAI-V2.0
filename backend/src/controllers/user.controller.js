import { masterPrisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import bitacoraService from '../services/bitacora.service.js';

export const getUsers = async (req, res) => {
  try {
    const users = await masterPrisma.usuarios.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        created_at: true,
        usuario_instancia: {
          include: {
            instancias: { select: { nombre_mostrable: true } },
            roles: { select: { nombre: true } }
          }
        }
      }
    });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await masterPrisma.usuarios.findUnique({
      where: { id: Number(id) },
      include: {
        usuario_instancia: {
          include: {
            instancias: true,
            roles: true
          }
        }
      }
    });
    if (!user) return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });

    const { password_hash, ...userWithoutPassword } = user;
    res.status(200).json({ status: 'success', data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { username, email, password, status } = req.body;
  try {
    const existing = await masterPrisma.usuarios.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existing) return res.status(400).json({ status: 'error', message: 'Email o Username ya en uso' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await masterPrisma.usuarios.create({
      data: { username, email, password_hash, status }
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR',
      modulo: 'Usuarios Master',
      payload_nuevo: { id: user.id, username, email }
    });

    const { password_hash: _, ...userWithoutPassword } = user;
    res.status(201).json({ status: 'success', data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, status } = req.body;
  try {
    const data = { username, email, status };
    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    const updated = await masterPrisma.usuarios.update({
      where: { id: Number(id) },
      data
    });

    bitacoraService.registrar({
      req,
      accion: 'ACTUALIZAR',
      modulo: 'Usuarios Master',
      payload_nuevo: { id: updated.id, username, email }
    });

    const { password_hash: _, ...userWithoutPassword } = updated;
    res.status(200).json({ status: 'success', data: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await masterPrisma.usuarios.delete({ where: { id: Number(id) } });
    res.status(200).json({ status: 'success', message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};


export const assignInstance = async (req, res) => {
  const { id: usuario_id } = req.params;
  const { instancia_id, rol_id, permisos_personalizados } = req.body;
  try {
    const assignment = await masterPrisma.usuario_instancia.upsert({
      where: {
        uq_usuario_instancia: {
          usuario_id: Number(usuario_id),
          instancia_id: Number(instancia_id)
        }
      },
      update: { rol_id, permisos_personalizados },
      create: {
        usuario_id: Number(usuario_id),
        instancia_id: Number(instancia_id),
        rol_id,
        permisos_personalizados
      }
    });

    res.status(200).json({ status: 'success', data: assignment });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const removeInstance = async (req, res) => {
  const { id: usuario_id, instancia_id } = req.params;
  try {
    await masterPrisma.usuario_instancia.delete({
      where: {
        uq_usuario_instancia: {
          usuario_id: Number(usuario_id),
          instancia_id: Number(instancia_id)
        }
      }
    });
    res.status(200).json({ status: 'success', message: 'Acceso a instancia removido' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
