import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

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
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#333333',
    textAlign: 'center',
    marginTop: 2,
  },
  titleBar: {
    backgroundColor: '#2E7D32',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  controlText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#E8F5E9',
  },
  profileRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  photoContainer: {
    width: 90,
    height: 105,
    borderWidth: 1,
    borderColor: '#2E7D32',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoPlaceholder: {
    fontSize: 8,
    color: '#888888',
    textAlign: 'center',
  },
  profileInfoBlock: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    padding: 6,
    backgroundColor: '#FAFAFA',
  },
  sectionHeader: {
    backgroundColor: '#1B5E20',
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  col6: {
    width: '49%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 3,
    padding: 4,
    backgroundColor: '#ffffff',
  },
  col12: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 3,
    padding: 4,
    backgroundColor: '#ffffff',
  },
  col4: {
    width: '32.5%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 3,
    padding: 4,
    backgroundColor: '#ffffff',
  },
  label: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2E7D32',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#212121',
  },
  valueBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a1a',
  },
  badgeStatusActive: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#2E7D32',
    backgroundColor: '#E8F5E9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  badgeStatusInactive: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#C62828',
    backgroundColor: '#FFEBEE',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  programTag: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#1565C0',
    backgroundColor: '#E3F2FD',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
    marginBottom: 3,
    marginRight: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 24,
    right: 24,
    borderTopWidth: 1,
    borderTopColor: '#C8E6C9',
    paddingTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6.5,
    color: '#666666',
  },
  signaturesBlock: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signLine: {
    width: 160,
    borderTopWidth: 1,
    borderTopColor: '#000000',
    paddingTop: 4,
    alignItems: 'center',
  },
  signText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#333333',
    textAlign: 'center',
  },
});

export interface EmpleadoFichaData {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  telefono?: string | null;
  email?: string | null;
  fechas_ingreso?: string | null;
  status_laboral?: string | null;
  cargos?: { nombre: string } | null;
  departamentos?: { nombre: string } | null;
  profesiones?: { nombre: string } | null;
  oficinas?: { nombre: string } | null;
  contrato?: { nombre: string } | null;
  empleado_foto?: { foto_url: string }[] | null;
  empleado_residencia?: {
    direccion_detallada?: string | null;
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
  empleados_programas?: {
    programas?: {
      nombre: string;
      codigo?: string;
    };
  }[] | null;
  planificacion_empleados?: {
    planificaciones?: {
      codigo?: string;
      fecha_planificada?: string;
    };
  }[] | null;
}

export function EmpleadoFichaDocument({
  empleado,
  logoUrl,
  generadoEl,
}: {
  empleado: EmpleadoFichaData;
  logoUrl: string;
  generadoEl: string;
}) {
  const fotoUrl = empleado.empleado_foto?.[0]?.foto_url;
  const residencia = empleado.empleado_residencia?.[0];
  const sector = residencia?.sectores;
  const parroquia = sector?.parroquias;
  const municipio = parroquia?.municipios;
  const estado = municipio?.estados;

  const programas = empleado.empleados_programas?.map((ep) => ep.programas?.nombre).filter(Boolean) || [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado Oficial */}
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

        {/* Barra de Título */}
        <View style={styles.titleBar}>
          <Text style={styles.titleText}>EXPEDIENTE Y FICHA TÉCNICA DEL EMPLEADO</Text>
          <Text style={styles.controlText}>CÓDIGO: EMP-{empleado.id.toString().padStart(5, '0')}</Text>
        </View>

        {/* Sección Perfil e Información Básica */}
        <View style={styles.profileRow}>
          <View style={styles.photoContainer}>
            {fotoUrl ? (
              <Image src={fotoUrl} style={styles.photo} />
            ) : (
              <Text style={styles.photoPlaceholder}>SIN FOTOGRAFÍA REGISTRADA</Text>
            )}
          </View>

          <View style={styles.profileInfoBlock}>
            <Text style={styles.label}>Nombres y Apellidos Completos</Text>
            <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1B5E20', marginBottom: 4 }}>
              {empleado.nombre} {empleado.apellido}
            </Text>

            <View style={styles.grid}>
              <View style={styles.col6}>
                <Text style={styles.label}>Cédula de Identidad</Text>
                <Text style={styles.valueBold}>V- {empleado.cedula}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Estatus Laboral</Text>
                <Text
                  style={
                    empleado.status_laboral === 'ACTIVO'
                      ? styles.badgeStatusActive
                      : styles.badgeStatusInactive
                  }
                >
                  {empleado.status_laboral || 'ACTIVO'}
                </Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Teléfono de Contacto</Text>
                <Text style={styles.value}>{empleado.telefono || 'No registrado'}</Text>
              </View>
              <View style={styles.col6}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <Text style={styles.value}>{empleado.email || 'No registrado'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Sección 1: Datos Laborales */}
        <Text style={styles.sectionHeader}>1. INFORMACIÓN LABORAL E INSTITUCIONAL</Text>
        <View style={styles.grid}>
          <View style={styles.col6}>
            <Text style={styles.label}>Cargo / Responsabilidad</Text>
            <Text style={styles.valueBold}>{empleado.cargos?.nombre || 'No asignado'}</Text>
          </View>
          <View style={styles.col6}>
            <Text style={styles.label}>Profesión / Titulación</Text>
            <Text style={styles.valueBold}>{empleado.profesiones?.nombre || 'No registrada'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Departamento / Área</Text>
            <Text style={styles.value}>{empleado.departamentos?.nombre || 'No asignado'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Oficina Fitosanitaria</Text>
            <Text style={styles.value}>{empleado.oficinas?.nombre || 'Sede Principal'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Tipo de Contrato</Text>
            <Text style={styles.value}>{empleado.contrato?.nombre || 'N/A'}</Text>
          </View>
          <View style={styles.col12}>
            <Text style={styles.label}>Fecha de Ingreso a la Institución</Text>
            <Text style={styles.value}>
              {empleado.fechas_ingreso
                ? new Date(empleado.fechas_ingreso).toLocaleDateString('es-VE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'No especificada'}
            </Text>
          </View>
        </View>

        {/* Sección 2: Ubicación Residencial */}
        <Text style={styles.sectionHeader}>2. UBICACIÓN Y DOMICILIO DE RESIDENCIA</Text>
        <View style={styles.grid}>
          <View style={styles.col4}>
            <Text style={styles.label}>Estado</Text>
            <Text style={styles.valueBold}>{estado?.nombre || 'N/A'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Municipio</Text>
            <Text style={styles.value}>{municipio?.nombre || 'N/A'}</Text>
          </View>
          <View style={styles.col4}>
            <Text style={styles.label}>Parroquia / Sector</Text>
            <Text style={styles.value}>
              {parroquia?.nombre || 'N/A'} {sector?.nombre ? `• ${sector.nombre}` : ''}
            </Text>
          </View>
          <View style={styles.col12}>
            <Text style={styles.label}>Dirección Detallada</Text>
            <Text style={styles.value}>{residencia?.direccion_detallada || 'Sin dirección registrada.'}</Text>
          </View>
        </View>

        {/* Sección 3: Programas Sanitarios Asignados */}
        <Text style={styles.sectionHeader}>3. PROGRAMAS SALUD AGRÍCOLA ASIGNADOS</Text>
        <View style={styles.col12}>
          {programas.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {programas.map((p, idx) => (
                <Text key={idx} style={styles.programTag}>
                  • {p}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 8, color: '#666666', fontStyle: 'italic' }}>
              El empleado no posee programas específicos vinculados formalmente.
            </Text>
          )}
        </View>

        {/* Sección 4: Operaciones Fitosanitarias de Campo */}
        <Text style={styles.sectionHeader}>4. PARTICIPACIÓN EN OPERACIONES Y PLANIFICACIONES DE CAMPO</Text>
        <View style={styles.col12}>
          <Text style={{ fontSize: 8, color: '#333333' }}>
            Planificaciones registradas en sistema:{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold', color: '#1B5E20' }}>
              {empleado.planificacion_empleados?.length || 0} Operaciones de Inspección asignadas
            </Text>
          </Text>
        </View>

        {/* Firmas de Validación */}
        <View style={styles.signaturesBlock}>
          <View style={styles.signLine}>
            <Text style={styles.signText}>FIRMA DEL EMPLEADO</Text>
            <Text style={{ fontSize: 6, color: '#666' }}>C.I. {empleado.cedula}</Text>
          </View>
          <View style={styles.signLine}>
            <Text style={styles.signText}>GESTIÓN HUMANA / INSAI</Text>
            <Text style={{ fontSize: 6, color: '#666' }}>Sello y Firma Autorizada</Text>
          </View>
        </View>

        {/* Pie de Página */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>INSAI • Sistema SICIC V2.0 • Expediente Electrónico</Text>
          <Text style={styles.footerText}>Página 1 de 1</Text>
        </View>
      </Page>
    </Document>
  );
}
