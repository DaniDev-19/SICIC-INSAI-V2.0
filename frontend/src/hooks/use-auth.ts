import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { authService } from '../services/auth.service';
import type { User, Instance, LoginResponse } from '../types/auth';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: authData,
    isLoading,
    error: authError,
  } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      try {
        const response = await authService.getMe();
        return response;
      } catch {
        return { data: { user: null, currentInstance: null } } as LoginResponse;
      }
    },
    retry: 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  useEffect(() => {
    const error = authError as AxiosError | null;
    if (error?.response?.status === 429) {
      toast.warning('Acceso Temporalmente Limitado', {
        description: 'Demasiadas peticiones. Se ha relajado el límite, por favor espera unos segundos.',
      });
    } else if (error && !error.response) {
      toast.error('Fallo de conexión con el servidor maestro');
    }
  }, [authError]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth-user'], response);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
  });

  const clearSession = () => {
    queryClient.setQueryData(['auth-user'], null);
    queryClient.removeQueries();
    window.location.href = '/login';
  };

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: clearSession,
  });

  return {
    user: authData?.data?.user as User | null,
    currentInstance: authData?.data?.currentInstance as Instance | null,
    isAuthenticated: !!authData?.data?.user,
    isLoading,
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
}
