/**
 * Genera el marcado HTML maquetado profesionalmente para la ficha de notificación de planificación de inspecciones.
 * 
 * @param {Object} params
 * @param {'CREACION' | 'ACTUALIZACION'} params.tipoEvento
 * @param {Object} params.planificacion
 * @param {Array<Object>} params.inspectores
 * @returns {string} HTML estilizado institucional responsive
 */
export const getPlanificacionEmailHtml = ({ tipoEvento = 'CREACION', planificacion, inspectores = [] }) => {
  const isCreacion = tipoEvento === 'CREACION';
  const headerColor = isCreacion ? '#059669' : '#0284c7';
  const statusTitle = isCreacion ? 'NUEVA ASIGNACIÓN DE INSPECCIÓN' : 'ACTUALIZACIÓN DE INSPECCIÓN PLANIFICADA';
  const badgeBg = isCreacion ? '#dcfce7' : '#e0f2fe';
  const badgeText = isCreacion ? '#15803d' : '#0369a1';

  const fechaInspeccion = planificacion.fecha_programada || planificacion.fecha_inspeccion;
  const fechaFormateada = fechaInspeccion
    ? new Date(fechaInspeccion).toLocaleDateString('es-VE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Por definir';

  const solicitanteNombre = planificacion.solicitud?.cliente
    ? `${planificacion.solicitud.cliente.nombre || ''} ${planificacion.solicitud.cliente.apellido || ''}`.trim()
    : planificacion.solicitante_nombre || 'N/A';

  const solicitanteDoc = planificacion.solicitud?.cliente?.cedula_rif || planificacion.solicitante_doc || '';

  const propiedadNombre = planificacion.solicitud?.propiedad?.nombre || planificacion.propiedad_nombre || 'Sin especificar';
  
  const ubicacion = [
    planificacion.solicitud?.propiedad?.sectores?.parroquias?.municipios?.estados?.nombre,
    planificacion.solicitud?.propiedad?.sectores?.parroquias?.municipios?.nombre,
    planificacion.solicitud?.propiedad?.sectores?.parroquias?.nombre,
    planificacion.solicitud?.propiedad?.sectores?.nombre,
  ]
    .filter(Boolean)
    .join(', ') || planificacion.ubicacion_texto || 'Ubicación registrada en sistema';

  const listaInspectoresHtml = inspectores.length > 0
    ? inspectores
        .map(
          (insp) => `
          <tr style="border-bottom: 1px solid #f3f4f6;">
            <td style="padding: 10px 12px; font-weight: 600; color: #1f2937; font-size: 13px;">${insp.nombre || 'Inspector'} ${insp.apellido || ''}</td>
            <td style="padding: 10px 12px; color: #4b5563; font-size: 13px;">C.I: ${insp.cedula || 'N/A'}</td>
            <td style="padding: 10px 12px; color: #4b5563; font-size: 13px;">${insp.cargos?.nombre || 'Técnico Oficial'}</td>
          </tr>`
        )
        .join('')
    : `<tr><td colspan="3" style="padding: 12px; text-align: center; color: #6b7280; font-size: 13px;">Sin inspectores asignados</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación de Inspección SICIC-INSAI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 20px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, ${headerColor} 100%); padding: 30px 25px; text-align: center; color: #ffffff;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #a7f3d0; margin-bottom: 6px;">
                REPÚBLICA BOLIVARIANA DE VENEZUELA • INSAI
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 800; tracking-tight: true; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                SICIC-INSAI
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; color: #d1fae5; font-weight: 500;">
                Sistema Integral de Inspecciones de Campo y Control Sanitario
              </p>
            </td>
          </tr>

          <!-- Alert / Status Badge -->
          <tr>
            <td style="padding: 24px 30px 10px 30px;">
              <div style="background-color: ${badgeBg}; border-left: 4px solid ${headerColor}; padding: 12px 16px; border-radius: 8px; display: flex; align-items: center;">
                <span style="font-size: 13px; font-weight: 700; color: ${badgeText}; text-transform: uppercase; tracking-wide: true;">
                  📌 ${statusTitle}
                </span>
              </div>
            </td>
          </tr>

          <!-- Intro Content -->
          <tr>
            <td style="padding: 15px 30px; color: #374151; font-size: 14px; line-height: 1.6;">
              Estimado(a) Inspector(a),
              <br><br>
              Se le notifica la asignación de comisión de servicio para la ejecución de la siguiente inspección sanitaria de campo registrada en el sistema:
            </td>
          </tr>

          <!-- Details Technical Card -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; border-collapse: separate; overflow: hidden;">
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td width="35%" style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; background-color: #f3f4f6;">Código Planificación</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 800; color: #065f46; font-family: monospace;">
                    ${planificacion.codigo_planificacion || `PLAN-${planificacion.id}`}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; background-color: #f3f4f6;">Fecha Programada</td>
                  <td style="padding: 12px 16px; font-size: 13px; font-weight: 700; color: #111827;">
                    📅 ${fechaFormateada}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; background-color: #f3f4f6;">Productor / Cliente</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #1f2937;">
                    <strong>${solicitanteNombre}</strong> ${solicitanteDoc ? `(${solicitanteDoc})` : ''}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; background-color: #f3f4f6;">Predio / Propiedad</td>
                  <td style="padding: 12px 16px; font-size: 13px; color: #1f2937;">
                    🏡 <strong>${propiedadNombre}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase; background-color: #f3f4f6;">Ubicación / Sector</td>
                  <td style="padding: 12px 16px; font-size: 12px; color: #4b5563;">
                    📍 ${ubicacion}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Team Table Section -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">
                👥 Comisión de Inspectores Asignados
              </h3>
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #065f46; color: #ffffff;">
                    <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 700;">Nombre y Apellido</th>
                    <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 700;">Identificación</th>
                    <th align="left" style="padding: 10px 12px; font-size: 12px; font-weight: 700;">Cargo</th>
                  </tr>
                </thead>
                <tbody>
                  ${listaInspectoresHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Observations Section if present -->
          ${
            planificacion.observaciones
              ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 14px; border-radius: 10px; font-size: 13px; color: #92400e;">
                <strong>📝 Observaciones / Instrucciones Especiales:</strong><br>
                ${planificacion.observaciones}
              </div>
            </td>
          </tr>`
              : ''
          }

          <!-- Call to Action Banner -->
          <tr>
            <td style="padding: 10px 30px 30px 30px; text-align: center;">
              <p style="font-size: 12px; color: #6b7280; margin-bottom: 15px;">
                Por favor, consulte el sistema SICIC-INSAI para ver los expedientes digitalizados y actas asociadas.
              </p>
              <div style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 13px; font-weight: 700; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.3);">
                Acceder al Portal SICIC-INSAI
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 25px 30px; text-align: center; color: #9ca3af; font-size: 11px; line-height: 1.5; border-top: 1px solid #374151;">
              <strong style="color: #e5e7eb;">Instituto Nacional de Sanidad Agrícola Integral (INSAI)</strong><br>
              Gobierno Bolivariano de Venezuela • Dirección de Epidemiología y Salud Agrícola<br>
              <span style="color: #6b7280; font-size: 10px;">
                Este es un mensaje automático generado por el sistema SICIC-INSAI. Por favor no responda a esta dirección de correo.
              </span>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
