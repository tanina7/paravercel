DROP DATABASE IF EXISTS tramites_univalle;
CREATE DATABASE tramites_univalle;
USE tramites_univalle;

-- ROLES DEL SISTEMA
CREATE TABLE roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- USUARIOS
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(100) UNIQUE,
    ci VARCHAR(20),
    id_rol INT,
    estado BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- ESTUDIANTES
CREATE TABLE estudiantes (
    id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    codigo_estudiante VARCHAR(20) UNIQUE,
    carrera VARCHAR(100),
    subsede VARCHAR(100),
    estado_financiero ENUM('Solvente','Deuda') DEFAULT 'Solvente',
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- TIPOS DE TRAMITE (CATALOGO)
CREATE TABLE tipos_tramite (
    id_tipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tramite VARCHAR(150) NOT NULL,
    descripcion TEXT,
    costo DECIMAL(10,2),
    requisitos TEXT
);

-- ESTADOS DEL TRAMITE
CREATE TABLE estados_tramite (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nombre_estado VARCHAR(50) NOT NULL UNIQUE
);

-- SOLICITUDES DE TRAMITE (INICIO DEL PROCESO)
CREATE TABLE solicitudes_tramite (
    id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
    id_estudiante INT NOT NULL,
    codigo_tramite VARCHAR(50) UNIQUE,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_general VARCHAR(50),
    total DECIMAL(10,2),
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante)
);

-- DETALLE DE SOLICITUD (CARRITO)
CREATE TABLE detalle_solicitud (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT,
    id_tipo INT,
    precio DECIMAL(10,2),
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_tramite(id_solicitud),
    FOREIGN KEY (id_tipo) REFERENCES tipos_tramite(id_tipo)
);

-- TRAMITE INTERNO (GESTION ADMINISTRATIVA)
CREATE TABLE tramites (
    id_tramite INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT,
    id_tipo INT,
    id_estado INT,
    id_usuario_asignado INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion DATETIME,
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_tramite(id_solicitud),
    FOREIGN KEY (id_tipo) REFERENCES tipos_tramite(id_tipo),
    FOREIGN KEY (id_estado) REFERENCES estados_tramite(id_estado),
    FOREIGN KEY (id_usuario_asignado) REFERENCES usuarios(id_usuario)
);

-- DOCUMENTOS ADJUNTOS
CREATE TABLE documentos_adjuntos (
    id_documento INT AUTO_INCREMENT PRIMARY KEY,
    id_tramite INT,
    nombre_archivo VARCHAR(150),
    ruta_archivo VARCHAR(255),
    tipo_documento VARCHAR(50),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tramite) REFERENCES tramites(id_tramite)
);

-- ARCHIVOS SUBIDOS POR ESTUDIANTE
CREATE TABLE archivos_tramite (
    id_archivo INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT,
    tipo_archivo VARCHAR(50),
    archivo VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_tramite(id_solicitud)
);

-- PAGOS
CREATE TABLE pagos (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_solicitud INT,
    nro_recibo VARCHAR(50) UNIQUE,
    metodo_pago VARCHAR(50),
    monto DECIMAL(10,2),
    fecha_pago DATETIME,
    estado_pago VARCHAR(50),
    FOREIGN KEY (id_solicitud) REFERENCES solicitudes_tramite(id_solicitud)
);

-- COMPROBANTES DE PAGO
CREATE TABLE comprobantes (
    id_comprobante INT AUTO_INCREMENT PRIMARY KEY,
    id_pago INT,
    archivo VARCHAR(255),
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_pago) REFERENCES pagos(id_pago)
);

-- SOLVENCIAS (CAJA, BIBLIOTECA, LABORATORIO)
CREATE TABLE solvencias (
    id_solvencia INT AUTO_INCREMENT PRIMARY KEY,
    id_tramite INT,
    tipo ENUM('Caja','Biblioteca','Laboratorio'),
    aprobado BOOLEAN DEFAULT FALSE,
    fecha_aprobacion DATETIME,
    id_usuario INT,
    FOREIGN KEY (id_tramite) REFERENCES tramites(id_tramite),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- HISTORIAL DEL TRAMITE (TIMELINE)
CREATE TABLE historial_tramite (
    id_historial INT AUTO_INCREMENT PRIMARY KEY,
    id_tramite INT,
    id_estado INT,
    id_usuario INT,
    comentario TEXT,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tramite) REFERENCES tramites(id_tramite),
    FOREIGN KEY (id_estado) REFERENCES estados_tramite(id_estado),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- FIRMAS DIGITALES
CREATE TABLE firmas (
    id_firma INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    foto_usuario VARCHAR(255),
    firma_imagen VARCHAR(255),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- INDICES PARA MEJOR RENDIMIENTO
CREATE INDEX idx_solicitudes_estudiante ON solicitudes_tramite(id_estudiante);
CREATE INDEX idx_tramites_estado ON tramites(id_estado);
CREATE INDEX idx_pagos_solicitud ON pagos(id_solicitud);
CREATE INDEX idx_historial_tramite ON historial_tramite(id_tramite);

-- DATOS INICIALES

INSERT INTO roles (nombre_rol) VALUES
('Estudiante'),
('Caja'),
('Biblioteca'),
('Laboratorio'),
('Director Carrera'),
('Archivos'),
('Direccion Academica'),
('Vicerrector'),
('Administrador');

INSERT INTO tipos_tramite (nombre_tramite, descripcion, costo, requisitos) VALUES
('Cambio de Sub Sede','Cambio de sede con convalidacion interna',90,'Solicitud firmada, cédula de identidad, comprobante de solvencia financiera'),
('Extension de Diploma','Solicitud de diploma y titulo profesional',120,'Cédula de identidad, solicitud autenticada, comprobante de egreso'),
('Certificado de Calificaciones','Certificado de notas aprobadas',50,'Cédula de identidad, número de carnet de estudiante'),
('Cambio de Plan de Estudios','Homologacion de materias',80,'Solicitud fundamentada, cédula de identidad, programas académicos comparativos, comprobante de solvencia');

INSERT INTO estados_tramite (nombre_estado) VALUES
('Recibido'),
('Verificando Solvencia'),
('Revision Tecnica'),
('Pago Pendiente'),
('Pagado'),
('Listo para Impresion'),
('Finalizado'),
('Rechazado');