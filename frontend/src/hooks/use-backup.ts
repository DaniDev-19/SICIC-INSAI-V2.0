import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { backupService } from '@/services/backup.service';
import { toast } from 'sonner';
import type { BackupConfig } from '@/types/backup';

export const BACKUP_KEYS = {
  all: ['backups'] as const,
  list: () => [...BACKUP_KEYS.all, 'list'] as const,
  config: () => [...BACKUP_KEYS.all, 'config'] as const,
};

export function useBackup() {
  const queryClient = useQueryClient();
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Consulta de lista de respaldos y estadísticas
  const {
    data: backupData,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    refetch: refetchList,
    error: listError,
  } = useQuery({
    queryKey: BACKUP_KEYS.list(),
    queryFn: backupService.getRespaldos,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Consulta de configuración de respaldos automáticos
  const {
    data: configData,
    isLoading: isLoadingConfig,
    refetch: refetchConfig,
  } = useQuery({
    queryKey: BACKUP_KEYS.config(),
    queryFn: backupService.getConfiguracion,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Mutación: Crear respaldo manual
  const createManualMutation = useMutation({
    mutationFn: (target: 'master' | 'operativa' | 'all') => backupService.crearRespaldoManual(target),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: BACKUP_KEYS.all });
      toast.success(res?.message || 'Respaldo generado exitosamente');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Error al generar el respaldo';
      toast.error(msg);
    },
  });

  // Mutación: Eliminar respaldo
  const deleteMutation = useMutation({
    mutationFn: (filename: string) => backupService.eliminarRespaldo(filename),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: BACKUP_KEYS.all });
      toast.success(res?.message || 'Respaldo eliminado');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar el respaldo';
      toast.error(msg);
    },
  });

  // Mutación: Guardar configuración
  const saveConfigMutation = useMutation({
    mutationFn: (config: Partial<BackupConfig>) => backupService.guardarConfiguracion(config),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: BACKUP_KEYS.config() });
      queryClient.invalidateQueries({ queryKey: BACKUP_KEYS.list() });
      toast.success(res?.message || 'Configuración guardada exitosamente');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Error al guardar la configuración';
      toast.error(msg);
    },
  });

  // Descarga con estado
  const descargar = async (filename: string) => {
    try {
      setDownloadingFile(filename);
      toast.info(`Iniciando descarga de ${filename}...`);
      await backupService.descargarRespaldo(filename);
      toast.success('Descarga completada');
    } catch (err: any) {
      toast.error('Error al descargar el archivo de respaldo');
    } finally {
      setDownloadingFile(null);
    }
  };

  return {
    respaldos: backupData?.data?.respaldos || [],
    stats: backupData?.data?.stats,
    config: configData?.data,
    isLoading: isLoadingList || isLoadingConfig,
    isFetching: isFetchingList,
    refetchList,
    refetchConfig,
    listError,
    crearRespaldoManual: createManualMutation.mutateAsync,
    isCreatingManual: createManualMutation.isPending,
    eliminarRespaldo: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    guardarConfiguracion: saveConfigMutation.mutateAsync,
    isSavingConfig: saveConfigMutation.isPending,
    descargar,
    downloadingFile,
  };
}

