
CREATE TABLE IF NOT EXISTS t_propiedad (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS t_cultivo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS t_animales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS c_insumos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS t_plagas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS t_enfermedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS t_evento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS t_solicitud (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL 
);

CREATE TABLE IF NOT EXISTS t_programa (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS profesiones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE 
);

CREATE TABLE finalidad (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS t_unidades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    abreviatura VARCHAR(10),
    tipo VARCHAR(20) CHECK (tipo IN ('SUPERFICIE', 'PESO', 'CONTEO', 'VOLUMEN', 'OTRO'))
);


CREATE TABLE IF NOT EXISTS oficinas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    ubicacion_gms VARCHAR(255), 
    es_centro_validacion BOOLEAN DEFAULT FALSE,
    direccion TEXT
);

CREATE TABLE IF NOT EXISTS cargos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS contrato (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE 
);

CREATE TABLE IF NOT EXISTS estados (
    id SERIAL PRIMARY KEY,
    codigo CHAR(50) NOT NULL UNIQUE,
    area_km2 DECIMAL(10,2) DEFAULT 0,       
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS municipios (
    id SERIAL PRIMARY KEY,
    codigo CHAR(50) NOT NULL,             
    nombre VARCHAR(100) NOT NULL,
    area_km2 DECIMAL(10,2) DEFAULT 0, 
    estado_id INT NOT NULL REFERENCES estados(id) ON DELETE CASCADE,
    CONSTRAINT uq_municipio_codigo UNIQUE (estado_id, codigo)
);

CREATE TABLE IF NOT EXISTS parroquias (
    id SERIAL PRIMARY KEY,
    codigo CHAR(50) NOT NULL,            
    nombre VARCHAR(100) NOT NULL,
    area_km2 DECIMAL(10,2) DEFAULT 0,
    municipio_id INT NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    CONSTRAINT uq_parroquia_codigo UNIQUE (municipio_id, codigo)
);

CREATE TABLE IF NOT EXISTS sectores (
    id SERIAL PRIMARY KEY,
    codigo CHAR(50) NOT NULL,           
    nombre VARCHAR(100) NOT NULL,
    parroquia_id INT NOT NULL REFERENCES parroquias(id) ON DELETE CASCADE,
    CONSTRAINT uq_sector_codigo UNIQUE (parroquia_id, codigo)
);

CREATE TABLE cultivo (
    id SERIAL PRIMARY KEY, 
    nombre VARCHAR(100) NOT NULL UNIQUE, 
    nombre_cientifico VARCHAR(100) UNIQUE, 
    descripcion TEXT, 
    tipo_cultivo_id INT, 
    CONSTRAINT fk_tipo_cultivo FOREIGN KEY (tipo_cultivo_id) REFERENCES t_cultivo(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS animales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    nombre_cientifico VARCHAR(100) UNIQUE,
    dieta VARCHAR(100), 
    esperanza_vida VARCHAR(100), 
    habitat_principal VARCHAR(100), 
    peso_promedio_kg DECIMAL(10,2),
    longitud_promedio_mt DECIMAL(10,2),
    descripcion TEXT,
    tipo_animal_id INT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tipo_animales FOREIGN KEY (tipo_animal_id) REFERENCES t_animales(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS plagas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    nombre_cientifico VARCHAR(100) UNIQUE,
    descripcion TEXT,
    tipo_plaga_id INT,
    CONSTRAINT fk_plagas_tipo FOREIGN KEY (tipo_plaga_id) REFERENCES t_plagas(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS enfermedades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    nombre_cientifico VARCHAR(100) UNIQUE,
    zoonatica VARCHAR(100),
    descripcion TEXT,
    tipo_enfermedad_id INT,
    CONSTRAINT fk_enfermedad_tipo FOREIGN KEY (tipo_enfermedad_id) REFERENCES t_enfermedades(id) ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS insumos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(100) UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    marca VARCHAR(100),
    descripcion TEXT,
    categoria_id INT REFERENCES c_insumos(id) ON DELETE SET NULL,
    unidad_medida_id INT REFERENCES t_unidades(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS programas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo_programa_id INT, 
    CONSTRAINT fk_tipo_programa FOREIGN KEY (tipo_programa_id) REFERENCES t_programa(id) ON DELETE RESTRICT 
);

-- puente
CREATE TABLE IF NOT EXISTS programa_plaga (
    id SERIAL PRIMARY KEY,
    programa_id INT NOT NULL,
    plaga_id INT NOT NULL,
    CONSTRAINT uq_programa_plaga UNIQUE (programa_id, plaga_id),
    CONSTRAINT fk_pp_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pp_plaga FOREIGN KEY (plaga_id) REFERENCES plagas(id) ON DELETE CASCADE
);

-- puente
CREATE TABLE IF NOT EXISTS programa_cultivo (
    id SERIAL PRIMARY KEY,
    programa_id INT NOT NULL,
    cultivo_id INT NOT NULL,
    CONSTRAINT uq_programa_cultivo UNIQUE (programa_id, cultivo_id),
    CONSTRAINT fk_pc_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pc_cultivo FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE CASCADE
);

-- puente
CREATE TABLE IF NOT EXISTS programa_animales (
    id SERIAL PRIMARY KEY,
    programa_id INT NOT NULL,
    animal_id INT NOT NULL,
    CONSTRAINT uq_programa_animal UNIQUE (programa_id, animal_id),
    CONSTRAINT fk_pa_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pa_animal FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE CASCADE
);

-- puente
CREATE TABLE IF NOT EXISTS programa_enfermedades (
    id SERIAL PRIMARY KEY,
    programa_id INT NOT NULL,
    enfermedad_id INT NOT NULL,
    CONSTRAINT uq_programa_enfermedad UNIQUE (programa_id, enfermedad_id),
    CONSTRAINT fk_pe_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE,
    CONSTRAINT fk_pe_enfermedad FOREIGN KEY (enfermedad_id) REFERENCES enfermedades(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(20) NOT NULL UNIQUE,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    tipo VARCHAR(50) CHECK (tipo IN ('MOTO', 'CARRO', 'CAMIONETA', 'OTRO')),
    color VARCHAR(30),
    status VARCHAR(20) DEFAULT 'OPERATIVO'
);

CREATE TABLE IF NOT EXISTS carac_statal (
    id SERIAL PRIMARY KEY,
    num_veterinarios_oficiales INT DEFAULT 0,
    num_paraveterinarios_oficiales INT DEFAULT 0,
    num_administrativos_oficiales INT DEFAULT 0,
    num_vehiculos_operativos INT DEFAULT 0,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    municipio_id INT NOT NULL REFERENCES municipios(id) ON DELETE CASCADE,
    CONSTRAINT municipio_recurso UNIQUE (municipio_id)
);

CREATE TABLE IF NOT EXISTS empleados (
    id SERIAL PRIMARY KEY,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(50),
    email VARCHAR(100),
    fechas_ingreso DATE,  
    status_laboral VARCHAR(100) DEFAULT 'ACTIVO',
    contrato_id INT REFERENCES contrato(id) ON DELETE SET NULL,
    cargo_id INT REFERENCES cargos(id) ON DELETE SET NULL,
    departamento_id INT REFERENCES departamentos(id) ON DELETE SET NULL, 
    profesion_id INT REFERENCES profesiones(id) ON DELETE SET NULL,
    oficina_id INT REFERENCES oficinas(id) ON DELETE SET NULL,
    usuario_global_id INT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- puente
CREATE TABLE IF NOT EXISTS empleado_foto (
    id SERIAL PRIMARY KEY,
    foto_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    empleado_id INT NOT NULL,
    CONSTRAINT fk_foto_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

-- puente 
CREATE TABLE IF NOT EXISTS empleado_residencia (
    id SERIAL PRIMARY KEY,
    empleado_id INT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    sector_id INT REFERENCES sectores(id) ON DELETE RESTRICT,
    direccion_detallada TEXT,
    punto_referencia TEXT,
    google_maps_url TEXT,
    es_principal BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- puente
CREATE TABLE IF NOT EXISTS empleados_programas (
    id SERIAL PRIMARY KEY,
    programa_id INT NOT NULL,
    empleado_id INT NOT NULL,
    CONSTRAINT uq_empleado_programa UNIQUE (programa_id, empleado_id),
    CONSTRAINT fk_ep_programa FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE CASCADE, 
    CONSTRAINT fk_ep_empleado FOREIGN KEY (empleado_id) REFERENCES empleados(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    cedula_rif VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(255) NOT NULL,
    codigo_runsai VARCHAR(50),
    telefono VARCHAR(50),
    email VARCHAR(100),
    direccion_fiscal TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS propiedades (
    id SERIAL PRIMARY KEY,
    codigo_insai VARCHAR(50) UNIQUE, 
    nombre VARCHAR(255) NOT NULL,
    rif VARCHAR(50),
    punto_referencia TEXT,
    hectareas_totales DECIMAL(10,2),
    status VARCHAR(100) DEFAULT 'ACTIVA',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_propiedad_id INT REFERENCES t_propiedad(id) ON DELETE RESTRICT,
    dueño_id INT REFERENCES clientes(id) ON DELETE RESTRICT
);


CREATE TABLE IF NOT EXISTS propiedad_hierro (
    id SERIAL PRIMARY KEY,
    num_reg_hierro VARCHAR(100), 
    num_reg_ganadero VARCHAR(100), 
    hierro_img_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    propiedad_id INT,
    CONSTRAINT fk_hierros_p FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE
);

-- puente
CREATE TABLE IF NOT EXISTS propiedad_ubicacion (
    id SERIAL PRIMARY KEY,
    propiedad_id INT REFERENCES propiedades(id) ON DELETE CASCADE,
    sector_id INT REFERENCES sectores(id) ON DELETE RESTRICT,
    google_maps_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- puente
CREATE TABLE propiedad_cultivo (
    id SERIAL PRIMARY KEY,
    propiedad_id INT NOT NULL,
    cultivo_id INT NOT NULL,
    superficie DECIMAL,
    superficie_unidad_id INT REFERENCES t_unidades(id),
    cantidad DECIMAL,
    cantidad_unidad_id INT REFERENCES t_unidades(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_propiedad_pc FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    CONSTRAINT fk_cultivo_pc FOREIGN KEY (cultivo_id) REFERENCES cultivo(id) ON DELETE RESTRICT
);

-- puente
CREATE TABLE propiedad_animales (
    id SERIAL PRIMARY KEY,
    propiedad_id INT NOT NULL,
    animal_id INT NOT NULL,
    cantidad DECIMAL,
    cantidad_unidad_id INT REFERENCES t_unidades(id),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_propiedad_pa FOREIGN KEY (propiedad_id) REFERENCES propiedades(id) ON DELETE CASCADE,
    CONSTRAINT fk_animal_pa FOREIGN KEY (animal_id) REFERENCES animales(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE,
    descripcion TEXT,
    fecha_solicitada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATE,
    estatus VARCHAR(100) DEFAULT 'CREADA' CHECK (estatus IN (
      'CREADA', 'DIAGNOSTICADA', 'PLANIFICADA', 'INSPECCIONANDO',
      'FINALIZADA', 'NO_APROBADA', 'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    )),
    prioridad VARCHAR(100) DEFAULT 'MEDIA' CHECK (prioridad IN ('BAJA', 'MEDIA', 'ALTA', 'URGENTE')),
    medio_recepcion VARCHAR(100) DEFAULT 'PRESENCIAL' CHECK (medio_recepcion IN ('WEB', 'TELEFONO', 'PRESENCIAL', 'CORREO', 'OFICIO')),
    tipo_solicitud_id INT REFERENCES t_solicitud(id) ON DELETE SET NULL,
    solicitante_id INT REFERENCES clientes(id) ON DELETE SET NULL, 
    atendido_por_id INT REFERENCES empleados(id) ON DELETE SET NULL, 
    propiedad_id INT REFERENCES propiedades(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS planificaciones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(40) UNIQUE,
    fecha_programada DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    prioridad VARCHAR(100) DEFAULT 'MEDIA',
    actividad VARCHAR(100),
    objetivo TEXT,
    convocatoria TEXT,
    punto_encuentro VARCHAR(100),
    ubicacion VARCHAR(100),
    aseguramiento VARCHAR(100),
    vehiculo_id INT REFERENCES vehiculos(id) ON DELETE SET NULL,
    solicitud_id INT NOT NULL UNIQUE REFERENCES solicitudes(id) ON DELETE CASCADE,
    status VARCHAR(100) DEFAULT 'PENDIENTE' CHECK (status IN (
      'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
      'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Puente
CREATE TABLE IF NOT EXISTS planificacion_empleados (
    id SERIAL PRIMARY KEY,
    planificacion_id INT NOT NULL REFERENCES planificaciones(id) ON DELETE CASCADE,
    empleado_id INT NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    CONSTRAINT uq_planificacion_empleado UNIQUE (planificacion_id, empleado_id)
);

CREATE TABLE IF NOT EXISTS inspecciones (
    id SERIAL PRIMARY KEY,
    n_control VARCHAR(100) NOT NULL, 
    t_codigo VARCHAR(100) DEFAULT '10-00-M00-P00-F01',
    fecha_inspeccion DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_inspeccion TIME,
    atendido_por_nombre VARCHAR(150),
    atendido_por_cedula VARCHAR(20),
    atendido_por_email VARCHAR(100),
    atendido_por_tlf VARCHAR(50),
    insp_utm_norte DECIMAL,
    insp_utm_este DECIMAL,
    insp_utm_zona VARCHAR(100),
    google_maps_url TEXT, 
    aspectos_constatados TEXT,
    medidas_ordenadas TEXT,
    posee_certificado VARCHAR(100),
    vigencia_dias INT DEFAULT 30,
    status VARCHAR(100) DEFAULT 'PENDIENTE' CHECK (status IN (
      'PENDIENTE', 'INSPECCIONANDO', 'FINALIZADA', 'NO_APROBADA',
      'SEGUIMIENTO', 'CUARENTENA', 'NO_ATENDIDA'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    planificacion_id INT REFERENCES planificaciones(id) ON DELETE SET NULL
);

-- puente
CREATE TABLE IF NOT EXISTS inspeccion_fotos (
    id SERIAL PRIMARY KEY,
    imagen TEXT NOT NULL,
    inspeccion_id INT NOT NULL REFERENCES inspecciones(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- puente
CREATE TABLE IF NOT EXISTS finalidad_inspeccion (
  id SERIAL PRIMARY KEY,
  inspeccion_id INT NOT NULL REFERENCES inspecciones(id) ON DELETE CASCADE,
  finalidad_id INT NOT NULL REFERENCES finalidad(id) ON DELETE RESTRICT,
  objetivo TEXT,
  CONSTRAINT uq_inspeccion_finalidad UNIQUE (inspeccion_id, finalidad_id)
);

CREATE TABLE IF NOT EXISTS acta_silos (
  id SERIAL PRIMARY KEY,
  semana_epid VARCHAR(100),
  fecha_notificacion DATE DEFAULT CURRENT_DATE,
  lugar_ubicacion VARCHAR(100),
  cant_nacional  NUMERIC(14,2) CHECK (cant_nacional  IS NULL OR cant_nacional  >= 0),
  cant_importado NUMERIC(14,2) CHECK (cant_importado IS NULL OR cant_importado >= 0),
  cant_afectado  NUMERIC(14,2) CHECK (cant_afectado  IS NULL OR cant_afectado  >= 0),
  cant_afectado_porcentaje NUMERIC(5,2) CHECK (cant_afectado_porcentaje IS NULL OR (cant_afectado_porcentaje >= 0 AND cant_afectado_porcentaje <= 100)),
  n_silos VARCHAR(240),
  n_galpones VARCHAR(240),
  c_instalada VARCHAR(240),
  c_operativa VARCHAR(240),
  c_almacenamiento VARCHAR(240),
  destino_objetivo VARCHAR(240),
  observaciones TEXT,
  medidas_recomendadas TEXT,
  evento_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  unidad_medida_id INT REFERENCES t_unidades(id) ON DELETE SET NULL ,
  planificacion_id INT REFERENCES planificaciones(id) ON DELETE SET NULL,
  CONSTRAINT fk_eventos FOREIGN KEY (evento_id) REFERENCES t_evento(id) ON DELETE SET NULL
);

-- puente
CREATE TABLE IF NOT EXISTS silo_fotos (
    id SERIAL PRIMARY KEY,
    acta_silo_id INT NOT NULL REFERENCES acta_silos(id) ON DELETE CASCADE,
    imagen TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seguimiento_inspecciones (
    id SERIAL PRIMARY KEY,
    fecha_seguimiento DATE NOT NULL DEFAULT CURRENT_DATE,
    hallazgos_seguimiento TEXT,
    recomendaciones_cumplidas BOOLEAN DEFAULT FALSE,
    status VARCHAR(100), 
    inspeccion_id INT REFERENCES inspecciones(id) ON DELETE CASCADE, 
    acta_silo_id INT REFERENCES acta_silos(id) ON DELETE CASCADE, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- puente
CREATE TABLE IF NOT EXISTS seguimiento_fotos (
    id SERIAL PRIMARY KEY,
    seguimiento_id INT NOT NULL REFERENCES seguimiento_inspecciones(id) ON DELETE CASCADE,
    imagen TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avales_sanitarios (
    id SERIAL PRIMARY KEY,
    numero_aval VARCHAR(100) UNIQUE NOT NULL, 
    codigo_predio VARCHAR(100),
    fecha_emision DATE DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE,
    certificado_vacunacion_n VARCHAR(150),
    observaciones TEXT,
    inspeccion_id INT REFERENCES inspecciones(id) ON DELETE SET NULL, 
    medico_responsable_id INT REFERENCES empleados(id) ON DELETE SET NULL,
    jefe_osa_id INT REFERENCES empleados(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- puente
CREATE TABLE IF NOT EXISTS aval_hierros (
    id SERIAL PRIMARY KEY,
    aval_id INT NOT NULL REFERENCES avales_sanitarios(id) ON DELETE CASCADE,
    hierro_img_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aval_hallazgos_bov_buf (
    id SERIAL PRIMARY KEY,
    aval_id INT NOT NULL REFERENCES avales_sanitarios(id) ON DELETE CASCADE,
    t_toros INT DEFAULT 0,
    t_vacas INT DEFAULT 0,
    t_novillos INT DEFAULT 0,
    t_novillas INT DEFAULT 0,
    t_mautes_m INT DEFAULT 0,
    t_mautes_h INT DEFAULT 0,
    t_becerros INT DEFAULT 0,
    t_becerras INT DEFAULT 0,
    t_bufalos INT DEFAULT 0,
    t_bufalas INT DEFAULT 0,
    t_buvillos INT DEFAULT 0,
    t_buvillas INT DEFAULT 0,
    t_bumautes_m INT DEFAULT 0,
    t_bumautes_h INT DEFAULT 0,
    t_bucerros INT DEFAULT 0,
    t_bucerras INT DEFAULT 0,
    total_bov_buf INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS aval_hallazgos_otras (
    id SERIAL PRIMARY KEY,
    aval_id INT NOT NULL REFERENCES avales_sanitarios(id) ON DELETE CASCADE,
    tipo_animal_id INT REFERENCES t_animales(id), 
    machos INT DEFAULT 0,
    hembras INT DEFAULT 0,
    crias INT DEFAULT 0,
    total INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS aval_biologicos (
    id SERIAL PRIMARY KEY,
    aval_id INT NOT NULL REFERENCES avales_sanitarios(id) ON DELETE CASCADE,
    insumo_id INT REFERENCES insumos(id), 
    fecha_vacunacion DATE,
    pruebas_diagnosticas TEXT, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS epidemiologia_hallazgos (
    id SERIAL PRIMARY KEY,
    inspeccion_id INT NOT NULL REFERENCES inspecciones(id) ON DELETE CASCADE,
    enfermedad_id INT REFERENCES enfermedades(id) ON DELETE RESTRICT,
    c_probados INT DEFAULT 0,
    c_positivos INT DEFAULT 0,
    c_reactores INT DEFAULT 0,
    c_marcados INT DEFAULT 0,
    c_sacrificados INT DEFAULT 0,
    o_tecnicas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--  puente
CREATE TABLE IF NOT EXISTS insumos_stock (
    id SERIAL PRIMARY KEY,
    insumo_id INT NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
    oficina_id INT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
    lote VARCHAR(100), 
    fecha_vencimiento DATE,
    stock_actual DECIMAL(12,2) DEFAULT 0,
    stock_minimo DECIMAL(12,2) DEFAULT 0, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_insumo_oficina_lote UNIQUE (insumo_id, oficina_id, lote)
);

-- puente
CREATE TABLE IF NOT EXISTS movimientos_insumos (
    id SERIAL PRIMARY KEY,
    insumo_id INT NOT NULL REFERENCES insumos(id) ON DELETE CASCADE,
    oficina_id INT NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
    tipo_movimiento VARCHAR(30) CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE_MAS', 'AJUSTE_MENOS', 'CONSUMO')),
    cantidad DECIMAL(12,2) NOT NULL,
    lote VARCHAR(100),
    inspeccion_id INT REFERENCES inspecciones(id) ON DELETE SET NULL,
    acta_silo_id INT REFERENCES acta_silos(id) ON DELETE SET NULL,
    seguimiento_id INT REFERENCES seguimiento_inspecciones(id) ON DELETE SET NULL,
    aval_id INT REFERENCES avales_sanitarios(id) ON DELETE SET NULL,
    empleado_id INT REFERENCES empleados(id) ON DELETE SET NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bitacora (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accion VARCHAR(100) NOT NULL,
    modulo VARCHAR(100) NOT NULL, 
    usuario_global_id INT NOT NULL, 
    empleado_id INT REFERENCES empleados(id) ON DELETE SET NULL, 
    username_log VARCHAR(100), 
    payload_previo JSONB, 
    payload_nuevo JSONB  
);

CREATE TABLE IF NOT EXISTS recuperacion_pass (
    id SERIAL PRIMARY KEY,
    usuario_global_id INT NOT NULL, 
    token VARCHAR(255) UNIQUE NOT NULL,
    expira_at TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_global_id INT NOT NULL, 
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'INFO', 
    leido BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Índices para velocidad de reportes 
CREATE UNIQUE INDEX uq_empleado_residencia_p ON empleado_residencia (empleado_id) WHERE (es_principal = TRUE);
CREATE INDEX idx_insp_georef ON inspecciones(insp_utm_norte, insp_utm_este);
CREATE INDEX idx_insp_fecha ON inspecciones(fecha_inspeccion);
CREATE INDEX idx_bitacora_global_user ON bitacora(usuario_global_id);
CREATE INDEX idx_bitacora_empleado ON bitacora(empleado_id);
CREATE INDEX idx_solicitudes_codigo ON solicitudes(codigo);
CREATE INDEX idx_planificaciones_fecha ON planificaciones(fecha_programada);



