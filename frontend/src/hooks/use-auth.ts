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
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        return { data: { user: null, currentInstance: null } } as LoginResponse;
      }
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
      if (!response.data?.mfaRequired) {
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
        }
        queryClient.setQueryData(['auth-user'], response);
      }
    },
  });

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selected_instance');
    localStorage.removeItem('auth-storage');
    sessionStorage.clear();
    queryClient.setQueryData(['auth-user'], null);
    queryClient.removeQueries();
    queryClient.clear();
    window.location.href = '/login';
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Error al comunicarse con el servidor para cerrar sesión:', error);
    } finally {
      clearSession();
    }
  };

  return {
    user: authData?.data?.user as User | null,
    currentInstance: authData?.data?.currentInstance as Instance | null,
    isAuthenticated: !!authData?.data?.user,
    isLoading,
    login: loginMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
  };
}
