import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Package,
  ClipboardList,
  FileText,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Info,
  RefreshCw,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/use-notifications';
import { cn } from '@/lib/utils';
import type { NotificationItem, NotificationType } from '@/types/notification';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  const {
    notifications,
    unreadCount,
    isLoading,
    isFetching,
    refetch,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    isMarkingAllRead,
  } = useNotifications({
    unreadOnly: activeTab === 'unread',
    limit: 25,
    enabled: true,
  });

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'STOCK':
        return <Package className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'INSPECCION':
        return <ClipboardList className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'SOLICITUD':
        return <FileText className="h-4 w-4 text-purple-500 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'ERROR':
        return <AlertOctagon className="h-4 w-4 text-rose-500 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="h-4 w-4 text-sky-500 shrink-0" />;
    }
  };

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'STOCK':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">Inventario</Badge>;
      case 'INSPECCION':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">Inspección</Badge>;
      case 'SOLICITUD':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10">Solicitud</Badge>;
      case 'WARNING':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10">Aviso</Badge>;
      case 'ERROR':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-500/10">Urgente</Badge>;
      case 'SUCCESS':
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">Éxito</Badge>;
      case 'INFO':
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10">Info</Badge>;
    }
  };

  const formatNotificationTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return 'Reciente';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-accent/80 transition-colors focus-visible:ring-1"
          title="Notificaciones"
          aria-label="Abrir centro de notificaciones"
        >
          <Bell className="h-5 w-5 text-muted-foreground transition-transform hover:rotate-12" />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-in zoom-in-50">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
              <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full bg-rose-500 animate-ping opacity-60 pointer-events-none" />
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 shadow-2xl border-border/80 bg-background/95 backdrop-blur-md rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm tracking-tight text-foreground">
              Notificaciones
            </h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {unreadCount} nueva{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => refetch()}
              title="Actualizar"
              disabled={isFetching}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin text-primary")} />
            </Button>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllRead}
                title="Marcar todas como leídas"
              >
                <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Leer todas</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tabs Filter */}
        <div className="flex items-center border-b px-3 bg-muted/10 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              "py-2 text-xs font-medium border-b-2 transition-colors -mb-px px-2",
              activeTab === 'all'
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={cn(
              "py-2 text-xs font-medium border-b-2 transition-colors -mb-px px-2 flex items-center gap-1.5",
              activeTab === 'unread'
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            No leídas
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-muted-foreground/20 px-1 text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* List Content */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40 scrollbar-thin">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 rounded-full bg-muted shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
                <Bell className="h-5 w-5 opacity-40" />
              </div>
              <p className="text-sm font-medium text-foreground">Sin notificaciones</p>
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {activeTab === 'unread'
                  ? 'No tienes notificaciones pendientes por leer.'
                  : 'No se han registrado eventos o alertas recientes.'}
              </p>
            </div>
          ) : (
            notifications.map((item: NotificationItem) => (
              <div
                key={item.id}
                className={cn(
                  "p-3.5 flex items-start gap-3 transition-colors hover:bg-muted/40 group relative",
                  !item.leido && "bg-primary/[0.03] dark:bg-primary/[0.06]"
                )}
              >
                {/* Icon */}
                <div className="mt-0.5 p-1.5 rounded-lg bg-background border shadow-xs shrink-0">
                  {getNotificationIcon(item.tipo)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {getNotificationBadge(item.tipo)}
                    <span className="text-[11px] text-muted-foreground font-normal">
                      {formatNotificationTime(item.created_at)}
                    </span>
                    {!item.leido && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary inline-block" title="No leída" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed break-words font-normal">
                    {item.mensaje}
                  </p>
                </div>

                {/* Actions */}
                <div className="absolute top-3 right-2 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  {!item.leido && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => markAsRead(item.id)}
                      title="Marcar como leída"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    onClick={() => deleteNotification(item.id)}
                    title="Eliminar notificación"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-2 border-t bg-muted/20 text-center">
            <p className="text-[11px] text-muted-foreground">
              {notifications.length} {notifications.length === 1 ? 'notificación mostrada' : 'notificaciones mostradas'}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
