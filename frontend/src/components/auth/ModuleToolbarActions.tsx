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
    <>
      <div className="flex items-center gap-1">
        {onExport && (
          <Can screen={screen} action={exportAction}>
            <Button
              title={exportTitle}
              variant="ghost"
              size="icon"
              onClick={onExport}
              className="h-10 w-10 rounded-xl hover:bg-indigo-500/10 hover:text-indigo-600 transition-all cursor-pointer"
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
              className="h-10 w-10 rounded-xl hover:bg-rose-500/10 hover:text-rose-600 transition-all cursor-pointer"
            >
              <FileText className="size-5" />
            </Button>
          </Can>
        )}
      </div>
      {onCreate && (
        <Can screen={screen} action="create">
          <Button onClick={onCreate} title={createTitle ?? createLabel} variant="primary">
            <Plus className="size-5 text-white" />
            <span className="text-white">{createLabel}</span>
          </Button>
        </Can>
      )}
    </>
  );
}
