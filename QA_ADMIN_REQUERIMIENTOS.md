# REQUERIMIENTOS DE PRUEBA - MÓDULO ADMIN
## Sistema de Gestión de Trámites Universitarios - Universidad del Valle

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Módulo:** Admin/Administrador  
**Estado:** Activo

---

## 1. INTRODUCCIÓN

### 1.1 Propósito
Este documento define los requerimientos funcionales, requisitos de prueba y casos de prueba para el módulo Admin del Sistema de Gestión de Trámites Universitarios. El módulo Admin es responsable de la gestión global del sistema, incluyendo usuarios, trámites, configuración, reportes y auditoría.

### 1.2 Alcance
- Gestión de usuarios (crear, editar, eliminar, cambiar roles)
- Gestión de trámites (crear, editar, activar/desactivar, eliminar)
- Gestión de estados y flujos
- Configuración del sistema (variables, parámetros)
- Reportes globales y análisis
- Auditoría y registro de actividades
- Gestión de roles y permisos
- Backup y restauración
- Monitoreo de sistema

### 1.3 Módulos Relacionados
- **Todos los módulos:** Admin supervisa y configura
- **Base de Datos:** Integridad y backups
- **Sistema:** Logs y auditoría

---

## 2. REQUERIMIENTOS FUNCIONALES

### REQ-ADM-001: Gestión de Usuarios - Listar
**Descripción:** Admin puede ver lista de todos los usuarios del sistema  
**Actores:** Admin  
**Precondiciones:** Admin autenticado, hay usuarios en BD  
**Pasos:**
1. Acceder a "Gestión de Usuarios"
2. Ver listado de usuarios
3. Filtrar por rol, estado, búsqueda

**Resultado Esperado:**
- Tabla muestra: ID, Correo, Nombre, Carrera (si aplica), Rol, Estado, Acciones
- Paginación si hay >10 usuarios
- Búsqueda funciona
- Filtros disponibles (Estudiante, Cajero, Bibliotecario, Admin)

**Criterios de Aceptación:**
- ✅ Todos los usuarios se cargan
- ✅ Información es precisa
- ✅ Búsqueda rápida (<300ms)

---

### REQ-ADM-002: Gestión de Usuarios - Crear
**Descripción:** Admin puede crear un nuevo usuario manualmente  
**Actores:** Admin  
**Precondiciones:** Formulario disponible  
**Pasos:**
1. Hacer clic en "Nuevo Usuario"
2. Completar formulario: correo, nombre, rol, carrera (si aplica)
3. Guardar usuario

**Resultado Esperado:**
- Usuario creado en BD
- Correo de bienvenida enviado
- Usuario puede login con contraseña temporal
- Estado: Activo por defecto

**Criterios de Aceptación:**
- ✅ Validación de correo único
- ✅ Contraseña temporal generada
- ✅ Notificación enviada

---

### REQ-ADM-003: Gestión de Usuarios - Editar
**Descripción:** Admin puede editar datos de usuario  
**Actores:** Admin  
**Precondiciones:** Usuario seleccionado  
**Pasos:**
1. Buscar usuario
2. Hacer clic en "Editar"
3. Modificar campos (nombre, carrera, rol)
4. Guardar

**Resultado Esperado:**
- Cambios guardados en BD
- Historial de cambios registrado
- Usuario es notificado si rol cambia

**Criterios de Aceptación:**
- ✅ Validaciones funcionan
- ✅ Cambios son inmediatos
- ✅ Historial se actualiza

---

### REQ-ADM-004: Gestión de Usuarios - Cambiar Rol
**Descripción:** Admin puede cambiar el rol de un usuario  
**Actores:** Admin  
**Precondiciones:** Usuario seleccionado  
**Pasos:**
1. Abrir detalles de usuario
2. Cambiar rol en dropdown
3. Confirmar cambio

**Resultado Esperado:**
- Rol cambia inmediatamente
- Usuario recibe notificación
- Acceso a módulos se actualiza
- Historial registra cambio

**Criterios de Aceptación:**
- ✅ Cambio es inmediato
- ✅ Notificación enviada
- ✅ Acceso re-evaluado

---

### REQ-ADM-005: Gestión de Usuarios - Desactivar/Activar
**Descripción:** Admin puede desactivar o activar un usuario  
**Actores:** Admin  
**Precondiciones:** Usuario seleccionado  
**Pasos:**
1. Abrir usuario
2. Hacer clic en "Desactivar" o "Activar"
3. Confirmar

**Resultado Esperado:**
- Estado cambia (Activo ↔ Inactivo)
- Usuario inactivo no puede login
- Historiales se mantienen
- Sesión activa se cierra si desactiva

**Criterios de Aceptación:**
- ✅ Estado se refleja inmediatamente
- ✅ Acceso denegado si inactivo
- ✅ Datos históricos se preservan

---

### REQ-ADM-006: Gestión de Usuarios - Resetear Contraseña
**Descripción:** Admin puede resetear contraseña de usuario  
**Actores:** Admin  
**Precondiciones:** Usuario seleccionado  
**Pasos:**
1. Hacer clic en "Resetear Contraseña"
2. Confirmar acción
3. Nueva contraseña temporal se genera

**Resultado Esperado:**
- Contraseña se resetea
- Usuario recibe correo con nueva contraseña temporal
- Usuario debe cambiar en primer login
- Historial de reseteos se registra

**Criterios de Aceptación:**
- ✅ Contraseña se cambia en BD
- ✅ Correo enviado
- ✅ Usuario puede login con temporal

---

### REQ-ADM-007: Gestión de Trámites - Listar
**Descripción:** Admin puede ver todos los trámites disponibles  
**Actores:** Admin  
**Precondiciones:** Hay trámites en BD  
**Pasos:**
1. Navegar a "Gestión de Trámites"
2. Ver tabla de trámites
3. Filtrar por estado (Activo/Inactivo)

**Resultado Esperado:**
- Tabla muestra: ID, Nombre, Descripción, Costo, Estado, Requisitos, Acciones
- Paginación si hay >10
- Búsqueda por nombre

**Criterios de Aceptación:**
- ✅ Todos los trámites se cargan
- ✅ Información es precisa
- ✅ Estados son correctos

---

### REQ-ADM-008: Gestión de Trámites - Crear
**Descripción:** Admin puede crear un nuevo tipo de trámite  
**Actores:** Admin  
**Precondiciones:** Formulario disponible  
**Pasos:**
1. Hacer clic en "Nuevo Trámite"
2. Completar: nombre, descripción, costo, requisitos, tiempo de procesamiento
3. Guardar

**Resultado Esperado:**
- Trámite creado en BD
- ID asignado automáticamente
- Estado: Activo por defecto
- Disponible inmediatamente en módulo usuario

**Criterios de Aceptación:**
- ✅ Validaciones funcionan (costo >0, nombre único)
- ✅ BD se actualiza
- ✅ Visible en listados

---

### REQ-ADM-009: Gestión de Trámites - Editar
**Descripción:** Admin puede editar detalles de un trámite  
**Actores:** Admin  
**Precondiciones:** Trámite seleccionado  
**Pasos:**
1. Abrir trámite
2. Modificar campos (excepto ID)
3. Guardar

**Resultado Esperado:**
- Cambios guardados
- Cambios se aplican a solicitudes futuras
- Solicitudes pasadas no se afectan
- Historial registra cambios

**Criterios de Aceptación:**
- ✅ Cambios inmediatos
- ✅ No afecta histórico
- ✅ Validaciones funcionan

---

### REQ-ADM-010: Gestión de Trámites - Activar/Desactivar
**Descripción:** Admin puede activar o desactivar un trámite  
**Actores:** Admin  
**Precondiciones:** Trámite seleccionado  
**Pasos:**
1. Abrir trámite
2. Hacer clic en "Desactivar" o "Activar"
3. Confirmar

**Resultado Esperado:**
- Estado cambia
- Trámite inactivo no aparece en selección usuario
- Solicitudes pendientes no se afectan
- Puede reactivar después

**Criterios de Aceptación:**
- ✅ Estado se cambia
- ✅ Oculto en UI usuario si inactivo
- ✅ BD refleja cambio

---

### REQ-ADM-011: Gestión de Configuración
**Descripción:** Admin puede ver y modificar configuración del sistema  
**Actores:** Admin  
**Precondiciones:** Página de configuración accesible  
**Pasos:**
1. Navegar a "Configuración"
2. Ver parámetros del sistema
3. Modificar si es necesario
4. Guardar

**Parámetros Configurables:**
- Nombre de la universidad
- Email de soporte
- Teléfono de contacto
- Dirección
- Logo/Banner
- Tiempo máximo de sesión
- Límite de reintentos de login
- Formatos de documentos permitidos

**Resultado Esperado:**
- Configuración se guarda
- Cambios se aplican inmediatamente
- Historial de cambios registrado

**Criterios de Aceptación:**
- ✅ Validaciones por tipo de campo
- ✅ Cambios inmediatos
- ✅ Auditoría registrada

---

### REQ-ADM-012: Gestión de Estados y Flujos
**Descripción:** Admin puede configurar los estados y transiciones de solicitudes  
**Actores:** Admin  
**Precondiciones:** Página de flujos accesible  
**Pasos:**
1. Navegar a "Flujos de Solicitud"
2. Ver diagrama de estados
3. Configurar transiciones permitidas
4. Guardar

**Estados Manejables:**
- Recibido
- Verificando
- En Revisión
- Pago Pendiente
- Pagado
- Finalizado
- Rechazado

**Resultado Esperado:**
- Flujos se configuran
- Sistema respeta transiciones
- Estados no permitidos se bloquean
- Documentación de flujo disponible

**Criterios de Aceptación:**
- ✅ Transiciones se validan
- ✅ Cambios se aplican
- ✅ Flujo es lógico

---

### REQ-ADM-013: Reportes Globales
**Descripción:** Admin puede generar reportes de todo el sistema  
**Actores:** Admin  
**Precondiciones:** Hay datos en BD  
**Pasos:**
1. Navegar a "Reportes"
2. Seleccionar tipo de reporte
3. Seleccionar rango de fechas
4. Generar reporte
5. Ver/descargar

**Tipos de Reportes:**
- **Resumen Ejecutivo:** Métrica general del sistema
- **Solicitudes por Estado:** Distribución de estados
- **Ingresos por Periodo:** Dinero recaudado
- **Usuarios Activos:** Estadísticas de usuarios
- **Trámites Populares:** Ranking de trámites más solicitados
- **Performance:** Tiempos de procesamiento
- **Errores y Excepciones:** Bugs/problemas registrados

**Resultado Esperado:**
- Reporte generado en tabla
- Exportable a PDF/Excel
- Gráficos disponibles
- Datos precisos

**Criterios de Aceptación:**
- ✅ Números son correctos
- ✅ Exportación funciona
- ✅ Gráficos son legibles

---

### REQ-ADM-014: Auditoría y Registros
**Descripción:** Admin puede ver el historial de todas las actividades del sistema  
**Actores:** Admin  
**Precondiciones:** Hay actividades registradas  
**Pasos:**
1. Navegar a "Auditoría"
2. Ver log de actividades
3. Filtrar por usuario, acción, fecha
4. Detalles de cada evento

**Información Registrada:**
- Fecha y hora
- Usuario que realizó acción
- Tipo de acción (Create, Update, Delete, Login, etc.)
- Tabla afectada
- Datos antiguos vs nuevos
- Resultado (Éxito/Error)

**Resultado Esperado:**
- Log es completo
- Información es detallada
- Búsqueda funciona
- Información es inmutable

**Criterios de Aceptación:**
- ✅ Todos los cambios registrados
- ✅ Búsqueda rápida
- ✅ Datos no editables

---

### REQ-ADM-015: Gestión de Roles y Permisos
**Descripción:** Admin puede configurar roles y sus permisos  
**Actores:** Admin  
**Precondiciones:** Sistema roles existe  
**Pasos:**
1. Navegar a "Roles y Permisos"
2. Ver roles existentes (Estudiante, Cajero, Bibliotecario, Admin)
3. Ver permisos de cada rol
4. Modificar permisos (avanzado)

**Roles Base:**
- Estudiante: Ver trámites, solicitar, ver historial
- Cajero: Ver pagos, marcar pagado, generar facturas
- Bibliotecario: Revisar documentos, aprobar, generar certificados
- Admin: Acceso total

**Resultado Esperado:**
- Permisos se configuran
- Sistema respeta permisos
- Cambios se aplican a usuarios activos
- Documentación disponible

**Criterios de Aceptación:**
- ✅ Permisos se guardan
- ✅ Sistema respeta
- ✅ Cambios inmediatos

---

### REQ-ADM-016: Backup y Restauración
**Descripción:** Admin puede realizar backups y restauraciones  
**Actores:** Admin  
**Precondiciones:** Acceso a función de backup  
**Pasos:**
1. Navegar a "Backup"
2. Hacer clic en "Crear Backup"
3. Sistema realiza backup completo
4. Opción de descargar

**Backup Incluye:**
- Base de datos completa
- Archivos de usuario (documentos, facturas, certificados)
- Configuración
- Logs

**Resultado Esperado:**
- Backup se crea exitosamente
- Archivo comprimido (.zip)
- Timestamp en nombre
- Descarga disponible
- Histórico de backups visible

**Criterios de Aceptación:**
- ✅ Backup contiene todo
- ✅ Tamaño es razonable
- ✅ Se puede descargar

---

### REQ-ADM-017: Monitoreo de Sistema
**Descripción:** Admin puede ver estado del sistema (salud, performance, errores)  
**Actores:** Admin  
**Precondiciones:** Dashboard disponible  
**Pasos:**
1. Navegar a "Monitoreo"
2. Ver métricas en tiempo real

**Métricas Monitoreadas:**
- Disponibilidad (% uptime)
- Tiempo de respuesta API (promedio, máximo)
- Uso de BD (conexiones activas, queries lentas)
- Uso de memoria/CPU
- Errores últimas 24h
- Usuarios conectados
- Solicitudes por segundo

**Resultado Esperado:**
- Dashboard muestra métricas
- Alertas si algo está mal
- Gráficos históricos disponibles
- Refresh automático (cada 30s)

**Criterios de Aceptación:**
- ✅ Métricas son precisas
- ✅ Refresh funciona
- ✅ Alertas útiles

---

### REQ-ADM-018: Gestión de Carreras y Sub-Sedes
**Descripción:** Admin puede gestionar carreras y sub-sedes disponibles  
**Actores:** Admin  
**Precondiciones:** Datos existen en BD  
**Pasos:**
1. Navegar a "Datos Maestros"
2. Ver/editar Carreras y Sub-Sedes
3. Agregar nuevos valores
4. Activar/desactivar

**Datos Manejables:**
- **Carreras:** Ingeniería Sistemas, Derecho, Administración, etc.
- **Sub-Sedes:** Sede Principal, Sede Occidente, etc.

**Resultado Esperado:**
- Datos se actualizan
- Disponibles en dropdowns usuario
- Cambios se aplican
- Inactivos no aparecen

**Criterios de Aceptación:**
- ✅ CRUD completo funciona
- ✅ Validaciones funcionan
- ✅ UI se actualiza

---

### REQ-ADM-019: Gestión de Tipos de Archivo
**Descripción:** Admin puede configurar tipos de archivos permitidos  
**Actores:** Admin  
**Precondiciones:** Configuración accesible  
**Pasos:**
1. Navegar a "Tipos de Archivo"
2. Ver extensiones permitidas por tipo
3. Modificar si es necesario
4. Guardar

**Tipos de Archivo:**
- Documentos: PDF, JPG, PNG, DOC, DOCX
- Facturas: PDF, JPG, PNG
- Certificados: PDF

**Resultado Esperado:**
- Extensiones se configuran
- Sistema rechaza otros tipos
- Cambios inmediatos
- Validación en upload

**Criterios de Aceptación:**
- ✅ Upload respeta configuración
- ✅ Validación es clara
- ✅ Seguridad mantenida

---

### REQ-ADM-020: Notificaciones del Sistema
**Objetivo:** Admin recibe alertas de eventos importantes
**Actores:** Admin
**Precondiciones:** Sistema tiene alertas configuradas

**Eventos a Notificar:**
- Error crítico en sistema
- DB offline/lenta
- Storage casi lleno
- Múltiples fallos de login
- Cambios en configuración por otro admin
- Backup fallido

**Resultado Esperado:**
- Notificaciones en tiempo real
- Email si es crítico
- Dashboard panel de alertas

**Criterios de Aceptación:**
- ✅ Alertas son útiles
- ✅ No es spam
- ✅ Accionables

---

## 3. CASOS DE PRUEBA FRONTEND

### TC-FE-001: Acceso al Módulo Admin
**Objetivo:** Verificar que solo Admin puede acceder  
**Precondiciones:** Usuario autenticado con rol Admin

**Pasos:**
1. Navegar a /admin
2. Verificar acceso

**Resultado Esperado:**
- Página carga correctamente
- Dashboard visible
- Menú de opciones disponible

**Validaciones:**
- ✅ Página sin errores
- ✅ Acceso inmediato

---

### TC-FE-002: Denegación de Acceso - Rol No Admin
**Objetivo:** Verificar que otros roles NO acceden  
**Precondiciones:** Usuario NO es Admin

**Pasos:**
1. Intentar navegar a /admin
2. Observar resultado

**Resultado Esperado:**
- Error 403 O redirección

---

### TC-FE-003: Listado de Usuarios
**Objetivo:** Verificar que usuarios se muestran  
**Precondiciones:** Hay usuarios en BD

**Pasos:**
1. Navegar a "Gestión de Usuarios"
2. Ver tabla

**Resultado Esperado:**
- Tabla muestra usuarios
- Información precisa
- Paginación funciona

**Validaciones:**
- ✅ Todos los usuarios visibles
- ✅ Información correcta

---

### TC-FE-004: Búsqueda de Usuarios
**Objetivo:** Verificar búsqueda funciona  
**Precondiciones:** Hay usuarios

**Pasos:**
1. Ingresar correo en búsqueda
2. Presionar Enter
3. Ver resultados

**Resultado Esperado:**
- Tabla se filtra
- Búsqueda parcial funciona
- Rápido (<300ms)

---

### TC-FE-005: Crear Nuevo Usuario
**Objetivo:** Verificar formulario de creación  
**Precondiciones:** En gestión de usuarios

**Pasos:**
1. Hacer clic en "Nuevo Usuario"
2. Completar formulario
3. Guardar

**Resultado Esperado:**
- Formulario abre en modal
- Validaciones funcionan
- Después de guardar, confirmación y usuario aparece en lista

**Validaciones:**
- ✅ Correo único validado
- ✅ Campos obligatorios
- ✅ Feedback visual

---

### TC-FE-006: Editar Usuario
**Objetivo:** Verificar edición de usuario  
**Precondiciones:** Usuario seleccionado

**Pasos:**
1. Hacer clic en "Editar"
2. Cambiar datos
3. Guardar

**Resultado Esperado:**
- Modal abre con datos pre-llenados
- Cambios se guardan
- Confirmación mostrada

---

### TC-FE-007: Cambiar Rol Usuario
**Objetivo:** Verificar cambio de rol  
**Precondiciones:** Usuario abierto

**Pasos:**
1. Cambiar rol en dropdown
2. Guardar

**Resultado Esperado:**
- Rol cambia inmediatamente
- Notificación de cambio
- Acceso se actualiza

---

### TC-FE-008: Desactivar Usuario
**Objetivo:** Verificar desactivación  
**Precondiciones:** Usuario activo

**Pasos:**
1. Hacer clic en "Desactivar"
2. Confirmar

**Resultado Esperado:**
- Estado cambia a "Inactivo"
- Confirmación mostrada
- Usuario no puede login

---

### TC-FE-009: Resetear Contraseña
**Objetivo:** Verificar reset de contraseña  
**Precondiciones:** Usuario seleccionado

**Pasos:**
1. Hacer clic en "Resetear Contraseña"
2. Confirmar

**Resultado Esperado:**
- Contraseña se genera
- Confirmación mostrada
- Usuario recibe correo

---

### TC-FE-010: Listado de Trámites
**Objetivo:** Verificar que trámites se muestran  
**Precondiciones:** Hay trámites

**Pasos:**
1. Navegar a "Gestión de Trámites"
2. Ver tabla

**Resultado Esperado:**
- Tabla completa de trámites
- Información precisa
- Filtros disponibles

---

### TC-FE-011: Crear Trámite
**Objetivo:** Verificar creación de trámite  
**Precondiciones:** En gestión de trámites

**Pasos:**
1. Hacer clic en "Nuevo Trámite"
2. Completar formulario
3. Guardar

**Resultado Esperado:**
- Modal abre
- Validaciones funcionan
- Trámite aparece en lista

---

### TC-FE-012: Editar Trámite
**Objetivo:** Verificar edición  
**Precondiciones:** Trámite seleccionado

**Pasos:**
1. Hacer clic en "Editar"
2. Cambiar datos
3. Guardar

**Resultado Esperado:**
- Cambios se guardan
- Confirmación mostrada

---

### TC-FE-013: Activar/Desactivar Trámite
**Objetivo:** Verificar cambio de estado  
**Precondiciones:** Trámite abierto

**Pasos:**
1. Hacer clic en "Desactivar"
2. Confirmar

**Resultado Esperado:**
- Estado cambia
- Confirmación
- No aparece en módulo usuario si inactivo

---

### TC-FE-014: Configuración - Editar Parámetros
**Objetivo:** Verificar edición de config  
**Precondiciones:** En configuración

**Pasos:**
1. Cambiar parámetro (ej: email)
2. Guardar

**Resultado Esperado:**
- Cambio se guarda
- Validación funciona
- Confirmación mostrada

---

### TC-FE-015: Reportes - Generar
**Objetivo:** Verificar generación de reporte  
**Precondiciones:** En reportes

**Pasos:**
1. Seleccionar tipo de reporte
2. Seleccionar fechas
3. Hacer clic "Generar"

**Resultado Esperado:**
- Tabla de reporte aparece
- Datos correctos
- Botones de descarga disponibles

---

### TC-FE-016: Reportes - Descargar Excel
**Objetivo:** Verificar descarga de reporte  
**Precondiciones:** Reporte generado

**Pasos:**
1. Hacer clic en "Descargar Excel"
2. Esperar

**Resultado Esperado:**
- Archivo .xlsx descarga
- Excel válido
- Datos correctos

---

### TC-FE-017: Auditoría - Ver Logs
**Objetivo:** Verificar visualización de logs  
**Precondiciones:** En auditoría

**Pasos:**
1. Ver tabla de logs
2. Filtrar por usuario/acción
3. Ver detalles

**Resultado Esperado:**
- Logs se muestran
- Información completa
- Filtros funcionan

---

### TC-FE-018: Monitoreo - Dashboard
**Objetivo:** Verificar dashboard de monitoreo  
**Precondiciones:** En monitoreo

**Pasos:**
1. Ver métricas
2. Observar gráficos
3. Esperar refresh

**Resultado Esperado:**
- Métricas se muestran
- Gráficos visibles
- Refresh automático

---

### TC-FE-019: Backup - Crear
**Objetivo:** Verificar creación de backup  
**Precondiciones:** En backup

**Pasos:**
1. Hacer clic en "Crear Backup"
2. Esperar

**Resultado Esperado:**
- Progreso se muestra
- Confirmación de éxito
- Descarga disponible

---

### TC-FE-020: Datos Maestros - Carreras
**Objetivo:** Verificar gestión de carreras  
**Precondiciones:** En datos maestros

**Pasos:**
1. Ver lista de carreras
2. Agregar nueva carrera
3. Guardar

**Resultado Esperado:**
- CRUD funciona
- Validaciones ok
- Cambios inmediatos

---

### TC-FE-021: Responsive Design Mobile
**Objetivo:** Verificar UI en mobile  
**Precondiciones:** Browser 375px

**Pasos:**
1. Acceder a /admin en mobile
2. Navegar módulos
3. Usar funciones

**Resultado Esperado:**
- Responsive layout
- Funcionalidad completa
- Legibilidad mantenida

---

## 4. CASOS DE PRUEBA API

### TC-API-001: GET /api/admin/usuarios
**Objetivo:** Obtener lista de usuarios  
**Método:** GET  
**Endpoint:** /api/admin/usuarios?page=1&limit=10&rol=Estudiante

**Precondiciones:** Admin autenticado

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "correo": "estudiante@univalle.edu.co",
      "nombre": "Juan Pérez",
      "rol": "Estudiante",
      "estado": "Activo",
      "carrera": "Ingeniería Sistemas"
    }
  ],
  "total": 50,
  "page": 1
}
```

**Validaciones:**
- ✅ Paginación funciona
- ✅ Filtro por rol funciona
- ✅ Datos correctos

---

### TC-API-002: POST /api/admin/usuarios
**Objetivo:** Crear usuario  
**Método:** POST  

**Request:**
```json
{
  "correo": "nuevouser@univalle.edu.co",
  "nombre": "Nuevo Usuario",
  "rol": "Estudiante",
  "carrera": "Administración"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 51,
    "correo": "nuevouser@univalle.edu.co",
    "contraseña_temporal": "TEMP123456",
    "mensaje": "Usuario creado. Correo enviado."
  }
}
```

**Validaciones:**
- ✅ Correo único
- ✅ Usuario en BD
- ✅ Correo enviado

---

### TC-API-003: PUT /api/admin/usuarios/{id}
**Objetivo:** Editar usuario  
**Método:** PUT  

**Request:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "carrera": "Derecho"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez Actualizado"
  }
}
```

---

### TC-API-004: PATCH /api/admin/usuarios/{id}/rol
**Objetivo:** Cambiar rol  
**Método:** PATCH  

**Request:**
```json
{
  "rol": "Cajero"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rol": "Cajero"
  }
}
```

---

### TC-API-005: PATCH /api/admin/usuarios/{id}/estado
**Objetivo:** Desactivar/activar usuario  
**Método:** PATCH  

**Request:**
```json
{
  "estado": "Inactivo"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "estado": "Inactivo"
  }
}
```

---

### TC-API-006: POST /api/admin/usuarios/{id}/resetear-contraseña
**Objetivo:** Resetear contraseña  
**Método:** POST  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "message": "Contraseña reseteada. Correo enviado."
}
```

---

### TC-API-007: GET /api/admin/tramites
**Objetivo:** Obtener trámites  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Certificado de Matrícula",
      "costo": 15000,
      "estado": "Activo",
      "requisitos": "..."
    }
  ]
}
```

---

### TC-API-008: POST /api/admin/tramites
**Objetivo:** Crear trámite  
**Método:** POST  

**Request:**
```json
{
  "nombre": "Nuevo Trámite",
  "costo": 25000,
  "requisitos": "Cédula"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 10,
    "nombre": "Nuevo Trámite"
  }
}
```

---

### TC-API-009: PUT /api/admin/tramites/{id}
**Objetivo:** Editar trámite  
**Método:** PUT  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### TC-API-010: PATCH /api/admin/tramites/{id}/estado
**Objetivo:** Activar/desactivar trámite  
**Método:** PATCH  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "estado": "Inactivo"
  }
}
```

---

### TC-API-011: GET /api/admin/configuracion
**Objetivo:** Obtener configuración  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "nombre_universidad": "Universidad del Valle",
    "email_soporte": "soporte@univalle.edu.co",
    "telefono": "+57..."
  }
}
```

---

### TC-API-012: PUT /api/admin/configuracion
**Objetivo:** Actualizar configuración  
**Método:** PUT  

**Request:**
```json
{
  "nombre_universidad": "Nuevo Nombre"
}
```

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {...}
}
```

---

### TC-API-013: GET /api/admin/reportes
**Objetivo:** Generar reporte  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": {
    "total_usuarios": 150,
    "total_solicitudes": 500,
    "ingresos_totales": 7500000
  }
}
```

---

### TC-API-014: GET /api/admin/auditoria
**Objetivo:** Obtener logs de auditoría  
**Método:** GET  

**Resultado Esperado (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "usuario": "admin@univalle.edu.co",
      "accion": "UPDATE",
      "tabla": "usuarios",
      "fecha": "2026-06-03T10:30:00Z"
    }
  ]
}
```

---

## 5. CASOS DE PRUEBA BACKEND

### TC-BD-001: Integridad de Datos - Usuarios
**Objetivo:** Verificar constraints en tabla usuarios  
**Validaciones:**
- ✅ Correo NOT NULL, UNIQUE
- ✅ Nombre NOT NULL
- ✅ Rol NOT NULL
- ✅ Estado NOT NULL (default 'Activo')

---

### TC-BD-002: Integridad de Datos - Trámites
**Objetivo:** Verificar constraints en tabla trámites  
**Validaciones:**
- ✅ Nombre NOT NULL, UNIQUE
- ✅ Costo NOT NULL, > 0
- ✅ Estado NOT NULL

---

### TC-BD-003: Cascada en Auditoría
**Objetivo:** Verificar que auditoría registra cambios  
**Proceso:**
1. Cambiar usuario
2. Consultar tabla auditoria

**Validaciones:**
- ✅ Cambio está registrado
- ✅ Datos antiguos y nuevos presentes
- ✅ Timestamp exacto

---

### TC-BD-004: Índices de Performance
**Objetivo:** Verificar índices existen  
**Queries:**
```sql
SHOW INDEXES FROM usuarios;
-- Verificar: correo (UNIQUE), rol, estado
```

---

### TC-BD-005: Constraints de Integridad Referencial
**Objetivo:** Verificar relaciones entre tablas  
**Validaciones:**
- ✅ Usuario no puede tener rol inexistente
- ✅ Solicitud referencia tramite válido
- ✅ Cascadas funcionan correctamente

---

### TC-BD-006: Transacción - Crear Usuario + Auditoría
**Objetivo:** Verificar atomicidad  
**Proceso:**
1. Crear usuario y fallar auditoría
2. Verificar rollback

**Validaciones:**
- ✅ Usuario no creado si auditoría falla
- ✅ BD en estado consistente

---

### TC-BD-007: Backup - Completitud
**Objetivo:** Verificar que backup incluye todo  
**Validaciones:**
- ✅ Tabla usuarios completa
- ✅ Tabla solicitudes completa
- ✅ Archivos incluidos
- ✅ Configuración incluida

---

### TC-BD-008: Encriptación - Contraseñas
**Objetivo:** Verificar que contraseñas están hasheadas  
**Query:**
```sql
SELECT contraseña FROM usuarios WHERE id = 1;
```

**Validaciones:**
- ✅ Contraseña es hash (bcrypt)
- ✅ No es plain text
- ✅ Hash es válido

---

### TC-BD-009: Auditoría - Inmutabilidad
**Objetivo:** Verificar que logs no se pueden editar  
**Proceso:**
1. Intentar UPDATE en tabla auditoria
2. Observar resultado

**Validaciones:**
- ✅ UPDATE rechazado (view o permisos)
- ✅ Datos históricos preservados

---

### TC-BD-010: Estados Válidos - Enum
**Objetivo:** Verificar que solo estados válidos se permiten  
**Process:**
1. Intentar insertar estado inválido
2. Observar error

**Validaciones:**
- ✅ CHECK constraint
- ✅ Estados válidos: Activo, Inactivo

---

### TC-BD-011: Configuración - Unicidad
**Objetivo:** Verificar que solo 1 registro de configuración  
**Query:**
```sql
SELECT COUNT(*) FROM configuracion;
-- Debe retornar 1
```

---

### TC-BD-012: Performance - Query Lentitud
**Objetivo:** Verificar que queries son rápidas  
**Queries:**
```sql
SELECT * FROM usuarios WHERE estado = 'Activo'; -- <100ms
SELECT * FROM solicitudes WHERE fecha BETWEEN ... -- <300ms
```

---

## 6. CASOS DE PRUEBA DE SEGURIDAD

### TC-SEC-001: Autenticación - Solo Admin Accede
**Objetivo:** Verificar que solo Admin accede a /admin  
**Validaciones:**
- ✅ Sin token: Error 401
- ✅ Token inválido: Error 401
- ✅ Token válido pero rol != Admin: Error 403

---

### TC-SEC-002: Inyección SQL - Usuario
**Objetivo:** Verificar prevención de inyección  
**Payload:** `' OR '1'='1`

**Validaciones:**
- ✅ Query parametrizada
- ✅ Sin inyección exitosa

---

### TC-SEC-003: XSS - Nombre Usuario
**Objetivo:** Verificar sanitización  
**Payload:** `<script>alert('xss')</script>`

**Validaciones:**
- ✅ Script se escapa
- ✅ BD guarda como string
- ✅ UI no ejecuta

---

### TC-SEC-004: Autorización - Cambiar Rol Propio
**Objetivo:** Verificar que Admin no puede cambiar su propio rol  
**Validaciones:**
- ✅ Error o prevención
- ✅ Siempre Admin

---

### TC-SEC-005: CSRF - Formularios
**Objetivo:** Verificar token CSRF en formularios  
**Validaciones:**
- ✅ Token presente en form
- ✅ Validación en servidor

---

### TC-SEC-006: File Upload - Backup
**Objetivo:** Verificar validación de archivo  
**Validaciones:**
- ✅ Solo .zip permitidos
- ✅ Validación en servidor
- ✅ Sin ejecución

---

### TC-SEC-007: Rate Limiting - Auditoría
**Objetivo:** Verificar que auditoría no se puede flood  
**Validaciones:**
- ✅ Límite de queries
- ✅ Throttle si excede

---

### TC-SEC-008: Logs - PII
**Objetivo:** Verificar que PII no se loga  
**Validaciones:**
- ✅ Contraseñas no en logs
- ✅ Números de tarjeta no logged
- ✅ Solo IDs y referencias

---

## 7. DATOS DE PRUEBA

### Usuarios Admin de Prueba
```sql
INSERT INTO usuarios (correo, nombre, rol, estado) VALUES
('admin@univalle.edu.co', 'Admin Principal', 'Admin', 'Activo'),
('admin2@univalle.edu.co', 'Admin Secundario', 'Admin', 'Activo');
```

### Trámites de Prueba
```sql
INSERT INTO tramites (nombre, costo, estado, requisitos) VALUES
('Certificado de Matrícula', 15000, 'Activo', 'Cédula'),
('Constancia de Inscripción', 10000, 'Activo', 'Cédula'),
('Diploma', 50000, 'Inactivo', 'Cédula');
```

---

## 8. PRIORIDADES

### Crítico
- TC-API-001: Listar usuarios
- TC-API-007: Listar trámites
- TC-SEC-001: Autenticación
- TC-BD-001: Integridad datos

### Alto
- TC-API-002: Crear usuario
- TC-API-008: Crear trámite
- TC-FE-005: Crear usuario UI
- TC-FE-011: Crear trámite UI

### Medio
- TC-FE-014: Configuración
- TC-FE-017: Auditoría
- TC-API-013: Reportes
- TC-FE-018: Monitoreo

---

## 9. MÉTRICAS DE PRUEBA

| Métrica | Meta |
|---------|------|
| **Total Casos** | 55 |
| **Frontend** | 21 |
| **API** | 14 |
| **Backend** | 12 |
| **Seguridad** | 8 |
| **Tasa Éxito** | ≥95% |
| **Cobertura** | ≥85% |

---

## 10. NOTAS IMPORTANTES

1. **Permisos:** Todos los endpoints requieren rol Admin
2. **Auditoría:** Todos los cambios se deben registrar
3. **BD de Prueba:** Usar ambiente staging
4. **Backups:** Verificar completitud
5. **Performance:** APIs deben responder <500ms
6. **Seguridad:** Validar todas las entradas
7. **Notificaciones:** Usuarios deben ser notificados de cambios importantes

---

**Documento Preparado Por:** QA Team  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Activo
