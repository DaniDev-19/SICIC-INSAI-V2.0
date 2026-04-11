# Guía de Navegación y Arquitectura UX (V2.0)

Este manual documenta la nueva arquitectura de interfaz del SICIC-INSAI, diseñada para ofrecer un entorno ERP de alto rendimiento con una jerarquía de información optimizada y herramientas de búsqueda avanzada.

## 1. Sistema de Navegación por Dominios (Sidebar)
La barra lateral ha sido evolucionada de un modelo estático a un sistema funcional de **Dominios Operativos**. Cada sección está diseñada para agrupar módulos con afinidad funcional:

*   **Panel Principal**: Punto de entrada a la inteligencia de negocios y vista consolidada.
*   **Seguridad y Acceso**: Centro de mando de RBAC (Control de Acceso Basado en Roles). Gestiona identidades de usuarios, asignación de empleados y jerarquías de roles.
*   **Inventario e Insumos**: Núcleo operativo para el control de recursos materiales y existencias del INSAI.
*   **Reportes y Auditoría**: Capa de inteligencia y trazabilidad para la generación de estadísticas y seguimiento de logs.
*   **Gestión de Sistema**: Módulo de administración global para configuraciones de infraestructura.

## 2. Ecosistema de Búsqueda Inteligente
Se han implementado dos capas de recuperación de información para maximizar la velocidad operativa:

### 2.1. Buscador Global (Command Palette)
Ubicado en el header principal del sistema, permite una navegación por comandos (K-Command).
- **Alcance**: Indexa todos los nombres de módulos, carpetas y accesos directos del sistema.
- **Tecnología**: Implementado mediante `cmdk`, ofrece una interfaz de "atajos rápidos" para saltar entre dominios (ej: "Ir a Roles") sin utilizar el menú lateral.

### 2.2. Buscador Local (Filtrado Reactivo)
Presente en las cabeceras de las tablas maestras (como Roles o Usuarios).
- **Comportamiento**: Realiza un filtrado en caliente sobre el estado local (`filteredRoles`).
- **Arquitectura**: Utiliza `useMemo` para recalcular la lista filtrada basándose en el nombre, descripción o estatus, garantizando una respuesta instantánea sin peticiones adicionales al servidor.

## 3. Gestión Masiva y Acciones Grupales
Para optimizar el mantenimiento de grandes volúmenes de datos, se ha introducido el motor de **Acciones en Lote**:

*   **Floating Bulk Bar**: Una barra de herramientas persistente que emerge al detectar una selección múltiple.
*   **Estados de Selección**: Integración de checkboxes con soporte para estado "indeterminado" en la cabecera, permitiendo selecciones masivas en un solo clic.
*   **Purgado Seguro**: El proceso de eliminación masiva cuenta con una capa de validación que detecta cuántos elementos son elegibles para borrado, notificando al usuario mediante un `200 Warning` si existen dependencias activas que impiden el borrado total.

## 4. Estética y Performance
*   **Visibilidad Permanente**: Los botones de acción en tablas son ahora fijos (`opacity-100`), priorizando la velocidad de ejecución sobre el minimalismo visual.
*   **Layout Reactivo**: El componente `SidebarTrigger` ahora implementa lógica contextual para ofrecer tooltips dinámicos basados en el estado de colapso.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**

