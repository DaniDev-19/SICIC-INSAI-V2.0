import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { ActaSiloReporteDto } from './types';

const styles = StyleSheet.create({
  page: {
    padding: 22,
    paddingBottom: 36,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
  },
  headerLogo: {
    width: '28%',
    minHeight: 58,
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoImg: {
    width: 110,
    height: 46,
    objectFit: 'contain',
  },
  headerCenter: {
    width: '36%',
    minHeight: 58,
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: '36%',
    minHeight: 58,
    padding: 6,
    justifyContent: 'center',
  },
  titleBar: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
  },
  metaCell: {
    width: '50%',
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  metaCellLast: {
    width: '50%',
    padding: 4,
  },
  sectionTitle: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  sectionBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    padding: 4,
    marginBottom: 2,
  },
  rowSplit: {
    flexDirection: 'row',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
  },
  colBox: {
    flex: 1,
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  colBoxLast: {
    flex: 1,
    padding: 4,
  },
  labelBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
  },
  value: {
    marginTop: 2,
    fontSize: 7.5,
  },
  linedBox: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    padding: 4,
    minHeight: 52,
    marginBottom: 4,
  },
  line: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#cccccc',
    marginBottom: 6,
    paddingBottom: 1,
  },
  fotoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  foto: {
    width: 120,
    height: 88,
    objectFit: 'cover',
    borderWidth: 1,
    borderColor: '#000',
  },
  signRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    marginBottom: 4,
  },
  signBox: {
    width: '50%',
    height: 56,
    borderWidth: 1,
    borderColor: '#000',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 4,
  },
  signLabel: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Oblique',
    color: '#555',
  },
  pageFooter: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 6.5,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
    paddingTop: 4,
  },
  footerLogo: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
});

function LinedContent({ text, lines = 5 }: { text: string; lines?: number }) {
  const rows = Array.from({ length: lines }, (_, i) => (
    <View key={i} style={styles.line}>
      {i === 0 ? <Text style={{ fontSize: 7.5 }}>{text}</Text> : null}
    </View>
  ));
  return <View>{rows}</View>;
}

function SiloHeader({
  data,
  logoUrl,
  page,
}: {
  data: ActaSiloReporteDto;
  logoUrl: string;
  page: number;
}) {
  return (
    <View>
      <View style={styles.headerRow}>
        <View style={styles.headerLogo}>
          <Image src={logoUrl} style={styles.headerLogoImg} />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.labelBold}>ORGANISMO:</Text>
          <Text style={{ fontSize: 8, marginTop: 2, textAlign: 'center', fontFamily: 'Helvetica-Bold' }}>INSAI</Text>
          <Text style={{ fontSize: 6.5, marginTop: 1, textAlign: 'center', color: '#555' }}>Salud Agrícola Integral</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.labelBold}>SEMANA EPIDEMIOLÓGICA:</Text>
          <Text style={styles.value}>{data.semana_epid}</Text>
        </View>
      </View>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>ACTA DE INSPECCIÓN Y REGISTRO DE SILOS Y ALMACENES</Text>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaCell}>
          <Text style={styles.labelBold}>N° DE CONTROL:</Text>
          <Text style={styles.value}>{data.n_control}</Text>
        </View>
        <View style={styles.metaCellLast}>
          <Text style={styles.labelBold}>PÁGINA:</Text>
          <Text style={styles.value}>{page} de 2</Text>
        </View>
      </View>
    </View>
  );
}

function SiloFooter({
  data,
  page,
  logoUrl,
}: {
  data: ActaSiloReporteDto;
  page: number;
  logoUrl: string;
}) {
  return (
    <View style={styles.pageFooter}>
      <Image src={logoUrl} style={styles.footerLogo} />
      <Text>
        SICIC • INSAI SILOS • {data.generado_el} • Página {page} de 2
      </Text>
    </View>
  );
}

export function ActaSiloDocument({
  data,
  logoUrl,
}: {
  data: ActaSiloReporteDto;
  logoUrl: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <SiloHeader data={data} logoUrl={logoUrl} page={1} />

        <Text style={styles.sectionTitle}>1. JUSTIFICACIÓN LEGAL</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 6.5, textAlign: 'justify', lineHeight: 1.25 }}>
            {data.justificacion_legal}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>2. DATOS DEL SERVIDOR PÚBLICO ACTUANTE</Text>
        <View style={styles.sectionBody}>
          {[0, 1, 2].map((i) => {
            const s = data.servidores[i];
            return (
              <Text key={i} style={{ fontSize: 7.5, marginBottom: 2 }}>
                {s
                  ? `${s.orden}) ${s.nombre} — CI: ${s.cedula}`
                  : `${i + 1}) _________________________________________________`}
              </Text>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>3. IDENTIFICACIÓN DEL PROPIETARIO O REPRESENTANTE LEGAL</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Propietario / Razón Social: </Text>
            {data.propietario.nombre || '—'}
          </Text>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Cédula / RIF: </Text>
            {data.propietario.cedula || '—'}
            {'    '}
            <Text style={styles.labelBold}>Código RUNSAI: </Text>
            {data.propietario.runsai || '—'}
            {'    '}
            <Text style={styles.labelBold}>Teléfono: </Text>
            {data.propietario.telefono || '—'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>4. DATOS Y UBICACIÓN DEL ESTABLECIMIENTO DE ALMACENAMIENTO (SILO / GALPÓN)</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Nombre del Establecimiento: </Text>
            {data.lugar.nombre}
            {'    '}
            <Text style={styles.labelBold}>RIF Comercial: </Text>
            {data.lugar.rif}
          </Text>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Sector / Dirección: </Text>
            {data.lugar_ubicacion || `${data.lugar.calle}, Sector ${data.lugar.sector}`}
          </Text>
          <Text style={{ fontSize: 7.5 }}>
            <Text style={styles.labelBold}>Municipio: </Text>
            {data.lugar.municipio || '—'}
            {'    '}
            <Text style={styles.labelBold}>Parroquia: </Text>
            {data.lugar.parroquia || '—'}
            {'    '}
            <Text style={styles.labelBold}>Estado: </Text>
            {data.lugar.estado || '—'}
            {'    '}
            <Text style={styles.labelBold}>Tipo: </Text>
            {data.lugar.tipo || '—'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>5. DATOS DE CAPACIDAD Y CONTROL DE LA INFRAESTRUCTURA</Text>
        <View style={styles.sectionBody}>
          <View style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>N° Silos: </Text>
              {data.n_silos}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>N° Galpones: </Text>
              {data.n_galpones}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Evento Notificado: </Text>
              {data.evento}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 2 }}>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Cap. Instalada: </Text>
              {data.c_instalada}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Cap. Operativa: </Text>
              {data.c_operativa}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Cap. Almacenamiento: </Text>
              {data.c_almacenamiento}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>6. REGISTRO DE VOLÚMENES Y AFECTACIÓN EPIDEMIOLÓGICA</Text>
        <View style={styles.sectionBody}>
          <View style={{ flexDirection: 'row', marginBottom: 2 }}>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Unidad de Medida: </Text>
              {data.unidad_medida}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Fecha Notificación: </Text>
              {data.fecha_notificacion}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 2, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 2 }}>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Cantidad Nacional: </Text>
              {data.cant_nacional.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Cantidad Importada: </Text>
              {data.cant_importado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', marginTop: 3, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 2 }}>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Cantidad Afectada: </Text>
              {data.cant_afectado.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Text>
            <Text style={{ flex: 1, fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Porcentaje Afectación: </Text>
              {data.cant_afectado_porcentaje.toFixed(2)}%
            </Text>
          </View>
          <View style={{ marginTop: 3, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 2 }}>
            <Text style={{ fontSize: 7.5 }}>
              <Text style={styles.labelBold}>Destino y Objetivo del Rubro: </Text>
              {data.destino_objetivo}
            </Text>
          </View>
        </View>

        <SiloFooter data={data} page={1} logoUrl={logoUrl} />

        <View break />

        <SiloHeader data={data} logoUrl={logoUrl} page={2} />

        <Text style={styles.sectionTitle}>7. ASPECTOS CONSTATADOS EN LA VISITA (OBSERVACIONES)</Text>
        <View style={styles.linedBox}>
          <LinedContent text={data.observaciones} lines={6} />
        </View>

        <Text style={styles.sectionTitle}>8. MEDIDAS Y RECOMENDACIONES ORDENADAS</Text>
        <View style={styles.linedBox}>
          <LinedContent text={data.medidas_recomendadas} lines={5} />
        </View>

        <Text style={styles.sectionTitle}>9. EVIDENCIAS FOTOGRÁFICAS REGISTRADAS</Text>
        <View style={styles.sectionBody}>
          {data.fotos.length > 0 ? (
            <View style={styles.fotoGrid}>
              {data.fotos.map((f) => (
                <Image key={f.id} src={f.dataUrl} style={styles.foto} />
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 7.5, color: '#666' }}>Sin evidencias fotográficas cargadas en esta inspección.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>10. CIERRE DE LA PLANILLA / ACTA</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.3, textAlign: 'justify' }}>
            Se levanta y formaliza la presente planilla de control e inspección de Silos y Almacenamientos, por duplicado, a los {data.cierre.dia || '_____'} días del mes de {data.cierre.mes || '_______________'} del año {data.cierre.anio || '_____'} en {data.cierre.lugar}.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>11. FIRMAS DE CONFORMIDAD Y SELLOS OFICIALES</Text>
        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Inspector / Servidor Público INSAI</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Representante del Establecimiento / Silos</Text>
          </View>
        </View>

        <SiloFooter data={data} page={2} logoUrl={logoUrl} />
      </Page>
    </Document>
  );
}
