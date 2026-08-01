# Seguridad y Robustez de la API: Idempotencia y Rate Limiting

Este documento detalla los mecanismos implementados para garantizar la integridad de los datos, evitar la duplicidad de registros y proteger la API contra abusos o ataques de denegación de servicio (DoS).

---

## 1. Idempotencia (`X-Idempotency-Key`)

La idempotencia garantiza que realizar la misma operación varias veces tenga el mismo efecto que realizarla una sola vez. Esto es crítico en procesos operativos donde un re-intento por error de red podría duplicar un registro.

### Mecanismo Técnico
- **Header:** `X-Idempotency-Key` (UUID generado por el cliente).
- **Middleware:** `idempotency.middleware.js` intercepta todas las peticiones POST, PUT y DELETE.
- **Persistencia:** Las llaves y sus respuestas se almacenan en la **Base de Datos Master** (tabla `idempotency_keys`).
- **Flujo:**
  1. El middleware busca la llave en la DB Master.
  2. Si existe, devuelve la respuesta cacheada inmediatamente.
  3. Si no existe, procesa la petición y guarda el resultado (status y body) antes de responder al cliente.

---

## 2. Rate Limiting Operativo (`writeLimiter`)

Para proteger los endpoints críticos de escritura, se ha implementado un limitador de tasa agresivo que evita que un usuario o proceso automatizado sature el sistema.

### Configuración
- **Alcance:** Todas las rutas bajo `/api` que no sean GET (exceptuando `/auth` que tiene su propio limitador).
- **Límite:** 50 solicitudes por cada 15 minutos.
- **Identificación:** Se basa en el ID del usuario autenticado (prioritario) o en la dirección IP.

---

## 3. Transacciones Serializables y Concurrencia

En los módulos críticos (**Solicitudes, Planificaciones, Inspecciones, Acta de Silos**), se utiliza el nivel de aislamiento de base de datos más estricto.

### Implementación
- **Serializable Isolation:** Evita fenómenos de "Phantoms" o lecturas sucias. Si dos usuarios intentan modificar exactamente el mismo rango de datos, la base de datos obliga a que uno ocurra después del otro.
- **Validación Atómica:** Dentro de la transacción se verifica la existencia de duplicados (por código o relación de negocio).
- **Estado Sincronizado:** Garantiza que si la creación de un registro falla, cualquier cambio colateral (como el cambio de estatus de una solicitud) se revierta automáticamente (Atomicidad).

---

---

## 4. Protección contra Fuerza Bruta y Bloqueo Progresivo (HTTP 423)

Para prevenir ataques de adivinación de contraseñas y fuerza bruta en `/api/auth/login`, el backend cuenta con un mecanismo de bloqueo progresivo a nivel de base de datos master.

### Campos en DB Master (`model usuarios`)
- `intentos_fallidos Int`: Conteo de intentos consecutivos erróneos.
- `bloqueado_hasta DateTime`: Timestamp del fin del periodo de cooldown/bloqueo.

### Niveles de Sanción
- **Intento Exitoso:** Limpia inmediatamente `intentos_fallidos = 0` y `bloqueado_hasta = null`.
- **Intento 1 y 2 Erróneo:** Devuelve `401 Unauthorized` informando los intentos restantes.
- **Nivel 1 (Cooldown 5 min):** Al llegar a 3 fallos consecutivos, la cuenta se bloquea por 5 minutos y responde HTTP `423 Locked` devolviendo `retryAfterMs`.
- **Nivel 2 (Bloqueo 24 hrs):** Al acumular 5+ fallos totales, la cuenta entra en un bloqueo severo de 24 horas.
- **Desbloqueo por Restablecimiento:** Al completar con éxito el flujo de restablecer contraseña por correo (`/api/auth/reset-password`), los contadores se limpian automáticamente.

---

## Diagrama de Seguridad Operativa

```mermaid
graph TD
    REQ[Petición del Cliente] --> RATE[Rate Limiter: Max 50/15min]
    RATE -- Bloqueado --> ERR429[Error 429: Too Many Requests]
    RATE -- Permitido --> LOCK{¿Cuenta bloqueada en DB master?}
    LOCK -- Sí (bloqueado_hasta > Now) --> ERR423[Error 423 Locked: Cooldown activo]
    LOCK -- No --> IDEM{¿Trae X-Idempotency-Key?}
    IDEM -- Sí --> CHECK_DB[Consultar DB Master]
    CHECK_DB -- Existe --> RET[Devolver Respuesta Cacheada]
    CHECK_DB -- No Existe --> PROC[Procesar Lógica de Negocio]
    IDEM -- No --> PROC
    PROC --> TRANS[Transacción Serializable]
    TRANS -- Conflicto/Duplicado --> ERR400[Error 400: Conflicto de Datos]
    TRANS -- Éxito --> SAVE[Cachear Resultado en Master]
    SAVE --> FIN[Respuesta Exitosa]
```

---

**Seguridad y Robustez de Datos**  
**SICIC-INSAI V2.0**
