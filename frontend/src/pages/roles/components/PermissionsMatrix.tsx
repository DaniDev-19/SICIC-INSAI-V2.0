import { PANTALLAS, ACCIONES } from '@/lib/permisusers';
import { Switch } from '@/components/ui/switch';
import { ShieldAlert, Globe } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PermissionsMatrixProps {
  permisos: Record<string, string[]>;
  onTogglePermission: (screen: string, action: string) => void;
  onToggleAll: (checked: boolean) => void;
  onToggleScope: (screen: string, checked: boolean) => void;
}

export function PermissionsMatrix({
  permisos,
  onTogglePermission,
  onToggleAll,
  onToggleScope
}: PermissionsMatrixProps) {

  // Calculate if all possible permissions are active (Global Master)
  const isAllChecked = PANTALLAS.every(p =>
    p.ACCIONES.every(a => permisos?.[p.key]?.includes(a))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <ShieldAlert className="size-5 text-indigo-500" />
          </div>
          <h3 className="text-lg font-black italic uppercase tracking-tight">Matriz de Privilegios</h3>
        </div>

        {/* Global Master Switch */}
        <div className="flex items-center gap-4 px-4 py-2 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center gap-2">
            <Globe className="size-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Acceso Total</span>
          </div>
          <Switch
            checked={isAllChecked}
            onCheckedChange={onToggleAll}
            className="data-[state=checked]:bg-primary cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-emerald-500" /> Habilitado
          </div>
          <div className="flex items-center gap-1">
            <div className="size-2 rounded-full bg-muted-foreground/30" /> No Aplica
          </div>
        </div>
      </div>

      <div className="border border-border/50 rounded-2xl bg-card/60 dark:bg-card/40 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/60 dark:bg-muted/40 border-b border-border/50">
              <TableHead className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground w-[250px]">
                <div className="flex items-center gap-2">
                  Módulo / Pantalla
                </div>
              </TableHead>
              {ACCIONES.map((accion) => (
                <TableHead key={accion.key} className="px-4 py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
                  {accion.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/30">
            {PANTALLAS.map((pantalla) => {

              const isScopeChecked = pantalla.ACCIONES.every(a => permisos?.[pantalla.key]?.includes(a));

              return (
                <TableRow key={pantalla.key} className="hover:bg-primary/5 group transition-colors">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-4">

                      <Switch
                        checked={isScopeChecked}
                        onCheckedChange={(checked) => onToggleScope(pantalla.key, checked)}
                        className="scale-75 data-[state=checked]:bg-indigo-500 cursor-pointer"
                        title={`Seleccionar todo en ${pantalla.label}`}
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{pantalla.label}</span>
                        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                          scope: {pantalla.key}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  {ACCIONES.map((accion) => {
                    const isSupported = pantalla.ACCIONES.includes(accion.key);
                    const isChecked = permisos?.[pantalla.key]?.includes(accion.key);

                    return (
                      <TableCell key={accion.key} className="px-4 py-4 text-center">
                        {isSupported ? (
                          <div className="flex justify-center">
                            <Switch
                              checked={isChecked || false}
                              onCheckedChange={() => onTogglePermission(pantalla.key, accion.key)}
                              className="scale-90 data-[state=checked]:bg-primary cursor-pointer"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] font-black text-muted-foreground/20 italic">n/a</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <p className="text-[10px] text-muted-foreground italic pl-2">
        * Los cambios en la matriz se aplicarán de forma inmediata tras guardar el rol.
      </p>
    </div>
  );
}
