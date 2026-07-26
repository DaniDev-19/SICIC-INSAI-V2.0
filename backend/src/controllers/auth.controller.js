import { masterPrisma, getTenantPrisma } from '../config/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken, verifyToken } from '../utils/token.js';
import bitacoraService from '../services/bitacora.service.js';
import { generateMfaSecret, verifyMfaToken, generateBackupCodes } from '../utils/mfa.util.js';

const TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 1000 * 60 * 60 * 8,
};

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
    const { email } = req.query;

    if (email) {
      const normalizedEmail = String(email).trim();
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

      if (!emailValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Email inválido',
        });
      }

      const usuario = await masterPrisma.usuarios.findUnique({
        where: { email: normalizedEmail },
        select: {
          status: true,
          usuario_instancia: {
            where: { instancias: { status: true } },
            select: {
              instancias: {
                select: {
                  id: true,
                  nombre_mostrable: true,
                  db_name: true,
                },
              },
            },
          },
        },
      });

      if (!usuario?.status) {
        return res.status(200).json({ status: 'success', data: [] });
      }

      const instancias = usuario.usuario_instancia.map((ui) => ui.instancias);

      return res.status(200).json({
        status: 'success',
        data: instancias,
      });
    }

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

  const tenantPrisma = getTenantPrisma(ui.instancias.db_name);
  const empleado = await tenantPrisma.empleados.findFirst({
    where: { usuario_global_id: usuario.id },
    select: { id: true }
  });
  const empleado_id = empleado ? empleado.id : null;

  const currentInstanceData = {
    id: ui.instancias.id,
    nombre: ui.instancias.nombre_mostrable,
    db_name: ui.instancias.db_name,
    rol: ui.roles.nombre,
    empleado_id,
    permisos: permisosFinales,
  };

  // Si MFA está activado para este usuario, requerir segundo factor
  if (usuario.mfa_enabled) {
    const mfaPendingToken = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        username: usuario.username,
        currentInstanceData,
        isMfaPending: true,
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '5m' }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Autenticación de dos factores requerida',
      data: {
        mfaRequired: true,
        mfaPendingToken,
      },
    });
  }

  const token = generateToken({
    id: usuario.id,
    email: usuario.email,
    username: usuario.username,
    currentInstance: {
      id: ui.instancias.id,
      db_name: ui.instancias.db_name,
      rol: ui.roles.nombre,
      empleado_id,
      permisos: permisosFinales,
    },
  });

  res.cookie('token', token, TOKEN_COOKIE_OPTIONS);

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
        mfa_enabled: false,
      },
      currentInstance: currentInstanceData,
      token,
    },
  });
};

export const verifyMfaLogin = async (req, res) => {
  try {
    const { mfaPendingToken, code } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(mfaPendingToken, process.env.JWT_SECRET || 'secret_key');
    } catch {
      return res.status(401).json({
        status: 'error',
        message: 'La sesión temporal de MFA ha expirado o es inválida. Inicie sesión nuevamente.',
      });
    }

    if (!decoded.isMfaPending) {
      return res.status(400).json({
        status: 'error',
        message: 'Token de MFA no válido',
      });
    }

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { id: decoded.id },
    });

    if (!usuario || !usuario.status || !usuario.mfa_enabled) {
      return res.status(400).json({
        status: 'error',
        message: 'El usuario no tiene MFA activo o está desactivado',
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    let isCodeValid = await verifyMfaToken(cleanCode, usuario.mfa_secret);
    let usedBackupCode = false;

    // Si no es un token TOTP válido, verificar si es un código de respaldo
    if (!isCodeValid && Array.isArray(usuario.mfa_backup_codes)) {
      const backupCodes = usuario.mfa_backup_codes;
      const matchIndex = backupCodes.findIndex((bCode) => String(bCode).toUpperCase() === cleanCode);

      if (matchIndex !== -1) {
        isCodeValid = true;
        usedBackupCode = true;
        // Eliminar código de respaldo usado
        backupCodes.splice(matchIndex, 1);
        await masterPrisma.usuarios.update({
          where: { id: usuario.id },
          data: { mfa_backup_codes: backupCodes, updated_at: new Date() },
        });
      }
    }

    if (!isCodeValid) {
      return res.status(400).json({
        status: 'error',
        message: 'El código MFA o de respaldo es incorrecto',
      });
    }

    const token = generateToken({
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
      currentInstance: {
        id: decoded.currentInstanceData.id,
        db_name: decoded.currentInstanceData.db_name,
        rol: decoded.currentInstanceData.rol,
        empleado_id: decoded.currentInstanceData.empleado_id,
        permisos: decoded.currentInstanceData.permisos,
      },
    });

    res.cookie('token', token, TOKEN_COOKIE_OPTIONS);

    bitacoraService.registrar({
      manualUser: {
        id: usuario.id,
        username: usuario.username,
        db_name: decoded.currentInstanceData.db_name,
      },
      accion: usedBackupCode ? 'INICIO_SESION_MFA_BACKUP' : 'INICIO_SESION_MFA',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Autenticación en dos pasos exitosa',
      data: {
        user: {
          id: usuario.id,
          username: usuario.username,
          email: usuario.email,
          mfa_enabled: true,
        },
        currentInstance: decoded.currentInstanceData,
        token,
      },
    });
  } catch (error) {
    console.error('Error en verifyMfaLogin:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al verificar el código MFA',
    });
  }
};

export const getMe = async (req, res) => {
  const { currentInstance } = req.user;

  const usuario = await masterPrisma.usuarios.findUnique({
    where: { id: req.user.id },
    select: { id: true, username: true, email: true, status: true, mfa_enabled: true },
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
        mfa_enabled: Boolean(usuario.mfa_enabled),
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

  res.clearCookie('token', TOKEN_COOKIE_OPTIONS);
  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada exitosamente',
  });
};

/**
 * @route POST /api/auth/request-password-reset
 * @description Solicitar token o código de recuperación de contraseña
 * @access Public
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email, instanceId } = req.body;

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { email },
      select: { id: true, username: true, email: true, status: true },
    });

    if (!usuario || !usuario.status) {
      return res.status(200).json({
        status: 'success',
        message: 'Si el correo electrónico está registrado y activo, recibirá las instrucciones de recuperación.',
      });
    }

    const instancia = await masterPrisma.instancias.findUnique({
      where: { id: Number(instanceId) },
    });

    if (!instancia || !instancia.status) {
      return res.status(400).json({
        status: 'error',
        message: 'Instancia o Estado seleccionado inválido o inactivo',
      });
    }

    // Generar un código de recuperación numérico de 6 dígitos
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraAt = new Date(Date.now() + 30 * 60 * 1000); // Expiración en 30 minutos

    const tenantPrisma = getTenantPrisma(instancia.db_name);

    // Inactivar tokens no usados previamente
    await tenantPrisma.recuperacion_pass.updateMany({
      where: { usuario_global_id: usuario.id, usado: false },
      data: { usado: true },
    });

    // Guardar el registro en recuperacion_pass
    await tenantPrisma.recuperacion_pass.create({
      data: {
        usuario_global_id: usuario.id,
        token,
        expira_at: expiraAt,
        usado: false,
      },
    });

    bitacoraService.registrar({
      manualUser: {
        id: usuario.id,
        username: usuario.username,
        db_name: instancia.db_name,
      },
      accion: 'SOLICITUD_RECUPERACION_PASSWORD',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Código de recuperación generado exitosamente.',
      data: {
        token: process.env.NODE_ENV !== 'production' ? token : undefined,
        expiresInMinutes: 30,
      },
    });
  } catch (error) {
    console.error('Error en requestPasswordReset:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al procesar la solicitud de recuperación de contraseña',
    });
  }
};

/**
 * @route POST /api/auth/reset-password
 * @description Restablecer la contraseña mediante el token/código de recuperación
 * @access Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, instanceId, token, newPassword } = req.body;

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { email },
      select: { id: true, username: true, email: true, status: true },
    });

    if (!usuario || !usuario.status) {
      return res.status(400).json({
        status: 'error',
        message: 'Datos de usuario o código inválidos',
      });
    }

    const instancia = await masterPrisma.instancias.findUnique({
      where: { id: Number(instanceId) },
    });

    if (!instancia) {
      return res.status(400).json({
        status: 'error',
        message: 'Instancia o sede no encontrada',
      });
    }

    const tenantPrisma = getTenantPrisma(instancia.db_name);

    const record = await tenantPrisma.recuperacion_pass.findFirst({
      where: {
        usuario_global_id: usuario.id,
        token: String(token).trim(),
        usado: false,
        expira_at: { gte: new Date() },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!record) {
      return res.status(400).json({
        status: 'error',
        message: 'El código de recuperación es inválido o ha expirado',
      });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña global en máster
    await masterPrisma.usuarios.update({
      where: { id: usuario.id },
      data: {
        password_hash,
        updated_at: new Date(),
      },
    });

    // Marcar token como usado
    await tenantPrisma.recuperacion_pass.update({
      where: { id: record.id },
      data: { usado: true },
    });

    bitacoraService.registrar({
      manualUser: {
        id: usuario.id,
        username: usuario.username,
        db_name: instancia.db_name,
      },
      accion: 'RESTABLECER_PASSWORD_EXITOSO',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Su contraseña ha sido restablecida exitosamente.',
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al restablecer la contraseña',
    });
  }
};

/**
 * @route PUT /api/auth/profile
 * @description Actualizar perfil del usuario autenticado
 * @access Private
 */
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, email } = req.body;

    const existingUser = await masterPrisma.usuarios.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    // Verificar que el nuevo email/username no pertenezca a otro usuario
    const duplicate = await masterPrisma.usuarios.findFirst({
      where: {
        id: { not: userId },
        OR: [{ email }, { username }],
      },
    });

    if (duplicate) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico o nombre de usuario ya está en uso por otro usuario.',
      });
    }

    const updatedUser = await masterPrisma.usuarios.update({
      where: { id: userId },
      data: {
        username,
        email,
        updated_at: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });

    bitacoraService.registrar({
      req,
      accion: 'ACTUALIZAR_PERFIL',
      modulo: 'Seguridad',
      payload_nuevo: { username, email },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado exitosamente',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error en updateMyProfile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al actualizar el perfil',
    });
  }
};

/**
 * @route POST /api/auth/change-password
 * @description Cambiar contraseña del usuario autenticado
 * @access Private
 */
export const changeMyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, usuario.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña actual ingresada es incorrecta',
      });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);

    await masterPrisma.usuarios.update({
      where: { id: userId },
      data: {
        password_hash,
        updated_at: new Date(),
      },
    });

    bitacoraService.registrar({
      req,
      accion: 'CAMBIO_PASSWORD',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error en changeMyPassword:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error interno al cambiar la contraseña',
    });
  }
};

/**
 * @route POST /api/auth/mfa/setup
 * @description Genera secreto temporal y código QR para activar MFA
 * @access Private
 */
export const setupMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const usuario = await masterPrisma.usuarios.findUnique({
      where: { id: userId },
      select: { username: true, email: true },
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    const mfaData = await generateMfaSecret(usuario.username);

    return res.status(200).json({
      status: 'success',
      data: mfaData,
    });
  } catch (error) {
    console.error('Error en setupMfa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al generar el secreto MFA',
    });
  }
};

/**
 * @route POST /api/auth/mfa/enable
 * @description Valida el primer token TOTP y habilita el MFA para la cuenta
 * @access Private
 */
export const enableMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const { secret, token } = req.body;

    const isValid = await verifyMfaToken(token, secret);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'El código de 6 dígitos ingresado es incorrecto o ha expirado.',
      });
    }

    const backupCodes = generateBackupCodes(8);

    await masterPrisma.usuarios.update({
      where: { id: userId },
      data: {
        mfa_secret: secret,
        mfa_enabled: true,
        mfa_backup_codes: backupCodes,
        updated_at: new Date(),
      },
    });

    bitacoraService.registrar({
      req,
      accion: 'MFA_HABILITADO',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Autenticación de Dos Factores (MFA) activada con éxito.',
      data: {
        backupCodes,
      },
    });
  } catch (error) {
    console.error('Error en enableMfa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al activar MFA',
    });
  }
};

/**
 * @route POST /api/auth/mfa/disable
 * @description Desactiva la autenticación de dos factores
 * @access Private
 */
export const disableMfa = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, token } = req.body;

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { id: userId },
    });

    if (!usuario) {
      return res.status(404).json({
        status: 'error',
        message: 'Usuario no encontrado',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, usuario.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña actual ingresada es incorrecta',
      });
    }

    const cleanToken = String(token).trim().toUpperCase();
    let isCodeValid = await verifyMfaToken(cleanToken, usuario.mfa_secret);

    if (!isCodeValid && Array.isArray(usuario.mfa_backup_codes)) {
      isCodeValid = usuario.mfa_backup_codes.some(
        (bCode) => String(bCode).toUpperCase() === cleanToken
      );
    }

    if (!isCodeValid) {
      return res.status(400).json({
        status: 'error',
        message: 'El código MFA o de respaldo ingresado es incorrecto',
      });
    }

    await masterPrisma.usuarios.update({
      where: { id: userId },
      data: {
        mfa_secret: null,
        mfa_enabled: false,
        mfa_backup_codes: [],
        updated_at: new Date(),
      },
    });

    bitacoraService.registrar({
      req,
      accion: 'MFA_DESHABILITADO',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Autenticación de Dos Factores (MFA) desactivada exitosamente.',
    });
  } catch (error) {
    console.error('Error en disableMfa:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al desactivar MFA',
    });
  }
};

/**
 * @route POST /api/auth/mfa/regenerate-backup-codes
 * @description Regenera los 8 códigos de respaldo de emergencia para el usuario
 * @access Private
 */
export const regenerateBackupCodes = async (req, res) => {
  try {
    const userId = req.user.id;
    const { token } = req.body;

    const usuario = await masterPrisma.usuarios.findUnique({
      where: { id: userId },
    });

    if (!usuario || !usuario.mfa_enabled || !usuario.mfa_secret) {
      return res.status(400).json({
        status: 'error',
        message: 'El MFA no está activo en esta cuenta.',
      });
    }

    const isValid = await verifyMfaToken(token, usuario.mfa_secret);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'El código TOTP ingresado es incorrecto.',
      });
    }

    const newBackupCodes = generateBackupCodes(8);

    await masterPrisma.usuarios.update({
      where: { id: userId },
      data: {
        mfa_backup_codes: newBackupCodes,
        updated_at: new Date(),
      },
    });

    bitacoraService.registrar({
      req,
      accion: 'MFA_BACKUP_CODES_REGENERADOS',
      modulo: 'Seguridad',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Nuevos códigos de respaldo generados exitosamente.',
      data: {
        backupCodes: newBackupCodes,
      },
    });
  } catch (error) {
    console.error('Error en regenerateBackupCodes:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Error al regenerar códigos de respaldo',
    });
  }
};



