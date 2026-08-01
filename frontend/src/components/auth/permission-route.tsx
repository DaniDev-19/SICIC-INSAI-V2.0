import { Outlet } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions';
import Error403 from '@/pages/error/Error403';

interface PermissionRouteProps {
  screen: string;
}

export function PermissionRoute({ screen }: PermissionRouteProps) {
  const { canSee } = usePermissions();

  if (!canSee(screen)) {
    return <Error403 />;
  }

  return <Outlet />;
}

