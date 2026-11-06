import backupService from '../services/backup.service.js';
import bitacoraService from '../services/bitacora.service.js';

export const getRespaldos = async (req, res) => {
  try {
    const respaldos = backupService.listarRespaldos();
    const stats = backupService.obtenerEstadisticas();

    res.status(200).json({
      status: 'success',
      data: {
        respaldos,
        stats,
      },
    });
  } catch (error) {
    console.error('[BackupController] Error al obtener respaldos:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar el listado de respaldos',
    });
  }
};

export const crearRespaldoManual = async (req, res) => {
  try {
    const { target } = req.body; // 'master' | 'operativa' | 'all'
    const targetValid = ['master', 'operativa', 'all'].includes(target) ? target : 'operativa';

    const creados = await backupService.crearRespaldo({
      target: targetValid,
      req,
      tipo: 'manual',
    });

    bitacoraService.registrar({
      req,
      accion: 'CREAR_RESPALDO',
      modulo: 'Configuraciones',
      payload_nuevo: creados,
    });

    res.status(201).json({
      status: 'success',
      message: `Respaldo manual generado con éxito (${creados.length} archivo${creados.length > 1 ? 's' : ''})`,
      data: creados,
    });
  } catch (error) {
    console.error('[BackupController] Error al crear respaldo manual:', error.message);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Error al generar el respaldo de la base de datos',
    });
  }
};

export const descargarRespaldo = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = backupService.getFilePath(filename);

    bitacoraService.registrar({
      req,
      accion: 'DESCARGAR_RESPALDO',
      modulo: 'Configuraciones',
      payload_nuevo: { filename },
    });

    res.download(filePath, filename, (err) => {
      if (err && !res.headersSent) {
        console.error('[BackupController] Error en descarga:', err.message);
        res.status(500).json({ status: 'error', message: 'No se pudo descargar el archivo.' });
      }
    });
  } catch (error) {
    console.error('[BackupController] Error al preparar descarga:', error.message);
    res.status(404).json({
      status: 'error',
      message: error.message || 'Archivo de respaldo no encontrado',
    });
  }
};

export const eliminarRespaldo = async (req, res) => {
  try {
    const { filename } = req.params;
    const result = backupService.eliminarRespaldo(filename);

    bitacoraService.registrar({
      req,
      accion: 'ELIMINAR_RESPALDO',
      modulo: 'Configuraciones',
      payload_previo: { filename },
    });

    res.status(200).json({
      status: 'success',
      message: result.message,
    });
  } catch (error) {
    console.error('[BackupController] Error al eliminar respaldo:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message || 'No se pudo eliminar el archivo de respaldo',
    });
  }
};

export const getConfiguracion = async (req, res) => {
  try {
    const config = backupService.getConfiguracion();
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    console.error('[BackupController] Error al obtener config:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Error al consultar la configuración de respaldos',
    });
  }
};

export const guardarConfiguracion = async (req, res) => {
  try {
    const nuevaConfig = req.body;
    const configGuardada = backupService.guardarConfiguracion(nuevaConfig);

    bitacoraService.registrar({
      req,
      accion: 'ACTUALIZAR_CONFIG_RESPALDO',
      modulo: 'Configuraciones',
      payload_nuevo: configGuardada,
    });

    res.status(200).json({
      status: 'success',
      message: 'Configuración de respaldos automáticos guardada exitosamente',
      data: configGuardada,
    });
  } catch (error) {
    console.error('[BackupController] Error al guardar config:', error.message);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Error al actualizar configuración de respaldos',
    });
  }
};

