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
    padding: 28,
    paddingBottom: 32,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // ─── ENCABEZADO INSTITUCIONAL MINIMALISTA ────────────────────────
  headerTable: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8,
  },
  headerLogoCell: {
    width: '26%',
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImg: {
    width: 90,
    height: 38,
    objectFit: 'contain',
  },
  headerCenterCell: {
    width: '48%',
    padding: 5,
    borderRightWidth: 1,
    borderColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countryText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  ministryText: {
    fontSize: 6,
    fontFamily: 'Helvetica',
    textAlign: 'center',
    marginTop: 1,
  },
  instituteText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginTop: 1,
  },
  headerRightCell: {
    width: '26%',
    padding: 5,
    justifyContent: 'center',
  },
  controlLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
  },
  controlValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginTop: 1,
  },

  // ─── TÍTULO DEL DOCUMENTO ─────────────────────────────────────────
  titleBar: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 4,
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ─── RESUMEN DEL PROCEDIMIENTO ───────────────────────────────────
  metaTable: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#cbd5e1',
  },
  metaRowLast: {
    flexDirection: 'row',
  },
  metaCell: {
    padding: 4,
    borderRightWidth: 0.5,
    borderRightColor: '#cbd5e1',
  },
  metaCellLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  metaCellValue: {
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    marginTop: 1,
  },

  // ─── SECCIÓN TABULAR ─────────────────────────────────────────────
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#000000',
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    textTransform: 'uppercase',
  },
  sectionBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000000',
    padding: 6,
    marginBottom: 8,
  },

  // Grid de datos
  dataRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  colHalf: {
    width: '50%',
    paddingRight: 4,
  },
  colThird: {
    width: '33.33%',
    paddingRight: 4,
  },
  fieldLabel: {
    fontSize: 6.8,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
  },
  fieldValue: {
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    marginTop: 1,
  },

  // ─── TABLA DE CONSTATACIÓN TÉCNICA (ANTECEDENTES VS SEGUIMIENTO) ──
  compTable: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 8,
  },
  compTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingVertical: 4,
  },
  compHeaderLeft: {
    width: '50%',
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
  },
  compHeaderRight: {
    width: '50%',
    paddingHorizontal: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
  },
  compTableBody: {
    flexDirection: 'row',
  },
  compBodyLeft: {
    width: '50%',
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  compBodyRight: {
    width: '50%',
    padding: 6,
  },
  textContent: {
    fontSize: 7.2,
    lineHeight: 1.35,
    textAlign: 'justify',
    marginTop: 2,
    marginBottom: 5,
  },

  // ─── DICTAMEN TÉCNICO OFICIAL ────────────────────────────────────
  dictamenBox: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 6,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  dictamenHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  dictamenText: {
    fontSize: 7.2,
    lineHeight: 1.35,
    textAlign: 'justify',
  },

  // ─── FOTOS ───────────────────────────────────────────────────────
  fotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  fotoItem: {
    width: 110,
    height: 75,
    borderWidth: 1,
    borderColor: '#000000',
    objectFit: 'cover',
  },

  // ─── FIRMAS ──────────────────────────────────────────────────────
  signTable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  signCell: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#000000',
    padding: 6,
    alignItems: 'center',
  },
  signLine: {
    width: '80%',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    marginTop: 26,
    marginBottom: 4,
  },
  signTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  signSubtitle: {
    fontSize: 6.5,
    fontFamily: 'Helvetica',
    color: '#444444',
    textAlign: 'center',
    marginTop: 1,
  },
  signFoot: {
    fontSize: 6,
    fontFamily: 'Helvetica-Oblique',
    color: '#666666',
    marginTop: 2,
  },

  // ─── PIE DE PÁGINA ───────────────────────────────────────────────
  pageFooter: {
    position: 'absolute',
    bottom: 14,
    left: 28,
    right: 28,
    borderTopWidth: 0.5,
    borderTopColor: '#cccccc',
    paddingTop: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6,
    color: '#666666',
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
    oficina: 'Sede Regional',
  };

  const cumplio = Boolean(data.recomendaciones_cumplidas);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* 1. ENCABEZADO INSTITUCIONAL */}
        <View style={styles.headerTable}>
          <View style={styles.headerLogoCell}>
            <Image src={defaultLogo} style={styles.logoImg} />
          </View>
          <View style={styles.headerCenterCell}>
            <Text style={styles.countryText}>REPÚBLICA BOLIVARIANA DE VENEZUELA</Text>
            <Text style={styles.ministryText}>MINISTERIO DEL PODER POPULAR PARA LA AGRICULTURA PRODUCTIVA Y TIERRAS</Text>
            <Text style={styles.instituteText}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
          </View>
          <View style={styles.headerRightCell}>
            <Text style={styles.controlLabel}>N° DE CONTROL:</Text>
            <Text style={styles.controlValue}>{data.n_control}</Text>
            <Text style={[styles.controlLabel, { marginTop: 3 }]}>FECHA DE VISITA:</Text>
            <Text style={styles.fieldValue}>{data.fecha_seguimiento}</Text>
          </View>
        </View>

        {/* 2. TÍTULO */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>INFORME TÉCNICO DE SEGUIMIENTO Y CONSTATACIÓN SANITARIA</Text>
        </View>

        {/* 3. RESUMEN DEL EXPEDIENTE */}
        <View style={styles.metaTable}>
          <View style={styles.metaRow}>
            <View style={[styles.metaCell, { width: '40%' }]}>
              <Text style={styles.metaCellLabel}>Inspección Base / Origen:</Text>
              <Text style={styles.metaCellValue}>{data.referencia_origen}</Text>
            </View>
            <View style={[styles.metaCell, { width: '30%' }]}>
              <Text style={styles.metaCellLabel}>Estado del Registro:</Text>
              <Text style={styles.metaCellValue}>{data.status}</Text>
            </View>
            <View style={[styles.metaCell, { width: '30%', borderRightWidth: 0 }]}>
              <Text style={styles.metaCellLabel}>Medidas Sanitarias:</Text>
              <Text style={[styles.metaCellValue, { fontFamily: 'Helvetica-Bold' }]}>
                {cumplio ? 'CUMPLIDAS AL 100%' : 'PENDIENTES / NO CUMPLIDAS'}
              </Text>
            </View>
          </View>
          <View style={styles.metaRowLast}>
            <View style={[styles.metaCell, { width: '100%', borderRightWidth: 0 }]}>
              <Text style={styles.metaCellLabel}>Oficina / Coordinación Regional Ejecutora:</Text>
              <Text style={styles.metaCellValue}>{inspector.oficina || 'Sede Regional'}</Text>
            </View>
          </View>
        </View>

        {/* 4. IDENTIFICACIÓN DEL PREDIO Y ADMINISTRADO */}
        <Text style={styles.sectionHeader}>I. Identificación de la Unidad de Producción y Administrado</Text>
        <View style={styles.sectionBody}>
          <View style={styles.dataRow}>
            <View style={styles.colHalf}>
              <Text style={styles.fieldLabel}>Nombre del Predio / Instalación:</Text>
              <Text style={styles.fieldValue}>{data.predio?.nombre || 'No especificado'}</Text>
            </View>
            <View style={styles.colHalf}>
              <Text style={styles.fieldLabel}>Código INSAI del Predio:</Text>
              <Text style={styles.fieldValue}>{data.predio?.codigo_insai || 'No registrado'}</Text>
            </View>
          </View>

          <View style={styles.dataRow}>
            <View style={styles.colThird}>
              <Text style={styles.fieldLabel}>Productor / Titular:</Text>
              <Text style={styles.fieldValue}>{data.productor?.nombre || 'No especificado'}</Text>
            </View>
            <View style={styles.colThird}>
              <Text style={styles.fieldLabel}>Cédula / RIF:</Text>
              <Text style={styles.fieldValue}>{data.productor?.ci_rif || 'N/A'}</Text>
            </View>
            <View style={styles.colThird}>
              <Text style={styles.fieldLabel}>Superficie:</Text>
              <Text style={styles.fieldValue}>{data.predio?.hectareas || 'N/A'}</Text>
            </View>
          </View>

          <View style={[styles.dataRow, { marginBottom: 0 }]}>
            <View style={{ width: '100%' }}>
              <Text style={styles.fieldLabel}>Ubicación Geográfica:</Text>
              <Text style={styles.fieldValue}>
                Sector: {data.ubicacion?.sector} | Parroquia: {data.ubicacion?.parroquia} | Municipio: {data.ubicacion?.municipio} | Estado: {data.ubicacion?.estado}
              </Text>
            </View>
          </View>
        </View>

        {/* 5. TABLA COMPARATIVA: ANTECEDENTES VS CONSTATACIÓN ACTUAL */}
        <View style={styles.compTable}>
          <View style={styles.compTableHeader}>
            <Text style={styles.compHeaderLeft}>1. Inspección Precedente (Antecedentes)</Text>
            <Text style={styles.compHeaderRight}>2. Visita de Seguimiento (Constatación Actual)</Text>
          </View>

          <View style={styles.compTableBody}>
            {/* Izquierda: Precedente */}
            <View style={styles.compBodyLeft}>
              <Text style={styles.fieldLabel}>Aspectos Observados Originalmente:</Text>
              <Text style={styles.textContent}>
                {data.aspectos_previos || 'Sin no conformidades críticas registradas en la visita inicial.'}
              </Text>

              <Text style={styles.fieldLabel}>Medidas Técnicas / Sanitarias Ordenadas:</Text>
              <Text style={styles.textContent}>
                {data.medidas_previas || 'Plan de vigilancia sanitaria y cumplimiento normativo ordinario.'}
              </Text>
            </View>

            {/* Derecha: Seguimiento Actual */}
            <View style={styles.compBodyRight}>
              <Text style={styles.fieldLabel}>Estado de Cumplimiento Técnico:</Text>
              <Text style={[styles.textContent, { fontFamily: 'Helvetica-Bold' }]}>
                {cumplio
                  ? 'Conforme: Las medidas ordenadas fueron subsanadas en su totalidad.'
                  : 'No Conforme: Se constató incumplimiento o medidas pendientes.'}
              </Text>

              <Text style={styles.fieldLabel}>Hallazgos Técnicos Verificados en Campo:</Text>
              <Text style={styles.textContent}>{data.hallazgos_seguimiento}</Text>
            </View>
          </View>
        </View>

        {/* 6. DICTAMEN TÉCNICO OFICIAL */}
        <View style={styles.dictamenBox}>
          <Text style={styles.dictamenHeader}>{data.dictamen?.titulo}</Text>
          <Text style={styles.dictamenText}>{data.dictamen?.detalle}</Text>
        </View>

        {/* 7. REGISTRO FOTOGRÁFICO */}
        {data.fotos && data.fotos.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>II. Registro Fotográfico de la Visita</Text>
            <View style={[styles.sectionBody, { minHeight: 80 }]}>
              <View style={styles.fotoGrid}>
                {data.fotos.slice(0, 4).map((f, idx) => (
                  <Image key={f.id || idx} src={f.dataUrl} style={styles.fotoItem} />
                ))}
              </View>
            </View>
          </>
        )}

        {/* 8. FIRMAS OFICIALES */}
        <View style={styles.signTable}>
          <View style={styles.signCell}>
            <View style={styles.signLine} />
            <Text style={styles.signTitle}>{inspector.nombre}</Text>
            <Text style={styles.signSubtitle}>C.I. {inspector.cedula} | {inspector.cargo}</Text>
            <Text style={styles.signFoot}>Funcionario Técnico Evaluador - INSAI</Text>
          </View>

          <View style={styles.signCell}>
            <View style={styles.signLine} />
            <Text style={styles.signTitle}>{data.productor?.nombre || 'Productor / Administrado'}</Text>
            <Text style={styles.signSubtitle}>C.I. / RIF: {data.productor?.ci_rif || 'N/A'}</Text>
            <Text style={styles.signFoot}>Firma de Notificación y Enterado</Text>
          </View>
        </View>

        {/* 9. PIE DE PÁGINA */}
        <View style={styles.pageFooter}>
          <Text>Documento Oficial emitido por el Sistema Integral de Control y Certificación (SICIC - INSAI)</Text>
          <Text>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}

export default SeguimientoInformeDocument;
