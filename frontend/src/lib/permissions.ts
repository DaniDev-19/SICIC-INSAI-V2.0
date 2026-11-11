export const SCREEN_ALIASES: Record<string, string> = {
  planificacion: 'planificaciones',
  inspecciones_silos: 'acta_silos',
  silos: 'acta_silos',
  actasilos: 'acta_silos',
  configuraciones: 'configuracion',
  configuracion_global: 'configuracion',
  inventario: 'insumos',
  comunicados: 'mail',
  correos: 'mail',
  correo: 'mail',
  user: 'usuarios',
  auditoria: 'bitacora',
  productores: 'clientes',
};

export function resolveScreenKey(screen: string): string {
  return SCREEN_ALIASES[screen] ?? screen;
}

export const MODULES_WITH_EDIT_ACTION = new Set(['usuarios', 'instancias', 'roles', 'configuracion']);

export type PermissionAction =
  | 'see'
  | 'create'
  | 'update'
  | 'edit'
  | 'delete'
  | 'disable'
  | 'export';

export interface ModulePermissions {
  screen: string;
  canSee: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canDisable: boolean;
}
