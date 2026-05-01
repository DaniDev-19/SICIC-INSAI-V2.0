# Ciclo de Vida Operativo: De Solicitud a Inspección

Este documento detalla el flujo de trabajo (workflow) principal del sistema SICIC-INSAI V2.0, desde que nace una necesidad hasta que se emite un aval o se realiza un seguimiento.

---

## 1. El Origen: Solicitud (`solicitudes`)
Todo proceso inicia con una solicitud. 
- **Actores**: Cliente (Productor) o Funcionario.
- **Estado Inicial**: `CREADA`.
- **Vínculo**: Se asocia a un Cliente y opcionalmente a una Propiedad.

## 2. La Organización: Planificación (`planificaciones`)
Una vez aprobada la solicitud, se planifica la actividad de campo.
- **Estado de Solicitud**: Pasa a `PLANIFICADA`.
- **Detalles**: Se asignan vehículos, empleados y se define la fecha/hora.
- **Estado de Planificación**: `PENDIENTE`.

## 3. La Ejecución: Inspección (`inspecciones`)
Es el núcleo de la actividad técnica.
- **Acción**: El funcionario registra los hallazgos en campo.
- **Sincronización**: Al crear la inspección, la planificación y la solicitud pasan a estado `INSPECCIONANDO`.
- **Finalización**: Cuando el funcionario marca la inspección como `FINALIZADA`, los estados vinculados se actualizan automáticamente para cerrar el ciclo.

---

## 4. Derivaciones del Flujo
Dependiendo del tipo de inspección, se generan diferentes resultados:

### A. Avales Sanitarios (`avales_sanitarios`)
Resultado de una inspección animal exitosa.
- **Integración**: Requiere un ID de inspección.
- **Contenido**: Hallazgos animales, fotos de hierros y biológicos aplicados.

### B. Acta de Silos (`acta_silos`)
Específico para inspecciones de almacenamiento de granos.
- **Contenido**: Datos epidemiológicos, capacidad operativa y fotos de silos.

### C. Seguimiento (`seguimiento_inspecciones`)
Si una inspección o acta de silo detecta irregularidades, se programa un seguimiento.
- **Propósito**: Verificar el cumplimiento de medidas ordenadas.
- **Recursividad**: Un seguimiento puede generar nuevos hallazgos y requerir consumos de insumos adicionales.

---

## 5. Trazabilidad de Insumos
En cualquiera de estos tres procesos (Inspección, Aval o Silo), se pueden consumir insumos (vacunas, reactivos, precintos). El sistema captura estos consumos y los vincula automáticamente al proceso mediante el **Kardex de Inventario**.

Para más detalles sobre el inventario, consulta el manual de [Gestión de Inventario Inteligente](./gestion_inventario_inteligente.md).

[Volver al índice de documentación](../WIKI.md)

**Documentación Técnica Funcional**
**SICIC-INSAI V2.0**

