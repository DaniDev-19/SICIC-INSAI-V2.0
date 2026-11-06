import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Smartphone,
  Download,
  FileText,
  Warehouse,
  ShieldCheck,
  Activity,
  Layers,
  ClipboardList,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StepGuide {
  title: string;
  desc: string;
}

interface ModuleHelp {
  id: string;
  name: string;
  shortName: string;
  icon: typeof FileText;
  color: string;
  category: string;
  summary: string;
  objective: string;
  steps: StepGuide[];
  features: string[];
  tips: string[];
  mediaSlots: { label: string; desc: string; type: 'image' | 'video' }[];
}

const MODULES_HELP: ModuleHelp[] = [
  {
    id: 'app',
    name: 'Aplicación Móvil (APK & PWA)',
    shortName: 'App Móvil / APK',
    icon: Smartphone,
    color: 'emerald',
    category: 'Acceso Móvil',
    summary: 'Descarga, instalación y uso de la aplicación móvil para inspectores de campo.',
    objective: 'Permitir a los técnicos e inspectores levantar actas, tomar fotografías in situ y consultar información sin depender exclusivamente de una computadora de escritorio.',
    steps: [
      {
        title: 'Paso 1: Descargar el archivo APK',
        desc: 'Haga clic en el botón "Descargar APK Android" ubicado en la parte superior o en la landing page del sistema para obtener el paquete de instalación oficial.',
      },
      {
        title: 'Paso 2: Habilitar orígenes desconocidos en Android',
        desc: 'En su dispositivo Android, vaya a Ajustes > Seguridad (o en la notificación de descarga de Chrome) y autorice la instalación de aplicaciones desde este origen.',
      },
      {
        title: 'Paso 3: Instalar y Abrir',
        desc: 'Abra el archivo descargado (SICIC-INSAI-v2.0.apk) y presione "Instalar". Al finalizar, inicie sesión con su usuario y contraseña institucional.',
      },
      {
        title: 'Opción Alternativa: Instalación como PWA',
        desc: 'Si prefiere no instalar el APK, abra la URL del sistema en Google Chrome desde su móvil, pulse los tres puntos del navegador y seleccione "Agregar a la pantalla principal" o "Instalar aplicación".',
      },
    ],
    features: [
      'Acceso rápido desde el cajón de aplicaciones de Android.',
      'Captura de fotografías de evidencias directamente desde la cámara del dispositivo.',
      'Diseño 100% Mobile-First adaptado a pantallas de teléfonos y tablets.',
      'Sincronización segura con el servidor central INSAI mediante HTTPS.',
    ],
    tips: [
      'Mantenga su teléfono con al menos 20% de batería al salir a jornadas extensas de inspección.',
      'Para actualizar la app, simplemente descargue la nueva versión del APK e instálela sobre la existente; sus datos no se perderán.',
    ],
    mediaSlots: [
      {
        label: 'Demostración de Instalación en Android',
        desc: 'Captura de pantalla de la descarga del APK y pasos de instalación en el teléfono.',
        type: 'image',
      },
      {
        label: 'Video Tutorial: Uso de la App Móvil en Campo',
        desc: 'Video demostrativo de cómo levantar una inspección desde el móvil.',
        type: 'video',
      },
    ],
  },
  {
    id: 'solicitudes',
    name: 'Solicitudes de Inspección',
    shortName: 'Solicitudes',
    icon: ClipboardList,
    color: 'blue',
    category: 'Flujo Técnico',
    summary: 'Recepción, registro y categorización de solicitudes de inspección fitosanitaria y zoosanitaria.',
    objective: 'Canalizar las peticiones de productores agrícolas y pecuarios para programar las visitas técnicas pertinentes.',
    steps: [
      {
        title: 'Paso 1: Abrir Nueva Solicitud',
        desc: 'Haga clic en el botón "+ Nueva Solicitud" en la barra de herramientas del módulo.',
      },
      {
        title: 'Paso 2: Completar el Asistente (Wizard)',
        desc: 'Seleccione el tipo de trámite (Fitosanitario, Zoosanitario o Silos), busque el cliente/productor y asocie el predio o finca donde se realizará la labor.',
      },
      {
        title: 'Paso 3: Revisión y Confirmación',
        desc: 'Verifique los datos diligenciados y confirme el registro. La solicitud quedará en estatus "PENDIENTE" lista para ser planificada.',
      },
    ],
    features: [
      'Búsqueda en vivo de productores por cédula, RIF o razón social.',
      'Asociación automática de predios registrados para el productor seleccionado.',
      'Filtros por estatus (Pendiente, Planificada, Inspeccionada, Rechazada).',
      'Exportación rápida de listados a formatos estándar.',
    ],
    tips: [
      'Asegúrese de que el productor tenga su predio previamente registrado para agilizar la creación de la solicitud.',
    ],
    mediaSlots: [
      {
        label: 'Formulario de Nueva Solicitud',
        desc: 'Captura de pantalla del formulario de solicitud con productor y predio seleccionados.',
        type: 'image',
      },
    ],
  },
  {
    id: 'planificaciones',
    name: 'Planificación de Rutas y Brigadas',
    shortName: 'Planificaciones',
    icon: ClipboardList,
    color: 'amber',
    category: 'Flujo Técnico',
    summary: 'Asignación de fechas, inspectores responsables y vehículos para las visitas técnicas.',
    objective: 'Organizar logísticamente las inspecciones de campo para maximizar la cobertura del personal y optimizar recursos vehiculares.',
    steps: [
      {
        title: 'Paso 1: Crear Planificación',
        desc: 'Presione "Nueva Planificación" y elija la solicitud pendiente que desea atender.',
      },
      {
        title: 'Paso 2: Asignar Recursos',
        desc: 'Defina la fecha estimada de la visita, seleccione la unidad vehicular disponible y agregue los inspectores técnicos que integrarán la brigada.',
      },
      {
        title: 'Paso 3: Guardar y Notificar',
        desc: 'Al guardar, la solicitud pasa a estado "PLANIFICADA" y los inspectores podrán visualizarla en sus listas de trabajo.',
      },
    ],
    features: [
      'Asignación múltiple de empleados e inspectores a una misma ruta.',
      'Control de disponibilidad vehicular en tiempo real.',
      'Generación de hoja de ruta de inspección.',
    ],
    tips: [
      'Si un inspector no aparece en la lista, verifique en el módulo de Empleados que tenga estatus Activo y sede asignada.',
    ],
    mediaSlots: [
      {
        label: 'Asignación de Brigada y Vehículo',
        desc: 'Captura del modal de planificación con selección de fecha, técnicos y vehículo.',
        type: 'image',
      },
    ],
  },
  {
    id: 'inspecciones',
    name: 'Inspecciones Generales de Campo',
    shortName: 'Inspecciones',
    icon: FileText,
    color: 'emerald',
    category: 'Flujo Técnico',
    summary: 'Levantamiento de actas oficiales de inspección fitosanitaria y zoosanitaria en predios.',
    objective: 'Certificar las condiciones sanitarias de los cultivos y animales, documentar anomalías y ordenar medidas correctivas oficiales.',
    steps: [
      {
        title: 'Paso 1: Iniciar Acta de Inspección',
        desc: 'Haga clic en "+ Nueva Inspección" o cree el acta directamente desde una planificación en curso.',
      },
      {
        title: 'Paso 2: Diligenciar Aspectos Sanitarios',
        desc: 'Registre fecha, semana epidemiológica, estatus (Aprobada, No Aprobada, Cuarentena) y detalle las observaciones constatadas.',
      },
      {
        title: 'Paso 3: Cargar Evidencias Fotográficas',
        desc: 'Adjunte fotografías claras de los cultivos, semovientes o síntomas de plagas/enfermedades detectadas.',
      },
      {
        title: 'Paso 4: Emitir Acta PDF',
        desc: 'El sistema genera automáticamente el Acta Oficial en formato PDF firmable con código de validación institucional.',
      },
    ],
    features: [
      'Generador de informes PDF de alta fidelidad con membrete oficial del INSAI.',
      'Galería de fotos de evidencia integrada por acta.',
      'Historial de inspecciones previas realizadas en el mismo predio.',
    ],
    tips: [
      'Puede reimprimir el Acta Oficial en cualquier momento haciendo clic en el icono "Acta PDF" de la tabla o tarjeta.',
    ],
    mediaSlots: [
      {
        label: 'Registro de Inspección y Carga de Fotos',
        desc: 'Captura del modal de inspección con evidencia fotográfica cargada.',
        type: 'image',
      },
      {
        label: 'Vista Previa del Acta Oficial en PDF',
        desc: 'Captura del documento PDF generado listo para firma y sello.',
        type: 'image',
      },
    ],
  },
  {
    id: 'silos',
    name: 'Fiscalización e Inspección de Silos',
    shortName: 'Silos y Almacenes',
    icon: Warehouse,
    color: 'teal',
    category: 'Flujo Técnico',
    summary: 'Inspección técnica de silos, plantas agroindustriales y galpones de almacenamiento.',
    objective: 'Monitorear la reserva estratégica de alimentos, capacidad instalada y condiciones higiénico-sanitarias de granos almacenados.',
    steps: [
      {
        title: 'Paso 1: Vincular Planificación',
        desc: 'Seleccione la planificación asociada a la inspección de la planta o silo correspondiente.',
      },
      {
        title: 'Paso 2: Registrar Capacidades y Silos',
        desc: 'Indique número de silos, galpones, capacidad instalada, operativa y volumen de almacenamiento actual.',
      },
      {
        title: 'Paso 3: Métricas de Afectación y Medidas',
        desc: 'Especifique la cantidad de producto nacional e importado, porcentaje de afectación por plagas de granos y recomendaciones de control.',
      },
    ],
    features: [
      'Asistente de 3 pasos (Planificación, Control de Silos y Métricas).',
      'Cálculo automático de porcentajes de afectación.',
      'Acta de Inspección de Silos en PDF con estadísticas detalladas.',
    ],
    tips: [
      'Al editar un acta existente, la planificación asociada se precarga automáticamente garantizando la integridad histórica.',
    ],
    mediaSlots: [
      {
        label: 'Planilla de Control de Silos',
        desc: 'Captura de pantalla de los pasos del formulario de silos.',
        type: 'image',
      },
    ],
  },
  {
    id: 'avales',
    name: 'Avales Sanitarios Zoosanitarios',
    shortName: 'Avales Sanitarios',
    icon: ShieldCheck,
    color: 'blue',
    category: 'Flujo Técnico',
    summary: 'Emisión de certificados y avales zoosanitarios para movilización y control de rebaños.',
    objective: 'Acreditar el estatus sanitario libre de enfermedades de control oficial (Fiebre Aftosa, Brucelosis, Tuberculosis, etc.).',
    steps: [
      {
        title: 'Paso 1: Datos Generales',
        desc: 'Ingrese el número de aval, código de predio y vincule la solicitud o inspección que respalda la certificación.',
      },
      {
        title: 'Paso 2: Matriz Epidemiológica de Rebaño',
        desc: 'Registre el censo de cabezas discriminado por categoría (Toros, Vacas, Novillos, Mautes, Becerros, Búfalos).',
      },
      {
        title: 'Paso 3: Biológicos y Marcas de Hierro',
        desc: 'Especifique vacunas aplicadas, laboratorios, lotes, fechas de vencimiento y adjunte fotografías de las marcas de hierro del productor.',
      },
    ],
    features: [
      'Matriz de cálculo dinámico del total de cabezas auditadas.',
      'Soporte para múltiples especies (bovinos, bufalinos, porcinos, aves, caprinos).',
      'Certificado de Aval Sanitario oficial descargable en PDF.',
    ],
    tips: [
      'El total de cabezas se recalcula automáticamente conforme ingresa los valores en cada categoría.',
    ],
    mediaSlots: [
      {
        label: 'Matriz de Rebaño y Biológicos',
        desc: 'Captura de pantalla de la pestaña de especies y vacunas del aval.',
        type: 'image',
      },
    ],
  },
  {
    id: 'seguimientos',
    name: 'Seguimientos y Verificación de Medidas',
    shortName: 'Seguimientos',
    icon: Activity,
    color: 'indigo',
    category: 'Flujo Técnico',
    summary: 'Supervisión posterior a inspecciones para verificar el cumplimiento de observaciones sanitarias.',
    objective: 'Garantizar que los productores corrijan las anomalías detectadas durante la inspección antes de levantar cuarentenas o emitir avales.',
    steps: [
      {
        title: 'Paso 1: Seleccionar Inspección de Origen',
        desc: 'Elija la inspección previa que amerita seguimiento técnico.',
      },
      {
        title: 'Paso 2: Evaluar Hallazgos y Cumplimiento',
        desc: 'Verifique si las recomendaciones fueron cumplidas al 100% mediante el switch interactivo y describa lo constatado.',
      },
      {
        title: 'Paso 3: Dictamen Sanitario',
        desc: 'Actualice el estado a "Cumplido", "En Proceso" o mantenga "Cuarentena" si persisten riesgos.',
      },
    ],
    features: [
      'Línea de tiempo cronológica histórica de todas las visitas realizadas a un predio.',
      'Informe técnico de seguimiento en formato PDF.',
      'Subida de fotos comparativas de antes y después.',
    ],
    tips: [
      'Consulte la "Línea de Tiempo" para ver la evolución de un caso desde la primera visita.',
    ],
    mediaSlots: [
      {
        label: 'Línea de Tiempo de Seguimientos',
        desc: 'Captura del modal con la cronología de visitas de control.',
        type: 'image',
      },
    ],
  },
  {
    id: 'inventario',
    name: 'Inventario y Kardex de Insumos',
    shortName: 'Inventario & Kardex',
    icon: Layers,
    color: 'purple',
    category: 'Logística',
    summary: 'Administración de biológicos, vacunas, agroquímicos e insumos de oficina por sede.',
    objective: 'Llevar un control estricto de entradas, salidas, mermas y auditoría de insumos oficiales asignados a cada sede regional.',
    steps: [
      {
        title: 'Paso 1: Catálogo Maestro',
        desc: 'Registre insumos con su nombre, categoría, unidad de medida y stock mínimo sugerido.',
      },
      {
        title: 'Paso 2: Registrar Movimiento Kardex',
        desc: 'Presione "Movimiento Kardex" para registrar una ENTRADA (compra, dotación) o SALIDA (uso en inspección, merma) con su respectiva justificación.',
      },
      {
        title: 'Paso 3: Auditoría y Existencias',
        desc: 'Verifique en la pestaña "Existencias por Sede" las cantidades disponibles en tiempo real.',
      },
    ],
    features: [
      'Alertas visuales de stock crítico en rojo cuando las unidades caen por debajo del umbral mínimo.',
      'Trazabilidad total: cada movimiento registra fecha, usuario, tipo y motivo.',
      'Separación multi-sede: el inventario físico respeta la instancia operativa actual.',
    ],
    tips: [
      'Al consumir insumos durante una inspección, regístrelos inmediatamente para mantener la fidelidad del Kardex.',
    ],
    mediaSlots: [
      {
        label: 'Panel de Kardex y Existencias',
        desc: 'Captura de pantalla de la tabla de movimientos e indicadores de stock.',
        type: 'image',
      },
    ],
  },
  {
    id: 'productores',
    name: 'Productores y Predios Agrícolas',
    shortName: 'Productores & Predios',
    icon: Users,
    color: 'emerald',
    category: 'Catálogos Base',
    summary: 'Censo de productores agropecuarios y caracterización geográfica de fincas y fundos.',
    objective: 'Mantener un registro geográfico exacto de los actores agrícolas para agilizar trámites y análisis epidemiológicos.',
    steps: [
      {
        title: 'Paso 1: Registro con Asistente (Wizard)',
        desc: 'Diligencie los datos personales o jurídicos del productor (Cédula/RIF, nombres, teléfonos, dirección).',
      },
      {
        title: 'Paso 2: Agregar Predios Asociados',
        desc: 'Dentro de la ficha del productor, agregue los fundos indicando Estado, Municipio, Parroquia y Sector específico.',
      },
    ],
    features: [
      'Validación de cédulas venezolanas y RIF de empresas agrícolas.',
      'Filtros por municipio y parroquia.',
      'Ficha técnica del productor exportable en PDF.',
    ],
    tips: [
      'Un productor puede tener múltiples predios asignados en distintas localidades.',
    ],
    mediaSlots: [
      {
        label: 'Asistente de Registro de Productores',
        desc: 'Captura del formulario guiado de alta de productor.',
        type: 'image',
      },
    ],
  },
  {
    id: 'configuracion',
    name: 'Configuraciones, Respaldos y Seguridad',
    shortName: 'Configuraciones',
    icon: Settings,
    color: 'slate',
    category: 'Administración',
    summary: 'Copias de seguridad automáticas de base de datos, gestión de carpetas y perfiles con MFA.',
    objective: 'Garantizar la resiliencia operativa del sistema, protección de datos ante fallos y control de accesos.',
    steps: [
      {
        title: 'Paso 1: Generar Respaldo Manual',
        desc: 'Seleccione la base de datos (Operativa o Master) y haga clic en "Crear Respaldo Ahora".',
      },
      {
        title: 'Paso 2: Configurar Respaldos Automáticos',
        desc: 'Active la programación diaria o semanal a una hora no laboral (ej. 02:00 AM) y defina el límite de copias a conservar.',
      },
      {
        title: 'Paso 3: Activar Autenticación en Dos Pasos (MFA)',
        desc: 'En su Perfil de usuario, escanee el código QR con Google Authenticator para proteger su cuenta institucional.',
      },
    ],
    features: [
      'Rotación automática de copias de seguridad para no saturar el almacenamiento del servidor.',
      'Descarga directa de archivos SQL de respaldo.',
      'Doble factor de autenticación (2FA / TOTP) obligatorio para cuentas con permisos críticos.',
    ],
    tips: [
      'Descargue periódicamente una copia de seguridad fuera del servidor para resguardo físico.',
    ],
    mediaSlots: [
      {
        label: 'Panel de Respaldos de Base de Datos',
        desc: 'Captura de las métricas de espacio y configuración de respaldos automáticos.',
        type: 'image',
      },
    ],
  },
];

export default function Help() {
  const navigate = useNavigate();
  const [selectedModuleId, setSelectedModuleId] = useState<string>('app');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredModules = MODULES_HELP.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.shortName.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  const activeModule = MODULES_HELP.find((m) => m.id === selectedModuleId) || MODULES_HELP[0];
  const ActiveIcon = activeModule.icon;

  return (
    <div className="p-4 sm:p-6 lg:p-10 space-y-6 max-w-7xl mx-auto w-full min-w-0 overflow-hidden sm:overflow-visible animate-in fade-in duration-300 pb-28 sm:pb-32">
      {/* ── HEADER PRINCIPAL DE AYUDA (MOBILE FIRST) ─────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4 sm:pb-5 min-w-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shrink-0 mt-0.5"
            title="Volver al Panel Principal"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-start sm:items-center gap-2 min-w-0">
              <span className="p-2 rounded-2xl bg-primary/10 text-primary shrink-0 mt-0.5 sm:mt-0">
                <HelpCircle className="size-5 sm:size-6" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight wrap-break-words wrap:anywhere min-w-0 leading-tight">
                Centro de Ayuda y Guía de Usuario
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed wrap-break-words">
              Manual interactivo paso a paso, funcionalidades por módulo y descarga de la aplicación móvil APK.
            </p>
          </div>
        </div>

        {/* Botón Destacado de Descarga de APK */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href="/app-release.apk"
            download="SICIC-INSAI-v2.0.apk"
            type="application/vnd.android.package-archive"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            <Smartphone className="size-4 shrink-0" />
            <span className="wrap-break-words">Descargar APK Móvil</span>
            <Download className="size-3.5 opacity-80 shrink-0" />
          </a>
        </div>
      </div>

      {/* ── BARRA DE BÚSQUEDA Y NAVEGACIÓN MÓVIL ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tema, módulo o procedimiento..."
            className="pl-10 h-11 rounded-2xl bg-card border-border text-xs sm:text-sm shadow-xs"
          />
        </div>

        {/* Selector rápido móvil */}
        <div className="lg:hidden w-full overflow-x-auto no-scrollbar pb-1">
          <div className="inline-flex gap-1.5 p-1 bg-muted/30 rounded-2xl border border-border min-w-full">
            {filteredModules.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activeModule.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleId(m.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0",
                    isSelected
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span>{m.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CUERPO PRINCIPAL: SIDEBAR EN ESCRITORIO + DETALLE DEL MÓDULO ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0 max-w-full">
        {/* Sidebar Desktop (col-span-4) */}
        <div className="hidden lg:block lg:col-span-4 space-y-2 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md p-3 shadow-xs h-fit sticky top-24">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground px-3 pt-2 pb-1">
            Módulos del Sistema
          </p>
          <div className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto custom-scrollbar pr-1">
            {filteredModules.map((m) => {
              const Icon = m.icon;
              const isSelected = m.id === activeModule.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModuleId(m.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer group",
                    isSelected
                      ? "bg-primary text-white shadow-md shadow-primary/20 font-bold"
                      : "text-foreground hover:bg-muted/50 font-medium"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-9 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-primary/10 text-primary group-hover:bg-primary/20"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold wrap-break-words wrap:anywhere leading-tight block">{m.name}</p>
                      <span
                        className={cn(
                          "text-[10px] block wrap-break-words wrap:anywhere mt-0.5",
                          isSelected ? "text-white/80" : "text-muted-foreground"
                        )}
                      >
                        {m.category}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      isSelected ? "text-white translate-x-0.5" : "text-muted-foreground/50 opacity-0 group-hover:opacity-100"
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Área de Contenido Detallado (col-span-8) */}
        <div className="lg:col-span-8 space-y-6 min-w-0 max-w-full">
          {/* Tarjeta de Encabezado del Módulo */}
          <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-4 min-w-0 max-w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <ActiveIcon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-primary border-primary/30 bg-primary/5">
                      {activeModule.category}
                    </Badge>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black text-foreground tracking-tight wrap-break-words mt-1">
                    {activeModule.name}
                  </h2>
                </div>
              </div>

              {activeModule.id === 'app' && (
                <a
                  href="/app-release.apk"
                  download="SICIC-INSAI-v2.0.apk"
                  type="application/vnd.android.package-archive"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all shrink-0"
                >
                  <Download className="size-3.5" />
                  <span>Descargar APK</span>
                </a>
              )}
            </div>

            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed wrap-break-words bg-muted/20 p-3.5 rounded-2xl border border-border/50">
              <strong className="text-primary font-bold">Objetivo: </strong>
              {activeModule.objective}
            </p>
          </div>

          {/* Guía Paso a Paso */}
          <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5 min-w-0 max-w-full">
            <div className="flex items-center gap-2 pb-1 border-b border-border/40">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                Flujo de Trabajo y Procedimiento Paso a Paso
              </h3>
            </div>

            <div className="space-y-4 min-w-0">
              {activeModule.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-background/80 border border-border/60 shadow-xs flex items-start gap-3.5 min-w-0"
                >
                  <div className="size-7 sm:size-8 rounded-xl bg-primary/10 text-primary font-black text-xs sm:text-sm flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground wrap-break-words">
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed wrap-break-words">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Características Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0 max-w-full">
            <div className="p-5 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-3 min-w-0">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <h4 className="font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider">
                  Funcionalidades Clave
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {activeModule.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="wrap-break-words leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-3 min-w-0">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4 text-emerald-500" />
                <h4 className="font-bold text-xs sm:text-sm text-foreground uppercase tracking-wider">
                  Consejos & Buenas Prácticas
                </h4>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {activeModule.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span className="wrap-break-words leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── ESPACIOS RESERVADOS PARA IMÁGENES / VIDEOS DEL MÓDULO ─── */}
          <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5 min-w-0 max-w-full">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-blue-500" />
                <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                  Evidencias Visuales y Tutoriales
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Espacios listos para contenido multimedia
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              {activeModule.mediaSlots.map((slot, i) => (
                <div
                  key={i}
                  className="rounded-2xl sm:rounded-3xl border-2 border-dashed border-border/80 hover:border-primary/50 bg-muted/15 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-2.5 transition-all group min-w-0"
                >
                  <div className="size-12 sm:size-14 rounded-2xl bg-muted/40 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 flex items-center justify-center transition-colors shadow-xs">
                    {slot.type === 'video' ? (
                      <Video className="size-6 sm:size-7" />
                    ) : (
                      <ImageIcon className="size-6 sm:size-7" />
                    )}
                  </div>
                  <div className="space-y-1 min-w-0 w-full">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold mb-1">
                      {slot.type === 'video' ? 'Video Demostrativo' : 'Captura de Pantalla'}
                    </Badge>
                    <p className="text-xs sm:text-sm font-bold text-foreground wrap-break-words">
                      {slot.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed wrap-break-words px-2">
                      {slot.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

