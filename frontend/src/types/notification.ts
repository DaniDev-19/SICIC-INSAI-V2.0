export type NotificationType =
  | 'INFO'
  | 'WARNING'
  | 'SUCCESS'
  | 'ERROR'
  | 'STOCK'
  | 'INSPECCION'
  | 'SOLICITUD';

export interface NotificationItem {
  id: number;
  usuario_global_id: number;
  mensaje: string;
  tipo: NotificationType;
  leido: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  status: 'success' | 'error';
  data: NotificationItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface UnreadCountResponse {
  status: 'success' | 'error';
  data: {
    unreadCount: number;
  };
}
