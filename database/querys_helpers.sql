INSERT INTO roles (nombre, descripcion, permisos) VALUES 
('SUPER_ADMIN', 'Acceso total', '{ "all": ["*"] }');

INSERT INTO usuarios (username, email, password_hash, status) 
VALUES ('danijdev', 'admin@insai.gob.ve', '$2b$10$87odvHKxPq2Q7sxjAtFaAe/9N.bFYBPKoaRGybMjl2e5q7.Q5eAO2', TRUE);

INSERT INTO instancias (nombre_mostrable, db_name, status) VALUES 
('Instancia Básica (2025)', 'db_insai_operativa', TRUE),
('Instancia Temporal (2026)', 'db_insai_operativa_2026', TRUE);

INSERT INTO usuario_instancia (usuario_id, instancia_id, rol_id) VALUES 
(1, 1, 1),
(1, 2, 1);
