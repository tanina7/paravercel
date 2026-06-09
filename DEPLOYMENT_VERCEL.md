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

## 📋 Paso 1: Repositorio Git (YA COMPLETADO ✅)

✅ Tu código ya está en GitHub
✅ Rama a deployar: `feature/facturas-fix` 
✅ Cambios incluyen: Docker, QA docs, variables de entorno configurables

---

## 🎯 Paso 2: Configurar Vercel

### 2.1 Crear cuenta Vercel
1. Ve a https://vercel.com
2. Click "Sign Up"
3. "Continue with GitHub"
4. Autoriza Vercel a acceder a tus repos

### 2.2 Crear proyecto
1. Dashboard → "Add New..." → "Project"
2. Busca `PR2-26-APP-Tramites-UV-B--C-`
3. Click en "Import"
4. **IMPORTANTE:** En "Configure Project"
   - Framework Preset: `Next.js`
   - Root Directory: `.` (raíz)
5. Click en "Deploy" (fallará, es normal)

---

## 🔐 Paso 3: Configurar variables de entorno

### 3.1 En el dashboard de Vercel
1. Project Settings → Environment Variables
2. Agregar cada variable (todas obligatorias):

```
DB_HOST = mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com
DB_PORT = 11597
DB_NAME = tramites_univalle
DB_USER = avnadmin
DB_PASSWORD = [CAMBIAR A CONTRASEÑA NUEVA EN AIVEN]
JWT_SECRET = [generar valor seguro - ver paso 3.2]
NODE_ENV = production
NEXT_PUBLIC_API_URL = https://tu-proyecto.vercel.app
```

### ⚠️ 3.2 SEGURIDAD CRÍTICA
**Tu contraseña anterior fue expuesta. CAMBIAR INMEDIATAMENTE:**
1. Ve a https://aiven.io
2. Entra a tu instancia MySQL
3. Settings → Users → Change Password
4. Guarda la nueva contraseña
5. Úsala en `DB_PASSWORD`

### 3.3 Generar JWT_SECRET seguro
En PowerShell ejecuta:
```powershell
$bytes = 1..32 | ForEach-Object { [byte](Get-Random -Maximum 256) }
[Convert]::ToBase64String($bytes)
```
Copia el resultado y úsalo en `JWT_SECRET`

### 3.4 NEXT_PUBLIC_API_URL
Después del primer deploy, Vercel te asignará URL como:
- `https://pr2-26-app-tramites-uv-b-c.vercel.app`
- Usa esa URL aquí

---

## 🔄 Paso 4: Configurar rama de deployment

### 4.1 En Project Settings
1. Settings → Git Configuration
2. **Production Branch**: Cambiar a `feature/facturas-fix`
3. Click "Save"

Ahora Vercel hará deploy automático desde `feature/facturas-fix` (no desde main)

---

## ✅ Paso 5: Trigger deploy

### 5.1 Forzar deployment
Hay dos formas:

**Opción A: Desde dashboard (rápido)**
1. Dashboard → Deployments → últimas build fallidas
2. Click en "Redeploy"
3. Esperar 2-3 minutos

**Opción B: Via Git (automático)**
```bash
git push origin feature/facturas-fix
# Vercel automáticamente detecta y deploya
```

### 5.2 Verificar que funcionó
- Logs: Dashboard → Deployments → últimas → "Logs"
- Debe decir "Build successful"
- URL: `https://tu-proyecto.vercel.app`

---

## 🔄 Actualizaciones automáticas

Ahora cada vez que hagas `git push` a `feature/facturas-fix`:

```bash
# Hacer cambios en código
git add .
git commit -m "Descripción del cambio"
git push origin feature/facturas-fix

# Vercel automáticamente:
# 1. Detecta el push en feature/facturas-fix
# 2. Construye la app
# 3. Deploya en 2-3 minutos
# 4. Tu sitio se actualiza automáticamente
```

---

## 📝 Pruebas después del deployment

### Verificar que todo funciona:
1. Accede a tu URL de Vercel
2. Login con credenciales de prueba
3. Listar trámites
4. Crear una solicitud
5. Cargar documentos
6. Ver historial

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
