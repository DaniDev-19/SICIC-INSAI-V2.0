# Gestión de Roles y Permisos

SICIC-INSAI V2.0 utiliza un sistema de control de acceso basado en roles (RBAC) dinámico, donde los permisos se definen mediante objetos JSON de alta granularidad.

## 1. Estructura de un Rol

Cada rol en el sistema tiene la siguiente estructura técnica alineada con el Master Schema:

```json
{
  "id": 1,
  "nombre": "Administrador Regional",
  "descripcion": "Acceso total a las operaciones del estado",
  "status": true,
  "permisos": {
    "HOME": ["VER"],
    "ROLES": ["VER", "CREAR", "EDITAR"],
    "USER": ["VER", "CREAR", "EDITAR", "ELIMINAR", "DESHABILITAR"]
  }
}
```

> [!NOTE]
> **Bypass Total**: Si el objeto de permisos contiene `"all": ["*"]`, el sistema otorga acceso total (Lógica de Supervusuario).

## 2. Consumo de Permisos en el Frontend

Cuando un usuario inicia sesión, sus permisos específicos para la **instancia actual** se inyectan en el contexto de autenticación.

### Cómo verificar permisos en componentes
Se recomienda usar el objeto `permisos` del `currentInstance`. Las claves de pantalla y acción deben coincidir con las constantes definidas en el sistema.

```tsx
const { currentInstance } = useAuth();
const permisos = currentInstance?.permisos;

// Ejemplo de validación granular
{permisos?.ROLES?.includes('CREAR') && (
  <Button>Nuevo Rol</Button>
)}

// Ejemplo de validación de sección total
{permisos?.INVENTARIO && (
  <SidebarLink to="/inventario" />
)}
```

## 3. Estado y Persistencia
El campo `status` permite inhabilitar un rol globalmente sin afectar los registros históricos de auditoría. Un rol inactivo impedirá que los usuarios asociados a él puedan operar en sus respectivas instancias.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
