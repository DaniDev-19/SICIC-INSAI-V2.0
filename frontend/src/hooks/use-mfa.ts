import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export const useSetupMfa = () => {
  return useMutation({
    mutationFn: () => authService.setupMfa(),
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al generar el código QR de MFA';
      toast.error(message);
    },
  });
};

export const useEnableMfa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { secret: string; token: string }) => authService.enableMfa(dto),
    onSuccess: (res) => {
      toast.success(res.message || 'MFA activado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al confirmar la activación de MFA';
      toast.error(message);
    },
  });
};

export const useDisableMfa = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: { currentPassword: string; token: string }) => authService.disableMfa(dto),
    onSuccess: (res) => {
      toast.success(res.message || 'MFA desactivado correctamente');
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al desactivar MFA';
      toast.error(message);
    },
  });
};

export const useVerifyMfaLogin = () => {
  return useMutation({
    mutationFn: (dto: { mfaPendingToken: string; code: string }) => authService.verifyMfaLogin(dto),
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Código MFA o de respaldo incorrecto';
      toast.error(message);
    },
  });
};

export const useRegenerateBackupCodes = () => {
  return useMutation({
    mutationFn: (dto: { token: string }) => authService.regenerateBackupCodes(dto),
    onSuccess: (res) => {
      toast.success(res.message || 'Nuevos códigos de respaldo generados');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al regenerar códigos de respaldo';
      toast.error(message);
    },
  });
};

