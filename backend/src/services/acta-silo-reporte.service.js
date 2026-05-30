import imageService from './image.service.js';

const JUSTIFICACION_LEGAL =
  'En ejercicio de las atribuciones conferidas en los artículos 72 y 73 de la Ley de Salud Agrícola Integral, ' +
  'en concordancia con las normas de seguridad alimentaria nacional, almacenamiento, conservación, control de inventarios ' +
  'y resguardo fitosanitario de silos, depósitos y galpones de almacenamiento en todo el territorio nacional.';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function val(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function formatFechaCorta(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function resolveUbicacion(propiedad, cliente) {
  const ubic = propiedad?.propiedad_ubicacion?.[0];
  const sector = ubic?.sectores;
  const parroquia = sector?.parroquias;
  const municipio = parroquia?.municipios;
  const estado = municipio?.estados;
  return {
    sector: val(sector?.nombre),
    parroquia: val(parroquia?.nombre),
    municipio: val(municipio?.nombre),
    estado: val(estado?.nombre),
    calle: val(propiedad?.punto_referencia) || val(cliente?.direccion_fiscal),
    referencia: val(propiedad?.punto_referencia),
  };
}

export async function buildActaSiloReporte(acta) {
  const plan = acta.planificaciones;
  const solic = plan?.solicitudes;
  const cliente = solic?.clientes;
  const propiedad = solic?.propiedades;
  const ubic = resolveUbicacion(propiedad, cliente);
  const fecha = acta.fecha_notificacion ? new Date(acta.fecha_notificacion) : new Date();

  const servidores = (plan?.planificacion_empleados || [])
    .map((pe) => pe.empleados)
    .filter(Boolean)
    .map((e, i) => ({
      orden: i + 1,
      nombre: `${val(e.nombre)} ${val(e.apellido)}`.trim(),
      cedula: val(e.cedula),
    }));

  const fotosRaw = acta.silo_fotos || [];
  const fotos = (
    await Promise.all(
      fotosRaw.map(async (f) => {
        const dataUrl = await imageService.toPdfDataUrl(f.imagen);
        return dataUrl ? { id: f.id, dataUrl } : null;
      })
    )
  ).filter(Boolean);

  const fechaParts = Number.isNaN(fecha.getTime())
    ? { dia: '', mes: '', anio: '' }
    : {
        dia: String(fecha.getUTCDate()),
        mes: MESES[fecha.getUTCMonth()] || '',
        anio: String(fecha.getUTCFullYear()),
      };

  const lugarCierre = [acta.lugar_ubicacion || ubic.sector, ubic.parroquia, ubic.municipio, ubic.estado ? `Estado ${ubic.estado}` : '']
    .filter(Boolean)
    .join(', ');

  const nControlActa = plan?.codigo ? `ACTA-SILO-${plan.codigo}` : `ACTA-SILO-${acta.id.toString().padStart(4, '0')}`;

  return {
    id: acta.id,
    n_control: nControlActa,
    semana_epid: val(acta.semana_epid, 'N/A'),
    fecha_notificacion: formatFechaCorta(acta.fecha_notificacion),
    lugar_ubicacion: val(acta.lugar_ubicacion, lugarCierre),
    cant_nacional: acta.cant_nacional ? Number(acta.cant_nacional) : 0,
    cant_importado: acta.cant_importado ? Number(acta.cant_importado) : 0,
    cant_afectado: acta.cant_afectado ? Number(acta.cant_afectado) : 0,
    cant_afectado_porcentaje: acta.cant_afectado_porcentaje ? Number(acta.cant_afectado_porcentaje) : 0,
    n_silos: val(acta.n_silos, '0'),
    n_galpones: val(acta.n_galpones, '0'),
    c_instalada: val(acta.c_instalada, '0'),
    c_operativa: val(acta.c_operativa, '0'),
    c_almacenamiento: val(acta.c_almacenamiento, '0'),
    destino_objetivo: val(acta.destino_objetivo, 'No especificado'),
    observaciones: val(acta.observaciones, 'Sin observaciones'),
    medidas_recomendadas: val(acta.medidas_recomendadas, 'Sin medidas recomendadas'),
    evento: val(acta.t_evento?.nombre, 'No especificado'),
    unidad_medida: val(acta.t_unidades?.nombre, 'N/A'),
    justificacion_legal: JUSTIFICACION_LEGAL,
    servidores,
    propietario: {
      nombre: val(cliente?.nombre),
      cedula: val(cliente?.cedula_rif),
      runsai: val(cliente?.codigo_runsai),
      correo: val(cliente?.email),
      telefono: val(cliente?.telefono),
    },
    lugar: {
      nombre: val(propiedad?.nombre, 'Establecimiento de Silo'),
      rif: val(propiedad?.rif, val(cliente?.cedula_rif)),
      calle: ubic.calle,
      sector: ubic.sector,
      municipio: ubic.municipio,
      parroquia: ubic.parroquia,
      estado: ubic.estado,
      tipo: val(propiedad?.t_propiedad?.nombre, 'SILO / ALMACÉN'),
    },
    fotos,
    cierre: {
      dia: fechaParts.dia,
      mes: fechaParts.mes,
      anio: fechaParts.anio,
      lugar: lugarCierre || '___________________',
    },
    generado_el: formatFechaCorta(new Date()),
  };
}

export const ACTA_SILO_REPORT_INCLUDE = {
  planificaciones: {
    include: {
      planificacion_empleados: {
        include: {
          empleados: true,
        },
      },
      solicitudes: {
        include: {
          clientes: true,
          propiedades: {
            include: {
              t_propiedad: true,
              propiedad_ubicacion: {
                take: 1,
                include: {
                  sectores: {
                    include: {
                      parroquias: {
                        include: {
                          municipios: { include: { estados: true } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  t_unidades: true,
  t_evento: true,
  silo_fotos: true,
};

export default {
  buildActaSiloReporte,
  ACTA_SILO_REPORT_INCLUDE,
};
