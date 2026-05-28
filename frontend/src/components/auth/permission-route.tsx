import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';

interface PermissionRouteProps {
  screen: string;
}

export function PermissionRoute({ screen }: PermissionRouteProps) {
  const { canSee } = usePermissions();

  if (!canSee(screen)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
