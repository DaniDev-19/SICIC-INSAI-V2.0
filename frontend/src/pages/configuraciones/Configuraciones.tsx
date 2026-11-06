import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Database,
  Server,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RespaldosTab } from './components/RespaldosTab';
import { GeneralTab } from './components/GeneralTab';

export default function Configuraciones() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('respaldos');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl mx-auto w-full min-w-0 overflow-hidden sm:overflow-visible animate-in fade-in duration-300 pb-28 sm:pb-32">
      {/* ── HEADER PRINCIPAL (MOBILE FIRST) ─────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 min-w-0 w-full">
        <div className="flex items-start gap-3 min-w-0 w-full">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="size-10 rounded-2xl border border-border/70 hover:bg-muted shrink-0 mt-0.5 cursor-pointer"
            title="Volver al Inicio"
          >
            <ChevronLeft className="size-5" />
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <Settings className="size-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
                Configuraciones del Sistema
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed break-words whitespace-normal">
              Gestión de respaldos de base de datos, parámetros de almacenamiento y configuración operativa de la plataforma.
            </p>
          </div>
        </div>
      </div>

      {/* ── TABS NAVEGABLES (MOBILE RESPONSIVE CON SCROLL HORIZONTAL) ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5 sm:space-y-6 w-full min-w-0">
        <div className="w-full overflow-x-auto no-scrollbar pb-1">
          <TabsList className="h-11 sm:h-12 p-1.5 rounded-2xl bg-muted/40 border border-border/60 inline-flex w-max sm:w-auto gap-1">
            <TabsTrigger
              value="respaldos"
              className="rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer transition-all whitespace-nowrap shrink-0"
            >
              <Database className="size-4 shrink-0" />
              <span>Respaldos de Base de Datos</span>
            </TabsTrigger>

            <TabsTrigger
              value="general"
              className="rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold gap-2 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm cursor-pointer transition-all whitespace-nowrap shrink-0"
            >
              <Server className="size-4 shrink-0" />
              <span>General y Carpetas</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENIDO DE CADA TAB */}
        <TabsContent value="respaldos" className="focus-visible:outline-none">
          <RespaldosTab />
        </TabsContent>

        <TabsContent value="general" className="focus-visible:outline-none">
          <GeneralTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

