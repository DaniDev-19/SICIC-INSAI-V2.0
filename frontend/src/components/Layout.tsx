import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from "@/components/AppSidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"
import { GlobalSearch } from "@/components/GlobalSearch"


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
        if (pathname.includes('/cargos')) return 'Gestión de Cargos';
        return 'Sicic-insai-v2.0';
    };

    return (
        <>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 transition-all bg-background">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger 
                            className="-ml-1 cursor-pointer" 
                            title={state === 'expanded' ? 'Ocultar barra lateral' : 'Abrir barra lateral'} 
                        />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <GlobalSearch />
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

