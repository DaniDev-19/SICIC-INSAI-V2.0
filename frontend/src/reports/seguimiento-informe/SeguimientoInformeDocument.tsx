import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { SeguimientoReporteDto } from './types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 45,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#111827',
    backgroundColor: '#ffffff',
    lineHeight: 1.45,
  },

  // ─── MEMBRETE OFICIAL FORMAL ──────────────────────────────────────
  headerContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoImg: {
    width: 130,
    height: 48,
    objectFit: 'contain',
    marginBottom: 6,
  },
  headerTextCountry: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    color: '#000000',
  },
  headerTextMinistry: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 1.5,
    color: '#1f2937',
  },
  headerTextInstitute: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 2,
    color: '#000000',
  },
  headerTextCoord: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 1.5,
    color: '#374151',
  },
  headerDivider: {
    width: '100%',
    height: 1.5,
    backgroundColor: '#1e293b',
    marginTop: 8,
    marginBottom: 10,
  },

  // ─── IDENTIFICACIÓN Y TÍTULO DEL ACTA ─────────────────────────────
  titleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  titleMain: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#0f172a',
  },
  metaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 6,
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#94a3b8',
    fontSize: 8,
  },
  metaTextBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  metaText: {
    fontFamily: 'Helvetica',
    color: '#334155',
  },

  // ─── PÁRRAFOS DEL ACTA (FORMATO CIRCUNSTANCIADO NARRATIVO) ────────
  sectionHeading: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    marginTop: 10,
    marginBottom: 4,
    color: '#0f172a',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
    paddingBottom: 2,
  },
  paragraph: {
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    textAlign: 'justify',
    lineHeight: 1.45,
    marginBottom: 6,
    textIndent: 16,
  },
  paragraphNoIndent: {
    fontSize: 8.5,
    fontFamily: 'Helvetica',
    textAlign: 'justify',
    lineHeight: 1.45,
    marginBottom: 6,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },

  // ─── BLOQUES RESALTADOS / CITAS FORMALES ──────────────────────────
  formalQuoteBox: {
    borderLeftWidth: 2.5,
    borderLeftColor: '#1e293b',
    backgroundColor: '#f8fafc',
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  quoteLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    marginBottom: 1.5,
  },
  quoteValue: {
    fontSize: 8.2,
    fontFamily: 'Helvetica',
    color: '#0f172a',
    lineHeight: 1.35,
    textAlign: 'justify',
    marginBottom: 3,
  },

  // ─── DISPOSICIÓN / DICTAMEN OFICIAL ───────────────────────────────
  resolutionBox: {
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#f8fafc',
    padding: 7,
    marginTop: 6,
    marginBottom: 8,
  },
  resolutionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  resolutionStatusTag: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  resolutionText: {
    fontSize: 8.2,
    fontFamily: 'Helvetica',
    textAlign: 'justify',
    lineHeight: 1.35,
  },

  // ─── FIRMAS OFICIALES ─────────────────────────────────────────────
  signSection: {
    marginTop: 16,
    paddingTop: 10,
  },
  signGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  signCol: {
    width: '48%',
    alignItems: 'center',
    textAlign: 'center',
  },
  signLine: {
    width: '90%',
    height: 1,
    backgroundColor: '#000000',
    marginBottom: 4,
    marginTop: 32,
  },
  signRoleTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#0f172a',
    marginBottom: 2,
  },
  signName: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1e293b',
  },
  signDetail: {
    fontSize: 7.2,
    fontFamily: 'Helvetica',
    color: '#475569',
    marginTop: 1,
  },
  stampBox: {
    marginTop: 4,
    borderWidth: 0.5,
    borderColor: '#94a3b8',
    borderStyle: 'dashed',
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  stampText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: '#64748b',
    textTransform: 'uppercase',
  },

  // ─── PIE DE PÁGINA ────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6.5,
    color: '#64748b',
  },

  // ─── ANEXO FOTOGRÁFICO ────────────────────────────────────────────
  anexoHeader: {
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a',
    paddingBottom: 6,
  },
  anexoTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    color: '#0f172a',
  },
  anexoSubtitle: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#475569',
    marginTop: 2,
  },
  anexoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 6,
  },
  anexoCard: {
    width: '48%',
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    padding: 4,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  anexoImg: {
    width: '100%',
    height: 140,
    objectFit: 'cover',
  },
  anexoCaption: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#475569',
    marginTop: 3,
    textAlign: 'center',
  },
});

interface SeguimientoInformeDocumentProps {
  data: SeguimientoReporteDto;
  logoUrl?: string;
}

export function SeguimientoInformeDocument({
  data,
  logoUrl,
}: SeguimientoInformeDocumentProps) {
  const defaultLogo = logoUrl || `${window.location.origin}/image-insai.png`;

  const inspector = data.servidores?.[0] || {
    nombre: 'Funcionario Inspector Oficial',
    cedula: 'Oficial INSAI',
    cargo: 'Inspector Técnico Evaluador',
    oficina: 'Oficina / Sede Regional',
  };

  const cumplio = Boolean(data.recomendaciones_cumplidas);

  return (
    <Document>
      {/* ─── PÁGINA 1: ACTA CIRCUNSTANCIADA ─── */}
      <Page size="LETTER" style={styles.page}>
        {/* 1. MEMBRETE INSTITUCIONAL */}
        {/* <View style={styles.headerContainer}>
          <Image src={defaultLogo} style={styles.logoImg} />
          <Text style={styles.headerTextCountry}>REPÚBLICA BOLIVARIANA DE VENEZUELA</Text>
          <Text style={styles.headerTextMinistry}>
            MINISTERIO DEL PODER POPULAR PARA LA AGRICULTURA PRODUCTIVA Y TIERRAS
          </Text>
          <Text style={styles.headerTextInstitute}>
            INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)
          </Text>
          <Text style={styles.headerTextCoord}>
            DIRECCIÓN DE SALUD AGRÍCOLA INTEGRAL • {inspector.oficina || 'COORDINACIÓN REGIONAL'}
          </Text>
          <View style={styles.headerDivider} />
        </View> */}

        {/* 2. TÍTULO Y CONTROL */}
        <View style={styles.titleSection}>
          <Text style={styles.titleMain}>
            ACTA CIRCUNSTANCIADA DE SEGUIMIENTO Y CONSTATACIÓN SANITARIA
          </Text>
          <View style={styles.metaBar}>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>ACTA N°: </Text>
              {data.n_control}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>EXPEDIENTE BASE: </Text>
              {data.referencia_origen}
            </Text>
            <Text style={styles.metaText}>
              <Text style={styles.metaTextBold}>FECHA: </Text>
              {data.fecha_seguimiento}
            </Text>
          </View>
        </View>

        {/* 3. I. COMPARECENCIA Y CONSTITUCIÓN EN EL PREDIO */}
        <Text style={styles.sectionHeading}>
          I. Comparecencia y Constitución en la Unidad de Producción
        </Text>
        <Text style={styles.paragraph}>
          En la jurisdicción del Municipio <Text style={styles.bold}>{data.ubicacion?.municipio || 'S/E'}</Text>,{' '}
          Parroquia <Text style={styles.bold}>{data.ubicacion?.parroquia || 'S/E'}</Text>,{' '}
          Sector <Text style={styles.bold}>{data.ubicacion?.sector || 'S/E'}</Text>,{' '}
          Estado <Text style={styles.bold}>{data.ubicacion?.estado || 'Yaracuy'}</Text>{' '}
          {data.predio?.punto_referencia ? `(Punto de referencia: ${data.predio.punto_referencia}), ` : ', '}
          en la fecha <Text style={styles.bold}>{data.fecha_seguimiento}</Text>, se constituyó formalmente en la
          unidad de producción agropecuaria denominada <Text style={styles.bold}>«{data.predio?.nombre || 'Sin nombre'}»</Text>,
          identificada con Código INSAI del Predio: <Text style={styles.bold}>{data.predio?.codigo_insai || 'No registrado'}</Text>{' '}
          y una superficie estimada de <Text style={styles.bold}>{data.predio?.hectareas || 'N/A'}</Text>,
          propiedad y/o administrada por el ciudadano(a) <Text style={styles.bold}>{data.productor?.nombre || 'No especificado'}</Text>,
          titular de la Cédula de Identidad / RIF N° <Text style={styles.bold}>{data.productor?.ci_rif || 'N/A'}</Text>;{' '}
          el funcionario público actuante ciudadano <Text style={styles.bold}>{inspector.nombre}</Text>,
          titular de la C.I. <Text style={styles.bold}>{inspector.cedula}</Text>, en su condición de{' '}
          <Text style={styles.bold}>{inspector.cargo}</Text>, adscrito a la dependencia{' '}
          <Text style={styles.bold}>{inspector.oficina || 'Sede Regional'}</Text> del Instituto Nacional de Salud Agrícola Integral (INSAI),
          a los fines de dar apertura formal a la presente diligencia técnica.
        </Text>

        {/* 4. II. DEL OBJETO Y ANTECEDENTES DE LA ACTUACIÓN */}
        <Text style={styles.sectionHeading}>
          II. Del Objeto de la Actuación y Antecedentes Técnicos
        </Text>
        <Text style={styles.paragraph}>
          La presente diligencia tiene como objeto verificar y constatar el cumplimiento efectivo de las medidas técnicas,
          observaciones zoosanitarias y requerimientos legales impuestos en la inspección precedente identificada con el número{' '}
          <Text style={styles.bold}>{data.referencia_origen}</Text>, en la cual se registraron los siguientes antecedentes:
        </Text>

        <View style={styles.formalQuoteBox}>
          <Text style={styles.quoteLabel}>Aspectos y Observaciones Precedentes:</Text>
          <Text style={styles.quoteValue}>
            {data.aspectos_previos || 'Sin no conformidades críticas asentadas en el procedimiento inicial.'}
          </Text>
          <Text style={styles.quoteLabel}>Medidas y Recomendaciones Sanitarias Dictadas:</Text>
          <Text style={styles.quoteValue}>
            {data.medidas_previas || 'Mantenimiento del plan sanitario preventivo y observancia de la normativa legal vigente.'}
          </Text>
        </View>

        {/* 5. III. DE LOS HECHOS CONSTATADOS Y HALLAZGOS EN CAMPO */}
        <Text style={styles.sectionHeading}>
          III. De los Hechos Constatados y Hallazgos en Campo
        </Text>
        <Text style={styles.paragraph}>
          Habiéndose practicado la inspección ocular, el recorrido técnico por las instalaciones, mangas de manejo y áreas de producción,
          en presencia del administrado o su representante legal, la comisión técnica del INSAI deja formal constancia de los
          siguientes hechos y evidencias verificadas:
        </Text>
        <View style={styles.formalQuoteBox}>
          <Text style={styles.quoteValue}>{data.hallazgos_seguimiento}</Text>
        </View>

        {/* 6. IV. DICTAMEN TÉCNICO Y DISPOSICIÓN SANITARIA */}
        <Text style={styles.sectionHeading}>
          IV. Dictamen Técnico y Disposición Sanitaria Oficial
        </Text>
        <View style={styles.resolutionBox}>
          <Text style={styles.resolutionTitle}>
            DICTAMEN: {data.dictamen?.titulo || 'EVALUACIÓN TÉCNICA OFICIAL'}
          </Text>
          <Text style={styles.resolutionStatusTag}>
            ESTADO DE LAS MEDIDAS: {cumplio ? 'CUMPLIDAS A CABALIDAD (CONFORME)' : 'NO CUMPLIDAS / MEDIDAS PENDIENTES'}
            {'  '}|{'  '}ESTATUS: {data.status}
          </Text>
          <Text style={styles.resolutionText}>
            {data.dictamen?.detalle || 'Sin observaciones complementarias por la comisión técnica actuante.'}
          </Text>
        </View>

        {/* 7. V. DEL CIERRE Y NOTIFICACIÓN FORMAL */}
        <Text style={styles.paragraph}>
          Leída que fue la presente acta a los comparecientes y enterados de su contenido y alcance legal, se ratifican
          en todas sus partes en señal de conformidad y notificación formal, suscribiéndose en dos (2) ejemplares de un mismo tenor y efecto.
        </Text>

        {/* 8. SECCIÓN DE FIRMAS */}
        <View style={styles.signSection}>
          <View style={styles.signGrid}>
            <View style={styles.signCol}>
              <View style={styles.signLine} />
              <Text style={styles.signRoleTitle}>POR EL INSAI (FUNCIONARIO ACTUANTE)</Text>
              <Text style={styles.signName}>{inspector.nombre}</Text>
              <Text style={styles.signDetail}>C.I. {inspector.cedula} • {inspector.cargo}</Text>
              <Text style={styles.signDetail}>{inspector.oficina || 'Instituto Nacional de Salud Agrícola Integral'}</Text>
              <View style={styles.stampBox}>
                <Text style={styles.stampText}>Sello Oficial de la Dependencia</Text>
              </View>
            </View>

            <View style={styles.signCol}>
              <View style={styles.signLine} />
              <Text style={styles.signRoleTitle}>POR EL ADMINISTRADO (NOTIFICADO)</Text>
              <Text style={styles.signName}>{data.productor?.nombre || 'Propietario / Representante'}</Text>
              <Text style={styles.signDetail}>C.I. / RIF: {data.productor?.ci_rif || 'N/A'}</Text>
              <Text style={styles.signDetail}>Titular / Encargado de la Unidad de Producción</Text>
              <View style={styles.stampBox}>
                <Text style={styles.stampText}>Firma / Huella Dactilar</Text>
              </View>
            </View>
          </View>
        </View>

        {/* PIE DE PÁGINA */}
        <View style={styles.footer} fixed>
          <Text>Documento Oficial del Instituto Nacional de Salud Agrícola Integral (INSAI) • SICIC</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>
      </Page>

      {/* ─── PÁGINA 2: ANEXO FOTOGRÁFICO (OPCIONAL SI HAY FOTOS) ─── */}
      {data.fotos && data.fotos.length > 0 && (
        <Page size="LETTER" style={styles.page}>
          <View style={styles.anexoHeader}>
            <Image src={defaultLogo} style={[styles.logoImg, { height: 38, width: 100 }]} />
            <Text style={styles.anexoTitle}>
              ANEXO FOTOGRÁFICO • EVIDENCIAS TÉCNICAS EN CAMPO
            </Text>
            <Text style={styles.anexoSubtitle}>
              Soporte Gráfico del Acta N° {data.n_control} • Unidad de Producción: «{data.predio?.nombre || 'Predio'}»
            </Text>
          </View>

          <View style={styles.anexoGrid}>
            {data.fotos.map((f, idx) => (
              <View key={f.id || idx} style={styles.anexoCard}>
                <Image src={f.dataUrl} style={styles.anexoImg} />
                <Text style={styles.anexoCaption}>
                  Registro Fotográfico N° {idx + 1} — Inspección de Seguimiento en Sitio
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text>Documento Oficial del Instituto Nacional de Salud Agrícola Integral (INSAI) • SICIC</Text>
            <Text
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          </View>
        </Page>
      )}
    </Document>
  );
}

export default SeguimientoInformeDocument;
