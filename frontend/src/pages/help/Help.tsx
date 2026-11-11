import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Smartphone,
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
  BookOpen,
  Download,
  Star,
  Mail,
  Phone,
  HardDrive,
  Server,
  Wifi,
  Cpu,
  Maximize2,
  X,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { mailService } from '@/services/mail.service';
import { toast } from 'sonner';

interface StepGuide {
  title: string;
  desc: string;
}

interface MediaSlot {
  label: string;
  desc: string;
  type: 'image' | 'video';
  url?: string;
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
  mediaSlots: MediaSlot[];
}

const MODULES_HELP: ModuleHelp[] = [
  {
    id: 'app',
    name: 'Aplicación Móvil (PWA Auto-actualizable)',
    shortName: 'App Móvil (PWA)',
    icon: Smartphone,
    color: 'emerald',
    category: 'Acceso Móvil',
    summary: 'Instalación en 1 clic y uso de la Progressive Web App para inspectores de campo.',
    objective: 'Permitir a los técnicos e inspectores levantar actas, tomar fotografías in situ y consultar información sin depender de una computadora, con actualización automática instantánea.',
    steps: [
      {
        title: 'Paso 1: Ingresar desde el navegador móvil',
        desc: 'Abra la dirección del sistema en Chrome, Safari o su navegador móvil preferido.',
      },
      {
        title: 'Paso 2: Pulsar "Instalar en el dispositivo"',
        desc: 'Aparecerá automáticamente un banner institucional en la parte inferior o superior con el botón "Instalar en el dispositivo". Si usa Safari (iOS), toque Compartir y luego "Agregar al inicio".',
      },
      {
        title: 'Paso 3: Acceso directo con icono oficial',
        desc: 'La app se agregará a su pantalla de inicio con el escudo oficial del INSAI y se abrirá en pantalla completa directamente en el Login.',
      },
      {
        title: 'Actualizaciones automáticas transparentes',
        desc: 'Cada vez que el servidor publica una nueva versión o mejora, la PWA se actualiza automáticamente en segundo plano sin necesidad de reinstalar ni descargar archivos.',
      },
    ],
    features: [
      'Acceso rápido directo desde la pantalla principal de Android e iOS.',
      'Auto-actualización inmediata sin compilar ni descargar APKs pesados.',
      'Captura de fotografías de evidencias directamente desde la cámara del dispositivo.',
      'Diseño 100% Mobile-First adaptado con barra de navegación inferior optimizada.',
      'Sincronización segura con el servidor central INSAI mediante HTTPS.',
    ],
    tips: [
      'Si el banner de instalación no aparece, pulse el menú de tres puntos de Chrome y seleccione "Instalar aplicación" o "Agregar a la pantalla principal".',
      'No requiere habilitar orígenes desconocidos ni permisos de desarrollador.',
    ],
    mediaSlots: [
      {
        label: 'Vista Móvil y Acceso Institucional',
        desc: 'Interfaz adaptable para inspectores en campo con acceso táctil optimizado.',
        type: 'image',
        url: '/help-captures/app-mobile-view.jpg',
      },
      {
        label: 'Centro de Ayuda Móvil',
        desc: 'Navegación reactiva de módulos y guías directamente desde el teléfono.',
        type: 'image',
        url: '/help-captures/centro-ayuda.jpg',
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
        label: 'Formulario Asistido de Nueva Solicitud',
        desc: 'Captura de pantalla del formulario con productor y predio seleccionados.',
        type: 'image',
        url: '/help-captures/solicitudes-wizard.png',
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
        title: 'Paso 2: Designar Comisión Técnica e Inspector Jefe',
        desc: 'El primer inspector seleccionado (posición 0) asume como Inspector Jefe con potestad de vaciado y código con su cédula. Los acompañantes operan en modo solo lectura.',
      },
      {
        title: 'Paso 3: Asignar Vehículo y Guardar',
        desc: 'Defina la unidad vehicular disponible. La solicitud pasa a estado "PLANIFICADA" y se envía notificación por correo.',
      },
    ],
    features: [
      'Diferenciación estricta de comisión técnica: Inspector Jefe vs Acompañantes.',
      'Generación automática de código territorial vinculado al Inspector Jefe.',
      'Vistas alternativas: Listado general y Calendario mensual interactivo.',
      'Control de disponibilidad vehicular en tiempo real.',
    ],
    tips: [
      'Solo el Inspector Jefe puede ejecutar el vaciado del acta; los acompañantes disponen del icono de ojo para consulta.',
    ],
    mediaSlots: [
      {
        label: 'Planificación y Asignación de Brigada',
        desc: 'Listado oficial de planificaciones con equipo técnico y estado operativo.',
        type: 'image',
        url: '/help-captures/planificaciones.png',
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
        desc: 'Adjunte fotografías claras de los cultivos, semovientes o síntomas de plagas/enfermedades detectadas in situ.',
      },
      {
        title: 'Paso 4: Emitir Acta PDF',
        desc: 'El sistema genera automáticamente el Acta Oficial en formato PDF firmable con código de validación institucional.',
      },
    ],
    features: [
      'Generador de informes PDF de alta fidelidad con membrete oficial del INSAI.',
      'Galería de fotos de evidencia integrada con almacenamiento adaptativo.',
      'Historial de inspecciones previas realizadas en el mismo predio.',
    ],
    tips: [
      'Puede reimprimir el Acta Oficial en cualquier momento haciendo clic en el icono de PDF de la tabla.',
    ],
    mediaSlots: [
      {
        label: 'Evidencia Fotográfica de Inspección en Campo',
        desc: 'Fotografía in situ tomada por inspectores durante la visita técnica.',
        type: 'image',
        url: '/help-captures/inspeccion-campo.jpg',
      },
      {
        label: 'Vista Previa del Acta Oficial en PDF',
        desc: 'Documento institucional generado listo para firma y sello oficial.',
        type: 'image',
        url: '/help-captures/acta-inspeccion.jpg',
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
      'Asistente de 3 pasos (Planificación, Control de Silos y Métricas de Calidad).',
      'Cálculo automático de porcentajes de afectación y humedad.',
      'Acta de Inspección de Silos en PDF con estadísticas detalladas.',
    ],
    tips: [
      'Al editar un acta existente, la planificación asociada se precarga automáticamente garantizando la integridad histórica.',
    ],
    mediaSlots: [
      {
        label: 'Formulario Técnico de Silos y Almacenes',
        desc: 'Captura de pantalla de los pasos del formulario de evaluación de silos.',
        type: 'image',
        url: '/help-captures/silos-inspeccion.png',
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
    objective: 'Acreditar el estatus sanitario libre de enfermedades de control oficial (Fiebre Aftosa, Brucelosis, Rabia, etc.).',
    steps: [
      {
        title: 'Paso 1: Datos Generales y Fechas',
        desc: 'Defina número de aval, predio, médico veterinario y fechas de emisión y vencimiento (el sistema calcula automáticamente el total de días de vigencia).',
      },
      {
        title: 'Paso 2: Carga Dual de Biológicos',
        desc: 'Seleccione vacunas existentes del inventario central o ingrese libremente los datos de forma manual (vacuna, lote, marca, fecha y pruebas diagnósticas).',
      },
      {
        title: 'Paso 3: Censo Animal y Marcas de Hierro',
        desc: 'Registre el rebaño bovino/bufalino y otras especies (machos, hembras, crías). Adjunte las imágenes de los hierros ganaderos.',
      },
    ],
    features: [
      'Cálculo dinámico de días de vigencia total con semáforo visual (Vigente / Por Vencer / Vencido).',
      'Modalidad dual de biológicos: selección de inventario o entrada manual.',
      'Soporte completo para especies secundarias (ovinos, caprinos, porcinos, aves, equinos).',
      'Visualizador de marcas de hierro ganadero sin enlaces rotos.',
    ],
    tips: [
      'El modal de detalle incluye la etiqueta [VIGENCIA: X DÍAS TOTALES] para mayor claridad al productor.',
    ],
    mediaSlots: [
      {
        label: 'Ficha Detallada del Aval Zoosanitario',
        desc: 'Modal técnico con censo animal, cálculo dinámico de vigencia y marcas de hierro.',
        type: 'image',
        url: '/help-captures/avales-modal.jpg',
      },
      {
        label: 'Certificado Oficial de Aval Sanitario (PDF)',
        desc: 'Documento impreso oficial con tabla de biológicos aplicados y sello institucional.',
        type: 'image',
        url: '/help-captures/avales-reporte.jpg',
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
        label: 'Gestión y Seguimiento de Actas Sanitarias',
        desc: 'Supervisión continua del estatus de predios bajo medidas cautelares.',
        type: 'image',
        url: '/help-captures/inspecciones-general.png',
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
        title: 'Paso 1: Catálogo Maestro de Insumos',
        desc: 'Registre insumos con su nombre, categoría, unidad de medida y stock mínimo sugerido.',
      },
      {
        title: 'Paso 2: Registrar Movimiento Kardex',
        desc: 'Presione "Movimiento Kardex" para registrar una ENTRADA (compra, dotación) o SALIDA (inspección, merma) con su justificación.',
      },
      {
        title: 'Paso 3: Eliminación y Gestión en Lote',
        desc: 'Seleccione múltiples casillas en la tabla y utilice la barra flotante inferior para operaciones masivas.',
      },
    ],
    features: [
      'Barra flotante inferior para eliminación y control en lote con diseño Mobile-First.',
      'Alertas visuales de stock crítico (rojo) y fechas próximas a vencer (amarillo).',
      'Trazabilidad total: cada movimiento registra fecha, usuario, tipo y motivo.',
      'Separación multi-sede: el inventario físico respeta la instancia operativa actual.',
    ],
    tips: [
      'Al seleccionar insumos en la tabla, la barra flotante inferior aparecerá automáticamente con el contador de elementos elegidos.',
    ],
    mediaSlots: [
      {
        label: 'Panel de Kardex con Selección Masiva en Lote',
        desc: 'Catálogo de biológicos con barra flotante y control de existencias.',
        type: 'image',
        url: '/help-captures/inventario-kardex.png',
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
      'Filtros geográficos avanzados por municipio, parroquia y sector.',
      'Ficha técnica del productor exportable en PDF con predios vinculados.',
    ],
    tips: [
      'Un productor puede tener múltiples predios asignados en distintas localidades geográficas.',
    ],
    mediaSlots: [
      {
        label: 'Censo Territorial de Productores y Predios',
        desc: 'Ficha estructurada con datos de contacto y fundos pecuarios/agrícolas.',
        type: 'image',
        url: '/help-captures/productores-predios.png',
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
        desc: 'Active la programación diaria a las 02:00 AM y defina la política de retención para rotar copias antiguas.',
      },
      {
        title: 'Paso 3: Activar Autenticación en Dos Pasos (MFA)',
        desc: 'En su Perfil de usuario, escanee el código QR con Google Authenticator para proteger su cuenta institucional.',
      },
    ],
    features: [
      'Estrategia de respaldo lógico con PostgreSQL (pg_dump formato binario -Fc).',
      'Rotación automática de copias de seguridad locales y sincronización off-site.',
      'Doble factor de autenticación (2FA / TOTP) obligatorio para cuentas con permisos críticos.',
    ],
    tips: [
      'Consulte la guía oficial de respaldos en backend/docs/estrategia_respaldos_y_recuperacion.md para scripts en Windows y Linux.',
    ],
    mediaSlots: [
      {
        label: 'Panel de Respaldos y Seguridad',
        desc: 'Administración de copias de seguridad de bases de datos Master y Operativa.',
        type: 'image',
        url: '/help-captures/centro-ayuda.jpg',
      },
    ],
  },
  {
    id: 'requisitos-manuales',
    name: 'Requisitos del Proyecto y Manuales Oficiales',
    shortName: 'Requisitos & Manuales',
    icon: BookOpen,
    color: 'blue',
    category: 'Documentación Oficial',
    summary: 'Requisitos técnicos de hardware, software, red y descarga directa de los 3 manuales oficiales.',
    objective: 'Orientar a los administradores y usuarios sobre los requerimientos de hardware/software del sistema y proporcionar acceso directo a los manuales oficiales descargables.',
    steps: [
      {
        title: 'Paso 1: Verificar Requisitos de Servidor y Red',
        desc: 'Asegure un servidor con CPU 2.0+ GHz, 4-8 GB RAM y 20 GB SSD con PostgreSQL 14+ y Node.js 18+.',
      },
      {
        title: 'Paso 2: Consultar Modalidad de Conectividad',
        desc: 'Verifique si el entorno utilizará conexión local directa o túnel seguro Cloudflare Zero Trust (cloudflared).',
      },
      {
        title: 'Paso 3: Descargar el Manual Requerido',
        desc: 'Utilice los botones de descarga directa para obtener el Manual de Instalación, Manual Técnico o Manual de Usuario en PDF.',
      },
    ],
    features: [
      'Especificaciones detalladas de hardware para servidor y terminales móviles.',
      'Descarga en 1 clic del Manual de Instalación y Despliegue Oficial en PDF.',
      'Descarga en 1 clic del Manual Técnico y de Arquitectura del Sistema en PDF.',
      'Descarga en 1 clic del Manual de Usuario Final e Inspector de Campo en PDF.',
      'Guía de configuración para despliegue híbrido con Cloudflare Zero Trust.',
    ],
    tips: [
      'Los manuales en PDF pueden guardarse en dispositivos móviles para consulta sin conexión durante labores de campo.',
      'Para nuevos despliegues en servidores Windows o Linux, siga minuciosamente la secuencia descrita en el Manual de Instalación.',
    ],
    mediaSlots: [
      {
        label: 'Ecosistema de Manuales y Despliegue',
        desc: 'Arquitectura de documentación técnica y manuales institucionales.',
        type: 'image',
        url: '/help-captures/centro-ayuda.jpg',
      },
    ],
  },
  {
    id: 'valoracion',
    name: 'Valoración del Sistema y Buzón de Opinión',
    shortName: 'Valoración & Feedback',
    icon: Star,
    color: 'amber',
    category: 'Soporte y Calidad',
    summary: 'Califique el sistema con estrellas y envíe sus comentarios u opiniones directamente por WhatsApp (+58 412-1698315) o Correo (baddevprograming@gmail.com).',
    objective: 'Canalizar las sugerencias, felicitaciones, reportes y opiniones de los inspectores y coordinadores hacia los canales directos del equipo desarrollador.',
    steps: [
      {
        title: 'Paso 1: Seleccionar Calificación',
        desc: 'Marque entre 1 y 5 estrellas según su experiencia de uso con la plataforma.',
      },
      {
        title: 'Paso 2: Elegir Tipo de Mensaje',
        desc: 'Indique si se trata de una Felicitación, Sugerencia de Mejora, Reporte de Incidencia o Valoración General.',
      },
      {
        title: 'Paso 3: Escribir su Comentario',
        desc: 'Exprese sus opiniones o detalles que permitan seguir optimizando la herramienta.',
      },
      {
        title: 'Paso 4: Elegir Canal de Envío',
        desc: 'Envíe su valoración directamente por WhatsApp al +58 412-1698315 con mensaje personalizado o vía Correo Electrónico a baddevprograming@gmail.com.',
      },
    ],
    features: [
      'Calificación interactiva de 1 a 5 estrellas con respuesta visual inmediata.',
      'Envío directo a WhatsApp con mensaje institucional preformateado.',
      'Envío a correo electrónico oficial mediante el servicio de notificaciones.',
      'Opción para remitir por ambos canales según preferencia del usuario.',
      'Autocompletado de datos del funcionario logueado y su sede asignada.',
    ],
    tips: [
      'Si está en el móvil, el botón de WhatsApp abrirá la aplicación oficial de WhatsApp con el mensaje ya redactado listo para pulsar Enviar.',
    ],
    mediaSlots: [
      {
        label: 'Buzón de Opinión y Calificación',
        desc: 'Formulario interactivo para recepción de feedback institucional.',
        type: 'image',
        url: '/help-captures/centro-ayuda.jpg',
      },
    ],
  },
];

export default function Help() {
  const navigate = useNavigate();
  const { user: currentUser, currentInstance } = useAuth();

  const [selectedModuleId, setSelectedModuleId] = useState<string>('app');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<MediaSlot | null>(null);

  // Estado del formulario de Valoración y Feedback
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Valoración General');
  const [feedbackName, setFeedbackName] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackSede, setFeedbackSede] = useState<string>('');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState<boolean>(false);

  // Autocompletar datos del usuario activo al montar o cambiar
  useEffect(() => {
    if (currentUser) {
      const displayName = currentUser.username || '';
      if (!feedbackName) setFeedbackName(displayName);
      if (!feedbackEmail && currentUser.email) setFeedbackEmail(currentUser.email);
    }
    if (currentInstance?.nombre && !feedbackSede) {
      setFeedbackSede(currentInstance.nombre);
    }
  }, [currentUser, currentInstance]);

  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return MODULES_HELP;
    const q = searchQuery.toLowerCase();
    return MODULES_HELP.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.shortName.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const activeModule = MODULES_HELP.find((m) => m.id === selectedModuleId) || MODULES_HELP[0];
  const ActiveIcon = activeModule.icon;

  // Lógica de Envío por WhatsApp
  const handleSendWhatsApp = () => {
    if (!feedbackComment.trim()) {
      toast.warning('Por favor ingrese su comentario u opinión antes de enviar.');
      return;
    }

    const phone = '584121698315';
    const estrellasStr = `${rating} de 5 estrellas (${rating}/5)`;
    const usuarioStr = feedbackName.trim() || 'Usuario Institucional INSAI';
    const correoStr = feedbackEmail.trim() || 'No especificado';
    const sedeStr = feedbackSede.trim() || 'Sede INSAI';
    const fechaStr = new Date().toLocaleString('es-VE');

    const message = `[VALORACION Y OPINION - SICIZ INSAI V2.0]
Calificacion: ${estrellasStr}
Tipo / Categoria: ${feedbackCategory}
Usuario: ${usuarioStr}
Correo: ${correoStr}
Sede / Oficina: ${sedeStr}
Fecha: ${fechaStr}

Comentario:
${feedbackComment.trim()}`;

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    toast.success('Abriendo WhatsApp con su mensaje de valoración institucional...');
  };

  // Lógica de Envío por Correo Electrónico
  const handleSendEmail = async () => {
    if (!feedbackComment.trim()) {
      toast.warning('Por favor ingrese su comentario u opinión antes de enviar.');
      return;
    }

    setIsSendingEmail(true);
    try {
      await mailService.sendFeedback({
        estrellas: rating,
        categoria: feedbackCategory,
        nombre: feedbackName.trim() || 'Usuario Institucional',
        email: feedbackEmail.trim() || undefined,
        sede: feedbackSede.trim() || undefined,
        comentario: feedbackComment.trim(),
      });

      setEmailSentSuccess(true);
      toast.success('Valoración enviada exitosamente al correo baddevprograming@gmail.com');
      setTimeout(() => setEmailSentSuccess(false), 8000);
    } catch (error: any) {
      console.error('Error enviando feedback:', error);
      toast.error('No se pudo enviar automáticamente por el servidor. Abriendo cliente de correo local...');

      // Fallback a mailto
      const subject = `[VALORACION SICIZ-INSAI] ${feedbackCategory} - ${rating}/5 Estrellas`;
      const body = `Usuario: ${feedbackName}\nSede: ${feedbackSede}\nCalificacion: ${rating}/5\n\nComentario:\n${feedbackComment}`;
      window.open(`mailto:baddevprograming@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

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
              Manual interactivo paso a paso, especificaciones de hardware, descarga de manuales oficiales y buzón de opinión directa.
            </p>
          </div>
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
            </div>

            <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed wrap-break-words bg-muted/20 p-3.5 rounded-2xl border border-border/50">
              <strong className="text-primary font-bold">Objetivo: </strong>
              {activeModule.objective}
            </p>
          </div>

          {/* ── PANEL ESPECIAL: REQUISITOS DEL PROYECTO Y MANUALES OFICIALES ── */}
          {activeModule.id === 'requisitos-manuales' && (
            <div className="space-y-6">
              {/* Bloque 1: Requisitos de Servidor y Entornos */}
              <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                  <Server className="size-4 text-primary" />
                  <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                    Requisitos Mínimos y Recomendados del Proyecto
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Servidor / Host */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/60 space-y-2">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs">
                      <Cpu className="size-4" />
                      <span>Servidor & Hardware</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                      <li><strong>CPU:</strong> 2 núcleos (4 recomendados).</li>
                      <li><strong>RAM:</strong> 4 GB mínimo (8 GB producción).</li>
                      <li><strong>Disco:</strong> 20 GB SSD libres.</li>
                      <li><strong>SO:</strong> Windows Server / 10 / 11 o Linux Ubuntu 20.04+.</li>
                    </ul>
                  </div>

                  {/* Base de Datos & Runtime */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/60 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                      <HardDrive className="size-4" />
                      <span>Base de Datos & Runtime</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                      <li><strong>PostgreSQL:</strong> v14, v15, v16 o v17+.</li>
                      <li><strong>Node.js:</strong> v18.x LTS o superior.</li>
                      <li><strong>Gestor:</strong> npm v9+ o pnpm.</li>
                      <li><strong>Esquema:</strong> Master y Operativa.</li>
                    </ul>
                  </div>

                  {/* Red & Conectividad */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/60 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                      <Wifi className="size-4" />
                      <span>Red & Acceso Híbrido</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                      <li><strong>Cloudflare:</strong> Túnel Zero Trust (`cloudflared`).</li>
                      <li><strong>Puertos:</strong> 4000 (Backend), 5173 (Frontend).</li>
                      <li><strong>Protocolo:</strong> HTTPS seguro con SSL.</li>
                      <li><strong>Sin IP pública:</strong> Conexión sin abrir puertos.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bloque 2: Tres Manuales Descargables */}
              <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-1 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-emerald-600" />
                    <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                      Manuales Oficiales del Sistema (Descarga en PDF)
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-600/30">
                    Versión Oficial 2.0
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Manual 1: Instalación */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <FileCheck className="size-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Manual de Instalación y Despliegue</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Guía completa para clonación, variables de entorno, migraciones con Prisma, despliegue híbrido con Cloudflare y puesta en marcha en servidores locales o en la nube.
                      </p>
                    </div>
                    <a
                      href="/manuals/manual-instalacion-despliegue.pdf"
                      download="manual-instalacion-despliegue.pdf"
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl gap-2 font-bold text-xs border-primary/40 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>Descargar Manual</span>
                      </Button>
                    </a>
                  </div>

                  {/* Manual 2: Técnico y de Sistema */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="size-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                        <Server className="size-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Manual Técnico y de Arquitectura</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Documentación técnica de la base de datos dual, middlewares de multi-tenancia, control de roles RBAC, endpoints REST, seguridad y bitácora institucional.
                      </p>
                    </div>
                    <a
                      href="/manuals/manual-tecnico-sistema.pdf"
                      download="manual-tecnico-sistema.pdf"
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl gap-2 font-bold text-xs border-primary/40 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>Descargar Manual</span>
                      </Button>
                    </a>
                  </div>

                  {/* Manual 3: Usuario e Inspector */}
                  <div className="p-4 rounded-2xl bg-background/80 border border-border/60 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                        <Users className="size-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">Manual de Usuario e Inspector</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Guía paso a paso para el trabajo en campo: levantamiento de actas, cálculo de vigencia de avales sanitarios, inspección de silos, gestión de kardex y uso móvil.
                      </p>
                    </div>
                    <a
                      href="/manuals/manual-usuario-inspector.pdf"
                      download="manual-usuario-inspector.pdf"
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl gap-2 font-bold text-xs border-primary/40 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer"
                      >
                        <Download className="size-3.5" />
                        <span>Descargar Manual</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PANEL ESPECIAL: FORMULARIO DE VALORACIÓN Y FEEDBACK DUAL ── */}
          {activeModule.id === 'valoracion' && (
            <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-1 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Star className="size-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                    Formulario Oficial de Valoración y Buzón de Sugerencias
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-amber-600 border-amber-600/30">
                  Canal Directo de Calidad
                </Badge>
              </div>

              <div className="space-y-4">
                {/* 1. Selector de Estrellas */}
                <div className="p-4 rounded-2xl bg-background/80 border border-border/60 space-y-2 text-center sm:text-left">
                  <label className="text-xs font-bold text-foreground block">
                    Califique su Experiencia General con el Sistema:
                  </label>
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    {[1, 2, 3, 4, 5].map((starValue) => {
                      const isFilled = (hoverRating || rating) >= starValue;
                      return (
                        <button
                          key={starValue}
                          type="button"
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starValue)}
                          className="p-1 hover:scale-125 transition-transform cursor-pointer focus:outline-hidden"
                          title={`${starValue} de 5 Estrellas`}
                        >
                          <Star
                            className={cn(
                              "size-7 transition-colors",
                              isFilled
                                ? "text-amber-500 fill-amber-500"
                                : "text-muted-foreground/30 hover:text-amber-400"
                            )}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-3 text-xs font-bold text-foreground bg-muted/40 px-2.5 py-1 rounded-xl">
                      {rating} / 5 Estrellas
                    </span>
                  </div>
                </div>

                {/* 2. Categoría y Datos del Remitente */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Tipo de Opinión / Asunto:</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-background border border-border text-xs font-medium focus:ring-1 focus:ring-primary focus:outline-hidden"
                    >
                      <option value="Valoración General">Valoración General</option>
                      <option value="Sugerencia de Mejora">Sugerencia de Mejora</option>
                      <option value="Felicitación al Equipo">Felicitación al Equipo</option>
                      <option value="Reporte de Incidencia">Reporte de Incidencia o Falla</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Nombre / Identificación:</label>
                    <Input
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="Su nombre o cargo institucional"
                      className="h-10 rounded-xl bg-background border-border text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Correo Electrónico (Opcional):</label>
                    <Input
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="h-10 rounded-xl bg-background border-border text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">Sede / Dependencia Territorial:</label>
                    <Input
                      value={feedbackSede}
                      onChange={(e) => setFeedbackSede(e.target.value)}
                      placeholder="Ej. Yaracuy / San Pablo"
                      className="h-10 rounded-xl bg-background border-border text-xs"
                    />
                  </div>
                </div>

                {/* 3. Textarea de Opinión */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">
                    Detalle de su Opinión, Sugerencia o Comentario:
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Escriba aquí sus observaciones, sugerencias sobre los módulos o felicitaciones..."
                    className="w-full p-3 rounded-2xl bg-background border border-border text-xs leading-relaxed focus:ring-1 focus:ring-primary focus:outline-hidden custom-scrollbar"
                  />
                </div>

                {/* Confirmación visual de éxito */}
                {emailSentSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>¡Su valoración ha sido recibida y enviada exitosamente al equipo desarrollador!</span>
                  </div>
                )}

                {/* 4. Botones Duales de Envío: WhatsApp & Correo */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  {/* Botón WhatsApp */}
                  <Button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Phone className="size-4" />
                    <span>Enviar por WhatsApp (+58 412-1698315)</span>
                  </Button>

                  {/* Botón Correo */}
                  <Button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={handleSendEmail}
                    className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Mail className="size-4" />
                    <span>
                      {isSendingEmail ? 'Enviando por Correo...' : 'Enviar por Correo (baddevprograming@gmail.com)'}
                    </span>
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground text-center">
                  Puede utilizar cualquiera de las dos vías o ambas para asegurar que su opinión sea registrada directamente por el equipo.
                </p>
              </div>
            </div>
          )}

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

          {/* ── EVIDENCIAS VISUALES Y CAPTURAS REALES DEL MÓDULO ─── */}
          <div className="p-5 sm:p-7 rounded-3xl border border-border/70 bg-card/60 backdrop-blur-md shadow-sm space-y-5 min-w-0 max-w-full">
            <div className="flex items-center justify-between gap-2 pb-1 border-b border-border/40">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-blue-500" />
                <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight">
                  Evidencias Visuales y Capturas del Módulo
                </h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Toque una imagen para ampliarla
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
              {activeModule.mediaSlots.map((slot, i) => (
                <div
                  key={i}
                  onClick={() => slot.url && setPreviewImage(slot)}
                  className={cn(
                    "rounded-2xl sm:rounded-3xl border border-border/80 bg-muted/15 overflow-hidden flex flex-col justify-between transition-all group min-w-0",
                    slot.url ? "cursor-pointer hover:border-primary/50 hover:shadow-md" : ""
                  )}
                >
                  {/* Imagen o Placeholder */}
                  <div className="relative aspect-video w-full bg-muted/30 overflow-hidden flex items-center justify-center">
                    {slot.url ? (
                      <>
                        <img
                          src={slot.url}
                          alt={slot.label}
                          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-xl bg-black/70 text-white text-[11px] font-bold flex items-center gap-1.5 backdrop-blur-xs">
                            <Maximize2 className="size-3.5" />
                            <span>Ver Captura Completa</span>
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="size-12 rounded-2xl bg-muted/40 text-muted-foreground flex items-center justify-center">
                        {slot.type === 'video' ? <Video className="size-6" /> : <ImageIcon className="size-6" />}
                      </div>
                    )}
                  </div>

                  {/* Descripción */}
                  <div className="p-4 space-y-1 min-w-0 w-full bg-background/50">
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold mb-1">
                      {slot.type === 'video' ? 'Video Demostrativo' : 'Captura Oficial'}
                    </Badge>
                    <p className="text-xs sm:text-sm font-bold text-foreground wrap-break-words">
                      {slot.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed wrap-break-words">
                      {slot.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL LIGHTBOX PARA PREVISUALIZAR CAPTURA EN GRANDE ── */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm p-4 sm:p-8 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-background rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado del visor */}
            <div className="p-4 border-b border-border flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-foreground truncate">{previewImage.label}</h4>
                <p className="text-xs text-muted-foreground truncate">{previewImage.desc}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewImage(null)}
                className="rounded-full shrink-0 hover:bg-muted"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Contenedor de la imagen */}
            <div className="p-3 bg-muted/20 flex-1 overflow-auto flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.label}
                className="max-h-[75vh] w-auto object-contain rounded-xl shadow-xs"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
