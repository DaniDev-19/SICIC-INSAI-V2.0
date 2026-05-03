import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface Item {
  id: number;
  nombre: string;
}

interface AsociacionCardProps {
  title: string;
  icon: React.ReactNode;
  colorClass: string;
  items: Item[];
  onRemove: (id: number) => void;
  onAdd: (id: number) => void;
  catalogItems: Item[];
  search: string;
  onSearchChange: (val: string) => void;
  placeholder: string;
}

export function AsociacionCard({
  title,
  icon,
  colorClass,
  items,
  onRemove,
  onAdd,
  catalogItems,
  search,
  onSearchChange,
  placeholder
}: AsociacionCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-background/50 rounded-xl border border-border p-5 space-y-4 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="font-bold text-foreground">{title}</h3>
          <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-bold text-muted-foreground ml-2">
            {items.length}
          </span>
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer">
              <Plus className="size-3" /> Añadir
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-2 glass-effect border-border" align="end">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 h-9 text-sm"
                autoFocus
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
              {catalogItems.length === 0 ? (
                <p className="text-sm text-center text-muted-foreground py-4">No se encontraron resultados</p>
              ) : (
                catalogItems.map((item) => {
                  const isSelected = items.some(i => i.id === item.id);
                  return (
                    <button
                      key={item.id}
                      disabled={isSelected}
                      onClick={() => {
                        onAdd(item.id);
                        setOpen(false);
                        onSearchChange('');
                      }}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                        isSelected 
                          ? 'opacity-50 bg-muted/50 cursor-not-allowed' 
                          : 'hover:bg-primary/10 hover:text-primary cursor-pointer'
                      }`}
                    >
                      {item.nombre}
                      {isSelected && <span className="float-right text-xs text-muted-foreground">Ya asociado</span>}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="min-h-[80px] max-h-[160px] overflow-y-auto custom-scrollbar p-3 rounded-lg border border-dashed border-border bg-muted/10">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
            Sin registros asociados
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <div 
                key={item.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border ${colorClass} bg-opacity-10 backdrop-blur-sm group`}
              >
                <span>{item.nombre}</span>
                <button
                  type="button"
                  onClick={() => onRemove(item.id)}
                  className="rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                  title="Remover"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
