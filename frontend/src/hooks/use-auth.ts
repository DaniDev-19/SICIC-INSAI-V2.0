import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import type { User, Instance, LoginResponse } from '../types/auth';

export function useAuth() {
  const queryClient = useQueryClient();

  const {
    data: authData,
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ['auth-user'],
    queryFn: async () => {
      try {
        const response = await authService.getMe();
        return response;
      } catch (error) {
        return { data: { user: null, currentInstance: null } } as LoginResponse;
      }
    },
    retry: 0,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60 * 24,
  });

  const { data: instancesData, isLoading: isLoadingInstances } = useQuery({
    queryKey: ['auth-instances'],
    queryFn: async () => {
      const response = await authService.getInstances();
      return response.data;
    },
    staleTime: 1000 * 60 * 30,
  });

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
    instances: (instancesData || []) as any[],
    isAuthenticated: !!authData?.data?.user,
    isLoading: isLoading || (isLoadingInstances && !isFetched),
    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
  };
}
