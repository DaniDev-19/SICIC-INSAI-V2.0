#  WIKI de Frontend - SICIC-INSAI V2.0

Esta Wiki detalla los estándares de diseño y flujos de usuario para la interfaz web.

---

## Documentación Detallada del Flujo

Para profundizar en el funcionamiento técnico del frontend, consulta los siguientes manuales:
*   [**Flujo de Autenticación e Instancias**](./docs/flujo-autenticacion.md): Manual operativo del login multi-tenant y la gestión de sesión mediante `useAuth`.
*   [**Gestión de Roles y Permisos**](./docs/roles-y-permisos.md): Guía de arquitectura sobre cómo se consumen y validan los permisos dinámicos en la interfaz.
*   [**Guía de Modernización UI**](./docs/guia-ui-modernizacion.md): Documentación funcional de la nueva arquitectura de componentes (Dialogs, Matrix y Tematización).
*   [**Manual de Navegación, Búsqueda y UX V2**](./docs/modernizacion-sidebar-v2.md): Guía completa sobre la arquitectura de dominios, motores de búsqueda (Global/Local) y gestión masiva de datos.

---

##  Estándares de Diseño y Estética Premium

El proyecto sigue principios de diseño moderno para una experiencia ERP de alto impacto:

### 1. Paleta de Colores Curada
*   **Fondos:** Dark Mode con contrastes suaves (HLS).
*   **Acentos:** Gradiantes dinámicos para resaltar botones de acción.
*   **Alertas:** Uso consistente de colores para estados (Rojo error, Verde éxito, Amarillo advertencia).

### 2. Animaciones y Micro-Interacciones
*   Uso de framer-motion para transiciones entre páginas.
*   Hover effects sutiles en todos los elementos interactivos.
*   Carga progresiva (Skeleton screens) para una percepción de velocidad superior.

---

##  Conexión con el Backend Multi-Tenant

El frontend maneja la persistencia de la sesión mediante un almacén centralizado (Store):

1.  **Login:** Al autenticarse, recibe el token y la lista de instancias.
2.  **Selección de Instancia:** El usuario debe elegir una base de datos operativa activa de su lista permitida.
3.  **Persistencia del Header:** Todas las peticiones posteriores incluyen el `Authorization: Bearer <TOKEN>` y, opcionalmente, el ID de la instancia seleccionada.

---

##  Organización de Servicios (API)

Todas las funciones de red se encuentran en la carpeta `/src/services`. Ejemplo de estructura:
*   `auth.service.ts`: Manejo de Login y Logout.
*   `operative.service.ts`: Consultas generales a la base de datos operativa seleccionada.

---

##  Guía para Nuevos Componentes
Al crear un nuevo componente, sigue este patrón:
1.  Ubícalo en `/src/components`.
2.  Usa **TailwindCSS** para el diseño.
3.  Implementa **Lucide React** para iconografía.
4.  Exporta el componente como un módulo nombrado.

---
*Para ver la configuración de despliegue, consulta el archivo `vercel.json` en la raíz.*
