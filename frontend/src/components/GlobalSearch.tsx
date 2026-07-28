import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "./ui/search-input";
import {
  Loader2,
  Globe,
  Users,
  Building2,
  Briefcase,
  FileCheck,
  ClipboardList,
  Warehouse,
  ShieldCheck,
  Building,
  Car,
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

const CATEGORY_ICONS: Record<string, any> = {
  'Productor': Users,
  'Predio / Propiedad': Building2,
  'Inspector / Empleado': Briefcase,
  'Inspección General': FileCheck,
  'Planificación': ClipboardList,
  'Inspección de Silos': Warehouse,
  'Aval Sanitario': ShieldCheck,
  'Oficina': Building,
  'Vehículo': Car,
};

export function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: resultsResp, isLoading, isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) return null;
      const response = await apiClient.get(`/search/global?q=${encodeURIComponent(debouncedQuery)}`);
      return response.data;
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30000,
  });

  const results = resultsResp?.data || [];

  const handleSelectResult = (route: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(route);
  };

  return (
    <div className="relative hidden w-full sm:block sm:max-w-55 lg:max-w-87.5 group transition-all duration-300">
      <div className="relative">
        <SearchInput
          placeholder="Busca en todo el sistema..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onClear={() => {
            setQuery("");
            setIsOpen(false);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          className="h-10 rounded-xl border-border/60 bg-muted/40 shadow-sm transition-all focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40"
        />
        {(isLoading || isFetching) && query.trim().length >= 2 && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {isOpen && debouncedQuery.trim().length >= 2 && (
        <div className="absolute top-12 right-0 w-[min(92vw,28rem)] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-50 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between px-2 border-b border-border/30 pb-2">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Resultados del Sistema
              </span>
            </div>
            {results.length > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {results.length} Coincidencias
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
              <span className="text-xs font-bold text-muted-foreground uppercase">Buscando en la base de datos...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-1.5 max-h-[360px] overflow-y-auto custom-scrollbar pr-1">
              {results.map((item: any) => {
                const IconComponent = CATEGORY_ICONS[item.category] || Globe;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item.route)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-primary/10 transition-all text-left group border border-transparent hover:border-primary/20 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                        <IconComponent className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate block mt-0.5">
                          {item.subtitle}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center bg-muted/20 rounded-xl">
              <span className="text-xs font-bold text-muted-foreground uppercase italic px-4 block">
                Sin coincidencias para "{debouncedQuery}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
