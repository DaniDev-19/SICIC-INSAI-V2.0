# Búsqueda Multitérmino e Interfaz Global - SICIC-INSAI V2.0

Este documento detalla la implementación en el cliente web de la **Búsqueda Multitérmino Tokenizada**, la integración de Custom Hooks con **TanStack Query** y el funcionamiento del modal de **Búsqueda Global (Command Palette)**.

---

## 1. Experiencia de Usuario (UX) de Búsqueda

El sistema proporciona dos niveles de búsqueda responsiva:

1. **Búsqueda Local por Módulo:** Campo de texto integrado en el Header de las vistas (Propiedades, Clientes, Inspecciones, etc.) que filtra los registros de la tabla en tiempo real sin requerir pulsar Enter.
2. **Búsqueda Global Omnipresente:** Accesible desde el Header principal o mediante el atajo de teclado `Ctrl + K` / `Cmd + K`, permitiendo consultar el ERP completo desde cualquier pantalla.

---

## 2. Custom Hook `useDebounce`

Para prevenir peticiones innecesarias al servidor mientras el usuario escribe, todos los componentes de búsqueda consumen el custom hook `useDebounce`:

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## 3. Integración con TanStack Query y Hooks de Datos

Los custom hooks del frontend (`usePropiedades`, `useClientes`, `useInspecciones`, etc.) pasan la cadena desfasada (`searchQuery`) como clave de consulta para la caché:

```typescript
export const usePropiedades = (searchQuery: string = '', page: number = 1) => {
  const debouncedSearch = useDebounce(searchQuery, 350);

  return useQuery({
    queryKey: ['propiedades', debouncedSearch, page],
    queryFn: () => propiedadesService.getAll({ q: debouncedSearch, page }),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché inteligente
  });
};
```

---

## 4. Modal de Búsqueda Global (Command Palette / Dialog)

El componente de búsqueda global categoriza dinámicamente los resultados devueltos por `/api/search` en secciones visuales:

- **Propiedades / Predios**
- **Productores / Clientes**
- **Solicitudes & Trámites**
- **Planificaciones de Inspección**
- **Inspecciones Sanitarias & Silos**
- **Personal & Empleados**

Al seleccionar cualquier elemento del modal, la interfaz realiza la navegación reactiva mediante `react-router-dom` a la vista detallada o abre el modal de edición correspondiente.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
