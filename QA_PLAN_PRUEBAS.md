# PLAN DE PRUEBAS DE QA
## Sistema de Gestión de Trámites Universitarios - Universidad del Valle

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Activo  
**Aplicación:** App-Tramites-UV  

---

## 1. Introducción

### 1.1 Propósito del Documento
Este documento define la estrategia integral de pruebas para el Sistema de Gestión de Trámites Universitarios (App-Tramites-UV), un aplicativo web desarrollado en Next.js 16.2.0 que gestiona solicitudes de trámites académicos, facturación y aprobaciones de documentos en la Universidad del Valle.

### 1.2 Alcance General
Este plan cubre todas las pruebas necesarias para validar la funcionalidad, confiabilidad, rendimiento y seguridad del sistema antes de su despliegue a producción.

### 1.3 Descripción General del Sistema
**Tech Stack:**
- **Frontend:** Next.js 16.2.0 (React), TypeScript, Tailwind CSS
- **Backend:** Node.js con App Router de Next.js
- **Base de Datos:** MySQL 8.0 (Aiven Cloud)
- **Autenticación:** JWT + Cookies
- **Almacenamiento de Archivos:** Sistema de archivos local (/public/uploads)

**Módulos Principales:**
- **Módulo Usuario:** Solicitud de trámites, historial, descargas de documentos
- **Módulo Cajero:** Procesamiento de pagos, facturación
- **Módulo Bibliotecario:** Revisión de solicitudes, aprobación de documentos
- **Módulo Admin:** Gestión global del sistema

---

## 2. Alcance de las Pruebas

### 2.1 Backend
| Componente | Cobertura |
|-----------|-----------|
| **Autenticación (API)** | 100% - Verificación de tokens, sesiones, logout |
| **Gestión de Trámites (API)** | 100% - CRUD de solicitudes, listados, filtrados |
| **Gestión de Documentos (API)** | 100% - Upload, download, validación de tipos |
| **Procesamiento de Pagos (API)** | 100% - Crear solicitud con factura, comprobante |
| **Historial y Reportes (API)** | 90% - Listados, filtrados, ordenamiento |
| **Validaciones Backend** | 100% - Integridad de datos, reglas de negocio |
| **Seguridad (Autenticación/Autorización)** | 100% - Control de acceso por roles |
| **Base de Datos** | 100% - Integridad referencial, constraints |
| **Manejo de Archivos** | 100% - Upload, almacenamiento, descarga |

### 2.2 Frontend
| Componente | Cobertura |
|-----------|-----------|
| **Landing Pages** | 100% - Accesibilidad, responsive, navegación |
| **Formularios** | 100% - Validación, envío, errores |
| **Carrito de Compras** | 100% - Agregar, eliminar, vaciar, persistencia |
| **Autenticación UI** | 100% - Login, registro, logout |
| **Selección de Trámites** | 100% - Búsqueda, filtrado, ordenamiento |
| **Historial de Trámites** | 100% - Visualización, filtrado, estado |
| **Consulta de Detalles** | 100% - Estado timeline, documentos, acciones |
| **Descargas de Archivos** | 100% - Vista previa, descargar, imprimir |
| **Componentes Reutilizables** | 90% - Modales, botones, formularios |
| **Manejo de Errores UI** | 90% - Mensajes, recuperación, UX |

---

## 3. Fuera de Alcance

- **Pruebas de compatibilidad con navegadores antiguos** (IE 11 y anteriores)
- **Pruebas en dispositivos móviles específicos** (cubierto por responsive design)
- **Análisis de accesibilidad avanzada** (WCAG 2.1 AA completo)
- **Pruebas de carga masiva** (>10,000 usuarios concurrentes)
- **Migración de datos desde sistemas legados**
- **Componentes third-party certificación completa**
- **Pruebas de penetración avanzada** (excepto inyecciones SQL y XSS básicas)
- **Modificaciones de infraestructura de base de datos**

---

## 4. Objetivos y Metas de las Pruebas

### 4.1 Objetivos Generales
1. **Validar funcionalidad:** Verificar que todas las características documentadas funcionan como se espera
2. **Garantizar confiabilidad:** Asegurar que el sistema es estable y recuperable ante errores
3. **Verificar seguridad:** Confirmar que los datos están protegidos y el acceso es controlado
4. **Validar rendimiento:** Asegurar que el sistema responde en tiempos aceptables
5. **Identificar defectos:** Detectar bugs antes de producción
6. **Documentar calidad:** Generar evidencia de cumplimiento de requisitos

### 4.2 Metas de Pruebas
| Métrica | Meta |
|---------|------|
| **Cobertura de Código (Backend)** | ≥ 80% |
| **Cobertura de Casos de Prueba** | ≥ 90% de requisitos |
| **Defectos Críticos Encontrados** | Todos deben ser resueltos |
| **Defectos Altos Encontrados** | ≥ 95% resueltos antes de Release |
| **Tiempo de Respuesta API (p95)** | < 500ms |
| **Disponibilidad del Sistema** | ≥ 99% en entorno de pruebas |
| **Tasa de Éxito de Pruebas Automated** | ≥ 95% |

---

## 5. Estrategia y Enfoque de las Pruebas

### 5.1 Estrategia General
Se utilizará un enfoque **en cascada con iteraciones**, donde:
1. **Fase 1:** Pruebas Unitarias durante desarrollo
2. **Fase 2:** Pruebas de Integración después de módulo completado
3. **Fase 3:** Pruebas de Sistema en ambiente integrado
4. **Fase 4:** Pruebas de Aceptación y Seguridad
5. **Fase 5:** Pruebas de Regresión antes de release

### 5.2 Niveles de Severidad de Defectos
| Nivel | Descripción | Ejemplo | Criterio Release |
|-------|-------------|---------|------------------|
| **CRÍTICO** | Bloquea funcionalidad core | Login no funciona, datos corruptos | Must Fix |
| **ALTO** | Feature importante no funciona | Descarga de archivo falla | Must Fix |
| **MEDIO** | Feature parcialmente funcional | Validación incompleta | Should Fix |
| **BAJO** | Defecto menor, UI/UX | Espaciado de botón incorrecto | Nice to Fix |

### 5.3 Criterios de Aceptación de Pruebas
- ✅ 100% de casos críticos pasando
- ✅ ≥95% de casos altos pasando
- ✅ ≥90% de casos medios pasando
- ✅ No hay defectos críticos sin resolver
- ✅ Performance dentro de límites aceptables
- ✅ Seguridad validada (OWASP Top 10)

---

## 6. Pruebas Unitarias

### 6.1 Objetivo
Validar que funciones, métodos y componentes individuales funcionan correctamente de forma aislada.

### 6.2 Alcance
- **Funciones de validación** (email, teléfono, documento)
- **Funciones de utilidad** (formateo, cálculos)
- **Componentes React** (sin dependencias externas)
- **Reducers y hooks personalizados**
- **Funciones de base de datos** (queries parametrizadas)

### 6.3 Herramientas
- **Backend:** Node.js testing (Jest, Mocha)
- **Frontend:** Jest + React Testing Library
- **Cobertura:** Istanbul/nyc

### 6.4 Casos de Prueba Unitarios Mínimos

**Backend (Node.js/Next.js API):**
- [ ] Validación de email válido/inválido
- [ ] Validación de formato de documento (C.I., NIT)
- [ ] Validación de teléfono
- [ ] Cálculo de costos de trámite
- [ ] Formateo de fechas
- [ ] Hash de contraseña
- [ ] Generación de código de trámite único

**Frontend (React/TypeScript):**
- [ ] Hook useCarrito: agregar, eliminar, vaciar
- [ ] Hook useAuth: login, logout, refresh
- [ ] Componente LoginForm: validación de inputs
- [ ] Componente DashboardCards: renderización correcta
- [ ] Formateo de moneda en componentes

### 6.5 Métrica de Aceptación
- **Cobertura de código:** ≥ 80%
- **Tasa de éxito:** ≥ 95%

### 6.6 Ejecución
**Responsable:** Desarrollador  
**Frecuencia:** Cada commit  
**Automatización:** CI/CD pipeline  

---

## 7. Pruebas de Integración

### 7.1 Objetivo
Validar que módulos y componentes interactúan correctamente entre sí.

### 7.2 Alcance
- **Flujo de autenticación:** Login → Sesión → Acceso a módulos protegidos
- **Flujo de solicitud:** Seleccionar trámites → Carrito → Formulario → Pago → Confirmación
- **Flujo de descarga:** Solicitud → Documento → Download
- **Integración BD:** Queries → Transacciones → Triggers
- **Integración API-Frontend:** Requests → Responses → UI Update

### 7.3 Herramientas
- **Postman/Thunder Client:** Testing de APIs
- **Selenium/Playwright:** Testing de flujos completos
- **Docker Compose:** BD y servicios de prueba

### 7.4 Casos de Prueba de Integración

**Flujos Críticos:**
- [ ] Usuario login → Carrito visible → Agregar trámite → Carrito actualizado
- [ ] Completar formulario → Submit → BD insertado → Confirmación mostrada
- [ ] Subir documentos → Validación → Almacenamiento → Listado actualizado
- [ ] Crear solicitud → Factura → Download → Archivo recibido
- [ ] Logout → Sesión destruida → Redirigir a login

**Integraciones de Base de Datos:**
- [ ] Insertar usuario → Verificar constraints
- [ ] Insertar solicitud → Cascada de actualizaciones
- [ ] Actualizar estado → Histórico correctamente registrado

### 7.5 Métrica de Aceptación
- **Cobertura de flujos críticos:** 100%
- **Tasa de éxito:** ≥ 95%

### 7.6 Ejecución
**Responsable:** QA + Desarrollador  
**Frecuencia:** Diaria  
**Ambiente:** Staging  

---

## 8. Pruebas de Sistema

### 8.1 Objetivo
Validar el sistema completo integrado en un ambiente similar a producción.

### 8.2 Alcance
- **Todos los módulos integrados** (Usuario, Cajero, Bibliotecario)
- **Todos los endpoints API**
- **Base de datos con datos reales**
- **Flujos end-to-end**
- **Manejo de errores y excepciones**
- **Recuperación ante fallos**

### 8.3 Casos de Prueba de Sistema

**Módulo Usuario (56 casos cubiertos en QA_USUARIO_REQUERIMIENTOS.md):**
- [ ] TC-USR-001 a TC-USR-021: Funcionalidad completa
- [ ] TC-USR-022 a TC-USR-035: Casos negativos y errores
- [ ] TC-USR-036 a TC-USR-056: Edge cases y performance

**Módulo Cajero (Pendiente documentación):**
- [ ] Listar solicitudes pendientes de pago
- [ ] Marcar como pagado
- [ ] Generar reportes de ingresos
- [ ] Filtrar por fecha, usuario, estado

**Módulo Bibliotecario (Pendiente documentación):**
- [ ] Listar solicitudes para revisar
- [ ] Verificar documentos
- [ ] Aprobar/Rechazar solicitudes
- [ ] Agregar comentarios

**Módulo Admin (Pendiente documentación):**
- [ ] Gestión de usuarios
- [ ] Gestión de trámites
- [ ] Reportes globales
- [ ] Configuración del sistema

### 8.4 Entorno de Pruebas
- **Base de datos:** MySQL en Aiven Cloud (DB de pruebas)
- **Servidor:** localhost:3000
- **Datos:** Dataset de prueba completo (ver Sección 14)

### 8.5 Métrica de Aceptación
- **Tasa de éxito:** ≥ 95%
- **Defectos críticos:** 0
- **Defectos altos:** ≤ 5

### 8.6 Ejecución
**Responsable:** QA Lead  
**Duración:** 2 semanas  
**Frecuencia:** 1 vez por ciclo  

---

## 9. Pruebas de Aceptación

### 9.1 Objetivo
Validar que el sistema cumple con los requisitos del negocio y satisface las necesidades del usuario.

### 9.2 Alcance
- **Requisitos funcionales de negocio**
- **Requisitos de usuario**
- **Criterios de aceptación del cliente**
- **Procesos de negocio**

### 9.3 Escenarios de Aceptación

**Escenario 1: Estudiante solicita certificado de matrícula**
1. Estudiante ingresa al sistema
2. Selecciona "Certificado de Matrícula" del catálogo
3. Agrupa en carrito
4. Completa formulario con datos personales
5. Carga comprobante de pago
6. Sistema genera solicitud
7. Bibliotecaria revisa y aprueba
8. Sistema genera documento PDF
9. Estudiante descarga certificado

**Escenario 2: Cajero procesa pagos pendientes**
1. Cajero accede a módulo de Cajero
2. Ve lista de solicitudes con estado "Pago Pendiente"
3. Verifica comprobante de pago
4. Marca como pagado
5. Sistema actualiza estado
6. Sistema notifica a otros módulos

**Escenario 3: Flujo completo de error y recuperación**
1. Usuario intenta subir documento inválido
2. Sistema muestra error específico
3. Usuario corrige y reintenta
4. Sistema acepta documento

### 9.4 Actores
- **Estudiante/Usuario**
- **Cajero/Tesorero**
- **Bibliotecario**
- **Administrador**

### 9.5 Criterios de Aceptación
- ✅ Todos los escenarios ejecutados exitosamente
- ✅ Usuario puede completar flujo sin fricción
- ✅ Mensajes de error claros y útiles
- ✅ Documentos se generan correctamente

### 9.6 Ejecución
**Responsable:** QA + Product Owner  
**Participantes:** Usuarios reales o representantes  
**Duración:** 1 semana  

---

## 10. Pruebas de Rendimiento

### 10.1 Objetivo
Validar que el sistema responde dentro de tiempos aceptables bajo carga normal y máxima.

### 10.2 Métricas de Rendimiento

| Endpoint/Acción | Tiempo Aceptable (p95) | Carga Normal |
|---|---|---|
| **GET /api/tramites** | < 200ms | ≤ 100 req/s |
| **GET /api/usuario/historial** | < 300ms | ≤ 50 req/s |
| **POST /api/usuario/procesar-solicitud** | < 1000ms | ≤ 10 req/s |
| **GET /api/usuario/descargar-documento-factura** | < 500ms | ≤ 20 req/s |
| **Page Load (Landing)** | < 2s | N/A |
| **Page Load (Dashboard)** | < 3s | N/A |
| **Form Submit** | < 2s | ≤ 5 req/s |

### 10.3 Herramientas
- **Load Testing:** Apache JMeter, k6
- **Monitoring:** New Relic, DataDog (si disponible)
- **Profiling:** Chrome DevTools, Node.js profiler

### 10.4 Escenarios de Prueba

**Carga Normal:**
- 50 usuarios concurrentes
- Navegación normal por el sistema
- Duración: 15 minutos

**Carga Pico:**
- 200 usuarios concurrentes
- Múltiples usuarios descargando archivos
- Múltiples usuarios subiendo documentos
- Duración: 10 minutos

**Stress Test:**
- 500 usuarios concurrentes
- Hasta punto de quiebre
- Identificar límite máximo

### 10.5 Criterios de Aceptación
- ✅ Tiempos de respuesta dentro de especificación
- ✅ Tasa de error < 1% bajo carga normal
- ✅ Tasa de error < 5% bajo carga pico
- ✅ Sistema recupera después de stress test

### 10.6 Ejecución
**Responsable:** Performance Engineer  
**Duración:** 3 días  
**Ambiente:** Staging con BD de prueba  

---

## 11. Pruebas de Regresión

### 11.1 Objetivo
Validar que cambios recientes no han roto funcionalidad existente.

### 11.2 Alcance
- **Todos los módulos cuando hay cambios**
- **Endpoints API modificados y relacionados**
- **Flujos que dependen de código modificado**
- **Validaciones y reglas de negocio**

### 11.3 Suite de Regresión Automatizada

**Smoke Tests (Rápidos, críticos):**
- [ ] Login funciona
- [ ] Carrito funciona
- [ ] Descargar archivos funciona
- [ ] Historial muestra datos
- [ ] Crear solicitud funciona

**Suite Completa (Exhaustiva):**
- Todos los 56 casos de usuario
- Todos los casos de cajero
- Todos los casos de bibliotecario
- Integración completa

### 11.4 Estrategia de Ejecución
1. **Pre-cambio:** Ejecución baseline
2. **Post-cambio:** Ejecución de suite
3. **Comparación:** Identificar regresiones
4. **Análisis:** Determinar causa y fix

### 11.5 Herramientas
- **Automated Testing:** Selenium, Playwright
- **API Testing:** Postman, Thunder Client
- **Orquestación:** GitHub Actions, Jenkins

### 11.6 Frecuencia
- **Después de cada merge a develop:** Smoke tests (15 min)
- **Antes de release:** Suite completa (2 horas)
- **Nightly (opcional):** Suite completa

---

## 12. Pruebas de Seguridad

### 12.1 Objetivo
Validar que el sistema protege datos sensibles y controla el acceso de usuarios.

### 12.2 Alcance

| Área | Validaciones |
|------|--------------|
| **Autenticación** | Tokens válidos, expiración, refresh |
| **Autorización** | Control de acceso por rol, datos separados |
| **Inyección SQL** | Queries parametrizadas, escape de inputs |
| **XSS** | Sanitización de salidas, CSP headers |
| **CSRF** | Tokens CSRF en forms |
| **Manejo de Archivos** | Validación de tipo, nombre seguro, ruta segura |
| **Datos Sensibles** | Encriptación de contraseñas, PII en tránsito |
| **Sesiones** | Timeout, logout, invalidación |

### 12.3 Casos de Prueba de Seguridad

**Autenticación & Autorización:**
- [ ] SEC-001: Usuarios sin login no acceden a rutas protegidas
- [ ] SEC-002: Token expirado redirige a login
- [ ] SEC-003: Usuario A no ve datos de Usuario B
- [ ] SEC-004: Cajero no accede a módulo Bibliotecario
- [ ] SEC-005: Admin puede acceder a todos los módulos

**Inyección SQL:**
- [ ] SEC-006: Query "SELECT * FROM usuarios WHERE id=1; DROP TABLE usuarios;" no ejecuta
- [ ] SEC-007: Caracteres especiales en búsqueda se escapan
- [ ] SEC-008: Inyección en documento no corrompe BD

**XSS (Cross-Site Scripting):**
- [ ] SEC-009: Script en campo de nombre no se ejecuta
- [ ] SEC-010: HTML malicioso en comentarios se escapa
- [ ] SEC-011: Archivo con script en nombre no ejecuta

**File Upload:**
- [ ] SEC-012: Upload de .exe bloqueado
- [ ] SEC-013: Nombre de archivo sanitizado (sin path traversal)
- [ ] SEC-014: Upload excesivamente grande rechazado

**Encriptación:**
- [ ] SEC-015: Contraseña almacenada en BD es hash (no plain text)
- [ ] SEC-016: Cookies de sesión tienen flag Secure + HttpOnly

### 12.4 Herramientas
- **OWASP ZAP:** Scanning automatizado
- **Burp Suite Community:** Manual testing
- **npm audit:** Vulnerabilidades de dependencias
- **Snyk:** Monitoreo de vulnerabilidades

### 12.5 Críticos de Seguridad
- ✅ 100% de pruebas de autenticación deben pasar
- ✅ 0 inyecciones SQL exitosas
- ✅ 0 XSS exitosos
- ✅ npm audit sin vulnerabilidades críticas
- ✅ No hay PII expuesta en logs o respuestas

### 12.6 Ejecución
**Responsable:** Security QA Engineer  
**Frecuencia:** Pre-release + Trimestral  
**Duración:** 1 semana  

---

## 13. Recursos y Roles del Equipo

### 13.1 Roles y Responsabilidades

| Rol | Responsabilidades | Skills |
|-----|-------------------|--------|
| **QA Lead** | Planificación, coordinación, reportes | Testing, project mgmt |
| **QA Engineer (Manual)** | Casos de prueba, ejecución manual | Domain knowledge, testing |
| **QA Automation Engineer** | Scripts automatizados, CI/CD | Selenium, Node.js, Postman |
| **Performance Tester** | Load testing, análisis | JMeter, k6, profiling |
| **Security Tester** | Pruebas de seguridad, OWASP | Security, penetration testing |
| **Developer** | Unit tests, code review | Backend, frontend dev |
| **DevOps** | Entorno, pipeline, despliegue | Infrastructure, CI/CD |
| **Product Owner** | Requisitos, aceptación | Business logic |

### 13.2 Equipo Sugerido (Configuración Actual)

| Rol | Persona | Disponibilidad |
|-----|---------|---|
| QA Lead | TBD | 100% |
| QA Manual (Usuario/Cajero/Bibliotecario) | TBD | 100% |
| QA Automation | TBD | 75% |
| Developer | TANI | 50% (testing) |
| Product Owner | TBD | 25% |

### 13.3 Comunicación del Equipo
- **Daily Standup:** 15 min (status, blockers)
- **Weekly Sync:** 1 hora (planificación, results)
- **Defect Review:** Según necesidad (critical items)

---

## 14. Configuración del Entorno de Pruebas

### 14.1 Ambientes de Pruebas

| Ambiente | Propósito | DB | Datos | Acceso |
|----------|-----------|----|----|--------|
| **Local Dev** | Desarrollo + Unit tests | Local MySQL | Minimal | Desarrollador |
| **Integration** | Pruebas de integración | MySQL test | Parcial | QA + Dev |
| **Staging** | Sistema completo integrado | MySQL staging | Completo | QA + Dev |
| **Production** | Sistema en vivo | MySQL prod | Real | Usuarios reales |

### 14.2 Especificaciones del Ambiente Staging

**Servidor:**
- Node.js 18+
- Next.js 16.2.0
- puerto 3000
- Variación de producción (<5%)

**Base de Datos:**
- MySQL 8.0
- Host: mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com:11597
- DB: tramites_univalle_test
- Backup diario

**Datos de Prueba:**
```sql
-- Usuarios de Prueba
INSERT INTO usuarios (correo, nombre, carrera, ci_rut, estado) VALUES
('estudiante@univalle.edu.co', 'Juan Pérez', 'Ingeniería Sistemas', '1234567890', 1),
('cajero@univalle.edu.co', 'María López', NULL, '0987654321', 1),
('bibliotecario@univalle.edu.co', 'Carlos García', NULL, '1122334455', 1),
('admin@univalle.edu.co', 'Admin User', NULL, '5544332211', 1);

-- Trámites
INSERT INTO tramites (nombre, descripcion, costo, requisitos) VALUES
('Certificado de Matrícula', 'Certificado oficial de matrícula vigente', 15000, 'Cédula, Comprobante de pago'),
('Constancia de Inscripción', 'Constancia de inscripción actual', 10000, 'Cédula, Comprobante de pago'),
('Diploma', 'Diploma académico', 50000, 'Cédula, Comprobante de pago');

-- Tipos de Documento
INSERT INTO tipos_archivo (nombre, extension_permitida) VALUES
('Cédula', 'pdf,jpg,png'),
('Comprobante de Pago', 'pdf,jpg,png');
```

### 14.3 Herramientas Disponibles

**Testing:**
- Postman/Thunder Client (API)
- Chrome DevTools (Frontend)
- Jest (Unit tests)

**Monitoring:**
- Console logs
- Network tab
- Local storage inspector

**Database:**
- MySQL Workbench (local)
- phpMyAdmin (si disponible)

---

## 15. Evaluación de Riesgos y Planes de Mitigación

### 15.1 Matriz de Riesgos

| # | Riesgo | Probabilidad | Impacto | Severidad | Mitigación |
|---|--------|---|---|---|---|
| **R1** | Base de datos se corrompe durante testing | Baja | Alto | ALTO | Backups diarios, environment separado |
| **R2** | No hay acceso a BD de pruebas | Media | Alto | ALTO | Crear BD local alternativa, documentar acceso |
| **R3** | Requisitos cambian a mitad del testing | Media | Medio | MEDIO | Change control process, re-planning |
| **R4** | Defectos críticos encontrados tarde | Baja | Alto | ALTO | Pruebas tempranas (unit + integration) |
| **R5** | Recursos QA no disponibles | Baja | Medio | MEDIO | Cross-training, documentación detallada |
| **R6** | Performance no cumple requisitos | Media | Alto | ALTO | Load testing temprano, optimization plan |
| **R7** | Vulnerabilidades de seguridad encontradas | Media | Crítico | CRÍTICO | Pruebas de seguridad desde inicio |
| **R8** | Falso positivos en tests automatizados | Media | Bajo | BAJO | Mantenimiento regular, investigación |

### 15.2 Planes de Mitigación Específicos

**R1: Corrupción de Base de Datos**
- Acción: Crear copia separada de BD para testing
- Responsable: DevOps
- Plazo: Antes de Phase 1

**R2: Acceso a BD de Pruebas**
- Acción: Crear credentials de testing, documentar en .env.test
- Responsable: DevOps
- Plazo: Antes de Phase 1

**R4: Defectos Críticos Tarde**
- Acción: Unit tests + Integration tests en early phases
- Responsable: Desarrolladores
- Plazo: Continuo

**R6: Performance**
- Acción: Load testing en week 2, optimizations en week 3-4
- Responsable: Performance Engineer
- Plazo: See schedule section

**R7: Seguridad**
- Acción: OWASP ZAP scan en week 1, manual testing en week 2
- Responsable: Security QA
- Plazo: See schedule section

---

## 16. Cronograma de Pruebas

### 16.1 Timeline General (4 Semanas)

```
Week 1: Setup + Pruebas Unitarias + Seguridad
├── Days 1-2: Configuración de ambientes
├── Days 2-5: Pruebas unitarias (desarrolladores)
├── Days 3-5: OWASP scanning (security)
└── Day 5: Review de defectos

Week 2: Integración + Performance
├── Days 1-3: Pruebas de integración (manual + API)
├── Days 3-4: Load testing (carga normal)
├── Day 5: Performance optimization
└── Day 5: Review de defectos

Week 3: Sistema + Regresión
├── Days 1-3: Pruebas de sistema completo (56 casos usuario)
├── Days 2-4: Generación de casos para Cajero + Bibliotecario
├── Days 4-5: Pruebas de regresión automatizadas
└── Day 5: Review de defectos

Week 4: Aceptación + Final
├── Days 1-2: Pruebas de aceptación (user/product owner)
├── Days 2-3: Casos para Cajero + Bibliotecario (ejecución)
├── Days 3-4: Final regression + smoke tests
├── Day 4: Sign-off review
└── Day 5: Go/No-Go decision
```

### 16.2 Hitos Críticos

| Fecha | Hito | Propósito |
|-------|------|----------|
| **Week 1 - Day 5** | Unit Tests Complete | Validar funciones base |
| **Week 2 - Day 3** | Integration Tests Complete | Flujos funcionan |
| **Week 2 - Day 4** | Performance Baseline | Tiempos aceptables |
| **Week 3 - Day 3** | System Tests Complete | Todo integrado funciona |
| **Week 3 - Day 5** | All Defects High Logged | Visibilidad total |
| **Week 4 - Day 2** | UAT Complete | Usuario confirma |
| **Week 4 - Day 5** | Go/No-Go Decision | Release vs. Hold |

### 16.3 Actividades Detalladas

**Semana 1: Setup**

| Día | Actividad | Responsable | Duración |
|-----|-----------|-------------|----------|
| 1 | Setup DB staging | DevOps | 2h |
| 1 | Setup test data | QA | 1h |
| 1 | Crear test environment | DevOps | 1h |
| 2 | Documentar test cases usuario | QA Lead | 2h |
| 2 | Ejecutar unit tests | Dev | 4h |
| 3-4 | OWASP ZAP scanning | Security | 6h |
| 5 | Defect triage | QA Lead | 2h |

**Semana 2: Integración**

| Día | Actividad | Responsable | Duración |
|-----|-----------|-------------|----------|
| 1-2 | Pruebas integración flujos | QA Manual | 8h |
| 2-3 | API testing (Postman) | QA Auto | 6h |
| 3 | Setup load testing | Performance | 2h |
| 3-4 | Ejecutar carga normal + pico | Performance | 6h |
| 5 | Análisis + optimization | Dev + Performance | 2h |

**Semana 3: Sistema**

| Día | Actividad | Responsable | Duración |
|-----|-----------|-------------|----------|
| 1-3 | Pruebas sistema (56 casos) | QA Manual | 12h |
| 2-3 | Generación casos Cajero | QA Lead | 4h |
| 3-4 | Generación casos Bibliotecario | QA Lead | 4h |
| 4-5 | Regression automated tests | QA Auto | 6h |
| 5 | Defect consolidation | QA Lead | 2h |

**Semana 4: Aceptación**

| Día | Actividad | Responsable | Duración |
|-----|-----------|-------------|----------|
| 1-2 | UAT (usuarios reales) | QA + Users | 6h |
| 2-3 | Ejecución casos Cajero | QA Manual | 6h |
| 3-4 | Ejecución casos Bibliotecario | QA Manual | 6h |
| 4 | Final smoke tests + regression | QA Auto | 3h |
| 5 | Go/No-Go review | QA Lead + PO | 2h |

---

## 17. Criterios de Suspensión y Reanudación

### 17.1 Criterios de Suspensión de Pruebas

Las pruebas se **suspenderán** si:

1. **Defecto Crítico No Resuelto:**
   - Sistema completamente inestable
   - No se puede acceder a funcionalidad core
   - Base de datos corrompida
   - Ejemplo: Login completamente quebrado

2. **Dependencias No Disponibles:**
   - BD de staging no accesible
   - Servidor de pruebas caído > 30 min
   - Credenciales de acceso perdidas
   - Datos de prueba incompletos

3. **Cambios Significativos en Requisitos:**
   - Cambios funcionales que afecten >20% de test cases
   - Nuevas áreas de funcionalidad agregadas
   - Cambios en flujos críticos

4. **Recursos Críticos No Disponibles:**
   - QA Lead no disponible (> 3 días)
   - Ambiente de staging destruido
   - Backups no funcionales

### 17.2 Impacto de Suspensión

| Escenario | Decisión | Documentación |
|-----------|----------|---|
| Defecto crítico | Suspender, Comunicar a Dev | Ticket + email |
| BD no accesible | Suspender, Migrar a local | Plan de recuperación |
| Requisitos cambian | Pausar, Reunión de replanning | Updated plan |

### 17.3 Criterios de Reanudación

Las pruebas se **reanudarán** cuando:

1. **Defecto Crítico:** Resuelto y re-validado por QA
   - Proof: Ticket cerrado + test pasando
   - Plazo: < 24 horas después de fix

2. **Dependencias:** Restauradas y validadas
   - Proof: Conexión exitosa, datos presentes
   - Plazo: < 4 horas después de restauración

3. **Requisitos:** Replanning completado y aprobado
   - Proof: Updated test plan, sign-off de Product Owner
   - Plazo: < 2 días después de notificación

4. **Recursos:** Disponibles nuevamente
   - Proof: Resource availability confirmation
   - Plazo: Flexible según disponibilidad

### 17.4 Proceso de Reanudación

```
1. Validar que criterio de reanudación se cumple
2. Re-ejecutar smoke tests (15 min)
3. Documentar causa de suspensión y resolución
4. Update timeline si es necesario
5. Comunicar al equipo (email + standup)
6. Continuar con pruebas planeadas
```

### 17.5 Documentación

| Evento | Documento | Contenido |
|--------|-----------|----------|
| Suspensión | SUSPENSION_LOG.md | Fecha, causa, criterios |
| Reanudación | RESUMPTION_LOG.md | Fecha, resolución, impacto |
| Cambios | CHANGE_LOG.md | Qué cambió, impacto en testing |

---

## 18. Aprobaciones

### 18.1 Firmas de Aprobación

**Este plan requiere aprobación de:**

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| **QA Lead** | _________________ | __________ | _______ |
| **Product Owner** | _________________ | __________ | _______ |
| **Tech Lead / Architect** | _________________ | __________ | _______ |
| **Project Manager** | _________________ | __________ | _______ |
| **DevOps/Infrastructure** | _________________ | __________ | _______ |

### 18.2 Criterios de Aprobación

- ✅ Plan cubre todos los módulos principales
- ✅ Roles y responsabilidades claros
- ✅ Timeline es realista
- ✅ Recursos están disponibles
- ✅ Ambientes configurados
- ✅ Datos de prueba preparados

### 18.3 Control de Cambios

| Versión | Fecha | Cambios | Aprobado |
|---------|-------|---------|----------|
| 1.0 | Jun 2026 | Versión inicial | - |
| 1.1 | _______ | _________________ | - |
| 1.2 | _______ | _________________ | - |

### 18.4 Documentos Relacionados

- **QA_USUARIO_REQUERIMIENTOS.md** - Casos de prueba para módulo usuario (56 casos)
- **QA_CAJERO_REQUERIMIENTOS.md** - [Pendiente] Casos de prueba módulo cajero
- **QA_BIBLIOTECARIO_REQUERIMIENTOS.md** - [Pendiente] Casos de prueba módulo bibliotecario
- **DEFECT_TRACKING.md** - [Durante testing] Log de defectos encontrados
- **TEST_RESULTS.md** - [Post-testing] Resultados finales

### 18.5 Contactos Clave

- **QA Lead:** [email/phone]
- **Product Owner:** [email/phone]
- **Tech Lead:** [email/phone]
- **DevOps:** [email/phone]
- **Development Team:** [email/phone]

### 18.6 Notas Finales

Este plan de pruebas es un documento vivo que será actualizado según:
- Cambios en requisitos
- Lecciones aprendidas
- Cambios en recursos
- Evolución del sistema

**Próximo Review:** Después de Week 1 de ejecución

**Documento Preparado Por:** QA Team  
**Última Actualización:** Junio 2026  
**Aprobación Inicial Requerida Antes:** [Fecha]

---

## Anexos

### Anexo A: Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Caso de Prueba** | Conjunto específico de inputs, precondiciones y resultado esperado |
| **Test Suite** | Colección de casos de prueba relacionados |
| **Smoke Test** | Pruebas rápidas de funcionalidad crítica |
| **Regression Test** | Pruebas para validar que cambios no rompieron funcionalidad |
| **UAT** | User Acceptance Testing - Pruebas por usuario final |
| **Defect** | Discrepancia entre comportamiento actual y esperado |
| **Severity** | Impacto del defecto (Crítico, Alto, Medio, Bajo) |
| **Priority** | Urgencia de resolución (Critical, High, Medium, Low) |

### Anexo B: Referencias Externas

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **HTTP Status Codes:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
- **MySQL Documentation:** https://dev.mysql.com/doc/
- **Next.js Documentation:** https://nextjs.org/docs
- **Testing Best Practices:** https://testingjavascript.com/

### Anexo C: Plantillas

**Template: Defect Report**
```
ID: DEF-XXX
Título: [Breve descripción]
Severidad: [Crítico/Alto/Medio/Bajo]
Status: [Nuevo/Asignado/En Progreso/Resuelto/Cerrado]
Encontrado por: [Nombre QA]
Reproducción:
1. [Paso 1]
2. [Paso 2]
Resultado Actual: [Qué sucedió]
Resultado Esperado: [Qué debería suceder]
Screenshots: [Adjuntar si es necesario]
```

**Template: Test Execution Report**
```
Suite: [Nombre]
Fecha: [Fecha]
Ejecutado por: [Nombre]
Total Casos: [#]
Pasados: [#]
Fallidos: [#]
No Ejecutados: [#]
% Éxito: [#%]
Defectos Nuevos: [#]
Defectos Reabiertos: [#]
Notas: [Observaciones]
```

---

**FIN DEL PLAN DE PRUEBAS**

*Documento Confidencial - Sistema de Gestión de Trámites Universidad del Valle*
