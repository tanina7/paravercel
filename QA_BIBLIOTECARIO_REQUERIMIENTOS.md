# REQUERIMIENTOS DE PRUEBA - MÓDULO BIBLIOTECARIO
## Sistema de Gestión de Trámites Universitarios - Universidad del Valle

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Módulo:** Bibliotecario/Personal de Revisión  
**Estado:** Activo

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento define los requerimientos funcionales, requisitos de prueba y casos de prueba para el módulo Bibliotecario del Sistema de Gestión de Trámites Universitarios. El módulo Bibliotecario es responsable de revisar documentos, validar solicitudes, emitir certificados y gestionar la aprobación final de trámites.

### 1.2 Alcance
- Visualización de solicitudes para revisar
- Validación de documentos adjuntos
- Aprobación o rechazo de solicitudes
- Emisión de certificados
- Generación de reportes de emisión
- Gestión de firmas digitales (si aplica)
- Historial de revisiones

### 1.3 Módulos Relacionados
- **Módulo Cajero:** Proporciona solicitudes pagadas para revisar
- **Módulo Usuario:** Solicita trámites y sube documentos
- **Módulo Admin:** Gestión global del sistema

---

## 2. REQUERIMIENTOS FUNCIONALES

### REQ-BIB-001: Visualizar Solicitudes para Revisar
**Descripción:** El bibliotecario ve todas las solicitudes con estado "En Revisión" o "Verificando"  
**Actores:** Bibliotecario  
**Precondiciones:** Bibliotecario autenticado, hay solicitudes pagadas sin revisar  
**Pasos:**
1. Acceder a módulo Bibliotecario
2. Ver listado de solicitudes para revisar
3. Filtrar por estado, tipo de trámite, fecha

**Resultado Esperado:**
- Lista muestra código, usuario, trámite, fecha, estado
- Ordenado por fecha ascendente (más antiguas primero - prioridad)
- Se puede expandir cada item para ver detalles y documentos
- Paginación si hay >10 registros

**Criterios de Aceptación:**
- ✅ Solo solicitudes en estados "Verificando", "En Revisión" se muestran
- ✅ Información correcta por solicitud
- ✅ Búsqueda rápida (<300ms)

---

### REQ-BIB-002: Visualizar Documentos Adjuntos
**Descripción:** El bibliotecario puede ver todos los documentos que el usuario subió  
**Actores:** Bibliotecario  
**Precondiciones:** Solicitud expandida  
**Pasos:**
1. Expandir solicitud
2. Ver sección de documentos
3. Hacer clic en documento para preview
4. Descargar si es necesario

**Resultado Esperado:**
- Tabla de documentos con:
  - Tipo de documento (Cédula, Comprobante de pago, etc.)
  - Nombre de archivo
  - Fecha de carga
  - Botones: Ver, Descargar
- Preview en modal o nueva ventana
- Descarga con nombre descriptivo

**Criterios de Aceptación:**
- ✅ Todos los documentos se muestran
- ✅ Preview es rápido
- ✅ Descarga no requiere paso extra

---

### REQ-BIB-003: Validar Documentos
**Descripción:** El bibliotecario valida que los documentos cumplan con requisitos  
**Actores:** Bibliotecario  
**Precondiciones:** Documentos visibles  
**Pasos:**
1. Revisar cada documento
2. Marcar como "Válido" o "Inválido"
3. Si inválido, dejar comentario

**Resultado Esperado:**
- Cada documento tiene estado: Válido, Inválido, Pendiente
- Si inválido, comentario explica el problema
- Puede cambiar validación después

**Criterios de Aceptación:**
- ✅ Estado se guarda en BD
- ✅ Historial registra cambios
- ✅ Comentarios se guardan

---

### REQ-BIB-004: Aprobar Solicitud Completa
**Descripción:** El bibliotecario aprueba una solicitud que cumple todos los requisitos  
**Actores:** Bibliotecario  
**Precondiciones:** Todos los documentos están marcados como Válidos  
**Pasos:**
1. Revisar todos los documentos
2. Verificar que no hay comentarios de rechazo
3. Hacer clic en "Aprobar Solicitud"
4. Confirmar acción

**Resultado Esperado:**
- Estado cambia a "Finalizado"
- Certificado se genera automáticamente
- Usuario recibe notificación por correo
- Solicitud aparece en historial de emisiones

**Criterios de Aceptación:**
- ✅ BD se actualiza correctamente
- ✅ Certificado se crea
- ✅ Usuario es notificado
- ✅ Timestamp se registra

---

### REQ-BIB-005: Rechazar Solicitud con Motivo
**Descripción:** El bibliotecario rechaza una solicitud si documentos no cumplen  
**Actores:** Bibliotecario  
**Precondiciones:** Hay documentos inválidos  
**Pasos:**
1. Marcar documentos problemáticos como inválidos
2. Dejar comentarios detallados
3. Hacer clic en "Rechazar Solicitud"
4. Confirmar

**Resultado Esperado:**
- Estado cambia a "Rechazado"
- Usuario recibe notificación por correo
- Detalles del rechazo se envían al usuario
- Usuario puede resubmitir solicitud con documentos corregidos

**Criterios de Aceptación:**
- ✅ Estado se actualiza
- ✅ Usuario recibe correo con motivo
- ✅ Solicitud se puede reabrir

---

### REQ-BIB-006: Agregar Comentarios a Documentos
**Descripción:** El bibliotecario puede dejar comentarios/notas sobre documentos  
**Actores:** Bibliotecario  
**Precondiciones:** Documento visible  
**Pasos:**
1. Hacer clic en campo de comentarios
2. Ingresar comentario (máx 500 caracteres)
3. Guardar comentario

**Resultado Esperado:**
- Comentario se guarda y se muestra bajo el documento
- Muestra: texto, autor, fecha
- Usuario puede ver comentarios

**Criterios de Aceptación:**
- ✅ Comentarios se guardan
- ✅ Se muestran en historial
- ✅ Usuario los puede ver

---

### REQ-BIB-007: Generar Certificado
**Descripción:** El bibliotecario emite el certificado oficial después de aprobación  
**Actores:** Bibliotecario  
**Precondiciones:** Solicitud aprobada  
**Pasos:**
1. Abrir solicitud aprobada
2. Hacer clic en "Generar Certificado"
3. Revisar datos (pre-llenados)
4. Confirmar y generar

**Resultado Esperado:**
- Certificado PDF generado con:
  - Nombre de la universidad
  - Tipo de certificado (Matrícula, Constancia, etc.)
  - Datos del estudiante
  - Firma digital (si aplica)
  - Número de registro único
  - Fecha de emisión
- PDF guardado en BD
- Disponible para descarga

**Criterios de Aceptación:**
- ✅ Certificado tiene todos los datos legales
- ✅ Número es único
- ✅ PDF es válido
- ✅ Se puede descargar

---

### REQ-BIB-008: Descargar Certificado
**Descripción:** El bibliotecario puede descargar el certificado generado  
**Actores:** Bibliotecario (y usuario después de aprobación)  
**Precondiciones:** Certificado generado  
**Pasos:**
1. Abrir solicitud
2. Hacer clic en "Descargar Certificado"
3. Archivo descarga

**Resultado Esperado:**
- PDF descarga con nombre descriptivo (certificado-{tipo}-{usuario}-{fecha}.pdf)
- Descarga es rápida (<500ms)
- Archivo íntegro

**Criterios de Aceptación:**
- ✅ Descarga funciona
- ✅ Archivo no está corrompido
- ✅ Nombre es claro

---

### REQ-BIB-009: Filtrar por Estado
**Descripción:** El bibliotecario filtra solicitudes por estado  
**Actores:** Bibliotecario  
**Precondiciones:** Hay solicitudes en varios estados  
**Pasos:**
1. Usar selector de estado
2. Seleccionar uno o múltiples estados
3. Aplicar filtro

**Resultado Esperado:**
- Tabla se filtra mostrando solo esos estados
- Estados disponibles: Verificando, En Revisión, Finalizado, Rechazado
- Puede limpiar filtro

**Criterios de Aceptación:**
- ✅ Filtro es preciso
- ✅ Multi-select funciona
- ✅ Búsqueda rápida

---

### REQ-BIB-010: Búsqueda por Código o Usuario
**Descripción:** El bibliotecario busca una solicitud específica  
**Actores:** Bibliotecario  
**Precondiciones:** Hay solicitudes en BD  
**Pasos:**
1. Ingresar código o nombre de usuario en buscador
2. Presionar Enter
3. Ver resultados

**Resultado Esperado:**
- Resultados filtrados relevantes
- Búsqueda case-insensitive
- Búsqueda parcial funciona
- Respuesta rápida

**Criterios de Aceptación:**
- ✅ Búsqueda es precisa
- ✅ Parcial funciona
- ✅ <300ms de respuesta

---

### REQ-BIB-011: Ver Historial de Revisiones
**Descripción:** El bibliotecario ve el historial de cambios de cada solicitud  
**Actores:** Bibliotecario  
**Precondiciones:** Solicitud expandida  
**Pasos:**
1. Abrir detalles de solicitud
2. Ver sección "Historial de Cambios"
3. Ver cada cambio con detalles

**Resultado Esperado:**
- Historial muestra:
  - Fecha y hora del cambio
  - Usuario que hizo el cambio
  - Estado anterior → Estado nuevo
  - Comentarios (si los hay)
- Ordenado cronológicamente

**Criterios de Aceptación:**
- ✅ Todos los cambios se registran
- ✅ Información es precisa
- ✅ Formato es legible

---

### REQ-BIB-012: Generar Reporte de Emisiones
**Descripción:** El bibliotecario genera reporte de certificados emitidos  
**Actores:** Bibliotecario  
**Precondiciones:** Hay solicitudes aprobadas  
**Pasos:**
1. Ir a sección "Reportes"
2. Seleccionar rango de fechas
3. Seleccionar tipo de reporte (Diario/Semanal/Mensual)
4. Generar reporte
5. Ver resumen

**Resultado Esperado:**
- Reporte muestra:
  - Total de certificados emitidos
  - Desglose por tipo de trámite
  - Desglose por usuario
  - Listado de solicitudes aprobadas
- Exportable a PDF/Excel

**Criterios de Aceptación:**
- ✅ Números son precisos
- ✅ Desglose es detallado
- ✅ Exportación funciona

---

### REQ-BIB-013: Exportar Reporte a Excel
**Descripción:** El bibliotecario exporta reportes en Excel  
**Actores:** Bibliotecario  
**Precondiciones:** Reporte generado  
**Pasos:**
1. Hacer clic en "Descargar Excel"
2. Seleccionar ubicación
3. Archivo guarda

**Resultado Esperado:**
- .xlsx válido descargado
- Contiene todas las columnas
- Formato profesional

**Criterios de Aceptación:**
- ✅ Excel abre correctamente
- ✅ Datos son correctos

---

### REQ-BIB-014: Marcar Como Revisado
**Descripción:** El bibliotecario puede marcar una solicitud como revisada (sin aprobar ni rechazar aún)  
**Actores:** Bibliotecario  
**Precondiciones:** Solicitud en estado "Verificando"  
**Pasos:**
1. Abrir solicitud
2. Hacer clic en "Marcar como Revisado"
3. Guardar

**Resultado Esperado:**
- Estado cambia a "En Revisión"
- Timestamp de revisión se registra
- Solicitud se mueve en prioridad

**Criterios de Aceptación:**
- ✅ Estado se actualiza
- ✅ Historial registra cambio

---

### REQ-BIB-015: Reasignar Revisión
**Descripción:** Un bibliotecario puede reasignar una solicitud a otro bibliotecario  
**Actores:** Bibliotecario (con permisos)  
**Precondiciones:** Solicitud sin aprobar/rechazar  
**Pasos:**
1. Abrir solicitud
2. Hacer clic en "Reasignar"
3. Seleccionar otro bibliotecario
4. Confirmar

**Resultado Esperado:**
- Solicitud se asigna a nuevo revisador
- Notificación se envía al nuevo asignado
- Historial registra reasignación

**Criterios de Aceptación:**
- ✅ Reasignación funciona
- ✅ Notificación enviada
- ✅ Historial actualizado

---

## 3. CASOS DE PRUEBA FRONTEND

### TC-FE-001: Acceso al Módulo Bibliotecario
**Objetivo:** Verificar que solo usuario con rol Bibliotecario accede  
**Precondiciones:**
- Usuario autenticado con rol Bibliotecario

**Pasos:**
1. Navegar a /bibliotecario
2. Verificar acceso

**Resultado Esperado:**
- Página carga
- Dashboard visible
- Menú de opciones disponible

**Validaciones:**
- ✅ Página se carga sin errores
- ✅ Acceso es inmediato

---

### TC-FE-002: Denegación de Acceso - Rol Incorrecto
**Objetivo:** Verificar que otros roles no acceden  
**Precondiciones:**
- Usuario autenticado pero NO es Bibliotecario

**Pasos:**
1. Intentar navegar a /bibliotecario
2. Observar resultado

**Resultado Esperado:**
- Error 403 O redirección a ruta permitida

---

### TC-FE-003: Listado de Solicitudes para Revisar
**Objetivo:** Verificar que se muestran solicitudes en estados correctos  
**Precondiciones:**
- Hay solicitudes pagadas sin revisar
- Bibliotecario autenticado

**Pasos:**
1. Acceder a /bibliotecario
2. Ver listado

**Resultado Esperado:**
- Tabla muestra solicitudes con estado "Verificando" y "En Revisión"
- Ordenadas por fecha (más antiguas primero)
- Información: código, usuario, trámite, fecha, estado

**Validaciones:**
- ✅ Todos los registros se cargan
- ✅ Información es precisa
- ✅ Ordenamiento es correcto

---

### TC-FE-004: Expandir Detalles de Solicitud
**Objetivo:** Verificar que detalles se expanden  
**Precondiciones:**
- Hay solicitudes en listado

**Pasos:**
1. Hacer clic en fila
2. Ver detalles expandidos

**Resultado Esperado:**
- Fila se expande mostrando:
  - Datos del usuario
  - Documentos adjuntos (tabla)
  - Botones de acción
  - Historial de cambios
- Animación suave

**Validaciones:**
- ✅ Todos los datos visibles
- ✅ Responsive en mobile

---

### TC-FE-005: Tabla de Documentos
**Objetivo:** Verificar que documentos se muestran correctamente  
**Precondiciones:**
- Solicitud expandida
- Documentos adjuntos existen

**Pasos:**
1. Ver tabla de documentos
2. Verificar cada fila

**Resultado Esperado:**
- Tabla muestra: Tipo, Nombre, Fecha carga, Botones (Ver, Descargar)
- Botones son clickeables
- Cada documento es identificable

**Validaciones:**
- ✅ Información completa
- ✅ Botones funcionan
- ✅ Tabla es legible

---

### TC-FE-006: Botón Ver/Preview Documento
**Objetivo:** Verificar que preview abre  
**Precondiciones:**
- Documento en tabla

**Pasos:**
1. Hacer clic en botón "Ver"
2. Esperar carga

**Resultado Esperado:**
- Modal o nueva ventana abre
- PDF/Imagen se muestra
- Zoom disponible si es necesario
- Botón cerrar disponible

**Validaciones:**
- ✅ Preview carga rápido
- ✅ Imagen/PDF legible
- ✅ Cerrar funciona

---

### TC-FE-007: Botón Descargar Documento
**Objetivo:** Verificar que descarga funciona  
**Precondiciones:**
- Documento en tabla

**Pasos:**
1. Hacer clic en "Descargar"
2. Esperar

**Resultado Esperado:**
- Archivo descarga
- Nombre descriptivo
- Descarga rápida (<500ms)

**Validaciones:**
- ✅ Descarga inicia
- ✅ Nombre es claro
- ✅ Archivo íntegro

---

### TC-FE-008: Checkbox Válido/Inválido en Documento
**Objetivo:** Verificar que se pueden marcar documentos  
**Precondiciones:**
- Documento visible

**Pasos:**
1. Hacer clic en checkbox "Válido"
2. Verificar cambio
3. Hacer clic en "Inválido"
4. Verificar cambio

**Resultado Esperado:**
- Checkbox cambia estado
- Si "Inválido", campo de comentario aparece
- Cambio se guarda automáticamente
- Visual feedback

**Validaciones:**
- ✅ Cambios se guardan
- ✅ UI es intuitiva

---

### TC-FE-009: Campo de Comentarios
**Objetivo:** Verificar que comentarios funcionan  
**Precondiciones:**
- Documento marcado como "Inválido"

**Pasos:**
1. Campo de comentario aparece
2. Ingresar comentario (30 caracteres)
3. Presionar Tab o clic afuera
4. Verificar guardado

**Resultado Esperado:**
- Comentario se muestra bajo documento
- Muestra: texto, autor, fecha
- Puede editar después
- Puede eliminar

**Validaciones:**
- ✅ Guardado automático
- ✅ Edición funciona
- ✅ Historial se mantiene

---

### TC-FE-010: Botón Aprobar Solicitud
**Objetivo:** Verificar que UI del botón funciona  
**Precondiciones:**
- Todos los documentos son "Válido"
- Solicitud expandida

**Pasos:**
1. Localizar botón "Aprobar"
2. Hacer clic
3. Modal de confirmación aparece

**Resultado Esperado:**
- Botón es prominente (verde)
- Modal: "¿Está seguro de aprobar?"
- Botones: Cancelar, Confirmar
- Después: estado cambia, notificación

**Validaciones:**
- ✅ Botón solo disponible si todos son válidos
- ✅ Confirmación previene accidentes

---

### TC-FE-011: Botón Rechazar Solicitud
**Objetivo:** Verificar que UI del rechazo funciona  
**Precondiciones:**
- Hay documentos inválidos

**Pasos:**
1. Localizar botón "Rechazar"
2. Hacer clic
3. Modal pide confirmación

**Resultado Esperado:**
- Botón es visible (rojo)
- Modal muestra documentos inválidos
- Resumen de comentarios
- Botones: Cancelar, Confirmar

**Validaciones:**
- ✅ Botón siempre visible
- ✅ Modal muestra contexto

---

### TC-FE-012: Confirmar Rechazo
**Objetivo:** Verificar proceso de rechazo  
**Precondiciones:**
- Modal de rechazo abierto

**Pasos:**
1. Revisar información
2. Hacer clic en "Confirmar"
3. Esperar procesamiento

**Resultado Esperado:**
- Modal cierra
- Estado cambia a "Rechazado"
- Notificación toast: "Solicitud rechazada"
- Usuario es notificado por correo
- Solicitud desaparece del listado

**Validaciones:**
- ✅ Cambio es inmediato
- ✅ Notificaciones enviadas
- ✅ Feedback visual claro

---

### TC-FE-013: Generar Certificado - Modal
**Objetivo:** Verificar que modal de certificado aparece  
**Precondiciones:**
- Solicitud aprobada o en "En Revisión"

**Pasos:**
1. Hacer clic en "Generar Certificado"
2. Modal aparece

**Resultado Esperado:**
- Modal muestra:
  - Preview de certificado (con datos pre-llenados)
  - Campos editables (si necesario)
  - Botones: Cancelar, Descargar, Guardar

**Validaciones:**
- ✅ Preview es exacto
- ✅ Campos están pre-llenados
- ✅ Modal es responsive

---

### TC-FE-014: Descargar Certificado Generado
**Objetivo:** Verificar descarga de certificado  
**Precondiciones:**
- Modal de certificado abierto

**Pasos:**
1. Hacer clic en "Descargar"
2. Esperar

**Resultado Esperado:**
- PDF descarga inmediatamente
- Nombre: certificado-{tipo}-{usuario}-{fecha}.pdf
- Certificado es completo

**Validaciones:**
- ✅ Descarga funciona
- ✅ PDF es válido
- ✅ Nombre es claro

---

### TC-FE-015: Filtro de Estado
**Objetivo:** Verificar filtro de estado  
**Precondiciones:**
- Hay solicitudes en varios estados

**Pasos:**
1. Usar selector de estado
2. Seleccionar "Finalizado"
3. Ver cambio en tabla

**Resultado Esperado:**
- Tabla se filtra
- Solo "Finalizado" se muestra
- Multi-select permite múltiples
- Limpiar filtro vuelve a mostrar todos

**Validaciones:**
- ✅ Filtro es preciso
- ✅ Performance acceptable

---

### TC-FE-016: Historial de Cambios
**Objetivo:** Verificar que historial se muestra  
**Precondiciones:**
- Solicitud con cambios previos

**Pasos:**
1. Expandir solicitud
2. Ver sección "Historial"
3. Revisar entradas

**Resultado Esperado:**
- Cada cambio muestra: fecha, usuario, cambio (estado anterior → nuevo)
- Ordenado cronológicamente
- Información completa

**Validaciones:**
- ✅ Todos los cambios se registran
- ✅ Información es precisa

---

### TC-FE-017: Búsqueda por Código
**Objetivo:** Verificar búsqueda  
**Precondiciones:**
- Hay solicitudes

**Pasos:**
1. Ingresar código (ej: TRAM-001)
2. Presionar Enter
3. Ver resultados

**Resultado Esperado:**
- Tabla se filtra
- Búsqueda parcial funciona
- Resultados rápidos

**Validaciones:**
- ✅ Búsqueda es precisa
- ✅ Case-insensitive

---

### TC-FE-018: Sección de Reportes
**Objetivo:** Verificar acceso a reportes  
**Precondiciones:**
- Bibliotecario autenticado

**Pasos:**
1. Navegar a "Reportes"
2. Ver opciones

**Resultado Esperado:**
- Selectores de fechas disponibles
- Opciones de tipo de reporte
- Botón "Generar Reporte"

**Validaciones:**
- ✅ Página carga
- ✅ Controles disponibles

---

### TC-FE-019: Generar Reporte
**Objetivo:** Verificar generación de reporte  
**Precondiciones:**
- En sección reportes

**Pasos:**
1. Seleccionar fechas
2. Hacer clic "Generar"
3. Esperar

**Resultado Esperado:**
- Tabla de reporte aparece
- Datos se muestran
- Botones de descargar disponibles

**Validaciones:**
- ✅ Tabla se carga
- ✅ Datos son correctos

---

### TC-FE-020: Responsive Mobile
**Objetivo:** Verificar diseño mobile  
**Precondiciones:**
- Browser 375px width

**Pasos:**
1. Acceder a /bibliotecario desde mobile
2. Navegar por funciones

**Resultado Esperado:**
- Layout es responsive
- Tabla scrolleable
- Botones clickeables (>44px)
- Modales adaptados

**Validaciones:**
- ✅ Funcionalidad completa
- ✅ Legibilidad mantenida

---

### TC-FE-021: Logout
**Objetivo:** Verificar logout funciona  
**Precondiciones:**
- Bibliotecario autenticado

**Pasos:**
1. Hacer clic en usuario
2. Seleccionar "Cerrar Sesión"
3. Confirmar

**Resultado Esperado:**
- Sesión se cierra
- Redirección a /auth/login
- localStorage limpio

**Validaciones:**
- ✅ Logout es seguro
- ✅ Sin residuos

---

## 4. CASOS DE PRUEBA API

### TC-API-001: GET /api/bibliotecario/solicitudes
**Objetivo:** Obtener lista de solicitudes para revisar  
**Método:** GET  
**Endpoint:** /api/bibliotecario/solicitudes?estado=Verificando&page=1&limit=10

**Precondiciones:**
- Usuario autenticado con rol Bibliotecario

**Request:**
```
GET /api/bibliotecario/solicitudes HTTP/1.1
Cookie: auth-token=<jwt>
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_solicitud": 1,
      "codigo_tramite": "TRAM-001",
      "usuario": {...},
      "tramite": {...},
      "estado": "Verificando",
      "fecha_creacion": "2026-06-01T10:00:00Z",
      "documentos": [...]
    }
  ],
  "total": 5,
  "page": 1
}
```

**Validaciones:**
- ✅ Solo estados "Verificando", "En Revisión"
- ✅ Paginación funciona
- ✅ Datos correctos

---

### TC-API-002: GET /api/bibliotecario/solicitud/{id}
**Objetivo:** Obtener detalles completos de solicitud  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_solicitud": 1,
    "usuario": {...},
    "documentos": [
      {
        "id": 1,
        "tipo": "Cédula",
        "path": "...",
        "estado_revision": "Pendiente",
        "comentarios": []
      }
    ],
    "historial": [...]
  }
}
```

---

### TC-API-003: POST /api/bibliotecario/validar-documento
**Objetivo:** Marcar documento como válido/inválido  
**Método:** POST  

**Request:**
```json
{
  "id_documento": 1,
  "es_valido": true,
  "comentario": "Documento legible"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_documento": 1,
    "estado_revision": "Válido",
    "comentario": "..."
  }
}
```

---

### TC-API-004: POST /api/bibliotecario/aprobar-solicitud
**Objetivo:** Aprobar una solicitud  
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
  "message": "Solicitud aprobada",
  "data": {
    "id_solicitud": 1,
    "estado": "Finalizado",
    "certificado_generado": true
  }
}
```

**Validaciones:**
- ✅ BD se actualiza
- ✅ Certificado se crea
- ✅ Usuario notificado

---

### TC-API-005: POST /api/bibliotecario/rechazar-solicitud
**Objetivo:** Rechazar una solicitud  
**Método:** POST  

**Request:**
```json
{
  "id_solicitud": 1,
  "motivo": "Documentos incompletos"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id_solicitud": 1,
    "estado": "Rechazado",
    "motivo_rechazo": "..."
  }
}
```

---

### TC-API-006: POST /api/bibliotecario/generar-certificado
**Objetivo:** Generar certificado PDF  
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
    "certificado_id": 1,
    "numero_registro": "CERT-2026-00001",
    "documento_ruta": "/uploads/certificados/...",
    "fecha_emision": "2026-06-03T14:30:00Z"
  }
}
```

---

### TC-API-007: GET /api/bibliotecario/descargar-certificado?id_solicitud=1
**Objetivo:** Descargar certificado  
**Método:** GET  

**Resultado Esperado (200 OK):**
- Content-Type: application/pdf
- Archivo válido descargado

---

### TC-API-008: GET /api/bibliotecario/reportes
**Objetivo:** Generar reporte de emisiones  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "periodo": "2026-06-01 to 2026-06-30",
    "total_certificados": 20,
    "desglose": [...]
  }
}
```

---

### TC-API-009: POST /api/bibliotecario/marcar-revisado
**Objetivo:** Marcar como revisado  
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
    "estado": "En Revisión",
    "fecha_revision": "2026-06-03T14:30:00Z"
  }
}
```

---

### TC-API-010: GET /api/bibliotecario/solicitudes?search=TRAM-001
**Objetivo:** Buscar solicitud  
**Método:** GET  

**Resultado Esperado (200 OK):**
- Solo solicitud coincidente

---

## 5. CASOS DE PRUEBA BACKEND

### TC-BD-001: Inserción de Revisión en Historial
**Objetivo:** Verificar que cada revisión se registra  
**Proceso:**
1. Crear revisión a través de API
2. Consultar tabla de historial

**Validaciones:**
- ✅ Registro en tabla historial_revisiones
- ✅ id_solicitud referencia correctamente
- ✅ id_bibliotecario guardado
- ✅ Timestamp presente

---

### TC-BD-002: Validación de Documentos
**Objetivo:** Verificar que estado de documento se actualiza  
**Proceso:**
1. Marcar documento como válido
2. Consultar BD

**Validaciones:**
- ✅ estado_revision = "Válido"
- ✅ comentario se guarda
- ✅ fecha_revision presente

---

### TC-BD-003: Cascada de Aprobación
**Objetivo:** Verificar que aprobación crea certificado  
**Proceso:**
1. Aprobar solicitud
2. Consultar tabla certificados

**Validaciones:**
- ✅ Certificado creado
- ✅ id_solicitud referencia
- ✅ numero_registro único
- ✅ documento_ruta guardado

---

### TC-BD-004: Constraints - Estado Válido
**Objetivo:** Verificar que solo estados válidos se permiten  
**Proceso:**
1. Intentar insertar estado inválido
2. Observar error

**Validaciones:**
- ✅ CHECK constraint en estado
- ✅ Estados válidos: Verificando, En Revisión, Finalizado, Rechazado

---

### TC-BD-005: Índices de Performance
**Objetivo:** Verificar índices existen  
**Query:**
```sql
SHOW INDEXES FROM solicitudes_tramite;
```

**Validaciones:**
- ✅ Índice en estado
- ✅ Índice en id_usuario
- ✅ Índice en fecha_creacion

---

## 6. CASOS DE PRUEBA DE SEGURIDAD

### TC-SEC-001: Autenticación Requerida
**Objetivo:** Verificar que solo usuarios autenticados acceden  
**Proceso:**
1. Acceder a /bibliotecario sin token
2. Observar resultado

**Resultado Esperado:**
- Error 401 O redirección a login

---

### TC-SEC-002: Rol Requerido
**Objetivo:** Verificar que solo Bibliotecarios acceden  
**Proceso:**
1. Usuario Cajero intenta acceder
2. Observar resultado

**Resultado Esperado:**
- Error 403 Forbidden

---

### TC-SEC-003: Inyección SQL en Búsqueda
**Objetivo:** Verificar prevención de inyección  
**Proceso:**
1. GET /api/bibliotecario/solicitudes?search=1' OR '1'='1
2. Observar resultado

**Resultado Esperado:**
- Sin datos no autorizados
- Query parametrizada

---

### TC-SEC-004: XSS en Comentarios
**Objetivo:** Verificar que comentarios se sanitizan  
**Proceso:**
1. POST con comentario: `<script>alert('xss')</script>`
2. Verificar BD

**Resultado Esperado:**
- Script se escapa
- BD guarda como string

---

### TC-SEC-005: File Download Security
**Objetivo:** Verificar que solo archivos permitidos se descargan  
**Proceso:**
1. Intentar descargar archivo fuera de uploads: `/../../etc/passwd`
2. Observar resultado

**Resultado Esperado:**
- Error 404 o 403
- Sin acceso a archivos sistema

---

## 7. DATOS DE PRUEBA

### Usuarios de Prueba
```sql
INSERT INTO usuarios (correo, nombre, rol) VALUES
('bibliotecario@univalle.edu.co', 'Carlos García', 'Bibliotecario');
```

### Solicitudes para Revisar
```sql
INSERT INTO solicitudes_tramite (id_usuario, id_tramite, estado) VALUES
(2, 1, 'Verificando'),
(3, 2, 'En Revisión');
```

---

## 8. PRIORIDADES

### Crítico
- TC-API-004: Aprobar solicitud
- TC-BD-001: Historial registra
- TC-SEC-001: Autenticación

### Alto
- TC-FE-003: Listado solicitudes
- TC-API-001: GET solicitudes
- TC-API-006: Generar certificado

### Medio
- TC-FE-018: Reportes
- TC-API-008: Reportes

---

## 9. MÉTRICAS

| Métrica | Meta |
|---------|------|
| **Total Casos** | 47 |
| **Tasa Éxito** | ≥95% |
| **Cobertura** | ≥90% |

---

**Documento Preparado Por:** QA Team  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Activo
