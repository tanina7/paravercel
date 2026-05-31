CREATE TABLE IF NOT EXISTS facturas (
  id_factura INT AUTO_INCREMENT PRIMARY KEY,
  id_solicitud INT NOT NULL,
  nit_ci VARCHAR(20) NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  numero_factura VARCHAR(50) NOT NULL,
  codigo_control VARCHAR(50) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  documento_factura VARCHAR(255) DEFAULT NULL,
  fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_solicitud) REFERENCES solicitudes_tramite(id_solicitud) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
