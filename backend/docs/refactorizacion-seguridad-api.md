# Manual de Arquitectura de Validación y Capa de Resiliencia

Este documento describe la arquitectura de seguridad y la lógica de validación unificada del backend, diseñada para garantizar la integridad de los datos y la estabilidad operativa del SICIC-INSAI.

## 1. Matriz de Validación Unificada (validateSchema)

El sistema implementa una capa de middleware de validación que actúa como guardián estructural antes de cualquier operación de persistencia.

- **Estructura Proactiva**: El middleware no solo filtra el `body` de las peticiones, sino que valida simultáneamente `query` y `params`, permitiendo una integridad de datos multidimensional.
- **Contratos de Datos (Zod)**: Se utiliza el encapsulamiento de esquemas dentro de claves `body`. Esto asegura que el API solo procese campos permitidos, mitigando ataques de "Mass Assignment" o inyección de datos no estructurados.
- **Resiliencia en Ejecución**: El middleware está diseñado para interceptar esquemas mal definidos o nulos, respondiendo con errores controlados en lugar de permitir fallos en el hilo principal del servidor.

## 2. Capa de Resiliencia de Errores (Error Handler)

La arquitectura incluye un motor de captura de excepciones que transforma logs técnicos en feedback de negocio accionable.

- **Traducción de Excepciones**: Los errores internos de validación (Zod Issues) se mapean automáticamente a rutas de error legibles (ej. `nombre.min`).
- **Protección de la Base de Datos**: Al actuar como un filtro de primera línea, el handler evita que peticiones con tipos de datos incorrectos lleguen a Prisma, reduciendo la carga innecesaria en la base de datos y previniendo bloqueos transaccionales.

## 3. Seguridad Perimetral y Capas de Acceso (RBAC)

La arquitectura de seguridad se basa en una jerarquía de middlewares que deben ser superados secuencialmente:

1.  **Capa de Autenticación (`protect`)**: Valida la identidad mediante JWT y establece el contexto del usuario en `req.user`.
2.  **Capa de Autorización (`checkPermission`)**: Verifica dinámicamente si el rol del usuario posee la capacidad (`see`, `create`, `edit`, `delete`) sobre el recurso solicitado.
3.  **Capa de Integridad de Datos**: Antes de eliminar o modificar registros (especialmente en borrados masivos), se ejecutan consultas de dependencia para asegurar que no se rompan vínculos operativos.

---

_Arquitectura de Backend - SICIC-INSAI V2.0_
