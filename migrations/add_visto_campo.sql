-- Agregar columna para rastrear si el usuario vio el trámite finalizado
ALTER TABLE tramites ADD COLUMN visto_por_usuario TINYINT(1) DEFAULT 0 AFTER id_estado;

-- Crear índice para búsquedas rápidas
CREATE INDEX idx_tramites_visto ON tramites(id_estado, visto_por_usuario);
