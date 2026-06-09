# REQUERIMIENTOS DE PRUEBA - MÓDULO CAJERO
## Sistema de Gestión de Trámites Universitarios - Universidad del Valle

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Módulo:** Cajero/Tesorero  
**Estado:** Activo

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento define los requerimientos funcionales, requisitos de prueba y casos de prueba para el módulo Cajero del Sistema de Gestión de Trámites Universitarios. El módulo Cajero es responsable de procesar pagos, validar comprobantes, emitir facturas y generar reportes de ingresos.

### 1.2 Alcance
- Visualización de solicitudes pendientes de pago
- Validación de comprobantes de pago
- Marcación de solicitudes como pagadas
- Generación de facturas
- Reportes de ingresos por periodo
- Filtrado y búsqueda de solicitudes
- Emisión de certificados

### 1.3 Módulos Relacionados
- **Módulo Usuario:** Genera solicitudes, sube comprobantes de pago
- **Módulo Bibliotecario:** Revisa documentos después de pago confirmado
- **Módulo Admin:** Gestión de configuración general

---

## 2. REQUERIMIENTOS FUNCIONALES

### REQ-CAJ-001: Visualizar Solicitudes Pendientes de Pago
**Descripción:** El cajero puede ver todas las solicitudes con estado "Pago Pendiente"  
**Actores:** Cajero  
**Precondiciones:** Cajero autenticado, hay solicitudes con estado = "Pago Pendiente"  
**Pasos:**
1. Acceder a módulo Cajero
2. Ver listado de solicitudes pendientes
3. Filtrar por fecha, usuario, tipo de trámite

**Resultado Esperado:**
- Lista muestra código de solicitud, usuario, trámite, fecha, monto
- Ordenado por fecha descendente (más recientes primero)
- Paginación si hay >10 registros
- Se puede expandir cada item para ver detalles

**Criterios de Aceptación:**
- ✅ Solo solicitudes con estado "Pago Pendiente" se muestran
- ✅ Información correcta por solicitud
- ✅ Paginación funciona
- ✅ Búsqueda rápida

---

### REQ-CAJ-002: Validar Comprobante de Pago
**Descripción:** El cajero revisa y valida el comprobante de pago subido por el usuario  
**Actores:** Cajero  
**Precondiciones:** Solicitud tiene comprobante_pago subido  
**Pasos:**
1. Hacer clic en solicitud pendiente
2. Ver detalles de la solicitud
3. Ver archivos adjuntos (comprobante de pago)
4. Validar que comprobante es auténtico
5. Revisar que monto en comprobante coincide con monto de trámite

**Resultado Esperado:**
- Comprobante visible (PDF, JPG, PNG)
- Datos de comprobante: banco, referencia, monto, fecha
- Permite acción de aprobar o rechazar

**Criterios de Aceptación:**
- ✅ Comprobante se descarga correctamente
- ✅ Formato visible en browser
- ✅ Información legible
- ✅ Se puede guardar localmente

---

### REQ-CAJ-003: Marcar Solicitud como Pagada
**Descripción:** El cajero confirma que el pago fue recibido y actualiza el estado a "Pagado"  
**Actores:** Cajero  
**Precondiciones:** Solicitud está en estado "Pago Pendiente", comprobante validado  
**Pasos:**
1. Abrir detalles de solicitud
2. Hacer clic en botón "Marcar como Pagado"
3. Confirmar acción
4. Sistema actualiza estado

**Resultado Esperado:**
- Estado cambia de "Pago Pendiente" → "Pagado"
- Timestamp de confirmación se guarda
- Usuario ve notificación
- Solicitud se mueve a historial

**Criterios de Aceptación:**
- ✅ BD se actualiza correctamente
- ✅ Cambio es inmediato en UI
- ✅ Historial registra quién y cuándo
- ✅ No se puede marcar dos veces

---

### REQ-CAJ-004: Rechazar Solicitud por Pago Inválido
**Descripción:** El cajero rechaza una solicitud si el comprobante de pago no es válido  
**Actores:** Cajero  
**Precondiciones:** Comprobante de pago no válido o no coincide monto  
**Pasos:**
1. Abrir detalles de solicitud
2. Hacer clic en botón "Rechazar Pago"
3. Ingresar motivo del rechazo
4. Confirmar acción

**Resultado Esperado:**
- Estado cambia a "Rechazado"
- Usuario recibe notificación por correo
- Motivo se guarda en BD
- Solicitud no avanza en flujo

**Criterios de Aceptación:**
- ✅ Motivo es requerido
- ✅ Usuario es notificado
- ✅ BD registra rechazo
- ✅ Solicitud puede resubmitirse

---

### REQ-CAJ-005: Filtrar Solicitudes por Fecha
**Descripción:** El cajero puede filtrar solicitudes por rango de fechas  
**Actores:** Cajero  
**Precondiciones:** Al menos 5 solicitudes en BD  
**Pasos:**
1. Acceder a módulo Cajero
2. Usar filtro de fecha (From - To)
3. Aplicar filtro
4. Ver resultados

**Resultado Esperado:**
- Solo solicitudes dentro del rango se muestran
- Filtro es opcional (sin filtro = todas)
- Pueda limpiar filtro

**Criterios de Aceptación:**
- ✅ Filtro funciona correctamente
- ✅ Limpieza de filtro funciona
- ✅ Búsqueda es rápida (<200ms)

---

### REQ-CAJ-006: Buscar Solicitud por Usuario/Código
**Descripción:** El cajero puede buscar una solicitud específica por código o nombre de usuario  
**Actores:** Cajero  
**Precondiciones:** Hay solicitudes en BD  
**Pasos:**
1. Ingresar código de solicitud o nombre de usuario en buscador
2. Presionar Enter o botón de búsqueda
3. Ver resultados

**Resultado Esperado:**
- Resultados filtrados relevantes
- Búsqueda es case-insensitive
- Búsqueda es rápida

**Criterios de Aceptación:**
- ✅ Búsqueda funciona con código completo y parcial
- ✅ Búsqueda funciona con nombres parciales
- ✅ Respuesta < 300ms

---

### REQ-CAJ-007: Descargar Comprobante de Pago
**Descripción:** El cajero puede descargar una copia del comprobante de pago para sus registros  
**Actores:** Cajero  
**Precondiciones:** Solicitud tiene comprobante subido  
**Pasos:**
1. Abrir detalles de solicitud
2. Hacer clic en botón "Descargar Comprobante"
3. Archivo se descarga

**Resultado Esperado:**
- Archivo descarga en formatos: PDF, JPG, PNG
- Nombre de archivo es descriptivo (comprobante-{codigo}-{fecha}.ext)
- Descarga es rápida (<500ms)

**Criterios de Aceptación:**
- ✅ Descarga funciona
- ✅ Archivo es íntegro (no corrompido)
- ✅ Nombre de archivo es claro

---

### REQ-CAJ-008: Generar Reporte de Ingresos
**Descripción:** El cajero puede generar un reporte de todos los ingresos recibidos en un período  
**Actores:** Cajero  
**Precondiciones:** Hay solicitudes pagadas en el período  
**Pasos:**
1. Ir a sección "Reportes"
2. Seleccionar rango de fechas
3. Seleccionar tipo de reporte (Diario/Semanal/Mensual)
4. Generar reporte
5. Ver resumen y descargar

**Resultado Esperado:**
- Reporte muestra:
  - Total de solicitudes procesadas
  - Ingresos totales
  - Desglose por tipo de trámite
  - Desglose por usuario
- Formato exportable (PDF, Excel)

**Criterios de Aceptación:**
- ✅ Reporte es preciso (suma correcta)
- ✅ Desglose es detallado
- ✅ Exportación funciona
- ✅ Reporte es legible

---

### REQ-CAJ-009: Exportar Reporte a Excel
**Descripción:** El cajero puede exportar reportes en formato Excel  
**Actores:** Cajero  
**Precondiciones:** Reporte generado  
**Pasos:**
1. Hacer clic en botón "Descargar Excel"
2. Seleccionar ubicación de descarga
3. Archivo se guarda

**Resultado Esperado:**
- Archivo .xlsx descargado
- Contiene todas las columnas del reporte
- Formato profesional con encabezados

**Criterios de Aceptación:**
- ✅ Excel es válido (se abre en Excel/Sheets)
- ✅ Datos son correctos
- ✅ Formato es profesional

---

### REQ-CAJ-010: Emitir Factura Oficial
**Descripción:** El cajero emite una factura oficial con NIT y datos de la universidad  
**Actores:** Cajero  
**Precondiciones:** Solicitud está pagada  
**Pasos:**
1. Abrir solicitud pagada
2. Hacer clic en "Generar Factura"
3. Revisar datos (automáticamente llenos)
4. Confirmar y guardar factura

**Resultado Esperado:**
- Factura en PDF con:
  - Número de factura único
  - NIT de la universidad
  - Datos del estudiante (nombre, código)
  - Descripción del trámite
  - Monto
  - Fecha de expedición
  - Firma digital (si aplica)
- Factura guardada en BD con path

**Criterios de Aceptación:**
- ✅ Factura tiene todos los datos legales
- ✅ Número de factura es único
- ✅ PDF es válido
- ✅ Factura se puede descargar después

---

### REQ-CAJ-011: Visualizar Historial de Transacciones
**Descripción:** El cajero puede ver el historial de todas las transacciones (pagadas, rechazadas, etc.)  
**Actores:** Cajero  
**Precondiciones:** Hay transacciones en BD  
**Pasos:**
1. Ir a sección "Historial"
2. Ver lista de todas las transacciones
3. Filtrar por estado, fecha, usuario

**Resultado Esperado:**
- Lista muestra: código, usuario, estado, monto, fecha, acción_cajero
- Estados: Pagado, Rechazado, Reembolso
- Ordenado por fecha descendente

**Criterios de Aceptación:**
- ✅ Todos los registros se muestran
- ✅ Información es precisa
- ✅ Filtros funcionan

---

### REQ-CAJ-012: Procesar Reembolso
**Descripción:** El cajero puede procesar un reembolso si el usuario solicita cancelación  
**Actores:** Cajero  
**Precondiciones:** Solicitud está pagada, usuario solicita reembolso  
**Pasos:**
1. Buscar solicitud pagada
2. Hacer clic en "Procesar Reembolso"
3. Ingresar motivo del reembolso
4. Confirmar monto
5. Guardar reembolso

**Resultado Esperado:**
- Estado cambia a "Reembolso"
- Monto reembolsado se registra
- Usuario es notificado
- Deducción en ingresos del día

**Criterios de Aceptación:**
- ✅ BD se actualiza
- ✅ Monto es correcto
- ✅ Usuario es notificado
- ✅ Reembolso aparece en reportes

---

### REQ-CAJ-013: Cambiar Estado de Solicitud
**Descripción:** El cajero puede cambiar el estado de una solicitud (avanzar a siguiente fase)  
**Actores:** Cajero  
**Precondiciones:** Solicitud pagada  
**Pasos:**
1. Abrir solicitud
2. Hacer clic en "Cambiar Estado"
3. Seleccionar nuevo estado
4. Guardar cambio

**Resultado Esperado:**
- Estado cambia en BD
- Historial registra cambio
- Timestamp se guarda
- Módulos relacionados son notificados

**Criterios de Aceptación:**
- ✅ Cambio es válido (no cambios ilegales)
- ✅ BD se actualiza
- ✅ Otros módulos ven el cambio

---

### REQ-CAJ-014: Ver Detalles Completos de Solicitud
**Descripción:** El cajero puede ver todos los detalles de una solicitud (usuario, documentos, comprobantes)  
**Actores:** Cajero  
**Precondiciones:** Solicitud existe  
**Pasos:**
1. Buscar solicitud
2. Hacer clic para abrir detalles
3. Ver todas las secciones

**Resultado Esperado:**
- Pantalla muestra:
  - Datos del usuario (nombre, código, carrera)
  - Tipo de trámite
  - Documentos adjuntos
  - Comprobante de pago
  - Historial de cambios de estado
  - Notas/comentarios

**Criterios de Aceptación:**
- ✅ Todos los datos son accesibles
- ✅ Documentos se pueden descargar
- ✅ Información es precisa

---

### REQ-CAJ-015: Enviar Recordatorio a Usuario
**Descripción:** El cajero puede enviar un correo recordatorio a usuarios con pagos pendientes  
**Actores:** Cajero  
**Precondiciones:** Hay solicitudes con estado "Pago Pendiente"  
**Pasos:**
1. Seleccionar solicitudes o usuarios
2. Hacer clic en "Enviar Recordatorio"
3. Confirmar envío

**Resultado Esperado:**
- Correo enviado a usuario
- Correo incluye código de solicitud, monto, fecha límite
- Historial registra envío

**Criterios de Aceptación:**
- ✅ Correo llega a usuario
- ✅ Información es correcta
- ✅ Se puede enviar masivo

---

## 3. CASOS DE PRUEBA FRONTEND

### TC-FE-001: Acceso al Módulo Cajero
**Objetivo:** Verificar que solo usuario con rol Cajero puede acceder al módulo  
**Precondiciones:**
- Usuario autenticado con rol Cajero
- URL: /cajero

**Pasos:**
1. Navegar a /cajero
2. Verificar acceso

**Resultado Esperado:**
- Página carga correctamente
- Dashboard visible
- Menú de opciones disponible

**Datos de Prueba:**
- Usuario: cajero@univalle.edu.co
- Contraseña: ****

---

### TC-FE-002: Denegación de Acceso Usuario sin Rol Cajero
**Objetivo:** Verificar que solo Cajeros pueden acceder  
**Precondiciones:**
- Usuario autenticado pero NO es Cajero (es Estudiante)

**Pasos:**
1. Intentar navegar a /cajero
2. Observar resultado

**Resultado Esperado:**
- Error 403 Forbidden O
- Redirección a /usuario/landing

**Validaciones:**
- ✅ Error es claro y útil
- ✅ Redirección es inmediata

---

### TC-FE-003: Visualización de Solicitudes Pendientes
**Objetivo:** Verificar que se muestran todas las solicitudes con estado "Pago Pendiente"  
**Precondiciones:**
- Cajero autenticado
- Existen 5+ solicitudes con estado "Pago Pendiente"

**Pasos:**
1. Acceder a /cajero
2. Esperar carga de página
3. Ver listado de solicitudes

**Resultado Esperado:**
- Tabla muestra todas las solicitudes pendientes
- Columnas visibles: Código, Usuario, Trámite, Fecha, Monto
- Ordenado por fecha descendente
- Responsive en mobile

**Validaciones:**
- ✅ Todos los registros se cargan
- ✅ Información es precisa
- ✅ Tabla es legible

---

### TC-FE-004: Búsqueda de Solicitud por Código
**Objetivo:** Verificar que búsqueda funciona por código de solicitud  
**Precondiciones:**
- Hay solicitudes en listado

**Pasos:**
1. Hacer clic en campo de búsqueda
2. Ingresar código de solicitud (ej: TRAM-001)
3. Presionar Enter o botón buscar
4. Ver resultados

**Resultado Esperado:**
- Tabla se filtra mostrando solo esa solicitud
- Búsqueda es case-insensitive
- Resultado es rápido (<300ms)

**Validaciones:**
- ✅ Filtro es preciso
- ✅ Búsqueda parcial también funciona
- ✅ Limpiar búsqueda vuelve a mostrar todos

---

### TC-FE-005: Filtro por Rango de Fechas
**Objetivo:** Verificar que filtro de fechas funciona correctamente  
**Precondiciones:**
- Hay solicitudes en rango de 7+ días

**Pasos:**
1. Abrir selector de fechas "Desde"
2. Seleccionar fecha inicial (ej: 01/06/2026)
3. Abrir selector de fechas "Hasta"
4. Seleccionar fecha final (ej: 05/06/2026)
5. Aplicar filtro

**Resultado Esperado:**
- Tabla muestra solo solicitudes en ese rango
- Fechas son inclusivas
- Puede limpiar filtro

**Validaciones:**
- ✅ Filtro es preciso
- ✅ Rango no invierte automáticamente (si Hasta < Desde, error)
- ✅ Performance acceptable

---

### TC-FE-006: Expandir Detalles de Solicitud
**Objetivo:** Verificar que se puede expandir una solicitud para ver detalles  
**Precondiciones:**
- Hay solicitudes en listado

**Pasos:**
1. Hacer clic en fila de solicitud
2. Ver detalles expandidos

**Resultado Esperado:**
- Fila se expande mostrando:
  - Datos del usuario completos
  - Descripción del trámite
  - Botones de acción (Aprobar, Rechazar, Ver Comprobante)
- Animación suave

**Validaciones:**
- ✅ Toda la información es visible
- ✅ Botones son clickeables
- ✅ No se ve cortado en mobile

---

### TC-FE-007: Descargar Comprobante de Pago (Vista Previa)
**Objetivo:** Verificar que se puede ver comprobante de pago  
**Precondiciones:**
- Solicitud expandida
- Comprobante de pago subido (PDF, JPG o PNG)

**Pasos:**
1. Buscar botón "Ver Comprobante"
2. Hacer clic

**Resultado Esperado:**
- Modal o nueva pestaña abre
- Comprobante visible (PDF en iframe, imagen embebida)
- Se puede descargar desde modal

**Validaciones:**
- ✅ Imagen/PDF se carga rápido
- ✅ Calidad es legible
- ✅ No se abre en misma pestaña (usar target="_blank")

---

### TC-FE-008: Botón Marcar como Pagado
**Objetivo:** Verificar que UI del botón está disponible y funciona  
**Precondiciones:**
- Solicitud expandida
- Estado es "Pago Pendiente"

**Pasos:**
1. Localizar botón "Marcar como Pagado"
2. Hacer clic
3. Confirmar en modal de confirmación
4. Ver cambio de estado

**Resultado Esperado:**
- Botón es prominente (verde o azul)
- Modal de confirmación aparece
- Texto claro: "¿Confirmar que se recibió el pago?"
- Después de confirmar: estado cambia a "Pagado", botón desaparece
- Notificación toast muestra "Solicitud marcada como pagada"

**Validaciones:**
- ✅ UI es intuitiva
- ✅ Confirmación previene accidentes
- ✅ Feedback visual es claro

---

### TC-FE-009: Botón Rechazar Pago
**Objetivo:** Verificar que UI de rechazo está disponible  
**Precondiciones:**
- Solicitud expandida
- Estado es "Pago Pendiente"

**Pasos:**
1. Localizar botón "Rechazar Pago"
2. Hacer clic
3. Modal aparece pidiendo motivo

**Resultado Esperado:**
- Modal muestra campo de texto "Motivo del rechazo"
- Botones: Cancelar, Confirmar
- Motivo es requerido (min 10 caracteres)

**Validaciones:**
- ✅ Campo es requerido
- ✅ Validación es clara
- ✅ Modal es accesible

---

### TC-FE-010: Ingresar Motivo de Rechazo
**Objetivo:** Verificar validación del campo de motivo  
**Precondiciones:**
- Modal de rechazo abierto

**Pasos:**
1. Dejar campo vacío, hacer clic Confirmar
2. Verificar error
3. Ingresar texto muy corto (<10 chars), confirmar
4. Verificar error
5. Ingresar motivo válido (>10 chars), confirmar

**Resultado Esperado:**
- Paso 1: Error "Motivo es requerido"
- Paso 3: Error "Mínimo 10 caracteres"
- Paso 5: Rechazo procesado, modal cierra

**Validaciones:**
- ✅ Validaciones son claras
- ✅ Feedback es inmediato

---

### TC-FE-011: Sección de Reportes - Seleccionar Fechas
**Objetivo:** Verificar que se puede seleccionar rango para reporte  
**Precondiciones:**
- Cajero en sección de Reportes

**Pasos:**
1. Navegar a "Reportes"
2. Ver selector de fechas
3. Seleccionar fecha inicial y final
4. Hacer clic en "Generar Reporte"

**Resultado Esperado:**
- Selectores son accesibles (date picker)
- Rango válido genera reporte
- Rango inválido (Hasta < Desde) muestra error

**Validaciones:**
- ✅ Date picker funciona
- ✅ Validación de rango es clara

---

### TC-FE-012: Tipo de Reporte Diario/Semanal/Mensual
**Objetivo:** Verificar que se pueden seleccionar diferentes tipos de reporte  
**Precondiciones:**
- En sección de Reportes

**Pasos:**
1. Ver selector de tipo de reporte
2. Seleccionar "Diario"
3. Ver cambio en rango de fechas (solo 1 día)
4. Cambiar a "Semanal"
5. Ver rango automático (7 días)
6. Cambiar a "Mensual"
7. Ver rango automático (30 días)

**Resultado Esperado:**
- Selector trabaja correctamente
- Rango se ajusta automáticamente
- Reporte se regenera al cambiar tipo

**Validaciones:**
- ✅ Cambios son inmediatos
- ✅ Lógica es intuitiva

---

### TC-FE-013: Botón Descargar Reporte Excel
**Objetivo:** Verificar que botón de descarga funciona  
**Precondiciones:**
- Reporte generado

**Pasos:**
1. Ver reporte en pantalla
2. Localizar botón "Descargar Excel"
3. Hacer clic
4. Esperar descarga

**Resultado Esperado:**
- Descarga comienza automáticamente
- Archivo es reporteCAJERO_{fecha}.xlsx
- Browser muestra descarga completada

**Validaciones:**
- ✅ Descarga inicia sin confirmar
- ✅ Nombre de archivo es descriptivo

---

### TC-FE-014: Tabla de Reporte Visible
**Objetivo:** Verificar que datos del reporte se muestran en pantalla  
**Precondiciones:**
- Reporte generado

**Pasos:**
1. Ver tabla de reporte en pantalla
2. Verificar columnas
3. Scroll en tabla si es muy ancha

**Resultado Esperado:**
- Tabla muestra:
  - Código de solicitud
  - Usuario
  - Tipo de trámite
  - Monto
  - Fecha de pago
  - Estado
- Total de ingresos resaltado
- Tabla es responsive

**Validaciones:**
- ✅ Todos los datos visibles
- ✅ Formato es profesional
- ✅ Números están formateados correctamente (moneda)

---

### TC-FE-015: Historial de Transacciones
**Objetivo:** Verificar que historial se muestra correctamente  
**Precondiciones:**
- Cajero en sección "Historial"

**Pasos:**
1. Navegar a "Historial"
2. Ver lista de transacciones
3. Aplicar filtros (estado, fecha)

**Resultado Esperado:**
- Lista muestra todas las transacciones (Pagado, Rechazado, Reembolso)
- Ordenado por fecha descendente
- Filtros funcionan

**Validaciones:**
- ✅ Datos son precisos
- ✅ UI es intuitiva

---

### TC-FE-016: Botón Generar Factura
**Objetivo:** Verificar que UI para generar factura es correcta  
**Precondiciones:**
- Solicitud con estado "Pagado"
- Solicitud expandida

**Pasos:**
1. Localizar botón "Generar Factura"
2. Hacer clic

**Resultado Esperado:**
- Modal aparece mostrando vista previa de factura
- Datos pre-llenados y correctos
- Botones: Cancelar, Confirmar y Descargar

**Validaciones:**
- ✅ Botón es visible solo para solicitudes pagadas
- ✅ Modal muestra toda la información

---

### TC-FE-017: Descargar Factura PDF
**Objetivo:** Verificar que factura se puede descargar  
**Precondiciones:**
- Modal de factura abierto

**Pasos:**
1. Hacer clic en "Descargar"
2. Esperar descarga

**Resultado Esperado:**
- Archivo factura_{codigo}_{fecha}.pdf descarga
- PDF abre en reader
- Contenido es legible

**Validaciones:**
- ✅ PDF es válido
- ✅ Información es correcta
- ✅ Nombre es descriptivo

---

### TC-FE-018: Botón Procesar Reembolso
**Objetivo:** Verificar UI para reembolso  
**Precondiciones:**
- Solicitud pagada
- Usuario solicita reembolso

**Pasos:**
1. Expandir solicitud
2. Localizar botón "Procesar Reembolso"
3. Hacer clic
4. Modal pide motivo
5. Ingresar motivo válido
6. Confirmar

**Resultado Esperado:**
- Botón solo disponible para solicitudes pagadas
- Modal pide información
- Confirmar procesa reembolso

**Validaciones:**
- ✅ Botón está disponible cuando corresponde
- ✅ Modal es claro

---

### TC-FE-019: Enviar Recordatorio a Usuario
**Objetivo:** Verificar UI para recordatorios  
**Precondiciones:**
- Hay solicitudes pendientes

**Pasos:**
1. Seleccionar checkbox de solicitudes
2. Hacer clic en "Enviar Recordatorio"
3. Confirmar

**Resultado Esperado:**
- Opción en bulk o por individual
- Confirmación muestra cantidad de usuarios
- Notificación de éxito

**Validaciones:**
- ✅ UI es clara
- ✅ Confirmación previene envíos accidentales

---

### TC-FE-020: Responsive Design - Mobile
**Objetivo:** Verificar que UI funciona en mobile (iPhone, Android)  
**Precondiciones:**
- Browser en tamaño mobile (375px width)

**Pasos:**
1. Acceder a /cajero desde mobile
2. Ver tabla
3. Ver detalles expandidos
4. Usar filtros

**Resultado Esperado:**
- Tabla es scrolleable horizontalmente
- No hay elementos cortados
- Botones son clickeables (>44px)
- Modales son adaptados

**Validaciones:**
- ✅ Layout es responsive
- ✅ Funcionalidad completa en mobile
- ✅ Texto es legible

---

### TC-FE-021: Logout desde Cajero
**Objetivo:** Verificar que logout funciona desde módulo  
**Precondiciones:**
- Cajero autenticado

**Pasos:**
1. Hacer clic en avatar/menu usuario
2. Seleccionar "Cerrar Sesión"
3. Confirmar

**Resultado Esperado:**
- Sesión se cierra
- Redirección a /auth/login
- localStorage se limpia
- Cookies se eliminan

**Validaciones:**
- ✅ Logout es seguro
- ✅ No hay residuos de sesión
- ✅ Redirección es inmediata

---

## 4. CASOS DE PRUEBA API

### TC-API-001: GET /api/cajero/solicitudes-pendientes
**Objetivo:** Obtener lista de solicitudes pendientes de pago  
**Método:** GET  
**Endpoint:** /api/cajero/solicitudes-pendientes  

**Precondiciones:**
- Usuario autenticado con rol Cajero
- Headers: Cookie: auth-token=<valid-jwt>

**Request:**
```
GET /api/cajero/solicitudes-pendientes?page=1&limit=10 HTTP/1.1
Host: localhost:3000
Cookie: auth-token=<jwt-token>
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_solicitud": 1,
      "codigo_tramite": "TRAM-001",
      "usuario": {
        "id": 5,
        "correo": "estudiante@univalle.edu.co",
        "nombre": "Juan Pérez"
      },
      "tramite": {
        "nombre": "Certificado de Matrícula",
        "costo": 15000
      },
      "fecha_creacion": "2026-06-01T10:30:00Z",
      "estado": "Pago Pendiente",
      "comprobante_pago": "/uploads/comprobantes/..."
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

**Validaciones:**
- ✅ Solo solicitudes con estado "Pago Pendiente"
- ✅ Paginación funciona
- ✅ Datos son correctos
- ✅ Arrays ordenados por fecha DESC

---

### TC-API-002: GET /api/cajero/solicitudes-pendientes?search=TRAM-001
**Objetivo:** Buscar solicitud por código  
**Método:** GET  
**Endpoint:** /api/cajero/solicitudes-pendientes?search=TRAM-001  

**Resultado Esperado (200 OK):**
- Solo solicitud con código coincidente se retorna
- Búsqueda es case-insensitive
- Response time < 300ms

---

### TC-API-003: GET /api/cajero/solicitudes-pendientes?fecha_inicio=2026-06-01&fecha_fin=2026-06-05
**Objetivo:** Filtrar solicitudes por rango de fechas  
**Método:** GET  

**Resultado Esperado (200 OK):**
- Solo solicitudes dentro del rango
- Fechas inclusivas (>= inicio, <= fin)
- Ordenadas por fecha

---

### TC-API-004: GET /api/cajero/solicitud/{id_solicitud}
**Objetivo:** Obtener detalles completos de una solicitud  
**Método:** GET  
**Endpoint:** /api/cajero/solicitud/1  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_solicitud": 1,
    "codigo_tramite": "TRAM-001",
    "usuario": {...},
    "tramite": {...},
    "documentos": [
      {"id": 1, "tipo": "Cédula", "path": "/uploads/..."}
    ],
    "comprobante_pago": {...},
    "factura": null,
    "historial_cambios": [...]
  }
}
```

**Validaciones:**
- ✅ Todos los datos necesarios
- ✅ Autorización: solo Cajero o Admin

---

### TC-API-005: GET /api/cajero/solicitud/999 (No existe)
**Objetivo:** Manejar solicitud inexistente  
**Resultado Esperado (404 Not Found):**
```json
{
  "success": false,
  "error": "Solicitud no encontrada"
}
```

---

### TC-API-006: POST /api/cajero/marcar-pagado
**Objetivo:** Marcar solicitud como pagada  
**Método:** POST  
**Endpoint:** /api/cajero/marcar-pagado  

**Request:**
```json
{
  "id_solicitud": 1,
  "referencia_pago": "REF123456"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Solicitud marcada como pagada",
  "data": {
    "id_solicitud": 1,
    "estado": "Pagado",
    "fecha_confirmacion": "2026-06-03T14:30:00Z"
  }
}
```

**Validaciones:**
- ✅ BD se actualiza
- ✅ Estado cambia correctamente
- ✅ Timestamp se registra
- ✅ No se puede marcar dos veces (error si ya es "Pagado")

---

### TC-API-007: POST /api/cajero/rechazar-pago
**Objetivo:** Rechazar pago por motivo inválido  
**Método:** POST  

**Request:**
```json
{
  "id_solicitud": 1,
  "motivo": "Comprobante no corresponde al monto requerido"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Pago rechazado",
  "data": {
    "id_solicitud": 1,
    "estado": "Rechazado",
    "motivo_rechazo": "..."
  }
}
```

**Validaciones:**
- ✅ BD se actualiza
- ✅ Motivo se guarda
- ✅ Usuario es notificado por correo

---

### TC-API-008: POST /api/cajero/rechazar-pago (Sin motivo)
**Objetivo:** Validación: motivo es requerido  
**Result Esperado (400 Bad Request):**
```json
{
  "success": false,
  "error": "Motivo es requerido"
}
```

---

### TC-API-009: GET /api/cajero/reportes?fecha_inicio=2026-06-01&fecha_fin=2026-06-30&tipo=mensual
**Objetivo:** Generar reporte de ingresos  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "periodo": "2026-06-01 to 2026-06-30",
    "total_solicitudes": 15,
    "total_ingresos": 225000,
    "desglose_por_tramite": [
      {
        "tramite": "Certificado de Matrícula",
        "cantidad": 10,
        "monto": 150000
      }
    ],
    "detalles": [...]
  }
}
```

**Validaciones:**
- ✅ Cálculos son correctos
- ✅ Desglose es detallado
- ✅ Solo solicitudes "Pagado" se incluyen

---

### TC-API-010: GET /api/cajero/reportes/exportar-excel
**Objetivo:** Exportar reporte a Excel  
**Método:** GET  
**Headers:** Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

**Resultado Esperado (200 OK):**
- Archivo .xlsx válido
- Contiene datos correctos
- Encabezados profesionales

---

### TC-API-011: POST /api/cajero/generar-factura
**Objetivo:** Generar factura para solicitud pagada  
**Método:** POST  

**Request:**
```json
{
  "id_solicitud": 1
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "factura_id": 1,
    "numero_factura": "FAC-2026-000001",
    "documento_factura": "/uploads/facturas/factura-1-1685956200.pdf",
    "fecha_emision": "2026-06-03T14:30:00Z"
  }
}
```

**Validaciones:**
- ✅ Número de factura es único
- ✅ PDF se genera correctamente
- ✅ Factura se guarda en BD

---

### TC-API-012: GET /api/cajero/descargar-factura?id_solicitud=1
**Objetivo:** Descargar factura PDF  
**Método:** GET  

**Resultado Esperado (200 OK):**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="factura-1.pdf"
- Archivo PDF válido

---

### TC-API-013: POST /api/cajero/procesar-reembolso
**Objetivo:** Procesar reembolso de pago  
**Método:** POST  

**Request:**
```json
{
  "id_solicitud": 1,
  "motivo": "Usuario solicita cancelación"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_solicitud": 1,
    "estado": "Reembolso",
    "monto_reembolsado": 15000,
    "fecha_reembolso": "2026-06-03T14:30:00Z"
  }
}
```

---

### TC-API-014: POST /api/cajero/enviar-recordatorio
**Objetivo:** Enviar recordatorio de pago pendiente  
**Método:** POST  

**Request:**
```json
{
  "id_solicitudes": [1, 2, 3]
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "message": "3 recordatorios enviados",
  "data": {
    "enviados": 3,
    "fallidos": 0
  }
}
```

**Validaciones:**
- ✅ Correos enviados correctamente
- ✅ Historial registra envío

---

## 5. CASOS DE PRUEBA BACKEND

### TC-BD-001: Inserción de Solicitud en Tabla Correcta
**Objetivo:** Verificar integridad de datos al crear solicitud  
**Proceso:**
1. Crear solicitud a través de API usuario
2. Consultar BD directamente

**Validaciones:**
- ✅ Registro en tabla solicitudes_tramite
- ✅ id_usuario referencia tabla usuarios
- ✅ id_tramite referencia tabla tramites
- ✅ estado = "Pago Pendiente" al inicio
- ✅ Campos no nulos: id_usuario, id_tramite, fecha_creacion

**Query de Validación:**
```sql
SELECT * FROM solicitudes_tramite WHERE id_solicitud = 1;
-- Verificar todos los campos
```

---

### TC-BD-002: Actualización de Estado Pago Pendiente → Pagado
**Objetivo:** Verificar que actualización de estado funciona correctamente  
**Precondiciones:**
- Solicitud con estado "Pago Pendiente"

**Proceso:**
1. API marca solicitud como pagada
2. Consultar BD

**Validaciones:**
- ✅ estado cambia a "Pagado"
- ✅ fecha_confirmacion se establece
- ✅ Otros campos no cambian
- ✅ Timestamp es reciente

---

### TC-BD-003: Referencia Integridad - Factura
**Objetivo:** Verificar que factura referencia solicitud correctamente  
**Proceso:**
1. Generar factura para solicitud
2. Consultar tabla facturas

**Validaciones:**
- ✅ id_solicitud en facturas referencia a solicitudes_tramite
- ✅ Constraint de clave foránea existe
- ✅ No se puede eliminar solicitud si tiene factura (sin cascade)

---

### TC-BD-004: Historial de Cambios Registra Correctamente
**Objetivo:** Verificar que cada cambio de estado se registra  
**Proceso:**
1. Cambiar estado de solicitud múltiples veces
2. Consultar tabla historial

**Validaciones:**
- ✅ Cada cambio tiene entrada en tabla
- ✅ Timestamps son cronológicos
- ✅ Usuario que realizó cambio está registrado
- ✅ Estado anterior y nuevo están guardados

---

### TC-BD-005: Cálculo de Ingresos es Correcto
**Objetivo:** Verificar que suma de ingresos es precisa  
**Proceso:**
1. Insertar 5 solicitudes pagadas
2. Calcular suma esperada
3. Ejecutar query de reporte

**Validaciones:**
- ✅ Suma = suma manual de montos
- ✅ Solo solicitudes "Pagado" se incluyen
- ✅ Reembolsos se restan

---

### TC-BD-006: Constraints - No Nulos Obligatorios
**Objetivo:** Verificar que campos obligatorios no permiten NULL  
**Proceso:**
1. Intentar insertar registro con campo nulo
2. Observar error

**Validaciones (por cada campo obligatorio):**
- ✅ id_usuario: NOT NULL
- ✅ id_tramite: NOT NULL
- ✅ fecha_creacion: NOT NULL (default CURRENT_TIMESTAMP)
- ✅ estado: NOT NULL (default "Pago Pendiente")

---

### TC-BD-007: Índices Creados para Performance
**Objetivo:** Verificar que índices existen para búsquedas rápidas  
**Queries:**
```sql
SHOW INDEXES FROM solicitudes_tramite;
-- Verificar índices en: estado, fecha_creacion, id_usuario
```

**Validaciones:**
- ✅ Índice en estado (para filtrar por "Pago Pendiente")
- ✅ Índice en fecha_creacion (para ordenar)
- ✅ Índice en id_usuario (para búsquedas por usuario)

---

### TC-BD-008: Trigger - Actualizar Fecha Modificación
**Objetivo:** Verificar que timestamp se actualiza automáticamente  
**Proceso:**
1. Crear solicitud
2. Esperar 1 segundo
3. Marcar como pagada
4. Verificar fecha_modificacion

**Validaciones:**
- ✅ fecha_modificacion != fecha_creacion
- ✅ fecha_modificacion es más reciente
- ✅ Trigger se ejecutó

---

### TC-BD-009: Transacción - Marcar Pagado + Crear Factura
**Objetivo:** Verificar que transacción es atómica  
**Proceso:**
1. API intenta marcar pagado y crear factura
2. Simular error a mitad del proceso
3. Verificar rollback

**Validaciones:**
- ✅ Si factura falla, marcar pagado se revierte
- ✅ Ambas operaciones suceden o ninguna
- ✅ BD no queda en estado inconsistente

---

### TC-BD-010: Seguridad - Queries Parametrizadas
**Objetivo:** Verificar que no hay inyecciones SQL  
**Proceso:**
1. Intentar inyectar SQL en búsqueda: `'; DROP TABLE solicitudes_tramite; --`
2. Observar resultado

**Validaciones:**
- ✅ Query se parametriza (no se ejecuta inyección)
- ✅ BD no se daña
- ✅ Búsqueda retorna cero resultados

---

### TC-BD-011: Autorización - Cajero Solo Ve Sus Solicitudes
**Objetivo:** Verificar que filtrado por usuario funciona  
**Proceso:**
1. Query: traer solicitudes de usuario específico
2. Verificar que solo pertenecen a ese usuario

**Validaciones:**
- ✅ Filtro por id_usuario funciona
- ✅ No hay cross-contamination

---

### TC-BD-012: Encriptación de Datos Sensibles
**Objetivo:** Verificar que contraseñas y datos sensibles están encriptados  
**Process:**
1. Consultar tabla usuarios
2. Verificar campos de contraseña

**Validaciones:**
- ✅ Contraseña es hash (no plain text)
- ✅ Hash es bcrypt o similar

---

## 6. CASOS DE PRUEBA DE SEGURIDAD

### TC-SEC-001: Autenticación Requerida
**Objetivo:** Verificar que rutas Cajero requieren autenticación  
**Proceso:**
1. Acceder a /cajero sin cookie auth-token
2. Observar resultado

**Resultado Esperado:**
- Redirección a /auth/login O
- Error 401 Unauthorized

---

### TC-SEC-002: Token Expirado Redirige a Login
**Objetivo:** Verificar que token expirado invalida sesión  
**Proceso:**
1. Crear token con expiración 1 segundo
2. Esperar 2 segundos
3. Intentar acceder con token expirado

**Resultado Esperado:**
- Error 401 Unauthorized
- Redirección a /auth/login

---

### TC-SEC-003: Inyección SQL en Búsqueda
**Objetivo:** Verificar que búsqueda no es vulnerable a inyección SQL  
**Proceso:**
1. GET /api/cajero/solicitudes-pendientes?search=1' OR '1'='1
2. Observar resultado

**Resultado Esperado:**
- Búsqueda se parametriza
- No retorna datos no autorizados
- Sin error de BD

---

### TC-SEC-004: XSS en Motivo de Rechazo
**Objetivo:** Verificar que inputs se sanitizan  
**Proceso:**
1. POST /api/cajero/rechazar-pago
2. Motivo: `<script>alert('xss')</script>`

**Resultado Esperado:**
- Script se escapa
- BD guarda como string, no se ejecuta
- UI no renderiza script

---

### TC-SEC-005: Autorización - Cajero No Puede Marcar Pagado como Otro Usuario
**Objetivo:** Verificar que cambios se atribuyen correctamente  
**Proceso:**
1. Cajero 1 intenta marcar solicitud como pagada por Cajero 2
2. Verificar historial

**Validaciones:**
- ✅ Cambio se atribuye a Cajero 1
- ✅ Timestamp es de ahora

---

### TC-SEC-006: File Upload - Validación de Tipo
**Objetivo:** Verificar que comprobantes subidos son validados  
**Proceso:**
1. Intentar subir archivo .exe como comprobante
2. Observar resultado

**Resultado Esperado:**
- Rechazo: "Solo PDF, JPG, PNG permitidos"
- Archivo no se guarda en BD

---

### TC-SEC-007: File Path Traversal Prevention
**Objetivo:** Verificar que rutas seguras se usan  
**Proceso:**
1. Intentar descargar archivo con ruta: `/../../etc/passwd`
2. Observar resultado

**Resultado Esperado:**
- Path se valida (path.basename() usado)
- Archivo no se accede fuera de /uploads
- Error 404 o 403

---

### TC-SEC-008: Datos Sensibles No en Logs
**Objetivo:** Verificar que números de tarjeta, etc., no aparecen en logs  
**Proceso:**
1. Procesar comprobante con datos sensibles
2. Revisar logs del servidor

**Validaciones:**
- ✅ Datos sensibles no logged
- ✅ Solo IDs y referencias se loguean

---

## 7. DATOS DE PRUEBA

### 7.1 Usuarios de Prueba
```sql
-- Cajero de prueba
INSERT INTO usuarios (correo, nombre, rol, estado) VALUES
('cajero@univalle.edu.co', 'María López Pérez', 'Cajero', 1);

-- Estudiantes de prueba (para generar solicitudes)
INSERT INTO usuarios (correo, nombre, carrera, estado) VALUES
('estud1@univalle.edu.co', 'Juan Pérez García', 'Ingeniería Sistemas', 1),
('estud2@univalle.edu.co', 'Ana Martínez López', 'Administración', 1),
('estud3@univalle.edu.co', 'Carlos Rodríguez', 'Derecho', 1);
```

### 7.2 Solicitudes de Prueba
```sql
-- Solicitud Pago Pendiente
INSERT INTO solicitudes_tramite 
(id_usuario, id_tramite, codigo_tramite, estado, fecha_creacion) VALUES
(2, 1, 'TRAM-001', 'Pago Pendiente', '2026-06-01 10:00:00'),
(3, 2, 'TRAM-002', 'Pago Pendiente', '2026-06-02 14:00:00'),
(4, 1, 'TRAM-003', 'Pagado', '2026-05-30 09:00:00');
```

### 7.3 Comprobantes de Prueba
```
/public/uploads/comprobantes/comprobante-1-1685956200.pdf
/public/uploads/comprobantes/comprobante-2-1685956300.jpg
```

---

## 8. MATRIZ DE PRIORIDADES

### Crítico (Must Fix)
- TC-FE-008: Marcar como pagado
- TC-API-006: POST marcar-pagado
- TC-BD-001: Integridad de datos
- TC-SEC-001: Autenticación

### Alto (Should Fix)
- TC-FE-003: Listado solicitudes
- TC-API-001: GET solicitudes-pendientes
- TC-FE-009: Rechazar pago
- TC-API-009: Generar reporte

### Medio (Nice to Fix)
- TC-FE-011: Sección reportes
- TC-FE-013: Descargar Excel
- TC-FE-020: Responsive mobile

---

## 9. MÉTRICAS DE PRUEBA

| Métrica | Meta | Actual |
|---------|------|--------|
| **Cobertura Frontend** | 21/21 | - |
| **Cobertura API** | 14/14 | - |
| **Cobertura Backend** | 12/12 | - |
| **Cobertura Seguridad** | 8/8 | - |
| **Total Casos** | **55** | - |
| **Tasa Éxito Esperada** | ≥95% | - |

---

## 10. NOTAS IMPORTANTES

1. **Autenticación:** Todos los tests requieren rol Cajero
2. **BD de Prueba:** Usar BD separada, no producción
3. **Archivos:** Guardar comprobantes en /public/uploads/comprobantes/
4. **Timestamps:** Usar CURRENT_TIMESTAMP para comparaciones
5. **Performance:** Todos los endpoints API deben responder <500ms
6. **Seguridad:** Verificar queries parametrizadas en cada endpoint

---

**Documento Preparado Por:** QA Team  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Activo
