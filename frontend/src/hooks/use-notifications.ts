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

  // Consulta de conteo de no leídas con refresco periódico cada 30 segundos
  const { data: unreadData, isLoading: isLoadingCount } = useQuery({
    queryKey: NOTIFICATIONS_KEYS.unreadCount(),
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    staleTime: 10000,
  });

  // Consulta de listado de notificaciones
  const {
    data: notificationsData,
    isLoading: isLoadingList,
    isFetching: isFetchingList,
    refetch: refetchList,
  } = useQuery({
    queryKey: NOTIFICATIONS_KEYS.list(filters),
    queryFn: () => notificationService.getNotificaciones(filters),
    enabled: filters?.enabled !== false,
    staleTime: 10000,
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

  return {
    notifications: notificationsData?.data || [],
    pagination: notificationsData?.pagination,
    unreadCount: unreadData?.data?.unreadCount || 0,
    isLoading: isLoadingList || isLoadingCount,
    isFetching: isFetchingList,
    refetch: refetchList,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingRead: markAsReadMutation.isPending,
    isMarkingAllRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
}
