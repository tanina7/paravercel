# 📋 Página de Consulta de Estado de Trámites - COMPLETA ✅

Hemos creado una página completa que permite a los estudiantes consultar el estado de su trámite ingresando el código de seguimiento.

## 🎯 Flujo de Usuario

1. **Landing Page** (`/usuario/landing`)
   - Estudiante ingresa el código de trámite en el campo "Consulta el Estado de tu Trámite"
   - Presiona "Consultar Estado"
   - Es redirigido a la nueva página de consulta

2. **Nueva Página de Consulta** (`/usuario/consulta-tramite?codigo=TRM-xxxx`)
   - Se muestra el estado actual del trámite
   - Línea de progreso con los 8 estados posibles
   - Información detallada (costo, fecha, ID, etc.)
   - Botones para consultar otro trámite o solicitar uno nuevo

## 📝 Archivos Creados/Modificados

### ✅ Creados:
- **`/app/usuario/consulta-tramite/page.tsx`** (280 líneas)
  - Componente React completo con state management
  - Fetch a API con manejo de errores
  - UI con estados de carga y error
  
- **`migration-add-codigo-tramite.sql`**
  - Script SQL para agregar la columna de código a la tabla

### ✅ Modificados:
- **`/app/usuario/landing/page.tsx`**
  - Cambio: ahora redirige a consulta-tramite en lugar de mostrar resultado inline
  - Agregado `useRouter` de next/navigation
  - Simplificado el flujo de búsqueda
  
- **`/app/api/tramites/[codigo]/route.ts`**
  - Mejora: ahora hace JOINs para obtener información completa
  - Retorna datos con nombres de estado y tipo de trámite legibles
  - Mejor manejo de errores con detalles

- **`/app/api/usuario/procesar-solicitud/route.ts`**
  - Ahora guarda el código_tramite en la BD al crear un trámite
  - Facilitará búsquedas futuras

## ⚠️ PASO CRÍTICO: Migración de Base de Datos

**ANTES de permitir que los usuarios consulten trámites, debes ejecutar:**

```sql
ALTER TABLE tramites 
ADD COLUMN codigo_tramite VARCHAR(100) UNIQUE DEFAULT NULL AFTER id_tramite;
```

### Cómo Ejecutar la Migración

#### **Opción 1: Usando MySQL CLI (Recomendado)**
```bash
mysql -h mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com -P 11597 -u avnadmin -p tramites_univalle < migration-add-codigo-tramite.sql
```
Se te pedirá ingresar la contraseña: `AVNS_iKeVgvVdaPJAQcw2XtV`

#### **Opción 2: Usando MySQL Workbench**
1. Abre MySQL Workbench
2. Conecta a: `mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com:11597`
3. Usuario: `avnadmin`, Contraseña: `AVNS_iKeVgvVdaPJAQcw2XtV`
4. Selecciona base de datos: `tramites_univalle`
5. Abre el archivo `migration-add-codigo-tramite.sql`
6. Ejecuta: Cmd/Ctrl + Enter

#### **Opción 3: Usando DataGrip, TablePlus, o similar**
1. Crea conexión a la BD
2. Copia el contenido de `migration-add-codigo-tramite.sql`
3. Ejecuta contra la BD `tramites_univalle`

### ✅ Verificar que la Migración fue Exitosa

```sql
DESCRIBE tramites;
```
Deberías ver `codigo_tramite` en la lista de columnas.

## 🎨 Estados Disponibles (Con Iconos)

| ID | Estado | Icono | Color |
|-----|--------|-------|-------|
| 1 | Recibido | 📋 | Azul |
| 2 | Verificando Solvencia | ⏳ | Amarillo |
| 3 | Revisión Técnica | 🔍 | Púrpura |
| 4 | Pago Pendiente | 💳 | Naranja |
| 5 | Pagado | ✓ | Verde |
| 6 | Listo para Impresión | 📄 | Índigo |
| 7 | Finalizado | 🎉 | Esmeralda |
| 8 | Rechazado | ❌ | Rojo |

## 🧪 Prueba Manual

Una vez que ejecutes la migración de BD:

1. **Genera un código de trámite** (haciendo un trámite completo)
   - Deberías verlo en la página de confirmación
   - Ejemplo: `TRM-1712345678-ABC123XYZ`

2. **Ve a** `http://localhost:3000/usuario/landing`

3. **Ingresa el código** en el campo "Consulta el Estado de tu Trámite"

4. **Presiona "Consultar Estado"**

5. **Resultado esperado:**
   - Redirigido a `/usuario/consulta-tramite?codigo=TRM-1712345678-ABC123XYZ`
   - Muestra cantidad completa de estado y progreso
   - Puedes copiar el código con un botón
   - Opción para consultar otro trámite o crear uno nuevo

## 📊 Estructura de Respuesta API

El API en `/api/tramites/[codigo]` retorna:

```json
{
  "id_tramite": 15,
  "id_solicitud": 2,
  "codigoTramite": "TRM-1712345678-ABC123XYZ",
  "nombre_tramite": "Certificado de Calificaciones",
  "estado": "Recibido",
  "id_estado": 1,
  "fechaCreacion": "2026-04-06T10:30:45.000Z",
  "costo": 150000
}
```

## ❌ Posibles Errores y Soluciones

### Error: "Trámite no encontrado"
- **Causa**: El código no existe o no está en la BD
- **Solución**: Verifica que el código sea exacto (case-sensitive)

### Error de Base de Datos en Console
- **Causa**: La columna `codigo_tramite` no existe aún
- **Solución**: Ejecuta la migración SQL

### Campo Vacio en Consulta
- **Causa**: Falta información en los JOINs
- **Solución**: Verifica que `tipos_tramite` y `estados_tramite` tengan datos

## 🚀 Próximas Funcionalidades (Opcionales)

- Email automático con código después del pago
- Dashboard del bibliotecario para actualizar estados
- Historial detallado de cambios de estado
- Descargar PDF con detalles del trámite
- Sistema de notificaciones de cambios de estado

## 📞 Soporte

Si encuentras errores:
1. Verifica que la migración se ejecutó correctamente
2. Revisa la consola del servidor para mensajes de error
3. Prueba con un código conocido de un trámite que completaste

---

**Estado**: ✅ COMPLETO Y LISTO PARA USAR
**Última actualización**: 2026-04-06
