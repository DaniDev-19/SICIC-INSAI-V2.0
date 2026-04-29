# WIKI de Backend - SICIC-INSAI V2.0

Esta Wiki contiene la documentación detallada para el motor de servicios del Backend.

---

## Arquitectura y Seguridad

Para entender a fondo cómo viajan las peticiones, cómo se protegen los datos y cómo opera el motor de permisos, consulta los manuales técnicos:

- [**Arquitectura y Flujo de Peticiones**](./docs/arquitectura_flujo.md): Ciclo de vida general de una Request en el API.
- [**Flujo de Roles y Seguridad (RBAC)**](./docs/flujo-roles-backend.md): Manual funcional del motor de permisos, Prisma Master y Middlewares.
- [**Arquitectura de Auditoría y Bitácora**](./docs/bitacora-arquitectura-backend.md): Manual técnico sobre el motor de auditoría y registro de movimientos.
- [**Arquitectura de Resiliencia y Validación de Seguridad**](./docs/refactorizacion-seguridad-api.md): Manual técnico sobre la capa de validación de datos, manejo de excepciones y jerarquía de seguridad perimetral.
- [**Gestión de Multi-Tenancia y Conexiones Dinámicas**](./docs/multi-tenancia-middleware.md): Manual técnico sobre el middleware de inyección de base de datos (`req.db`).
- [**Servicios Globales y Flujos Optimizados**](./docs/servicios_y_flujos_optimizados.md): Manual sobre el uso de Imágenes (WebP/Cloud), Excel e integración de tablas puente.
- [**Gestión de Errores Estandarizada**](./docs/gestion_errores_estandarizada.md): Detalle de códigos de error de base de datos, validación y respuestas HTTP.
- [**Patrones de Diseño y Arquitectura**](./docs/patrones_diseno_arquitectura.md): Explicación de los patrones Strategy, Factory, Singleton y la estructura modular del sistema.

---

## Proceso de Autenticación (Multi-Tenant)

El sistema utiliza un flujo de tres capas para asignar a un usuario a su base de datos correspondiente:

### 1. Login Centralizado

El usuario envía sus credenciales al endpoint `/api/auth/login`. El controlador consulta la tabla `usuarios` en la **Base de Datos Master**.

### 2. Descubrimiento de Instancias

Si las credenciales son válidas, el sistema busca en la tabla `usuario_instancia` todas las bases de datos operativas a las que el usuario tiene acceso.

### 3. Emisión de Token

Se genera un **JWT** (JSON Web Token) que contiene:

- ID de usuario.
- Email.
- Username.
- Lista de instancias permitidas.

El token vence en **8 horas** (configuración de seguridad estándar del INSAI).

---

## ⬢ Prisma y el Dual Schema

En lugar de un solo esquema monolítico, manejamos dos archivos dentro de la carpeta `/prisma`:

1.  **`schema.prisma` (Operativo):** Define las tablas de inspecciones, kardex, y toda logica creada. Se usa para las bases de datos de clientes/períodos.
2.  **`master.prisma` (De Control):** Define las tablas de roles, usuarios e instancias. Es la única base de datos fija.

### Cómo agregar una tabla operativa:

1.  Agrégala en la base de datos PostgreSQL.
2.  Ejecuta `npx prisma db pull`.
3.  Ejecuta `npx prisma generate`.
4.  Reinicia el servidor dev.

---

## Estructura de Errores Global

Cualquier error en el sistema se captura mediante el middleware `error.handler.js`. Para ver el manual detallado de códigos y validaciones, consulta la [**Gestión de Errores Estandarizada**](./docs/gestion_errores_estandarizada.md).

---

_Para ver los comandos técnicos, consulta la [Guía de Comandos](./docs/guia_comandos.md)._
