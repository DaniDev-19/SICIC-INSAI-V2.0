import mailService from '../services/mail.service.js';
import bitacoraService from '../services/bitacora.service.js';
import { masterPrisma } from '../config/prisma.js';

export const PLANTILLAS_CORREO = [
  {
    id: 'convocatoria',
    nombre: 'Convocatoria a Reunión / Capacitación',
    categoria: 'CONVOCATORIA',
    icono: 'Users',
    asunto: '[CONVOCATORIA] Reunión de Trabajo e Instrucciones de Campo - INSAI',
    descripcion: 'Plantilla para convocar al personal a reuniones presenciales, mesas de trabajo o talleres de capacitación.',
    cuerpo: `Estimado(a) <strong>{nombre}</strong>,<br/><br/>
Por medio del presente se le convoca formalmente a participar en la próxima sesión de trabajo del <strong>INSAI</strong>.<br/><br/>
<strong>Detalles de la Convocatoria:</strong><br/>
• <strong>Cargo:</strong> {cargo}<br/>
• <strong>Oficina / Sede:</strong> {oficina}<br/>
• <strong>Fecha:</strong> {fecha}<br/>
• <strong>Objetivo:</strong> Evaluación de metas operativas y sincronización de inspecciones de campo.<br/><br/>
Agradecemos su puntual asistencia y compromiso con el desarrollo agroalimentario del país.`
  },
  {
    id: 'comunicado_general',
    nombre: 'Comunicado General / Directiva Institucional',
    categoria: 'COMUNICADO',
    icono: 'Megaphone',
    asunto: '[COMUNICADO INSTITUCIONAL] Información Importante para el Personal - INSAI',
    descripcion: 'Avisos oficiales, normativas internas, circulares o boletines para todo el equipo.',
    cuerpo: `Estimado(a) funcionario(a) <strong>{nombre}</strong>,<br/><br/>
Le saludamos cordialmente desde la Dirección General del <strong>INSAI</strong>. Hacemos de su conocimiento la siguiente información de carácter institucional:<br/><br/>
<em>Se recuerda a todo el personal técnico y administrativo mantener al día los registros de bitácora, solicitudes e inspecciones asignadas en el sistema SICIZ-INSAI V2.0.</em><br/><br/>
Para cualquier duda o requerimiento técnico, por favor comunicarse con la coordinación de su oficina (<strong>{oficina}</strong>).`
  },
  {
    id: 'recordatorio_actividades',
    nombre: 'Recordatorio de Inspecciones y Reportes Pendientes',
    categoria: 'RECORDATORIO',
    icono: 'Clock',
    asunto: '[RECORDATORIO] Inspecciones y Reportes Pendientes en Sistema',
    descripcion: 'Notificación para recordar la entrega de actas, informes epidemiológicos e inspecciones programadas.',
    cuerpo: `Estimado(a) <strong>{nombre}</strong> ({cargo}),<br/><br/>
Le recordamos amablemente revisar sus tareas y visitas programadas en la plataforma <strong>SICIZ-INSAI</strong>.<br/><br/>
Es fundamental cargar a tiempo las actas de inspección, evaluaciones de silos y seguimiento de avales sanitarios para mantener la continuidad del servicio institucional.<br/><br/>
Fecha del recordatorio: <strong>{fecha}</strong>.`
  },
  {
    id: 'alerta_sanitaria',
    nombre: 'Alerta Sanitaria / Vigilancia Epidemiológica (Urgente)',
    categoria: 'ALERTA',
    icono: 'AlertTriangle',
    asunto: '[ALERTA URGENTE] Protocolo Sanitario y Medidas de Vigilancia Epidemiológica',
    descripcion: 'Plantilla de máxima prioridad para alertas fito y zoosanitarias en campo.',
    cuerpo: `<strong>ATENCIÓN PRIORITARIA - FUNCIONARIO {nombre}</strong><br/><br/>
Se emite la presente <strong>ALERTA DE VIGILANCIA SANITARIA</strong> para ser ejecutada por el equipo de la oficina <strong>{oficina}</strong>.<br/><br/>
Se insta a activar los protocolos inmediatos de inspección, contención y reporte oportuno ante cualquier evento biológico o brote reportado en los predios de su jurisdicción.<br/><br/>
Manténgase en contacto permanente con el comando central.`
  },
  {
    id: 'reconocimiento',
    nombre: 'Reconocimiento / Felicitación Laboral',
    categoria: 'RECONOCIMIENTO',
    icono: 'Award',
    asunto: '[RECONOCIMIENTO] Felicitaciones por tu Desempeño Profesional',
    descripcion: 'Plantilla para reconocer la labor, compromiso y trayectoria de los trabajadores.',
    cuerpo: `Estimado(a) <strong>{nombre}</strong>,<br/><br/>
Queremos expresar nuestro sincero reconocimiento a su valioso trabajo como <strong>{cargo}</strong> en la sede <strong>{oficina}</strong>.<br/><br/>
Su dedicación y ética profesional son pilar fundamental para salvaguardar la soberanía agroalimentaria y la excelencia del <strong>INSAI</strong>.<br/><br/>
¡Gracias por tu constante compromiso!`
  }
];

function buildHtmlWrapper({ asunto, mensaje, motivo }) {
  const isAlerta = motivo === 'ALERTA';
  const headerBg = isAlerta ? '#dc2626' : '#059669';
  const headerSub = isAlerta ? 'ALERTA DE SEGURIDAD SANITARIA' : 'INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 20px; color: #1f2937; }
    .card { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
    .header { background: ${headerBg}; padding: 28px 32px; color: #ffffff; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; tracking: 0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 11px; opacity: 0.9; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; }
    .content { padding: 32px; font-size: 15px; line-height: 1.7; color: #374151; }
    .footer { background: #f9fafb; padding: 20px 32px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .badge { display: inline-block; padding: 4px 12px; background-color: rgba(255,255,255,0.2); border-radius: 9999px; font-size: 11px; font-weight: bold; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div class="badge">SICIZ-INSAI</div>
      <h1>${asunto}</h1>
      <p>${headerSub}</p>
    </div>
    <div class="content">
      ${mensaje}
    </div>
    <div class="footer">
      <p style="margin:0 0 4px 0; font-weight: bold;">República Bolivariana de Venezuela - INSAI</p>
      <p style="margin:0;">Sistema de Información para el Control de Inspecciones de Campo</p>
    </div>
  </div>
</body>
</html>
  `;
}

export const getPlantillas = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: PLANTILLAS_CORREO
  });
};

export const sendComunicado = async (req, res) => {
  const tenantPrisma = req.db;
  const { empleado_ids, asunto, mensaje, motivo = 'MANUAL' } = req.body;

  if (!asunto || !asunto.trim()) {
    return res.status(400).json({ status: 'error', message: 'El asunto del correo es obligatorio.' });
  }

  if (!mensaje || !mensaje.trim()) {
    return res.status(400).json({ status: 'error', message: 'El cuerpo del correo es obligatorio.' });
  }

  let empleados = [];

  if (empleado_ids === 'ALL' || (Array.isArray(empleado_ids) && empleado_ids.length === 0)) {
    empleados = await tenantPrisma.empleados.findMany({
      include: { cargos: true, oficinas: true }
    });
  } else if (Array.isArray(empleado_ids) && empleado_ids.length > 0) {
    empleados = await tenantPrisma.empleados.findMany({
      where: { id: { in: empleado_ids.map(Number) } },
      include: { cargos: true, oficinas: true }
    });
  } else {
    return res.status(400).json({ status: 'error', message: 'Debe seleccionar al menos un empleado o enviar "ALL".' });
  }

  if (empleados.length === 0) {
    return res.status(404).json({ status: 'error', message: 'No se encontraron empleados para enviar el correo.' });
  }

  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
  const fromAddress = process.env.SMTP_FROM || '"SICIZ-INSAI Comunicados" <baddevprograming@gmail.com>';

  const fechaActual = new Date().toLocaleDateString('es-VE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const envios = [];
  const fallidos = [];

  for (const emp of empleados) {
    let emailDestino = emp.email;

    if (!emailDestino || !emailDestino.includes('@')) {
      if (emp.usuario_global_id) {
        try {
          const uGlobal = await masterPrisma.usuarios.findUnique({
            where: { id: emp.usuario_global_id },
            select: { email: true }
          });
          if (uGlobal?.email && uGlobal.email.includes('@')) {
            emailDestino = uGlobal.email;
          }
        } catch { /* ignore */ }
      }
    }

    if (!emailDestino || !emailDestino.includes('@')) {
      fallidos.push({
        empleado_id: emp.id,
        nombre: `${emp.nombre} ${emp.apellido}`,
        motivo: 'Sin correo electrónico registrado'
      });
      continue;
    }

    // Reemplazo de variables dinámicas
    const nombreCompleto = `${emp.nombre} ${emp.apellido}`.trim();
    const cargoNombre = emp.cargos?.nombre || 'Funcionario';
    const oficinaNombre = emp.oficinas?.nombre || 'Oficina Central';

    let mensajePersonalizado = mensaje
      .replace(/\{nombre\}/g, nombreCompleto)
      .replace(/\{cedula\}/g, emp.cedula || 'N/A')
      .replace(/\{cargo\}/g, cargoNombre)
      .replace(/\{oficina\}/g, oficinaNombre)
      .replace(/\{fecha\}/g, fechaActual);

    let asuntoPersonalizado = asunto
      .replace(/\{nombre\}/g, nombreCompleto)
      .replace(/\{cargo\}/g, cargoNombre)
      .replace(/\{oficina\}/g, oficinaNombre);

    const htmlFinal = buildHtmlWrapper({
      asunto: asuntoPersonalizado,
      mensaje: mensajePersonalizado,
      motivo
    });

    try {
      if (!pass) {
        envios.push({
          empleado_id: emp.id,
          nombre: nombreCompleto,
          email: emailDestino,
          simulacion: true
        });
      } else {
        await mailService.transporter.sendMail({
          from: fromAddress,
          to: emailDestino,
          subject: asuntoPersonalizado,
          html: htmlFinal
        });
        envios.push({
          empleado_id: emp.id,
          nombre: nombreCompleto,
          email: emailDestino,
          exito: true
        });
      }
    } catch (err) {
      console.error(`Error enviando correo a ${emailDestino}:`, err.message);
      fallidos.push({
        empleado_id: emp.id,
        nombre: nombreCompleto,
        email: emailDestino,
        motivo: err.message
      });
    }
  }

  bitacoraService.registrar({
    req,
    accion: 'ENVIAR_CORREO_MASIVO',
    modulo: 'Comunicados por Correo',
    payload_nuevo: {
      motivo,
      asunto,
      total_empleados: empleados.length,
      enviados_count: envios.length,
      fallidos_count: fallidos.length,
      fallidos
    }
  });

  res.status(200).json({
    status: 'success',
    message: `Envío completado: ${envios.length} exitosos, ${fallidos.length} omitidos.`,
    data: {
      total: empleados.length,
      enviados: envios.length,
      fallidos: fallidos.length,
      detallesEnvios: envios,
      detallesFallidos: fallidos,
      simulado: !pass
    }
  });
};

/**
 * Envia el feedback y valoracion del usuario al correo institucional
 */
export const sendFeedbackEmail = async (req, res) => {
  try {
    const { estrellas = 5, categoria = 'Valoración General', comentario = '', nombre = '', email = '', sede = '' } = req.body;

    const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '').trim();
    const fromAddress = process.env.SMTP_FROM || '"SICIZ-INSAI Feedback" <baddevprograming@gmail.com>';
    const targetEmail = 'baddevprograming@gmail.com';

    const fechaActual = new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' });
    const usuarioNombre = nombre || req.user?.nombre || req.user?.username || 'Usuario Institucional';
    const usuarioEmail = email || req.user?.email || 'No especificado';
    const userSede = sede || req.tenant?.nombre || req.user?.instance || 'Sede INSAI';

    const starsHtml = `${estrellas} de 5 Estrellas (${estrellas}/5)`;
    const subject = `[VALORACION SICIZ-INSAI] ${categoria} - ${estrellas}/5 Estrellas (${usuarioNombre})`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background: #047857; color: #ffffff; padding: 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">INSAI - Sistema SICIZ V2.0</h2>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Nueva Valoración y Opinión Recibida desde el Centro de Ayuda</p>
        </div>
        <div style="padding: 24px; color: #1f2937;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; text-align: center;">
            <div style="font-size: 24px; color: #eab308; margin-bottom: 4px;">${starsHtml}</div>
            <div style="font-size: 14px; font-weight: bold; color: #166534;">Calificación: ${estrellas} de 5 Estrellas</div>
            <div style="font-size: 12px; color: #15803d; margin-top: 2px;">Categoría: <strong>${categoria}</strong></div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; width: 140px;"><strong>Usuario / Remitente:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${usuarioNombre}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;"><strong>Correo Electrónico:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${usuarioEmail}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;"><strong>Sede / Dependencia:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${userSede}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280;"><strong>Fecha y Hora:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f3f4f6; color: #111827;">${fechaActual}</td>
            </tr>
          </table>

          <div style="margin-top: 16px;">
            <div style="font-size: 13px; font-weight: bold; color: #374151; margin-bottom: 8px;">Mensaje / Opinión:</div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #111827; white-space: pre-wrap;">${comentario || 'Sin comentarios adicionales.'}</div>
          </div>
        </div>
        <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 14px; text-align: center; font-size: 11px; color: #6b7280;">
          SICIZ-INSAI V2.0 - Notificación Automática de Feedback Institucional
        </div>
      </div>
    `;

    if (pass) {
      mailService.initTransporter();
      await mailService.transporter.sendMail({
        from: fromAddress,
        to: targetEmail,
        subject,
        html: htmlBody
      });
      console.log(`[Feedback] Correo enviado exitosamente a ${targetEmail}`);
    } else {
      console.log(`[Feedback - Simulado] Correo preparado para ${targetEmail}: ${subject}`);
    }

    try {
      bitacoraService.registrar({
        req,
        accion: 'REGISTRO_FEEDBACK_SISTEMA',
        modulo: 'Centro de Ayuda',
        payload_nuevo: { estrellas, categoria, comentario, usuario: usuarioNombre }
      });
    } catch (e) {
      // Ignorar error no bloqueante de bitacora
    }

    return res.status(200).json({
      status: 'success',
      message: 'Valoración recibida exitosamente. Muchas gracias por su retroalimentación.'
    });
  } catch (error) {
    console.error('Error en sendFeedbackEmail:', error);
    return res.status(500).json({
      status: 'error',
      message: 'No fue posible registrar la valoración vía correo en este momento.'
    });
  }
};
