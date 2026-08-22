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

export async function buildSeguimientoReporte(seguimiento) {
  const insp = seguimiento.inspecciones;
  const silo = seguimiento.acta_silos;
  const plan = insp?.planificaciones || silo?.planificaciones;
  const solic = plan?.solicitudes;
  const prop = solic?.propiedades;
  const cli = prop?.clientes || solic?.clientes;

  const ubic = prop?.propiedad_ubicacion?.[0];
  const sec = ubic?.sectores;
  const parr = sec?.parroquias;
  const mun = parr?.municipios;
  const est = mun?.estados;

  // Servidores públicos asignados
  const servidores = (plan?.planificacion_empleados || [])
    .map((pe) => pe.empleados)
    .filter(Boolean)
    .map((e, i) => ({
      orden: i + 1,
      nombre: `${val(e.nombre)} ${val(e.apellido)}`.trim(),
      cedula: val(e.cedula),
      cargo: val(e.cargos?.nombre || e.cargo, 'Inspector Oficial'),
      oficina: val(e.oficinas?.nombre, 'Sede Regional'),
    }));

  // Fotos de seguimiento a Data URLs para renderizado seguro en PDF
  const fotosRaw = seguimiento.seguimiento_fotos || [];
  const fotos = (
    await Promise.all(
      fotosRaw.map(async (f) => {
        const dataUrl = await imageService.toPdfDataUrl(f.imagen);
        return dataUrl ? { id: f.id, dataUrl } : null;
      })
    )
  ).filter(Boolean);

  // Dictamen dinámico según cumplimiento y estado
  const cumplio = Boolean(seguimiento.recomendaciones_cumplidas);
  const statusStr = val(seguimiento.status, 'FINALIZADA').toUpperCase();

  let tipoDictamen = 'CONFORMIDAD';
  let dictamenTitulo = 'DICTAMEN TÉCNICO FAVORABLE - MEDIDAS CUMPLIDAS';
  let dictamenDetalle =
    'Se constata de manera oficial que el administrado/productor ha dado cumplimiento satisfactorio al 100% de las medidas ' +
    'sanitarias y recomendaciones técnicas ordenadas en la inspección precedente. La unidad de producción/instalación se encuentra ' +
    'en condiciones sanitarias conformes a la Ley de Salud Agrícola Integral.';

  if (!cumplio) {
    tipoDictamen = 'INCUMPLIMIENTO';
    dictamenTitulo = 'DICTAMEN TÉCNICO DESFAVORABLE - INCUMPLIMIENTO DE MEDIDAS';
    dictamenDetalle =
      'Se evidencia la persistencia de las no conformidades y el incumplimiento parcial o total de las medidas técnicas ordenadas ' +
      'por este Instituto. Se ratifican las restricciones sanitarias y se conmina a subsanar de inmediato bajo apercibimiento de las ' +
      'sanciones legales correspondientes.';
  } else if (statusStr.includes('SEGUIMIENTO') || statusStr.includes('PROCESO') || statusStr.includes('PENDIENTE')) {
    tipoDictamen = 'EN_SEGUIMIENTO';
    dictamenTitulo = 'DICTAMEN TÉCNICO CONDICIONADO - SEGUIMIENTO EN CURSO';
    dictamenDetalle =
      'Se evidencian avances significativos en la aplicación de las medidas técnicas, manteniéndose la unidad sujeta a monitoreo ' +
      'periódico hasta la constatación total de la inocuidad y control epidemiológico.';
  } else if (statusStr.includes('CUARENTENA')) {
    tipoDictamen = 'CUARENTENA';
    dictamenTitulo = 'DICTAMEN TÉCNICO DE CUARENTENA / RESTRICCIÓN CONTINUA';
    dictamenDetalle =
      'Debido a la naturaleza del evento biológico observado, se ratifica la orden de inmovilización y protocolo de aislamiento ' +
      'sanitario hasta que las pruebas diagnósticas y muestreos oficiales certifiquen la erradicación del foco.';
  }

  const nControlSeguimiento = `SEG-${seguimiento.id.toString().padStart(5, '0')}`;
  const referenciaOrigen = insp?.n_control
    ? `Inspección Base N°: ${insp.n_control}`
    : silo?.id
    ? `Acta de Silo N°: SILO-${silo.id}`
    : 'Inspección Sanitaria Directa';

  return {
    id: seguimiento.id,
    n_control: nControlSeguimiento,
    referencia_origen: referenciaOrigen,
    fecha_seguimiento: formatFecha(seguimiento.fecha_seguimiento) || formatFecha(new Date()),
    status: statusStr,
    recomendaciones_cumplidas: cumplio,

    // Dictamen
    dictamen: {
      tipo: tipoDictamen,
      titulo: dictamenTitulo,
      detalle: dictamenDetalle,
    },

    // Hallazgos técnicos del inspector
    hallazgos_seguimiento: val(
      seguimiento.hallazgos_seguimiento,
      'Sin observaciones técnicas adicionales registradas durante la visita de seguimiento.'
    ),

    // Aspectos previos de la inspección base
    aspectos_previos: val(insp?.aspectos_constatados, ''),
    medidas_previas: val(insp?.medidas_ordenadas, ''),

    // Datos del Predio y Productor
    predio: {
      nombre: val(prop?.nombre, 'No especificado'),
      codigo_insai: val(prop?.codigo_insai, 'N/A'),
      hectareas: prop?.hectareas_totales ? `${prop.hectareas_totales} ha` : 'No especificada',
      punto_referencia: val(prop?.punto_referencia, 'Sin punto de referencia'),
    },
    productor: {
      nombre: val(cli?.nombre, val(insp?.atendido_por_nombre, 'No especificado')),
      ci_rif: val(cli?.cedula_rif, val(insp?.atendido_por_cedula, 'N/A')),
      telefono: val(cli?.telefono, val(insp?.atendido_por_tlf, 'N/A')),
    },
    ubicacion: {
      sector: val(sec?.nombre, 'N/A'),
      parroquia: val(parr?.nombre, 'N/A'),
      municipio: val(mun?.nombre, 'N/A'),
      estado: val(est?.nombre, 'N/A'),
    },

    // Inspectores actuantes
    servidores: servidores.length > 0 ? servidores : [
      {
        orden: 1,
        nombre: 'Funcionario Técnico Inspector',
        cedula: 'Oficial INSAI',
        cargo: 'Inspector Agrícola / Pecuario',
        oficina: 'Sede Regional',
      },
    ],

    // Registro Fotográfico
    fotos,
  };
}

export default {
  buildSeguimientoReporte,
};
