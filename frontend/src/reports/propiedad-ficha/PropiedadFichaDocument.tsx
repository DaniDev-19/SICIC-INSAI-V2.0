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
  col4: {
    width: '33.33%',
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
  hierroCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 4,
    backgroundColor: '#F1F8E9',
    padding: 8,
    marginBottom: 8,
    alignItems: 'center',
    gap: 12,
  },
  hierroContainer: {
    width: 90,
    height: 90,
    borderWidth: 1,
    borderColor: '#1B5E20',
    borderRadius: 4,
    padding: 4,
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

export interface PropiedadFichaData {
  id: number;
  codigo_insai?: string | null;
  nombre: string;
  rif?: string | null;
  punto_referencia?: string | null;
  hectareas_totales?: number | string | null;
  status?: string | null;
  created_at?: string;
  hierro_data_url?: string | null;
  clientes?: {
    id: number;
    cedula_rif: string;
    nombre: string;
    codigo_runsai?: string | null;
    telefono?: string | null;
    email?: string | null;
    direccion_fiscal?: string | null;
  } | null;
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
    cultivo?: { nombre: string; t_cultivo?: { nombre: string } } | null;
  }[] | null;
  propiedad_animales?: {
    cantidad?: number | string | null;
    animales?: { nombre: string } | null;
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

export function PropiedadFichaDocument({
  propiedad,
  logoUrl,
  generadoEl,
}: {
  propiedad: PropiedadFichaData;
  logoUrl: string;
  generadoEl: string;
}) {
  const cliente = propiedad.clientes;
  const ubic = propiedad.propiedad_ubicacion?.[0]?.sectores;
  const parroquia = ubic?.parroquias;
  const municipio = parroquia?.municipios;
  const estado = municipio?.estados;

  const hierroImg = propiedad.hierro_data_url || (propiedad.propiedad_hierro?.[0]?.hierro_img_url ? resolveMediaUrl(propiedad.propiedad_hierro[0].hierro_img_url) : null);
  const regHierro = propiedad.propiedad_hierro?.[0]?.num_reg_hierro;
  const regGanadero = propiedad.propiedad_hierro?.[0]?.num_reg_ganadero;

  const cultivos = propiedad.propiedad_cultivo || [];
  const animales = propiedad.propiedad_animales || [];
  const solicitudes = propiedad.solicitudes || [];

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
          <Text style={styles.titleText}>FICHA TÉCNICA OFICIAL DE PROPIEDAD / PREDIO</Text>
        </View>

        {/* Datos Principales del Predio */}
        <Text style={styles.sectionTitle}>1. IDENTIFICACIÓN DE LA PROPIEDAD O UNIDAD DE PRODUCCIÓN</Text>
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>Nombre de la Propiedad / Predio:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold', fontSize: 9 }]}>{propiedad.nombre}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Código INSAI:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold', color: '#1B5E20' }]}>{propiedad.codigo_insai || 'Sin Código'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>RIF de la Propiedad:</Text>
            <Text style={styles.val}>{propiedad.rif || 'No posee'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Tipo de Propiedad:</Text>
            <Text style={styles.val}>{propiedad.t_propiedad?.nombre || 'No especificado'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Superficie Total (Ha):</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{propiedad.hectareas_totales ? `${propiedad.hectareas_totales} Hectáreas` : 'N/A'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Estatus Operativo:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold', color: propiedad.status === 'INACTIVA' ? '#C62828' : '#2E7D32' }]}>{propiedad.status || 'ACTIVA'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Punto de Referencia:</Text>
            <Text style={styles.val}>{propiedad.punto_referencia || 'No registrado'}</Text>
          </View>
        </View>

        {/* Productor Propietario */}
        <Text style={styles.sectionTitle}>2. DATOS DEL PRODUCTOR / PROPIETARIO</Text>
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>Propietario / Razón Social:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{cliente?.nombre || 'No especificado'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Cédula / RIF:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold', color: '#1B5E20' }]}>{cliente?.cedula_rif || 'N/A'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Código RUNSAI:</Text>
            <Text style={styles.val}>{cliente?.codigo_runsai || 'N/A'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Teléfono:</Text>
            <Text style={styles.val}>{cliente?.telefono || 'N/A'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Correo Electrónico:</Text>
            <Text style={styles.val}>{cliente?.email || 'N/A'}</Text>
          </View>
        </View>

        {/* Ubicación Geográfica */}
        <Text style={styles.sectionTitle}>3. UBICACIÓN GEOGRÁFICA Y TERRITORIAL</Text>
        <View style={styles.grid}>
          <View style={styles.col4}>
            <Text style={styles.label}>Estado:</Text>
            <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{estado?.nombre || 'No especificado'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Municipio:</Text>
            <Text style={styles.val}>{municipio?.nombre || 'No especificado'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Parroquia:</Text>
            <Text style={styles.val}>{parroquia?.nombre || 'No especificado'}</Text>
          </View>
          <View style={styles.col12}>
            <Text style={styles.label}>Sector / Comunidad:</Text>
            <Text style={styles.val}>{ubic?.nombre || 'No especificado'}</Text>
          </View>
        </View>

        {/* Registro Ganadero y Marca de Hierro */}
        <Text style={styles.sectionTitle}>4. REGISTRO GANADERO Y MARCA DE HIERRO</Text>
        <View style={styles.hierroCard}>
          <View style={styles.hierroContainer}>
            {hierroImg ? (
              <Image src={hierroImg} style={styles.hierroImg} />
            ) : (
              <Text style={{ fontSize: 7, color: '#999999', textAlign: 'center' }}>Sin Imagen de Hierro Registrada</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#1B5E20', marginBottom: 4 }}>
              DATOS DEL REGISTRO DE HIERRO Y HERRAR
            </Text>
            <View style={styles.grid}>
              <View style={styles.col6}>
                <Text style={styles.label}>N° Registro de Hierro:</Text>
                <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{regHierro || 'No especificado'}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>N° Registro Ganadero:</Text>
                <Text style={[styles.val, { fontFamily: 'Helvetica-Bold' }]}>{regGanadero || 'No especificado'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Inventario Agrícola y Pecuario */}
        <Text style={styles.sectionTitle}>5. INVENTARIO PRODUCTIVO (CULTIVOS Y ANIMALES)</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {/* Cultivos */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#2E7D32', marginBottom: 2 }}>
              CULTIVOS REGISTRADOS ({cultivos.length})
            </Text>
            {cultivos.length === 0 ? (
              <Text style={{ fontSize: 7, color: '#777777', fontStyle: 'italic' }}>Sin cultivos registrados</Text>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: '60%' }]}>CULTIVO</Text>
                  <Text style={[styles.th, { width: '40%' }]}>SUPERFICIE</Text>
                </View>
                {cultivos.map((c, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.td, { width: '60%' }]}>{c.cultivo?.nombre || 'Cultivo'}</Text>
                    <Text style={[styles.td, { width: '40%' }]}>{c.superficie || 0} Ha</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Animales */}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#2E7D32', marginBottom: 2 }}>
              INVENTARIO ANIMAL ({animales.length})
            </Text>
            {animales.length === 0 ? (
              <Text style={{ fontSize: 7, color: '#777777', fontStyle: 'italic' }}>Sin inventario pecuario</Text>
            ) : (
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: '60%' }]}>ESPECIE</Text>
                  <Text style={[styles.th, { width: '40%' }]}>CANTIDAD</Text>
                </View>
                {animales.map((a, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={[styles.td, { width: '60%' }]}>{a.animales?.nombre || 'Especie'}</Text>
                    <Text style={[styles.td, { width: '40%' }]}>{a.cantidad || 0} Cabezas</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Historial de Solicitudes */}
        <Text style={styles.sectionTitle}>6. HISTORIAL DE SOLICITUDES Y TRÁMITES ASOCIADOS ({solicitudes.length})</Text>
        {solicitudes.length === 0 ? (
          <Text style={{ fontSize: 7.5, color: '#777777', fontStyle: 'italic', marginVertical: 4 }}>
            No registra solicitudes en este predio.
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
            <Text style={styles.signText}>FIRMA DEL PROPIETARIO / PRODUCTOR</Text>
            <Text style={{ fontSize: 6, color: '#666666', marginTop: 2 }}>{cliente?.nombre || 'Propietario'}</Text>
          </View>
          <View style={styles.signBox}>
            <Text style={styles.signText}>INSPECTOR / AUTORIZADO INSAI</Text>
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
