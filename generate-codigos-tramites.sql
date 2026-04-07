-- Script para generar códigos para trámites sin codigo_tramite
-- Ejecutar esto después de la migración

UPDATE tramites 
SET codigo_tramite = CONCAT('TRM-', UNIX_TIMESTAMP(fecha_creacion), '-', SUBSTRING(UUID(), 1, 8))
WHERE codigo_tramite IS NULL;

-- Verificar que se actualizaron
SELECT COUNT(*) as tramites_con_codigo FROM tramites WHERE codigo_tramite IS NOT NULL;
SELECT COUNT(*) as tramites_sin_codigo FROM tramites WHERE codigo_tramite IS NULL;

-- Mostrar algunos ejemplos
SELECT id_tramite, codigo_tramite, fecha_creacion FROM tramites LIMIT 5;