import {
  Home,
  FileText,
  CalendarDays,
  Eye,
  Warehouse,
  FileCheck,
  Activity,
  ClipboardList,
  PawPrint,
  Sprout,
  Bug,
  Stethoscope,
  Users,
  Building2,
  Briefcase,
  Package,
  BarChart3,
  History,
  Settings,
  UsersRound,
  ShieldCheck,
  Server,
  User,
  LogOut,
  Leaf
} from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"
import { usePermissions } from "@/hooks/use-permissions"
import { toast } from "sonner"
import { useNavigate, useLocation } from "react-router-dom"

const navigationGroups = [
  {
    label: "Panel Principal",
    items: [
      { title: "Inicio", url: "/home", icon: Home, screen: "home" },
    ]
  },
  {
    label: "Registro y Control",
    items: [
      { title: "Productores", url: "/home/clientes", icon: Users, screen: "clientes" },
      { title: "Propiedades", url: "/home/propiedades", icon: Building2, screen: "propiedades" },
      { title: "Empleados", url: "/home/empleados", icon: Briefcase, screen: "empleados" },
    ]
  },
  {
    label: "Operaciones de Campo",
    items: [
      { title: "Solicitudes", url: "/home/solicitudes", icon: FileText, screen: "solicitudes" },
      { title: "Planificación", url: "/home/planificacion", icon: CalendarDays, screen: "planificacion" },
      { title: "Inspecc. Generales", url: "/home/inspecciones", icon: Eye, screen: "inspecciones" },
      { title: "Inspecc. de Silos", url: "/home/inspecciones-silos", icon: Warehouse, screen: "inspecciones_silos" },
      { title: "Avales", url: "/home/avales", icon: FileCheck, screen: "avales" },
      { title: "Seguimiento", url: "/home/seguimientos", icon: Activity, screen: "seguimientos" },
    ]
  },
  {
    label: "Inventario y Logística",
    items: [
      { title: "Inventario de Insumos", url: "/home/inventario", icon: Package, screen: "inventario" },
    ]
  },
  {
    label: "Vigilancia Epidemiológica",
    items: [
      { title: "Programas", url: "/home/programas", icon: ClipboardList, screen: "programas" },
      { title: "Cultivos", url: "/home/cultivos", icon: Sprout, screen: "cultivos" },
      { title: "Animales", url: "/home/animales", icon: PawPrint, screen: "animales" },
      { title: "Plagas", url: "/home/plagas", icon: Bug, screen: "plagas" },
      { title: "Enfermedades", url: "/home/enfermedades", icon: Stethoscope, screen: "enfermedades" },
    ]
  },
  {
    label: "Reportes y Auditoría",
    items: [
      { title: "Reportes", url: "/home/reportes", icon: BarChart3, screen: "reportes" },
      { title: "Bitácora", url: "/home/bitacora", icon: History, screen: "bitacora" },
    ]
  },
  {
    label: "Administración",
    items: [
      { title: "Configuraciones", url: "/home/configuraciones", icon: Settings, screen: "configuraciones" },
      { title: "Usuarios", url: "/home/usuarios", icon: UsersRound, screen: "usuarios" },
      { title: "Roles y Permisos", url: "/home/roles", icon: ShieldCheck, screen: "roles" },
      { title: "Instancias", url: "/home/instancias", icon: Server, screen: "instancias" },
    ]
  },
  {
    label: "Mi Cuenta",
    items: [
      { title: "Perfil de Usuario", url: "/home/perfil", icon: User, screen: "perfil" },
    ]
  }
]

export function AppSidebar() {
  const { logout, user } = useAuth();
  const { canSee } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
    } catch {
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border/50">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <Leaf className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-bold uppercase tracking-wider text-foreground">SICIC-INSAI</span>
            <span className="truncate text-[12px] text-muted-foreground font-medium mt-1">{user?.username.toUpperCase() || 'V2.0'}</span>
          </div>
        </div>
      </SidebarHeader>

      <hr className="bg-foreground " />

      <SidebarContent className="custom-scrollbar">
        {navigationGroups.map((group) => {
          const filteredItems = group.items.filter(item => {
            if (!item.screen) return true;
            return canSee(item.screen);
          });

          if (filteredItems.length === 0) return null;

          return (
            <SidebarGroup key={group.label} className="px-2">
              <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 dark:text-muted-foreground/50 mb-2">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {filteredItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className="h-9 px-2 cursor-pointer transition-all duration-300 ease-in-out bg-transparent hover:bg-emerald-500/5 data-[active=true]:bg-transparent data-[active=true]:text-emerald-500 group"
                      >
                        <button onClick={() => navigate(item.url)} className="w-full flex items-center gap-3">
                          <item.icon className="size-4.5 transition-transform duration-200 group-hover:scale-110" />
                          <span className="font-medium tracking-tight text-[13px] group-data-[active=true]:font-bold">{item.title}</span>
                          {location.pathname === item.url && (
                            <div className="ml-auto size-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                          )}
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/80 dark:border-sidebar-border/30 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              variant="ghost"
              style={{ color: '#f43f5e', backgroundColor: 'transparent' }}
              className="w-full justify-start gap-3 h-10 px-4 hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-200 rounded-xl cursor-pointer group/logout active:bg-transparent"
              title="Cerrar Sesión"
            >
              <LogOut className="size-4.5 transition-transform duration-200 group-hover/logout:-translate-x-1" style={{ color: '#f43f5e' }} />
              <span className="font-bold tracking-tight text-[13px]" style={{ color: '#f43f5e' }}>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="px-1 py-2 flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald-500/50" />
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">Sistema de información para el control de inspecciones de campo</p>
          </div>
          <hr className="m-2" />
          <p className="text-[10px] text-muted-foreground/30 font-medium pl-3.5">© 2026 todos los derechos reservados</p>
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}
