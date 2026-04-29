INSERT INTO finalidad_catalogo (nombre) VALUES
('Verificar el estado fitosanitario'),
('Verificar el estado zoosanitario'),
('Verificar el estado de los procesos agroecologicos'),
('Verificar el origen o destino para la movilización del rubro'),
('Verificar buenas prácticas de manufactura'),
('Verificación de plagas'),
('Evluación de cosecha'),
('Monitoreo fitosanitario'),
('Supervisión de riego'),
('Control de fertilización'),
('Control de malezas');

INSERT INTO t_unidades (nombre, abreviatura, tipo) VALUES 
('Hectáreas', 'Ha', 'SUPERFICIE'),
('Metros Cuadrados', 'm2', 'SUPERFICIE'),
('Kilogramos', 'Kg', 'PESO'),
('Toneladas', 'Tn', 'PESO'),
('Cabezas', 'Cab', 'CONTEO'),
('Unidades', 'Und', 'CONTEO');



-- =============================================================================
-- AUTOMATIZACIÓN DE INVENTARIO (MOTOR DE POSTGRESQL)
-- =============================================================================

-- 1. Función para actualizar el stock automáticamente
CREATE OR REPLACE FUNCTION fn_actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el registro de stock no existe para ese articulo/oficina/lote, lo creamos
    IF NOT EXISTS (SELECT 1 FROM insumos_stock WHERE insumo_id = NEW.insumo_id AND oficina_id = NEW.oficina_id AND COALESCE(lote, '') = COALESCE(NEW.lote, '')) THEN
        INSERT INTO insumos_stock (insumo_id, oficina_id, lote, stock_actual)
        VALUES (NEW.insumo_id, NEW.oficina_id, NEW.lote, 0);
    END IF;

    -- Según el tipo de movimiento, sumamos o restamos
    IF NEW.tipo_movimiento IN ('ENTRADA', 'AJUSTE_MAS') THEN
        UPDATE insumos_stock 
        SET stock_actual = stock_actual + NEW.cantidad, updated_at = CURRENT_TIMESTAMP
        WHERE insumo_id = NEW.insumo_id AND oficina_id = NEW.oficina_id AND COALESCE(lote, '') = COALESCE(NEW.lote, '');
    
    ELSIF NEW.tipo_movimiento IN ('SALIDA', 'AJUSTE_MENOS', 'CONSUMO') THEN
        UPDATE insumos_stock 
        SET stock_actual = stock_actual - NEW.cantidad, updated_at = CURRENT_TIMESTAMP
        WHERE insumo_id = NEW.insumo_id AND oficina_id = NEW.oficina_id AND COALESCE(lote, '') = COALESCE(NEW.lote, '');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Disparador (Trigger) que se ejecuta después de cada INSERT en movimientos
CREATE TRIGGER trg_movimiento_stock
AFTER INSERT ON movimientos_insumos
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_stock();
-- //////////////////////////////////////////////////////////
-- 7. VISTAS DE REPORTES (Automatización)
-- //////////////////////////////////////////////////////////

CREATE OR REPLACE VIEW caracterizacion_municipios_view AS
SELECT
    m.id AS municipio_id,
    m.nombre AS municipio_nombre,
    m.area_km2,
    COUNT(DISTINCT p.id) AS total_predios,
    -- Conteo desde el inventario base (Estimado)
    SUM(CASE WHEN ta.nombre ILIKE '%BOVINO%' THEN pa_inv.cantidad ELSE 0 END) AS bovinos_est,
    SUM(CASE WHEN ta.nombre ILIKE '%BUFALINO%' THEN pa_inv.cantidad ELSE 0 END) AS bufalinos_est,
    -- Conteo Certificado (Desde el último censo hallado en Avales/Inspecciones)
    (SELECT SUM(total_bov_buf) FROM inspeccion_hallazgos_bov_buf h 
     JOIN propiedades p2 ON h.propiedad_id = p2.id 
     JOIN sectores s2 ON p2.sector_id = s2.id 
     JOIN parroquias pa2 ON s2.parroquia_id = pa2.id 
     WHERE pa2.municipio_id = m.id) AS total_censo_certificado
FROM municipios m
LEFT JOIN parroquias pa ON m.id = pa.municipio_id
LEFT JOIN sectores s ON pa.id = s.parroquia_id
LEFT JOIN propiedades p ON s.id = p.sector_id
LEFT JOIN propiedad_animales pa_inv ON p.id = pa_inv.propiedad_id
LEFT JOIN t_animales ta ON pa_inv.tipo_animal_id = ta.id
GROUP BY m.id, m.nombre, m.area_km2;

-- Vista de Caracterización Estadal (Consolidado de Predios y Rebaño)
CREATE OR REPLACE VIEW vista_caracterizacion_estadal AS
SELECT 
    m.nombre AS municipio,
    m.area_km2 AS area_km2,
    COUNT(DISTINCT p.id) AS total_predios,
    -- Conteo desde el inventario base (Estimado)
    SUM(CASE WHEN ta.nombre ILIKE '%BOVINO%' THEN pa_inv.cantidad ELSE 0 END) AS bovinos_est,
    SUM(CASE WHEN ta.nombre ILIKE '%BUFALINO%' THEN pa_inv.cantidad ELSE 0 END) AS bufalinos_est,
    -- Conteo Certificado (Desde el último censo hallado en Avales/Inspecciones)
    (SELECT SUM(total_bov_buf) FROM inspeccion_hallazgos_bov_buf h 
     JOIN propiedades p2 ON h.propiedad_id = p2.id 
     JOIN sectores s2 ON p2.sector_id = s2.id 
     JOIN parroquias pa2 ON s2.parroquia_id = pa2.id 
     WHERE pa2.municipio_id = m.id) AS total_censo_certificado
FROM municipios m
LEFT JOIN parroquias pa ON m.id = pa.municipio_id
LEFT JOIN sectores s ON pa.id = s.parroquia_id
LEFT JOIN propiedades p ON s.id = p.sector_id
LEFT JOIN propiedad_animales pa_inv ON p.id = pa_inv.propiedad_id
LEFT JOIN tipos_animales ta ON pa_inv.tipo_animal_id = ta.id
GROUP BY m.id, m.nombre, m.area_km2;

-- Vista para el Registro de Médicos Veterinarios por Estado
CREATE OR REPLACE VIEW vista_registro_veterinarios AS
SELECT 
    es.nombre AS estado,
    e.nombre || ' ' || e.apellido AS nombre_y_apellido,
    e.cedula AS ci,
    e.telefono,
    e.email AS correo_electronico,
    of.nombre AS oficina,
    pr.nombre AS profesion,
    e.programas_json AS cargo_yo_programa,
    e.observaciones
FROM empleados e
JOIN oficinas of ON e.oficina_id = of.id
JOIN profesiones pr ON e.profesion_id = pr.id
JOIN insai_master.instancias inst ON 1=1 -- Esto es para contextualizar el estado si es necesario
JOIN estados es ON es.id = 1; -- Asumimos el estado de la instancia (Yaracuy en el ejemplo)

-- Vista para el Registro de Coordinadores y Centros de Validación
CREATE OR REPLACE VIEW vista_registro_coordinadores AS
SELECT 
    row_number() OVER () AS nro,
    e.nombre || ' ' || e.apellido AS nombre_y_apellido,
    e.cedula AS ci,
    e.telefono,
    of.nombre AS lugar_de_adscripcion,
    pr.nombre AS profesion,
    cr.nombre AS cargo,
    e.email AS correo_electronico,
    of.ubicacion_gms AS ubicacion_geografica_gms
FROM empleados e
JOIN oficinas of ON e.oficina_id = of.id
JOIN profesiones pr ON e.profesion_id = pr.id
JOIN cargos cr ON e.cargo_id = cr.id
WHERE cr.nombre LIKE '%COORDINADOR%' OR of.es_centro_validacion = TRUE;

-- Vista Maestra de Inteligencia Epidemiológica (Temporal y Dinámica)
CREATE OR REPLACE VIEW vista_epidemiologia_maestra AS
SELECT 
    EXTRACT(YEAR FROM i.fecha_inspeccion) AS anio,
    EXTRACT(MONTH FROM i.fecha_inspeccion) AS mes,
    EXTRACT(WEEK FROM i.fecha_inspeccion) AS semana_iso,
    m.nombre AS municipio,
    te.nombre AS enfermedad,
    ta.nombre AS especie,
    SUM(eh.cantidad_probados) AS total_probados,
    SUM(eh.cantidad_positivos) AS total_positivos,
    SUM(eh.cantidad_reactores) AS total_reactores,
    SUM(eh.cantidad_marcados) AS total_marcados,
    SUM(eh.cantidad_sacrificados) AS total_sacrificados,
    COUNT(DISTINCT p.id) AS total_predios_afectados
FROM epidemiologia_hallazgos eh
JOIN inspecciones i ON eh.inspeccion_id = i.id
JOIN tipos_enfermedades te ON eh.enfermedad_id = te.id
JOIN propiedades p ON i.propiedad_id = p.id
JOIN sectores s ON p.sector_id = s.id
JOIN parroquias pa ON s.parroquia_id = pa.id
JOIN municipios m ON pa.municipio_id = m.id
LEFT JOIN animales_inventario ai ON p.id = ai.propiedad_id 
LEFT JOIN tipos_animales ta ON ai.tipo_animal_id = ta.id
GROUP BY anio, mes, semana_iso, m.nombre, te.nombre, ta.nombre;

-- Vista Maestra de Censo Animal Consolidado (Inspecciones + Avales Directos)
CREATE OR REPLACE VIEW vista_censo_animal_consolidado AS
SELECT 
    p.nombre AS predio,
    p.codigo AS codigo_predio,
    COALESCE(i.fecha_inspeccion, a.fecha_emision) AS fecha_referencia,
    COALESCE(i.t_codigo, 'AVAL-DIRECTO') AS fuente,
    h.t_toros, h.t_vacas, h.t_novillos, h.t_novillas,
    h.total_bov_buf AS total_censo
FROM inspeccion_hallazgos_bov_buf h
LEFT JOIN inspecciones i ON h.inspeccion_id = i.id
LEFT JOIN avales_sanitarios a ON h.aval_id = a.id
LEFT JOIN propiedades p ON COALESCE(i.propiedad_id, a.propiedad_id) = p.id;

    STRING_AGG(e.nombre || ' ' || e.apellido, ', ') AS inspectores_asignados
FROM planificaciones p
JOIN solicitudes s ON p.solicitud_id = s.id
JOIN propiedades pr ON s.propiedad_id = pr.id
LEFT JOIN vehiculos v ON p.vehiculo_id = v.id
LEFT JOIN planificacion_empleados pe ON p.id = pe.planificacion_id
LEFT JOIN empleados e ON pe.empleado_id = e.id
GROUP BY p.id, p.fecha_programada, p.hora_inicio, p.hora_fin, p.codigo, s.codigo, pr.nombre, p.actividad, p.prioridad, p.estatus, v.placa;

-- Vista de Kardex y Stock de Insumos por Oficina (Logística)
CREATE OR REPLACE VIEW vista_logistica_stock AS
SELECT 
    o.nombre AS oficina,
    c.nombre AS categoria,
    i.nombre AS insumo,
    i.codigo,
    SUM(m.cantidad) AS stock_calculado,
    i.stock_minimo
FROM insumos i
JOIN categorias_insumos c ON i.categoria_id = c.id
CROSS JOIN oficinas o
LEFT JOIN movimientos_insumos m ON i.id = m.insumo_id AND o.id = m.oficina_id
GROUP BY o.id, o.nombre, c.id, c.nombre, i.id, i.nombre, i.codigo, i.stock_minimo;

