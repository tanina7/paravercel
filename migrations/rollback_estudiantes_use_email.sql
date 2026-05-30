-- Rollback: Revertir cambios en tabla estudiantes
-- Esto deshace la migración modify_estudiantes_use_email.sql

-- 1. Dropear el constraint unique de correo
ALTER TABLE estudiantes DROP INDEX `idx_estudiantes_correo`;
ALTER TABLE estudiantes DROP INDEX `estudiantes_correo_unique`;

-- 2. Agregar de vuelta la columna id_usuario
ALTER TABLE estudiantes ADD COLUMN id_usuario INT DEFAULT NULL AFTER id_estudiante;

-- 3. Copiar id_usuario desde correo (usando tabla usuarios)
UPDATE estudiantes
SET id_usuario = (
  SELECT u.id_usuario 
  FROM usuarios u 
  WHERE u.correo = estudiantes.correo 
  LIMIT 1
)
WHERE id_estudiante > 0 AND correo IS NOT NULL;

-- 4. Agregar el índice en id_usuario
ALTER TABLE estudiantes ADD KEY `id_usuario` (`id_usuario`);

-- 5. Agregar la FK antigua
ALTER TABLE estudiantes ADD CONSTRAINT `estudiantes_ibfk_1` 
FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

-- 6. Dropear la columna correo
ALTER TABLE estudiantes DROP COLUMN correo;
