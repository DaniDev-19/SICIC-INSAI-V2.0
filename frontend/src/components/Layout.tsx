import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from "@/components/AppSidebar"
import { Separator } from "@/components/ui/separator"
import HelpButton from "@/components/HelpButton"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { GlobalSearch } from "@/components/GlobalSearch"
import { NotificationBell } from "@/components/NotificationBell"

export default function Layout() {
    return (
        <SidebarProvider>
            <LayoutContent />
        </SidebarProvider>
    )
}

function LayoutContent() {
    const location = useLocation();
    const { state } = useSidebar();

    const getPageTitle = (pathname: string) => {
        if (pathname === '/home') return 'Bienvenido al Panel de Control';
        if (pathname.includes('/roles')) return 'Módulo de Control de Acceso';
        if (pathname.includes('/cultivos')) return 'Gestión de Cultivos';
        if (pathname.includes('/programas')) return 'Gestión de Programas';
        if (pathname.includes('/plagas')) return 'Gestión de Plagas';
        if (pathname.includes('/enfermedades')) return 'Gestión de Enfermedades';
        if (pathname.includes('/clientes')) return 'Gestión de Productores';
        if (pathname.includes('/inspecciones')) return 'Inspecciones Generales';
        if (pathname.includes('/inspecciones-silos')) return 'Silos y Almacenes';
        if (pathname.includes('/avales')) return 'Avales';
        if (pathname.includes('/seguimientos')) return 'Seguimientos Ins.';
        if (pathname.includes('/propiedades')) return 'Predios';
        if (pathname.includes('/empleados')) return 'Empleados';
        if (pathname.includes('/comunicados')) return 'Centro de Comunicados';
        if (pathname.includes('/solicitudes')) return 'Solicitudes';
        if (pathname.includes('/planificacion')) return 'Agenda y Planificación';
        if (pathname.includes('/oficinas')) return 'Oficinas Insai';
        if (pathname.includes('/vehiculos')) return 'Vehiculos';
        if (pathname.includes('/inventario')) return 'Inventario e Insumos';
        if (pathname.includes('/animales')) return 'Animales';
        if (pathname.includes('/reportes')) return 'Centro de Reportes y Metricas';
        if (pathname.includes('/bitacora')) return 'Bitacora';
        if (pathname.includes('/usuarios')) return 'Gestión de Usuarios';
        if (pathname.includes('/instancias')) return 'Centro de instancias';
        if (pathname.includes('/perfil')) return 'Mi Perfil';
        return 'SICIC INSAI V2.0';
    };

    return (
        <>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-3 sm:px-4 md:px-6 transition-all bg-background gap-2">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <SidebarTrigger
                            className="-ml-1 cursor-pointer shrink-0"
                            title={state === 'expanded' ? 'Ocultar barra lateral' : 'Abrir barra lateral'}
                        />
                        <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
                        <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground md:text-xl truncate">
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-8 sm:gap-4 md:gap-4 shrink-0">
                        <GlobalSearch />
                        <NotificationBell />
                        <HelpButton />
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex flex-1 flex-col overflow-y-auto bg-background/50">
                    <Outlet />
                </main>
            </SidebarInset>
        </>
    )
}

