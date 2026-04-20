import { masterPrisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/token.js';
import bitacoraService from '../services/bitacora.service.js';

/**
 * @param {Object} rolPermisos
 * @param {Object|null} customPermisos
 * @returns {Object}
 */
const mergePermisos = (rolPermisos, customPermisos) => {
  const base = rolPermisos || {};
  const custom = customPermisos || {};

  const merged = { ...base };

  for (const [screen, actions] of Object.entries(custom)) {
    if (!Array.isArray(actions)) continue;
    if (Array.isArray(merged[screen])) {
      merged[screen] = [...new Set([...merged[screen], ...actions])];
    } else {
      merged[screen] = actions;
    }
  }

  return merged;
};

export const getInstances = async (req, res) => {
  try {
    const instancias = await masterPrisma.instancias.findMany({
      where: { status: true },
      select: {
        id: true,
        nombre_mostrable: true,
        db_name: true,
      },
    });

    res.status(200).json({
      status: 'success',
      data: instancias,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error al obtener las instancias del sistema',
    });
  }
};

export const login = async (req, res) => {
  const { email, password, instanceId } = req.body;

  if (!instanceId) {
    return res.status(400).json({
      status: 'error',
      message: 'Debe seleccionar una instancia para continuar',
    });
  }

  const usuario = await masterPrisma.usuarios.findUnique({
    where: { email },
    include: {
      usuario_instancia: {
        where: { instancia_id: Number(instanceId) },
        include: {
          instancias: true,
          roles: true,
        },
      },
    },
  });

  if (!usuario || !usuario.status) {
    return res.status(401).json({
      status: 'error',
      message: 'Credenciales inválidas o cuenta desactivada',
    });
  }

  if (usuario.usuario_instancia.length === 0) {
    return res.status(403).json({
      status: 'error',
      message: 'No tienes permisos para acceder a esta instancia',
    });
  }

  const ui = usuario.usuario_instancia[0];

  const validPassword = await bcrypt.compare(password, usuario.password_hash);
  if (!validPassword) {
    return res.status(401).json({
      status: 'error',
      message: 'Credenciales inválidas',
    });
  }

  const permisosFinales = mergePermisos(ui.roles.permisos, ui.permisos_personalizados);

  const token = generateToken({
    id: usuario.id,
    email: usuario.email,
    username: usuario.username,
    currentInstance: {
      id: ui.instancias.id,
      db_name: ui.instancias.db_name,
      rol: ui.roles.nombre,
      permisos: permisosFinales,
    },
  });

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
  });

  bitacoraService.registrar({
    manualUser: {
      id: usuario.id,
      username: usuario.username,
      db_name: ui.instancias.db_name
    },
    accion: 'INICIO_SESION',
    modulo: 'Seguridad'
  });

  res.status(200).json({
    status: 'success',
    message: 'Login exitoso',
    data: {
      user: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
      },
      currentInstance: {
        id: ui.instancias.id,
        nombre: ui.instancias.nombre_mostrable,
        db_name: ui.instancias.db_name,
        rol: ui.roles.nombre,
        permisos: permisosFinales,
      },
      token,
    },
  });
};

export const getMe = async (req, res) => {
  const { currentInstance } = req.user;

  const usuario = await masterPrisma.usuarios.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, email: true, status: true },
  });

  if (!usuario || !usuario.status) {
    return res.status(401).json({
      status: 'error',
      message: 'Usuario no encontrado o inactivo',
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
      },
      currentInstance,
    },
  });
};

export const logout = (req, res) => {
  // Registrar cierre de sesión
  if (req.user) {
    bitacoraService.registrar({
      req,
      accion: 'CIERRE_SESION',
      modulo: 'Seguridad'
    });
  }

  res.clearCookie('token');
  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada exitosamente',
  });
};
