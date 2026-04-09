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
    isFetched,
    error: authError
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

  const { 
    data: instancesData, 
    isLoading: isLoadingInstances,
    error: instancesError 
  } = useQuery({
    queryKey: ['auth-instances'],
    queryFn: async () => {
      const response = await authService.getInstances();
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  useEffect(() => {
    const error = (instancesError || authError) as AxiosError | null;
    if (error?.response?.status === 429) {
      toast.warning('Acceso Temporalmente Limitado', {
        description: 'Demasiadas peticiones. Se ha relajado el límite, por favor espera unos segundos.',
      });
    } else if (error && !error.response) {
      toast.error('Fallo de conexión con el servidor maestro');
    }
  }, [instancesError, authError]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      queryClient.setQueryData(['auth-user'], response);
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth-user'], null);
      queryClient.removeQueries();
      window.location.href = '/login';
    },
  });

  return {
    user: authData?.data?.user as User | null,
    currentInstance: authData?.data?.currentInstance as Instance | null,
    instances: (instancesData || []) as { id: number; nombre_mostrable: string; db_name: string }[],
    isAuthenticated: !!authData?.data?.user,
    isLoading: isLoading || (isLoadingInstances && !isFetched),
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
}
