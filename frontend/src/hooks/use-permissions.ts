import { useAuth } from './use-auth';

export function usePermissions() {
  const { currentInstance } = useAuth();
  const permisos = currentInstance?.permisos || {};

  /**
   * @param screen 
   * @param action 
   * @returns 
   */
  const hasPermission = (screen: string, action: string): boolean => {

    if (permisos['all']?.includes('*')) return true;

    if (permisos[screen]?.includes('*')) return true;

    const pantallaPermisos = permisos[screen];

    if (!Array.isArray(pantallaPermisos)) {
      return false;
    }

    return pantallaPermisos.includes(action);
  };

  /**
   * @param screen 
   * @returns 
   */
  const canSee = (screen: string): boolean => {
    return hasPermission(screen, 'see');
  };

  return {
    permisos,
    hasPermission,
    canSee,
    isAdmin: currentInstance?.rol === 'SuperAdmin' || currentInstance?.rol === 'SUPER_ADMIN'
  };
}
