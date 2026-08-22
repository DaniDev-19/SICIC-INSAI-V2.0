import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import type { AvalSanitarioReporteDto } from './types';

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 26,
    fontSize: 7.5,
    fontFamily: 'Helvetica',
    color: '#000000',
    backgroundColor: '#ffffff',
  },

  // Encabezado Superior Institucional
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    height: 46,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '65%',
  },
  headerLeftLogo: {
    height: 42,
    maxWidth: 220,
    objectFit: 'contain',
  },
  headerRight: {
    width: '32%',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerRightLogo: {
    height: 38,
    maxWidth: 130,
    objectFit: 'contain',
  },

  // Fila OSA + Recuadro Hierro
  osaHierroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 2,
    marginBottom: 4,
  },
  osaBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 10,
  },
  osaLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    marginRight: 4,
  },
  osaValueUnderline: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingBottom: 1,
    paddingHorizontal: 12,
    minWidth: 120,
    textAlign: 'center',
  },
  osaValueText: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    textTransform: 'uppercase',
  },

  hierroContainer: {
    alignItems: 'center',
    width: 68,
  },
  hierroFrame: {
    width: 54,
    height: 54,
    borderWidth: 1.2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  hierroImg: {
    width: 50,
    height: 50,
    objectFit: 'contain',
  },
  hierroLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    marginTop: 2,
    textAlign: 'center',
  },

  // Título Aval Sanitario
  titleRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  titleText: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.5,
  },
  titleNumber: {
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    marginLeft: 8,
  },

  // Bloque Predio y Propietario
  infoBlock: {
    marginTop: 2,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2.5,
  },
  inlineField: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    marginRight: 2,
  },
  fieldValueUnderline: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#000',
    paddingBottom: 1,
    paddingHorizontal: 4,
  },
  fieldText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    textTransform: 'uppercase',
  },

  // Título de Sección
  sectionHeader: {
    textAlign: 'center',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
    letterSpacing: 0.4,
    marginTop: 5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },

  // Tablas Gemelas de Animales Vacunados
  tablesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tableWrapperLeft: {
    width: '48.5%',
  },
  tableWrapperRight: {
    width: '50%',
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    minHeight: 12.5,
    alignItems: 'center',
  },
  tableRowHeader: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#000',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    paddingVertical: 1.5,
    paddingHorizontal: 3,
    borderRightWidth: 1,
    borderColor: '#000',
    fontSize: 7,
    justifyContent: 'center',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  cellText: {
    fontSize: 7,
    fontFamily: 'Helvetica',
  },
  cellTextBold: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
  },
  cellCenter: {
    textAlign: 'center',
  },
  cellRight: {
    textAlign: 'right',
  },

  // Tabla Biológicos
  biologicosTable: {
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 8,
  },
  biologicosHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 7,
    textAlign: 'center',
  },

  // Bloque de Firmas y Validación
  footerBlock: {
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 3,
  },
  footerLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    marginRight: 2,
  },
  footerUnderline: {
    borderBottomWidth: 0.8,
    borderBottomColor: '#000',
    paddingBottom: 1,
    paddingHorizontal: 4,
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
  },
});

interface AvalSanitarioDocumentProps {
  data: AvalSanitarioReporteDto;
  cintilloUrl?: string;
  logoVictoriosoUrl?: string;
}

export function AvalSanitarioDocument({
  data,
  cintilloUrl,
  logoVictoriosoUrl,
}: AvalSanitarioDocumentProps) {
  const defaultCintillo = cintilloUrl || `${window.location.origin}/cintillo nuevo.png`;
  const defaultVictorioso = logoVictoriosoUrl || `${window.location.origin}/image-insai.png`;

  const bov = data.bovinos || {
    toros: '',
    vacas: '',
    novillos: '',
    novillas: '',
    mautes: '',
    mautas: '',
    becerros: '',
    becerras: '',
    total: 0,
  };

  const buf = data.bufalos || {
    bufalos: '',
    bufalas: '',
    buvillos: '',
    buvillas: '',
    bumautes: '',
    bumautas: '',
    bucerros: '',
    bucerras: '',
    total: 0,
  };

  const otras = data.otras_especies || {
    ovinos: { machos: '', hembras: '', crias: '', total: 0 },
    caprinos: { machos: '', hembras: '', crias: '', total: 0 },
    porcinos: { machos: '', hembras: '', crias: '', total: 0 },
    aves: { machos: '', hembras: '', crias: '', total: 0 },
    equinos: { machos: '', hembras: '', crias: '', total: 0 },
    otros: { nombre: 'queso', machos: '', hembras: '', crias: '', total: 0 },
  };

  const biologicos = data.biologicos || [];

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* 1. ENCABEZADO INSTITUCIONAL */}
        <View style={styles.headerContainer}>
          <View style={styles.headerLeft}>
            {defaultCintillo && (
              <Image src={defaultCintillo} style={styles.headerLeftLogo} />
            )}
          </View>
          <View style={styles.headerRight}>
            {defaultVictorioso && (
              <Image src={defaultVictorioso} style={styles.headerRightLogo} />
            )}
          </View>
        </View>

        {/* 2. FILA OSA Y RECUADRO HIERRO */}
        <View style={styles.osaHierroRow}>
          <View style={styles.osaBox}>
            <Text style={styles.osaLabel}>OSA:</Text>
            <View style={styles.osaValueUnderline}>
              <Text style={styles.osaValueText}>{data.osa || 'SAN FELIPE'}</Text>
            </View>
          </View>

          <View style={styles.hierroContainer}>
            <View style={styles.hierroFrame}>
              {data.hierro_img_url ? (
                <Image src={data.hierro_img_url} style={styles.hierroImg} />
              ) : (
                <View />
              )}
            </View>
            <Text style={styles.hierroLabel}>HIERRO</Text>
          </View>
        </View>

        {/* 3. TÍTULO DEL DOCUMENTO */}
        <View style={styles.titleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.titleText}>AVAL SANITARIO Nº:</Text>
            <Text style={styles.titleNumber}>{data.numero_aval || '2201321'}</Text>
          </View>
        </View>

        {/* 4. DATOS DEL PREDIO Y PROPIETARIO */}
        <View style={styles.infoBlock}>
          {/* Fila 1: Predio, Propietario, CI/RIF */}
          <View style={styles.infoRow}>
            <View style={[styles.inlineField, { flex: 1.2 }]}>
              <Text style={styles.fieldLabel}>Predio:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.predio || ''}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1.3, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>Propietario:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.propietario || ''}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { width: 110, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>CI/RIF:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.ci_rif || ''}</Text>
              </View>
            </View>
          </View>

          {/* Fila 2: Nº de Reg. Hierro, Nº de Reg. Ganadero, Codigo del predio */}
          <View style={styles.infoRow}>
            <View style={[styles.inlineField, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Nº de Reg. Hierro:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.num_reg_hierro || ''}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>Nº de Reg. Ganadero:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.num_reg_ganadero || '...........'}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.fieldLabel}>Codigo del predio:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.codigo_predio || '...........'}</Text>
              </View>
            </View>
          </View>

          {/* Fila 3: Sector, Parroquia, Municipio, Estado */}
          <View style={styles.infoRow}>
            <View style={[styles.inlineField, { flex: 1.1 }]}>
              <Text style={styles.fieldLabel}>Sector:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.sector || ''}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1, marginLeft: 6 }]}>
              <Text style={styles.fieldLabel}>Parroquia:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.parroquia || ''}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1.4, marginLeft: 6 }]}>
              <Text style={styles.fieldLabel}>Municipio:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.municipio || ''}</Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 0.9, marginLeft: 6 }]}>
              <Text style={styles.fieldLabel}>Estado:</Text>
              <View style={[styles.fieldValueUnderline, { flex: 1 }]}>
                <Text style={styles.fieldText}>{data.estado || ''}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 5. SECCIÓN: ANIMALES VACUNADOS */}
        <Text style={styles.sectionHeader}>ANIMALES VACUNADOS</Text>

        <View style={styles.tablesContainer}>
          {/* TABLA IZQUIERDA: BOVINOS Y BÚFALOS */}
          <View style={styles.tableWrapperLeft}>
            <View style={styles.table}>
              {/* Toros / Búfalos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Toros</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.toros}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Bufalos</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.bufalos}</Text>
                </View>
              </View>

              {/* Vacas / Búfalas */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Vacas</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.vacas}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Bufalas</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.bufalas}</Text>
                </View>
              </View>

              {/* Novillos / Buvillos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Novillos</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.novillos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Buvillos</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.buvillos}</Text>
                </View>
              </View>

              {/* Novillas / Buvillas */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Novillas</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.novillas}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Buvillas</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.buvillas}</Text>
                </View>
              </View>

              {/* Mautes / Bumautes */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Mautes</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.mautes}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Bumautes</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.bumautes}</Text>
                </View>
              </View>

              {/* Mautas / Bumautas */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Mautas</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.mautas}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Bumautas</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.bumautas}</Text>
                </View>
              </View>

              {/* Becerros / Bucerros */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Becerros</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.becerros}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Bucerros</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.bucerros}</Text>
                </View>
              </View>

              {/* Becerras / Bucerras */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Becerras</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bov.becerras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Bucerras</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{buf.bucerras}</Text>
                </View>
              </View>

              {/* Totales Bovinos y Búfalos */}
              <View style={[styles.tableRow, styles.tableRowLast]}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellTextBold}>Total</Text>
                </View>
                <View style={[styles.tableCell, { width: '18%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>{bov.total}</Text>
                </View>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellTextBold}>Total</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '18%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>{buf.total}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* TABLA DERECHA: OTRAS ESPECIES */}
          <View style={styles.tableWrapperRight}>
            <View style={styles.table}>
              {/* Encabezado */}
              <View style={[styles.tableRow, styles.tableRowHeader]}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>Otras Especies</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>Machos</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>Hembras</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>Crias</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellTextBold, styles.cellCenter]}>Total</Text>
                </View>
              </View>

              {/* Ovinos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Ovinos</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.ovinos.machos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.ovinos.hembras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.ovinos.crias}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.ovinos.total}</Text>
                </View>
              </View>

              {/* Caprinos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Caprinos</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.caprinos.machos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.caprinos.hembras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.caprinos.crias}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.caprinos.total}</Text>
                </View>
              </View>

              {/* Porcinos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Porcinos</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.porcinos.machos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.porcinos.hembras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.porcinos.crias}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.porcinos.total}</Text>
                </View>
              </View>

              {/* Aves */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Aves</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.aves.machos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.aves.hembras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.aves.crias}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.aves.total}</Text>
                </View>
              </View>

              {/* Equinos */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>Equinos</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.equinos.machos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.equinos.hembras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.equinos.crias}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.equinos.total}</Text>
                </View>
              </View>

              {/* Otros / Queso */}
              <View style={[styles.tableRow, styles.tableRowLast]}>
                <View style={[styles.tableCell, { width: '32%' }]}>
                  <Text style={styles.cellText}>{otras.otros.nombre || 'queso'}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.otros.machos}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.otros.hembras}</Text>
                </View>
                <View style={[styles.tableCell, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.otros.crias}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '17%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{otras.otros.total}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6. SECCIÓN: BIOLÓGICOS UTILIZADOS */}
        <Text style={styles.sectionHeader}>BIOLOGICOS UTILIZADOS</Text>

        <View style={styles.biologicosTable}>
          {/* Encabezado de Biológicos */}
          <View style={[styles.tableRow, styles.tableRowHeader]}>
            <View style={[styles.tableCell, { width: '22%' }]}>
              <Text style={styles.biologicosHeaderCell}>Vacunas</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text style={styles.biologicosHeaderCell}>Lote</Text>
            </View>
            <View style={[styles.tableCell, { width: '15%' }]}>
              <Text style={styles.biologicosHeaderCell}>Marca</Text>
            </View>
            <View style={[styles.tableCell, { width: '20%' }]}>
              <Text style={styles.biologicosHeaderCell}>Fecha de Vacunacion</Text>
            </View>
            <View style={[styles.tableCell, styles.tableCellLast, { width: '28%' }]}>
              <Text style={styles.biologicosHeaderCell}>Pruebas Diagnosticas</Text>
            </View>
          </View>

          {/* Filas de Biológicos */}
          {biologicos.map((bio, index) => {
            const isLast = index === biologicos.length - 1;
            return (
              <View
                key={index}
                style={[styles.tableRow, isLast ? styles.tableRowLast : {}]}
              >
                <View style={[styles.tableCell, { width: '22%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bio.vacuna || ''}</Text>
                </View>
                <View style={[styles.tableCell, { width: '15%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bio.lote || ''}</Text>
                </View>
                <View style={[styles.tableCell, { width: '15%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bio.marca || ''}</Text>
                </View>
                <View style={[styles.tableCell, { width: '20%' }]}>
                  <Text style={[styles.cellText, styles.cellCenter]}>{bio.fecha_vacunacion || ''}</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast, { width: '28%' }]}>
                  <Text style={[styles.cellText, { fontSize: 6.5 }]}>{bio.pruebas_diagnosticas || ''}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* 7. BLOQUE DE FIRMAS, AUTORIDADES Y VALIDACIÓN */}
        <View style={styles.footerBlock}>
          {/* Fila 1: Médico Veterinario Responsable y CI */}
          <View style={styles.footerRow}>
            <View style={[styles.inlineField, { flex: 3.5 }]}>
              <Text style={styles.footerLabel}>Medico Veterinario Responsable:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.medico_responsable?.nombre || 'José Martínez'}
                </Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1.5, marginLeft: 10 }]}>
              <Text style={styles.footerLabel}>CI Nº:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.medico_responsable?.cedula || '12724383'}
                </Text>
              </View>
            </View>
          </View>

          {/* Fila 2: N° INSAI, N° CMV, Certificado de Vacunación */}
          <View style={styles.footerRow}>
            <View style={[styles.inlineField, { flex: 1.5 }]}>
              <Text style={styles.footerLabel}>N° INSAI:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.medico_responsable?.n_insai || '201018459812-'}
                </Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1.1, marginLeft: 8 }]}>
              <Text style={styles.footerLabel}>N° CMV</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.medico_responsable?.n_cmv || '177'}
                </Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 2.4, marginLeft: 8 }]}>
              <Text style={styles.footerLabel}>Certificado de Vacunacion:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center', fontSize: 7 }]}>
                  {data.certificado_vacunacion_n || ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Fila 3: Fecha de Emisión y Fecha de Vencimiento */}
          <View style={styles.footerRow}>
            <View style={[styles.inlineField, { flex: 1.4 }]}>
              <Text style={styles.footerLabel}>Fecha de Emision del Aval:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.fecha_emision || ''}
                </Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1.6, marginLeft: 12 }]}>
              <Text style={styles.footerLabel}>Fecha de Vencimiento del aval:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.fecha_vencimiento || ''}
                </Text>
              </View>
            </View>
          </View>

          {/* Fila 4: Observaciones */}
          <View style={[styles.footerRow, { marginTop: 6 }]}>
            <View style={[styles.inlineField, { flex: 1 }]}>
              <Text style={styles.footerLabel}>Observaciones:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={styles.footerText}>{data.observaciones || ''}</Text>
              </View>
            </View>
          </View>

          {/* Fila 5: Jefe de OSA y Firma / Sello */}
          <View style={[styles.footerRow, { marginTop: 10 }]}>
            <View style={[styles.inlineField, { flex: 1.5 }]}>
              <Text style={styles.footerLabel}>Jefe de OSA:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={[styles.footerText, { textAlign: 'center' }]}>
                  {data.jefe_osa?.nombre || 'José Martínez'}
                </Text>
              </View>
            </View>

            <View style={[styles.inlineField, { flex: 1.8, marginLeft: 14 }]}>
              <Text style={styles.footerLabel}>Firma y sello del M.V. INSAI:</Text>
              <View style={[styles.footerUnderline, { flex: 1 }]}>
                <Text style={styles.footerText}>{''}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default AvalSanitarioDocument;
