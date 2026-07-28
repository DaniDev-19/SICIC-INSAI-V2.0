/**
 * Genera el marcado HTML institucional para la ficha de notificación de planificación de inspecciones.
 * Diseño formal, serio y profesional para el INSAI (sin degradados).
 * 
 * @param {Object} params
 * @param {'CREACION' | 'ACTUALIZACION'} params.tipoEvento
 * @param {Object} params.planificacion
 * @param {Array<Object>} params.inspectores
 * @returns {string} HTML estilizado institucional
 */
export const getPlanificacionEmailHtml = ({ tipoEvento = 'CREACION', planificacion, inspectores = [] }) => {
  const isCreacion = tipoEvento === 'CREACION';
  const headerBgColor = '#064e3b'; // Verde institucional sólido
  const statusTitle = isCreacion ? 'NOTIFICACIÓN DE ASIGNACIÓN DE INSPECCIÓN' : 'ACTUALIZACIÓN DE INSPECCIÓN PLANIFICADA';
  const badgeBg = isCreacion ? '#ecfdf5' : '#f0f9ff';
  const badgeBorder = isCreacion ? '#10b981' : '#0284c7';
  const badgeText = isCreacion ? '#047857' : '#0369a1';

  const fechaInspeccion = planificacion.fecha_programada || planificacion.fecha_inspeccion;
  const fechaFormateada = fechaInspeccion
    ? new Date(fechaInspeccion).toLocaleDateString('es-VE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Por definir';

  // Sincronización robusta con esquema Prisma (plural y singular)
  const solicitudObj = planificacion.solicitudes || planificacion.solicitud;
  const clienteObj = solicitudObj?.clientes || solicitudObj?.cliente;
  const propiedadObj = solicitudObj?.propiedades || solicitudObj?.propiedad;

  const nombreProductor = clienteObj
    ? `${clienteObj.nombre || ''} ${clienteObj.apellido || ''}`.trim() || clienteObj.razon_social || 'N/A'
    : planificacion.solicitante_nombre || 'N/A';

  const docProductor = clienteObj?.cedula_rif || planificacion.solicitante_doc || '';

  const nombrePredio = propiedadObj?.nombre || planificacion.propiedad_nombre || 'Sin especificar';

  const sectorObj = propiedadObj?.propiedad_ubicacion?.[0]?.sectores || propiedadObj?.sectores;

  const ubicacion = [
    sectorObj?.parroquias?.municipios?.estados?.nombre,
    sectorObj?.parroquias?.municipios?.nombre,
    sectorObj?.parroquias?.nombre,
    sectorObj?.nombre,
  ]
    .filter(Boolean)
    .join(', ') || planificacion.ubicacion || planificacion.ubicacion_texto || 'Ubicación registrada en sistema';

  const listaInspectoresHtml = inspectores.length > 0
    ? inspectores
        .map(
          (insp) => `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 10px 14px; font-weight: 600; color: #111827; font-size: 13px;">${insp.nombre || 'Inspector'} ${insp.apellido || ''}</td>
            <td style="padding: 10px 14px; color: #374151; font-size: 13px; font-family: monospace;">V-${insp.cedula || 'N/A'}</td>
            <td style="padding: 10px 14px; color: #4b5563; font-size: 13px;">${insp.cargos?.nombre || 'Técnico Oficial'}</td>
          </tr>`
        )
        .join('')
    : `<tr><td colspan="3" style="padding: 14px; text-align: center; color: #6b7280; font-size: 13px; font-style: italic;">Sin inspectores asignados</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notificación Oficial INSAI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: 'Segoe UI', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Document Container -->
        <table role="presentation" width="100%" style="max-width: 640px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #d1d5db; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Official Institutional Header -->
          <tr>
            <td style="background-color: ${headerBgColor}; padding: 24px 30px; text-align: left; color: #ffffff;">
              <table width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #a7f3d0; margin-bottom: 4px;">
                      REPÚBLICA BOLIVARIANA DE VENEZUELA
                    </div>
                    <div style="font-size: 18px; font-weight: 800; letter-spacing: 0.5px; color: #ffffff;">
                      INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)
                    </div>
                    <div style="font-size: 11px; color: #d1fae5; font-weight: 500; margin-top: 2px;">
                      Sistema de Información para el Control de Inspecciones de Campo (SICIC-INSAI)
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Document Sub-Header / Status Banner -->
          <tr>
            <td style="padding: 20px 30px 10px 30px;">
              <div style="background-color: ${badgeBg}; border-left: 4px solid ${badgeBorder}; padding: 12px 16px; border-radius: 4px;">
                <span style="font-size: 12px; font-weight: 800; color: ${badgeText}; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${statusTitle}
                </span>
              </div>
            </td>
          </tr>

          <!-- Body Text -->
          <tr>
            <td style="padding: 12px 30px 20px 30px; color: #1f2937; font-size: 14px; line-height: 1.6;">
              Se notifica formalmente al personal técnico sobre la programación de la siguiente orden de inspección sanitaria de campo:
            </td>
          </tr>

          <!-- Data Grid / Technical Record -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #e5e7eb; background-color: #f9fafb;">
                  <td width="38%" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; border-right: 1px solid #e5e7eb;">Código Planificación</td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 800; color: #064e3b; font-family: monospace;">
                    ${planificacion.codigo || `PLAN-${planificacion.id}`}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; background-color: #f9fafb; border-right: 1px solid #e5e7eb;">Fecha Programada</td>
                  <td style="padding: 10px 14px; font-size: 13px; font-weight: 700; color: #111827;">
                    ${fechaFormateada}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; background-color: #f9fafb; border-right: 1px solid #e5e7eb;">Productor / Cliente</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #111827; font-weight: 600;">
                    ${nombreProductor} ${docProductor ? `<span style="font-weight: normal; color: #4b5563;">(${docProductor})</span>` : ''}
                  </td>
                </tr>
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; background-color: #f9fafb; border-right: 1px solid #e5e7eb;">Predio / Propiedad</td>
                  <td style="padding: 10px 14px; font-size: 13px; color: #111827; font-weight: 600;">
                    ${nombrePredio}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #4b5563; text-transform: uppercase; background-color: #f9fafb; border-right: 1px solid #e5e7eb;">Ubicación Geográfica</td>
                  <td style="padding: 10px 14px; font-size: 12px; color: #374151;">
                    ${ubicacion}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Inspectors Team Table -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="font-size: 12px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                Comisión de Inspectores Asignada
              </div>
              <table width="100%" cellspacing="0" cellpadding="0" style="border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #f3f4f6; border-bottom: 1px solid #d1d5db;">
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Funcionario</th>
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Cédula</th>
                    <th align="left" style="padding: 10px 14px; font-size: 11px; font-weight: 700; color: #374151; text-transform: uppercase;">Cargo</th>
                  </tr>
                </thead>
                <tbody>
                  ${listaInspectoresHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Observations Section -->
          ${
            planificacion.objetivo || planificacion.observaciones
              ? `
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <div style="background-color: #fcf8e3; border: 1px solid #fbeed5; padding: 12px 16px; border-radius: 4px; font-size: 13px; color: #8a6d3b;">
                <strong>Observaciones / Objetivo:</strong><br>
                ${planificacion.objetivo || planificacion.observaciones}
              </div>
            </td>
          </tr>`
              : ''
          }

          <!-- Footer Notice -->
          <tr>
            <td style="background-color: #1f2937; padding: 20px 30px; text-align: center; color: #9ca3af; font-size: 11px; line-height: 1.5;">
              <strong style="color: #ffffff;">INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</strong><br>
              Dirección de Epidemiología y Salud Agrícola • Gobierno Bolivariana de Venezuela<br>
              <span style="color: #6b7280; font-size: 10px;">Este es un mensaje institucional automático generado por el sistema SICIC-INSAI V2.0.</span>
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
