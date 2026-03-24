import { Outlet, useLocation } from 'react-router-dom'
import { AppSidebar } from "@/components/AppSidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function Layout() {
    const location = useLocation();

    // Mapping of paths to titles
    const getPageTitle = (pathname: string) => {
        if (pathname === '/' || pathname === '/') return 'Bienvenido a la Gestion del Panel de Control';
        if (pathname.includes('/cargos')) return 'Gestión de Cargos';
        return 'Sicic-insai-v2.0';
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between border-b px-6 transition-all bg-background">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
                            {getPageTitle(location.pathname)}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex flex-1 flex-col overflow-y-auto bg-background/50">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
