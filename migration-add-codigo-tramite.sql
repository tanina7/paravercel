-- Migración: Agregar campo codigo_tramite a la tabla tramites
-- Fecha: 2026-04-06
-- Descripción: Agrega el campo codigo_tramite (VARCHAR 100, UNIQUE) a la tabla tramites para permitir búsquedas por código

-- Verificar si la columna ya existe (para MySQL 8.0+)
ALTER TABLE tramites 
ADD COLUMN codigo_tramite VARCHAR(100) UNIQUE DEFAULT NULL AFTER id_tramite;

-- Si la consulta anterior falla con "Duplicate column", significa que ya existe y no necesita hacer nada
-- Para versiones anteriores de MySQL, descomentar la siguiente línea si es necesario:
-- SHOW COLUMNS FROM tramites LIKE 'codigo_tramite';
