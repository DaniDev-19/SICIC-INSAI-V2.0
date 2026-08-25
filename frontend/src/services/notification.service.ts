import apiClient from '../lib/api-client';
import type {
  NotificationItem,
  NotificationsResponse,
  UnreadCountResponse,
} from '../types/notification';

export const notificationService = {
  /**
   * Obtiene la lista de notificaciones con paginación y filtros
   */
  getNotificaciones: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
    tipo?: string;
  }): Promise<NotificationsResponse> => {
    const { data } = await apiClient.get<NotificationsResponse>('/notificaciones', {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 15,
        unreadOnly: params?.unreadOnly ? 'true' : undefined,
        tipo: params?.tipo || undefined,
      },
    });
    return data;
  },

  /**
   * Obtiene la cantidad de notificaciones no leídas
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const { data } = await apiClient.get<UnreadCountResponse>('/notificaciones/unread-count');
    return data;
  },

  /**
   * Marca una notificación como leída
   */
  markAsRead: async (id: number): Promise<{ status: string; data: NotificationItem }> => {
    const { data } = await apiClient.patch<{ status: string; data: NotificationItem }>(
      `/notificaciones/${id}/read`
    );
    return data;
  },

  /**
   * Marca todas las notificaciones del usuario como leídas
   */
  markAllAsRead: async (): Promise<{ status: string; data: { updatedCount: number } }> => {
    const { data } = await apiClient.patch<{ status: string; data: { updatedCount: number } }>(
      '/notificaciones/read-all'
    );
    return data;
  },

  /**
   * Elimina una notificación por su ID
   */
  deleteNotification: async (id: number): Promise<{ status: string; message: string }> => {
    const { data } = await apiClient.delete<{ status: string; message: string }>(
      `/notificaciones/${id}`
    );
    return data;
  },
};
