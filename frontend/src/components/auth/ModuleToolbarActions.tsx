import { Download, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Can from '@/components/auth/Can';

interface ModuleToolbarActionsProps {
  screen: string;
  onExport?: () => void;
  onExportPdf?: () => void;
  onCreate?: () => void;
  exportTitle?: string;
  exportPdfTitle?: string;
  createLabel: string;
  createTitle?: string;
  /** Acción para exportar: "export" (default) o "see" según el módulo en backend. */
  exportAction?: string;
}

export function ModuleToolbarActions({
  screen,
  onExport,
  onExportPdf,
  onCreate,
  exportTitle = 'Exportar en excel',
  exportPdfTitle = 'Exportar en PDF',
  createLabel,
  createTitle,
  exportAction = 'export',
}: ModuleToolbarActionsProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-between sm:justify-start min-w-0">
      <div className="flex items-center gap-1 shrink-0">
        {onExport && (
          <Can screen={screen} action={exportAction}>
            <Button
              title={exportTitle}
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer shrink-0"
            >
              <Download className="size-5" />
            </Button>
          </Can>
        )}
        {onExportPdf && (
          <Can screen={screen} action={exportAction}>
            <Button
              title={exportPdfTitle}
              variant="ghost"
              size="icon"
              onClick={onExportPdf}
              className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 transition-all cursor-pointer shrink-0"
            >
              <FileText className="size-5" />
            </Button>
          </Can>
        )}
      </div>
      {onCreate && (
        <Can screen={screen} action="create">
          <Button
            onClick={onCreate}
            title={createTitle ?? createLabel}
            variant="primary"
            className="h-10 px-3 sm:px-4 text-xs sm:text-sm shrink min-w-0 flex-1 sm:flex-initial"
          >
            <Plus className="size-4 sm:size-5 text-white shrink-0" />
            <span className="text-white truncate">{createLabel}</span>
          </Button>
        </Can>
      )}
    </div>
  );
}
