# Módulo de Planificaciones e Inspecciones (Frontend)

Este documento describe la arquitectura, controles de acceso, experiencia de usuario y flujo operativo para la planificación y ejecución de inspecciones en campo en el SICIZ-INSAI V2.0.

---

## 1. Visión General del Flujo

El ciclo de fiscalización y certificación técnica consta de tres fases secuenciales:
1. **Solicitud de Servicio:** El productor o empresa solicita la inspección de su predio o instalación.
2. **Planificación de Visita:** Coordinación asigna fecha, vehículo institucional y comisión técnica de inspectores.
3. **Vaciado y Ejecución de Inspección:** El equipo se traslada al sitio, constata las condiciones fito/zoosanitarias o agroindustriales y formaliza el acta en el sistema.

---

## 2. Comisión Técnica y Jerarquía Operativa

Cuando una planificación involucra a más de un funcionario técnico, el sistema establece una diferenciación clara de roles para evitar conflictos de concurrencia y duplicación de datos:

### 2.1. Inspector Jefe / Encargado de Visita
* Es el primer inspector seleccionado en la lista de asignación (índice 0).
* **Potestad Exclusiva de Vaciado:** Es el único funcionario autorizado para abrir el formulario de captura, registrar el censo animal, marcar observaciones y finalizar el acta técnica.
* **Código Territorial:** El código oficial de la inspección se genera vinculando su número de cédula de identidad:
  `[ESTADO]-[NAC]-[CEDULA_JEFE]-[FECHA]-[CORRELATIVO]`
  Ejemplo: `YAR-V-24005091-27072026-01`
* **Identificación Visual en UI:** En las tarjetas y listas de planificación se destaca con un distintivo visual (`badge`) que indica claramente "Inspector Jefe / Encargado".

### 2.2. Inspectores Acompañantes
* Funcionarios técnicos de apoyo asignados a la misma visita de campo.
* **Modo Solo Lectura:** En la interfaz de usuario, los inspectores acompañantes únicamente disponen de la acción de **Ver (icono de ojo)** para consultar los detalles de la visita y la ruta.
* El botón de **Vaciado de Inspección** se deshabilita automáticamente o se oculta para los acompañantes, respondiendo con código 403 Forbidden si se intentara forzar la llamada vía API.

---

## 3. Inspecciones Generales vs. Inspecciones de Silos

El sistema contempla dos ramas especializadas de inspección:

### 3.1. Inspecciones Agropecuarias y Prediales
* **Página:** `frontend/src/pages/Inspecciones.tsx`.
* **Captura:** Datos de geolocalización (coordenadas UTM), capacidad de carga animal, estado de pastizales, fuentes de agua, infraestructura sanitaria y evidencias fotográficas con georreferenciación.

### 3.2. Inspecciones de Silos y Almacenamiento Granelero
* **Página:** `frontend/src/pages/InspeccionesSilos.tsx`.
* **Captura:** Capacidad estática y dinámica en toneladas métricas, porcentaje de humedad de granos, presencia de plagas primarias/secundarias, condiciones de estiba, aireación y termometría.
* **Modal de Detalles:** `ActaSiloDetailsModal.tsx` con generación de acta técnica oficial para plantas agroindustriales.

---

## 4. Filtrado Dinámico y Vistas en Pantalla

La pantalla `Planificaciones.tsx` provee dos modos de visualización adaptables:
* **Vista de Lista:** Tabla responsiva con columnas de código, fecha programada, solicitante, predio, comisión técnica, estado y acciones.
* **Vista de Calendario:** Vista mensual interactiva para visualizar la carga operativa y disponibilidad de vehículos por día.
* **Filtrado por Planificación Activa:** En los selectores de vaciado de inspección únicamente se presentan planificaciones en estado **PENDIENTE** o **EN_PROCESO**, excluyendo automáticamente visitas ya finalizadas o canceladas.

---

## 5. Diseño Mobile-First y Operación en Terreno

* **Adaptabilidad Táctil:** Los botones de acción cuentan con un área táctil mínima de 44x44 píxeles para facilitar su operación con una sola mano en teléfonos móviles o tabletas de campo.
* **Compresión de Imágenes en Cliente:** Las fotografías capturadas con la cámara del dispositivo móvil se preprocesan en el cliente antes de su envío para reducir el consumo de datos celulares en zonas rurales con baja cobertura.

