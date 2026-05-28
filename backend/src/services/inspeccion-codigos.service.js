const DEFAULT_T_CODIGO = '10-00-M00-P00-F01';

const ESTADO_ABREV_POR_NOMBRE = {
  amazonas: 'AMA',
  anzoategui: 'ANZ',
  apure: 'APU',
  aragua: 'ARA',
  barinas: 'BAR',
  bolivar: 'BOL',
  carabobo: 'VAL',
  cojedes: 'COJ',
  'delta amacuro': 'DAM',
  'distrito capital': 'DCT',
  falcon: 'FAL',
  guarico: 'GUA',
  lara: 'LAR',
  merida: 'MER',
  miranda: 'MIR',
  monagas: 'MON',
  'nueva esparta': 'NES',
  portuguesa: 'POR',
  sucre: 'SUC',
  tachira: 'TAC',
  trujillo: 'TRU',
  vargas: 'VAR',
  yaracuy: 'YAR',
  zulia: 'ZUL',
};

const PLANIFICACION_CONTEXT_INCLUDE = {
  planificacion_empleados: {
    orderBy: { id: 'asc' },
    include: {
      empleados: {
        select: {
          id: true,
          cedula: true,
          nombre: true,
          apellido: true,
          oficina_id: true,
          empleado_residencia: {
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
  solicitudes: {
    include: {
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
};

export function normalizarCedula(cedula) {
  if (!cedula) return null;
  const limpia = String(cedula).replace(/\D/g, '');
  return limpia || null;
}

/** Cédula con nacionalidad para el acta: V-18456789 */
export function formatearCedulaParaControl(cedula) {
  if (!cedula) return null;
  const raw = String(cedula).trim().toUpperCase();
  const match = raw.match(/^([VEJPG])[\s.-]*(\d{5,11})/);
  if (match) return `${match[1]}-${match[2]}`;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  return `V-${digits}`;
}

function prefijoCodigoTerritorial(codigo, letra) {
  const limpio = String(codigo ?? '')
    .trim()
    .toUpperCase()
    .replace(new RegExp(`^${letra}`, 'i'), '')
    .replace(/\D/g, '');
  return `${letra}${limpio || '00'}`;
}

export function formatearFechaControl(fecha) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(d.getTime())) return null;
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}${mm}${yyyy}`;
}

export function resolverAbrevEstado(estado) {
  if (!estado) return null;

  const clave = String(estado.nombre || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  const desdeNombre = ESTADO_ABREV_POR_NOMBRE[clave];
  if (desdeNombre) return desdeNombre;

  const codigo = String(estado.codigo || '').trim().toUpperCase();
  if (/^[A-Z]{2,4}$/.test(codigo)) return codigo;

  return null;
}

export function construirCodigoTerritorial(propiedad, opts = {}) {
  if (!propiedad) return DEFAULT_T_CODIGO;

  const ubicacion = propiedad.propiedad_ubicacion?.[0];
  const sector = ubicacion?.sectores;
  if (sector?.parroquias?.municipios?.estados) {
    const estado = sector.parroquias.municipios.estados;
    const municipio = sector.parroquias.municipios;
    const parroquia = sector.parroquias;

    const e = prefijoCodigoTerritorial(estado.codigo, 'E');
    const m = prefijoCodigoTerritorial(municipio.codigo, 'M');
    const p = prefijoCodigoTerritorial(parroquia.codigo, 'P');
    const s = prefijoCodigoTerritorial(sector.codigo, 'S');

    const fecha = opts.fechaInspeccion ? new Date(opts.fechaInspeccion) : new Date();
    const ym = Number.isNaN(fecha.getTime())
      ? ''
      : `${fecha.getUTCFullYear()}${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`;

    const tipoNombre = String(propiedad?.t_propiedad?.nombre || '').toLowerCase();
    const tipoAbrev = tipoNombre.includes('establecimiento')
      ? 'ES'
      : tipoNombre.includes('empresa')
        ? 'EM'
        : 'PR';

    const secuencia = String(opts.secuencia ?? '1').replace(/\D/g, '') || '1';

    const partes = [e, m, p, s, tipoAbrev];
    if (ym) partes.push(ym);
    partes.push(secuencia.padStart(4, '0'));

    return partes.join('-');
  }

  const codigoGuardado = String(propiedad.codigo_insai || '').trim();
  if (/^E\d+-M\d+-P\d+-S\d+/i.test(codigoGuardado)) {
    return codigoGuardado;
  }

  return codigoGuardado || DEFAULT_T_CODIGO;
}

/** N° control oficial: YAR-V-18456789-04052026-01 */
export function formatNControlParaActa(inspeccion, planificacion) {
  const guardado = String(inspeccion?.n_control || '').trim();
  if (/^[A-Z]{2,4}-[VEJPG]-\d{5,11}-\d{8}-\d{2}$/i.test(guardado)) {
    return guardado.toUpperCase();
  }

  const abrev = resolverAbrevDesdePlanificacion(planificacion, null);
  const inspector = obtenerPrimerInspector(planificacion);
  const cedulaFmt = formatearCedulaParaControl(inspector?.cedula);
  const fechaStr = formatearFechaControl(inspeccion?.fecha_inspeccion);
  const partes = guardado.split('-');
  const secuencia = /^\d{2}$/.test(partes[partes.length - 1] || '')
    ? partes[partes.length - 1]
    : '01';

  if (abrev && cedulaFmt && fechaStr) {
    return `${abrev}-${cedulaFmt}-${fechaStr}-${secuencia}`;
  }

  return guardado || '—';
}

function estadoDesdePropiedad(planificacion) {
  const propiedad = planificacion?.solicitudes?.propiedades;
  const sector = propiedad?.propiedad_ubicacion?.[0]?.sectores;
  return sector?.parroquias?.municipios?.estados ?? null;
}

function estadoDesdePrimerEmpleado(planificacion) {
  const pe = planificacion?.planificacion_empleados?.[0];
  const residencia = pe?.empleados?.empleado_residencia?.[0];
  return residencia?.sectores?.parroquias?.municipios?.estados ?? null;
}

export function sugerirAbrevEstadoPlanificacion(planificacion) {
  const dePropiedad = estadoDesdePropiedad(planificacion);
  const deEmpleado = estadoDesdePrimerEmpleado(planificacion);
  return {
    propiedad: resolverAbrevEstado(dePropiedad),
    empleado: resolverAbrevEstado(deEmpleado),
  };
}

export function resolverAbrevDesdePlanificacion(planificacion, estadoAbrevManual) {
  const manual = String(estadoAbrevManual || '').trim().toUpperCase();
  if (manual && /^[A-Z]{2,4}$/.test(manual)) {
    return manual;
  }
  const sugerencias = sugerirAbrevEstadoPlanificacion(planificacion);
  return sugerencias.propiedad || sugerencias.empleado || null;
}

export function obtenerPrimerInspector(planificacion) {
  const pe = planificacion?.planificacion_empleados?.[0];
  return pe?.empleados ?? null;
}

export function construirPrefijoControl(estadoAbrev, cedula, fechaInspeccion) {
  const cedulaFmt = formatearCedulaParaControl(cedula);
  const fechaStr = formatearFechaControl(fechaInspeccion);
  if (!estadoAbrev || !cedulaFmt || !fechaStr) return null;
  return `${estadoAbrev}-${cedulaFmt}-${fechaStr}`;
}

export async function obtenerSiguienteSecuencia(tx, prefijo, excludeId = null) {
  const filas = await tx.inspecciones.findMany({
    where: {
      n_control: { startsWith: `${prefijo}-` },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { n_control: true },
  });

  let maxSeq = 0;
  for (const fila of filas) {
    const partes = fila.n_control.split('-');
    const seq = parseInt(partes[partes.length - 1], 10);
    if (!Number.isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  return String(maxSeq + 1).padStart(2, '0');
}

export async function generarNumeroControl(tx, {
  planificacionId,
  fechaInspeccion,
  estadoAbrev,
  excludeId = null,
}) {
  const planificacion = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    include: PLANIFICACION_CONTEXT_INCLUDE,
  });

  if (!planificacion) {
    const error = new Error('La planificación indicada no existe');
    error.statusCode = 404;
    throw error;
  }

  const inspector = obtenerPrimerInspector(planificacion);
  const cedula = normalizarCedula(inspector?.cedula);
  if (!cedula) {
    const error = new Error(
      'La planificación debe tener al menos un inspector con cédula válida'
    );
    error.statusCode = 400;
    throw error;
  }

  const abrev = resolverAbrevDesdePlanificacion(planificacion, estadoAbrev);
  if (!abrev) {
    const error = new Error(
      'Indique la abreviatura del estado (sede) para generar el número de control'
    );
    error.statusCode = 400;
    throw error;
  }
  const prefijo = construirPrefijoControl(abrev, cedula, fechaInspeccion);
  if (!prefijo) {
    const error = new Error('No se pudo construir el prefijo del número de control');
    error.statusCode = 400;
    throw error;
  }

  const secuencia = await obtenerSiguienteSecuencia(tx, prefijo, excludeId);
  const nControl = `${prefijo}-${secuencia}`;

  const duplicado = await tx.inspecciones.findFirst({
    where: {
      n_control: nControl,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });

  if (duplicado) {
    const error = new Error('Conflicto al generar el número de control. Intente de nuevo.');
    error.statusCode = 409;
    throw error;
  }

  return {
    n_control: nControl,
    estado_abrev: abrev,
    inspector_cedula: cedula,
    inspector_nombre: inspector
      ? `${inspector.nombre} ${inspector.apellido}`.trim()
      : null,
    secuencia,
    prefijo,
  };
}

export async function resolverCodigoTerritorial(tx, planificacionId, opts = {}) {
  const planificacion = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    include: {
      solicitudes: {
        include: {
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
  });

  const propiedad = planificacion?.solicitudes?.propiedades;
  return construirCodigoTerritorial(propiedad, opts);
}

export async function resolverCodigosInspeccion(tx, params) {
  const { planificacionId, fechaInspeccion, estadoAbrev, excludeId } = params;

  const control = await generarNumeroControl(tx, {
    planificacionId,
    fechaInspeccion,
    estadoAbrev,
    excludeId,
  });

  const planificacion = await tx.planificaciones.findUnique({
    where: { id: Number(planificacionId) },
    include: PLANIFICACION_CONTEXT_INCLUDE,
  });

  const propiedad = planificacion?.solicitudes?.propiedades;
  const t_codigo = construirCodigoTerritorial(propiedad, {
    fechaInspeccion,
    secuencia: control.secuencia,
  });

  const estadoPropiedad = estadoDesdePropiedad(planificacion);
  const estadoEmpleado = estadoDesdePrimerEmpleado(planificacion);

  return {
    t_codigo,
    n_control: control.n_control,
    estado_abrev: control.estado_abrev,
    estado_sugerido_propiedad: resolverAbrevEstado(estadoPropiedad),
    estado_sugerido_empleado: resolverAbrevEstado(estadoEmpleado),
    inspector: {
      cedula: control.inspector_cedula,
      nombre: control.inspector_nombre,
    },
    secuencia: control.secuencia,
    prefijo: control.prefijo,
  };
}

export function debenRegenerarCodigos(body, existing) {
  if (!existing) return true;

  const planCambio =
    body.planificacion_id !== undefined &&
    Number(body.planificacion_id) !== existing.planificacion_id;

  const fechaCambio =
    body.fecha_inspeccion !== undefined &&
    formatearFechaControl(body.fecha_inspeccion) !==
      formatearFechaControl(existing.fecha_inspeccion);

  const abrevActual = existing.n_control?.split('-')[0]?.toUpperCase();
  const estadoCambio =
    body.estado_abrev !== undefined &&
    String(body.estado_abrev).trim().toUpperCase() !== abrevActual;

  return planCambio || fechaCambio || estadoCambio;
}

export default {
  PLANIFICACION_CONTEXT_INCLUDE,
  resolverCodigosInspeccion,
  resolverCodigoTerritorial,
  generarNumeroControl,
  construirCodigoTerritorial,
  resolverAbrevEstado,
  sugerirAbrevEstadoPlanificacion,
  resolverAbrevDesdePlanificacion,
  formatearCedulaParaControl,
  formatNControlParaActa,
  debenRegenerarCodigos,
};
