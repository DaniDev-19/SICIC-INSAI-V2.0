import {
  Server,
  FolderArchive,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';

export function GeneralTab() {
  const { currentInstance, user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0 max-w-full">
      {/* ── TARJETA: INFORMACIÓN GENERAL DEL SISTEMA ─────────────────── */}
      <div className="p-4 sm:p-6 rounded-3xl border border-border/70 bg-card/50 backdrop-blur-md shadow-sm space-y-4 min-w-0 max-w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Server className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground tracking-tight truncate">Información de la Plataforma</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">Detalles del entorno de ejecución y arquitectura multi-tenant activa.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {/* Versión */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Versión del Sistema</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-foreground">SICIZ-INSAI</span>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/40 text-primary bg-primary/10">
                PRODUCCIÓN
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Sistema Central de Inspección de Campo</p>
          </div>

          {/* Sede Operativa */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sede / Instancia Activa</span>
            <p className="text-sm font-black text-foreground truncate">
              {currentInstance?.nombre || 'Sede Central INSAI'}
            </p>
            <p className="text-[11px] font-mono text-muted-foreground">
              BD: {currentInstance?.db_name || 'db_insai_operativa'}
            </p>
          </div>

          {/* Usuario / Rol */}
          <div className="p-3.5 rounded-2xl border border-border/60 bg-muted/20 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sesión Activa</span>
            <p className="text-sm font-black text-foreground truncate">
              {user?.username || 'Administrador'}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Rol: {currentInstance?.rol || 'SuperAdmin'}
            </p>
          </div>
        </div>
      </div>

      {/* ── TARJETA: CARPETAS Y ALMACENAMIENTO ORGANIZADO ────────────── */}
      <div className="p-4 sm:p-6 rounded-3xl border border-border/70 bg-card/50 backdrop-blur-md shadow-sm space-y-4 min-w-0 max-w-full">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <FolderArchive className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-foreground tracking-tight truncate">Carpetas de Almacenamiento en Servidor</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">Estructura de directorios generados y organizados automáticamente.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
          {/* Carpeta de Imágenes */}
          <div className="p-4 rounded-2xl border border-border/60 bg-muted/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="size-4 text-emerald-500" />
                <span className="text-xs font-bold text-foreground">Imágenes y Archivos Subidos</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                /uploads
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Carpeta dedicada a fotografías de inspecciones de campo, actas de silos y fotos de perfil de trabajadores.
            </p>
          </div>

          {/* Carpeta de Respaldos */}
          <div className="p-4 rounded-2xl border border-border/60 bg-muted/15 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderArchive className="size-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Respaldos de Base de Datos</span>
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                /respaldos
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Directorio donde se depositan los volcados SQL organizados por nombre de base de datos, fecha, hora y tipo de ejecución.
            </p>
          </div>
        </div>
      </div>

      {/* ── TARJETA: ESPACIO PARA FUTURAS CONFIGURACIONES ─────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl border border-dashed border-border/70 bg-card/30 backdrop-blur-sm space-y-3 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="size-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Módulo preparado para futuras extensiones</h4>
            <p className="text-xs text-muted-foreground">
              Esta sección está diseñada de forma modular para incorporar configuraciones de marca institucional, pasarelas de correo, políticas de contraseñas y parámetros operativos adicionales según se requiera.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

