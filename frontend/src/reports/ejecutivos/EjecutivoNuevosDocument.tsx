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
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    marginBottom: 8,
  },
  headerLogo: {
    width: '28%',
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogoImg: {
    width: 110,
    height: 40,
    objectFit: 'contain',
  },
  headerCenter: {
    width: '47%',
    padding: 6,
    borderRightWidth: 1,
    borderColor: '#e2e8f0',
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
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textAlign: 'center',
  },
  subInstName: {
    fontSize: 6,
    color: '#475569',
    textAlign: 'center',
    marginTop: 2,
  },
  titleBar: {
    backgroundColor: '#0f172a',
    color: '#ffffff',
    padding: 6,
    borderRadius: 3,
    marginBottom: 10,
    alignItems: 'center',
  },
  titleText: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  table: {
    width: '100%',
    marginTop: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  th: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    padding: 5,
  },
  td: {
    fontSize: 7,
    padding: 5,
    color: '#334155',
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 6.5,
    color: '#64748b',
    borderTopWidth: 0.5,
    borderTopColor: '#cbd5e1',
    paddingTop: 4,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 6.5,
    color: '#64748b',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 10,
    color: '#0f172a',
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  }
});

// Component for Caracterización Estatal
export function CaracStatalPdfDocument({
  records,
  logoUrl,
  generadoEl,
}: {
  records: any[];
  logoUrl: string;
  generadoEl: string;
}) {
  const totalVets = records.reduce((acc, r) => acc + (Number(r.num_veterinarios_oficiales) || 0), 0);
  const totalPara = records.reduce((acc, r) => acc + (Number(r.num_paraveterinarios_oficiales) || 0), 0);
  const totalAdmin = records.reduce((acc, r) => acc + (Number(r.num_administrativos_oficiales) || 0), 0);
  const totalVeh = records.reduce((acc, r) => acc + (Number(r.num_vehiculos_operativos) || 0), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
            <Text style={styles.subInstName}>CARACTERIZACIÓN ESTATAL Y CAPACIDAD DE RECURSOS SANITARIOS</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{generadoEl}</Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>REPORTE OFICIAL DE CARACTERIZACIÓN ESTATAL Y RECURSOS MUNICIPIO A MUNICIPIO</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '25%' }]}>MUNICIPIO</Text>
            <Text style={[styles.th, { width: '20%' }]}>ESTADO</Text>
            <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>VETERINARIOS</Text>
            <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>PARAVETERINARIOS</Text>
            <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>ADMINISTRATIVOS</Text>
            <Text style={[styles.th, { width: '10%', textAlign: 'center' }]}>VEHÍCULOS</Text>
          </View>
          {records.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center' }]}>No hay datos de caracterización registrados.</Text>
            </View>
          ) : (
            records.map((r, i) => (
              <View key={r.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{r.municipios?.nombre || 'Municipio'}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{r.municipios?.estados?.nombre || 'Estado'}</Text>
                <Text style={[styles.td, { width: '15%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>{r.num_veterinarios_oficiales || 0}</Text>
                <Text style={[styles.td, { width: '15%', textAlign: 'center' }]}>{r.num_paraveterinarios_oficiales || 0}</Text>
                <Text style={[styles.td, { width: '15%', textAlign: 'center' }]}>{r.num_administrativos_oficiales || 0}</Text>
                <Text style={[styles.td, { width: '10%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>{r.num_vehiculos_operativos || 0}</Text>
              </View>
            ))
          )}
        </View>

        {/* Resumen Totales */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL VETERINARIOS</Text>
            <Text style={styles.summaryValue}>{totalVets}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL PARAVETERINARIOS</Text>
            <Text style={styles.summaryValue}>{totalPara}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL ADMINISTRATIVOS</Text>
            <Text style={styles.summaryValue}>{totalAdmin}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>VEHÍCULOS OPERATIVOS</Text>
            <Text style={styles.summaryValue}>{totalVeh}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// Component for Ranking Clientes
export function RankingClientesPdfDocument({
  ranking,
  logoUrl,
  generadoEl,
}: {
  ranking: any[];
  logoUrl: string;
  generadoEl: string;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
            <Text style={styles.subInstName}>RANKING EJECUTIVO DE PRODUCTORES Y SOLICITUDES ATENDIDAS</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{generadoEl}</Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>PRODUCTORES CON MAYOR VOLUMEN DE SOLICITUDES E INSPECCIONES</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '10%', textAlign: 'center' }]}>RANK</Text>
            <Text style={[styles.th, { width: '35%' }]}>PRODUCTOR / RAZÓN SOCIAL</Text>
            <Text style={[styles.th, { width: '20%' }]}>CÉDULA / RIF</Text>
            <Text style={[styles.th, { width: '15%', textAlign: 'center' }]}>SOLICITUDES</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>PREDIOS</Text>
          </View>
          {ranking.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center' }]}>No hay registros de productores.</Text>
            </View>
          ) : (
            ranking.map((item, i) => (
              <View key={item.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '10%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>#{i + 1}</Text>
                <Text style={[styles.td, { width: '35%', fontFamily: 'Helvetica-Bold' }]}>{item.nombre}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{item.cedula_rif}</Text>
                <Text style={[styles.td, { width: '15%', textAlign: 'center', fontFamily: 'Helvetica-Bold', color: '#0f172a' }]}>{item.totalSolicitudes}</Text>
                <Text style={[styles.td, { width: '20%', textAlign: 'center' }]}>{item.totalPredios} predio(s)</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// Component for Desempeño Inspecciones por Empleado
export function InspeccionesEmpleadoPdfDocument({
  inspecciones,
  inspectorInfo,
  logoUrl,
  generadoEl,
}: {
  inspecciones: any[];
  inspectorInfo?: { nombre: string; apellido: string; cedula: string } | null;
  logoUrl: string;
  generadoEl: string;
}) {
  const totalRealizadas = inspecciones.length;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
            <Text style={styles.subInstName}>INFORME DE DESEMPEÑO E INSPECCIONES REALIZADAS POR INSPECTOR</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{generadoEl}</Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>HISTORIAL Y REGISTRO DE INSPECCIONES Y PREDIOS VISITADOS</Text>
        </View>

        {/* Resumen del Inspector Seleccionado */}
        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>INSPECTOR TÉCNICO</Text>
            <Text style={styles.summaryValue}>
              {inspectorInfo ? `${inspectorInfo.nombre} ${inspectorInfo.apellido}` : 'TODOS LOS INSPECTORES'}
            </Text>
          </View>
          {inspectorInfo && (
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>CÉDULA DE IDENTIDAD</Text>
              <Text style={styles.summaryValue}>{inspectorInfo.cedula}</Text>
            </View>
          )}
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL INSPECCIONES REALIZADAS</Text>
            <Text style={styles.summaryValue}>{totalRealizadas}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '15%' }]}>N° CONTROL</Text>
            <Text style={[styles.th, { width: '25%' }]}>PROPIEDAD / PREDIO VISITADO</Text>
            <Text style={[styles.th, { width: '20%' }]}>PRODUCTOR / CLIENTE</Text>
            <Text style={[styles.th, { width: '20%' }]}>INSPECTOR(ES) RESPONSABLE(S)</Text>
            <Text style={[styles.th, { width: '10%', textAlign: 'center' }]}>FECHA</Text>
            <Text style={[styles.th, { width: '10%', textAlign: 'center' }]}>ESTATUS</Text>
          </View>
          {inspecciones.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center' }]}>No hay inspecciones registradas para este criterio.</Text>
            </View>
          ) : (
            inspecciones.map((insp, i) => (
              <View key={insp.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>{insp.n_control || `INSP-${insp.id}`}</Text>
                <Text style={[styles.td, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{insp.propiedad_nombre || 'S/N'}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{insp.productor_nombre || 'N/A'}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{insp.inspector_nombres || 'N/A'}</Text>
                <Text style={[styles.td, { width: '10%', textAlign: 'center' }]}>{insp.fecha_inspeccion ? new Date(insp.fecha_inspeccion).toLocaleDateString('es-VE') : 'N/A'}</Text>
                <Text style={[styles.td, { width: '10%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>{insp.status || 'COMPLETADA'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// Component for Avales Sanitarios Consolidado
export function AvalesSanitariosPdfDocument({
  avales,
  logoUrl,
  generadoEl,
}: {
  avales: any[];
  logoUrl: string;
  generadoEl: string;
}) {
  const totalBovBuf = avales.reduce((acc, a) => acc + (Number(a.hallazgos_bov_buf?.total_bov_buf) || 0), 0);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
            <Text style={styles.subInstName}>CONSOLIDADO DE AVALES SANITARIOS Y INVENTARIO DE REBAÑOS AUDITADOS</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{generadoEl}</Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>REGISTRO Y CONTROL DE PREDIOS Y AVALES SANITARIOS VIGENTES</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '15%' }]}>N° AVAL</Text>
            <Text style={[styles.th, { width: '25%' }]}>NOMBRE DEL PREDIO</Text>
            <Text style={[styles.th, { width: '20%' }]}>CÓDIGO PREDIO</Text>
            <Text style={[styles.th, { width: '20%', textAlign: 'center' }]}>TOTAL BOV/BUF</Text>
            <Text style={[styles.th, { width: '20%' }]}>VIGENCIA HASTA</Text>
          </View>
          {avales.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center' }]}>No hay avales sanitarios registrados.</Text>
            </View>
          ) : (
            avales.map((a, i) => (
              <View key={a.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>{a.n_aval || `AV-${a.id}`}</Text>
                <Text style={[styles.td, { width: '25%', fontFamily: 'Helvetica-Bold' }]}>{a.nombre_predio}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{a.codigo_predio || 'N/A'}</Text>
                <Text style={[styles.td, { width: '20%', textAlign: 'center', fontFamily: 'Helvetica-Bold' }]}>
                  {a.hallazgos_bov_buf?.total_bov_buf || 0} cabezas
                </Text>
                <Text style={[styles.td, { width: '20%' }]}>{a.vigencia_hasta ? new Date(a.vigencia_hasta).toLocaleDateString('es-VE') : 'Vigente'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL AVALES REGISTRADOS</Text>
            <Text style={styles.summaryValue}>{avales.length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>CABEZAS DE GANADO BOVINO/BUFALINO AUDITADAS</Text>
            <Text style={styles.summaryValue}>{totalBovBuf}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// Component for Inspecciones de Silos Consolidado
export function InspeccionesSilosPdfDocument({
  silos,
  logoUrl,
  generadoEl,
}: {
  silos: any[];
  logoUrl: string;
  generadoEl: string;
}) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
            <Text style={styles.subInstName}>INFORME DE INSPECCIONES DE SILOS Y ALMACENAMIENTO AGROINDUSTRIAL</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{generadoEl}</Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>CONTROL DE SILOS, CAPACIDAD DE ALMACENAMIENTO Y CONDICIONES FITOSANITARIAS</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '15%' }]}>N° ACTA</Text>
            <Text style={[styles.th, { width: '30%' }]}>EMPRESA / RAZÓN SOCIAL</Text>
            <Text style={[styles.th, { width: '20%' }]}>RIF</Text>
            <Text style={[styles.th, { width: '20%' }]}>REPRESENTANTE LEGAL</Text>
            <Text style={[styles.th, { width: '15%' }]}>FECHA INSPECCIÓN</Text>
          </View>
          {silos.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center' }]}>No hay actas de silos registradas.</Text>
            </View>
          ) : (
            silos.map((s, i) => (
              <View key={s.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '15%', fontFamily: 'Helvetica-Bold' }]}>{s.n_acta || `SILO-${s.id}`}</Text>
                <Text style={[styles.td, { width: '30%', fontFamily: 'Helvetica-Bold' }]}>{s.empresa_razon_social}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{s.empresa_rif || 'N/A'}</Text>
                <Text style={[styles.td, { width: '20%' }]}>{s.representante_legal_nombre || 'N/A'}</Text>
                <Text style={[styles.td, { width: '15%' }]}>{s.fecha_inspeccion ? new Date(s.fecha_inspeccion).toLocaleDateString('es-VE') : 'N/A'}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL PLANTAS / SILOS INSPECCIONADOS</Text>
            <Text style={styles.summaryValue}>{silos.length}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

// Component for Empleados Asignados a Programas / Jefes de Programa
export function EmpleadosProgramasPdfDocument({
  empleadosProgramas,
  logoUrl,
  generadoEl,
}: {
  empleadosProgramas: any[];
  logoUrl: string;
  generadoEl: string;
}) {
  const totalConPrograma = empleadosProgramas.length;
  const totalJefes = empleadosProgramas.filter(e => 
    e.cargo_nombre?.toLowerCase().includes('jefe') || 
    e.cargo_nombre?.toLowerCase().includes('coordinador') ||
    e.es_jefe
  ).length;

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.headerLogo}>
            <Image src={logoUrl} style={styles.headerLogoImg} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.instName}>INSTITUTO NACIONAL DE SALUD AGRÍCOLA INTEGRAL (INSAI)</Text>
            <Text style={styles.subInstName}>INFORME DE EMPLEADOS Y JEFES ASIGNADOS A PROGRAMAS SANITARIOS</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontSize: 6, color: '#64748b' }}>FECHA DE EMISIÓN</Text>
            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#0f172a' }}>{generadoEl}</Text>
          </View>
        </View>

        <View style={styles.titleBar}>
          <Text style={styles.titleText}>AUDITORÍA DE PERSONAL TÉCNICO, JEFES DE PROGRAMA Y PROGRAMAS DE VIGILANCIA ASIGNADOS</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { width: '22%' }]}>FUNCIONARIO / EMPLEADO</Text>
            <Text style={[styles.th, { width: '13%' }]}>CÉDULA</Text>
            <Text style={[styles.th, { width: '20%' }]}>CARGO / ROL</Text>
            <Text style={[styles.th, { width: '20%' }]}>OFICINA / SEDE</Text>
            <Text style={[styles.th, { width: '25%' }]}>PROGRAMAS ASIGNADOS</Text>
          </View>
          {empleadosProgramas.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={[styles.td, { width: '100%', textAlign: 'center' }]}>No hay empleados asignados a programas registrados.</Text>
            </View>
          ) : (
            empleadosProgramas.map((emp, i) => (
              <View key={emp.id || i} style={styles.tableRow}>
                <Text style={[styles.td, { width: '22%', fontFamily: 'Helvetica-Bold' }]}>
                  {emp.nombre} {emp.apellido}
                </Text>
                <Text style={[styles.td, { width: '13%' }]}>{emp.cedula}</Text>
                <Text style={[styles.td, { width: '20%', fontFamily: emp.cargo_nombre?.toLowerCase().includes('jefe') ? 'Helvetica-Bold' : 'Helvetica' }]}>
                  {emp.cargo_nombre || 'Funcionario'}
                </Text>
                <Text style={[styles.td, { width: '20%' }]}>{emp.oficina_nombre || 'Sede Regional'}</Text>
                <Text style={[styles.td, { width: '25%', fontFamily: 'Helvetica-Bold', color: '#0f172a' }]}>
                  {emp.programasNombres && emp.programasNombres.length > 0
                    ? emp.programasNombres.join(', ')
                    : 'Sin programas asignados'}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>TOTAL EMPLEADOS ASIGNADOS</Text>
            <Text style={styles.summaryValue}>{totalConPrograma}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>JEFES / COORDINADORES DE PROGRAMA</Text>
            <Text style={styles.summaryValue}>{totalJefes}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>DOCUMENTO OFICIAL GENERADO POR SISTEMA SICIC - INSAI</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}


