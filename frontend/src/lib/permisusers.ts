export const PANTALLAS = [
    { key: 'home', label: 'Inicio / Dashboard', ACCIONES: ['see', 'export'] },
    { key: 'roles', label: 'Gestión de Roles', ACCIONES: ['see', 'create', 'edit', 'delete'] },
    { key: 'usuarios', label: 'Usuarios del Sistema', ACCIONES: ['see', 'create', 'edit', 'delete', 'disable'] },
    { key: 'instancias', label: 'Instancias / Sedes', ACCIONES: ['see', 'create', 'edit', 'delete', 'disable'] },
    { key: 'user', label: 'Gestión de Usuarios (legacy)', ACCIONES: ['see', 'create', 'edit', 'delete', 'disable'] },
    { key: 'inventario', label: 'Inventario', ACCIONES: ['see', 'create', 'edit', 'delete'] },
    { key: 'reportes', label: 'Reportes y Estadísticas', ACCIONES: ['see', 'export'] },
    { key: 'auditoria', label: 'Auditoría / Logs', ACCIONES: ['see', 'export', 'clear'] },
    { key: 'configuracion', label: 'Configuración Global', ACCIONES: ['see', 'edit'] },
]

export const ACCIONES = [
    { key: 'see', label: 'Ver' },
    { key: 'create', label: 'Crear' },
    { key: 'edit', label: 'Editar' },
    { key: 'delete', label: 'Eliminar' },
    { key: 'disable', label: 'Deshabilitar' },
    { key: 'export', label: 'Exportar' },
    { key: 'clear', label: 'Limpiar' }
]