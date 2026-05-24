import imageService from './image.service.js';
import { formatHoraInspeccion } from '../utils/inspeccion-time.util.js';
import {
  construirCodigoTerritorial,
  formatNControlParaActa,
} from './inspeccion-codigos.service.js';

export const AREAS_INSPECCION_OPCIONES = [
  'Salud Vegetal Integral',
  'Salud Animal Integral',
  'Agroecología y Participación Popular',
  'Movilización',
  'Fiscalización Post - Registro',
];

export const FINALIDADES_ACTA_OPCIONES = [
  { id: 1, label: 'Verificar el estado fitosanitario' },
  { id: 2, label: 'Verificar el estado zoosanitario' },
  { id: 3, label: 'Verificar el estado de los procesos agroecológicos' },
  { id: 4, label: 'Verificar el origen o destino para la movilización del rubro' },
  { id: 5, label: 'Verificar Buenas Prácticas de Manufactura en' },
  { id: 6, label: 'Otro' },
];

const JUSTIFICACION_LEGAL =
  'En ejercicio de las atribuciones conferidas en los artículos 72 y 73 de la Ley de Salud Agrícola Integral, ' +
  'y en concordancia con los artículos 1, 2, 4, 13, 34, 35, 36, 50, 57 y 74 de la citada Ley, así como en ' +
  'las normas que regulan la seguridad alimentaria nacional y el desarrollo agrícola sostenible del país.';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function val(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function parseAreas(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
}

function inferAreasFromFinalidades(finalidades) {
  const text = (finalidades || [])
    .map((f) => `${f.finalidad?.nombre || ''} ${f.objetivo || ''}`)
    .join(' ')
    .toLowerCase();
  const inferred = [];
  if (text.includes('vegetal') || text.includes('fito')) inferred.push(AREAS_INSPECCION_OPCIONES[0]);
  if (text.includes('animal') || text.includes('zoo')) inferred.push(AREAS_INSPECCION_OPCIONES[1]);
  if (text.includes('agroecolog')) inferred.push(AREAS_INSPECCION_OPCIONES[2]);
  if (text.includes('moviliz')) inferred.push(AREAS_INSPECCION_OPCIONES[3]);
  if (text.includes('fiscaliz') || text.includes('post')) inferred.push(AREAS_INSPECCION_OPCIONES[4]);
  return inferred;
}

function mapFinalidadesActa(finalidades) {
  return FINALIDADES_ACTA_OPCIONES.map((opcion) => {
    let checked = false;
    let detalle = '';
    (finalidades || []).forEach((fi) => {
      const nombre = (fi.finalidad?.nombre || '').toLowerCase();
      const objetivo = val(fi.objetivo, val(fi.finalidad?.nombre));
      if (opcion.id === 1 && (nombre.includes('fito') || nombre.includes('vegetal'))) {
        checked = true;
        detalle = objetivo;
      } else if (opcion.id === 2 && (nombre.includes('zoo') || nombre.includes('animal'))) {
        checked = true;
        detalle = objetivo;
      } else if (opcion.id === 3 && nombre.includes('agroecolog')) {
        checked = true;
        detalle = objetivo;
      } else if (opcion.id === 4 && nombre.includes('moviliz')) {
        checked = true;
        detalle = objetivo;
      } else if (opcion.id === 5 && (nombre.includes('manufactura') || nombre.includes('bpm'))) {
        checked = true;
        detalle = objetivo;
      } else if (opcion.id === 6 && checked === false) {
        checked = true;
        detalle = objetivo || val(fi.finalidad?.nombre);
      }
    });
    return { ...opcion, checked, detalle };
  });
}

function formatFechaCorta(dateInput) {
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

function resolveUnidad() {
  return 'DIRECCIÓN GENERAL';
}

export async function buildInspeccionReporte(inspeccion) {
  const plan = inspeccion.planificaciones;
  const solic = plan?.solicitudes;
  const cliente = solic?.clientes;
  const propiedad = solic?.propiedades;
  const ubic = resolveUbicacion(propiedad, cliente);
  const fecha = new Date(inspeccion.fecha_inspeccion);
  const areasGuardadas = parseAreas(inspeccion.areas_inspeccion);
  const areasMarcadas = areasGuardadas.length > 0
    ? areasGuardadas
    : inferAreasFromFinalidades(inspeccion.finalidad_inspeccion);

  const servidores = (plan?.planificacion_empleados || [])
    .map((pe) => pe.empleados)
    .filter(Boolean)
    .map((e, i) => ({
      orden: i + 1,
      nombre: `${val(e.nombre)} ${val(e.apellido)}`.trim(),
      cedula: val(e.cedula),
    }));

  const fotosRaw = inspeccion.inspeccion_fotos || [];
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

  const lugarCierre = [ubic.sector, ubic.parroquia, ubic.municipio, ubic.estado ? `Estado ${ubic.estado}` : '']
    .filter(Boolean)
    .join(', ');

  const secuenciaControl = String(inspeccion.n_control || '').split('-').pop() || '01';
  let codigoInspeccion = val(inspeccion.t_codigo);
  if (!/^E\d+-M\d+-P\d+-S\d+/i.test(codigoInspeccion)) {
    codigoInspeccion = construirCodigoTerritorial(propiedad, {
      fechaInspeccion: inspeccion.fecha_inspeccion,
      secuencia: secuenciaControl,
    });
  }

  const nControlActa = formatNControlParaActa(inspeccion, plan);

  return {
    unidad: resolveUnidad(),
    codigo_inspeccion: codigoInspeccion || '10-00-M00-P00-F01',
    n_control: nControlActa,
    status: val(inspeccion.status, 'PENDIENTE').replace(/_/g, ' '),
    fecha_inspeccion: formatFechaCorta(inspeccion.fecha_inspeccion),
    hora_inspeccion: formatHoraInspeccion(inspeccion.hora_inspeccion),
    justificacion_legal: JUSTIFICACION_LEGAL,
    areas: AREAS_INSPECCION_OPCIONES.map((nombre) => ({
      nombre,
      checked: areasMarcadas.includes(nombre),
    })),
    servidores,
    propietario: {
      nombre: val(cliente?.nombre),
      cedula: val(cliente?.cedula_rif),
      runsai: val(cliente?.codigo_runsai),
      correo: val(cliente?.email),
      telefono: val(cliente?.telefono),
    },
    atendido: {
      nombre: val(inspeccion.atendido_por_nombre, 'No Especificado'),
      cedula: val(inspeccion.atendido_por_cedula, 'No Especificado'),
      correo: val(inspeccion.atendido_por_email, 'No Especificado'),
      telefono: val(inspeccion.atendido_por_tlf, 'No Especificado'),
    },
    lugar: {
      nombre: val(propiedad?.nombre),
      rif: val(propiedad?.rif, val(cliente?.cedula_rif)),
      calle: ubic.calle,
      sector: ubic.sector,
      municipio: ubic.municipio,
      parroquia: ubic.parroquia,
      estado: ubic.estado,
      utm_norte: val(inspeccion.insp_utm_norte),
      utm_este: val(inspeccion.insp_utm_este),
      utm_zona: val(inspeccion.insp_utm_zona),
      tipo: val(propiedad?.t_propiedad?.nombre),
    },
    finalidades: mapFinalidadesActa(inspeccion.finalidad_inspeccion),
    aspectos_constatados: val(inspeccion.aspectos_constatados, 'sin novedad'),
    medidas_ordenadas: val(inspeccion.medidas_ordenadas, 'sin novedad'),
    fotos,
    cierre: {
      hora: formatHoraInspeccion(inspeccion.hora_inspeccion),
      dia: fechaParts.dia,
      mes: fechaParts.mes,
      anio: fechaParts.anio,
      lugar: lugarCierre || '___________________',
    },
    vigencia_dias: val(inspeccion.vigencia_dias, '30'),
    posee_certificado: val(inspeccion.posee_certificado, 'No especificado'),
    generado_el: formatFechaCorta(new Date()),
  };
}

export const INSPECCION_REPORT_INCLUDE = {
  planificaciones: {
    include: {
      planificacion_empleados: {
        include: {
          empleados: {
            include: {
              departamentos: { select: { nombre: true } },
              oficinas: { select: { nombre: true } },
            },
          },
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
  finalidad_inspeccion: { include: { finalidad: true } },
  inspeccion_fotos: true,
};

export default {
  buildInspeccionReporte,
  AREAS_INSPECCION_OPCIONES,
  FINALIDADES_ACTA_OPCIONES,
  INSPECCION_REPORT_INCLUDE,
};
