# 🚀 DEPLOYMENT RÁPIDO - Vercel en 5 minutos

## ✅ Tu código ya está listo

- ✅ GitHub: Actualizado
- ✅ Rama: `feature/facturas-fix`
- ✅ MySQL: En Aiven (ya configurado)
- ✅ Variables de entorno: Listas para configurar

---

## 5 PASOS SIMPLES

### 1️⃣ Vercel Sign Up (2 min)
```
https://vercel.com → Sign Up → Continue with GitHub
```

### 2️⃣ Importar Proyecto (1 min)
```
Dashboard → Add Project → PR2-26-APP-Tramites-UV-B--C-
```

### 3️⃣ Configurar Variables (1 min)
Project Settings → Environment Variables:
```
DB_HOST = mysql-tramitesunivalle-tramitesunivalle7.b.aivencloud.com
DB_PORT = 11597
DB_NAME = tramites_univalle
DB_USER = avnadmin
DB_PASSWORD = TU_CONTRASEÑA_AIVEN  ← CAMBIAR EN AIVEN PRIMERO
JWT_SECRET = [generar en PowerShell - ver DEPLOYMENT_VERCEL.md]
NODE_ENV = production
```

### 4️⃣ Rama de Deploy (1 min)
Settings → Git Configuration:
```
Production Branch → feature/facturas-fix
```

### 5️⃣ Deploy (2-3 min)
Dashboard → Deployments → Redeploy

---

## ✅ ¡LISTO!

Tu app estará en:
```
https://pr2-26-app-tramites-uv-b-c.vercel.app
```

---

## 📖 Más detalles

Ver: `DEPLOYMENT_VERCEL.md` para:
- Seguridad (cambiar contraseña)
- Troubleshooting
- Actualizaciones automáticas
