# Integración del Sistema de Autenticación - PR2-26-APP-Tramites-UV-B--C-

## Resumen de Cambios

Se ha integrado exitosamente el sistema de autenticación del proyecto **PR2-26-APP-Tramites-UV-A** en el proyecto **PR2-26-APP-Tramites-UV-B--C-**. El nuevo sistema incluye:

### ✅ Cambios Realizados

1. **Actualización de Dependencias**
   - Agregadas las librerías `bcryptjs` y `jose` al `package.json`
   - Estas son necesarias para el manejo de contraseñas y sesiones JWT

2. **Carpeta de Autenticación (`app/auth/`)**
   - **`login/`**: Formulario de login moderno y responsivo
   - **`register/`**: Formulario de registro con validaciones
   - Ambos integrados con estilos del proyecto B (colores marón #800000)

3. **APIs de Autenticación (`app/api/auth/`)**
   - **`login/route.ts`**: Valida credenciales y crea sesión JWT
   - **`register/route.ts`**: Registra nuevos usuarios con validaciones completas
   - **`logout/route.ts`**: Cierra la sesión del usuario
   - **`verify/route.ts`**: Verifica el estado actual de la sesión

4. **Librerías de Autenticación (`lib/auth/`)**
   - **`session.ts`**: Manejo de tokens JWT y cookies
   - **`permissions.ts`**: Sistema de permisos y roles

5. **Base de Datos**
   - El nuevo sistema usa la tabla `users` existente en la base de datos
   - Campos esperados: `user_id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `cedula`, `phone`, `rol`, `is_active`
   - Nota: Si tu tabla tiene nombres diferentes, se necesitarán ajustes en las rutas API

6. **Middleware (`middleware.ts`)**
   - Protege las rutas que requieren autenticación
   - Redirige automáticamente a `/auth/login` si no hay sesión
   - Rutas protegidas: `/usuario/landing`, `/bibliotecario`, `/tramites`, `/carrito`

7. **Página Principal**
   - `app/page.tsx` ahora redirige a `/auth/login`

## 🚀 Cómo Usar

### Flujo de Usuario Nuevo
1. El usuario accede al sitio → Se redirige a `/auth/login`
2. Si no tiene cuenta, hace clic en "Regístrate aquí"
3. Completa el formulario de registro con:
   - Nombre y Apellido
   - Cédula de identidad
   - Correo electrónico
   - Teléfono (opcional)
   - Contraseña (mínimo 6 caracteres)
4. El usuario es registrado en la base de datos y redirigido a login
5. Inicia sesión con sus credenciales

### Flujo de Usuario Existente
1. Accede a `/auth/login`
2. Ingresa su correo y contraseña
3. Si es válido, se redirige según su rol:
   - **Estudiante** → `/usuario/landing`
   - **Biblioteca** → `/bibliotecario`
   - **Director Carrera/Operador** → `/tramites`
   - **Caja** → `/carrito`

## 🔒 Características de Seguridad

- ✅ Contraseñas encriptadas con bcryptjs
- ✅ Sesiones con JWT y cookies seguras
- ✅ Validaciones en cliente y servidor
- ✅ Middleware de protección de rutas
- ✅ Migraciones automáticas de contraseñas legacy a bcryptjs en primer login

## ⚙️ Configuración Necesaria

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Verificar la Base de Datos
Asegúrate de que la tabla `users` tiene la siguiente estructura:
```sql
CREATE TABLE users (
  user_id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  cedula VARCHAR(20) UNIQUE,
  phone VARCHAR(20),
  rol VARCHAR(50),
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Nota**: Si tu tabla tiene nombre o estructura diferentes, necesitarás editar las rutas API en:
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`

### 3. Variables de Entorno
Asegúrate de que las variables de entorno estén configuradas en `.env.local`:
```
AUTH_SECRET=tu-secreto-seguro-aqui
```

Si no está definida, usará un valor por defecto de desarrollo.

## 📝 Cambios Realizados a Archivos Existentes

- **`package.json`**: Agregadas dependencias `bcryptjs` y `jose`
- **`lib/db.js`**: Modificado para usar `getPool()` asincrónico
- **`app/page.tsx`**: Reemplazado con redirección a login
- **Nuevo**: `middleware.ts` para proteger rutas

## ⚠️ Notas Importantes

1. **NO se modificó ninguna otra parte del proyecto** - Todas las rutas existentes como `/usuario/landing`, `/bibliotecario`, `/tramites` siguen funcionando igual

2. **La tabla de usuarios** - El sistema espera una tabla `users` en la base de datos con ciertos campos. Si tu tabla es diferente, se necesitarán ajustes.

3. **Rutas API antiguas** - Si existían rutas API de login antiguas en `/api/login` o similares, pueden coexistir. Las nuevas rutas están en `/api/auth/*`

4. **Cookies de Sesión** - La sesión se maneja mediante JWT en una cookie llamada `auth-token`

## 🧪 Pruebas Recomendadas

1. Ir a `/auth/register` y crear una nueva cuenta
2. Ir a `/auth/login` e iniciar sesión con esa cuenta
3. Acceder a las rutas protegidas y verificar que funcionan
4. Cerrar sesión y verificar que se redirige a login

## 📧 Soporte

Si encuentras problemas:
- Verifica que la tabla `users` existe y tiene la estructura correcta
- Revisa los logs del servidor en la consola
- Comprueba que las dependencias están instaladas: `npm install`

---

**Proyecto**: PR2-26-APP-Tramites-UV-B--C-  
**Fecha de Integración**: Abril 2026  
**Versión del Sistema de Auth**: 1.0
