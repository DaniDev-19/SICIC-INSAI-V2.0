import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { resolveScreenKey } from '@/lib/permissions';

export function usePermissions() {
  const { currentInstance } = useAuth();
  const permisos = currentInstance?.permisos || {};

  const hasPermission = useCallback((screen: string, action: string): boolean => {
    if (permisos['all']?.includes('*')) return true;

    const key = resolveScreenKey(screen);
    const keysToCheck = key === screen ? [key] : [key, screen];

    for (const k of keysToCheck) {
      if (permisos[k]?.includes('*')) return true;
      const pantallaPermisos = permisos[k];
      if (Array.isArray(pantallaPermisos) && pantallaPermisos.includes(action)) {
        return true;
      }
    }

    return false;
  }, [permisos]);

  const canSee = useCallback((screen: string): boolean => {
    return hasPermission(screen, 'see');
  }, [hasPermission]);

  const userRole = (currentInstance?.rol || '').toLowerCase();
  const isAdmin = Boolean(
    permisos['all']?.includes('*') ||
    ['admin', 'administrador', 'superadmin', 'super_admin'].includes(userRole)
  );

  return {
    permisos,
    hasPermission,
    canSee,
    isAdmin,
  };
}
