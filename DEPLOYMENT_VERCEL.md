# 🚀 Despliegue en Vercel - Guía Completa

## ¿Por qué Vercel?
- ✅ **Gratuito** - Sin costo para Next.js
- ✅ **Automático** - Deploy desde GitHub (git push = deploy)
- ✅ **Rápido** - Optimizado para Next.js
- ✅ **Seguro** - Certificado SSL gratis
- ✅ **MySQL Compatible** - Funciona con Aiven

---

## ⚠️ SEGURIDAD - CAMBIAR CONTRASEÑA INMEDIATAMENTE

**Tu contraseña de MySQL fue expuesta en el repositorio:**
```
AVNS_iKeVgvVdaPJAQcw2XtV
```

### Paso urgente: Cambiar contraseña en Aiven
1. Ve a https://aiven.io
2. Dashboard → MySQL instance
3. Settings → Users → Change password
4. Guardar nueva contraseña

---

## 📋 Paso 1: Preparar repositorio Git

### 1.1 Inicializar Git (si no lo has hecho)
```bash
cd "C:\Users\TANI\Documents\Proyect2\app-tramites\PR2-26-APP-Tramites-UV-B--C-"

git init
git add .
git commit -m "Initial commit - Sistema de Gestión de Trámites Universitarios"
git branch -M main
```

### 1.2 Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `app-tramites-uv` (o similar)
3. Click "Create repository"
4. **NO inicialices con README** (porque ya lo tienes)

### 1.3 Conectar con GitHub
```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/app-tramites-uv.git
git push -u origin main
```

---

## 🎯 Paso 2: Configurar en Vercel

### 2.1 Crear cuenta Vercel
1. Ve a https://vercel.com
2. Click "Sign Up"
3. "Continue with GitHub"
4. Autoriza Vercel a acceder a tus repos

### 2.2 Crear proyecto
1. Dashboard → "Add New..." → "Project"
2. Busca `app-tramites-uv`
3. Click en "Import"
4. Click "Deploy" (por ahora, sin configuración)

### 2.3 Esperar a que falle (es normal)
El deploy fallará porque falta la contraseña de MySQL. Eso es bueno - significa que está intentando conectar.

Ver los logs:
- Dashboard → Recent Deployments → Click en el deployment
- Ver logs (verás error de DB_PASSWORD)

---

## 🔐 Paso 3: Configurar variables de entorno

### 3.1 En el dashboard de Vercel
1. Project Settings → Environment Variables
2. Agregar cada variable:

```
DB_HOST = mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com
DB_PORT = 11597
DB_NAME = tramites_univalle
DB_USER = avnadmin
DB_PASSWORD = TU_NUEVA_CONTRASEÑA_AIVEN
JWT_SECRET = generarUnValorSeguroAquiUsandoOpenSSL
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://tu-proyecto.vercel.app
```

### 3.2 Generar JWT_SECRET seguro
```bash
# En PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }))

# Copiar el valor y usarlo como JWT_SECRET
```

### 3.3 Guardar variables
Click en "Save"

---

## 🔄 Paso 4: Redeploy

1. Dashboard → Deployments
2. Click en el último deployment fallido
3. Click "Redeploy"
4. Esperar 2-3 minutos

### Verificar que funcionó:
- Logs deben mostrar "Build successful"
- Se asignará URL: `https://app-tramites-uv.vercel.app`

---

## ✅ Paso 5: Probar la aplicación

1. Abre tu URL en navegador
2. Intenta hacer login
3. Verifica que pueda:
   - Conectar a MySQL en Aiven
   - Listar trámites
   - Crear solicitudes

---

## 🔄 Actualizaciones automáticas

Ahora cada vez que hagas `git push`:

```bash
# Hacer cambios en código
git add .
git commit -m "Descripción del cambio"
git push origin main

# Vercel automáticamente:
# 1. Detecta el push
# 2. Construye la app
# 3. Deploya en 2 minutos
# 4. Te muestra la URL
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module mysql2"
**Solución:** Asegurar que está en `package.json` devDependencies
```bash
npm install mysql2
git add package.json package-lock.json
git push
```

### Error: "DB connection refused"
- Verificar que MySQL en Aiven sigue activo
- Verificar credenciales en Environment Variables
- Ver logs: Project → Deployments → Logs

### Error: "SSL certificate issues"
Verificar que el Dockerfile tenga:
```javascript
ssl: {
  rejectUnauthorized: false
}
```

### Error: Build timeout
Si tarda >15 minutos:
- Puede ser problema de dependencias
- Ejecutar `npm install` localmente y verificar que no hay errores

---

## 📊 Monitoreo en Vercel

### Ver logs en tiempo real
```bash
# Instalar Vercel CLI
npm i -g vercel

# Ver logs
vercel logs --follow
```

### Analytics
Dashboard → Analytics (ver:
- Page views
- Response times
- Errors

---

## 💰 Costos

| Concepto | Costo |
|----------|-------|
| **Vercel** | $0 (Free tier) |
| **MySQL Aiven** | Ya pagado/gratuito |
| **Total mensual** | **$0** |

---

## 🎓 Próximos pasos

1. ✅ Desplegar en Vercel
2. ⏳ Configurar dominio personalizado (opcional)
3. ⏳ Configurar monitoreo y alertas
4. ⏳ Configurar backups automáticos en Aiven

---

## 📞 Soporte

- **Vercel Help:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Aiven MySQL:** https://docs.aiven.io/docs/en/products/mysql

---

**¡Tu aplicación estará en línea en 10 minutos! 🎉**
