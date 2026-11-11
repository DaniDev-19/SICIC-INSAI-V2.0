import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { resolveScreenKey } from '@/lib/permissions';

export function usePermissions() {
  const { currentInstance } = useAuth();
  const permisos = currentInstance?.permisos || {};

  const hasPermission = useCallback((screen: string, action: string): boolean => {
    if (permisos['all']?.includes('*')) return true;

    const key = resolveScreenKey(screen);
    const keysToCheck = [key, screen];
    if (key === 'insumos') keysToCheck.push('inventario');
    if (key === 'planificaciones') keysToCheck.push('planificacion');
    if (key === 'acta_silos') keysToCheck.push('inspecciones_silos', 'silos');
    if (key === 'configuracion') keysToCheck.push('configuraciones');
    if (key === 'mail') keysToCheck.push('comunicados', 'correos');
    if (key === 'bitacora') keysToCheck.push('auditoria');
    if (key === 'clientes') keysToCheck.push('productores');

    for (const k of keysToCheck) {
      if (permisos[k]?.includes('*')) return true;
      const pantallaPermisos = permisos[k];
      if (Array.isArray(pantallaPermisos)) {
        if (pantallaPermisos.includes(action)) return true;
        // Compatibilidad transparente entre 'edit' y 'update'
        if (
          (action === 'edit' && pantallaPermisos.includes('update')) ||
          (action === 'update' && pantallaPermisos.includes('edit'))
        ) {
          return true;
        }
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
