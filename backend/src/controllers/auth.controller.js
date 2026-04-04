import { masterPrisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/token.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await masterPrisma.usuarios.findUnique({
    where: { email },
    include: {
      usuario_instancia: {
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

  const validPassword = await bcrypt.compare(password, usuario.password_hash);
  if (!validPassword) {
    return res.status(401).json({
      status: 'error',
      message: 'Credenciales inválidas',
    });
  }

  const instancias = usuario.usuario_instancia.map((ui) => ({
    id: ui.instancias.id,
    nombre: ui.instancias.nombre_mostrable,
    db_name: ui.instancias.db_name,
    rol: ui.roles.nombre,
    permisos: ui.roles.permisos,
  }));

  const token = generateToken({
    id: usuario.id,
    email: usuario.email,
    username: usuario.username,
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
      token,
      instancias,
    },
  });
};

export const logout = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada exitosamente',
  });
};
