-- Modificar la tabla solicitudes_tramite para permitir id_estudiante NULL
ALTER TABLE `solicitudes_tramite` 
MODIFY COLUMN `id_estudiante` INT NULL,
DROP FOREIGN KEY `solicitudes_tramite_ibfk_1`,
ADD CONSTRAINT `solicitudes_tramite_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE SET NULL;
