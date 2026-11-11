# Ciclo de Vida Operativo: De Solicitud a Inspeccion, Actas de Silos y Avales Sanitarios - SICIZ-INSAI V2.0

Este documento detalla de manera exhaustiva el flujo de trabajo (workflow) operativo del sistema SICIZ-INSAI V2.0, cubriendo desde la recepcion de la solicitud institucional hasta la planificacion, asignacion de la comision tecnica con Inspector Jefe, vaciado de actas de campo, emision de avales zoosanitarios y seguimientos tecnicos.

---

## 1. El Origen: Solicitudes de Servicio (`solicitudes`)

Todo proceso oficial comienza con el registro de una solicitud de servicio tecnico fitosanitario o zoosanitario.

### Caracteristicas del Modelo
* **Actores:** Productor agropecuario registrado en el censo (`clientes`) o funcionario receptor del INSAI.
* **Estado Inicial:** `CREADA`.
* **Vinculacion Territorial:** Se asocia obligatoriamente a un Productor y a un Predio/Finca (`propiedades`), capturando la parroquia, municipio y coordenadas iniciales.
* **Tipologia de Solicitud:** Definida por el catalogo `t_solicitud` (inspeccion ordinaria, certificacion zoosanitaria, vigilancia epidemiologica, control de silos, etc.).

---

## 2. La Organizacion: Planificacion y Comision Tecnica (`planificaciones`)

Una vez evaluada y aprobada la solicitud, la jefatura de oficina o moderador programa la visita de campo.

### Reglas de Negocio en la Asignacion
1. **Asignacion de Recursos:** Se asignan vehiculos oficiales (`vehiculos`), fecha programada y el equipo tecnico mediante `planificacion_empleados`.
2. **Inspector Jefe / Encargado de la Visita (Indice 0):**
   * Cuando se asignan multiples inspectores a una misma planificacion, el primer funcionario registrado en la lista (`planificacion_empleados[0]`) es designado oficialmente como el **Inspector Jefe o Encargado de la Comision**.
   * Su numero de cedula de identidad es el dato vinculante utilizado por el servicio generador de codigos territoriales para construir el Numero de Control Oficial del Acta (ejemplo: `YAR-V-24005091-28072026-01`).
3. **Estado de Planificacion:** `PROGRAMADA` o `PENDIENTE`. La solicitud vinculada pasa automaticamente a estado `PLANIFICADA`.

---

## 3. La Ejecucion: Vaciado de Inspecciones (`inspecciones`)

El vaciado de la inspeccion representa la transcripcion de los hallazgos tecnicos recolectados en el predio.

### Control de Acceso y Potestad Exclusiva de Vaciado
Para garantizar la responsabilidad legal e institucional del acta:
* **Validacion en Backend (`requireInspectorEnPlanificacion`):**
  * Si el usuario autenticado tiene el rol `inspector`, el backend valida estrictamente que su identificador de empleado coincida con el primer inspector de la planificacion (`planificacion_empleados[0].empleado_id === empleadoId`).
  * Si un inspector asignado como acompanante intenta crear o vaciar la inspeccion, el backend rechaza la peticion con codigo HTTP `403 Forbidden` y el mensaje: *"Solo el Inspector Encargado (Jefe de Visita) tiene potestad para vaciar y registrar esta inspeccion"*.
  * Los inspectores acompanantes mantienen unicamente permisos de lectura (`see`) sobre la planificacion y el acta resultante.
  * Los roles administrativos (`admin`, `moderador`) mantienen potestad de registro y supervision global.
* **Filtrado en Selectores de Frontend:**
  * En el modal de creacion de inspecciones, el selector de planificaciones disponibles excluye automaticamente aquellas que ya posean una inspeccion o acta de silo registrada, o que se encuentren en estados terminales (`FINALIZADA`, `COMPLETADA`, `CANCELADA`, `NO_ATENDIDA`).
  * Para usuarios con rol inspector, el selector unicamente lista aquellas planificaciones donde dicho funcionario figure como Inspector Jefe.

### Transicion de Estados
* Al iniciar el vaciado, el estado pasa a `INSPECCIONANDO`.
* Al completar todos los bloques (georreferenciacion UTM, aspectos constatados, medidas ordenadas y carga de fotografias georreferenciadas), el estado se establece en `FINALIZADA`, actualizando en cascada la planificacion vinculada a `FINALIZADA` y la solicitud a `ATENDIDA`.

---

## 4. Inspecciones de Silos y Plantas de Almacenamiento (`acta_silos`)

Modulo especializado para la fiscalizacion de plantas de acopio, almacenamiento y transformacion de granos y cereales.

### Reglas Especificas
* **Capacidades Operativas:** Registra capacidad instalada, capacidad operativa y capacidad de almacenamiento real (en toneladas metricas).
* **Muestreo Epidemiologico:** Registro de porcentaje de grano afectado por plagas de almacen, clasificacion segun `t_evento` y unidades de medida.
* **Control de Vaciado:** Al igual que en inspecciones generales, el registro del acta de silo requiere que el funcionario sea el Inspector Jefe de la comision planificada.

---

## 5. Emision de Avales Sanitarios (`avales_sanitarios`)

El Aval Sanitario es el certificado oficial zoosanitario emitido tras constatar la salud del rebano en predios ganaderos.

### Flexibilidad en Biologicos y Vacunas: Modo Inventario vs Modo Manual
Para responder a la realidad operativa del campo donde no siempre los biologicos provienen del inventario propio del INSAI:
1. **Modo Inventario (`modo: 'inventario'`):**
   * El usuario selecciona la vacuna directamente del catalogo maestro de insumos registrado en la sede.
   * Se descuenta el stock real de la oficina mediante un movimiento de salida en el Kardex.
   * En caso de anularse o eliminarse el aval, el sistema revierte la transaccion y restaura el stock en almacén.
2. **Modo Manual (`modo: 'manual'`):**
   * El usuario introduce libremente el nombre comercial de la vacuna, laboratorio/marca, numero de lote y fecha de aplicacion.
   * Se almacena con `insumo_id: null` y una estructura JSON descriptiva en la columna `pruebas_diagnosticas`.
   * No requiere existencia previa en kardex ni afecta los inventarios de la oficina.

### Expresion de Dias de Vigencia Zoosanitaria
* El sistema calcula reactivamente el intervalo en dias entre la `fecha_emision` y la `fecha_vencimiento`.
* Proporciona indicadores claros en interfaz (vigencia en dias, emision de 24 horas para movilizacion inmediata o alerta si el vencimiento es retroactivo).

### Normalizacion de Especies Registradas
* **Rebano Bovino y Bufalino:** Desglose estandarizado por categorias etarias y sexo (toros, vacas, novillos/as, mautes, becerros/as, bufalos/as, buvillos/as, bumautes y bucerros/as).
* **Otras Especies:** Deteccion y clasificacion normalizada para evitar registros anomalos (asnos, mulas, caprinos, ovinos, porcinos y aves/avicola), reflejandose con exactitud en las tablas institucionales del PDF oficial.

---

## 6. Seguimiento Tecnico de Medidas Ordenadas (`seguimiento_inspecciones`)

Cuando una inspeccion general o acta de silo detecta no conformidades o medidas cuarentenarias:
1. Se activa la derivacion a Seguimiento Tecnico desde la propia fila de la inspeccion.
2. El sistema precarga el numero de control y predio asociado.
3. Permite verificar de forma cronologica el porcentaje de cumplimiento de recomendaciones, registrar tomas fotograficas evolutivas y determinar el levantamiento de la medida o el mantenimiento de cuarentena.
