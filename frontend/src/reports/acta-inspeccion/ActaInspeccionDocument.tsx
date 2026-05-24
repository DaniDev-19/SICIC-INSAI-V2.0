import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { InspeccionReporteDto } from './types';

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
  statusBar: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    padding: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#000',
    padding: 3,
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textTransform: 'uppercase',
  },
  sectionBody: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#000',
    padding: 4,
    marginBottom: 4,
  },
  rowSplit: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 4,
  },
  halfBox: {
    width: '50%',
    padding: 4,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  halfBoxLast: {
    width: '50%',
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
  checkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    marginBottom: 2,
  },
  checkItemFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  checkBox: {
    width: 8,
    height: 8,
    borderWidth: 1,
    borderColor: '#000',
    marginRight: 3,
    textAlign: 'center',
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
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

function CheckItem({
  checked,
  label,
  fullWidth,
}: {
  checked: boolean;
  label: string;
  fullWidth?: boolean;
}) {
  return (
    <View style={fullWidth ? styles.checkItemFull : styles.checkItem}>
      <View style={styles.checkBox}>
        <Text>{checked ? 'X' : ''}</Text>
      </View>
      <Text style={{ fontSize: 7, flex: 1 }}>{label}</Text>
    </View>
  );
}

function LinedContent({ text, lines = 6 }: { text: string; lines?: number }) {
  const rows = Array.from({ length: lines }, (_, i) => (
    <View key={i} style={styles.line}>
      {i === 0 ? <Text style={{ fontSize: 7.5 }}>{text}</Text> : null}
    </View>
  ));
  return <View>{rows}</View>;
}

function ActaHeader({
  data,
  logoUrl,
  page,
}: {
  data: InspeccionReporteDto;
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
          <Text style={styles.labelBold}>UNIDAD:</Text>
          <Text style={{ fontSize: 8, marginTop: 2, textAlign: 'center' }}>{data.unidad}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.labelBold}>CÓDIGO INSPECCIÓN:</Text>
          <Text style={styles.value}>{data.codigo_inspeccion}</Text>
        </View>
      </View>
      <View style={styles.titleBar}>
        <Text style={styles.titleText}>ACTA DE INSPECCIÓN CON FINES DE VIGILANCIA</Text>
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
      <View style={styles.statusBar}>
        <Text style={styles.labelBold}>ESTADO DE LA INSPECCIÓN: {data.status}</Text>
      </View>
    </View>
  );
}

function ActaFooter({
  data,
  page,
  logoUrl,
}: {
  data: InspeccionReporteDto;
  page: number;
  logoUrl: string;
}) {
  return (
    <View style={styles.pageFooter}>
      <Image src={logoUrl} style={styles.footerLogo} />
      <Text>
        SICIC • INSAI • {data.generado_el} • Página {page} de 2
      </Text>
    </View>
  );
}

export function ActaInspeccionDocument({
  data,
  logoUrl,
}: {
  data: InspeccionReporteDto;
  logoUrl: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <ActaHeader data={data} logoUrl={logoUrl} page={1} />

        <Text style={styles.sectionTitle}>
          1. ÁREA A LA CUAL PERTENECE LA INSPECCIÓN (seleccione las opciones pertinentes)
        </Text>
        <View style={styles.sectionBody}>
          <View style={styles.checkRow}>
            {data.areas.map((a) => (
              <CheckItem key={a.nombre} checked={a.checked} label={a.nombre} />
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>2. JUSTIFICACIÓN LEGAL</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 6.5, textAlign: 'justify', lineHeight: 1.25 }}>
            {data.justificacion_legal}
          </Text>
        </View>

        <View style={styles.rowSplit}>
          <View style={styles.halfBox}>
            <Text style={styles.labelBold}>3. DÍA Y FECHA DE LA INSPECCIÓN</Text>
            <Text style={styles.value}>{data.fecha_inspeccion}</Text>
          </View>
          <View style={styles.halfBoxLast}>
            <Text style={styles.labelBold}>4. HORA DE LA INSPECCIÓN</Text>
            <Text style={styles.value}>{data.hora_inspeccion || '—'}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          5. DATOS DEL (LOS) SERVIDOR(ES) PÚBLICO(S) ACTUANTE(S)
        </Text>
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

        <Text style={styles.sectionTitle}>6. DATOS DEL PROPIETARIO O REPRESENTANTE LEGAL</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Nombre y Apellido: </Text>
            {data.propietario.nombre || '—'}
          </Text>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Cédula de identidad: </Text>
            {data.propietario.cedula || '—'}
            {'    '}
            <Text style={styles.labelBold}>Códigos RUNSAI: </Text>
            {data.propietario.runsai || '—'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>7. DATOS DE LA PERSONA QUE ATIENDE</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Nombre: </Text>
            {data.atendido.nombre}
            {'    '}
            <Text style={styles.labelBold}>CI: </Text>
            {data.atendido.cedula}
          </Text>
          <Text style={{ fontSize: 7.5 }}>
            <Text style={styles.labelBold}>Correo: </Text>
            {data.atendido.correo}
            {'    '}
            <Text style={styles.labelBold}>Teléfono: </Text>
            {data.atendido.telefono}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>8. DATOS DEL LUGAR DE INSPECCIÓN</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Nombre: </Text>
            {data.lugar.nombre}
            {'    '}
            <Text style={styles.labelBold}>RIF: </Text>
            {data.lugar.rif}
          </Text>
          <Text style={{ fontSize: 7.5, marginBottom: 2 }}>
            <Text style={styles.labelBold}>Calle/Avenida: </Text>
            {data.lugar.calle || '—'}
            {'    '}
            <Text style={styles.labelBold}>Sector: </Text>
            {data.lugar.sector || '—'}
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
            <Text style={styles.labelBold}>UTM N/E/Z: </Text>
            {data.lugar.utm_norte || '—'} / {data.lugar.utm_este || '—'} / {data.lugar.utm_zona || '—'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>
          9. FINALIDAD DE LA INSPECCIÓN (seleccione la o las opciones pertinentes)
        </Text>
        <View style={styles.sectionBody}>
          {data.finalidades.map((f) => (
            <CheckItem
              key={f.id}
              fullWidth
              checked={f.checked}
              label={`${f.id}. ${f.label}${f.detalle && f.checked ? `: ${f.detalle}` : ''}`}
            />
          ))}
        </View>

        <ActaFooter data={data} page={1} logoUrl={logoUrl} />

        <View break />

        <ActaHeader data={data} logoUrl={logoUrl} page={2} />

        <Text style={styles.sectionTitle}>10. ASPECTOS CONSTATADOS EN LA VISITA</Text>
        <View style={styles.linedBox}>
          <LinedContent text={data.aspectos_constatados} lines={6} />
        </View>

        <Text style={styles.sectionTitle}>11. ORDENAMIENTO DE MEDIDAS</Text>
        <View style={styles.linedBox}>
          <LinedContent text={data.medidas_ordenadas} lines={4} />
        </View>

        <Text style={styles.sectionTitle}>12. ANEXOS (EVIDENCIAS DE LA INSPECCIÓN)</Text>
        <View style={styles.sectionBody}>
          {data.fotos.length > 0 ? (
            <View style={styles.fotoGrid}>
              {data.fotos.map((f) => (
                <Image key={f.id} src={f.dataUrl} style={styles.foto} />
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 7.5, color: '#666' }}>Sin evidencias fotográficas registradas.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>13. CIERRE DEL ACTA</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.3, textAlign: 'justify' }}>
            Se levanta la presente Acta de Inspección, por duplicado, a las{' '}
            {data.cierre.hora || '_____'} (m) a los {data.cierre.dia || '_____'} días del mes de{' '}
            {data.cierre.mes || '_______________'} del año {data.cierre.anio || '_____'} en{' '}
            {data.cierre.lugar}.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>14. FIRMAS Y SELLOS</Text>
        <View style={styles.signRow}>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>Servidor(es) Público(s) INSAI</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signLabel}>En representación del lugar de inspección</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>15. VIGENCIA DEL ACTA</Text>
        <View style={styles.sectionBody}>
          <Text style={{ fontSize: 7.5, lineHeight: 1.25 }}>
            En función de los riesgos a la salud agrícola integral, la vigencia de esta Acta de
            Inspección será de: {data.vigencia_dias} día(s). Certificado fitosanitario:{' '}
            {data.posee_certificado}.
          </Text>
        </View>

        <ActaFooter data={data} page={2} logoUrl={logoUrl} />
      </Page>
    </Document>
  );
}
