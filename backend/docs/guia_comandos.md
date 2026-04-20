# Guía de Comandos y Flujo de Trabajo - SICIC-INSAI V2.0

Esta guía centraliza los comandos esenciales para operar, mantener y escalar el backend del sistema SICIC-INSAI. Como arquitectura Multi-Tenant, es crucial seguir estos pasos para mantener la integridad de las bases de datos Master y Operativas.

---

## Seguridad y Gestión de Cuentas

### Generar Hash de Contraseña (bcrypt)

Antes de insertar un usuario manualmente en la base de datos Master, debemos encriptar su contraseña. El sistema usa un "Salt" de 10 niveles.

```powershell
node -e "console.log(require('bcrypt').hashSync('PASSWORD_AQUI', 10))"
```

- **Uso:** Copia el hash resultante y pégalo en la columna `password_hash` de la tabla `usuarios`.

---

## ⬢ Prisma ORM (El Corazón de Datos)

Prisma actúa como el puente entre tu código y las bases de datos PostgreSQL. En este proyecto manejamos **dos esquemas separados**.

### 1. Esquema Operativo (db_insai_operativa)

Contiene la lógica de inspecciones, propiedades, silos, etc.

- **`npx prisma db pull`**: Lee la base de datos y actualiza el archivo `schema.prisma`.
- **`npx prisma generate`**: Crea el cliente de JavaScript para que puedas hacer consultas (`prisma.tabla.findMany()`).

### 2. Esquema Maestro (db_sicic_insai_master)

Contiene el control global (Usuarios, Roles e Instancias).

- **`npx prisma db pull --schema prisma/master.prisma`**: Sincroniza las tablas de control central.
- **`npx prisma generate --schema prisma/master.prisma`**: Genera el cliente maestro independiente (ubicado en `node_modules/@prisma/client/master`).

---

## Scripts de Servidor (npm)

Ejecuta estos comandos desde la carpeta `/backend`:

| Comando          | Descripción                                                              |
| :--------------- | :----------------------------------------------------------------------- |
| `npm run dev`    | Inicia el servidor con **Nodomon**. Se reinicia solo al guardar cambios. |
| `npm run test`   | Ejecuta el script de validación de arquitectura Multi-Tenant.            |
| `npm run lint`   | Analiza el código buscando errores de sintaxis o malas prácticas.        |
| `npm run format` | Aplica **Prettier** para que todo el código se vea limpio y ordenado.    |
| `npm start`      | Inicia el servidor en modo producción (sin reinicio automático).         |

---

## Gestión de Base de Datos SQL

### Scripts de Ayuda (Helpers)

Para pruebas rápidas e inserciones iniciales, utiliza los archivos en la carpeta `/database`:

- `tablas.sql`: Estructura Operativa.
- `insai_master.sql`: Estructura Maestro.
- `querys_helpers.sql`: Inserts de prueba (Usuarios, Roles, Instancias).

---

## Tips de Arquitecto

1.  **Variables de Entorno (.env):** Nunca subas el archivo `.env` a GitHub. Si cambias de servidor, solo actualiza las variables `DB_USER` y `DB_PASSWORD`.
2.  **Nueva Instancia Operativa:** Si creas una base de datos nueva (ej. `db_insai_2028`), solo debes registrar su nombre en la tabla `instancias` de la DB Master. El sistema la encontrará automáticamente sin tocar el código.
3.  **Logs:** Revisa la consola del servidor (`npm run dev`) para ver los logs de **Morgan** y detectar errores de red en tiempo real.

---

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**
