import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface CanProps {
  /** Clave de pantalla (módulo). */
  screen: string;
  /** Acción requerida: see, create, update, edit, delete, export, disable. */
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Renderiza children solo si el usuario tiene permiso para la acción en la pantalla.
 *
 * @example
 * <Can screen="clientes" action="create">
 *   <Button>Nuevo productor</Button>
 * </Can>
 */
export const Can: React.FC<CanProps> = ({ screen, action, children, fallback = null }) => {
  const { hasPermission } = usePermissions();

  if (hasPermission(screen, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/** @deprecated Usar props `screen` y `action`. */
interface LegacyCanProps {
  I: string;
  a: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const CanLegacy: React.FC<LegacyCanProps> = ({ I, a, children, fallback = null }) => (
  <Can screen={a} action={I} fallback={fallback}>
    {children}
  </Can>
);

export default Can;
