import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { resolveMediaUrl } from '@/lib/media-url';

const styles = StyleSheet.create({
  page: {
    padding: 24,
    paddingBottom: 36,
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
  },
  headerRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#1B5E20',
    backgroundColor: '#F1F8E9',
    borderRadius: 4,
    marginBottom: 8,
  },
  headerLogo: {
    width: '30%',
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoImg: {
    width: 120,
    height: 44,
    objectFit: 'contain',
  },
  headerCenter: {
    width: '45%',
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    width: '25%',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  instName: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  subInstName: {
    fontSize: 6.5,
    color: '#33691E',
    textAlign: 'center',
    marginTop: 2,
  },
  titleBar: {
    backgroundColor: '#1B5E20',
    color: '#ffffff',
    padding: 5,
    borderRadius: 3,
    marginBottom: 10,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#1B5E20',
    backgroundColor: '#E8F5E9',
    padding: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2E7D32',
    marginTop: 8,
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  col6: {
    width: '50%',
    paddingRight: 6,
    marginBottom: 4,
  },
  col12: {
    width: '100%',
    marginBottom: 4,
  },
  label: {
    fontSize: 6.5,
    color: '#555555',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  val: {
    fontSize: 8,
    color: '#1a1a1a',
    marginTop: 1,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  cardTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2E7D32',
    marginBottom: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#C8E6C9',
    paddingBottom: 2,
  },
  hierroContainer: {
    width: 65,
    height: 65,
    borderWidth: 1,
    borderColor: '#1B5E20',
    borderRadius: 4,
    padding: 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hierroImg: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  table: {
    width: '100%',
    marginTop: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F8E9',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E0E0E0',
  },
  th: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#1B5E20',
    padding: 4,
  },
  td: {
    fontSize: 7,
    padding: 4,
    color: '#212121',
  },
  signSection: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  signBox: {
    width: '40%',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 6,
    alignItems: 'center',
  },
  signText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6.5,
    color: '#777777',
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    paddingTop: 4,
  },
});

export interface ProductorFichaData {
  id: number;
  cedula_rif: string;
  nombre: string;
  codigo_runsai?: string | null;
  telefono?: string | null;
  email?: string | null;
  direccion_fiscal?: string | null;
  created_at?: string;
  propiedades?: {
    id: number;
    codigo_insai?: string | null;
    nombre: string;
    rif?: string | null;
    punto_referencia?: string | null;
    hectareas_totales?: number | string | null;
    status?: string | null;
    hierro_data_url?: string | null;
    t_propiedad?: { nombre: string } | null;
    propiedad_hierro?: { num_reg_hierro?: string; num_reg_ganadero?: string; hierro_img_url?: string }[] | null;
    propiedad_ubicacion?: {
      sectores?: {
        nombre?: string;
        parroquias?: {
          nombre?: string;
          municipios?: {
            nombre?: string;
            estados?: {
              nombre?: string;
            };
          };
        };
      };
    }[] | null;
    propiedad_cultivo?: {
      superficie?: number | string | null;
      cantidad?: number | string | null;
      cultivo?: { nombre: string } | null;
    }[] | null;
    propiedad_animales?: {
      cantidad?: number | string | null;
      animales?: { nombre: string } | null;
    }[] | null;
  }[] | null;
  solicitudes?: {
    id: number;
    codigo?: string | null;
    estatus?: string | null;
    prioridad?: string | null;
    created_at?: string;
    t_solicitud?: { nombre: string } | null;
  }[] | null;
}

export function ProductorFichaDocument({
  productor,
  logoUrl,
  generadoEl,
}: {
  productor: ProductorFichaData;
  logoUrl: string;
  generadoEl: string;
}) {
  const propiedades = productor.propiedades || [];
  const solicitudes = productor.solicitudes || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL</Text>
            <Text style={styles.subInstName}>SISTEMA DE INFORMACIÓN PARA EL CONTROL DE INSPECCIONES DE CAMPO (SICIC)</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6.5, color: '#666666' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#1B5E20' }}>{generadoEl}</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>EXPEDIENTE OFICIAL DEL PRODUCTOR / CLIENTE</Text>
        </View>

        {/* Datos Personales y Fiscales */}
        <Text style={styles.sectionTitle}>1. INFORMACIÓN PERSONAL Y FISCAL DEL PRODUCTOR</Text>
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>Nombres / Razón Social:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{productor.nombre}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Cédula / RIF:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold', color: '#1B5E20' }]}>{productor.cedula_rif}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Código RUNSAI:</Text>
            <Text style={styles.val}>{productor.codigo_runsai || 'No especificado'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Teléfono de Contacto:</Text>
            <Text style={styles.val}>{productor.telefono || 'No especificado'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Correo Electrónico:</Text>
            <Text style={styles.val}>{productor.email || 'No especificado'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Propiedades Registradas:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{propiedades.length} predio(s)</Text>
          </View>
          <View style={styles.col12}>
            <Text style={styles.label}>Dirección Fiscal:</Text>
            <Text style={styles.val}>{productor.direccion_fiscal || 'No registrada'}</Text>
          </View>
        </View>

        {/* Predios / Propiedades Asociadas */}
        <Text style={styles.sectionTitle}>2. UNIDADES DE PRODUCCIÓN Y PREDIOS REGISTRADOS ({propiedades.length})</Text>
        {propiedades.length === 0 ? (
          <Text style={{ fontSize: 7.5, color: '#777777', fontStyle: 'italic', marginVertical: 4 }}>
            El productor no posee propiedades registradas actualmente.
          </Text>
        ) : (
          propiedades.map((p, idx) => {
            const ubic = p.propiedad_ubicacion?.[0]?.sectores;
            const parroquia = ubic?.parroquias;
            const municipio = parroquia?.municipios;
            const estado = municipio?.estados;

            const ubicacionTexto = [
              ubic?.nombre ? `Sector ${ubic.nombre}` : null,
              parroquia?.nombre ? `Pq. ${parroquia.nombre}` : null,
              municipio?.nombre ? `Mun. ${municipio.nombre}` : null,
              estado?.nombre ? `Edo. ${estado.nombre}` : null,
            ].filter(Boolean).join(', ') || 'Ubicación no especificada';

            const hierroImg = p.hierro_data_url || (p.propiedad_hierro?.[0]?.hierro_img_url ? resolveMediaUrl(p.propiedad_hierro[0].hierro_img_url) : null);
            const regHierro = p.propiedad_hierro?.[0]?.num_reg_hierro;
            const regGanadero = p.propiedad_hierro?.[0]?.num_reg_ganadero;

            const cultivosStr = p.propiedad_cultivo?.map((c) => `${c.cultivo?.nombre || 'Cultivo'} (${c.superficie || 0} Ha)`).join(', ') || 'Ninguno';
            const animalesStr = p.propiedad_animales?.map((a) => `${a.animales?.nombre || 'Especie'} (${a.cantidad || 0})`).join(', ') || 'Ninguno';

            return (
              <View key={p.id || idx} style={styles.card} wrap={false}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.cardTitle}>
                    {idx + 1}. {p.nombre} {p.codigo_insai ? `(${p.codigo_insai})` : ''}
                  </Text>
                  <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: p.status === 'INACTIVA' ? '#C62828' : '#2E7D32' }}>
                    {p.status || 'ACTIVA'}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.grid}>
                      <View style={styles.col6}>
                        <Text style={styles.label}>Tipo de Propiedad:</Text>
                        <Text style={styles.val}>{p.t_propiedad?.nombre || 'No especificado'}</Text>
                      </View>
                      <View style={styles.col6}>
                        <Text style={styles.label}>Superficie Total:</Text>
                        <Text style={styles.val}>{p.hectareas_totales ? `${p.hectareas_totales} Hectáreas` : 'N/A'}</Text>
                      </View>
                      <View style={styles.col12}>
                        <Text style={styles.label}>Ubicación Geográfica:</Text>
                        <Text style={styles.val}>{ubicacionTexto}</Text>
                      </View>
                      <View style={styles.col12}>
                        <Text style={styles.label}>Cultivos en Predio:</Text>
                        <Text style={styles.val}>{cultivosStr}</Text>
                      </View>
                      <View style={styles.col12}>
                        <Text style={styles.label}>Inventario Animal:</Text>
                        <Text style={styles.val}>{animalesStr}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Marca de Hierro if present */}
                  {(hierroImg || regHierro || regGanadero) && (
                    <View style={{ alignItems: 'center', justifyContent: 'center', width: 80 }}>
                      <Text style={[styles.label, { marginBottom: 2 }]}>HIERRO / MARCA</Text>
                      {hierroImg ? (
                        <View style={styles.hierroContainer}>
                          <Image src={hierroImg} style={styles.hierroImg} />
                        </View>
                      ) : (
                        <View style={[styles.hierroContainer, { backgroundColor: '#F5F5F5' }]}>
                          <Text style={{ fontSize: 6, color: '#999999', textAlign: 'center' }}>Sin Imagen</Text>
                        </View>
                      )}
                      {regHierro && <Text style={{ fontSize: 6, color: '#333333', marginTop: 2 }}>N° Reg: {regHierro}</Text>}
                      {regGanadero && <Text style={{ fontSize: 6, color: '#333333' }}>N° Gan: {regGanadero}</Text>}
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        {/* Historial de Solicitudes */}
        <Text style={styles.sectionTitle}>3. HISTORIAL DE SOLICITUDES Y TRÁMITES ({solicitudes.length})</Text>
        {solicitudes.length === 0 ? (
          <Text style={{ fontSize: 7.5, color: '#777777', fontStyle: 'italic', marginVertical: 4 }}>
            No registra solicitudes en el sistema.
          </Text>
        ) : (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: '25%' }]}>CÓDIGO</Text>
              <Text style={[styles.th, { width: '35%' }]}>TIPO DE TRÁMITE</Text>
              <Text style={[styles.th, { width: '20%' }]}>ESTATUS</Text>
              <Text style={[styles.th, { width: '20%' }]}>PRIORIDAD</Text>
            </View>
            {solicitudes.slice(0, 10).map((s, i) => (
              <View key={s.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{s.codigo || `SOL-${s.id}`}</Text>
                <Text style={[styles.td, { width: '35%' }]}>{s.t_solicitud?.nombre || 'General'}</Text>
                <Text style={[styles.td, { width: '20%', fontFamily: 'Helvetica-Bold' }]}>{s.estatus || 'CREADA'}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{s.prioridad || 'MEDIA'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signSection} wrap={false}>
          <View style={styles.signBox}>
            <Text style={styles.signText}>FIRMA DEL PRODUCTOR / SOLICITANTE</Text>
            <Text style={{ fontSize: 6, color: '#666666', marginTop: 2 }}>C.I. / RIF: {productor.cedula_rif}</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signText}>AUTORIZADO POR INSAI</Text>
            <Text style={{ fontSize: 6, color: '#666666', marginTop: 2 }}>Firma y Sello Oficial</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
