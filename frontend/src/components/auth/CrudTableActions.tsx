import { Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModulePermissions } from '@/hooks/use-module-permissions';
import { cn } from '@/lib/utils';

interface CrudTableActionsProps {
  screen: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  className?: string;
  stopPropagation?: boolean;
}

export function CrudTableActions({
  screen,
  onView,
  onEdit,
  onDelete,
  viewTitle = 'Ver detalle',
  editTitle = 'Editar',
  deleteTitle = 'Eliminar',
  className,
  stopPropagation = false,
}: CrudTableActionsProps) {
  const { canSee, canUpdate, canDelete } = useModulePermissions(screen);

  if (!canSee && !canUpdate && !canDelete) {
    return null;
  }

  const wrapClick = (handler?: () => void) => (event: React.MouseEvent) => {
    if (stopPropagation) {
      event.stopPropagation();
    }
    handler?.();
  };

  return (
    <div className={cn('flex items-center justify-end gap-2', className)}>
      {canSee && onView && (
        <Button
          variant="ghost"
          size="icon"
          title={viewTitle}
          onClick={wrapClick(onView)}
          className="size-9 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 cursor-pointer"
        >
          <Eye className="size-4" />
        </Button>
      )}
      {canUpdate && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          title={editTitle}
          onClick={wrapClick(onEdit)}
          className="size-9 rounded-lg hover:bg-blue-500/10 hover:text-blue-600 cursor-pointer"
        >
          <Edit className="size-4" />
        </Button>
      )}
      {canDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          title={deleteTitle}
          onClick={wrapClick(onDelete)}
          className="size-9 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  );
}
