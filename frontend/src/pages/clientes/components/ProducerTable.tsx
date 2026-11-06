import type { Cliente } from '@/types/clientes';
import { User, Phone, Mail, Fingerprint, MapPin } from 'lucide-react';
import { CrudTableActions } from '@/components/auth/CrudTableActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProducerTableProps {
  clientes: Cliente[];
  onView?: (cliente: Cliente) => void;
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

function formatCedulaRif(val: string) {
  if (!val) return '';
  const clean = val.trim();
  if (/^[VvJjEeGgPp]-/.test(clean)) return clean.toUpperCase();
  return `V/J-${clean}`;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-16 sm:py-20 text-center">
      <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center border border-dashed border-border">
        <User className="size-8 text-muted-foreground/50" />
      </div>
      <p className="font-bold italic text-foreground text-sm sm:text-base">No se encontraron productores registrados</p>
    </div>
  );
}

export function ProducerTable({ clientes, onView, onEdit, onDelete }: ProducerTableProps) {
  if (clientes.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      {/* ── Mobile / Tablet (< lg): tarjetas ── */}
      <div className="lg:hidden p-3 sm:p-4 space-y-3">
        {clientes.map((cliente) => (
          <article
            key={cliente.id}
            className="rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5 shadow-sm space-y-3.5"
          >
            {/* Header: Icono + Nombre + Badges */}
            <div className="flex items-start justify-between gap-3 min-w-0">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="size-11 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                  <Fingerprint className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-foreground text-sm sm:text-base truncate">{cliente.nombre}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold mt-0.5">
                    <span className="bg-muted px-1.5 py-0.5 rounded border border-border text-foreground">
                      {formatCedulaRif(cliente.cedula_rif)}
                    </span>
                    {cliente.codigo_runsai && (
                      <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-bold">
                        RUNSAI: {cliente.codigo_runsai}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Predios badge */}
              <div className="shrink-0">
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  {cliente.propiedades?.length || 0} PREDIOS
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
              <div className="flex items-center gap-2 min-w-0">
                <Phone className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{cliente.telefono || 'Sin teléfono'}</span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="size-3.5 text-primary shrink-0" />
                <span className="truncate">{cliente.email || 'Sin correo'}</span>
              </div>
              {cliente.direccion_fiscal && (
                <div className="flex items-start gap-2 min-w-0 sm:col-span-2">
                  <MapPin className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-[11px]">{cliente.direccion_fiscal}</span>
                </div>
              )}
            </div>

            {/* Footer con acciones */}
            <div className="flex items-center justify-end pt-2 border-t border-border/40">
              <CrudTableActions
                screen="clientes"
                onView={() => onView?.(cliente)}
                onEdit={() => onEdit(cliente)}
                onDelete={() => onDelete(cliente.id)}
              />
            </div>
          </article>
        ))}
      </div>

      {/* ── Desktop (>= lg): tabla tradicional ── */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b">
            <TableRow>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Identificación</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Contacto</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Ubicación Fiscal</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground">Predios</TableHead>
              <TableHead className="px-6 py-5 font-bold text-sm uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/50">
            {clientes.map((cliente) => (
              <TableRow key={cliente.id} className="group hover:bg-primary/5 transition-all duration-300">
                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Fingerprint className="size-5" />
                    </div>
                    <div>
                      <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{cliente.nombre}</span>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                        <span className="bg-muted/50 px-1.5 py-0.5 rounded border">{formatCedulaRif(cliente.cedula_rif)}</span>
                        {cliente.codigo_runsai && (
                          <span className="text-primary font-bold">RUNSAI: {cliente.codigo_runsai}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Phone className="size-3.5 text-primary" />
                      {cliente.telefono || 'Sin teléfono'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <Mail className="size-3.5 text-primary" />
                      {cliente.email || 'Sin correo'}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <p className="text-xs text-muted-foreground font-medium line-clamp-2 max-w-62.5">
                    {cliente.direccion_fiscal || 'Sin dirección registrada'}
                  </p>
                </TableCell>

                <TableCell className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 text-[10px] font-black border border-indigo-500/20">
                      {cliente.propiedades?.length || 0} PREDIOS
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-6 py-5 text-right">
                  <CrudTableActions
                    screen="clientes"
                    onView={() => onView?.(cliente)}
                    onEdit={() => onEdit(cliente)}
                    onDelete={() => onDelete(cliente.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
