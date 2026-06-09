# QA - Requerimientos y Casos de Prueba - Módulo USUARIO

**Proyecto:** Sistema de Gestión de Trámites - Universidad del Valle  
**Módulo:** Usuario  
**Versión:** 1.0  
**Fecha:** Junio 2026

---

## 📋 Tabla de Contenidos

1. [Requerimientos Funcionales](#requerimientos-funcionales)
2. [Casos de Prueba Frontend](#casos-de-prueba-frontend)
3. [Casos de Prueba API](#casos-de-prueba-api)
4. [Casos de Prueba Backend](#casos-de-prueba-backend)
5. [Datos de Prueba](#datos-de-prueba)

---

## 1. Requerimientos Funcionales

### 1.1 Autenticación y Sesión

**REQ-USR-001: Verificación de Sesión del Usuario**
- El usuario debe poder verificar si tiene una sesión activa
- La sesión debe persistir durante toda la navegación dentro del módulo de usuario
- La sesión debe expirar después de un tiempo de inactividad (configurable)
- Al expirar, debe redirigir automáticamente al login
- Las credenciales deben almacenarse de forma segura en cookies

**REQ-USR-002: Cierre de Sesión**
- El usuario debe poder cerrar sesión manualmente desde cualquier página
- Al cerrar sesión, debe limpiar el carrito de trámites del localStorage
- Al cerrar sesión, debe limpiar los datos temporales de solicitudes
- Debe redirigir a la página de login después del cierre

**REQ-USR-003: Protección de Rutas**
- Las rutas `/usuario/*` deben requerir autenticación
- Si no hay sesión, debe redirigir a `/auth/login`
- La redirección debe mantener la URL original para después del login

### 1.2 Selección y Gestión del Carrito

**REQ-USR-004: Listado de Trámites Disponibles**
- Mostrar todos los trámites disponibles en `/usuario/SeleccionTramites`
- Cada trámite debe mostrar: nombre, descripción, costo, requisitos
- Debe tener filtro de búsqueda por nombre
- El catálogo debe cargarse desde la BD

**REQ-USR-005: Agregar Trámite al Carrito**
- Permitir agregar múltiples trámites al carrito
- Evitar duplicados en el carrito (si está, aumentar cantidad o ignorar)
- El carrito debe persistir en localStorage con clave `carrito-tramites`
- Mostrar confirmación visual cuando se agrega un trámite

**REQ-USR-006: Gestión del Carrito**
- Ver carrito en `/usuario/carrito` con lista de trámites seleccionados
- Eliminar trámites individuales del carrito
- Calcular total automáticamente
- Vaciar carrito completo
- El carrito debe estar disponible desde cualquier página (acceso en header)

**REQ-USR-007: Persistencia del Carrito**
- Carrito debe persistir al cerrar navegador
- Carrito debe vaciarse al desconectar/logout del usuario
- Carrito debe vaciarse tras completar una solicitud exitosa

### 1.3 Formulario de Solicitud

**REQ-USR-008: Paso 1 - Datos Personales**
- Campo Nombre Completo: pre-llenado desde BD, no editable
- Campo Carrera: obligatorio, dropdown/autocomplete con búsqueda
- Campo Sub Sede: obligatorio, dropdown con 5 opciones
- Validación de campos obligatorios antes de avanzar al paso 2

**REQ-USR-009: Paso 2 - Carga de Documentos**
- Por cada trámite, mostrar lista de documentos requeridos
- Cada documento debe permitir carga de archivo (PDF, PNG, JPG)
- Validar tipo de archivo antes de enviar
- Mostrar nombre de archivo cargado
- Permitir reemplazar archivo cargado

**REQ-USR-010: Paso 3 - Datos de Factura**
- Campo NIT/CI: obligatorio, mín 5 caracteres
- Campo Nombre para Factura: obligatorio
- Validar campos antes de avanzar a paso 4

**REQ-USR-011: Paso 4 - Comprobante de Pago**
- Aceptar solo PDF, PNG, JPG/JPEG
- Validar tamaño máximo (ej: 10MB)
- Subir comprobante y crear solicitud
- Mostrar resumen de solicitud completa antes de confirmar

**REQ-USR-012: Envío de Solicitud**
- Crear solicitud en BD
- Generar código único de seguimiento
- Crear trámites asociados a la solicitud
- Subir todos los archivos (documentos + comprobante)
- Limpiar carrito después de éxito
- Redirigir a página de confirmación

### 1.4 Historial de Trámites

**REQ-USR-013: Listado de Historial**
- Mostrar todos los trámites del usuario en `/usuario/historial`
- Mostrar: tipo de trámite, fecha, estado, código de seguimiento
- Ordenar por fecha descendente (más recientes primero)

**REQ-USR-014: Filtrado por Estado**
- Filtros: Todos, Recibido, En Revisión, Pago Pendiente, Pagado, Finalizado, Rechazado
- Mostrar contador de trámites por estado
- Aplicar filtro dinámicamente sin recargar página

**REQ-USR-015: Acciones en Historial**
- Botón "Ver Detalles" que abre página de consulta-tramite
- Botón "Descargar Factura" para trámites con factura disponible
- Botón "Ver y Descargar Certificado" para trámites finalizados
- Mostrar QR de verificación para trámites finalizados

### 1.5 Consulta Detallada de Trámite

**REQ-USR-016: Información del Trámite**
- Mostrar nombre, costo, fecha de solicitud
- Mostrar estado actual con indicador visual
- Mostrar línea de tiempo de estados completados
- Mostrar código de seguimiento copiable

**REQ-USR-017: Acciones en Consulta**
- Botón "Vista Previa" de factura (abre en nueva pestaña)
- Botón "Descargar" factura (descarga archivo)
- Botón "Imprimir" factura (abre diálogo de impresión)
- Botones separados para factura y navegación

### 1.6 Descargas de Documentos

**REQ-USR-018: Descarga de Factura**
- Obtener factura desde `/api/usuario/descargar-documento-factura`
- Validar que solicitud pertenece al usuario autenticado
- Retornar archivo PDF/imagen con headers correctos
- Nombre de descarga: `factura-{id_solicitud}.pdf`

**REQ-USR-019: Certificado**
- Certificados solo para trámites en estado 7 (Finalizado)
- Contener: datos estudiante, trámite realizado, firma digital
- Generable desde `/api/certificados/[codigo]`

### 1.7 Datos Activos y Notificaciones

**REQ-USR-020: Trámites Activos en Landing**
- Mostrar en `/usuario/landing` sección "Tus Trámites Activos"
- Sección colapsible mostrando hasta 3 últimos trámites
- Cada trámite con: código, tipo, estado, fecha
- Botón para expandir y ver todos

**REQ-USR-021: Marcar Trámite Como Visto**
- Automatizar al abrir `/usuario/consulta-tramite`
- API: POST `/api/usuario/marcar-tramite-visto`
- Prevenir notificaciones para trámites ya vistos

---

## 2. Casos de Prueba Frontend

### 2.1 Página: Selección de Trámites (`/usuario/SeleccionTramites`)

#### TC-FE-001: Carga del Listado de Trámites
```
Precondiciones: Usuario autenticado
Pasos:
  1. Navegar a /usuario/SeleccionTramites
  2. Esperar carga de trámites

Resultado Esperado:
  ✓ Se muestra listado con mínimo 4 trámites
  ✓ Cada trámite muestra: nombre, descripción, costo, requisitos
  ✓ No hay errores en consola
  ✓ Página carga en menos de 3 segundos
```

#### TC-FE-002: Búsqueda y Filtrado
```
Precondiciones: Página de selección cargada
Pasos:
  1. Ingresar texto de búsqueda (ej: "Cambio")
  2. Sistema debe filtrar en tiempo real

Resultado Esperado:
  ✓ Muestra solo trámites coincidentes
  ✓ Al borrar búsqueda, muestra todos de nuevo
  ✓ Búsqueda insensible a mayúsculas/minúsculas
```

#### TC-FE-003: Agregar Trámite al Carrito
```
Precondiciones: Página de selección cargada
Pasos:
  1. Hacer clic en "Agregar al Carrito" de un trámite
  2. Verificar que aparezca confirmación
  3. Revisar localStorage carrito-tramites

Resultado Esperado:
  ✓ Botón cambia a "En Carrito" / deshabilitado
  ✓ Contador de carrito aumenta en header
  ✓ localStorage contiene el trámite agregado
  ✓ Datos: id, name, costo, descripción, requisitos
```

#### TC-FE-004: Agregar Múltiples Trámites
```
Precondiciones: Página de selección cargada
Pasos:
  1. Agregar 3 trámites diferentes al carrito
  2. Ir a /usuario/carrito

Resultado Esperado:
  ✓ Carrito muestra 3 trámites
  ✓ Total se calcula correctamente (suma costos)
  ✓ Cada trámite tiene botón "Eliminar"
```

### 2.2 Página: Carrito (`/usuario/carrito`)

#### TC-FE-005: Visualización del Carrito
```
Precondiciones: Usuario con trámites en carrito
Pasos:
  1. Navegar a /usuario/carrito
  2. Revisar contenido

Resultado Esperado:
  ✓ Lista de trámites seleccionados visible
  ✓ Resumen con cantidad y total a la derecha
  ✓ Total correcto: suma de costos
  ✓ Botones: Confirmar, Continuar Seleccionando
```

#### TC-FE-006: Eliminar Trámite
```
Precondiciones: Carrito con múltiples trámites
Pasos:
  1. Hacer clic en botón "Eliminar" de un trámite
  2. Revisar actualización

Resultado Esperado:
  ✓ Trámite desaparece de lista
  ✓ Total se recalcula
  ✓ localStorage actualizado
  ✓ Cantidad disminuye
```

#### TC-FE-007: Carrito Vacío
```
Precondiciones: Carrito sin trámites
Pasos:
  1. Navegar a /usuario/carrito con carrito vacío
  2. Revisar estado

Resultado Esperado:
  ✓ Muestra mensaje "Carrito Vacío"
  ✓ Botón "Confirmar" deshabilitado o muestra alerta
  ✓ Enlace a "Ver Trámites Disponibles"
```

### 2.3 Página: Formulario (`/usuario/formulario`)

#### TC-FE-008: Paso 1 - Validación de Datos
```
Precondiciones: Formulario en paso 1, carrito con trámites
Pasos:
  1. Dejar campos vacíos y hacer clic "Siguiente"
  2. Rellenar Carrera y Sub Sede
  3. Hacer clic "Siguiente"

Resultado Esperado:
  ✓ Paso 1: muestra errores de campos requeridos
  ✓ Paso 2: Nombre Completo pre-llenado y no editable
  ✓ Avanza a paso 2 sin errores
```

#### TC-FE-009: Paso 2 - Carga de Documentos
```
Precondiciones: En paso 2 del formulario
Pasos:
  1. Revisar documentos requeridos
  2. Subir archivos válidos (PDF/PNG)
  3. Intentar subir archivo inválido
  4. Avanzar a paso 3

Resultado Esperado:
  ✓ Muestra lista de documentos por trámite
  ✓ Archivo válido: se carga, muestra nombre
  ✓ Archivo inválido: error "Solo PDF, PNG o JPG"
  ✓ Todos requeridos, avanza a paso 3
```

#### TC-FE-010: Paso 3 - Datos de Factura
```
Precondiciones: En paso 3 del formulario
Pasos:
  1. Dejar NIT/CI y Nombre vacíos, avanzar
  2. Rellenar con datos válidos
  3. Avanzar a paso 4

Resultado Esperado:
  ✓ Paso 3: muestra errores de validación
  ✓ NIT/CI: mínimo 5 caracteres
  ✓ Nombre: requerido
  ✓ Avanza a paso 4 sin errores
```

#### TC-FE-011: Paso 4 - Comprobante de Pago
```
Precondiciones: En paso 4 del formulario
Pasos:
  1. Intentar avanzar sin comprobante
  2. Subir archivo inválido
  3. Subir PDF válido
  4. Hacer clic "Confirmar"

Resultado Esperado:
  ✓ Alerta "Debe subir el comprobante"
  ✓ Archivo inválido: error de tipo
  ✓ Archivo válido: muestra nombre
  ✓ Envío: loading spinner, esperar respuesta
```

#### TC-FE-012: Confirmación de Solicitud
```
Precondiciones: Solicitud enviada exitosamente
Pasos:
  1. Esperar redirección a /usuario/confirmacion-pago
  2. Revisar datos mostrados

Resultado Esperado:
  ✓ Página con "¡Solicitud Registrada!"
  ✓ Código de seguimiento visible
  ✓ Resumen de trámites
  ✓ Total monto pagado
  ✓ Fecha de procesamiento
```

#### TC-FE-013: Carrito Limpiado Tras Solicitud
```
Precondiciones: Solicitud enviada exitosamente
Pasos:
  1. Regresar a /usuario/carrito o /usuario/SeleccionTramites
  2. Revisar estado del carrito

Resultado Esperado:
  ✓ Carrito vacío
  ✓ localStorage `carrito-tramites` eliminado
  ✓ Contador en header muestra 0
```

### 2.4 Página: Historial (`/usuario/historial`)

#### TC-FE-014: Carga del Historial
```
Precondiciones: Usuario autenticado con trámites
Pasos:
  1. Navegar a /usuario/historial
  2. Esperar carga

Resultado Esperado:
  ✓ Listado de trámites del usuario
  ✓ Cada trámite muestra: tipo, fecha, estado
  ✓ Ordenado por fecha descendente
  ✓ Indicadores de estado con colores
```

#### TC-FE-015: Filtrado por Estado
```
Precondiciones: Historial cargado con múltiples estados
Pasos:
  1. Hacer clic en filtro "Finalizado"
  2. Revisar resultados
  3. Hacer clic "Todos"

Resultado Esperado:
  ✓ Muestra solo trámites finalizados
  ✓ Contador: "Finalizado (X)"
  ✓ "Todos" muestra lista completa
  ✓ Filtro sin recarga de página
```

#### TC-FE-016: Botón "Ver Detalles"
```
Precondiciones: Historial cargado
Pasos:
  1. Hacer clic en "Ver Detalles" de un trámite
  2. Esperar navegación

Resultado Esperado:
  ✓ Redirige a /usuario/consulta-tramite?codigo={codigo}
  ✓ Página detalle muestra toda la información
```

#### TC-FE-017: Descarga de Factura desde Historial
```
Precondiciones: Trámite con factura disponible
Pasos:
  1. Hacer clic "Descargar Factura"
  2. Esperar descarga

Resultado Esperado:
  ✓ Inicia descarga de archivo PDF
  ✓ Nombre: factura-{id_solicitud}.pdf
  ✓ Abre correctamente en lector PDF
```

### 2.5 Página: Consulta Detallada (`/usuario/consulta-tramite`)

#### TC-FE-018: Carga de Detalles
```
Precondiciones: URL con código válido: ?codigo=UV-2026-XXXXX
Pasos:
  1. Navegar a /usuario/consulta-tramite?codigo={codigo}
  2. Esperar carga

Resultado Esperado:
  ✓ Muestra nombre del trámite
  ✓ Estado actual con icono y color
  ✓ Costo y fecha de solicitud
  ✓ Código copiable
```

#### TC-FE-019: Línea de Tiempo de Estados
```
Precondiciones: Página de consulta cargada
Pasos:
  1. Revisar progreso del trámite
  2. Verificar estados alcanzados vs pendientes

Resultado Esperado:
  ✓ Muestra 8 estados posibles
  ✓ Estados alcanzados: circulación roja
  ✓ Estados pendientes: circulación gris
  ✓ Estado actual marcado como "Actual"
```

#### TC-FE-020: Botones de Factura
```
Precondiciones: Página consulta cargada
Pasos:
  1. Hacer clic "Vista Previa"
  2. Hacer clic "Descargar"
  3. Hacer clic "Imprimir"

Resultado Esperado:
  ✓ Vista Previa: abre PDF en nueva pestaña
  ✓ Descargar: inicia descarga de archivo
  ✓ Imprimir: abre diálogo de impresión
  ✓ Cada acción independiente
```

### 2.6 Página: Landing (`/usuario/landing`)

#### TC-FE-021: Sección Trámites Activos
```
Precondiciones: Usuario con trámites activos
Pasos:
  1. Navegar a /usuario/landing
  2. Revisar sección "Tus Trámites Activos"
  3. Hacer clic para expandir

Resultado Esperado:
  ✓ Muestra hasta 3 últimos trámites
  ✓ Cada uno con: código, tipo, estado, fecha
  ✓ Sección colapsible funciona
  ✓ Botón "Ver Todos" redirige a historial
```

---

## 3. Casos de Prueba API

### 3.1 Autenticación

#### TC-API-001: Verificación de Sesión
```
Endpoint: GET /api/auth/verify
Autenticación: Cookie auth-token

Solicitud: GET /api/auth/verify

Respuestas Esperadas:

✓ Con sesión válida (status 200):
{
  "success": true,
  "user": {
    "id": "123",
    "email": "usuario@univalle.edu",
    "username": "usuario",
    "name": "Nombre Completo",
    "role": "estudiante",
    "permissions": []
  },
  "redirectTo": "/usuario/landing"
}

✗ Sin sesión (status 401):
{
  "success": false,
  "error": "No autenticado"
}
```

#### TC-API-002: Logout
```
Endpoint: POST /api/auth/logout
Autenticación: Cookie auth-token

Solicitud: POST /api/auth/logout

Resultado Esperado (status 200):
{
  "success": true,
  "message": "Sesión cerrada"
}

Post-condiciones:
  • Cookie auth-token eliminada
  • localStorage limpiado
```

### 3.2 Trámites

#### TC-API-003: Listado de Trámites
```
Endpoint: GET /api/tramites
Autenticación: No requerida

Solicitud: GET /api/tramites

Resultado Esperado (status 200):
[
  {
    "id": 1,
    "name": "Cambio de Sub Sede",
    "descripcion": "Cambiar de sub sede...",
    "costo": 15.00,
    "requisitos": "Carnet de identidad, solicitud..."
  },
  {
    "id": 2,
    "name": "Cambio de Plan de Estudios",
    "descripcion": "...",
    "costo": 25.00,
    "requisitos": "..."
  }
]

Validaciones:
  ✓ Mínimo 4 trámites
  ✓ Cada uno con: id, name, descripcion, costo, requisitos
  ✓ Costos con 2 decimales
  ✓ Sin duplicados
```

#### TC-API-004: Detalle de Trámite
```
Endpoint: GET /api/tramites/[codigo]
Autenticación: No requerida
Parámetro: codigo (ej: UV-2026-00001)

Solicitud: GET /api/tramites/UV-2026-00001

Resultado Esperado (status 200):
{
  "id_tramite": 1,
  "id_solicitud": 100,
  "nombre_tramite": "Cambio de Sub Sede",
  "estado": "Finalizado",
  "fechaCreacion": "2026-06-01T10:30:00Z",
  "codigoTramite": "UV-2026-00001",
  "costo": 15.00,
  "id_estado": 7
}

Errores:
  ✗ Código no existe (status 404):
    { "error": "Trámite no encontrado" }
```

### 3.3 Usuario

#### TC-API-005: Obtener Nombre Completo
```
Endpoint: GET /api/usuario/obtener-nombre-completo
Autenticación: Cookie auth-token requerida

Solicitud: GET /api/usuario/obtener-nombre-completo

Resultado Esperado (status 200):
{
  "nombreCompleto": "Juan Pérez García"
}

Errores:
  ✗ Sin autenticación (status 401):
    { "error": "No autenticado" }
  ✗ Usuario no en BD (status 404):
    { "error": "Usuario no encontrado" }
```

#### TC-API-006: Historial de Trámites
```
Endpoint: GET /api/usuario/historial
Autenticación: Cookie auth-token requerida

Solicitud: GET /api/usuario/historial

Resultado Esperado (status 200):
{
  "tramites": [
    {
      "id_tramite": 1,
      "codigo_tramite": "UV-2026-00001",
      "id_solicitud": 100,
      "tipo_tramite": "Cambio de Sub Sede",
      "nombre_estado": "Finalizado",
      "fecha_creacion": "2026-06-01T10:30:00Z",
      "correo": "usuario@univalle.edu",
      "nombre_completo": "Juan Pérez",
      "id_estado": 7
    }
  ]
}

Validaciones:
  ✓ Solo trámites del usuario autenticado
  ✓ Ordenado por fecha descendente
  ✓ Incluye todos los estados
```

#### TC-API-007: Trámites Activos
```
Endpoint: GET /api/usuario/tramites-activos
Autenticación: Cookie auth-token requerida

Solicitud: GET /api/usuario/tramites-activos

Resultado Esperado (status 200):
{
  "tramites": [
    {
      "id_tramite": 5,
      "codigo_tramite": "UV-2026-00005",
      "tipo_tramite": "Cambio de Plan",
      "nombre_estado": "En Revisión",
      "fecha_solicitud": "2026-06-02T15:00:00Z"
    }
  ]
}

Validaciones:
  ✓ Solo trámites activos (estados 1-6)
  ✓ Máximo 3 últimos
  ✓ O trámites finalizados no vistos
```

### 3.4 Procesar Solicitud

#### TC-API-008: Crear Solicitud
```
Endpoint: POST /api/usuario/procesar-solicitud
Autenticación: Cookie auth-token requerida
Método: POST

Body:
{
  "nombreCompleto": "Juan Pérez García",
  "carrera": "Ingeniería de Sistemas",
  "subSede": "Cochabamba",
  "tramites": [
    {
      "id": 1,
      "name": "Cambio de Sub Sede",
      "costo": 15.00,
      "descripcion": "...",
      "requisitos": "..."
    },
    {
      "id": 2,
      "name": "Cambio de Plan",
      "costo": 25.00,
      "descripcion": "...",
      "requisitos": "..."
    }
  ]
}

Resultado Esperado (status 201):
{
  "success": true,
  "id_solicitud": 100,
  "codigoSolicitud": "SOL-2026-100",
  "tramites": [
    {
      "id_tramite": 1,
      "codigo_tramite": "UV-2026-00001",
      "id_tipo": 1
    },
    {
      "id_tramite": 2,
      "codigo_tramite": "UV-2026-00002",
      "id_tipo": 2
    }
  ]
}

Validaciones:
  ✓ Códigos únicos generados
  ✓ Trámites creados en BD
  ✓ Usuario verificado en BD
  ✓ Carrera válida
  ✓ SubSede válida

Errores:
  ✗ Sin autenticación (401):
    { "error": "No autenticado" }
  ✗ Trámites vacío (400):
    { "error": "Datos incompletos" }
  ✗ Usuario no existe (404):
    { "error": "Usuario no encontrado" }
```

### 3.5 Documentos y Archivos

#### TC-API-009: Guardar Documento
```
Endpoint: POST /api/usuario/guardar-archivo
Autenticación: Cookie auth-token requerida
Content-Type: multipart/form-data

Body:
  - id_solicitud: 100
  - nombre_tramite: "Cambio de Sub Sede"
  - tipo_documento: "Carnet de identidad"
  - archivo: [PDF file]

Resultado Esperado (status 200):
{
  "success": true,
  "message": "Archivo guardado",
  "ruta_archivo": "/uploads/documentos_adjuntos/doc-100-timestamp.pdf"
}

Validaciones:
  ✓ Archivo guardado en /public/uploads/documentos_adjuntos/
  ✓ Nombre único con timestamp
  ✓ Solo propietario de solicitud puede guardar
  ✓ Tamaño máximo: 10MB

Errores:
  ✗ Archivo mayor a 10MB (413):
    { "error": "Archivo demasiado grande" }
  ✗ Tipo inválido (400):
    { "error": "Tipo de archivo no permitido" }
```

#### TC-API-010: Guardar Factura
```
Endpoint: POST /api/usuario/guardar-factura
Autenticación: Cookie auth-token requerida
Content-Type: application/json

Body:
{
  "id_solicitud": 100,
  "nit_ci": "123456789",
  "nombre": "Juan Pérez García"
}

Resultado Esperado (status 200):
{
  "success": true,
  "message": "Datos de factura guardados"
}

Validaciones:
  ✓ NIT/CI guardado (mín 5 caracteres)
  ✓ Nombre guardado en tabla facturas
  ✓ id_solicitud vinculado

Errores:
  ✗ NIT/CI vacío (400):
    { "error": "NIT/CI es requerido" }
  ✗ Solicitud no existe (404):
    { "error": "Solicitud no encontrada" }
```

#### TC-API-011: Guardar Comprobante
```
Endpoint: POST /api/usuario/guardar-comprobante
Autenticación: Cookie auth-token requerida
Content-Type: multipart/form-data

Body:
  - id_solicitud: 100
  - monto: 40.00
  - comprobante: [PDF/PNG file]

Resultado Esperado (status 200):
{
  "success": true,
  "message": "Comprobante guardado"
}

Validaciones:
  ✓ Comprobante guardado en /public/uploads/comprobantes/
  ✓ Monto registrado
  ✓ Estado solicitud actualizado a "Pagado" (opcional)

Errores:
  ✗ Tipo archivo inválido (400):
    { "error": "Solo se aceptan PDF, PNG o JPG" }
```

### 3.6 Descargas

#### TC-API-012: Descargar Factura
```
Endpoint: GET /api/usuario/descargar-documento-factura?id_solicitud=100
Autenticación: Cookie auth-token requerida
Método: GET

Solicitud: GET /api/usuario/descargar-documento-factura?id_solicitud=100

Resultado Esperado (status 200):
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="factura-100.pdf"
  [Binary PDF content]

Validaciones:
  ✓ Solo descargar si pertenece al usuario autenticado
  ✓ Archivo existe en disco
  ✓ Headers correctos para descarga
  ✓ Nombre archivo: factura-{id_solicitud}.pdf

Errores:
  ✗ Sin autenticación (401):
    { "error": "No autenticado" }
  ✗ Solicitud no existe o no pertenece (404):
    { "error": "Solicitud no encontrada o no autorizado" }
  ✗ Factura no disponible (404):
    { "error": "Factura no disponible aún" }
  ✗ Archivo no existe (404):
    { "error": "Archivo no encontrado en el servidor" }
```

#### TC-API-013: Descargar Certificado
```
Endpoint: GET /api/certificados/[codigo]
Autenticación: Cookie auth-token requerida
Parámetro: codigo (ej: UV-2026-00001)

Solicitud: GET /api/certificados/UV-2026-00001

Resultado Esperado (status 200):
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="certificado-UV-2026-00001.pdf"
  [Binary PDF content]

Validaciones:
  ✓ Solo para trámites en estado 7 (Finalizado)
  ✓ Usuario es propietario del trámite
  ✓ Certificado generado correctamente
  ✓ Contiene datos estudiante + trámite + firma

Errores:
  ✗ Trámite no finalizado (400):
    { "error": "Trámite aún no finalizado" }
  ✗ No pertenece al usuario (403):
    { "error": "No autorizado" }
```

### 3.7 Utilidades

#### TC-API-014: Marcar Trámite Como Visto
```
Endpoint: POST /api/usuario/marcar-tramite-visto
Autenticación: Cookie auth-token requerida
Content-Type: application/json

Body:
{
  "id_tramite": 1
}

Resultado Esperado (status 200):
{
  "success": true,
  "message": "Trámite marcado como visto",
  "tramite": {
    "id_tramite": 1,
    "visto_por_usuario": 1
  }
}

Validaciones:
  ✓ Flag visto_por_usuario actualizado a 1
  ✓ Solo propietario del trámite
```

---

## 4. Casos de Prueba Backend

### 4.1 Base de Datos - Integridad

#### TC-BD-001: Inserción de Solicitud
```
Tabla: solicitudes_tramite
Validación:
  ✓ id_solicitud auto-incremental
  ✓ id_estudiante FK válido
  ✓ codigo_solicitud único
  ✓ fecha_solicitud auto-timestamp
  ✓ estado inicial = "Pendiente" o similar

Caso de prueba:
  1. Crear usuario en BD
  2. Insertar solicitud mediante API
  3. Verificar registro en BD
  
Resultado esperado:
  ✓ Solicitud existe en BD
  ✓ Código único generado
  ✓ Timestamps correctos
```

#### TC-BD-002: Inserción de Trámites
```
Tabla: tramites
Validación:
  ✓ id_tramite auto-incremental
  ✓ id_solicitud FK válido
  ✓ id_tipo FK válido
  ✓ codigo_tramite único
  ✓ id_estado = 1 (inicial)
  ✓ fecha_creacion auto-timestamp

Caso de prueba:
  1. Crear solicitud
  2. Crear 2 trámites para esa solicitud
  3. Verificar registros
  
Resultado esperado:
  ✓ 2 trámites con misma solicitud
  ✓ Códigos únicos
  ✓ id_estado = 1
```

#### TC-BD-003: Inserción de Documentos
```
Tabla: documentos_adjuntos
Validación:
  ✓ id_documento auto-incremental
  ✓ id_solicitud FK válido
  ✓ ruta_archivo no nula
  ✓ tipo_documento válido
  ✓ fecha_carga auto-timestamp

Caso de prueba:
  1. Crear solicitud
  2. Subir documento mediante API
  3. Verificar en BD
  
Resultado esperado:
  ✓ Documento registrado
  ✓ Ruta correcta: /uploads/documentos_adjuntos/...
  ✓ Tipo documento guardado
```

#### TC-BD-004: Inserción de Factura
```
Tabla: facturas
Validación:
  ✓ id_factura auto-incremental
  ✓ id_solicitud FK válido
  ✓ nit_ci no nulo
  ✓ nombre_factura no nulo
  ✓ documento_factura nullable

Caso de prueba:
  1. Crear solicitud
  2. Guardar datos factura mediante API
  3. Verificar en BD
  
Resultado esperado:
  ✓ Factura creada
  ✓ NIT/CI guardado
  ✓ Nombre guardado
  ✓ documento_factura NULL inicialmente
```

### 4.2 Lógica de Negocio

#### TC-BE-001: Generación Única de Códigos
```
Validación:
  ✓ Cada solicitud → codigo_solicitud único
  ✓ Cada trámite → codigo_tramite único
  ✓ Formato: UV-AAAA-XXXXX
  
Caso de prueba:
  1. Crear 10 solicitudes
  2. Crear múltiples trámites por solicitud
  3. Verificar no hay duplicados
  
Resultado esperado:
  ✓ 100% códigos únicos
  ✓ Sin colisiones
  ✓ Formato consistente
```

#### TC-BE-002: Cálculo de Total
```
Validación:
  ✓ Total = Σ(costo_tramite)
  ✓ Precisión a 2 decimales
  
Caso de prueba:
  1. Crear solicitud con 3 trámites
  2. Costos: 15.00, 25.50, 10.50
  3. Calcular total esperado = 51.00
  4. Verificar campo total en BD
  
Resultado esperado:
  ✓ Total = 51.00
  ✓ Sin errores de redondeo
```

#### TC-BE-003: Validación de Carrera
```
Validación:
  ✓ Carrera debe existir en lista permitida
  ✓ Máximo 50 caracteres
  
Caso de prueba:
  1. Intentar crear solicitud con carrera válida
  2. Intentar con carrera inválida
  3. Intentar con string de 100 caracteres
  
Resultado esperado:
  ✓ Válida: aceptada
  ✗ Inválida: error 400
  ✗ > 50 caracteres: error 400
```

#### TC-BE-004: Validación de SubSede
```
Validación:
  ✓ SubSede ∈ {Cochabamba, La Paz, Santa Cruz, Sucre, Trinidad}
  
Caso de prueba:
  1. Crear solicitud con cada sub-sede válida
  2. Intentar con "Oruro" (inválida)
  
Resultado esperado:
  ✓ 5 válidas: aceptadas
  ✗ Inválida: error 400
```

### 4.3 Seguridad

#### TC-SEC-001: Autenticación Requerida
```
Endpoints a validar:
  - GET /api/usuario/historial
  - GET /api/usuario/obtener-nombre-completo
  - POST /api/usuario/procesar-solicitud
  - GET /api/usuario/descargar-documento-factura
  
Caso de prueba:
  1. Llamar cada endpoint sin cookie auth-token
  2. Llamar sin llevar autenticación válida
  3. Llamar con cookie expirada
  
Resultado esperado:
  ✗ Todos: status 401 "No autenticado"
```

#### TC-SEC-002: Autorización - Recursos del Usuario
```
Validación:
  ✓ Usuario A no puede ver solicitudes/facturas de Usuario B
  ✓ Usuario A no puede descargar documentos de Usuario B
  
Caso de prueba:
  1. Usuario A crea solicitud 100
  2. Usuario B intenta: GET /api/usuario/descargar-documento-factura?id_solicitud=100
  3. Usuario B intenta: GET /api/usuario/historial (debe ver solo suyo)
  
Resultado esperado:
  ✗ Descarga: status 404 "no autorizado"
  ✓ Historial: solo trámites de Usuario B
```

#### TC-SEC-003: SQL Injection en Búsqueda
```
Validación:
  ✓ Parámetros usando prepared statements
  
Caso de prueba:
  1. Búsqueda de trámite con: "' OR '1'='1"
  2. Búsqueda de usuario con: "; DROP TABLE usuarios; --"
  
Resultado esperado:
  ✓ Queries ejecutadas de forma segura
  ✗ Sin errores de SQL
  ✗ Sin pérdida de datos
```

#### TC-SEC-004: Inyección de Path en Descargas
```
Validación:
  ✓ No permitir descargar archivos arbitrarios
  
Caso de prueba:
  1. Intentar: /api/usuario/descargar-documento-factura?id_solicitud=../../../etc/passwd
  2. Intentar: /api/usuario/descargar-documento-factura?id_solicitud=100; cat /etc/shadow
  
Resultado esperado:
  ✗ Ambos: error 404 o 400
  ✓ No acceso a archivos del sistema
```

### 4.4 Manejo de Archivos

#### TC-FILE-001: Almacenamiento de Documentos
```
Validación:
  ✓ Archivos guardados en /public/uploads/documentos_adjuntos/
  ✓ Nombre único: {tipo}-{id_solicitud}-{timestamp}.{ext}
  ✓ Permisos correctos (readable)
  
Caso de prueba:
  1. Subir documento mediante API
  2. Verificar archivo existe en disco
  3. Intentar acceder vía URL directa
  
Resultado esperado:
  ✓ Archivo existe en ruta correcta
  ✓ Acceso directo: si tiene URL pública
  ✓ Permisos: legible
```

#### TC-FILE-002: Almacenamiento de Comprobantes
```
Validación:
  ✓ Archivos en /public/uploads/comprobantes/
  ✓ Nombre: comprobante-{id_solicitud}-{timestamp}.{ext}
  
Caso de prueba:
  1. Subir comprobante PDF
  2. Subir comprobante PNG
  3. Verificar existencia
  
Resultado esperado:
  ✓ Ambos guardados correctamente
  ✓ Extensión respetada
```

#### TC-FILE-003: Validación de Tipo de Archivo
```
Validación:
  ✓ Solo aceptar: PDF, PNG, JPG, JPEG
  ✓ Validar contenido (magic bytes), no solo extensión
  
Caso de prueba:
  1. Renombrar EXE como PDF y subir
  2. Subir PDF válido
  3. Subir GIF
  
Resultado esperado:
  ✗ EXE renombrado: error o rechazo
  ✓ PDF: aceptado
  ✗ GIF: error 400
```

### 4.5 Performance

#### TC-PERF-001: Tiempo de Respuesta
```
Validación:
  ✓ GET /api/tramites: < 500ms
  ✓ GET /api/usuario/historial: < 1s
  ✓ POST /api/usuario/procesar-solicitud: < 2s
  
Caso de prueba:
  1. Hacer 100 solicitudes a endpoint /api/tramites
  2. Medir tiempo promedio
  3. Medir p95 (95 percentilo)
  
Resultado esperado:
  ✓ Promedio < límite especificado
  ✓ p95 < límite × 1.5
```

#### TC-PERF-002: Escalabilidad con Datos
```
Validación:
  ✓ Con 1000 solicitudes, historial carga OK
  ✓ Sin N+1 queries
  
Caso de prueba:
  1. Crear usuario con 1000 solicitudes en BD
  2. GET /api/usuario/historial
  3. Revisar queries SQL ejecutadas (con query log)
  
Resultado esperado:
  ✓ Respuesta < 2 segundos
  ✓ Máximo 2-3 queries (sin bucles)
```

### 4.6 Concurrencia

#### TC-CONC-001: Creación Simultánea de Solicitudes
```
Validación:
  ✓ Sin race conditions en código único
  ✓ Sin dead locks
  
Caso de prueba:
  1. Usuario A y B crean solicitud simultáneamente (mismo segundo)
  2. Verificar códigos generados
  
Resultado esperado:
  ✓ Códigos diferentes (secuencia única)
  ✓ Ambas solicitudes creadas
  ✓ Sin errores de BD
```

---

## 5. Datos de Prueba

### 5.1 Usuarios de Prueba

```sql
-- Usuario Estudiante Base
INSERT INTO usuarios (nombre_completo, correo, ci, rol) 
VALUES ('Juan Pérez García', 'juan.perez@univalle.edu', '123456789', 'estudiante');

-- Usuario con Historial
INSERT INTO usuarios (nombre_completo, correo, ci, rol) 
VALUES ('María López', 'maria.lopez@univalle.edu', '987654321', 'estudiante');

-- Usuario de Prueba para Seguridad
INSERT INTO usuarios (nombre_completo, correo, ci, rol) 
VALUES ('Carlos Ataques', 'carlos.ataques@univalle.edu', '111111111', 'estudiante');
```

### 5.2 Trámites

```sql
-- Trámites disponibles en BD
INSERT INTO tipos_tramite (nombre_tramite, descripcion, costo, requisitos)
VALUES 
  ('Cambio de Sub Sede', 'Cambiar de subsede...', 15.00, 'Carnet, solicitud'),
  ('Cambio de Plan de Estudios', 'Cambiar de plan...', 25.00, 'Carnet, solicitud, solvencia'),
  ('Expedición de Certificado', 'Obtener certificado académico', 10.50, 'Solicitud'),
  ('Cambio de Carrera', 'Cambiar de carrera...', 30.00, 'Carnet, solicitud, documentación');
```

### 5.3 Datos de Prueba del Formulario

```
Carreras válidas:
  - Medicina
  - Ingeniería de Sistemas
  - Administración de Empresas
  - Derecho
  - (...)

Sub-Sedes válidas:
  - Cochabamba
  - La Paz
  - Santa Cruz
  - Sucre
  - Trinidad

Documentos por tipo de trámite:
  Tipo 1 (Cambio Sub Sede):
    - Carta de solicitud
    - Fotocopia carnet
    - Hoja de solvencia
  Tipo 2 (Cambio Plan):
    - Carta de solicitud
    - Fotocopia carnet
    - Hoja de solvencia
```

### 5.4 Archivos de Prueba

```
Documentos válidos:
  - documento-test.pdf (200KB)
  - imagen-test.png (150KB)
  - comprobante-test.jpg (300KB)

Archivos inválidos:
  - malware.exe (renombrado como .pdf)
  - script.sh
  - documento.doc (Word antiguo)

Archivos límite:
  - grande-10MB.pdf (exactamente 10MB)
  - muy-grande-15MB.pdf (>10MB)
```

---

## 🎯 Resumen de Cobertura

| Área | Total TC | Críticos | Cobertura |
|------|----------|----------|-----------|
| Frontend | 21 | 12 | ~100% rutas y botones |
| API | 14 | 10 | ~100% endpoints usuario |
| Backend | 21 | 8 | ~80% lógica y seguridad |
| **Total** | **56** | **30** | **~90%** |

---

## 📌 Prioridades de Ejecución

### Fase 1: Crítica (Must Have)
- TC-FE-001, 005, 008, 012
- TC-API-001, 003, 006, 008, 012
- TC-BD-001, 002
- TC-SEC-001, 002

### Fase 2: Alta (Should Have)
- TC-FE-002, 013, 014
- TC-API-009, 010
- TC-BD-003, 004
- TC-BE-001

### Fase 3: Media (Nice to Have)
- TC-FE-021
- TC-API-014
- TC-PERF-001

---

**Documento generado para QA del módulo Usuario**  
**Próximo paso:** Ejecución de pruebas según prioridades
