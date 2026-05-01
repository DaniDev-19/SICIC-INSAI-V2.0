# Gestión Centralizada: Usuarios e Instancias (Master)

El sistema SICIC-INSAI V2.0 utiliza una arquitectura de base de datos maestra (`insai_master`) para gestionar la identidad global de los usuarios y su acceso a múltiples bases de datos operativas (instancias).

---

##  Arquitectura Master
La base de datos Master es el "cerebro" del sistema. Controla tres entidades fundamentales:
1.  **Usuarios**: Cuentas globales que permiten el acceso al ecosistema.
2.  **Instancias**: Registros de las diferentes bases de datos operativas (ej: Sedes Regionales, Oficinas Nacionales).
3.  **Roles**: Definiciones globales de permisos que se aplican dentro de cada instancia.

---

##  Flujo de Usuarios Globales
Los usuarios se registran una sola vez a nivel central. 
- **Cifrado**: Las contraseñas se almacenan mediante hashing con `bcrypt`. El API recibe `password` y lo mapea automáticamente a la columna `password_hash`.
- **MFA (Multi-Factor)**: La estructura cuenta con soporte nativo para `mfa_secret`, permitiendo una escalabilidad futura hacia autenticación de dos factores.

---

##  Gestión de Instancias Multi-Tenant
Cada instancia representa un entorno de datos aislado.
- **`db_name`**: Identificador único que el sistema usa para inyectar la conexión dinámicamente mediante el middleware de multi-tenancia.
- **Estado**: Una instancia puede ser desactivada globalmente, impidiendo el acceso a todos sus usuarios de forma inmediata.

---

##  Vinculación: Usuario ↔ Instancia
Este es el corazón del control de acceso. Un usuario no tiene acceso a nada hasta que se vincula a una instancia a través de la tabla `usuario_instancia`.

### Características:
- **Asignación de Roles**: Cada vínculo debe tener un `rol_id` que define qué puede hacer el usuario en esa base de datos específica.
- **Permisos Personalizados**: Permite sobrescribir el rol estándar mediante un objeto JSONB para casos excepcionales de acceso.
- **Descubrimiento en Login**: Durante el login, el sistema consulta esta tabla para devolver al usuario la lista de "instancias" a las que tiene permiso de entrar.

---

##  Seguridad y Endpoints
Toda la gestión de la Master DB está protegida por el prefijo `/api/master/`.
- Requiere un Token JWT válido.
- Registra cada cambio (creación de usuarios, asignación de instancias) en el sistema de **Bitácora** para auditoría centralizada.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
