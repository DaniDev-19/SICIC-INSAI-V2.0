import { useMemo } from 'react';
import { usePermissions } from './use-permissions';
import {
  MODULES_WITH_EDIT_ACTION,
  resolveScreenKey,
  type ModulePermissions,
} from '@/lib/permissions';

export function useModulePermissions(screen: string): ModulePermissions {
  const { hasPermission, canSee } = usePermissions();
  const key = resolveScreenKey(screen);

  return useMemo(() => {
    const canUpdate = MODULES_WITH_EDIT_ACTION.has(key)
      ? hasPermission(key, 'edit')
      : hasPermission(key, 'update') || hasPermission(key, 'edit');

    return {
      screen: key,
      canSee: canSee(key) || canSee(screen),
      canCreate: hasPermission(key, 'create'),
      canUpdate,
      canDelete: hasPermission(key, 'delete'),
      canExport: hasPermission(key, 'export'),
      canDisable: hasPermission(key, 'disable'),
    };
  }, [hasPermission, canSee, key, screen]);
}
