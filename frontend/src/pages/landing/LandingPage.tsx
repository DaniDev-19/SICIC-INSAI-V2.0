import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Smartphone,
  LogIn,
  CheckCircle2,
  FileText,
  Warehouse,
  Activity,
  ClipboardList,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Si la app está en modo standalone (instalada en móvil/escritorio) o es móvil, redirige directamente al login
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth < 768;

    if (isStandalone || isMobile) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* ── BARRA SUPERIOR INSTITUCIONAL (MOBILE FIRST) ────────────────── */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo y Nombre */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="size-9 sm:size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 p-1">
              <img src="/icon.png" alt="INSAI" className="size-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-foreground wrap-break-words">
                  SICIZ-INSAI
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
                Instituto Nacional de Salud Agrícola Integral
              </p>
            </div>
          </div>

          {/* Acciones del Header */}
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Button
              onClick={() => navigate('/login')}
              variant="default"
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-4 sm:px-5 font-bold text-xs sm:text-sm cursor-pointer shadow-md shadow-primary/20 gap-1.5 transition-all"
            >
              <LogIn className="size-4" />
              <span>Iniciar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 border-b border-border/40">
        {/* Luces y degradados decorativos de fondo */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 sm:size-144 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge gubernamental */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold shadow-xs">
            <ShieldCheck className="size-3.5" />
            <span>Sistema de Información para el Control de Inspecciones de Campo</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
            Control y Gestión Integral de{' '}
            <span className="bg-linear-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Inspecciones de Campo
            </span>
          </h1>

          {/* Descripción */}
          <p className="text-sm sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Plataforma oficial para la supervisión fitosanitaria, inspección de silos, emisión de avales zoosanitarios, trazabilidad epidemiológica y control de insumos agrícolas en tiempo real.
          </p>

          {/* Botones de Acción Principales */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3 max-w-md sm:max-w-none mx-auto">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="h-12 sm:h-13 px-6 sm:px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-base cursor-pointer shadow-xl shadow-primary/25 gap-2 transition-all hover:scale-[1.02]"
            >
              <span>Acceder al Sistema Web</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {/* Mini info de compatibilidad móvil */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Compatible con Android 8.0+
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Instalable como PWA en Chrome / Safari
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5 text-emerald-500" /> Arquitectura Multi-Sede
            </span>
          </div>
        </div>

        {/* Imagen o Showcase Visual */}
        <div className="max-w-4xl mx-auto mt-10 sm:mt-14 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-md shadow-2xl p-2 sm:p-4 overflow-hidden">
          <div className="relative rounded-xl sm:rounded-2xl overflow-hidden aspect-video sm:aspect-21/9 bg-muted/40 flex items-center justify-center group">
            <img
              src="/inspecciones.png"
              alt="Plataforma SICIZ-INSAI"
              className="size-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                // Fallback si la imagen no carga
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent flex items-end p-4 sm:p-6">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Despliegue Nacional
                </span>
                <p className="text-white font-bold text-sm sm:text-lg">
                  Supervisión técnica de campo en todas las sedes operativas del país.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MÓDULOS Y CAPACIDADES ────────────────────────────────────── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Ecosistema de Módulos Operativos
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Diseñado para cubrir todo el ciclo técnico institucional desde el censo hasta la auditoría.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Inspecciones Generales */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Inspecciones de Campo</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Levantamiento de actas fitosanitarias y zoosanitarias con registro de hallazgos, georreferenciación y emisión de actas PDF oficiales.
            </p>
          </div>

          {/* Card 2: Control de Silos */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
              <Warehouse className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Fiscalización de Silos</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Control de infraestructura, capacidad operativa, nivel de almacenamiento y afectaciones fitosanitarias de granos y cereales.
            </p>
          </div>

          {/* Card 3: Avales Sanitarios */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShieldCheck className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Avales Sanitarios</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Certificación de rebaño vacuno y bufalino, inventario de biológicos aplicados, marcas de hierro y dictamen de movilización animal.
            </p>
          </div>

          {/* Card 4: Seguimientos */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Activity className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Seguimientos de Control</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verificación de recomendaciones técnicas al 100%, levantamiento de medidas cautelares y control de cuarentenas epidemiológicas.
            </p>
          </div>

          {/* Card 5: Kardex de Insumos */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Layers className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Inventario & Kardex</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Control de existencia de biológicos, vacunas e insumos fitosanitarios por sede, con registro de lotes y movimientos auditados.
            </p>
          </div>

          {/* Card 6: Planificaciones */}
          <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <ClipboardList className="size-5" />
            </div>
            <h3 className="font-bold text-base text-foreground">Planificación de Rutas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Programación de inspecciones por parroquia, asignación de inspectores técnicos y disponibilidad de unidades de transporte vehicular.
            </p>
          </div>
        </div>
      </section>

      {/* ── BANNER ACCESO WEB / PWA ───────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto rounded-3xl border border-border/80 bg-card/90 backdrop-blur-xl p-6 sm:p-10 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
          <div className="space-y-2 text-center md:text-left min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold border border-emerald-500/20">
              <Smartphone className="size-3.5" />
              <span>Progressive Web App (PWA) Auto-actualizable</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Lleva el SICIZ en tu Dispositivo Móvil
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
              Genera actas en el campo, adjunta evidencias fotográficas desde la cámara y consulta datos de productores sin retrasos. Puedes instalar la aplicación directamente desde tu navegador sin descargas externas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="w-full sm:w-auto h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs sm:text-sm shadow-lg shadow-primary/20 cursor-pointer transition-all gap-2"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── FOOTER INSTITUCIONAL ─────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8 px-4 text-center text-xs text-muted-foreground space-y-2 bg-background">
        <p className="font-semibold text-foreground">
          Instituto Nacional de Salud Agrícola Integral (INSAI)
        </p>
        <p>
          Garantizando la salud fitozoosanitaria y la soberanía agroalimentaria de la Nación.
        </p>
        <p className="text-[11px] text-muted-foreground/70 pt-2">
          SICIZ-INSAI Versión 2.0 • Sistema Integral de Inspecciones de Campo
        </p>
      </footer>
    </div>
  );
}

