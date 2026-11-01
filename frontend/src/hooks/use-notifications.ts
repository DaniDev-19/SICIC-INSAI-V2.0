import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import { toast } from 'sonner';

export const NOTIFICATIONS_KEYS = {
  all: ['notifications'] as const,
  list: (filters?: { page?: number; limit?: number; unreadOnly?: boolean; tipo?: string }) =>
    [...NOTIFICATIONS_KEYS.all, 'list', filters] as const,
  unreadCount: () => [...NOTIFICATIONS_KEYS.all, 'unread-count'] as const,
};

export function useNotifications(filters?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  tipo?: string;
  enabled?: boolean;
}) {
  const queryClient = useQueryClient();
  const hasToken = typeof window !== 'undefined' ? Boolean(localStorage.getItem('token')) : false;

  // Consulta de conteo de no leídas (100% manual o al cargar sesión, SIN sondeo periódico en segundo plano)
  const {
    data: unreadData,
    isLoading: isLoadingCount,
    isFetching: isFetchingCount,
    refetch: refetchCount,
  } = useQuery({
    queryKey: NOTIFICATIONS_KEYS.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    enabled: hasToken,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Consulta de listado de notificaciones (solo activa cuando se despliega el menú o se recarga manualmente)
  const isListEnabled = hasToken && filters?.enabled !== false;
  const {
    data: notificationsData,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    refetch: refetchList,
  } = useQuery({
    queryKey: NOTIFICATIONS_KEYS.list(filters),
    queryFn: () => notificationService.getNotificaciones(filters),
    enabled: isListEnabled,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // Marcar una como leída
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al marcar la notificación como leída';
      toast.error(msg);
    },
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
      toast.success('Todas las notificaciones han sido marcadas como leídas');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al actualizar notificaciones';
      toast.error(msg);
    },
  });

  // Eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEYS.all });
      toast.success('Notificación eliminada');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Error al eliminar la notificación';
      toast.error(msg);
    },
  });

  const refreshAll = async () => {
    await Promise.all([refetchCount(), refetchList()]);
  };

  return {
    notifications: notificationsData?.data || [],
    pagination: notificationsData?.pagination,
    unreadCount: unreadData?.data?.unreadCount || 0,
    isLoading: isLoadingList || isLoadingCount,
    isFetching: isFetchingList || isFetchingCount,
    refetch: refreshAll,
    refetchList,
    refetchCount,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}
