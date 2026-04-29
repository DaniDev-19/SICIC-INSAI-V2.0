
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB DEFAULT '{}',
    status BOOLEAN default TRUE
);

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    mfa_secret TEXT, 
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instancias (
    id SERIAL PRIMARY KEY,
    nombre_mostrable VARCHAR(100) NOT NULL,
    db_name VARCHAR(100) NOT NULL UNIQUE,
    status BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuario_instancia (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL,
    instancia_id INT NOT NULL,
    rol_id INT NOT NULL,
    permisos_personalizados JSONB DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuario_instancia UNIQUE (usuario_id, instancia_id),
    CONSTRAINT fk_ui_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_ui_instancia FOREIGN KEY (instancia_id) REFERENCES instancias(id) ON DELETE CASCADE,
    CONSTRAINT fk_ui_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);





