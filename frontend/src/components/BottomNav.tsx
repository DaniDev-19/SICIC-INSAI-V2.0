import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  Activity,
  FolderKanban,
  Menu,
  LogOut,
  User,
  ChevronRight,
  HelpCircle,
  Package,
  BarChart3,
  Settings,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { usePermissions } from '@/hooks/use-permissions';
import { navigationGroups } from '@/components/AppSidebar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TabItem {
  id: string;
  label: string;
  icon: typeof Home;
  path?: string;
  matchPrefixes?: string[];
  isMenuTrigger?: boolean;
}

interface NavigationCategory {
  id: string;
  label: string;
  icon: typeof Home;
  matchPrefixes: string[];
  candidates: { screen: string; path: string; label: string }[];
}

/**
 * Categorías del sistema evaluadas en orden de relevancia operativa para personal de campo y usuarios.
 * Para cada categoría, la primera pantalla para la que el rol tenga permiso 'see' se convierte en su destino.
 */
const CATEGORIES: NavigationCategory[] = [
  {
    id: 'vigilancia',
    label: 'Vigilancia',
    icon: Activity,
    matchPrefixes: [
      '/home/inspecciones',
      '/home/programas',
      '/home/plagas',
      '/home/enfermedades',
      '/home/cultivos',
      '/home/animales',
    ],
    candidates: [
      // Prioridad máxima: Inspecciones (Actas de Inspección con fines de vigilancia)
      { screen: 'inspecciones', path: '/home/inspecciones', label: 'Inspecciones' },
      { screen: 'programas', path: '/home/programas', label: 'Programas' },
      { screen: 'plagas', path: '/home/plagas', label: 'Plagas' },
      { screen: 'enfermedades', path: '/home/enfermedades', label: 'Enfermedades' },
      { screen: 'cultivos', path: '/home/cultivos', label: 'Cultivos' },
      { screen: 'animales', path: '/home/animales', label: 'Animales' },
    ],
  },
  {
    id: 'operaciones',
    label: 'Operaciones',
    icon: ClipboardList,
    matchPrefixes: [
      '/home/solicitudes',
      '/home/planificacion',
      '/home/inspecciones-silos',
      '/home/avales',
      '/home/seguimientos',
    ],
    candidates: [
      { screen: 'solicitudes', path: '/home/solicitudes', label: 'Solicitudes' },
      { screen: 'planificaciones', path: '/home/planificacion', label: 'Planificación' },
      { screen: 'acta_silos', path: '/home/inspecciones-silos', label: 'Inspecciones Silos' },
      { screen: 'avales', path: '/home/avales', label: 'Avales' },
      { screen: 'seguimientos', path: '/home/seguimientos', label: 'Seguimientos' },
    ],
  },
  {
    id: 'registro',
    label: 'Registro',
    icon: FolderKanban,
    matchPrefixes: [
      '/home/clientes',
      '/home/propiedades',
      '/home/empleados',
      '/home/comunicados',
    ],
    candidates: [
      { screen: 'clientes', path: '/home/clientes', label: 'Productores' },
      { screen: 'propiedades', path: '/home/propiedades', label: 'Propiedades' },
      { screen: 'empleados', path: '/home/empleados', label: 'Empleados' },
      { screen: 'mail', path: '/home/comunicados', label: 'Comunicados' },
    ],
  },
  {
    id: 'inventario',
    label: 'Inventario',
    icon: Package,
    matchPrefixes: [
      '/home/inventario',
      '/home/oficinas',
      '/home/vehiculos',
    ],
    candidates: [
      { screen: 'insumos', path: '/home/inventario', label: 'Insumos' },
      { screen: 'oficinas', path: '/home/oficinas', label: 'Oficinas' },
      { screen: 'vehiculos', path: '/home/vehiculos', label: 'Vehículos' },
    ],
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    matchPrefixes: [
      '/home/reportes',
      '/home/bitacora',
    ],
    candidates: [
      { screen: 'reportes', path: '/home/reportes', label: 'Reportes' },
      { screen: 'bitacora', path: '/home/bitacora', label: 'Bitácora' },
    ],
  },
  {
    id: 'admin',
    label: 'Gestión',
    icon: Settings,
    matchPrefixes: [
      '/home/usuarios',
      '/home/roles',
      '/home/instancias',
      '/home/configuraciones',
    ],
    candidates: [
      { screen: 'usuarios', path: '/home/usuarios', label: 'Usuarios' },
      { screen: 'roles', path: '/home/roles', label: 'Roles' },
      { screen: 'instancias', path: '/home/instancias', label: 'Instancias' },
      { screen: 'configuracion', path: '/home/configuraciones', label: 'Configuración' },
    ],
  },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { canSee } = usePermissions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Construcción dinámica de pestañas según los permisos del usuario activo
  const visibleTabs = useMemo<TabItem[]>(() => {
    const tabs: TabItem[] = [];

    // 1. Tab de Inicio (si tiene permiso 'home' o por defecto para todo usuario autenticado)
    tabs.push({
      id: 'inicio',
      label: 'Inicio',
      icon: Home,
      path: '/home',
      matchPrefixes: ['/home$'],
    });

    // 2. Filtrar categorías que tengan al menos una pantalla a la que el usuario tenga acceso
    const accessibleCategories: TabItem[] = [];
    for (const cat of CATEGORIES) {
      const firstAccessible = cat.candidates.find((c) => canSee(c.screen));
      if (firstAccessible) {
        accessibleCategories.push({
          id: cat.id,
          label: cat.label,
          icon: cat.icon,
          path: firstAccessible.path,
          matchPrefixes: cat.matchPrefixes,
        });
      }
    }

    // Tomamos hasta 3 categorías disponibles para totalizar un máximo de 5 tabs perfectamente balanceados
    tabs.push(...accessibleCategories.slice(0, 3));

    // 3. Tab de Menú desplegable completo
    tabs.push({
      id: 'menu',
      label: 'Menú',
      icon: Menu,
      isMenuTrigger: true,
    });

    return tabs;
  }, [canSee]);

  const isActiveTab = (tab: TabItem) => {
    if (tab.isMenuTrigger) return isMenuOpen;
    if (tab.id === 'inicio') {
      return location.pathname === '/home' || location.pathname === '/home/';
    }
    return tab.matchPrefixes?.some((prefix) => location.pathname.startsWith(prefix)) ?? false;
  };

  const handleTabClick = (tab: TabItem) => {
    if (tab.isMenuTrigger) {
      setIsMenuOpen(true);
      return;
    }
    if (tab.path) {
      setIsMenuOpen(false);
      navigate(tab.path);
    }
  };

  const handleNavigateModule = (url: string) => {
    setIsMenuOpen(false);
    navigate(url);
  };

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  return (
    <>
      {/* ── BARRA INFERIOR PLAY STORE (SOLO MOBILE / TABLET < md) ── */}
      <nav
        aria-label="Navegación principal móvil"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-xl border-t border-border/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5"
      >
        <div
          className="grid items-center justify-around max-w-lg mx-auto px-1"
          style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}
        >
          {visibleTabs.map((tab) => {
            const active = isActiveTab(tab);
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'flex flex-col items-center justify-center py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer group active:scale-95',
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {/* Contenedor del icono con píldora estilo Play Store */}
                <div
                  className={cn(
                    'w-12 h-7.5 rounded-full flex items-center justify-center transition-all duration-300',
                    active
                      ? 'bg-primary/15 text-primary scale-105 shadow-xs'
                      : 'bg-transparent text-muted-foreground group-hover:bg-muted/40'
                  )}
                >
                  <Icon className={cn('size-5 transition-transform', active && 'stroke-[2.5]')} />
                </div>
                {/* Texto de la pestaña */}
                <span
                  className={cn(
                    'text-[10px] tracking-tight mt-0.5 transition-all text-center truncate max-w-full font-medium',
                    active ? 'font-black text-primary scale-105' : 'text-muted-foreground'
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── BOTTOM SHEET PLAY STORE (CATÁLOGO COMPLETO DE MÓDULOS) ── */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[2.2rem] max-h-[88vh] p-0 flex flex-col bg-background/98 backdrop-blur-2xl border-t border-border/80 shadow-2xl overflow-hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de Módulos</SheetTitle>
          </SheetHeader>

          {/* Manija de arrastre estilo Android */}
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mt-3 mb-1 shrink-0" />

          {/* Cabecera del usuario e instancia */}
          <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between gap-3 shrink-0 bg-muted/20">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="size-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <img src="/icon2.ico" alt="INSAI" className="size-6 object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {user?.username || 'Usuario INSAI'}
                  </h3>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold py-0 h-4">
                    SICIZ v2.0
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'INSAI'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleNavigateModule('/home/perfil')}
              className="p-2 rounded-xl bg-card border border-border/80 hover:bg-muted text-foreground transition-all cursor-pointer shrink-0"
              title="Mi Perfil"
            >
              <User className="size-4" />
            </button>
          </div>

          {/* Lista scrolleable de todos los módulos */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
            {/* Atajos Rápidos */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavigateModule('/home/perfil')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted/40 transition-all text-left cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">Mi Perfil</p>
                  <p className="text-[10px] text-muted-foreground truncate">Cuenta y datos</p>
                </div>
              </button>

              <button
                onClick={() => handleNavigateModule('/home/help')}
                className="flex items-center gap-2.5 p-3 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:bg-muted/40 transition-all text-left cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                  <HelpCircle className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-foreground truncate">Centro de Ayuda</p>
                  <p className="text-[10px] text-muted-foreground truncate">Manuales & APK</p>
                </div>
              </button>
            </div>

            {/* Grupos del Sistema */}
            {navigationGroups.map((group) => {
              const filteredItems = group.items.filter((item) => {
                if (!item.screen) return true;
                if (item.screen === 'perfil') return true;
                return canSee(item.screen);
              });

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground px-2">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {filteredItems.map((item) => {
                      const isCurrent = location.pathname === item.url;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          onClick={() => handleNavigateModule(item.url)}
                          className={cn(
                            'w-full flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer group text-left',
                            isCurrent
                              ? 'bg-primary/15 text-primary font-bold'
                              : 'hover:bg-muted/50 text-foreground'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={cn(
                                'size-8.5 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                                isCurrent
                                  ? 'bg-primary text-white shadow-xs'
                                  : 'bg-muted/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'
                              )}
                            >
                              <Icon className="size-4" />
                            </div>
                            <span className="text-xs font-semibold truncate flex-1">
                              {item.title}
                            </span>
                          </div>
                          <ChevronRight
                            className={cn(
                              'size-4 shrink-0 transition-transform',
                              isCurrent
                                ? 'text-primary translate-x-0.5'
                                : 'text-muted-foreground/40 group-hover:translate-x-0.5'
                            )}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón Inferior de Cerrar Sesión */}
          <div className="p-4 border-t border-border/80 bg-muted/20 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold text-xs cursor-pointer transition-all active:scale-[0.98]"
            >
              <LogOut className="size-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
