# Gestión de Tipos y Estructura de Archivos (Frontend)

Este documento detalla cómo se organizan los tipos de TypeScript y la jerarquía de archivos para mantener una base de código escalable, robusta y fácil de auditar.

---

## 1. Organización de Tipos (TS)

Los tipos se centralizan en la carpeta `src/types/` para evitar redundancias y facilitar la reutilización en componentes y servicios.

### Categorías Principales
- **`auth.ts`:** Define las interfaces de usuario, roles, permisos y la sesión (JWT).
- **`operative.ts`:** Contiene los tipos para las entidades del negocio (Solicitudes, Inspecciones, etc.).
- **`api.ts`:** Estructuras estándar de respuesta del backend (Success, Error, Pagination).

### Ejemplo de Estándar
```typescript
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
  pagination?: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}
```

---

## 2. Jerarquía de Archivos y Servicios

El frontend se divide en capas modulares para separar la lógica de negocio de la interfaz de usuario.

- **`/src/lib`:** Configuraciones base y clientes de terceros (ej. `api-client.ts` con Axios).
- **`/src/services`:** Funciones asíncronas que consumen la API. No contienen lógica de UI.
- **`/src/hooks`:** Ganchos personalizados para manejar estados complejos o lógica reutilizable.
- **`/src/pages` y `/src/components`:** Capa de presentación que consume servicios y hooks.

---

## 3. Flujo de Datos y Tipado

1.  **Servicio:** Define el tipo de retorno esperado basado en la respuesta de la API.
2.  **Hook/Page:** Consume el servicio y tipa el estado local (`useState<T>`).
3.  **Componente:** Recibe los datos mediante `props` estrictamente tipadas.

---

## 4. Archivos Relacionados con la Robustez

Recientemente se han integrado archivos clave para mejorar la estabilidad del sistema:
- **`src/lib/api-client.ts`:** Ahora incluye un interceptor de peticiones que genera automáticamente el header `X-Idempotency-Key` para evitar duplicidad de datos en el servidor.

---

**Arquitectura de Tipos y Estructura**
**SICIC-INSAI V2.0**
