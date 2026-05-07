-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com    Database: tramites_univalle
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '8bb25845-258d-11f1-8493-6a161ca7d07b:1-52,
f7332f44-271f-11f1-ba2d-fa50dfd4264e:1-266';

--
-- Table structure for table `archivos_tramite`a
--

DROP TABLE IF EXISTS `archivos_tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `archivos_tramite` (
  `id_archivo` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int DEFAULT NULL,
  `tipo_archivo` varchar(50) DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_archivo`),
  KEY `id_solicitud` (`id_solicitud`),
  CONSTRAINT `archivos_tramite_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitudes_tramite` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `archivos_tramite`
--

LOCK TABLES `archivos_tramite` WRITE;
/*!40000 ALTER TABLE `archivos_tramite` DISABLE KEYS */;
INSERT INTO `archivos_tramite` VALUES (1,17,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/17_1775447134950_p2.pdf','2026-04-06 03:45:36'),(2,17,'Fotocopia del carnet de identidad','/uploads/documentos/17_1775447136657_p2.pdf','2026-04-06 03:45:38'),(3,17,'Hoja de solvencia interna','/uploads/documentos/17_1775447138499_p2.pdf','2026-04-06 03:45:39'),(4,18,'Carta de solicitud de cambio de plan de estudios','/uploads/documentos/18_1775447992875_p2.pdf','2026-04-06 03:59:54'),(5,18,'Fotocopia del carnet de identidad','/uploads/documentos/18_1775447994562_p2.pdf','2026-04-06 03:59:56'),(6,18,'Carta de solicitud del trámite','/uploads/documentos/18_1775447996245_p2.pdf','2026-04-06 03:59:57'),(7,18,'Fotocopia del carnet de identidad','/uploads/documentos/18_1775447997894_p2.pdf','2026-04-06 03:59:59'),(8,18,'Hoja de solvencia interna','/uploads/documentos/18_1775447999630_p2.pdf','2026-04-06 04:00:01'),(9,22,'Carta de solicitud de cambio de plan de estudios','/uploads/documentos/22_1775449879911_p2.pdf','2026-04-06 04:31:21'),(10,22,'Fotocopia del carnet de identidad','/uploads/documentos/22_1775449881602_p2.pdf','2026-04-06 04:31:23'),(11,22,'Carta de solicitud del trámite','/uploads/documentos/22_1775449883303_p2.pdf','2026-04-06 04:31:24'),(12,22,'Fotocopia del carnet de identidad','/uploads/documentos/22_1775449884970_p2.pdf','2026-04-06 04:31:26'),(13,22,'Hoja de solvencia interna','/uploads/documentos/22_1775449886629_p2.pdf','2026-04-06 04:31:28'),(14,23,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/23_1775450300322_p2.pdf','2026-04-06 04:38:22'),(15,23,'Fotocopia del carnet de identidad','/uploads/documentos/23_1775450302322_p2.pdf','2026-04-06 04:38:23'),(16,23,'Hoja de solvencia interna','/uploads/documentos/23_1775450304027_p2.pdf','2026-04-06 04:38:25'),(17,23,'Carta de solicitud del trámite','/uploads/documentos/23_1775450305929_p2.pdf','2026-04-06 04:38:27'),(18,23,'Fotocopia del carnet de identidad','/uploads/documentos/23_1775450307626_p2.pdf','2026-04-06 04:38:29'),(19,23,'Hoja de solvencia interna','/uploads/documentos/23_1775450309330_p2.pdf','2026-04-06 04:38:30'),(20,23,'Carta de solicitud de cambio de plan de estudios','/uploads/documentos/23_1775450311073_p2.pdf','2026-04-06 04:38:32'),(21,23,'Fotocopia del carnet de identidad','/uploads/documentos/23_1775450312817_p2.pdf','2026-04-06 04:38:34'),(22,23,'Carta de solicitud del trámite','/uploads/documentos/23_1775450314542_p2.pdf','2026-04-06 04:38:36'),(23,23,'Fotocopia del carnet de identidad','/uploads/documentos/23_1775450316227_p2.pdf','2026-04-06 04:38:37'),(24,23,'Hoja de solvencia interna','/uploads/documentos/23_1775450317915_p2.pdf','2026-04-06 04:38:39'),(25,24,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/24_1775519876232_p2.pdf','2026-04-06 23:57:56'),(26,24,'Fotocopia del carnet de identidad','/uploads/documentos/24_1775519877973_p2.pdf','2026-04-06 23:57:58'),(27,24,'Hoja de solvencia interna','/uploads/documentos/24_1775519879897_p2.pdf','2026-04-06 23:58:00'),(28,24,'Carta de solicitud del trámite','/uploads/documentos/24_1775519881650_p2.pdf','2026-04-06 23:58:02'),(29,24,'Fotocopia del carnet de identidad','/uploads/documentos/24_1775519883447_p2.pdf','2026-04-06 23:58:04'),(30,24,'Hoja de solvencia interna','/uploads/documentos/24_1775519885211_p2.pdf','2026-04-06 23:58:05'),(31,25,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/25_1775520726306_p2.pdf','2026-04-07 00:12:08'),(32,25,'Fotocopia del carnet de identidad','/uploads/documentos/25_1775520729235_p2.pdf','2026-04-07 00:12:11'),(33,25,'Hoja de solvencia interna','/uploads/documentos/25_1775520732516_p2.pdf','2026-04-07 00:12:15'),(34,26,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/26_1775521119723_p2.pdf','2026-04-07 00:18:40'),(35,26,'Fotocopia del carnet de identidad','/uploads/documentos/26_1775521121573_p2.pdf','2026-04-07 00:18:42'),(36,26,'Hoja de solvencia interna','/uploads/documentos/26_1775521123381_p2.pdf','2026-04-07 00:18:44'),(37,27,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/27_1775521604692_p2.pdf','2026-04-07 00:26:46'),(38,27,'Fotocopia del carnet de identidad','/uploads/documentos/27_1775521606813_p2.pdf','2026-04-07 00:26:48'),(39,27,'Hoja de solvencia interna','/uploads/documentos/27_1775521609241_p2.pdf','2026-04-07 00:26:51'),(40,28,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/28_1775521884546_p2.pdf','2026-04-07 00:31:25'),(41,28,'Fotocopia del carnet de identidad','/uploads/documentos/28_1775521886519_p2.pdf','2026-04-07 00:31:28'),(42,28,'Hoja de solvencia interna','/uploads/documentos/28_1775521889695_p2.pdf','2026-04-07 00:31:31'),(43,29,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/29_1775522069042_p2.pdf','2026-04-07 00:34:30'),(44,29,'Fotocopia del carnet de identidad','/uploads/documentos/29_1775522070966_p2.pdf','2026-04-07 00:34:32'),(45,29,'Hoja de solvencia interna','/uploads/documentos/29_1775522073540_p2.pdf','2026-04-07 00:34:35'),(46,30,'Carta de solicitud de cambio de Sub Sede','/uploads/documentos/30_1775522371416_p2.pdf','2026-04-07 00:39:32'),(47,30,'Fotocopia del carnet de identidad','/uploads/documentos/30_1775522373283_p2.pdf','2026-04-07 00:39:34'),(48,30,'Hoja de solvencia interna','/uploads/documentos/30_1775522375069_p2.pdf','2026-04-07 00:39:36'),(49,31,'Carta de solicitud de cambio de plan de estudios','/uploads/documentos/31_1775522871254_p2.pdf','2026-04-07 00:47:53'),(50,31,'Fotocopia del carnet de identidad','/uploads/documentos/31_1775522874220_p2.pdf','2026-04-07 00:47:55'),(51,32,'Carta de solicitud de cambio de plan de estudios','/uploads/documentos/32_1775523195012_p2.pdf','2026-04-07 00:53:16'),(52,32,'Fotocopia del carnet de identidad','/uploads/documentos/32_1775523197052_p2.pdf','2026-04-07 00:53:18'),(53,35,'Carta de solicitud de cambio de plan de estudios','/uploads/documentos/35_1775526079029_p2.pdf','2026-04-07 01:41:20'),(54,35,'Fotocopia del carnet de identidad','/uploads/documentos/35_1775526080845_p2.pdf','2026-04-07 01:41:22');
/*!40000 ALTER TABLE `archivos_tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comprobantes`
--

DROP TABLE IF EXISTS `comprobantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comprobantes` (
  `id_comprobante` int NOT NULL AUTO_INCREMENT,
  `id_pago` int DEFAULT NULL,
  `archivo` varchar(255) DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_comprobante`),
  KEY `id_pago` (`id_pago`),
  CONSTRAINT `comprobantes_ibfk_1` FOREIGN KEY (`id_pago`) REFERENCES `pagos` (`id_pago`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comprobantes`
--

LOCK TABLES `comprobantes` WRITE;
/*!40000 ALTER TABLE `comprobantes` DISABLE KEYS */;
INSERT INTO `comprobantes` VALUES (1,1,'/uploads/comprobantes/28_1775521901543_p2.pdf','2026-04-07 00:31:44'),(2,2,'/uploads/comprobantes/29_1775522134060_p2.pdf','2026-04-07 00:35:36'),(3,3,'/uploads/comprobantes/31_1775522896156_p2.pdf','2026-04-07 00:48:19'),(4,4,'/uploads/comprobantes/32_1775523226407_p2.pdf','2026-04-07 00:53:49'),(5,5,'/uploads/comprobantes/35_1775526097621_p2.pdf','2026-04-07 01:41:39');
/*!40000 ALTER TABLE `comprobantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalle_solicitud`
--

DROP TABLE IF EXISTS `detalle_solicitud`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalle_solicitud` (
  `id_detalle` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int DEFAULT NULL,
  `id_tipo` int DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `id_solicitud` (`id_solicitud`),
  KEY `id_tipo` (`id_tipo`),
  CONSTRAINT `detalle_solicitud_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitudes_tramite` (`id_solicitud`),
  CONSTRAINT `detalle_solicitud_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `tipos_tramite` (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalle_solicitud`
--

LOCK TABLES `detalle_solicitud` WRITE;
/*!40000 ALTER TABLE `detalle_solicitud` DISABLE KEYS */;
INSERT INTO `detalle_solicitud` VALUES (1,1,1,90.00),(2,15,1,90.00),(3,15,2,120.00),(4,16,1,90.00),(5,17,1,90.00),(6,18,4,80.00),(7,18,3,50.00),(8,19,4,80.00),(9,19,3,50.00),(10,20,4,80.00),(11,20,3,50.00),(12,21,4,80.00),(13,21,3,50.00),(14,22,4,80.00),(15,22,3,50.00),(16,23,1,90.00),(17,23,2,120.00),(18,23,4,80.00),(19,23,3,50.00),(20,24,1,90.00),(21,24,2,120.00),(22,25,1,90.00),(23,26,1,90.00),(24,27,1,90.00),(25,28,1,90.00),(26,29,1,90.00),(27,30,1,90.00),(28,31,4,80.00),(29,32,4,80.00),(30,33,4,80.00),(31,34,4,80.00),(32,35,4,80.00);
/*!40000 ALTER TABLE `detalle_solicitud` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos_adjuntos`
--

DROP TABLE IF EXISTS `documentos_adjuntos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos_adjuntos` (
  `id_documento` int NOT NULL AUTO_INCREMENT,
  `id_tramite` int DEFAULT NULL,
  `nombre_archivo` varchar(150) DEFAULT NULL,
  `ruta_archivo` varchar(255) DEFAULT NULL,
  `tipo_documento` varchar(50) DEFAULT NULL,
  `fecha_subida` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_documento`),
  KEY `id_tramite` (`id_tramite`),
  CONSTRAINT `documentos_adjuntos_ibfk_1` FOREIGN KEY (`id_tramite`) REFERENCES `tramites` (`id_tramite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos_adjuntos`
--

LOCK TABLES `documentos_adjuntos` WRITE;
/*!40000 ALTER TABLE `documentos_adjuntos` DISABLE KEYS */;
/*!40000 ALTER TABLE `documentos_adjuntos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_tramite`
--

DROP TABLE IF EXISTS `estados_tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_tramite` (
  `id_estado` int NOT NULL AUTO_INCREMENT,
  `nombre_estado` varchar(50) NOT NULL,
  PRIMARY KEY (`id_estado`),
  UNIQUE KEY `nombre_estado` (`nombre_estado`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_tramite`
--

LOCK TABLES `estados_tramite` WRITE;
/*!40000 ALTER TABLE `estados_tramite` DISABLE KEYS */;
INSERT INTO `estados_tramite` VALUES (7,'Finalizado'),(6,'Listo para Impresion'),(5,'Pagado'),(4,'Pago Pendiente'),(8,'Rechazado'),(1,'Recibido'),(3,'Revision Tecnica'),(2,'Verificando Solvencia');
/*!40000 ALTER TABLE `estados_tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estudiantes`
--

DROP TABLE IF EXISTS `estudiantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiantes` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `codigo_estudiante` varchar(20) DEFAULT NULL,
  `carrera` varchar(100) DEFAULT NULL,
  `subsede` varchar(100) DEFAULT NULL,
  `estado_financiero` enum('Solvente','Deuda') DEFAULT 'Solvente',
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `codigo_estudiante` (`codigo_estudiante`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estudiantes`
--

LOCK TABLES `estudiantes` WRITE;
/*!40000 ALTER TABLE `estudiantes` DISABLE KEYS */;
INSERT INTO `estudiantes` VALUES (1,1,'EST-99221','Ingeniería de Sistemas','Tiquipaya','Solvente','2026-03-24 15:49:39'),(2,9,'EST-10002','Derecho','Central','Solvente','2026-03-31 10:48:05'),(3,10,'EST-10003','Medicina','Cochabamba','Solvente','2026-03-31 10:48:06'),(4,11,'EST-10004','Arquitectura','Santa Cruz','Solvente','2026-03-31 10:48:07'),(5,12,'EST-10005','Ingeniería Civil','Central','Solvente','2026-03-31 10:57:52'),(6,13,'EST-10006','Contaduría','Cochabamba','Solvente','2026-03-31 10:57:52'),(7,14,'EST-10007','Derecho','Santa Cruz','Solvente','2026-03-31 10:57:53'),(8,15,'EST-10008','Psicología','Central','Solvente','2026-03-31 10:57:54'),(9,16,'EST-10009','Arquitectura','Cochabamba','Solvente','2026-03-31 10:57:54'),(10,17,'EST-10010','Medicina','Central','Solvente','2026-03-31 10:57:55'),(11,18,'EST-10011','Economía','Santa Cruz','Solvente','2026-03-31 10:57:56'),(12,19,'EST-10012','Marketing','Central','Solvente','2026-03-31 10:57:56'),(13,20,'EST-10013','Ingeniería Industrial','Cochabamba','Solvente','2026-03-31 10:57:57'),(14,21,'EST-10014','Derecho','Santa Cruz','Solvente','2026-03-31 10:57:58');
/*!40000 ALTER TABLE `estudiantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `firmas`
--

DROP TABLE IF EXISTS `firmas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `firmas` (
  `id_firma` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `foto_usuario` varchar(255) DEFAULT NULL,
  `firma_imagen` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_firma`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `firmas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `firmas`
--

LOCK TABLES `firmas` WRITE;
/*!40000 ALTER TABLE `firmas` DISABLE KEYS */;
/*!40000 ALTER TABLE `firmas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_tramite`
--

DROP TABLE IF EXISTS `historial_tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_tramite` (
  `id_historial` int NOT NULL AUTO_INCREMENT,
  `id_tramite` int DEFAULT NULL,
  `id_estado` int DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  `comentario` text,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `id_estado` (`id_estado`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_historial_tramite` (`id_tramite`),
  CONSTRAINT `historial_tramite_ibfk_1` FOREIGN KEY (`id_tramite`) REFERENCES `tramites` (`id_tramite`),
  CONSTRAINT `historial_tramite_ibfk_2` FOREIGN KEY (`id_estado`) REFERENCES `estados_tramite` (`id_estado`),
  CONSTRAINT `historial_tramite_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_tramite`
--

LOCK TABLES `historial_tramite` WRITE;
/*!40000 ALTER TABLE `historial_tramite` DISABLE KEYS */;
INSERT INTO `historial_tramite` VALUES (1,1,1,1,'El estudiante inició el trámite correctamente.','2026-03-24 15:49:40'),(2,1,7,1,'','2026-03-26 01:17:28'),(3,1,7,1,'','2026-03-26 01:17:28'),(4,1,7,1,'','2026-03-26 01:17:29'),(5,1,7,NULL,'','2026-03-31 10:40:36'),(6,1,7,NULL,'','2026-03-31 10:40:37'),(7,1,7,NULL,'','2026-03-31 10:44:09'),(8,3,7,NULL,'Tiene todos sus pagos en orden','2026-03-31 10:51:01'),(9,4,8,NULL,'Le fatlta pagar segunda colegiatura','2026-03-31 10:51:46'),(10,14,7,NULL,'Tiee todo completo ','2026-03-31 11:25:01'),(11,13,7,NULL,'todo pagado','2026-03-31 15:32:58');
/*!40000 ALTER TABLE `historial_tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos`
--

DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id_pago` int NOT NULL AUTO_INCREMENT,
  `id_solicitud` int DEFAULT NULL,
  `nro_recibo` varchar(50) DEFAULT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `monto` decimal(10,2) DEFAULT NULL,
  `fecha_pago` datetime DEFAULT NULL,
  `estado_pago` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_pago`),
  UNIQUE KEY `nro_recibo` (`nro_recibo`),
  KEY `idx_pagos_solicitud` (`id_solicitud`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitudes_tramite` (`id_solicitud`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos`
--

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES (1,28,NULL,'Transferencia',90.00,'2026-04-07 00:31:43','Completado'),(2,29,NULL,'Transferencia',90.00,'2026-04-07 00:35:35','Completado'),(3,31,NULL,'Transferencia',80.00,'2026-04-07 00:48:18','Completado'),(4,32,NULL,'Transferencia',80.00,'2026-04-07 00:53:49','Completado'),(5,35,NULL,'Transferencia',80.00,'2026-04-07 01:41:39','Completado');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id_rol` int NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol` (`nombre_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (9,'Administrador'),(6,'Archivos'),(3,'Biblioteca'),(2,'Caja'),(7,'Direccion Academica'),(5,'Director Carrera'),(1,'Estudiante'),(4,'Laboratorio'),(8,'Vicerrector');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_tramite`
--

DROP TABLE IF EXISTS `solicitudes_tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_tramite` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_estudiante` int DEFAULT NULL,
  `codigo_tramite` varchar(50) DEFAULT NULL,
  `fecha_solicitud` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado_general` varchar(50) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  UNIQUE KEY `codigo_tramite` (`codigo_tramite`),
  KEY `idx_solicitudes_estudiante` (`id_estudiante`),
  CONSTRAINT `solicitudes_tramite_ibfk_1` FOREIGN KEY (`id_estudiante`) REFERENCES `estudiantes` (`id_estudiante`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_tramite`
--

LOCK TABLES `solicitudes_tramite` WRITE;
/*!40000 ALTER TABLE `solicitudes_tramite` DISABLE KEYS */;
INSERT INTO `solicitudes_tramite` VALUES (1,1,'TRM-2024-001','2026-03-24 15:49:39','Iniciado',90.00),(2,2,'TRM-002','2026-03-31 10:48:06','Pendiente',50.00),(3,3,'TRM-003','2026-03-31 10:48:06','Pendiente',80.00),(4,4,'TRM-004','2026-03-31 10:48:07','Pendiente',120.00),(5,5,'TRM-005','2026-03-31 10:57:52','Pendiente',60.00),(6,6,'TRM-006','2026-03-31 10:57:52','Pendiente',70.00),(7,7,'TRM-007','2026-03-31 10:57:53','Pendiente',90.00),(8,8,'TRM-008','2026-03-31 10:57:54','Pendiente',55.00),(9,9,'TRM-009','2026-03-31 10:57:55','Pendiente',110.00),(10,10,'TRM-010','2026-03-31 10:57:55','Pendiente',130.00),(11,11,'TRM-011','2026-03-31 10:57:56','Pendiente',75.00),(12,12,'TRM-012','2026-03-31 10:57:57','Pendiente',65.00),(13,13,'TRM-013','2026-03-31 10:57:57','Pendiente',95.00),(14,14,'TRM-014','2026-03-31 10:57:58','Pendiente',85.00),(15,NULL,'TRM-1775441082858','2026-04-06 02:04:43','Pendiente',210.00),(16,NULL,'TRM-1775441203996','2026-04-06 02:06:44','Pendiente',90.00),(17,NULL,'TRM-1775447131541','2026-04-06 03:45:31','Pendiente',90.00),(18,NULL,'TRM-1775447989902','2026-04-06 03:59:50','Pendiente',130.00),(19,NULL,'TRM-1775448638378','2026-04-06 04:10:38','Pendiente',130.00),(20,NULL,'TRM-1775449065453','2026-04-06 04:17:46','Pendiente',130.00),(21,NULL,'TRM-1775449393286','2026-04-06 04:23:13','Pendiente',130.00),(22,NULL,'TRM-1775449877150','2026-04-06 04:31:17','Pendiente',130.00),(23,NULL,'TRM-1775450296334','2026-04-06 04:38:16','Pendiente',340.00),(24,NULL,'TRM-1775519873074','2026-04-06 23:57:52','Pendiente',210.00),(25,NULL,'TRM-1775520722730','2026-04-07 00:12:02','Pendiente',90.00),(26,NULL,'TRM-1775521117286','2026-04-07 00:18:37','Pendiente',90.00),(27,NULL,'TRM-1775521602506','2026-04-07 00:26:42','Pendiente',90.00),(28,NULL,'TRM-1775521882181','2026-04-07 00:31:22','Pendiente',90.00),(29,NULL,'TRM-1775522066914','2026-04-07 00:34:26','Pendiente',90.00),(30,NULL,'TRM-1775522368347','2026-04-07 00:39:28','Pendiente',90.00),(31,NULL,'SOL-1775522868844','2026-04-07 00:47:48','Pendiente',80.00),(32,NULL,'SOL-1775523192744','2026-04-07 00:53:12','Pendiente',80.00),(33,NULL,'SOL-1775525548222','2026-04-07 01:32:28','Pendiente',80.00),(34,NULL,'SOL-1775525570762','2026-04-07 01:32:50','Pendiente',80.00),(35,NULL,'SOL-1775526076682','2026-04-07 01:41:16','Pendiente',80.00);
/*!40000 ALTER TABLE `solicitudes_tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solvencias`
--

DROP TABLE IF EXISTS `solvencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solvencias` (
  `id_solvencia` int NOT NULL AUTO_INCREMENT,
  `id_tramite` int DEFAULT NULL,
  `tipo` enum('Caja','Biblioteca','Laboratorio') DEFAULT NULL,
  `aprobado` tinyint(1) DEFAULT '0',
  `fecha_aprobacion` datetime DEFAULT NULL,
  `id_usuario` int DEFAULT NULL,
  PRIMARY KEY (`id_solvencia`),
  KEY `id_tramite` (`id_tramite`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `solvencias_ibfk_1` FOREIGN KEY (`id_tramite`) REFERENCES `tramites` (`id_tramite`),
  CONSTRAINT `solvencias_ibfk_2` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solvencias`
--

LOCK TABLES `solvencias` WRITE;
/*!40000 ALTER TABLE `solvencias` DISABLE KEYS */;
/*!40000 ALTER TABLE `solvencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tipos_tramite`
--

DROP TABLE IF EXISTS `tipos_tramite`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tipos_tramite` (
  `id_tipo` int NOT NULL AUTO_INCREMENT,
  `nombre_tramite` varchar(150) NOT NULL,
  `descripcion` text,
  `costo` decimal(10,2) DEFAULT NULL,
  `requisitos` text,
  PRIMARY KEY (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tipos_tramite`
--

LOCK TABLES `tipos_tramite` WRITE;
/*!40000 ALTER TABLE `tipos_tramite` DISABLE KEYS */;
INSERT INTO `tipos_tramite` VALUES (1,'Cambio de Sub Sede','Cambio de sede con convalidacion interna',90.00,NULL),(2,'Extension de Diploma','Solicitud de diploma y titulo profesional',120.00,NULL),(3,'Certificado de Calificaciones','Certificado de notas aprobadas',50.00,NULL),(4,'Cambio de Plan de Estudios','Homologacion de materias',80.00,NULL);
/*!40000 ALTER TABLE `tipos_tramite` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tramites`
--

DROP TABLE IF EXISTS `tramites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tramites` (
  `id_tramite` int NOT NULL AUTO_INCREMENT,
  `codigo_tramite` varchar(100) DEFAULT NULL,
  `id_solicitud` int DEFAULT NULL,
  `id_tipo` int DEFAULT NULL,
  `id_estado` int DEFAULT NULL,
  `id_usuario_asignado` int DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_finalizacion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_tramite`),
  UNIQUE KEY `codigo_tramite` (`codigo_tramite`),
  KEY `id_solicitud` (`id_solicitud`),
  KEY `id_tipo` (`id_tipo`),
  KEY `id_usuario_asignado` (`id_usuario_asignado`),
  KEY `idx_tramites_estado` (`id_estado`),
  CONSTRAINT `tramites_ibfk_1` FOREIGN KEY (`id_solicitud`) REFERENCES `solicitudes_tramite` (`id_solicitud`),
  CONSTRAINT `tramites_ibfk_2` FOREIGN KEY (`id_tipo`) REFERENCES `tipos_tramite` (`id_tipo`),
  CONSTRAINT `tramites_ibfk_3` FOREIGN KEY (`id_estado`) REFERENCES `estados_tramite` (`id_estado`),
  CONSTRAINT `tramites_ibfk_4` FOREIGN KEY (`id_usuario_asignado`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tramites`
--

LOCK TABLES `tramites` WRITE;
/*!40000 ALTER TABLE `tramites` DISABLE KEYS */;
INSERT INTO `tramites` VALUES (1,NULL,1,1,7,4,'2026-03-24 15:49:40',NULL),(2,NULL,2,2,1,3,'2026-03-31 10:48:06',NULL),(3,NULL,3,3,7,3,'2026-03-31 10:48:06',NULL),(4,NULL,4,1,8,3,'2026-03-31 10:48:07',NULL),(5,NULL,5,1,1,3,'2026-03-31 10:57:52',NULL),(6,NULL,6,2,1,3,'2026-03-31 10:57:53',NULL),(7,NULL,7,3,1,3,'2026-03-31 10:57:53',NULL),(8,NULL,8,4,1,3,'2026-03-31 10:57:54',NULL),(9,NULL,9,1,1,3,'2026-03-31 10:57:55',NULL),(10,NULL,10,2,1,3,'2026-03-31 10:57:55',NULL),(11,NULL,11,3,1,3,'2026-03-31 10:57:56',NULL),(12,NULL,12,4,1,3,'2026-03-31 10:57:57',NULL),(13,NULL,13,1,7,3,'2026-03-31 10:57:58',NULL),(14,NULL,14,2,7,3,'2026-03-31 10:57:58',NULL),(15,NULL,15,1,1,NULL,'2026-04-06 02:04:44',NULL),(16,NULL,15,2,1,NULL,'2026-04-06 02:04:45',NULL),(17,NULL,16,1,1,NULL,'2026-04-06 02:06:45',NULL),(18,NULL,17,1,1,NULL,'2026-04-06 03:45:33',NULL),(19,NULL,18,4,1,NULL,'2026-04-06 03:59:51',NULL),(20,NULL,18,3,1,NULL,'2026-04-06 03:59:52',NULL),(21,NULL,19,4,1,NULL,'2026-04-06 04:10:40',NULL),(22,NULL,19,3,1,NULL,'2026-04-06 04:10:41',NULL),(23,NULL,20,4,1,NULL,'2026-04-06 04:17:48',NULL),(24,NULL,20,3,1,NULL,'2026-04-06 04:17:48',NULL),(25,NULL,21,4,1,NULL,'2026-04-06 04:23:16',NULL),(26,NULL,21,3,1,NULL,'2026-04-06 04:23:17',NULL),(27,NULL,22,4,1,NULL,'2026-04-06 04:31:18',NULL),(28,NULL,22,3,1,NULL,'2026-04-06 04:31:19',NULL),(29,NULL,23,1,1,NULL,'2026-04-06 04:38:18',NULL),(30,NULL,23,2,1,NULL,'2026-04-06 04:38:18',NULL),(31,NULL,23,4,1,NULL,'2026-04-06 04:38:19',NULL),(32,NULL,23,3,1,NULL,'2026-04-06 04:38:20',NULL),(33,NULL,24,1,1,NULL,'2026-04-06 23:57:54',NULL),(34,NULL,24,2,1,NULL,'2026-04-06 23:57:55',NULL),(35,NULL,25,1,1,NULL,'2026-04-07 00:12:05',NULL),(36,NULL,26,1,1,NULL,'2026-04-07 00:18:38',NULL),(37,NULL,27,1,1,NULL,'2026-04-07 00:26:43',NULL),(38,NULL,28,1,5,NULL,'2026-04-07 00:31:23',NULL),(39,NULL,29,1,5,NULL,'2026-04-07 00:34:28',NULL),(40,NULL,30,1,1,NULL,'2026-04-07 00:39:30',NULL),(41,NULL,31,4,5,NULL,'2026-04-07 00:47:50',NULL),(42,NULL,32,4,5,NULL,'2026-04-07 00:53:14',NULL),(43,'TRM-1775526078124-C4P4G9BPI',35,4,5,NULL,'2026-04-07 01:41:18',NULL);
/*!40000 ALTER TABLE `tramites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `correo` varchar(100) DEFAULT NULL,
  `ci` varchar(20) DEFAULT NULL,
  `id_rol` int DEFAULT NULL,
  `estado` tinyint(1) DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `correo` (`correo`),
  KEY `id_rol` (`id_rol`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'leandro.est','123456','Leandro Estudiante','leandro@univalle.edu','1234567',1,1,'2026-03-24 15:49:39'),(2,'caja.admin','123456','Responsable de Caja','caja@univalle.edu','2222222',2,1,'2026-03-24 15:49:39'),(3,'biblio.admin','123456','Encargado Biblioteca','biblio@univalle.edu','3333333',3,1,'2026-03-24 15:49:39'),(4,'dir.carrera','123456','Director de Carrera','director@univalle.edu','4444444',5,1,'2026-03-24 15:49:39'),(9,'est2','123456','Ana Torres','ana@uni.com',NULL,1,1,'2026-03-31 10:48:05'),(10,'est3','123456','Luis Mendoza','luis@uni.com',NULL,1,1,'2026-03-31 10:48:06'),(11,'est4','123456','Carla Rojas','carla@uni.com',NULL,1,1,'2026-03-31 10:48:07'),(12,'est5','123456','Pedro Gómez','pedro@uni.com',NULL,1,1,'2026-03-31 10:57:51'),(13,'est6','123456','Lucía Vargas','lucia@uni.com','',1,1,'2026-03-31 10:57:52'),(14,'est7','123456','Diego Flores','diego@uni.com','',1,1,'2026-03-31 10:57:53'),(15,'est8','123456','María Castro','maria.c@uni.com','',1,1,'2026-03-31 10:57:53'),(16,'est9','123456','Andrés Ríos','andres@uni.com','',1,1,'2026-03-31 10:57:54'),(17,'est10','123456','Valeria Núñez','valeria@uni.com','',1,1,'2026-03-31 10:57:55'),(18,'est11','123456','Jorge Salinas','jorge@uni.com','',1,1,'2026-03-31 10:57:56'),(19,'est12','123456','Camila Ortiz','camila@uni.com','',1,1,'2026-03-31 10:57:56'),(20,'est13','123456','Fernando Peña','fernando@uni.com','',1,1,'2026-03-31 10:57:57'),(21,'est14','123456','Sofía Herrera','sofia@uni.com','',1,1,'2026-03-31 10:57:58');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-06 21:52:29
