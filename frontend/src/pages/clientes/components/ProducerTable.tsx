import type { Cliente } from '@/types/clientes';
import { User, Edit, Trash2, Phone, Mail, Fingerprint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModulePermissions } from '@/hooks/use-module-permissions';
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
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
}

export function ProducerTable({ clientes, onEdit, onDelete }: ProducerTableProps) {
  const { canUpdate, canDelete } = useModulePermissions('clientes');

  return (
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
        {clientes.length === 0 ? (
          <TableRow className="hover:bg-transparent border-none">
            <TableCell colSpan={5} className="px-6 py-20 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
                  <User className="size-8 text-muted-foreground/50" />
                </div>
                <p className="font-bold italic text-foreground">No se encontraron productores registrados</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          clientes.map((cliente) => (
            <TableRow key={cliente.id} className="group hover:bg-primary/5 transition-all duration-300">
              <TableCell className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Fingerprint className="size-5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block group-hover:translate-x-1 transition-transform">{cliente.nombre}</span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                      <span className="bg-muted/50 px-1.5 py-0.5 rounded border">V/J-{cliente.cedula_rif}</span>
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
                <p className="text-xs text-muted-foreground font-medium line-clamp-2 max-w-[250px]">
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
                <div className="flex items-center justify-end gap-2">
                  {canUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(cliente)}
                    className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
                  >
                    <Edit className="size-4" />
                  </Button>
                  )}
                  {canDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(cliente.id)}
                    className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
