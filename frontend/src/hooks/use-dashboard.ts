import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
    // Sin polling automatico: el usuario recarga manualmente con el boton del dashboard
    refetchInterval: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
