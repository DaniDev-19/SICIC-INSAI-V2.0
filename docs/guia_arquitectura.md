# Guía de Arquitectura: Flujos de Trabajo SICIC-INSAI-V2.0

Esta documentación detalla los flujos lógicos y operativos de la arquitectura del Sistema Integral de Control e Inspección de campo del INSAI (SICIC-INSAI-V2.0). El sistema está diseñado sobre una arquitectura multi-inquilino (multi-tenant) con una clara separación entre la gestión global y la operación local.

## 1. Arquitectura de Datos y Multi-Tenencia

El ecosistema se divide en dos capas de persistencia fundamentales:

### A. Capa Maestra (Master Schema)
Gestiona la infraestructura global del sistema:
- **Control de Instancias:** Permite la coexistencia de múltiples bases de datos operativas (estados, regiones o departamentos especializados) bajo una misma plataforma.
- **Autenticación Centralizada:** Los usuarios se validan contra una tabla global de credenciales, permitiendo el acceso a diferentes instancias según sus permisos.
- **RBAC (Role-Based Access Control):** Implementa un sistema de permisos basado en JSONB para una flexibilidad total en la definición de capacidades por rol.

### B. Capa Operativa (Operational Schema)
Cada instancia posee su propio esquema operativo donde reside la lógica de negocio diaria: propiedades, clientes, inspecciones y gestión de insumos.

---

## 2. Flujo Operativo Principal: El Ciclo de Inspección

El núcleo funcional del sistema sigue un flujo lineal y controlado que garantiza la trazabilidad del proceso fitosanitario y zoosanitario:

### Paso 1: Registro de Solicitud (`solicitudes`)
Todo proceso inicia con una solicitud, ya sea captada vía web, presencial u oficio. 
- Se vincula a un **Cliente** (Productor) y una **Propiedad**.
- Se define el **Tipo de Solicitud** (Vigilancia, Registro, Certificación).
- Estatus Inicial: `CREADA`.

### Paso 2: Planificación Operativa (`planificaciones`)
Una vez validada la solicitud, se procede a su programación.
- Se asigna una fecha, hora y objetivo.
- **Asignación de Recursos:** Se vinculan uno o más **Empleados** (Inspectores/Veterinarios) y un **Vehículo** operativo.
- Estatus: `PLANIFICADA`.

### Paso 3: Ejecución y Registro de Inspección (`inspecciones`)
El personal de campo realiza la visita técnica.
- **Georreferenciación:** Captura automática de coordenadas UTM y generación de enlace a Google Maps.
- **Hallazgos:** Registro detallado de aspectos constatados y medidas ordenadas.
- **Evidencia Digital:** Posibilidad de adjuntar múltiples fotografías (`inspeccion_fotos`).
- **Finalidad Dinámica:** Una inspección puede tener múltiples propósitos (ej. Vigilancia Epidemiológica + Certificación).

### Paso 4: Resultados Especializados
Dependiendo de la naturaleza de la inspección, el flujo puede derivar en:
- **Acta de Silos:** Si la inspección es en centros de almacenamiento.
- **Hallazgos Epidemiológicos:** Registro de animales probados, positivos o marcados frente a enfermedades.
- **Seguimiento:** Si se ordenaron medidas, se generan registros de seguimiento para verificar cumplimiento.

### Paso 5: Emisión de Avales Sanitarios (`avales_sanitarios`)
El punto culminante del flujo positivo es la emisión del certificado o aval.
- Vincula los resultados de la inspección, el médico responsable y el jefe de oficina.
- Incluye el inventario discriminado de animales (Bovinos, Bufalinos y otras especies) al momento de la certificación.

---

## 3. Flujo de Logística y Control de Insumos (Kardex)

El sistema integra un módulo de inventario robusto para el control de biológicos, químicos y otros materiales:

- **Estructura por Lotes:** El stock se gestiona por oficina y por número de lote, incluyendo fechas de vencimiento para prevenir el uso de productos caducados.
- **Movimientos Automatizados:** Cada salida de insumo puede estar vinculada directamente a una inspección o aval, garantizando que el consumo de materiales sea coherente con la actividad de campo.
- **Alertas de Stock:** Control de stock mínimo por oficina para procesos de reabastecimiento.

---

## 4. Flujo de Seguridad y Auditoría

La integridad del sistema se mantiene mediante procesos transversales:

- **Bitácora de Eventos (Trail Audit):** Cada acción de inserción o actualización captura el `payload_previo` y el `payload_nuevo` en formato JSONB. Esto permite reconstruir el historial de cualquier dato en caso de discrepancias.
- **Notificaciones Internas:** Sistema de mensajería para alertar a los funcionarios sobre nuevas asignaciones o solicitudes urgentes.
- **Recuperación de Acceso:** Flujos seguros de restablecimiento de contraseñas mediante tokens temporales.

---

## 5. Relaciones de Catálogo y Entidades Maestras

La arquitectura utiliza un sistema de catálogos normalizados para garantizar la consistencia de los datos:
- **Territorialidad:** Estructura jerárquica de Estados > Municipios > Parroquias > Sectores.
- **Especies y Fitopatologías:** Bases de datos de animales, cultivos, plagas y enfermedades con sus respectivos nombres científicos.
- **Recursos Humanos:** Gestión detallada de empleados, incluyendo sus profesiones, cargos, departamentos y fotos de identificación.
