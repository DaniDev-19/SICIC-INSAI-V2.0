import imageService from './image.service.js';

function val(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  const s = String(value).trim();
  return s || fallback;
}

function formatFecha(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '';
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = d.getUTCFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export const AVALES_EXPORT_COLUMNS = [
  { header: 'N° DEL DÍA', key: 'n_dia', width: 12 },
  { header: 'N° DE AVAL', key: 'numero_aval', width: 18 },
  { header: 'OMSAI / OSA', key: 'osa', width: 22 },
  { header: 'PREDIO', key: 'predio', width: 28 },
  { header: 'PROPIETARIO', key: 'propietario', width: 28 },
  { header: 'CI/RIF', key: 'ci_rif', width: 18 },
  { header: 'REG DE HIERRO', key: 'reg_hierro', width: 16 },
  { header: 'REG GANADERO', key: 'reg_ganadero', width: 16 },
  { header: 'CÓDIGO DEL PREDIO', key: 'codigo_predio', width: 20 },
  { header: 'SECTOR', key: 'sector', width: 20 },
  { header: 'PARROQUIA', key: 'parroquia', width: 20 },
  { header: 'MUNICIPIO', key: 'municipio', width: 22 },
  { header: 'ESTADO', key: 'estado', width: 18 },

  // Bovinos
  { header: 'TOROS', key: 't_toros', width: 10 },
  { header: 'VACAS', key: 't_vacas', width: 10 },
  { header: 'NOVILLOS', key: 't_novillos', width: 10 },
  { header: 'NOVILLAS', key: 't_novillas', width: 10 },
  { header: 'MAUTES', key: 't_mautes_m', width: 10 },
  { header: 'MAUTAS', key: 't_mautes_h', width: 10 },
  { header: 'BECERROS', key: 't_becerros', width: 10 },
  { header: 'BECERRAS', key: 't_becerras', width: 10 },
  { header: 'TOTAL BOVINOS', key: 'total_bovinos', width: 15 },

  // Búfalos
  { header: 'BUFALOS', key: 't_bufalos', width: 10 },
  { header: 'BUFALAS', key: 't_bufalas', width: 10 },
  { header: 'BUVILLOS', key: 't_buvillos', width: 10 },
  { header: 'BUVILLAS', key: 't_buvillas', width: 10 },
  { header: 'BUMAUTES', key: 't_bumautes_m', width: 10 },
  { header: 'BUMAUTAS', key: 't_bumautes_h', width: 10 },
  { header: 'BUCERROS', key: 't_bucerros', width: 10 },
  { header: 'BUCERRAS', key: 't_bucerras', width: 10 },
  { header: 'TOTAL BÚFALOS', key: 'total_bufalos', width: 15 },
  { header: 'TOTAL BOV/BUF', key: 'total_bov_buf', width: 16 },

  // Otras Especies
  { header: 'OVINOS TOTAL', key: 'ovinos_total', width: 14 },
  { header: 'CAPRINOS TOTAL', key: 'caprinos_total', width: 14 },
  { header: 'PORCINOS TOTAL', key: 'porcinos_total', width: 14 },
  { header: 'AVES TOTAL', key: 'aves_total', width: 14 },
  { header: 'EQUINOS TOTAL', key: 'equinos_total', width: 14 },
  { header: 'OTROS TOTAL', key: 'otros_total', width: 14 },

  // Biológicos
  { header: 'VACUNA 1', key: 'vacuna_1', width: 16 },
  { header: 'LOTE 1', key: 'lote_1', width: 14 },
  { header: 'MARCA 1', key: 'marca_1', width: 14 },
  { header: 'FECHA VAC 1', key: 'fecha_vac_1', width: 14 },

  { header: 'VACUNA 2', key: 'vacuna_2', width: 16 },
  { header: 'LOTE 2', key: 'lote_2', width: 14 },
  { header: 'MARCA 2', key: 'marca_2', width: 14 },
  { header: 'FECHA VAC 2', key: 'fecha_vac_2', width: 14 },

  { header: 'VACUNA 3', key: 'vacuna_3', width: 16 },
  { header: 'LOTE 3', key: 'lote_3', width: 14 },
  { header: 'MARCA 3', key: 'marca_3', width: 14 },
  { header: 'FECHA VAC 3', key: 'fecha_vac_3', width: 14 },

  // Pruebas Diagnósticas
  { header: 'PRUEBAS DIAGNÓSTICAS', key: 'pruebas_diagnosticas', width: 30 },

  // Personal / Validación
  { header: 'MÉDICO VET. RESPONSABLE', key: 'medico_nombre', width: 25 },
  { header: 'CÉDULA MV', key: 'medico_cedula', width: 15 },
  { header: 'N° INSAI', key: 'medico_insai', width: 18 },
  { header: 'N° COLEGIO MV', key: 'medico_cmv', width: 16 },
  { header: 'CÓDIGO CERTIFICADO', key: 'certificado_vacunacion_n', width: 22 },
  { header: 'FECHA DE EMISIÓN', key: 'fecha_emision', width: 16 },
  { header: 'FECHA DE VENCIMIENTO', key: 'fecha_vencimiento', width: 18 },
  { header: 'JEFE DE OSA', key: 'jefe_osa_nombre', width: 25 },
  { header: 'OBSERVACIONES', key: 'observaciones', width: 30 },
];

export async function buildAvalReporte(aval, tenantPrisma) {
  // 1. Extraer relaciones anidadas
  const inspeccion = aval.inspecciones;
  const planificacion = inspeccion?.planificaciones;
  const solicitud = planificacion?.solicitudes;
  const propiedad = solicitud?.propiedades;
  const cliente = propiedad?.clientes || solicitud?.clientes;

  const ubicacion = propiedad?.propiedad_ubicacion?.[0];
  const sector = ubicacion?.sectores;
  const parroquia = sector?.parroquias;
  const municipio = parroquia?.municipios;
  const estado = municipio?.estados;

  // 2. Resolver datos del predio e hierro
  const propHierro = propiedad?.propiedad_hierro?.[0];
  const regHierro = propHierro?.num_reg_hierro || '';
  const regGanadero = propHierro?.num_reg_ganadero || '';

  // Tomar directamente el dato ingresado en el formulario del aval (aval.codigo_predio), con fallback al código INSAI de la propiedad
  const codigoPredio = (aval.codigo_predio && aval.codigo_predio.trim()) || propiedad?.codigo_insai || '...........';

  // Hierro image (prioritizing direct aval hierros, then property hierros)
  let hierroImgDataUrl = null;
  const directHierro = aval.aval_hierros?.[0]?.hierro_img_url;
  const fallbackHierro = propHierro?.hierro_img_url;
  const targetHierroUrl = directHierro || fallbackHierro;

  if (targetHierroUrl) {
    try {
      hierroImgDataUrl = await imageService.toPdfDataUrl(targetHierroUrl);
    } catch (e) {
      console.error('Error procesando imagen de hierro para PDF:', e);
    }
  }

  // 3. Resolver OSA
  const medicoEmp = aval.empleados_avales_sanitarios_medico_responsable_idToempleados;
  const jefeEmp = aval.empleados_avales_sanitarios_jefe_osa_idToempleados;
  const osaNombre =
    jefeEmp?.oficinas?.nombre ||
    medicoEmp?.oficinas?.nombre ||
    'SAN FELIPE';

  // 4. Resolver Bovinos y Búfalos
  const bovBuf = aval.aval_hallazgos_bov_buf?.[0] || {};
  const t_toros = Number(bovBuf.t_toros) || 0;
  const t_vacas = Number(bovBuf.t_vacas) || 0;
  const t_novillos = Number(bovBuf.t_novillos) || 0;
  const t_novillas = Number(bovBuf.t_novillas) || 0;
  const t_mautes_m = Number(bovBuf.t_mautes_m) || 0;
  const t_mautes_h = Number(bovBuf.t_mautes_h) || 0;
  const t_becerros = Number(bovBuf.t_becerros) || 0;
  const t_becerras = Number(bovBuf.t_becerras) || 0;

  const totalBovinos =
    t_toros + t_vacas + t_novillos + t_novillas + t_mautes_m + t_mautes_h + t_becerros + t_becerras;

  const t_bufalos = Number(bovBuf.t_bufalos) || 0;
  const t_bufalas = Number(bovBuf.t_bufalas) || 0;
  const t_buvillos = Number(bovBuf.t_buvillos) || 0;
  const t_buvillas = Number(bovBuf.t_buvillas) || 0;
  const t_bumautes_m = Number(bovBuf.t_bumautes_m) || 0;
  const t_bumautes_h = Number(bovBuf.t_bumautes_h) || 0;
  const t_bucerros = Number(bovBuf.t_bucerros) || 0;
  const t_bucerras = Number(bovBuf.t_bucerras) || 0;

  const totalBufalos =
    t_bufalos + t_bufalas + t_buvillos + t_buvillas + t_bumautes_m + t_bumautes_h + t_bucerros + t_bucerras;

  const totalBovBufGeneral = totalBovinos + totalBufalos;

  // 5. Resolver Otras Especies
  const otrasList = aval.aval_hallazgos_otras || [];
  const findEspecie = (nameKeywords) => {
    const found = otrasList.find((o) => {
      const nom = (o.t_animales?.nombre || '').toLowerCase();
      return nameKeywords.some((k) => nom.includes(k));
    });
    if (!found) return { machos: '', hembras: '', crias: '', total: 0 };
    const m = Number(found.machos) || 0;
    const h = Number(found.hembras) || 0;
    const c = Number(found.crias) || 0;
    const t = Number(found.total) || m + h + c;
    return {
      machos: m > 0 ? m : '',
      hembras: h > 0 ? h : '',
      crias: c > 0 ? c : '',
      total: t,
    };
  };

  const ovinos = findEspecie(['ovino', 'oveja', 'carnero']);
  const caprinos = findEspecie(['caprino', 'cabra', 'chivo']);
  const porcinos = findEspecie(['porcino', 'cerdo', 'cochino']);
  const aves = findEspecie(['ave', 'gallina', 'pollo']);
  const equinos = findEspecie(['equino', 'caballo', 'yegua', 'mula', 'asno']);

  // Especie personalizada o "Otros / Queso"
  const standardKeywords = ['ovino', 'oveja', 'caprino', 'cabra', 'porcino', 'cerdo', 'ave', 'gallina', 'pollo', 'equino', 'caballo'];
  const customOther = otrasList.find((o) => {
    const nom = (o.t_animales?.nombre || '').toLowerCase();
    return !standardKeywords.some((k) => nom.includes(k));
  });

  const otrosEspecie = {
    nombre: customOther?.t_animales?.nombre || 'queso',
    machos: Number(customOther?.machos) || '',
    hembras: Number(customOther?.hembras) || '',
    crias: Number(customOther?.crias) || '',
    total: customOther ? (Number(customOther.total) || (Number(customOther.machos) || 0) + (Number(customOther.hembras) || 0) + (Number(customOther.crias) || 0)) : 0,
  };

  // 6. Resolver Biológicos y Lotes
  // Buscamos movimientos de insumos asociados para obtener lotes exactos
  let movimientos = [];
  if (tenantPrisma) {
    try {
      movimientos = await tenantPrisma.movimientos_insumos.findMany({
        where: { aval_id: aval.id },
        select: { insumo_id: true, lote: true },
      });
    } catch {
      movimientos = [];
    }
  }

  const biologicosRaw = aval.aval_biologicos || [];
  const biologicosFormatted = biologicosRaw.map((b) => {
    const matchedMov = movimientos.find((m) => m.insumo_id === b.insumo_id);
    const lote = b.lote || matchedMov?.lote || '';
    return {
      vacuna: b.insumos?.nombre || '',
      lote: lote,
      marca: b.insumos?.marca || '',
      fecha_vacunacion: formatFecha(b.fecha_vacunacion),
      pruebas_diagnosticas: b.pruebas_diagnosticas || '',
    };
  });

  // Asegurar al menos 4 filas para mantener la plantilla institucional exacta
  const biologicosPadded = [...biologicosFormatted];
  while (biologicosPadded.length < 4) {
    biologicosPadded.push({
      vacuna: '',
      lote: '',
      marca: '',
      fecha_vacunacion: '',
      pruebas_diagnosticas: '',
    });
  }

  // 7. Datos de Médicos y Autoridades
  const medicoNombre = medicoEmp
    ? `${medicoEmp.nombre || ''} ${medicoEmp.apellido || ''}`.trim()
    : 'José Martínez';
  const medicoCedula = medicoEmp?.cedula || '12724383';
  const medicoInsai = '201018459812-';
  const medicoCmv = '177';

  const jefeNombre = jefeEmp
    ? `${jefeEmp.nombre || ''} ${jefeEmp.apellido || ''}`.trim()
    : 'José Martínez';

  return {
    id: aval.id,
    numero_aval: val(aval.numero_aval, '2201321'),
    osa: osaNombre,
    hierro_img_url: hierroImgDataUrl,

    // Predio y Propietario
    predio: val(propiedad?.nombre, 'AGROP BUENOS AIRES'),
    propietario: val(cliente?.nombre, 'AGROP. BUENOS AIRES CA'),
    ci_rif: val(cliente?.cedula_rif, 'J307684771'),
    num_reg_hierro: val(regHierro, ''),
    num_reg_ganadero: val(regGanadero, '...........'),
    codigo_predio: val(codigoPredio, '...........'),

    // Ubicación
    sector: val(sector?.nombre, 'SOCREMO'),
    parroquia: val(parroquia?.nombre, 'YUMARE'),
    municipio: val(municipio?.nombre, 'MANUEL MONGE'),
    estado: val(estado?.nombre, 'YARACUY'),

    // Animales Vacunados
    bovinos: {
      toros: t_toros || '',
      vacas: t_vacas || '',
      novillos: t_novillos || '',
      novillas: t_novillas || '',
      mautes: t_mautes_m || '',
      mautas: t_mautes_h || '',
      becerros: t_becerros || '',
      becerras: t_becerras || '',
      total: totalBovinos,
    },
    bufalos: {
      bufalos: t_bufalos || '',
      bufalas: t_bufalas || '',
      buvillos: t_buvillos || '',
      buvillas: t_buvillas || '',
      bumautes: t_bumautes_m || '',
      bumautas: t_bumautes_h || '',
      bucerros: t_bucerros || '',
      bucerras: t_bucerras || '',
      total: totalBufalos,
    },
    total_bov_buf: totalBovBufGeneral,

    otras_especies: {
      ovinos,
      caprinos,
      porcinos,
      aves,
      equinos,
      otros: otrosEspecie,
    },

    // Biológicos
    biologicos: biologicosPadded,

    // Datos Médicos y Firmas
    medico_responsable: {
      nombre: medicoNombre,
      cedula: medicoCedula,
      n_insai: medicoInsai,
      n_cmv: medicoCmv,
    },
    jefe_osa: {
      nombre: jefeNombre,
    },
    certificado_vacunacion_n: val(aval.certificado_vacunacion_n, 'CVR202507162307083D44'),
    fecha_emision: formatFecha(aval.fecha_emision) || '28/08/2025.',
    fecha_vencimiento: formatFecha(aval.fecha_vencimiento) || '01/11/2025.',
    observaciones: val(aval.observaciones, ''),
  };
}

export function buildAvalesExportData(avales) {
  return avales.map((aval, index) => {
    const inspeccion = aval.inspecciones;
    const plan = inspeccion?.planificaciones;
    const solic = plan?.solicitudes;
    const prop = solic?.propiedades;
    const cli = prop?.clientes || solic?.clientes;

    const ubic = prop?.propiedad_ubicacion?.[0];
    const sec = ubic?.sectores;
    const parr = sec?.parroquias;
    const mun = parr?.municipios;
    const est = mun?.estados;

    const propHierro = prop?.propiedad_hierro?.[0];
    const bovBuf = aval.aval_hallazgos_bov_buf?.[0] || {};
    const otras = aval.aval_hallazgos_otras || [];
    const bios = aval.aval_biologicos || [];

    const medico = aval.empleados_avales_sanitarios_medico_responsable_idToempleados;
    const jefe = aval.empleados_avales_sanitarios_jefe_osa_idToempleados;

    const t_toros = Number(bovBuf.t_toros) || 0;
    const t_vacas = Number(bovBuf.t_vacas) || 0;
    const t_novillos = Number(bovBuf.t_novillos) || 0;
    const t_novillas = Number(bovBuf.t_novillas) || 0;
    const t_mautes_m = Number(bovBuf.t_mautes_m) || 0;
    const t_mautes_h = Number(bovBuf.t_mautes_h) || 0;
    const t_becerros = Number(bovBuf.t_becerros) || 0;
    const t_becerras = Number(bovBuf.t_becerras) || 0;
    const totalBov = t_toros + t_vacas + t_novillos + t_novillas + t_mautes_m + t_mautes_h + t_becerros + t_becerras;

    const t_bufalos = Number(bovBuf.t_bufalos) || 0;
    const t_bufalas = Number(bovBuf.t_bufalas) || 0;
    const t_buvillos = Number(bovBuf.t_buvillos) || 0;
    const t_buvillas = Number(bovBuf.t_buvillas) || 0;
    const t_bumautes_m = Number(bovBuf.t_bumautes_m) || 0;
    const t_bumautes_h = Number(bovBuf.t_bumautes_h) || 0;
    const t_bucerros = Number(bovBuf.t_bucerros) || 0;
    const t_bucerras = Number(bovBuf.t_bucerras) || 0;
    const totalBuf = t_bufalos + t_bufalas + t_buvillos + t_buvillas + t_bumautes_m + t_bumautes_h + t_bucerros + t_bucerras;

    const findTotalOtras = (keyw) => {
      const o = otras.find((item) => keyw.some((k) => (item.t_animales?.nombre || '').toLowerCase().includes(k)));
      return o ? Number(o.total) || 0 : 0;
    };

    return {
      n_dia: index + 1,
      numero_aval: aval.numero_aval || `AV-${aval.id}`,
      osa: jefe?.oficinas?.nombre || medico?.oficinas?.nombre || 'SAN FELIPE',
      predio: prop?.nombre || 'N/A',
      propietario: cli?.nombre || 'N/A',
      ci_rif: cli?.cedula_rif || 'N/A',
      reg_hierro: propHierro?.num_reg_hierro || '-',
      reg_ganadero: propHierro?.num_reg_ganadero || '-',
      codigo_predio: aval.codigo_predio || prop?.codigo_insai || '-',
      sector: sec?.nombre || '-',
      parroquia: parr?.nombre || '-',
      municipio: mun?.nombre || '-',
      estado: est?.nombre || '-',

      t_toros,
      t_vacas,
      t_novillos,
      t_novillas,
      t_mautes_m,
      t_mautes_h,
      t_becerros,
      t_becerras,
      total_bovinos: totalBov,

      t_bufalos,
      t_bufalas,
      t_buvillos,
      t_buvillas,
      t_bumautes_m,
      t_bumautes_h,
      t_bucerros,
      t_bucerras,
      total_bufalos: totalBuf,
      total_bov_buf: totalBov + totalBuf,

      ovinos_total: findTotalOtras(['ovino', 'oveja']),
      caprinos_total: findTotalOtras(['caprino', 'cabra']),
      porcinos_total: findTotalOtras(['porcino', 'cerdo']),
      aves_total: findTotalOtras(['ave', 'pollo', 'gallina']),
      equinos_total: findTotalOtras(['equino', 'caballo']),
      otros_total: findTotalOtras(['queso', 'otro']),

      vacuna_1: bios[0]?.insumos?.nombre || '-',
      lote_1: bios[0]?.lote || '-',
      marca_1: bios[0]?.insumos?.marca || '-',
      fecha_vac_1: formatFecha(bios[0]?.fecha_vacunacion),

      vacuna_2: bios[1]?.insumos?.nombre || '-',
      lote_2: bios[1]?.lote || '-',
      marca_2: bios[1]?.insumos?.marca || '-',
      fecha_vac_2: formatFecha(bios[1]?.fecha_vacunacion),

      vacuna_3: bios[2]?.insumos?.nombre || '-',
      lote_3: bios[2]?.lote || '-',
      marca_3: bios[2]?.insumos?.marca || '-',
      fecha_vac_3: formatFecha(bios[2]?.fecha_vacunacion),

      pruebas_diagnosticas: bios.map((b) => b.pruebas_diagnosticas).filter(Boolean).join('; ') || '-',

      medico_nombre: medico ? `${medico.nombre} ${medico.apellido}` : 'No asignado',
      medico_cedula: medico?.cedula || '-',
      medico_insai: '201018459812-',
      medico_cmv: '177',
      certificado_vacunacion_n: aval.certificado_vacunacion_n || '-',
      fecha_emision: formatFecha(aval.fecha_emision),
      fecha_vencimiento: formatFecha(aval.fecha_vencimiento),
      jefe_osa_nombre: jefe ? `${jefe.nombre} ${jefe.apellido}` : '-',
      observaciones: aval.observaciones || '-',
    };
  });
}

export default {
  AVALES_EXPORT_COLUMNS,
  buildAvalReporte,
  buildAvalesExportData,
};
