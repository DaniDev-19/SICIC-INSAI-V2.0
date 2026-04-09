# Flujo de Autenticación y Multi-Tenancy

Este documento detalla cómo funciona el sistema de acceso y la arquitectura multi-instancia desde la perspectiva del Frontend.

## 1. El Proceso de Login

A diferencia de un login tradicional, SICIC-INSAI V2.0 requiere que el usuario especifique a qué instancia (oficina/sede/estado) desea acceder.

### Paso A: Carga de Instancias
Al cargar la página de login, el frontend realiza una petición a:
`GET /api/auth/instances`

Esta ruta devuelve una lista de todas las instancias operativas registradas en la base de datos **Master**. Estas se despliegan en el selector (dropdown) del formulario de login.

### Paso B: Envío de Credenciales
El usuario envía su `email`, `password` y el `instanceId` seleccionado.
`POST /api/auth/login`

### Paso C: Validación en el Servidor
El servidor valida:
1. Si el usuario existe.
2. Si la contraseña es correcta.
3. **Crítico:** Si el usuario tiene una relación activa en la tabla `usuario_instancia` con el `instanceId` proporcionado.

Si todo es correcto, el servidor responde con un **JWT** (JSON Web Token) almacenado en una **HTTP-Only Cookie**.

## 2. Persistencia y Estado (`useAuth`)

El frontend utiliza un hook personalizado llamado `useAuth` (ubicado en `src/hooks/use-auth.ts`) para gestionar el estado global del usuario.

- **Carga Inicial:** Al refrescar la aplicación, el hook llama a `GET /api/auth/me`. 
- **Validación del Token:** El servidor lee la cookie, extrae el usuario y la información de la **Instancia Actual** (incluyendo el nombre de la base de datos operativa y el rol del usuario).
- **Estado Global:** El hook expone:
    - `user`: Datos básicos del usuario (email, username).
    - `currentInstance`: Información de la instancia donde está trabajando (nombre, rol, permisos).
    - `isAuthenticated`: Booleano para control de rutas.

## 3. Manejo de Multi-Tenancy

Toda la lógica de "a qué base de datos consultar" es transparente para el frontend. 
- El frontend solo envía sus peticiones al backend.
- El backend lee el `db_name` incrustado en el JWT del usuario y redirige la consulta a la base de datos operativa correspondiente.

---
[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
