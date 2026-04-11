import { useState, useEffect } from "react"
import { SearchInput } from "./ui/search-input"
import { Loader2, Globe } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function GlobalSearch() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 500)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results, isLoading, isFetching } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return null;
      const response = await apiClient.get(`/roles?search=${debouncedQuery}&limit=5`);
      return response.data;
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 60000,
  })

  return (
    <div className="relative w-full max-w-[200px] md:max-w-xs transition-all duration-300">
      <div className="relative">
        <SearchInput
          placeholder="Busca en todo el sistema..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={() => setQuery("")}
          className="h-9 text-xs focus-visible:ring-primary/40 focus:scale-[1.02] transition-transform"
        />
        {(isLoading || isFetching) && query.length > 2 && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        )}
      </div>

      {debouncedQuery.length > 2 && query !== "" && (
        <div className="absolute top-11 left-0 w-[300px] md:w-[400px] bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl z-100 p-4 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 px-2 border-b border-border/30 pb-2">
            <Globe className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Resultados Globales</span>
          </div>

          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/30" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Explorando registros...</span>
            </div>
          ) : results?.data?.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto custom-scrollbar">
              {results.data.map((item: any) => (
                <button
                  key={item.id}
                  className="flex flex-col items-start p-3 rounded-xl hover:bg-primary/5 transition-colors text-left group border border-transparent hover:border-primary/10"
                >
                  <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{item.nombre}</span>
                  <span className="text-[10px] text-muted-foreground line-clamp-1">{item.descripcion || 'Sin descripción'}</span>
                </button>
              ))}
              <div className="mt-2 pt-2 border-t border-border/30 text-center">
                <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                  Ver todos los resultados
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-muted/20 rounded-xl">
              <span className="text-[10px] font-bold text-muted-foreground uppercase italic px-4 block">
                No encontramos coincidencias para "{debouncedQuery}"
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
