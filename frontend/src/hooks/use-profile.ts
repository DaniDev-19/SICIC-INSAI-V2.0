import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { toast } from 'sonner';

export function useProfile() {
  const queryClient = useQueryClient();

  const updateProfileMutation = useMutation({
    mutationFn: authService.updateMyProfile,
    onSuccess: (res) => {
      toast.success(res.message || 'Perfil actualizado con éxito');
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Error al actualizar el perfil';
      toast.error(msg);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: authService.changeMyPassword,
    onSuccess: (res) => {
      toast.success(res.message || 'Contraseña actualizada con éxito');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Error al cambiar la contraseña';
      toast.error(msg);
    },
  });

  return {
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
