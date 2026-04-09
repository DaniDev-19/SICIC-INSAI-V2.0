import {
  Home,
  Settings,
  LogOut,
  Users,
  ShieldCheck,
  Package,
  BarChart3,
  ClipboardList
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

const items = [
  {
    title: "Inicio",
    url: "/home",
    icon: Home,
    screen: "home",
  },
  {
    title: "Roles",
    url: "/home/roles",
    icon: ShieldCheck,
    screen: "roles",
  },
  {
    title: "Cargos",
    url: "/home/cargos",
    icon: Users,
    screen: "user",
  },
  {
    title: "Inventario",
    url: "#",
    icon: Package,
    screen: "inventario",
  },
  {
    title: "Reportes",
    url: "#",
    icon: BarChart3,
    screen: "reportes",
  },
  {
    title: "Auditoría",
    url: "#",
    icon: ClipboardList,
    screen: "auditoria",
  },
  {
    title: "Configuración",
    url: "#",
    icon: Settings,
    screen: "configuracion",
  },
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

  const filteredItems = items.filter(item => {

    if (!item.screen) return true;
    return canSee(item.screen);
  });

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Home className="size-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold uppercase tracking-tight">SICIC INSAI</span>
            <span className="truncate text-[10px] text-muted-foreground">{user?.username || 'Admin Dashboard V2.0'}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <button onClick={() => navigate(item.url)} className="w-full flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="px-2 pb-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className=" cursor-pointer text-red-500 hover:text-red-400 hover:bg-red-50/10 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="size-4" />
              <span className="font-medium">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <div className="flex flex-col gap-1 p-4 pt-0 text-[10px] text-sidebar-foreground/30 font-medium border-t border-sidebar-border/30">
          <p className="uppercase mt-4">SICIC INSAI © 2024</p>
          <p>All rights reserved</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
