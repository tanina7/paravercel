-- Modificar tabla estudiantes para usar correo electrónico en lugar de id_usuario
-- Esto nos permite sincronizar con system_users sin dependencia de la tabla usuarios antigua

-- 1. Crear nuevo campo correo (temporal)
ALTER TABLE estudiantes ADD COLUMN correo VARCHAR(255) DEFAULT NULL;

-- 2. Copiar correos desde la tabla usuarios usando el id_usuario existente
UPDATE estudiantes
SET correo = (
  SELECT u.correo 
  FROM usuarios u 
  WHERE u.id_usuario = estudiantes.id_usuario
)
WHERE id_usuario IS NOT NULL;

-- 3. Crear índice único en correo
CREATE UNIQUE INDEX idx_estudiantes_correo ON estudiantes(correo);

-- 4. Hacer correo NOT NULL
ALTER TABLE estudiantes MODIFY COLUMN correo VARCHAR(255) NOT NULL;

-- 5. Dropear la FK antigua
ALTER TABLE estudiantes DROP FOREIGN KEY estudiantes_ibfk_1;

-- 6. Dropear el índice antiguo
ALTER TABLE estudiantes DROP INDEX id_usuario;

-- 7. Dropear la columna id_usuario
ALTER TABLE estudiantes DROP COLUMN id_usuario;

-- 8. Agregar FK para correo (referencia a usuarios.correo)
-- Nota: Si usuarios también es legacy, simplemente dejamos correo como campo único sin FK
-- Ya que system_users es la autoridad de usuarios ahora
ALTER TABLE estudiantes ADD CONSTRAINT estudiantes_correo_unique UNIQUE KEY (correo);
