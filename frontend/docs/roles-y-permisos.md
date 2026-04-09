# Gestión de Roles y Permisos

SICIC-INSAI V2.0 utiliza un sistema de control de acceso basado en roles (RBAC) dinámico, donde los permisos se definen mediante objetos JSON.

## 1. Estructura de un Rol

Cada rol en el sistema tiene la siguiente estructura básica:

```json
{
  "id": 1,
  "nombre": "Administrador Regional",
  "descripcion": "Acceso total a las operaciones del estado",
  "permisos": {
    "dashboard": ["ver"],
    "inspecciones": ["crear", "editar", "eliminar", "ver"],
    "configuracion": ["ver", "editar"]
  }
}
```

## 2. Consumo de Permisos en el Frontend

Cuando un usuario inicia sesión, sus permisos específicos para la **instancia actual** se cargan en el estado global (`useAuth`).

### Cómo verificar permisos en componentes
Para ocultar o mostrar elementos de la interfaz, se debe utilizar el objeto `permisos` dentro del contexto de autenticación:

```tsx
const { currentInstance } = useAuth();
const permisos = currentInstance?.permisos;

// Ejemplo de validación
{permisos?.inspecciones?.includes('crear') && (
  <Button>Nueva Inspección</Button>
)}
```

## 3. Roles por Instancia

Es importante recordar que un usuario puede tener diferentes roles en diferentes instancias. El sistema cargará automáticamente el rol correspondiente dependiendo de la oficina/instancia seleccionada durante el login.

---
[Volver al índice de documentación](../WIKI.md)
